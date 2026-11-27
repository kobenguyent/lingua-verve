import Foundation

public enum CertificateHonorsTier: String, Codable, Equatable, Sendable {
    case highestDistinction = "highest-distinction"
    case distinction
    case merit
    case pass
}

public struct CertificateSkillDetail: Identifiable, Equatable, Sendable {
    public var id: String { skill.rawValue }
    public let skill: SkillType
    public let englishLabel: String
    public let nativeLabel: String
    public let score: Int
    public let passed: Bool
    public let aiGraded: Bool
    public let feedback: String
    public let rubric: OfficialRubricBreakdown?

    public init(
        skill: SkillType,
        englishLabel: String,
        nativeLabel: String,
        score: Int,
        passed: Bool,
        aiGraded: Bool,
        feedback: String,
        rubric: OfficialRubricBreakdown? = nil
    ) {
        self.skill = skill
        self.englishLabel = englishLabel
        self.nativeLabel = nativeLabel
        self.score = score
        self.passed = passed
        self.aiGraded = aiGraded
        self.feedback = feedback
        self.rubric = rubric
    }
}

public struct CertificateSignatory: Identifiable, Equatable, Sendable {
    public var id: String { name }
    public let name: String
    public let signatureText: String
    public let title: String
    public let division: String

    public init(name: String, signatureText: String, title: String, division: String) {
        self.name = name
        self.signatureText = signatureText
        self.title = title
        self.division = division
    }
}

public struct LinguaVerveCertificate: Identifiable, Equatable, Sendable {
    public var id: String { certificateId }
    public let certificateId: String
    public let verificationCode: String
    public let attemptId: String
    public let recipientName: String
    public let hasCustomRecipientName: Bool
    public let language: LearningLanguage
    public let documentHeader: String
    public let documentSubtitle: String
    public let certifyingPhrase: String
    public let level: CEFRLevel
    public let cefrBandTitle: String
    public let frameworkEquivalence: String
    public let cefrCanDoStatement: String
    public let examTitle: String
    public let alignedCertificate: String
    public let overallScore: Int
    public let passingScorePercent: Int
    public let officialGradeLabel: String
    public let honorsTier: CertificateHonorsTier
    public let honorsTitle: String
    public let honorsNativeLabel: String
    public let skills: [CertificateSkillDetail]
    public let examModeLabel: String
    public let durationFormatted: String
    public let issueDateFormatted: String
    public let issueDateCompact: String
    public let gradingAuthority: String
    public let strongestSkill: SkillType
    public let nextMilestoneLevel: CEFRLevel?
    public let encouragementHeadline: String
    public let encouragementMessage: String
    public let signatories: [CertificateSignatory]
    public let authenticityNotice: String
    public let plainTextCredential: String
}

