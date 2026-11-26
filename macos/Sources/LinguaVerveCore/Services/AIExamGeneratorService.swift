import Foundation

public enum SkillGenerationStatus: String, Sendable, Equatable {
    case pending
    case loading
    case done
    case fallback
}

public struct ExamGenerationResult: Sendable {
    public let exam: MockExam
    public let aiSkillsCount: Int
    public let theme: String

    public init(exam: MockExam, aiSkillsCount: Int, theme: String) {
        self.exam = exam
        self.aiSkillsCount = aiSkillsCount
        self.theme = theme
    }
}

public enum AIExamGeneratorError: LocalizedError, Sendable {
    case aiNotConfigured
    case generationFailed(String)

    public var errorDescription: String? {
        switch self {
        case .aiNotConfigured:
            return "Connect an AI provider (Apple Intelligence, Ollama, LM Studio, OpenAI, Gemini, or OpenRouter) first to generate fresh exams."
        case .generationFailed(let detail):
            return detail
        }
    }
}

/// Generates completely fresh, multi-part 4-skill CEFR simulated certification exams
/// using whichever AI provider the learner has connected (On-Device Apple Intelligence,
/// Local Ollama/LM Studio, or Cloud OpenAI/Gemini/OpenRouter/Custom).
public struct AIExamGeneratorService: Sendable {
    public static let germanThemes: [String] = [
        "Alltag, Wohnen & Nachbarschaft in der Stadt",
        "Bahn, Nahverkehr & nachhaltige Mobilität",
        "Arbeit, Homeoffice & Bewerbungsgespräch",
        "Gesundheit, Arzttermin & Prävention",
        "Studium, Weiterbildung & lebenslanges Lernen",
        "Digitalisierung, KI & Datenschutz im Alltag",
        "Kultur, Medien & Journalismus im DACH-Raum",
        "Verbraucherrechte, Einkaufen & Reklamationen",
        "Klimaschutz, Energie & Stadtplanung",
        "Reisen, Hotellerie & Gastronomie",
        "Ehrenamt, Vereine & Gesellschaft",
        "Wirtschaft, Start-ups & Innovation"
    ]

    public static let englishThemes: [String] = [
        "Urban Mobility, Transit & Smart Cities",
        "Remote Work, Leadership & Career Transitions",
        "Healthcare, Wellbeing & Preventive Medicine",
        "University Research, Education & Lifelong Learning",
        "Artificial Intelligence, Ethics & Digital Privacy",
        "Climate Policy, Energy & Sustainable Housing",
        "Global Journalism, Media Literacy & Culture",
        "Consumer Rights, E-Commerce & Travel Logistics",
        "Entrepreneurship, Finance & Modern Economics",
        "Community Volunteering, Arts & Heritage",
        "Food Systems, Hospitality & Regional Traditions",
        "Science Communication & Space Exploration"
    ]

    public static func themes(for languageId: String) -> [String] {
        languageId == "german" ? germanThemes : englishThemes
    }

    public static func pickRandomTheme(for languageId: String, avoid: [String] = []) -> String {
        let pool = themes(for: languageId)
        let avoidSet = Set(avoid.map { $0.lowercased().trimmingCharacters(in: .whitespacesAndNewlines) })
        let fresh = pool.filter { !avoidSet.contains($0.lowercased()) }
        let candidates = fresh.isEmpty ? pool : fresh
        return candidates.randomElement() ?? pool[0]
    }

    private let aiClient: AIClientService

    public init(aiClient: AIClientService = AIClientService()) {
        self.aiClient = aiClient
    }

