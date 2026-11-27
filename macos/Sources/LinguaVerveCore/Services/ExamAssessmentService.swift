import Foundation

/// Comprehensive 4-skill AI Exam Assessment engine supporting On-Device Apple Intelligence,
/// Local (Ollama, LM Studio), and Cloud (OpenAI, Gemini, OpenRouter, Custom) AI providers,
/// with deterministic smart diagnostic fallback when offline.
public struct ExamAssessmentService: Sendable {
    private let aiClient: AIClientService

    public init(aiClient: AIClientService = AIClientService()) {
        self.aiClient = aiClient
    }

    public func assessFullExam(
        config: AIProviderConfig,
        exam: MockExam?,
        attempt: ExamAttemptRecord,
        writingEvals: [AIEvaluationResult] = [],
        speakingEval: AIEvaluationResult? = nil
    ) async -> ExamAIAssessment {
        let config = config.resolved(for: attempt.languageId)
        var resolvedWritingEvals = writingEvals
        var resolvedSpeakingEval = speakingEval

        // Retroactive analysis support: when analyzing a past attempt from History without live evals,
        // evaluate saved writing & speaking submissions via the configured AI provider too.
        if config.isReady {
            let writingText = (attempt.writingSubmission ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            let speakingText = (attempt.speakingTranscript ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            let writingTasks = exam?.writing.resolvedTasks ?? []
            let speakingParts = exam?.speaking.resolvedParts ?? []

            if resolvedWritingEvals.isEmpty && !writingText.isEmpty && writingText != "(blank)" {
                let prompt = writingTasks.isEmpty
                    ? "\(attempt.examTitle) (\(attempt.level.rawValue)) Writing section"
                    : writingTasks.enumerated().map { "Task \($0.offset + 1): \($0.element.scenario)" }.joined(separator: "\n")
                let ev = await aiClient.evaluateWithAIOrFallback(
                    config: config,
                    text: writingText,
                    languageId: attempt.languageId,
                    level: attempt.level,
                    skill: .writing,
                    taskPrompt: prompt,
                    minWords: max(60, writingTasks.reduce(0) { $0 + $1.minWords }),
                    expectedKeywords: writingTasks.flatMap(\.keyRubricKeywords)
                )
                resolvedWritingEvals = [ev]
            }

            if resolvedSpeakingEval == nil && !speakingText.isEmpty && speakingText != "(no response)" {
                let prompt = speakingParts.isEmpty
                    ? "\(attempt.examTitle) (\(attempt.level.rawValue)) Speaking section"
                    : speakingParts.enumerated().map { "Part \($0.offset + 1): \($0.element.instruction)" }.joined(separator: "\n")
                let ev = await aiClient.evaluateWithAIOrFallback(
                    config: config,
                    text: speakingText,
                    languageId: attempt.languageId,
                    level: attempt.level,
                    skill: .speaking,
                    taskPrompt: prompt,
                    minWords: 45,
                    expectedKeywords: speakingParts.flatMap(\.keyRubricKeywords)
                )
                resolvedSpeakingEval = ev
            }
        }

        let base = Self.buildOfflineAssessment(
            exam: exam,
            attempt: attempt,
            writingEvals: resolvedWritingEvals,
            speakingEval: resolvedSpeakingEval
        )

        guard config.isReady else {
            return base
        }

        let lang = LearningLanguage.from(attempt.languageId)
        let langName = lang.name
        let examBoard = lang.examBoard

        let systemPrompt = """
        You are a senior certified \(examBoard) Chief Examiner analyzing a candidate's full 4-skill \(langName) \(attempt.level.rawValue) simulated exam.
        Provide concrete, encouraging, evidence-based diagnostics grounded ONLY in the candidate's actual submitted results below.
        Return ONLY valid JSON (no markdown fences) matching this schema:
        {
          "overallSummary": "2-3 sentences diagnosing overall 4-skill readiness and main bottleneck",
          "readinessVerdict": "short verdict badge e.g. Ready for Official \(attempt.level.rawValue) or Needs Listening & Writing Polish",
          "reading": {
            "cefrEstimate": "\(attempt.level.rawValue)",
            "summary": "2 sentences analyzing reading accuracy and error patterns",
            "strengths": ["strength 1"],
            "weaknesses": ["specific pattern from missed items"],
            "corrections": [{"sectionTag": "Reading P1", "original": "what candidate chose/misread", "corrected": "correct answer/evidence", "explanation": "why correct answer wins"}],
            "suggestions": ["targeted reading drill"]
          },
          "listening": {
            "cefrEstimate": "\(attempt.level.rawValue)",
            "summary": "2 sentences analyzing listening comprehension, accents and hearing traps",
            "strengths": ["strength 1"],
            "weaknesses": ["specific accent or distractor trap missed"],
            "corrections": [{"sectionTag": "Listening T1", "original": "what candidate chose", "corrected": "correct spoken detail", "explanation": "spoken cue or trap explained"}],
            "suggestions": ["targeted listening/shadowing tip"]
          },
          "writing": {
            "summary": "2 sentences synthesizing writing task achievement, grammar and register",
            "strengths": ["strength 1"],
            "weaknesses": ["recurring grammar or structure pattern"],
            "corrections": [{"sectionTag": "Writing", "original": "phrase from candidate", "corrected": "natural corrected phrase", "explanation": "rule"}],
            "suggestions": ["targeted writing drill"]
          },
          "speaking": {
            "summary": "2 sentences synthesizing oral fluency, structure and lexis",
            "strengths": ["strength 1"],
            "weaknesses": ["key oral gap"],
            "corrections": [{"sectionTag": "Speaking", "original": "phrase from transcript", "corrected": "more natural spoken phrase", "explanation": "why better"}],
            "suggestions": ["targeted speaking drill"]
          },
          "studyPlan": [
            {"priority": 1, "skill": "reading|listening|writing|speaking", "title": "short focus title", "action": "concrete exercise tailored to this attempt", "targetMinutes": 20}
          ]
        }
        """

        let userContext = Self.buildCompactDiagnosticContext(exam: exam, attempt: attempt, base: base)

        do {
            let raw = try await aiClient.chat(
                config: config,
                messages: [
                    AIChatMessage(role: "system", content: systemPrompt),
                    AIChatMessage(role: "user", content: userContext)
                ]
            )

            guard let start = raw.firstIndex(of: "{"),
                  let end = raw.lastIndex(of: "}"),
                  start <= end,
                  let data = String(raw[start...end]).data(using: .utf8) else {
                return base
            }

            struct PartialCorrection: Decodable {
                let original: String?
                let corrected: String?
                let explanation: String?
                let sectionTag: String?
            }
            struct PartialSkill: Decodable {
                let cefrEstimate: String?
                let summary: String?
                let strengths: [String]?
                let weaknesses: [String]?
                let corrections: [PartialCorrection]?
                let suggestions: [String]?
            }
            struct PartialPlan: Decodable {
                let priority: Int?
                let skill: String?
                let title: String?
                let action: String?
                let targetMinutes: Int?
            }
            struct PartialResponse: Decodable {
                let overallSummary: String?
                let readinessVerdict: String?
                let reading: PartialSkill?
                let listening: PartialSkill?
                let writing: PartialSkill?
                let speaking: PartialSkill?
                let studyPlan: [PartialPlan]?
            }

            guard let parsed = try? JSONDecoder().decode(PartialResponse.self, from: data) else {
                return base
            }

            func cleanStrings(_ arr: [String]?, limit: Int) -> [String] {
                Array((arr ?? []).map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }.prefix(limit))
            }

            func cleanCorrections(_ arr: [PartialCorrection]?, limit: Int) -> [ExamCorrectionItem] {
                Array((arr ?? []).compactMap { item -> ExamCorrectionItem? in
                    let orig = (item.original ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                    let corr = (item.corrected ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                    let expl = (item.explanation ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                    guard !corr.isEmpty || !expl.isEmpty else { return nil }
                    return ExamCorrectionItem(
                        original: orig,
                        corrected: corr,
                        explanation: expl,
                        sectionTag: item.sectionTag?.trimmingCharacters(in: .whitespacesAndNewlines)
                    )
                }.prefix(limit))
            }

            func mergeSkill(_ skill: SkillType, rawSkill: PartialSkill?) -> ExamSkillInsight {
                let fallback = base.insight(for: skill) ?? ExamSkillInsight(skill: skill, summary: "")
                guard let rawSkill else { return fallback }
                let summary = (rawSkill.summary ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                let strengths = cleanStrings(rawSkill.strengths, limit: 4)
                let weaknesses = cleanStrings(rawSkill.weaknesses, limit: 4)
                let aiCorrections = cleanCorrections(rawSkill.corrections, limit: 6)
                let suggestions = cleanStrings(rawSkill.suggestions, limit: 4)

                let finalCorrections: [ExamCorrectionItem]
                if (skill == .writing || skill == .speaking) && fallback.aiAnalyzed && !fallback.corrections.isEmpty {
                    finalCorrections = fallback.corrections
                } else if !aiCorrections.isEmpty {
                    finalCorrections = aiCorrections
                } else {
                    finalCorrections = fallback.corrections
                }

                return ExamSkillInsight(
                    skill: skill,
                    cefrEstimate: rawSkill.cefrEstimate.flatMap { CEFRLevel(rawValue: $0) } ?? fallback.cefrEstimate ?? attempt.level,
                    summary: summary.isEmpty ? fallback.summary : summary,
                    strengths: strengths.isEmpty ? fallback.strengths : strengths,
                    weaknesses: weaknesses.isEmpty ? fallback.weaknesses : weaknesses,
                    corrections: finalCorrections,
                    suggestions: suggestions.isEmpty ? fallback.suggestions : suggestions,
                    upgradedVersion: fallback.upgradedVersion,
                    aiAnalyzed: true
                )
            }

            let mergedInsights: [String: ExamSkillInsight] = [
                SkillType.reading.rawValue: mergeSkill(.reading, rawSkill: parsed.reading),
                SkillType.listening.rawValue: mergeSkill(.listening, rawSkill: parsed.listening),
                SkillType.writing.rawValue: mergeSkill(.writing, rawSkill: parsed.writing),
                SkillType.speaking.rawValue: mergeSkill(.speaking, rawSkill: parsed.speaking)
            ]

            let parsedPlan: [ExamStudyPlanItem] = Array((parsed.studyPlan ?? []).enumerated().compactMap { idx, item -> ExamStudyPlanItem? in
                let action = (item.action ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                guard !action.isEmpty else { return nil }
                let sk = item.skill.flatMap { SkillType(rawValue: $0.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)) } ?? base.prioritySkill
                let title = (item.title ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                let mins = max(5, min(90, item.targetMinutes ?? 15))
                return ExamStudyPlanItem(
                    priority: item.priority ?? (idx + 1),
                    skill: sk,
                    title: title.isEmpty ? "Focus on \(sk.shortName)" : title,
                    action: action,
                    targetMinutes: mins
                )
            }.prefix(5))

            let overall = (parsed.overallSummary ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            let verdict = (parsed.readinessVerdict ?? "").trimmingCharacters(in: .whitespacesAndNewlines)

            return ExamAIAssessment(
                generatedAt: ISO8601DateFormatter().string(from: Date()),
                source: "ai",
                providerLabel: "\(config.provider.label) (\(config.model))",
                overallSummary: overall.isEmpty ? base.overallSummary : overall,
                readinessVerdict: verdict.isEmpty ? base.readinessVerdict : verdict,
                strongestSkill: base.strongestSkill,
                prioritySkill: base.prioritySkill,
                skillInsights: mergedInsights,
                studyPlan: parsedPlan.isEmpty ? base.studyPlan : parsedPlan
            )
        } catch {
            return base
        }
    }

    public static func buildOfflineAssessment(
        exam: MockExam?,
        attempt: ExamAttemptRecord,
        writingEvals: [AIEvaluationResult] = [],
        speakingEval: AIEvaluationResult? = nil
    ) -> ExamAIAssessment {
        let reviews = attempt.questionReviews ?? []
        let lang = LearningLanguage.from(attempt.languageId)
        let langName = lang.name

        func score(_ sk: SkillType) -> Int { attempt.skills[sk.rawValue]?.score ?? 0 }
        let sorted = SkillType.allCases.sorted { score($0) > score($1) }
        let strongest = sorted.first ?? .reading
        let priority = sorted.last ?? .speaking

        func estLevel(_ s: Int) -> CEFRLevel {
            let rank = s >= 60 ? attempt.level.numericRank : max(1, attempt.level.numericRank - 1)
            return CEFRLevel.fromRank(rank)
        }

        func missedCorrections(for skill: SkillType) -> [ExamCorrectionItem] {
            reviews
                .filter { $0.skill == skill.rawValue && !$0.isCorrect }
                .prefix(6)
                .map { r in
                    let orig = r.chosenOption.map { "\(r.prompt) → You chose: \"\($0)\"" } ?? "\(r.prompt) → (No answer selected)"
                    return ExamCorrectionItem(
                        original: orig,
                        corrected: r.correctOption,
                        explanation: r.explanation,
                        sectionTag: r.sectionTag
                    )
                }
        }

        func rubricWeaknesses(for skill: SkillType) -> [String] {
            guard let r = attempt.skills[skill.rawValue]?.rubric else { return [] }
            let rows: [(String, Int)] = [
                ("Task Fulfillment", r.taskFulfillment),
                ("Coherence & Cohesion", r.coherenceCohesion),
                ("Lexical Range", r.lexicalRange),
                ("Grammatical Accuracy", r.grammaticalAccuracy)
            ]
            return rows
                .filter { $0.1 < 70 }
                .sorted { $0.1 < $1.1 }
                .map { "\($0.0) scored \($0.1)% — focus on targeted drills to push above 75%." }
        }

        func parseNote(_ note: String, tag: String) -> ExamCorrectionItem {
            if let range = note.range(of: "→") ?? note.range(of: "->") {
                let left = String(note[..<range.lowerBound]).trimmingCharacters(in: CharacterSet(charactersIn: " \"'"))
                let right = String(note[range.upperBound...]).trimmingCharacters(in: CharacterSet(charactersIn: " \"'"))
                return ExamCorrectionItem(original: left, corrected: right, explanation: "Examiner grammar & phrasing fix.", sectionTag: tag)
            }
            return ExamCorrectionItem(original: "", corrected: note.trimmingCharacters(in: .whitespacesAndNewlines), explanation: "Actionable examiner revision note.", sectionTag: tag)
        }

        // 1. Reading
        let readReviews = reviews.filter { $0.skill == SkillType.reading.rawValue }
        let readMissed = readReviews.filter { !$0.isCorrect }
        let readPassedTags = Array(Set(readReviews.filter(\.isCorrect).map(\.sectionTag))).sorted()
        let readMissedTags = Array(Set(readMissed.map(\.sectionTag))).sorted()
        let readingInsight = ExamSkillInsight(
            skill: .reading,
            cefrEstimate: estLevel(score(.reading)),
            summary: !readReviews.isEmpty
                ? "Scored \(score(.reading))% (\(readReviews.count - readMissed.count)/\(readReviews.count) correct). " + (readMissed.isEmpty
                    ? "Strong comprehension across all \(attempt.level.rawValue) \(langName) reading parts."
                    : "Errors clustered in \(readMissedTags.joined(separator: ", ")) — inspect distractor wording and grammar links.")
                : "Scored \(score(.reading))% on \(attempt.level.rawValue) Reading. \(attempt.skills[SkillType.reading.rawValue]?.feedback ?? "")",
            strengths: !readPassedTags.isEmpty
                ? ["Answered items accurately in \(readPassedTags.joined(separator: ", "))."]
                : [score(.reading) >= 60 ? "Passed the \(attempt.level.rawValue) reading threshold (\(score(.reading))%)." : "Completed timed \(attempt.level.rawValue) reading passages."],
            weaknesses: !readMissed.isEmpty
                ? Array(readMissed.prefix(3).map { "[\($0.sectionTag)] Missed \"\($0.prompt)\" — \($0.explanation)" })
                : (score(.reading) < 75 ? ["Watch for subtle qualifiers in True/False/Not Given and Cloze grammar items."] : []),
            corrections: missedCorrections(for: .reading),
            suggestions: [
                {
                    switch lang {
                    case .german:
                        return "Underline key qualifiers (nicht, nur, erst, kaum, obwohl) in \(attempt.level.rawValue) Lesen passages before selecting Richtig/Falsch."
                    case .french:
                        return "Watch subtle qualifiers (ne…que, à peine, bien que, sauf) in \(attempt.level.rawValue) French reading passages before choosing Vrai/Faux."
                    case .japanese:
                        return "Verify sentence-final negations, particles (しか〜ない, わけではない, とは限らない), and kanji compounds in \(attempt.level.rawValue) Japanese passages."
                    case .english:
                        return "Verify exact qualifiers (only, rarely, despite, whereas) in \(attempt.level.rawValue) Reading passages before locking answers."
                    }
                }(),
                readMissedTags.contains("Reading P3")
                    ? "Drill \(attempt.level.rawValue) \(langName) contextual grammar & cloze connectors for 10 mins daily."
                    : "Skim for main idea first, then scan paragraph-by-paragraph to verify exact text evidence."
            ],
            aiAnalyzed: false
        )

        // 2. Listening
        let listenReviews = reviews.filter { $0.skill == SkillType.listening.rawValue }
        let listenMissed = listenReviews.filter { !$0.isCorrect }
        let listenMissedTags = Array(Set(listenMissed.map(\.sectionTag))).sorted()
        let tracks = exam?.listening.resolvedTracks ?? []
        let missedTraps: [String] = listenMissedTags.compactMap { tag in
            let digits = tag.filter(\.isNumber)
            guard let num = Int(digits), tracks.indices.contains(num - 1) else { return nil }
            let tr = tracks[num - 1]
            return "\(tag) (\(tr.accentCode ?? "Standard")): \(tr.hearingFocusTrap)"
        }
        let listeningInsight = ExamSkillInsight(
            skill: .listening,
            cefrEstimate: estLevel(score(.listening)),
            summary: !listenReviews.isEmpty
                ? "Scored \(score(.listening))% (\(listenReviews.count - listenMissed.count)/\(listenReviews.count) correct). " + (listenMissed.isEmpty
                    ? "Handled multi-accent \(langName) spoken conversations cleanly."
                    : "Missed items in \(listenMissedTags.joined(separator: ", ")) — focus on mid-dialogue corrections and regional phrasing.")
                : "Scored \(score(.listening))% on \(attempt.level.rawValue) Listening. \(attempt.skills[SkillType.listening.rawValue]?.feedback ?? "")",
            strengths: (!listenReviews.isEmpty && listenMissed.count < listenReviews.count)
                ? ["Tracked key spoken facts accurately in \(listenReviews.count - listenMissed.count) of \(listenReviews.count) items."]
                : [score(.listening) >= 60 ? "Passed the \(attempt.level.rawValue) listening benchmark (\(score(.listening))%)." : "Practiced multi-speaker natural pacing under exam conditions."],
            weaknesses: !missedTraps.isEmpty
                ? missedTraps
                : (!listenMissed.isEmpty
                    ? Array(listenMissed.prefix(3).map { "[\($0.sectionTag)] Missed \"\($0.prompt)\" — \($0.explanation)" })
                    : (score(.listening) < 75 ? ["Listen closely for mid-sentence self-corrections (revised times, dates, platform numbers)."] : [])),
            corrections: missedCorrections(for: .listening),
            suggestions: [
                "Use the 15-second pre-read window to identify exact target details (who, when, changed plan) before pressing Play.",
                "Replay the unlocked multi-speaker dialogues below once without transcript, then shadow-read aloud to internalize regional rhythm."
            ],
            aiAnalyzed: false
        )

        // 3. Writing
        let wStrengths = Array(writingEvals.flatMap(\.strengths).prefix(4))
        let wRawNotes = !writingEvals.isEmpty ? Array(writingEvals.flatMap(\.corrections).prefix(5)) : Array((attempt.writingNotes ?? []).prefix(5))
        var wCorrections: [ExamCorrectionItem] = writingEvals.enumerated().flatMap { idx, ev in
            (ev.correctionItems ?? []).map { item in
                ExamCorrectionItem(
                    original: item.original,
                    corrected: item.corrected,
                    explanation: item.explanation,
                    sectionTag: item.sectionTag ?? "Writing Task \(idx + 1)"
                )
            }
        }
        if wCorrections.isEmpty {
            wCorrections = wRawNotes.map { parseNote($0, tag: "Writing") }
        }
        let wUpgraded = writingEvals.enumerated().compactMap { idx, ev -> String? in
            let u = ev.upgradedVersion.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !u.isEmpty else { return nil }
            return writingEvals.count > 1 ? "[Task \(idx + 1)]\n\(u)" : u
        }.joined(separator: "\n\n")
        let wSuggestions = Array(writingEvals.compactMap(\.suggestions).flatMap { $0 }.prefix(4))
        let wAI = writingEvals.contains { $0.source == "ai" }

        let writingInsight = ExamSkillInsight(
            skill: .writing,
            cefrEstimate: writingEvals.first?.cefrEstimate ?? estLevel(score(.writing)),
            summary: writingEvals.first?.examinerSummary ?? attempt.skills[SkillType.writing.rawValue]?.feedback ?? "Scored \(score(.writing))% on \(attempt.level.rawValue) Writing.",
            strengths: !wStrengths.isEmpty ? wStrengths : [score(.writing) >= 60 ? "Met core \(attempt.level.rawValue) writing task requirements (\(score(.writing))%)." : "Produced a draft addressing the writing scenario."],
            weaknesses: rubricWeaknesses(for: .writing),
            corrections: Array(wCorrections.prefix(6)),
            suggestions: !wSuggestions.isEmpty ? wSuggestions : [
                {
                    switch lang {
                    case .german:
                        return "Check every prompt bullet, keep Sie/du register consistent, and verify verb-final order after weil/obwohl/dass."
                    case .french:
                        return "Check every prompt bullet, keep vouvoiement/tutoiement consistent, and verify gender agreement & subjonctif triggers."
                    case .japanese:
                        return "Keep です/ます or だ/である register consistent, check particles (は/が/に/で/を), and use connectors (しかし, そのため, 一方で)."
                    case .english:
                        return "Address every prompt bullet explicitly, organize into clear paragraphs, and elevate vocabulary with \(attempt.level.rawValue) collocations."
                    }
                }(),
                "Reserve 3 minutes at the end to proofread grammar, register consistency, and punctuation."
            ],
            upgradedVersion: wUpgraded.isEmpty ? nil : wUpgraded,
            aiAnalyzed: wAI
        )

        // 4. Speaking
        let sStrengths = Array((speakingEval?.strengths ?? []).prefix(4))
        let sRawNotes = speakingEval.map { Array($0.corrections.prefix(5)) } ?? Array((attempt.speakingNotes ?? []).prefix(5))
        let sCorrections: [ExamCorrectionItem] = {
            if let items = speakingEval?.correctionItems, !items.isEmpty {
                return Array(items.prefix(6)).map {
                    ExamCorrectionItem(original: $0.original, corrected: $0.corrected, explanation: $0.explanation, sectionTag: $0.sectionTag ?? "Speaking")
                }
            }
            return sRawNotes.map { parseNote($0, tag: "Speaking") }
        }()
        let sSuggestions = Array((speakingEval?.suggestions ?? []).prefix(4))
        let sAI = speakingEval?.source == "ai"
        let sUpgraded = (speakingEval?.upgradedVersion ?? "").trimmingCharacters(in: .whitespacesAndNewlines)

        let speakingInsight = ExamSkillInsight(
            skill: .speaking,
            cefrEstimate: speakingEval?.cefrEstimate ?? estLevel(score(.speaking)),
            summary: speakingEval?.examinerSummary ?? attempt.skills[SkillType.speaking.rawValue]?.feedback ?? "Scored \(score(.speaking))% on \(attempt.level.rawValue) Speaking.",
            strengths: !sStrengths.isEmpty ? sStrengths : [score(.speaking) >= 60 ? "Met the \(attempt.level.rawValue) speaking threshold (\(score(.speaking))%)." : "Completed timed oral responses."],
            weaknesses: rubricWeaknesses(for: .speaking),
            corrections: sCorrections,
            suggestions: !sSuggestions.isEmpty ? sSuggestions : [
                "Use a 3-beat oral frame on cue cards: clear position → personal example → balanced contrast/conclusion.",
                "Record a 60-second Part 2 answer and compare phrasing aloud against the official model script."
            ],
            upgradedVersion: sUpgraded.isEmpty ? nil : sUpgraded,
            aiAnalyzed: sAI
        )

        let anyAI = wAI || sAI
        let providerLabel = writingEvals.first(where: { $0.source == "ai" })?.providerLabel
            ?? (sAI ? speakingEval?.providerLabel : nil)
            ?? "Built-in 4-Skill Diagnostic Engine"

        let secondarySkill = sorted.count >= 3 ? sorted[2] : priority
        let studyPlan: [ExamStudyPlanItem] = [
            ExamStudyPlanItem(
                priority: 1,
                skill: priority,
                title: "Close Your Biggest Gap: \(priority.shortName) (\(score(priority))%)",
                action: priority == .reading
                    ? "Review every missed Reading item below, highlight exact text evidence, and drill 1 timed passage."
                    : priority == .listening
                    ? "Replay missed multi-accent tracks without looking at the script, then shadow-read the dialogue."
                    : priority == .writing
                    ? "Rewrite your weakest writing task applying every correction note and compare with the upgraded rewrite."
                    : "Re-deliver Speaking Part 2 aloud using 3 structured connectors and compare against the model script.",
                targetMinutes: 20
            ),
            ExamStudyPlanItem(
                priority: 2,
                skill: secondarySkill,
                title: "Strengthen \(secondarySkill.shortName) (\(score(secondarySkill))%)",
                action: "Run a targeted \(attempt.level.rawValue) \(langName) \(secondarySkill.shortName.lowercased()) session in AI Coach Studio to push above 80%.",
                targetMinutes: 15
            ),
            ExamStudyPlanItem(
                priority: 3,
                skill: strongest,
                title: "Maintain Top Strength: \(strongest.shortName) (\(score(strongest))%)",
                action: "Keep momentum high with a quick 10-minute \(attempt.level.rawValue) warm-up before your next simulated exam.",
                targetMinutes: 10
            )
        ]

        let failedSkills = SkillType.allCases.filter { !(attempt.skills[$0.rawValue]?.passed ?? false) }
        let verdict = attempt.passed
            ? "Certification Ready at \(attempt.level.rawValue) (\(attempt.overallScore)%)"
            : (!failedSkills.isEmpty
                ? "Focus Needed in \(failedSkills.map(\.shortName).joined(separator: " & "))"
                : "Approaching \(attempt.level.rawValue) Pass Mark (\(attempt.overallScore)%)")

        let overallSummary = attempt.passed
            ? "You passed \(attempt.examTitle) with \(attempt.overallScore)%. Your strongest skill was \(strongest.shortName) (\(score(strongest))%), while \(priority.shortName) (\(score(priority))%) offers the biggest upside for Distinction."
            : "You scored \(attempt.overallScore)% on \(attempt.examTitle). Prioritize lifting \(priority.shortName) (\(score(priority))%) above the pass threshold while preserving your \(strongest.shortName) strength (\(score(strongest))%)."

        return ExamAIAssessment(
            generatedAt: ISO8601DateFormatter().string(from: Date()),
            source: anyAI ? "ai" : "offline-rubric",
            providerLabel: providerLabel,
            overallSummary: overallSummary,
            readinessVerdict: verdict,
            strongestSkill: strongest,
            prioritySkill: priority,
            skillInsights: [
                SkillType.reading.rawValue: readingInsight,
                SkillType.listening.rawValue: listeningInsight,
                SkillType.writing.rawValue: writingInsight,
                SkillType.speaking.rawValue: speakingInsight
            ],
            studyPlan: studyPlan
        )
    }

    private static func buildCompactDiagnosticContext(
        exam: MockExam?,
        attempt: ExamAttemptRecord,
        base: ExamAIAssessment
    ) -> String {
        let reviews = attempt.questionReviews ?? []
        let missedRead = Array(reviews.filter { $0.skill == SkillType.reading.rawValue && !$0.isCorrect }.prefix(6))
        let missedListen = Array(reviews.filter { $0.skill == SkillType.listening.rawValue && !$0.isCorrect }.prefix(6))
        let readParts = exam?.reading.resolvedParts ?? []
        let listenTracks = exam?.listening.resolvedTracks ?? []

        var lines: [String] = [
            "Exam: \(attempt.examTitle) | Certificate: \(attempt.alignedCertificate) | Language: \(attempt.languageId) | Level: \(attempt.level.rawValue) | Mode: \(attempt.mode)",
            "Overall: \(attempt.overallScore)% (\(attempt.passed ? "PASSED" : "NOT PASSED")) | Grade: \(attempt.officialGradeLabel ?? "N/A")",
            "Scores: Reading=\(attempt.skills["reading"]?.score ?? 0)% (\(attempt.skills["reading"]?.feedback ?? "")), Listening=\(attempt.skills["listening"]?.score ?? 0)% (\(attempt.skills["listening"]?.feedback ?? "")), Writing=\(attempt.skills["writing"]?.score ?? 0)% (\(attempt.skills["writing"]?.feedback ?? "")), Speaking=\(attempt.skills["speaking"]?.score ?? 0)% (\(attempt.skills["speaking"]?.feedback ?? ""))"
        ]

        if !missedRead.isEmpty {
            lines.append("\nMISSED READING QUESTIONS:")
            for m in missedRead {
                let idx = (Int(m.sectionTag.filter(\.isNumber)) ?? 1) - 1
                let fmt = readParts.indices.contains(idx) ? " (\(readParts[idx].format))" : ""
                lines.append("- [\(m.sectionTag)\(fmt)] Q: \(m.prompt) | Candidate chose: \"\(m.chosenOption ?? "blank")\" | Correct: \"\(m.correctOption)\" | Key: \(m.explanation)")
            }
        } else {
            lines.append("\nREADING: No missed items logged (perfect score or legacy pre-capture attempt).")
        }

        if !missedListen.isEmpty {
            lines.append("\nMISSED LISTENING QUESTIONS:")
            for m in missedListen {
                let idx = (Int(m.sectionTag.filter(\.isNumber)) ?? 1) - 1
                let trap = listenTracks.indices.contains(idx)
                    ? " | Accent: \(listenTracks[idx].accentCode ?? "std") | Trap: \(listenTracks[idx].hearingFocusTrap)"
                    : ""
                lines.append("- [\(m.sectionTag)\(trap)] Q: \(m.prompt) | Candidate chose: \"\(m.chosenOption ?? "blank")\" | Correct: \"\(m.correctOption)\" | Key: \(m.explanation)")
            }
        } else {
            lines.append("\nLISTENING: No missed items logged (perfect score or legacy pre-capture attempt).")
        }

        let wExcerpt = String((attempt.writingSubmission ?? "").trimmingCharacters(in: .whitespacesAndNewlines).prefix(750))
        if !wExcerpt.isEmpty {
            lines.append("\nWRITING SUBMISSION EXCERPT:\n\(wExcerpt)")
        }
        if let wCorr = base.insight(for: .writing)?.corrections, !wCorr.isEmpty {
            let formatted = wCorr.prefix(3).map { c in
                c.original.isEmpty ? "\"\(c.corrected)\" (\(c.explanation))" : "\"\(c.original)\" -> \"\(c.corrected)\" (\(c.explanation))"
            }.joined(separator: "; ")
            lines.append("WRITING CORRECTIONS FOUND: \(formatted)")
        }

        let sExcerpt = String((attempt.speakingTranscript ?? "").trimmingCharacters(in: .whitespacesAndNewlines).prefix(750))
        if !sExcerpt.isEmpty {
            lines.append("\nSPEAKING TRANSCRIPT EXCERPT:\n\(sExcerpt)")
        }
        if let sCorr = base.insight(for: .speaking)?.corrections, !sCorr.isEmpty {
            let formatted = sCorr.prefix(3).map { c in
                c.original.isEmpty ? "\"\(c.corrected)\" (\(c.explanation))" : "\"\(c.original)\" -> \"\(c.corrected)\" (\(c.explanation))"
            }.joined(separator: "; ")
            lines.append("SPEAKING CORRECTIONS FOUND: \(formatted)")
        }

        return lines.joined(separator: "\n")
    }

    public static func buildCoachSeedPrompt(attempt: ExamAttemptRecord, skill: SkillType) -> String {
        let insight = attempt.aiAssessment?.insight(for: skill)
        let score = attempt.skills[skill.rawValue]?.score ?? 0
        let weaknesses = (insight?.weaknesses ?? []).prefix(2).joined(separator: "; ")
        let corrections = (insight?.corrections ?? []).prefix(2).map { c in
            c.original.isEmpty ? c.corrected : "\(c.original) → \(c.corrected)"
        }.joined(separator: "; ")

        var parts: [String] = ["I just scored \(score)% in \(attempt.level.rawValue) \(skill.displayName) on \"\(attempt.examTitle)\"."]
        if !weaknesses.isEmpty {
            parts.append("Key weaknesses: \(weaknesses).")
        }
        if !corrections.isEmpty {
            parts.append("Recent corrections to drill: \(corrections).")
        }
        parts.append("Please give me a focused 10-minute targeted practice drill and check my responses step by step.")
        return parts.joined(separator: " ")
    }

    // MARK: - Multi-Exam History Real-Exam Readiness Advisor

    private static func computeTrend(_ chronologicalScores: [Int]) -> String {
        guard chronologicalScores.count >= 2,
              let first = chronologicalScores.first,
              let latest = chronologicalScores.last else {
            return "insufficient-data"
        }
        let delta = latest - first
        if delta >= 5 { return "improving" }
        if delta <= -5 { return "declining" }
        return "steady"
    }

    private static func classifySkillStatus(avg: Int, latest: Int) -> String {
        if avg >= 72 && latest >= 68 { return "ready" }
        if avg >= 60 || latest >= 65 { return "borderline" }
        return "needs-work"
    }

    /// Deterministic readiness advisor computed from recorded multi-attempt exam history.
    public static func buildOfflineReadinessReport(
        attempts: [ExamAttemptRecord],
        languageId: String? = nil,
        targetLevel: CEFRLevel? = nil
    ) -> ExamHistoryReadinessReport? {
        guard !attempts.isEmpty else { return nil }

        let sortedNewestFirst = attempts.sorted { $0.timestamp > $1.timestamp }
        let chosenLang: String = {
            if let lang = languageId, lang != "all", !lang.isEmpty {
                return lang
            }
            return sortedNewestFirst[0].languageId
        }()

        let langPool = sortedNewestFirst.filter { $0.languageId == chosenLang }
        let effectivePool = langPool.isEmpty ? sortedNewestFirst : langPool
        let chosenLevel = targetLevel ?? effectivePool[0].level
        let levelPool = effectivePool.filter { $0.level == chosenLevel }
        let analyzed = Array((levelPool.isEmpty ? effectivePool : levelPool).prefix(12))
        let chronological = Array(analyzed.reversed())

        let latestAttempt = analyzed[0]
        let targetCertificate = latestAttempt.alignedCertificate.isEmpty
            ? LearningLanguage.from(chosenLang).defaultCertificate(for: chosenLevel)
            : latestAttempt.alignedCertificate

        let passCount = analyzed.filter(\.passed).count
        let passRatePercent = Int((Double(passCount) / Double(analyzed.count) * 100.0).rounded())
        let strictAttempts = analyzed.filter { $0.mode == "strict" }
        let strictPassCount = strictAttempts.filter(\.passed).count
        let overallAvg = Int((Double(analyzed.reduce(0) { $0 + $1.overallScore }) / Double(analyzed.count)).rounded())
        let latestOverall = latestAttempt.overallScore
        let recentTrend = computeTrend(chronological.map(\.overallScore))

        var skillMap: [String: HistorySkillReadiness] = [:]
        for sk in SkillType.allCases {
            let scores = chronological.compactMap { $0.skills[sk.rawValue]?.score }
            let avg = scores.isEmpty ? 0 : Int((Double(scores.reduce(0, +)) / Double(scores.count)).rounded())
            let latest = scores.last ?? 0
            let trend = computeTrend(scores)
            let status = classifySkillStatus(avg: avg, latest: latest)
            let note: String
            switch status {
            case "ready":
                note = "Averaging \(avg)% (latest \(latest)%) — consistently clear of exam pass mark."
            case "borderline":
                note = "Averaging \(avg)% (latest \(latest)%) — close to threshold; add 2–3 drills for safety margin."
            default:
                note = "Averaging \(avg)% (latest \(latest)%) — below safe certification threshold; prioritize remediation before booking."
            }
            skillMap[sk.rawValue] = HistorySkillReadiness(
                skill: sk,
                averageScore: avg,
                latestScore: latest,
                trend: trend,
                status: status,
                note: note
            )
        }

        let sortedByAvg = SkillType.allCases.sorted {
            (skillMap[$0.rawValue]?.averageScore ?? 0) < (skillMap[$1.rawValue]?.averageScore ?? 0)
        }
        let prioritySkill = sortedByAvg.first ?? .listening
        let strongestSkill = sortedByAvg.last ?? .reading

        let allSkillsReady = SkillType.allCases.allSatisfy { skillMap[$0.rawValue]?.status == "ready" }
        let anySkillNeedsWork = SkillType.allCases.contains { skillMap[$0.rawValue]?.status == "needs-work" }
        let allSkillsPassingLatest = SkillType.allCases.allSatisfy { latestAttempt.skills[$0.rawValue]?.passed == true }

        let consistencyBonus = (analyzed.count >= 2 && passRatePercent >= 67) ? 6.0 : 0.0
        let strictBonus = strictPassCount >= 1 ? 5.0 : -4.0
        let trendAdj: Double = recentTrend == "improving" ? 4.0 : (recentTrend == "declining" ? -5.0 : 0.0)
        let minSkillAvg = Double(skillMap[prioritySkill.rawValue]?.averageScore ?? 0)
        let rawReadiness = Double(overallAvg) * 0.55 + minSkillAvg * 0.35 + Double(passRatePercent) * 0.10 + consistencyBonus + strictBonus + trendAdj
        let readinessScore = max(5, min(99, Int(rawReadiness.rounded())))

        let verdict: ExamReadinessVerdict
        if latestAttempt.passed && allSkillsPassingLatest && allSkillsReady && overallAvg >= 74 && strictPassCount >= 1 {
            verdict = .ready
        } else if !anySkillNeedsWork && overallAvg >= 64 && (passCount >= 1 || latestOverall >= 66) {
            verdict = .almostReady
        } else {
            verdict = .needsPractice
        }

        let confidence: String
        if analyzed.count >= 3 && strictAttempts.count >= 2 {
            confidence = "high"
        } else if analyzed.count >= 2 || strictAttempts.count >= 1 {
            confidence = "medium"
        } else {
            confidence = "low"
        }

        let strongestAvg = skillMap[strongestSkill.rawValue]?.averageScore ?? 0
        let strongestLatest = skillMap[strongestSkill.rawValue]?.latestScore ?? 0
        let priorityAvg = skillMap[prioritySkill.rawValue]?.averageScore ?? 0

        var strengths: [String] = [
            "Strongest skill across history: \(strongestSkill.shortName) averaging \(strongestAvg)% (latest \(strongestLatest)%)."
        ]
        if passCount > 0 {
            strengths.append("Passed \(passCount) of \(analyzed.count) simulated \(chosenLevel.rawValue) exam\(analyzed.count == 1 ? "" : "s") (\(passRatePercent)% pass rate).")
        }
        if recentTrend == "improving", let firstOverall = chronological.first?.overallScore {
            strengths.append("Upward momentum: overall score climbed from \(firstOverall)% to \(latestOverall)%.")
        }
        if strictPassCount >= 1 {
            strengths.append("Proven performance under official Strict timed pressure (\(strictPassCount) strict pass\(strictPassCount == 1 ? "" : "es")).")
        }

        var blockingRisks: [String] = []
        for sk in SkillType.allCases {
            guard let stat = skillMap[sk.rawValue] else { continue }
            if stat.status == "needs-work" {
                blockingRisks.append("\(sk.shortName) averages \(stat.averageScore)% (latest \(stat.latestScore)%), creating modular exam fail risk.")
            } else if stat.status == "borderline" {
                blockingRisks.append("\(sk.shortName) is borderline (\(stat.averageScore)% avg) — test-day pressure could dip it below pass mark.")
            }
        }
        if strictAttempts.isEmpty {
            blockingRisks.append("No Strict-mode timed attempts recorded yet — complete at least 1 Strict simulation before paying official registration fees.")
        }
        if analyzed.count < 2 {
            blockingRisks.append("Only 1 attempt recorded at this level — run at least 1 fresh unseen AI exam to verify score consistency.")
        }
        if recentTrend == "declining", let firstOverall = chronological.first?.overallScore {
            blockingRisks.append("Recent score dipped from \(firstOverall)% to \(latestOverall)% — stabilize before booking.")
        }

        let headline: String
        let rationale: String
        let estimatedPrepTime: String
        let nextSteps: [String]

        switch verdict {
        case .ready:
            headline = "Ready to Take the Real \(targetCertificate) Exam"
            rationale = "Across \(analyzed.count) \(chosenLevel.rawValue) simulation\(analyzed.count == 1 ? "" : "s") (avg \(overallAvg)%, latest \(latestOverall)%), all 4 skills are safely above the pass margin with Strict timed proof. You are ready to register for the official \(targetCertificate)."
            estimatedPrepTime = "Ready to book now (1 light Strict dress rehearsal recommended)"
            nextSteps = [
                "Book your official \(targetCertificate) exam date while your momentum is strong.",
                "Do one final Strict-mode unseen AI exam 48 hours before test day to keep \(prioritySkill.shortName) sharp.",
                "Review your saved Past Exam Dossiers for recurring small grammar or timing habits."
            ]
        case .almostReady:
            headline = "Almost Ready for \(targetCertificate) — Short Targeted Polish Needed"
            rationale = "You are close to official \(chosenLevel.rawValue) readiness (\(overallAvg)% average across \(analyzed.count) attempt\(analyzed.count == 1 ? "" : "s")), but \(prioritySkill.shortName) (\(priorityAvg)% avg) or limited Strict-mode proof still leaves narrow margin for exam-day nerves."
            estimatedPrepTime = "1–2 weeks of targeted daily practice (20–30 min/day)"
            nextSteps = [
                "Focus 60% of your next week on \(prioritySkill.shortName) (\(priorityAvg)% avg) using targeted AI Coach drills.",
                strictAttempts.isEmpty
                    ? "Complete a full Strict-mode \(chosenLevel.rawValue) simulation (official clock & locked transcripts) to test stamina."
                    : "Generate a fresh unseen \(chosenLevel.rawValue) AI exam and aim for ≥ 75% across all 4 skills before booking.",
                "Review every missed question and inline correction in your recent \(chosenLevel.rawValue) exam dossiers."
            ]
        case .needsPractice:
            headline = "More Practice Recommended Before Booking \(targetCertificate)"
            rationale = "Across \(analyzed.count) \(chosenLevel.rawValue) attempt\(analyzed.count == 1 ? "" : "s") (\(overallAvg)% average, \(passRatePercent)% pass rate), \(prioritySkill.shortName) (\(priorityAvg)% avg) needs focused skill-building before risking official exam registration fees."
            estimatedPrepTime = "3–4 weeks of structured 4-skill practice before booking"
            nextSteps = [
                "Focus 60% of your next week on \(prioritySkill.shortName) (\(priorityAvg)% avg) using targeted AI Coach drills.",
                strictAttempts.isEmpty
                    ? "Complete a full Strict-mode \(chosenLevel.rawValue) simulation to benchmark your timing under pressure."
                    : "Generate a fresh unseen \(chosenLevel.rawValue) AI exam after 1 week of drills and aim for ≥ 70% in every skill.",
                "Review every missed question and inline correction in your recent \(chosenLevel.rawValue) exam dossiers."
            ]
        }

        return ExamHistoryReadinessReport(
            source: "offline-rubric",
            providerLabel: "Built-in Exam Readiness Analyzer",
            languageId: chosenLang,
            targetLevel: chosenLevel,
            targetCertificate: targetCertificate,
            attemptsAnalyzed: analyzed.count,
            strictAttemptsCount: strictAttempts.count,
            passRatePercent: passRatePercent,
            recentTrend: recentTrend,
            verdict: verdict,
            readinessScore: readinessScore,
            confidence: confidence,
            headline: headline,
            rationale: rationale,
            estimatedPrepTime: estimatedPrepTime,
            prioritySkill: prioritySkill,
            strengths: strengths,
            blockingRisks: blockingRisks,
            nextSteps: nextSteps,
            skillReadiness: skillMap
        )
    }

    private static func buildCompactHistoryDigest(
        attempts: [ExamAttemptRecord],
        baseline: ExamHistoryReadinessReport
    ) -> String {
        let matching = attempts
            .filter { $0.languageId == baseline.languageId && $0.level == baseline.targetLevel }
            .sorted { $0.timestamp < $1.timestamp }
            .suffix(10)
        let used = matching.isEmpty ? Array(attempts.prefix(10).reversed()) : Array(matching)

        var lines: [String] = [
            "Target Official Exam: \(baseline.targetCertificate) (\(baseline.languageId.uppercased()) CEFR \(baseline.targetLevel.rawValue))",
            "Aggregate Stats: \(baseline.attemptsAnalyzed) attempts (\(baseline.strictAttemptsCount) Strict mode), Pass Rate=\(baseline.passRatePercent)%, Overall Trend=\(baseline.recentTrend), Baseline Readiness=\(baseline.readinessScore)/100",
            "Per-Skill Averages: Reading=\(baseline.readiness(for: .reading)?.averageScore ?? 0)% (latest \(baseline.readiness(for: .reading)?.latestScore ?? 0)%), Listening=\(baseline.readiness(for: .listening)?.averageScore ?? 0)% (latest \(baseline.readiness(for: .listening)?.latestScore ?? 0)%), Writing=\(baseline.readiness(for: .writing)?.averageScore ?? 0)% (latest \(baseline.readiness(for: .writing)?.latestScore ?? 0)%), Speaking=\(baseline.readiness(for: .speaking)?.averageScore ?? 0)% (latest \(baseline.readiness(for: .speaking)?.latestScore ?? 0)%)",
            "\nCHRONOLOGICAL ATTEMPTS (oldest -> newest):"
        ]

        var missedTagCounts: [String: Int] = [:]
        var recurringNotes: [String] = []

        for (idx, a) in used.enumerated() {
            let dateShort = String(a.timestamp.prefix(10))
            let r = a.skills["reading"]?.score ?? 0
            let l = a.skills["listening"]?.score ?? 0
            let w = a.skills["writing"]?.score ?? 0
            let s = a.skills["speaking"]?.score ?? 0
            lines.append("\(idx + 1). [\(dateShort)] \(a.mode.uppercased()) | Overall \(a.overallScore)% (\(a.passed ? "PASS" : "FAIL")) | R:\(r)% L:\(l)% W:\(w)% S:\(s)% | Time:\(Int((Double(a.durationUsedSeconds) / 60.0).rounded()))m | \(a.officialGradeLabel ?? "")")

            for q in (a.questionReviews ?? []) where !q.isCorrect {
                missedTagCounts[q.sectionTag, default: 0] += 1
            }
            if let ai = a.aiAssessment {
                for sk in SkillType.allCases {
                    if let firstW = ai.insight(for: sk)?.weaknesses.first {
                        recurringNotes.append("[\(sk.rawValue)] \(firstW)")
                    }
                }
            } else {
                if let wn = a.writingNotes?.first { recurringNotes.append("[writing] \(wn)") }
                if let sn = a.speakingNotes?.first { recurringNotes.append("[speaking] \(sn)") }
            }
        }

        let topTags = missedTagCounts.sorted { $0.value > $1.value }.prefix(5).map { "\($0.key) (\($0.value) missed)" }
        if !topTags.isEmpty {
            lines.append("\nMOST FREQUENT MISSED SECTIONS: \(topTags.joined(separator: ", "))")
        }
        if !recurringNotes.isEmpty {
            lines.append("\nRECORDED WEAKNESSES & EXAMINER NOTES:\n- \(recurringNotes.prefix(8).joined(separator: "\n- "))")
        }

        return lines.joined(separator: "\n")
    }

    /// Analyzes the learner's entire simulated exam history via the configured AI provider
    /// to advise whether to book the real official certification exam now or keep practicing.
    public func analyzeExamHistoryReadiness(
        config: AIProviderConfig,
        attempts: [ExamAttemptRecord],
        languageId: String? = nil,
        targetLevel: CEFRLevel? = nil
    ) async -> ExamHistoryReadinessReport? {
        guard let baseline = Self.buildOfflineReadinessReport(
            attempts: attempts,
            languageId: languageId,
            targetLevel: targetLevel
        ) else {
            return nil
        }

        let config = config.resolved(for: baseline.languageId)
        guard config.isReady else {
            return baseline
        }

        let lang = LearningLanguage.from(baseline.languageId)
        let langName = lang.name
        let examBoard = lang.examBoard

        let systemPrompt = """
        You are a candid, data-driven Senior \(examBoard) Certification Advisor evaluating a learner's simulated \(langName) \(baseline.targetLevel.rawValue) exam history.
        Tell the learner clearly whether they are READY to book and pass the REAL official exam now, ALMOST READY (needs short targeted polish), or NEED MORE PRACTICE before spending money on official registration.
        Consider consistency across attempts, score trend, modular pass risk (all 4 skills must pass reliably), and Strict timed exam proof vs Practice mode.
        Return ONLY valid JSON (no markdown fences):
        {
          "verdict": "ready|almost-ready|needs-practice",
          "readinessScore": 0-100,
          "confidence": "high|medium|low",
          "headline": "crisp 1-line decision telling them whether to book the real exam or keep practicing",
          "rationale": "2-3 sentences grounded in their exact exam history numbers, trend, and modular risks",
          "estimatedPrepTime": "e.g. Ready to book now | 1-2 weeks focused polish | 3-4 weeks structured practice",
          "strengths": ["concrete proof of readiness 1", "strength 2"],
          "blockingRisks": ["exact gap or risk before booking 1"],
          "nextSteps": ["prioritized concrete action 1", "action 2", "action 3"],
          "skillNotes": {
            "reading": "1 concise sentence diagnosing reading history",
            "listening": "1 concise sentence diagnosing listening history",
            "writing": "1 concise sentence diagnosing writing history",
            "speaking": "1 concise sentence diagnosing speaking history"
          }
        }
        """

        let digest = Self.buildCompactHistoryDigest(attempts: attempts, baseline: baseline)

        do {
            let raw = try await aiClient.chat(
                config: config,
                messages: [
                    AIChatMessage(role: "system", content: systemPrompt),
                    AIChatMessage(role: "user", content: digest)
                ]
            )
            guard let start = raw.firstIndex(of: "{"),
                  let end = raw.lastIndex(of: "}"),
                  start <= end,
                  let data = String(raw[start...end]).data(using: .utf8) else {
                return baseline
            }

            struct PartialReadiness: Decodable {
                let verdict: String?
                let readinessScore: Int?
                let confidence: String?
                let headline: String?
                let rationale: String?
                let estimatedPrepTime: String?
                let strengths: [String]?
                let blockingRisks: [String]?
                let nextSteps: [String]?
                let skillNotes: [String: String]?
            }

            guard let parsed = try? JSONDecoder().decode(PartialReadiness.self, from: data) else {
                return baseline
            }

            let verdict = parsed.verdict.flatMap { ExamReadinessVerdict(rawValue: $0.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)) } ?? baseline.verdict
            let validConf = ["high", "medium", "low"]
            let confRaw = parsed.confidence?.lowercased().trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
            let confidence = validConf.contains(confRaw) ? confRaw : baseline.confidence
            let readinessScore = parsed.readinessScore.map { max(5, min(99, $0)) } ?? baseline.readinessScore

            var mergedSkills = baseline.skillReadiness
            if let notes = parsed.skillNotes {
                for sk in SkillType.allCases {
                    if let note = notes[sk.rawValue]?.trimmingCharacters(in: .whitespacesAndNewlines),
                       !note.isEmpty,
                       let existing = mergedSkills[sk.rawValue] {
                        mergedSkills[sk.rawValue] = HistorySkillReadiness(
                            skill: existing.skill,
                            averageScore: existing.averageScore,
                            latestScore: existing.latestScore,
                            trend: existing.trend,
                            status: existing.status,
                            note: note
                        )
                    }
                }
            }

            func clean(_ arr: [String]?, limit: Int, fallback: [String]) -> [String] {
                let out = Array((arr ?? []).map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }.prefix(limit))
                return out.isEmpty ? fallback : out
            }

            let headline = (parsed.headline ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            let rationale = (parsed.rationale ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            let prep = (parsed.estimatedPrepTime ?? "").trimmingCharacters(in: .whitespacesAndNewlines)

            return ExamHistoryReadinessReport(
                source: "ai",
                providerLabel: "\(config.provider.label) (\(config.model))",
                languageId: baseline.languageId,
                targetLevel: baseline.targetLevel,
                targetCertificate: baseline.targetCertificate,
                attemptsAnalyzed: baseline.attemptsAnalyzed,
                strictAttemptsCount: baseline.strictAttemptsCount,
                passRatePercent: baseline.passRatePercent,
                recentTrend: baseline.recentTrend,
                verdict: verdict,
                readinessScore: readinessScore,
                confidence: confidence,
                headline: headline.isEmpty ? baseline.headline : headline,
                rationale: rationale.isEmpty ? baseline.rationale : rationale,
                estimatedPrepTime: prep.isEmpty ? baseline.estimatedPrepTime : prep,
                prioritySkill: baseline.prioritySkill,
                strengths: clean(parsed.strengths, limit: 4, fallback: baseline.strengths),
                blockingRisks: clean(parsed.blockingRisks, limit: 4, fallback: baseline.blockingRisks),
                nextSteps: clean(parsed.nextSteps, limit: 5, fallback: baseline.nextSteps),
                skillReadiness: mergedSkills
            )
        } catch {
            return baseline
        }
    }

    public static func buildCoachSeedPrompt(from report: ExamHistoryReadinessReport, skill: SkillType? = nil) -> String {
        let targetSkill = skill ?? report.prioritySkill
        let stat = report.readiness(for: targetSkill)
        let avg = stat?.averageScore ?? 0
        let latest = stat?.latestScore ?? 0
        let risks = report.blockingRisks.prefix(2).joined(separator: "; ")
        let riskClause = risks.isEmpty ? (stat?.note ?? "") : risks
        return "I'm preparing for the real \(report.targetCertificate) (\(report.targetLevel.rawValue)) exam. Across \(report.attemptsAnalyzed) simulated exam(s), my \(targetSkill.displayName) average is \(avg)% (latest \(latest)%). Readiness status: \(report.headline). Key risks: \(riskClause). Please build a targeted \(report.targetLevel.rawValue) \(targetSkill.displayName) practice session to get me exam-ready."
    }
}