/// Deterministic official-style simulated proficiency certificate builder with 100% Web parity.
public enum CertificateService {
    public static func buildCertificate(
        for attempt: ExamAttemptRecord,
        learnerName: String? = nil,
        passingScorePercent: Int = 60
    ) -> LinguaVerveCertificate {
        let lang = LearningLanguage.from(attempt.languageId)
        let cleanedName = (learnerName ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let hasCustomName = !cleanedName.isEmpty
        let recipientName = hasCustomName ? cleanedName : "LinguaVerve Scholar"

        let dateInfo = formatIssueDate(attempt.timestamp)
        let seed = "\(attempt.id)|\(attempt.timestamp)|\(lang.rawValue)|\(attempt.level.rawValue)|\(attempt.overallScore)"
        let serialHex = fnv1aHex(seed, length: 6)
        let verifyHex = fnv1aHex("VERIFY|\(seed)|\(attempt.examId)", length: 8)
        let certificateId = "LV-\(lang.shortCode)-\(attempt.level.rawValue)-\(dateInfo.compact)-\(serialHex)"
        let verificationCode = "VER-\(verifyHex.prefix(4))-\(verifyHex.dropFirst(4))"

        let skills: [CertificateSkillDetail] = SkillType.allCases.map { sk in
            let scoreObj = attempt.skills[sk.rawValue]
            let labels = nativeSkillLabels(language: lang, skill: sk)
            return CertificateSkillDetail(
                skill: sk,
                englishLabel: labels.en,
                nativeLabel: labels.native,
                score: scoreObj?.score ?? 0,
                passed: scoreObj?.passed ?? false,
                aiGraded: scoreObj?.aiGraded ?? false,
                feedback: scoreObj?.feedback ?? "Assessed against official CEFR level rubric.",
                rubric: scoreObj?.rubric
            )
        }

        let allModulesPassed = skills.allSatisfy(\.passed)
        let officialGradeLabel: String
        if let existing = attempt.officialGradeLabel?.trimmingCharacters(in: .whitespacesAndNewlines), !existing.isEmpty {
            officialGradeLabel = existing
        } else {
            officialGradeLabel = MockExam.officialGradeLabel(
                languageId: lang.rawValue,
                level: attempt.level,
                overallScore: attempt.overallScore,
                allModulesPassed: allModulesPassed,
                passingScorePercent: passingScorePercent
            )
        }

        let honors = computeHonors(language: lang, overallScore: attempt.overallScore)
        let header = documentHeaderInfo(for: lang)
        let bandTitle = cefrBandTitle(for: attempt.level)
        let equivalence = frameworkEquivalence(language: lang, level: attempt.level)
        let canDo = cefrCanDoStatement(for: attempt.level)
        let strongest = skills.max(by: { $0.score < $1.score }) ?? skills[0]

        let allLevels = CEFRLevel.allCases
        let nextLevel: CEFRLevel? = {
            guard let idx = allLevels.firstIndex(of: attempt.level), idx + 1 < allLevels.count else {
                return nil
            }
            return allLevels[idx + 1]
        }()

        let hasAIGrading = (attempt.aiAssessment?.source == "ai") || skills.contains(where: \.aiGraded)
        let gradingAuthority: String
        if let providerLabel = attempt.aiAssessment?.providerLabel, !providerLabel.isEmpty {
            gradingAuthority = "\(providerLabel) · CEFR Rubric Board"
        } else if hasAIGrading {
            gradingAuthority = "AI Examiner + Official CEFR Rubric Board"
        } else {
            gradingAuthority = "LinguaVerve Official 4-Skill CEFR Rubric Board"
        }

        let examModeLabel = attempt.mode == "strict"
            ? "Strict Timed Examination · Modular 4-Skill Pass Gate"
            : "Guided Certification Simulation · All 4 Skills Assessed"

        let durationFormatted = formatDuration(attempt.durationUsedSeconds)

        let encouragementHeadline: String
        switch honors.tier {
        case .highestDistinction:
            encouragementHeadline = "Extraordinary \(lang.name) \(attempt.level.rawValue) Mastery!"
        case .distinction:
            encouragementHeadline = "Outstanding \(lang.name) \(attempt.level.rawValue) Performance!"
        case .merit:
            encouragementHeadline = "Impressive \(lang.name) \(attempt.level.rawValue) Achievement!"
        case .pass:
            encouragementHeadline = "Congratulations — \(lang.name) \(attempt.level.rawValue) Passed!"
        }

        let nextStepNote: String
        if let nextLevel {
            nextStepNote = "Carry this momentum straight into your \(lang.name) \(nextLevel.rawValue) Intensive Course or book your official \(attempt.alignedCertificate) sitting with confidence."
        } else {
            nextStepNote = "Reaching \(attempt.level.rawValue) Mastery places you at the pinnacle of international \(lang.name) fluency — celebrate this extraordinary milestone!"
        }

        let encouragementMessage = "You conquered all four core competencies with an overall score of \(attempt.overallScore)% (\(officialGradeLabel)), led by a standout \(strongest.score)% in \(strongest.englishLabel). \(nextStepNote)"

        let signatories = [
            CertificateSignatory(
                name: "Dr. Elena Lindholm",
                signatureText: "Elena Lindholm",
                title: "Director of Academic Assessment",
                division: "LinguaVerve Examination Board"
            ),
            CertificateSignatory(
                name: "Board of CEFR Examiners",
                signatureText: "CEFR Examination Panel",
                title: "Chief Certification Panel",
                division: "\(lang.name) Polyglot Division"
            )
        ]

        let authenticityNotice = "Official Simulated Proficiency Credential issued by LinguaVerve Academy aligned with CEFR and international exam benchmarks. Intended for personal milestone recognition and study portfolios; not a government-issued visa or legal document."

        var textLines = [
            "══════════════════════════════════════════════════════",
            "LINGUAVERVE ACADEMY — \(header.header)",
            "══════════════════════════════════════════════════════",
            "Recipient:          \(recipientName)",
            "Credential ID:      \(certificateId)",
            "Verification Code:  \(verificationCode)",
            "Language & Level:   \(lang.flag) \(lang.name) (\(attempt.level.rawValue) — \(bandTitle))",
            "Aligned Exam:       \(attempt.alignedCertificate)",
            "Honours Standing:   \(honors.title) (\(honors.nativeLabel))",
            "Official Result:    \(attempt.overallScore)/100 — \(officialGradeLabel)",
            "Date Issued:        \(dateInfo.formatted)",
            "Conditions:         \(examModeLabel) (\(durationFormatted))",
            "",
            "4-Skill Transcript:"
        ]
        for s in skills {
            textLines.append("  • \(s.englishLabel) (\(s.nativeLabel)): \(s.score)/100 [\(s.passed ? "PASS" : "FAIL")]")
        }
        textLines.append("")
        textLines.append("CEFR Can-Do (\(attempt.level.rawValue)): \(canDo)")
        textLines.append("══════════════════════════════════════════════════════")

        return LinguaVerveCertificate(
            certificateId: certificateId,
            verificationCode: verificationCode,
            attemptId: attempt.id,
            recipientName: recipientName,
            hasCustomRecipientName: hasCustomName,
            language: lang,
            documentHeader: header.header,
            documentSubtitle: header.subtitle,
            certifyingPhrase: header.phrase,
            level: attempt.level,
            cefrBandTitle: bandTitle,
            frameworkEquivalence: equivalence,
            cefrCanDoStatement: canDo,
            examTitle: attempt.examTitle,
            alignedCertificate: attempt.alignedCertificate,
            overallScore: attempt.overallScore,
            passingScorePercent: passingScorePercent,
            officialGradeLabel: officialGradeLabel,
            honorsTier: honors.tier,
            honorsTitle: honors.title,
            honorsNativeLabel: honors.nativeLabel,
            skills: skills,
            examModeLabel: examModeLabel,
            durationFormatted: durationFormatted,
            issueDateFormatted: dateInfo.formatted,
            issueDateCompact: dateInfo.compact,
            gradingAuthority: gradingAuthority,
            strongestSkill: strongest.skill,
            nextMilestoneLevel: nextLevel,
            encouragementHeadline: encouragementHeadline,
            encouragementMessage: encouragementMessage,
            signatories: signatories,
            authenticityNotice: authenticityNotice,
            plainTextCredential: textLines.joined(separator: "\n")
        )
    }

    // MARK: - Deterministic Helpers

    private static func fnv1aHex(_ input: String, length: Int) -> String {
        let utf16Units = Array(input.utf16)
        var hash: UInt32 = 0x811c9dc5
        for unit in utf16Units {
            hash ^= UInt32(unit)
            hash = hash &* 0x01000193
        }
        var hash2: UInt32 = 0x811c9dc5 ^ hash
        for unit in utf16Units.reversed() {
            hash2 ^= UInt32(unit)
            hash2 = hash2 &* 0x01000193
        }
        let combined = String(format: "%08X%08X", hash, hash2)
        return String(combined.prefix(length))
    }

    private static func formatDuration(_ totalSeconds: Int) -> String {
        let safe = max(0, totalSeconds)
        let hrs = safe / 3600
        let mins = (safe % 3600) / 60
        let secs = safe % 60
        if hrs > 0 { return "\(hrs)h \(mins)m \(secs)s" }
        if mins > 0 { return String(format: "%dm %02ds", mins, secs) }
        return "\(secs)s"
    }

    private static func formatIssueDate(_ iso: String) -> (formatted: String, compact: String) {
        let parser = ISO8601DateFormatter()
        parser.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let parsedDate = parser.date(from: iso) ?? ISO8601DateFormatter().date(from: iso) ?? Date()

        let displayFormatter = DateFormatter()
        displayFormatter.locale = Locale(identifier: "en_US_POSIX")
        displayFormatter.dateFormat = "MMMM d, yyyy"

        let compactFormatter = DateFormatter()
        compactFormatter.locale = Locale(identifier: "en_US_POSIX")
        compactFormatter.timeZone = TimeZone(secondsFromGMT: 0)
        compactFormatter.dateFormat = "yyyyMMdd"

        return (displayFormatter.string(from: parsedDate), compactFormatter.string(from: parsedDate))
    }

    private static func computeHonors(
        language: LearningLanguage,
        overallScore: Int
    ) -> (tier: CertificateHonorsTier, title: String, nativeLabel: String) {
        if overallScore >= 90 {
            let native: String
            switch language {
            case .english: native = "Summa Cum Laude · Honours Grade A"
            case .german: native = "Mit Auszeichnung · Sehr gut"
            case .french: native = "Mention Très Bien avec Félicitations"
            case .japanese: native = "最優秀合格 · Highest Distinction"
            }
            return (.highestDistinction, "WITH HIGHEST DISTINCTION", native)
        }
        if overallScore >= 80 {
            let native: String
            switch language {
            case .english: native = "Magna Cum Laude · High Distinction"
            case .german: native = "Mit besonderem Erfolg · Gut"
            case .french: native = "Mention Bien · Distinction"
            case .japanese: native = "優秀合格 · With Distinction"
            }
            return (.distinction, "WITH DISTINCTION", native)
        }
        if overallScore >= 70 {
            let native: String
            switch language {
            case .english: native = "Cum Laude · Merit Pass"
            case .german: native = "Mit gutem Erfolg · Befriedigend"
            case .french: native = "Mention Assez Bien · Mérite"
            case .japanese: native = "優良合格 · With Merit"
            }
            return (.merit, "WITH MERIT", native)
        }
        let native: String
        switch language {
        case .english: native = "Certified Proficiency Pass"
        case .german: native = "Bestanden · Zertifiziert"
        case .french: native = "Admis · Certifié"
        case .japanese: native = "合格 · Certified Pass"
        }
        return (.pass, "CERTIFIED PASS", native)
    }

    private static func documentHeaderInfo(for language: LearningLanguage) -> (header: String, subtitle: String, phrase: String) {
        switch language {
        case .english:
            return (
                "CERTIFICATE OF ENGLISH PROFICIENCY",
                "OFFICIAL SIMULATED 4-SKILL EXAMINATION DIPLOMA",
                "This is to certify that"
            )
        case .german:
            return (
                "ZERTIFIKAT · SPRACHPRÜFUNG DEUTSCH",
                "OFFICIAL SIMULATED 4-SKILL EXAMINATION DIPLOMA",
                "Hiermit wird bescheinigt · This is to certify that"
            )
        case .french:
            return (
                "DIPLÔME DE COMPÉTENCE EN LANGUE FRANÇAISE",
                "OFFICIAL SIMULATED 4-SKILL EXAMINATION DIPLOMA",
                "Le jury certifie que · This is to certify that"
            )
        case .japanese:
            return (
                "日本語能力認定証 · CERTIFICATE OF JAPANESE PROFICIENCY",
                "OFFICIAL SIMULATED 4-SKILL EXAMINATION DIPLOMA",
                "下記の者は本試験に合格したことを証します · This is to certify that"
            )
        }
    }

    private static func nativeSkillLabels(language: LearningLanguage, skill: SkillType) -> (en: String, native: String) {
        switch (language, skill) {
        case (.english, .reading): return ("Reading", "Reading & Use of English")
        case (.english, .listening): return ("Listening", "Listening Comprehension")
        case (.english, .writing): return ("Writing", "Written Production")
        case (.english, .speaking): return ("Speaking", "Oral Interaction")
        case (.german, .reading): return ("Reading", "Lesen")
        case (.german, .listening): return ("Listening", "Hören")
        case (.german, .writing): return ("Writing", "Schreiben")
        case (.german, .speaking): return ("Speaking", "Sprechen")
        case (.french, .reading): return ("Reading", "Compréhension écrite")
        case (.french, .listening): return ("Listening", "Compréhension orale")
        case (.french, .writing): return ("Writing", "Production écrite")
        case (.french, .speaking): return ("Speaking", "Production orale")
        case (.japanese, .reading): return ("Reading", "読解 (Dokkai)")
        case (.japanese, .listening): return ("Listening", "聴解 (Chōkai)")
        case (.japanese, .writing): return ("Writing", "作文 (Sakubun)")
        case (.japanese, .speaking): return ("Speaking", "会話 (Kaiwa)")
        }
    }

    private static func cefrBandTitle(for level: CEFRLevel) -> String {
        switch level {
        case .A1: return "Breakthrough · Basic User"
        case .A2: return "Waystage · Elementary User"
        case .B1: return "Threshold · Independent User"
        case .B2: return "Vantage · Upper-Intermediate User"
        case .C1: return "Effective Operational Proficiency · Advanced User"
        case .C2: return "Mastery · Near-Native Proficient User"
        }
    }

    private static func frameworkEquivalence(language: LearningLanguage, level: CEFRLevel) -> String {
        switch (language, level) {
        case (.english, .A1): return "CEFR A1 · Cambridge Pre-A1 / A1 Movers Benchmark"
        case (.english, .A2): return "CEFR A2 · Cambridge A2 Key (KET) · Est. IELTS 3.5–4.0"
        case (.english, .B1): return "CEFR B1 · Cambridge B1 Preliminary (PET) · Est. IELTS 4.5–5.0"
        case (.english, .B2): return "CEFR B2 · Cambridge B2 First (FCE) · Est. IELTS 5.5–6.5"
        case (.english, .C1): return "CEFR C1 · Cambridge C1 Advanced (CAE) · Est. IELTS 7.0–8.0"
        case (.english, .C2): return "CEFR C2 · Cambridge C2 Proficiency (CPE) · Est. IELTS 8.5–9.0"
        case (.german, .A1): return "GER A1 · Goethe-Zertifikat A1: Start Deutsch 1 / telc Deutsch A1"
        case (.german, .A2): return "GER A2 · Goethe-Zertifikat A2 / telc Deutsch A2 / ÖSD ZA2"
        case (.german, .B1): return "GER B1 · Goethe-Zertifikat B1 / telc Deutsch B1 / ÖSD ZB1"
        case (.german, .B2): return "GER B2 · Goethe-Zertifikat B2 / telc Deutsch B2 / TestDaF TDN 3"
        case (.german, .C1): return "GER C1 · Goethe-Zertifikat C1 / telc C1 Hochschule / TestDaF TDN 4–5"
        case (.german, .C2): return "GER C2 · Goethe-Zertifikat C2: Großes Deutsches Sprachdiplom (GDS)"
        case (.french, .A1): return "CECR A1 · DELF A1 · Utilisateur Élémentaire (Découverte)"
        case (.french, .A2): return "CECR A2 · DELF A2 · Utilisateur Élémentaire (Survie)"
        case (.french, .B1): return "CECR B1 · DELF B1 · Utilisateur Indépendant (Seuil)"
        case (.french, .B2): return "CECR B2 · DELF B2 · Utilisateur Indépendant (Avancé)"
        case (.french, .C1): return "CECR C1 · DALF C1 · Utilisateur Expérimenté (Autonome)"
        case (.french, .C2): return "CECR C2 · DALF C2 · Utilisateur Expérimenté (Maîtrise)"
        case (.japanese, .A1): return "CEFR A1 · JLPT N5 (日本語能力試験 N5) · Foundation Japanese"
        case (.japanese, .A2): return "CEFR A2 · JLPT N4 (日本語能力試験 N4) · Elementary Japanese"
        case (.japanese, .B1): return "CEFR B1 · JLPT N3 (日本語能力試験 N3) · Intermediate Bridge"
        case (.japanese, .B2): return "CEFR B2 · JLPT N2 (日本語能力試験 N2) · Business & Media Fluency"
        case (.japanese, .C1): return "CEFR C1 · JLPT N1 (日本語能力試験 N1) · Advanced Academic & Executive"
        case (.japanese, .C2): return "CEFR C2 · JLPT N1+ / BJT J1+ · Native-Nuance Literary & Executive Mastery"
        }
    }

    private static func cefrCanDoStatement(for level: CEFRLevel) -> String {
        switch level {
        case .A1:
            return "Can understand and use familiar everyday expressions and basic phrases aimed at the satisfaction of concrete needs, introduce oneself and others, and interact in a simple way."
        case .A2:
            return "Can understand sentences and frequently used expressions related to areas of immediate relevance and communicate in simple, routine tasks requiring direct exchange of information."
        case .B1:
            return "Can understand the main points of clear standard input on familiar matters, deal with most situations likely to arise while travelling or working, and produce connected text with reasons and explanations."
        case .B2:
            return "Can understand the main ideas of complex texts on concrete and abstract topics, interact with a degree of fluency and spontaneity, and produce clear, detailed argumentation across viewpoints."
        case .C1:
            return "Can understand a wide range of demanding, longer texts, recognize implicit meaning, express ideas fluently and spontaneously without much obvious searching, and use language flexibly for academic and professional purposes."
        case .C2:
            return "Can understand with ease virtually everything heard or read, summarize information from diverse spoken and written sources, and express oneself spontaneously, very fluently, and precisely in the most complex situations."
        }
    }
}