    public func generateFreshExam(
        config: AIProviderConfig,
        baseExam: MockExam,
        theme: String? = nil,
        customTopic: String? = nil,
        avoidThemes: [String] = [],
        onProgress: (@Sendable (SkillType, SkillGenerationStatus) -> Void)? = nil
    ) async throws -> ExamGenerationResult {
        guard config.isReady else {
            throw AIExamGeneratorError.aiNotConfigured
        }

        let trimmedCustom = customTopic?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let trimmedTheme = theme?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let chosenTheme = !trimmedCustom.isEmpty
            ? trimmedCustom
            : (!trimmedTheme.isEmpty ? trimmedTheme : Self.pickRandomTheme(for: baseExam.languageId, avoid: avoidThemes))

        let isGerman = baseExam.languageId == "german"
        let langName = isGerman ? "German" : "English"
        let seed = Int.random(in: 1000...9999)
        let stamp = "\(Int(Date().timeIntervalSince1970))-\(seed)"
        let accents = Self.targetAccents(for: baseExam.languageId, seed: seed)
        let avoidNote = avoidThemes.isEmpty
            ? ""
            : "Avoid repeating scenarios from these previous themes: \(avoidThemes.prefix(5).joined(separator: "; "))."

        var mutableConfig = config
        mutableConfig.temperature = max(0.65, min(0.95, config.temperature))
        let creativeConfig = mutableConfig

        let runSequentially = config.provider.isLocal

        let readRes: (ok: Bool, parts: [ReadingExamPart])
        let listenRes: (ok: Bool, tracks: [ListeningExamTrack])
        let writeRes: (ok: Bool, tasks: [WritingExamTask])
        let speakRes: (ok: Bool, parts: [SpeakingExamPart])

        if runSequentially {
            readRes = await generateReading(config: creativeConfig, baseExam: baseExam, theme: chosenTheme, langName: langName, isGerman: isGerman, seed: seed, stamp: stamp, avoidNote: avoidNote, onProgress: onProgress)
            listenRes = await generateListening(config: creativeConfig, baseExam: baseExam, theme: chosenTheme, langName: langName, accents: accents, seed: seed, stamp: stamp, avoidNote: avoidNote, onProgress: onProgress)
            writeRes = await generateWriting(config: creativeConfig, baseExam: baseExam, theme: chosenTheme, langName: langName, seed: seed, stamp: stamp, avoidNote: avoidNote, onProgress: onProgress)
            speakRes = await generateSpeaking(config: creativeConfig, baseExam: baseExam, theme: chosenTheme, langName: langName, isGerman: isGerman, seed: seed, stamp: stamp, avoidNote: avoidNote, onProgress: onProgress)
        } else {
            async let r = generateReading(config: creativeConfig, baseExam: baseExam, theme: chosenTheme, langName: langName, isGerman: isGerman, seed: seed, stamp: stamp, avoidNote: avoidNote, onProgress: onProgress)
            async let l = generateListening(config: creativeConfig, baseExam: baseExam, theme: chosenTheme, langName: langName, accents: accents, seed: seed, stamp: stamp, avoidNote: avoidNote, onProgress: onProgress)
            async let w = generateWriting(config: creativeConfig, baseExam: baseExam, theme: chosenTheme, langName: langName, seed: seed, stamp: stamp, avoidNote: avoidNote, onProgress: onProgress)
            async let s = generateSpeaking(config: creativeConfig, baseExam: baseExam, theme: chosenTheme, langName: langName, isGerman: isGerman, seed: seed, stamp: stamp, avoidNote: avoidNote, onProgress: onProgress)
            readRes = await r
            listenRes = await l
            writeRes = await w
            speakRes = await s
        }

        var aiSkills: [SkillType] = []
        if readRes.ok { aiSkills.append(.reading) }
        if listenRes.ok { aiSkills.append(.listening) }
        if writeRes.ok { aiSkills.append(.writing) }
        if speakRes.ok { aiSkills.append(.speaking) }

        guard !aiSkills.isEmpty else {
            throw AIExamGeneratorError.generationFailed(
                "Could not generate exam content from \(config.provider.label) (\(config.model)). Check your AI connection in Local & Cloud AI settings and retry."
            )
        }

        let shortTheme = chosenTheme.count > 42 ? "\(chosenTheme.prefix(42))…" : chosenTheme
        let firstRead = readRes.parts.first
        let firstListen = listenRes.tracks.first
        let firstWrite = writeRes.tasks.first
        let cuePart = speakRes.parts.count > 1 ? speakRes.parts[1] : speakRes.parts.first

        let generatedExam = MockExam(
            id: "ai-exam-\(baseExam.languageId)-\(baseExam.level.rawValue.lowercased())-\(stamp)",
            languageId: baseExam.languageId,
            level: baseExam.level,
            title: "\(baseExam.alignedCertificate) · AI Edition (\(shortTheme))",
            alignedCertificate: baseExam.alignedCertificate,
            passingScorePercent: baseExam.passingScorePercent,
            totalMinutes: baseExam.totalMinutes,
            requireAllSkillsPass: baseExam.requireAllSkillsPass ?? true,
            aiGenerated: true,
            generatedTheme: chosenTheme,
            generatedByModel: "\(config.provider.label) · \(config.model)",
            generatedAt: ISO8601DateFormatter().string(from: Date()),
            aiGeneratedSkills: aiSkills,
            reading: ReadingExamSection(
                title: firstRead?.partLabel ?? baseExam.reading.title,
                durationMinutes: baseExam.reading.durationMinutes,
                passageTitle: firstRead?.passageTitle ?? baseExam.reading.passageTitle,
                passage: firstRead?.passage ?? baseExam.reading.passage,
                questions: firstRead?.questions ?? baseExam.reading.questions,
                parts: readRes.parts
            ),
            listening: ListeningExamSection(
                title: firstListen?.partLabel ?? baseExam.listening.title,
                durationMinutes: baseExam.listening.durationMinutes,
                maxPlaysStrict: baseExam.listening.maxPlaysStrict,
                contextNote: firstListen?.contextNote ?? baseExam.listening.contextNote,
                audioScript: firstListen?.audioScript ?? baseExam.listening.audioScript,
                hearingFocusTrap: firstListen?.hearingFocusTrap ?? baseExam.listening.hearingFocusTrap,
                questions: firstListen?.questions ?? baseExam.listening.questions,
                tracks: listenRes.tracks
            ),
            writing: WritingExamSection(
                title: firstWrite?.partLabel ?? baseExam.writing.title,
                durationMinutes: baseExam.writing.durationMinutes,
                scenario: firstWrite?.scenario ?? baseExam.writing.scenario,
                taskRequirements: firstWrite?.taskRequirements ?? baseExam.writing.taskRequirements,
                minWords: firstWrite?.minWords ?? baseExam.writing.minWords,
                maxWords: firstWrite?.maxWords ?? baseExam.writing.maxWords,
                keyRubricKeywords: firstWrite?.keyRubricKeywords ?? baseExam.writing.keyRubricKeywords,
                modelAnswer: firstWrite?.modelAnswer ?? baseExam.writing.modelAnswer,
                tasks: writeRes.tasks
            ),
            speaking: SpeakingExamSection(
                title: cuePart?.partLabel ?? baseExam.speaking.title,
                durationMinutes: baseExam.speaking.durationMinutes,
                prepSeconds: baseExam.speaking.prepSeconds,
                speakSeconds: baseExam.speaking.speakSeconds,
                cueCardTitle: cuePart?.instruction ?? baseExam.speaking.cueCardTitle,
                bulletPoints: cuePart?.prompts ?? baseExam.speaking.bulletPoints,
                followUpQuestion: baseExam.speaking.followUpQuestion,
                keyRubricKeywords: cuePart?.keyRubricKeywords ?? baseExam.speaking.keyRubricKeywords,
                modelResponseScript: cuePart?.modelResponseScript ?? baseExam.speaking.modelResponseScript,
                parts: speakRes.parts
            )
        )

        return ExamGenerationResult(exam: generatedExam, aiSkillsCount: aiSkills.count, theme: chosenTheme)
    }

    // MARK: - Per-Skill Structured Generators

    private struct RawQuestion: Decodable {
        let prompt: String?
        let options: [String]?
        let correctIndex: Int?
        let explanation: String?
    }

    private struct RawReadingPayload: Decodable {
        struct Part: Decodable {
            let partLabel: String?
            let format: String?
            let instruction: String?
            let passageTitle: String?
            let passage: String?
            let questions: [RawQuestion]?
        }
        let parts: [Part]?
    }

    private struct RawListeningPayload: Decodable {
        struct Track: Decodable {
            let partLabel: String?
            let contextNote: String?
            let accentCode: String?
            let audioScript: String?
            let hearingFocusTrap: String?
            let questions: [RawQuestion]?
        }
        let tracks: [Track]?
    }

    private struct RawWritingPayload: Decodable {
        struct TaskItem: Decodable {
            let partLabel: String?
            let scenario: String?
            let taskRequirements: [String]?
            let weightPercent: Int?
            let keyRubricKeywords: [String]?
            let modelAnswer: String?
        }
        let tasks: [TaskItem]?
    }

    private struct RawSpeakingPayload: Decodable {
        struct Part: Decodable {
            let partLabel: String?
            let instruction: String?
            let prepSeconds: Int?
            let speakSeconds: Int?
            let prompts: [String]?
            let examinerPromptAudio: String?
            let keyRubricKeywords: [String]?
            let modelResponseScript: String?
        }
        let parts: [Part]?
    }

    private func generateReading(
        config: AIProviderConfig,
        baseExam: MockExam,
        theme: String,
        langName: String,
        isGerman: Bool,
        seed: Int,
        stamp: String,
        avoidNote: String,
        onProgress: (@Sendable (SkillType, SkillGenerationStatus) -> Void)?
    ) async -> (ok: Bool, parts: [ReadingExamPart]) {
        onProgress?(.reading, .loading)
        let tfOptions = isGerman ? #"["Richtig","Falsch","Steht nicht im Text"]"# : #"["True","False","Not Given"]"#
        let sys = """
        You are a certified \(baseExam.alignedCertificate) Reading exam author creating brand-new CEFR \(baseExam.level.rawValue) \(langName) content.
        Return ONLY valid JSON matching:
        {"parts":[{"partLabel":"<Part 1>","format":"comprehension","instruction":"<instruction>","passageTitle":"<title>","passage":"<85-150 word \(langName) passage>","questions":[{"prompt":"<Q1>","options":["A","B","C","D"],"correctIndex":0,"explanation":"<why>"},{"prompt":"<Q2>","options":["A","B","C","D"],"correctIndex":1,"explanation":"<why>"},{"prompt":"<Q3>","options":["A","B","C","D"],"correctIndex":2,"explanation":"<why>"}]},{"partLabel":"<Part 2>","format":"true-false","instruction":"<instruction>","passageTitle":"<title>","passage":"<80-140 word text>","questions":[{"prompt":"<statement 1>","options":\(tfOptions),"correctIndex":0,"explanation":"<why>"},{"prompt":"<statement 2>","options":\(tfOptions),"correctIndex":1,"explanation":"<why>"},{"prompt":"<statement 3>","options":\(tfOptions),"correctIndex":2,"explanation":"<why>"}]},{"partLabel":"<Part 3 Cloze>","format":"cloze","instruction":"<instruction>","passageTitle":"<title>","passage":"<short text with gaps [1], [2], [3]>","questions":[{"prompt":"Gap [1]","options":["a","b","c","d"],"correctIndex":0,"explanation":"<why>"},{"prompt":"Gap [2]","options":["a","b","c","d"],"correctIndex":1,"explanation":"<why>"},{"prompt":"Gap [3]","options":["a","b","c","d"],"correctIndex":2,"explanation":"<why>"}]}]}
        """
        let user = "Create a brand-new CEFR \(baseExam.level.rawValue) \(langName) Reading section (3 parts, 3 questions each = 9 total) themed around: \"\(theme)\". Seed: \(seed). \(avoidNote)"

        if let parsed: RawReadingPayload = await requestJSON(config: config, system: sys, user: user),
           let rawParts = parsed.parts {
            let formats = ["comprehension", "true-false", "cloze"]
            var validated: [ReadingExamPart] = []
            for (idx, rp) in rawParts.prefix(3).enumerated() {
                let passage = (rp.passage ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                let qs = sanitizeQuestions(rp.questions, prefix: "ai-\(stamp)-r-p\(idx + 1)", limit: 3)
                guard passage.count >= 30, qs.count >= 2 else { continue }
                let fmt = rp.format?.trimmingCharacters(in: .whitespacesAndNewlines) ?? formats[idx]
                validated.append(
                    ReadingExamPart(
                        id: "ai-\(stamp)-read-p\(idx + 1)",
                        partLabel: nonEmpty(rp.partLabel, fallback: "Reading · Part \(idx + 1)"),
                        format: ["comprehension", "true-false", "tfng", "cloze", "matching"].contains(fmt) ? fmt : formats[idx],
                        instruction: nonEmpty(rp.instruction, fallback: isGerman ? "Lesen Sie den Text und wählen Sie die beste Antwort." : "Read the passage carefully and choose the best answer."),
                        passageTitle: nonEmpty(rp.passageTitle, fallback: theme),
                        passage: passage,
                        questions: qs
                    )
                )
            }
            if validated.count >= 2 {
                let baseParts = baseExam.reading.resolvedParts
                while validated.count < 3 && validated.count < baseParts.count {
                    validated.append(baseParts[validated.count])
                }
                onProgress?(.reading, .done)
                return (true, validated)
            }
        }
        onProgress?(.reading, .fallback)
        return (false, baseExam.reading.resolvedParts)
    }

    private func generateListening(
        config: AIProviderConfig,
        baseExam: MockExam,
        theme: String,
        langName: String,
        accents: [String],
        seed: Int,
        stamp: String,
        avoidNote: String,
        onProgress: (@Sendable (SkillType, SkillGenerationStatus) -> Void)?
    ) async -> (ok: Bool, tracks: [ListeningExamTrack]) {
        onProgress?(.listening, .loading)
        let isGerman = baseExam.languageId == "german"
        let exampleDialogue = isGerman
            ? "Clara: Entschuldigung, fährt der Zug von Gleis sechs?\\nMarkus: Moment — nein, der wurde auf Gleis neun verlegt!\\nClara: Ach wirklich? Danke, das hätte ich fast verpasst!\\nMarkus: Gern, er hat auch zehn Minuten Verspätung."
            : "Emma: Wait, did the workshop move to Room 204?\\nLiam: Hang on, let me check—oh! It was 204 yesterday, but they moved it to Room 310 today.\\nEmma: Good thing I asked! Still at nine thirty?\\nLiam: Yep, nine thirty sharp."
        let sys = """
        You are a certified \(baseExam.alignedCertificate) Listening exam author creating 3 fresh CEFR \(baseExam.level.rawValue) \(langName) NATURAL TWO-PERSON HUMAN CONVERSATIONS (NOT robotic announcements).
        CRITICAL: Format EVERY audioScript as a realistic 4-6 turn back-and-forth dialogue between two named humans (one female name, one male name) separated by \\n, with natural spoken reactions and realistic self-corrections. Example: "\(exampleDialogue)". No bracketed stage directions.
        Return ONLY valid JSON matching:
        {"tracks":[{"partLabel":"<Track 1 Dialogue (\(accents[0]))>","contextNote":"<who is talking and where>","accentCode":"\(accents[0])","audioScript":"<4-6 turn NameA: ...\\nNameB: ... conversation, 75-140 words>","hearingFocusTrap":"<distractor trap>","questions":[{"prompt":"<Q1>","options":["A","B","C","D"],"correctIndex":0,"explanation":"<why>"},{"prompt":"<Q2>","options":["A","B","C","D"],"correctIndex":1,"explanation":"<why>"},{"prompt":"<Q3>","options":["A","B","C","D"],"correctIndex":2,"explanation":"<why>"}]},{"partLabel":"<Track 2 Dialogue (\(accents[1]))>","contextNote":"<context>","accentCode":"\(accents[1])","audioScript":"<NameA: ...\\nNameB: ...>","hearingFocusTrap":"<trap>","questions":[{"prompt":"<Q1>","options":["A","B","C","D"],"correctIndex":0,"explanation":"<why>"},{"prompt":"<Q2>","options":["A","B","C","D"],"correctIndex":1,"explanation":"<why>"},{"prompt":"<Q3>","options":["A","B","C","D"],"correctIndex":2,"explanation":"<why>"}]},{"partLabel":"<Track 3 Dialogue (\(accents[2]))>","contextNote":"<context>","accentCode":"\(accents[2])","audioScript":"<NameA: ...\\nNameB: ...>","hearingFocusTrap":"<trap>","questions":[{"prompt":"<Q1>","options":["A","B","C","D"],"correctIndex":0,"explanation":"<why>"},{"prompt":"<Q2>","options":["A","B","C","D"],"correctIndex":1,"explanation":"<why>"},{"prompt":"<Q3>","options":["A","B","C","D"],"correctIndex":2,"explanation":"<why>"}]}]}
        """
        let user = "Create 3 lifelike CEFR \(baseExam.level.rawValue) \(langName) two-person conversational Listening dialogues (3 questions each = 9 total) themed around: \"\(theme)\" matching accents \(accents.joined(separator: ", ")). Include natural spoken reactions and authentic schedule/number/self-correction distractors. Seed: \(seed). \(avoidNote)"

        if let parsed: RawListeningPayload = await requestJSON(config: config, system: sys, user: user),
           let rawTracks = parsed.tracks {
            var validated: [ListeningExamTrack] = []
            for (idx, rt) in rawTracks.prefix(3).enumerated() {
                let script = (rt.audioScript ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                let qs = sanitizeQuestions(rt.questions, prefix: "ai-\(stamp)-l-t\(idx + 1)", limit: 3)
                guard script.count >= 30, qs.count >= 2 else { continue }
                validated.append(
                    ListeningExamTrack(
                        id: "ai-\(stamp)-listen-t\(idx + 1)",
                        partLabel: nonEmpty(rt.partLabel, fallback: "Listening · Track \(idx + 1)"),
                        contextNote: nonEmpty(rt.contextNote, fallback: theme),
                        accentCode: accents[idx],
                        maxPlaysStrict: baseExam.listening.maxPlaysStrict,
                        preReadSeconds: 15,
                        audioScript: script,
                        hearingFocusTrap: nonEmpty(rt.hearingFocusTrap, fallback: "Watch for numbers, corrections, and subtle speaker attitude."),
                        questions: qs
                    )
                )
            }
            if validated.count >= 2 {
                let baseTracks = baseExam.listening.resolvedTracks
                while validated.count < 3 && validated.count < baseTracks.count {
                    validated.append(baseTracks[validated.count])
                }
                onProgress?(.listening, .done)
                return (true, validated)
            }
        }
        onProgress?(.listening, .fallback)
        return (false, baseExam.listening.resolvedTracks)
    }

    private func generateWriting(
        config: AIProviderConfig,
        baseExam: MockExam,
        theme: String,
        langName: String,
        seed: Int,
        stamp: String,
        avoidNote: String,
        onProgress: (@Sendable (SkillType, SkillGenerationStatus) -> Void)?
    ) async -> (ok: Bool, tasks: [WritingExamTask]) {
        onProgress?(.writing, .loading)
        let baseTasks = baseExam.writing.resolvedTasks
        let min1 = baseTasks.first?.minWords ?? baseExam.writing.minWords
        let max1 = baseTasks.first?.maxWords ?? baseExam.writing.maxWords
        let min2 = baseTasks.count > 1 ? baseTasks[1].minWords : max(40, Int(Double(min1) * 1.2))
        let max2 = baseTasks.count > 1 ? baseTasks[1].maxWords : max(80, Int(Double(max1) * 1.2))

        let sys = """
        You are a certified \(baseExam.alignedCertificate) Writing examiner creating 2 fresh CEFR \(baseExam.level.rawValue) \(langName) tasks.
        Return ONLY valid JSON matching:
        {"tasks":[{"partLabel":"<Task 1>","scenario":"<writing prompt>","taskRequirements":["<req 1>","<req 2>","<req 3>"],"weightPercent":40,"keyRubricKeywords":["<kw1>","<kw2>","<kw3>","<kw4>"],"modelAnswer":"<full high-scoring model answer in \(langName)>"},{"partLabel":"<Task 2>","scenario":"<distinct writing prompt>","taskRequirements":["<req 1>","<req 2>","<req 3>"],"weightPercent":60,"keyRubricKeywords":["<kw1>","<kw2>","<kw3>","<kw4>"],"modelAnswer":"<full high-scoring model answer in \(langName)>"}]}
        """
        let user = "Create 2 distinct CEFR \(baseExam.level.rawValue) \(langName) Writing tasks themed around: \"\(theme)\". Task 1 target \(min1)-\(max1) words (40%), Task 2 target \(min2)-\(max2) words (60%). Seed: \(seed). \(avoidNote)"

        if let parsed: RawWritingPayload = await requestJSON(config: config, system: sys, user: user),
           let rawTasks = parsed.tasks {
            let mins = [min1, min2]
            let maxs = [max1, max2]
            let weights = [40, 60]
            var validated: [WritingExamTask] = []
            for (idx, rt) in rawTasks.prefix(2).enumerated() {
                let scenario = (rt.scenario ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                let model = (rt.modelAnswer ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                guard scenario.count >= 20, model.count >= 35 else { continue }
                let reqs = (rt.taskRequirements ?? []).map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }
                let kws = (rt.keyRubricKeywords ?? []).map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }
                validated.append(
                    WritingExamTask(
                        id: "ai-\(stamp)-write-t\(idx + 1)",
                        partLabel: nonEmpty(rt.partLabel, fallback: "Writing · Task \(idx + 1)"),
                        scenario: scenario,
                        taskRequirements: reqs.count >= 2 ? reqs : ["Address every bullet point clearly.", "Use cohesive connectors and appropriate register.", "Check grammar and word order carefully."],
                        minWords: mins[idx],
                        maxWords: maxs[idx],
                        weightPercent: weights[idx],
                        keyRubricKeywords: kws.count >= 2 ? kws : baseExam.writing.keyRubricKeywords,
                        modelAnswer: model
                    )
                )
            }
            if validated.count == 2 {
                onProgress?(.writing, .done)
                return (true, validated)
            }
            if validated.count == 1, baseTasks.count > 1 {
                let first = validated[0]
                let balancedFirst = WritingExamTask(
                    id: first.id,
                    partLabel: first.partLabel,
                    scenario: first.scenario,
                    taskRequirements: first.taskRequirements,
                    minWords: first.minWords,
                    maxWords: first.maxWords,
                    weightPercent: 50,
                    keyRubricKeywords: first.keyRubricKeywords,
                    modelAnswer: first.modelAnswer
                )
                let fallbackSecond = WritingExamTask(
                    id: baseTasks[1].id,
                    partLabel: baseTasks[1].partLabel,
                    scenario: baseTasks[1].scenario,
                    taskRequirements: baseTasks[1].taskRequirements,
                    minWords: baseTasks[1].minWords,
                    maxWords: baseTasks[1].maxWords,
                    weightPercent: 50,
                    keyRubricKeywords: baseTasks[1].keyRubricKeywords,
                    modelAnswer: baseTasks[1].modelAnswer
                )
                onProgress?(.writing, .done)
                return (true, [balancedFirst, fallbackSecond])
            }
        }
        onProgress?(.writing, .fallback)
        return (false, baseTasks)
    }

    private func generateSpeaking(
        config: AIProviderConfig,
        baseExam: MockExam,
        theme: String,
        langName: String,
        isGerman: Bool,
        seed: Int,
        stamp: String,
        avoidNote: String,
        onProgress: (@Sendable (SkillType, SkillGenerationStatus) -> Void)?
    ) async -> (ok: Bool, parts: [SpeakingExamPart]) {
        onProgress?(.speaking, .loading)
        let sys = """
        You are a certified \(baseExam.alignedCertificate) Speaking examiner creating a 3-part CEFR \(baseExam.level.rawValue) \(langName) oral exam.
        Return ONLY valid JSON matching:
        {"parts":[{"partLabel":"<Part 1 Warm-Up>","instruction":"<instruction>","prepSeconds":15,"speakSeconds":60,"prompts":["<p1>","<p2>","<p3>"],"examinerPromptAudio":"<examiner spoken greeting & prompt in \(langName)>","keyRubricKeywords":["<kw1>","<kw2>","<kw3>"],"modelResponseScript":"<natural spoken model response in \(langName)>"},{"partLabel":"<Part 2 Cue Card>","instruction":"<cue card topic>","prepSeconds":\(baseExam.speaking.prepSeconds),"speakSeconds":\(baseExam.speaking.speakSeconds),"prompts":["<b1>","<b2>","<b3>"],"examinerPromptAudio":"<examiner transition spoken aloud>","keyRubricKeywords":["<kw1>","<kw2>","<kw3>"],"modelResponseScript":"<natural spoken model presentation>"},{"partLabel":"<Part 3 Discussion Pushback>","instruction":"<discussion task>","prepSeconds":20,"speakSeconds":90,"prompts":["<q1>","<q2>","<q3>"],"examinerPromptAudio":"<examiner pushback question spoken aloud>","keyRubricKeywords":["<kw1>","<kw2>","<kw3>"],"modelResponseScript":"<natural spoken model discussion response>"}]}
        """
        let user = "Create a fresh 3-part CEFR \(baseExam.level.rawValue) \(langName) Speaking exam themed around: \"\(theme)\". Seed: \(seed). \(avoidNote)"

        if let parsed: RawSpeakingPayload = await requestJSON(config: config, system: sys, user: user),
           let rawParts = parsed.parts {
            let preps = [15, baseExam.speaking.prepSeconds, 20]
            let speaks = [60, baseExam.speaking.speakSeconds, 90]
            var validated: [SpeakingExamPart] = []
            for (idx, rp) in rawParts.prefix(3).enumerated() {
                let model = (rp.modelResponseScript ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                let prompts = (rp.prompts ?? []).map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }
                guard model.count >= 25, prompts.count >= 2 else { continue }
                let kws = (rp.keyRubricKeywords ?? []).map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }
                let defaultAudio = isGerman
                    ? "Willkommen zu Teil \(idx + 1). Bitte sprechen Sie kurz zum Thema \(theme)."
                    : "Welcome to Part \(idx + 1). Please share your thoughts on \(theme)."
                validated.append(
                    SpeakingExamPart(
                        id: "ai-\(stamp)-speak-p\(idx + 1)",
                        partLabel: nonEmpty(rp.partLabel, fallback: "Speaking · Part \(idx + 1)"),
                        instruction: nonEmpty(rp.instruction, fallback: theme),
                        prepSeconds: preps[idx],
                        speakSeconds: speaks[idx],
                        prompts: prompts,
                        examinerPromptAudio: nonEmpty(rp.examinerPromptAudio, fallback: defaultAudio),
                        keyRubricKeywords: kws.count >= 2 ? kws : baseExam.speaking.keyRubricKeywords,
                        modelResponseScript: model
                    )
                )
            }
            if validated.count >= 2 {
                let baseParts = baseExam.speaking.resolvedParts
                while validated.count < 3 && validated.count < baseParts.count {
                    validated.append(baseParts[validated.count])
                }
                onProgress?(.speaking, .done)
                return (true, validated)
            }
        }
        onProgress?(.speaking, .fallback)
        return (false, baseExam.speaking.resolvedParts)
    }

    // MARK: - Helpers

    private func requestJSON<T: Decodable>(
        config: AIProviderConfig,
        system: String,
        user: String
    ) async -> T? {
        for attempt in 0..<2 {
            let reminder = attempt == 1
                ? "\nIMPORTANT: Return ONLY raw valid JSON starting with { and ending with }. No markdown fences, no commentary."
                : ""
            do {
                let raw = try await aiClient.chat(
                    config: config,
                    messages: [
                        AIChatMessage(role: "system", content: system + reminder),
                        AIChatMessage(role: "user", content: user)
                    ]
                )
                if let decoded: T = Self.decodeJSONObject(from: raw) {
                    return decoded
                }
            } catch {
                if attempt == 1 { return nil }
            }
        }
        return nil
    }

    public static func decodeJSONObject<T: Decodable>(from raw: String) -> T? {
        let stripped = raw
            .replacingOccurrences(of: "```json", with: "", options: .caseInsensitive)
            .replacingOccurrences(of: "```", with: "")
            .trimmingCharacters(in: .whitespacesAndNewlines)

        guard let start = stripped.firstIndex(of: "{"),
              let end = stripped.lastIndex(of: "}"),
              start <= end else {
            return nil
        }
        let slice = String(stripped[start...end])
        if let data = slice.data(using: .utf8),
           let decoded = try? JSONDecoder().decode(T.self, from: data) {
            return decoded
        }
        // Retry stripping trailing commas before ] or }
        let repaired = slice.replacingOccurrences(of: #",\s*([}\]])"#, with: "$1", options: .regularExpression)
        if let data = repaired.data(using: .utf8),
           let decoded = try? JSONDecoder().decode(T.self, from: data) {
            return decoded
        }
        return nil
    }

    private func sanitizeQuestions(_ raw: [RawQuestion]?, prefix: String, limit: Int) -> [ExamObjectiveQuestion] {
        guard let raw else { return [] }
        var out: [ExamObjectiveQuestion] = []
        for item in raw {
            if out.count >= limit { break }
            let prompt = (item.prompt ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            let opts = (item.options ?? []).map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }
            guard !prompt.isEmpty, opts.count >= 2 else { continue }
            let idx = max(0, min(opts.count - 1, item.correctIndex ?? 0))
            let explanation = nonEmpty(item.explanation, fallback: "Correct answer: \(opts[idx]).")
            out.append(
                ExamObjectiveQuestion(
                    id: "\(prefix)-q\(out.count + 1)",
                    prompt: prompt,
                    options: opts,
                    correctIndex: idx,
                    explanation: explanation
                )
            )
        }
        return out
    }

    private func nonEmpty(_ value: String?, fallback: String) -> String {
        let trimmed = value?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        return trimmed.isEmpty ? fallback : trimmed
    }

    private static func targetAccents(for languageId: String, seed: Int) -> [String] {
        if languageId == "german" {
            return ["de-DE", "de-AT", "de-CH"]
        }
        let sets: [[String]] = [
            ["en-GB", "en-AU", "en-US"],
            ["en-GB", "en-IE", "en-IN"],
            ["en-US", "en-GB", "en-ZA"],
            ["en-GB", "en-US", "en-AU"]
        ]
        return sets[seed % sets.count]
    }
}
