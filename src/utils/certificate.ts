import {
  CEFRLevel,
  ExamAttemptRecord,
  OfficialRubricBreakdown,
  SkillType,
} from '../types';
import {
  getLearningLanguageMeta,
  LearningLanguageId,
  normalizeLearningLanguageId,
} from '../data/languages';
import { computeOfficialGradeLabel } from './examScoring';

export type CertificateHonorsTier = 'highest-distinction' | 'distinction' | 'merit' | 'pass';

export interface CertificateSkillDetail {
  skill: SkillType;
  englishLabel: string;
  nativeLabel: string;
  score: number;
  passed: boolean;
  aiGraded: boolean;
  feedback: string;
  rubric?: OfficialRubricBreakdown;
}

export interface CertificateSignatory {
  name: string;
  title: string;
  division: string;
}

export interface LinguaVerveCertificate {
  certificateId: string;
  verificationCode: string;
  attemptId: string;
  recipientName: string;
  hasCustomRecipientName: boolean;
  languageId: LearningLanguageId;
  languageName: string;
  languageNativeName: string;
  languageFlag: string;
  documentHeader: string;
  documentSubtitle: string;
  certifyingPhrase: string;
  level: CEFRLevel;
  cefrBandTitle: string;
  frameworkEquivalence: string;
  cefrCanDoStatement: string;
  examTitle: string;
  alignedCertificate: string;
  overallScore: number;
  passingScorePercent: number;
  officialGradeLabel: string;
  honorsTier: CertificateHonorsTier;
  honorsTitle: string;
  honorsNativeLabel: string;
  skills: CertificateSkillDetail[];
  examModeLabel: string;
  durationFormatted: string;
  issueDateFormatted: string;
  issueDateCompact: string;
  gradingAuthority: string;
  strongestSkill: SkillType;
  nextMilestoneLevel?: CEFRLevel;
  encouragementHeadline: string;
  encouragementMessage: string;
  signatories: CertificateSignatory[];
  authenticityNotice: string;
  plainTextCredential: string;
}

const CEFR_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const CEFR_BAND_TITLES: Record<CEFRLevel, string> = {
  A1: 'Breakthrough · Basic User',
  A2: 'Waystage · Elementary User',
  B1: 'Threshold · Independent User',
  B2: 'Vantage · Upper-Intermediate User',
  C1: 'Effective Operational Proficiency · Advanced User',
  C2: 'Mastery · Near-Native Proficient User',
};

const CEFR_CAN_DO_STATEMENTS: Record<CEFRLevel, string> = {
  A1: 'Can understand and use familiar everyday expressions and basic phrases aimed at the satisfaction of concrete needs, introduce oneself and others, and interact in a simple way.',
  A2: 'Can understand sentences and frequently used expressions related to areas of immediate relevance and communicate in simple, routine tasks requiring direct exchange of information.',
  B1: 'Can understand the main points of clear standard input on familiar matters, deal with most situations likely to arise while travelling or working, and produce connected text with reasons and explanations.',
  B2: 'Can understand the main ideas of complex texts on concrete and abstract topics, interact with a degree of fluency and spontaneity, and produce clear, detailed argumentation across viewpoints.',
  C1: 'Can understand a wide range of demanding, longer texts, recognize implicit meaning, express ideas fluently and spontaneously without much obvious searching, and use language flexibly for academic and professional purposes.',
  C2: 'Can understand with ease virtually everything heard or read, summarize information from diverse spoken and written sources, and express oneself spontaneously, very fluently, and precisely in the most complex situations.',
};

const DOCUMENT_HEADERS: Record<LearningLanguageId, { header: string; subtitle: string; phrase: string }> = {
  english: {
    header: 'CERTIFICATE OF ENGLISH PROFICIENCY',
    subtitle: 'OFFICIAL SIMULATED 4-SKILL EXAMINATION DIPLOMA',
    phrase: 'This is to certify that',
  },
  german: {
    header: 'ZERTIFIKAT · SPRACHPRÜFUNG DEUTSCH',
    subtitle: 'OFFICIAL SIMULATED 4-SKILL EXAMINATION DIPLOMA',
    phrase: 'Hiermit wird bescheinigt · This is to certify that',
  },
  french: {
    header: 'DIPLÔME DE COMPÉTENCE EN LANGUE FRANÇAISE',
    subtitle: 'OFFICIAL SIMULATED 4-SKILL EXAMINATION DIPLOMA',
    phrase: 'Le jury certifie que · This is to certify that',
  },
  japanese: {
    header: '日本語能力認定証 · CERTIFICATE OF JAPANESE PROFICIENCY',
    subtitle: 'OFFICIAL SIMULATED 4-SKILL EXAMINATION DIPLOMA',
    phrase: '下記の者は本試験に合格したことを証します · This is to certify that',
  },
};

const NATIVE_SKILL_LABELS: Record<LearningLanguageId, Record<SkillType, { en: string; native: string }>> = {
  english: {
    reading: { en: 'Reading', native: 'Reading & Use of English' },
    listening: { en: 'Listening', native: 'Listening Comprehension' },
    writing: { en: 'Writing', native: 'Written Production' },
    speaking: { en: 'Speaking', native: 'Oral Interaction' },
  },
  german: {
    reading: { en: 'Reading', native: 'Lesen' },
    listening: { en: 'Listening', native: 'Hören' },
    writing: { en: 'Writing', native: 'Schreiben' },
    speaking: { en: 'Speaking', native: 'Sprechen' },
  },
  french: {
    reading: { en: 'Reading', native: 'Compréhension écrite' },
    listening: { en: 'Listening', native: 'Compréhension orale' },
    writing: { en: 'Writing', native: 'Production écrite' },
    speaking: { en: 'Speaking', native: 'Production orale' },
  },
  japanese: {
    reading: { en: 'Reading', native: '読解 (Dokkai)' },
    listening: { en: 'Listening', native: '聴解 (Chōkai)' },
    writing: { en: 'Writing', native: '作文 (Sakubun)' },
    speaking: { en: 'Speaking', native: '会話 (Kaiwa)' },
  },
};

const FRAMEWORK_EQUIVALENCE: Record<LearningLanguageId, Record<CEFRLevel, string>> = {
  english: {
    A1: 'CEFR A1 · Cambridge Pre-A1 / A1 Movers Benchmark',
    A2: 'CEFR A2 · Cambridge A2 Key (KET) · Est. IELTS 3.5–4.0',
    B1: 'CEFR B1 · Cambridge B1 Preliminary (PET) · Est. IELTS 4.5–5.0',
    B2: 'CEFR B2 · Cambridge B2 First (FCE) · Est. IELTS 5.5–6.5',
    C1: 'CEFR C1 · Cambridge C1 Advanced (CAE) · Est. IELTS 7.0–8.0',
    C2: 'CEFR C2 · Cambridge C2 Proficiency (CPE) · Est. IELTS 8.5–9.0',
  },
  german: {
    A1: 'GER A1 · Goethe-Zertifikat A1: Start Deutsch 1 / telc Deutsch A1',
    A2: 'GER A2 · Goethe-Zertifikat A2 / telc Deutsch A2 / ÖSD ZA2',
    B1: 'GER B1 · Goethe-Zertifikat B1 / telc Deutsch B1 / ÖSD ZB1',
    B2: 'GER B2 · Goethe-Zertifikat B2 / telc Deutsch B2 / TestDaF TDN 3',
    C1: 'GER C1 · Goethe-Zertifikat C1 / telc C1 Hochschule / TestDaF TDN 4–5',
    C2: 'GER C2 · Goethe-Zertifikat C2: Großes Deutsches Sprachdiplom (GDS)',
  },
  french: {
    A1: 'CECR A1 · DELF A1 · Utilisateur Élémentaire (Découverte)',
    A2: 'CECR A2 · DELF A2 · Utilisateur Élémentaire (Survie)',
    B1: 'CECR B1 · DELF B1 · Utilisateur Indépendant (Seuil)',
    B2: 'CECR B2 · DELF B2 · Utilisateur Indépendant (Avancé)',
    C1: 'CECR C1 · DALF C1 · Utilisateur Expérimenté (Autonome)',
    C2: 'CECR C2 · DALF C2 · Utilisateur Expérimenté (Maîtrise)',
  },
  japanese: {
    A1: 'CEFR A1 · JLPT N5 (日本語能力試験 N5) · Foundation Japanese',
    A2: 'CEFR A2 · JLPT N4 (日本語能力試験 N4) · Elementary Japanese',
    B1: 'CEFR B1 · JLPT N3 (日本語能力試験 N3) · Intermediate Bridge',
    B2: 'CEFR B2 · JLPT N2 (日本語能力試験 N2) · Business & Media Fluency',
    C1: 'CEFR C1 · JLPT N1 (日本語能力試験 N1) · Advanced Academic & Executive',
    C2: 'CEFR C2 · JLPT N1+ / BJT J1+ · Native-Nuance Literary & Executive Mastery',
  },
};

function fnv1aHex(input: string, length: number): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  let hash2 = 0x811c9dc5 ^ hash;
  for (let i = input.length - 1; i >= 0; i -= 1) {
    hash2 ^= input.charCodeAt(i);
    hash2 = Math.imul(hash2, 0x01000193) >>> 0;
  }
  const combined = hash.toString(16).padStart(8, '0') + hash2.toString(16).padStart(8, '0');
  return combined.slice(0, length).toUpperCase();
}

function formatDurationHuman(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${String(secs).padStart(2, '0')}s`;
  return `${secs}s`;
}

function formatIssueDate(isoTimestamp: string): { formatted: string; compact: string } {
  const d = new Date(isoTimestamp);
  if (Number.isNaN(d.getTime())) {
    const fallback = new Date();
    const y = fallback.getUTCFullYear();
    const m = String(fallback.getUTCMonth() + 1).padStart(2, '0');
    const day = String(fallback.getUTCDate()).padStart(2, '0');
    return {
      formatted: fallback.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      compact: `${y}${m}${day}`,
    };
  }
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return {
    formatted: d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    compact: `${y}${m}${day}`,
  };
}

function computeHonors(
  languageId: LearningLanguageId,
  overallScore: number
): { tier: CertificateHonorsTier; title: string; nativeLabel: string } {
  if (overallScore >= 90) {
    const nativeMap: Record<LearningLanguageId, string> = {
      english: 'Summa Cum Laude · Honours Grade A',
      german: 'Mit Auszeichnung · Sehr gut',
      french: 'Mention Très Bien avec Félicitations',
      japanese: '最優秀合格 · Highest Distinction',
    };
    return {
      tier: 'highest-distinction',
      title: 'WITH HIGHEST DISTINCTION',
      nativeLabel: nativeMap[languageId],
    };
  }
  if (overallScore >= 80) {
    const nativeMap: Record<LearningLanguageId, string> = {
      english: 'Magna Cum Laude · High Distinction',
      german: 'Mit besonderem Erfolg · Gut',
      french: 'Mention Bien · Distinction',
      japanese: '優秀合格 · With Distinction',
    };
    return {
      tier: 'distinction',
      title: 'WITH DISTINCTION',
      nativeLabel: nativeMap[languageId],
    };
  }
  if (overallScore >= 70) {
    const nativeMap: Record<LearningLanguageId, string> = {
      english: 'Cum Laude · Merit Pass',
      german: 'Mit gutem Erfolg · Befriedigend',
      french: 'Mention Assez Bien · Mérite',
      japanese: '優良合格 · With Merit',
    };
    return {
      tier: 'merit',
      title: 'WITH MERIT',
      nativeLabel: nativeMap[languageId],
    };
  }
  const nativeMap: Record<LearningLanguageId, string> = {
    english: 'Certified Proficiency Pass',
    german: 'Bestanden · Zertifiziert',
    french: 'Admis · Certifié',
    japanese: '合格 · Certified Pass',
  };
  return {
    tier: 'pass',
    title: 'CERTIFIED PASS',
    nativeLabel: nativeMap[languageId],
  };
}

export function buildLinguaVerveCertificate(params: {
  attempt: ExamAttemptRecord;
  learnerName?: string;
  passingScorePercent?: number;
}): LinguaVerveCertificate {
  const { attempt, passingScorePercent = 60 } = params;
  const langId = normalizeLearningLanguageId(attempt.languageId);
  const langMeta = getLearningLanguageMeta(langId);
  const cleanedName = (params.learnerName || '').trim();
  const hasCustomRecipientName = cleanedName.length > 0;
  const recipientName = hasCustomRecipientName ? cleanedName : 'LinguaVerve Scholar';

  const { formatted: issueDateFormatted, compact: issueDateCompact } = formatIssueDate(attempt.timestamp);
  const seed = `${attempt.id}|${attempt.timestamp}|${langId}|${attempt.level}|${attempt.overallScore}`;
  const serialHex = fnv1aHex(seed, 6);
  const verifyHex = fnv1aHex(`VERIFY|${seed}|${attempt.examId}`, 8);
  const certificateId = `LV-${langMeta.shortCode}-${attempt.level}-${issueDateCompact}-${serialHex}`;
  const verificationCode = `VER-${verifyHex.slice(0, 4)}-${verifyHex.slice(4, 8)}`;

  const skillOrder: SkillType[] = ['reading', 'listening', 'writing', 'speaking'];
  const skills: CertificateSkillDetail[] = skillOrder.map((sk) => {
    const scoreObj = attempt.skills[sk];
    const labels = NATIVE_SKILL_LABELS[langId][sk];
    return {
      skill: sk,
      englishLabel: labels.en,
      nativeLabel: labels.native,
      score: scoreObj?.score ?? 0,
      passed: Boolean(scoreObj?.passed),
      aiGraded: Boolean(scoreObj?.aiGraded),
      feedback: scoreObj?.feedback || 'Assessed against official CEFR level rubric.',
      rubric: scoreObj?.rubric,
    };
  });

  const allModulesPassed = skills.every((s) => s.passed);
  const officialGradeLabel =
    attempt.officialGradeLabel && attempt.officialGradeLabel.trim().length > 0
      ? attempt.officialGradeLabel
      : computeOfficialGradeLabel({
          languageId: langId,
          level: attempt.level,
          overallScore: attempt.overallScore,
          allModulesPassed,
          passingScorePercent,
        });

  const honors = computeHonors(langId, attempt.overallScore);
  const headerInfo = DOCUMENT_HEADERS[langId];
  const strongest = [...skills].sort((a, b) => b.score - a.score)[0] || skills[0];
  const currentIdx = CEFR_ORDER.indexOf(attempt.level);
  const nextMilestoneLevel =
    currentIdx >= 0 && currentIdx < CEFR_ORDER.length - 1 ? CEFR_ORDER[currentIdx + 1] : undefined;

  const hasAIGrading =
    Boolean(attempt.aiAssessment && attempt.aiAssessment.source === 'ai') ||
    skills.some((s) => s.aiGraded);
  const gradingAuthority = attempt.aiAssessment?.providerLabel
    ? `${attempt.aiAssessment.providerLabel} · CEFR Rubric Board`
    : hasAIGrading
    ? 'AI Examiner + Official CEFR Rubric Board'
    : 'LinguaVerve Official 4-Skill CEFR Rubric Board';

  const examModeLabel =
    attempt.mode === 'strict'
      ? 'Strict Timed Examination · Modular 4-Skill Pass Gate'
      : 'Guided Certification Simulation · All 4 Skills Assessed';

  const encouragementHeadline =
    honors.tier === 'highest-distinction'
      ? `Extraordinary ${langMeta.name} ${attempt.level} Mastery!`
      : honors.tier === 'distinction'
      ? `Outstanding ${langMeta.name} ${attempt.level} Performance!`
      : honors.tier === 'merit'
      ? `Impressive ${langMeta.name} ${attempt.level} Achievement!`
      : `Congratulations — ${langMeta.name} ${attempt.level} Passed!`;

  const nextStepNote = nextMilestoneLevel
    ? `Carry this momentum straight into your ${langMeta.name} ${nextMilestoneLevel} Intensive Course or book your official ${attempt.alignedCertificate} sitting with confidence.`
    : `Reaching ${attempt.level} Mastery places you at the pinnacle of international ${langMeta.name} fluency — celebrate this extraordinary milestone!`;

  const encouragementMessage = `You conquered all four core competencies with an overall score of ${attempt.overallScore}% (${officialGradeLabel}), led by a standout ${strongest.score}% in ${strongest.englishLabel}. ${nextStepNote}`;

  const signatories: CertificateSignatory[] = [
    {
      name: 'Dr. Elena Lindholm',
      title: 'Director of Academic Assessment',
      division: 'LinguaVerve Examination Board',
    },
    {
      name: 'Board of CEFR Examiners',
      title: 'Chief Certification Panel',
      division: `${langMeta.name} Polyglot Division`,
    },
  ];

  const authenticityNotice =
    'Official Simulated Proficiency Credential issued by LinguaVerve Academy aligned with CEFR and international exam benchmarks. Intended for personal milestone recognition and study portfolios; not a government-issued visa or legal document.';

  const plainTextCredential = [
    '══════════════════════════════════════════════════════',
    `LINGUAVERVE ACADEMY — ${headerInfo.header}`,
    '══════════════════════════════════════════════════════',
    `Recipient:          ${recipientName}`,
    `Credential ID:      ${certificateId}`,
    `Verification Code:  ${verificationCode}`,
    `Language & Level:   ${langMeta.flag} ${langMeta.name} (${attempt.level} — ${CEFR_BAND_TITLES[attempt.level]})`,
    `Aligned Exam:       ${attempt.alignedCertificate}`,
    `Honours Standing:   ${honors.title} (${honors.nativeLabel})`,
    `Official Result:    ${attempt.overallScore}/100 — ${officialGradeLabel}`,
    `Date Issued:        ${issueDateFormatted}`,
    `Conditions:         ${examModeLabel} (${formatDurationHuman(attempt.durationUsedSeconds)})`,
    '',
    '4-Skill Transcript:',
    ...skills.map(
      (s) =>
        `  • ${s.englishLabel} (${s.nativeLabel}): ${s.score}/100 [${s.passed ? 'PASS' : 'FAIL'}]`
    ),
    '',
    `CEFR Can-Do (${attempt.level}): ${CEFR_CAN_DO_STATEMENTS[attempt.level]}`,
    '══════════════════════════════════════════════════════',
  ].join('\n');

  return {
    certificateId,
    verificationCode,
    attemptId: attempt.id,
    recipientName,
    hasCustomRecipientName,
    languageId: langId,
    languageName: langMeta.name,
    languageNativeName: langMeta.nativeName,
    languageFlag: langMeta.flag,
    documentHeader: headerInfo.header,
    documentSubtitle: headerInfo.subtitle,
    certifyingPhrase: headerInfo.phrase,
    level: attempt.level,
    cefrBandTitle: CEFR_BAND_TITLES[attempt.level],
    frameworkEquivalence: FRAMEWORK_EQUIVALENCE[langId][attempt.level],
    cefrCanDoStatement: CEFR_CAN_DO_STATEMENTS[attempt.level],
    examTitle: attempt.examTitle,
    alignedCertificate: attempt.alignedCertificate,
    overallScore: attempt.overallScore,
    passingScorePercent,
    officialGradeLabel,
    honorsTier: honors.tier,
    honorsTitle: honors.title,
    honorsNativeLabel: honors.nativeLabel,
    skills,
    examModeLabel,
    durationFormatted: formatDurationHuman(attempt.durationUsedSeconds),
    issueDateFormatted,
    issueDateCompact,
    gradingAuthority,
    strongestSkill: strongest.skill,
    nextMilestoneLevel,
    encouragementHeadline,
    encouragementMessage,
    signatories,
    authenticityNotice,
    plainTextCredential,
  };
}

function escapeXml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapTextLines(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = w;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  return lines;
}

/**
 * Generates a crisp, self-contained 1600×1130 vector SVG archival certificate
 * suitable for instant SVG download, 2x retina PNG rasterization, or landscape PDF printing.
 */
export function buildCertificateSVG(cert: LinguaVerveCertificate): string {
  const canDoLines = wrapTextLines(cert.cefrCanDoStatement, 108, 2);
  const skillCardY = 602;
  const skillCardW = 334;
  const skillCardGap = 18;
  const skillStartX = 105;

  const skillCardsXml = cert.skills
    .map((s, idx) => {
      const x = skillStartX + idx * (skillCardW + skillCardGap);
      const fillBarW = Math.max(8, Math.round(((skillCardW - 36) * Math.min(100, s.score)) / 100));
      const barColor = s.score >= 85 ? '#0F8B6D' : s.score >= 70 ? '#1D6FA5' : '#C28622';
      const rubricLine = s.rubric
        ? `Task ${s.rubric.taskFulfillment}% · Coh ${s.rubric.coherenceCohesion}% · Lex ${s.rubric.lexicalRange}% · Gram ${s.rubric.grammaticalAccuracy}%`
        : s.passed
        ? 'CEFR Modular Requirement Met'
        : 'Assessed Skill';

      return `
    <g transform="translate(${x}, ${skillCardY})">
      <rect x="0" y="0" width="${skillCardW}" height="122" rx="12" fill="#FFFFFF" stroke="#D9C598" stroke-width="1.5" />
      <text x="18" y="28" font-family="Georgia, 'Times New Roman', serif" font-size="15" font-weight="700" fill="#101828">${escapeXml(s.englishLabel.toUpperCase())}</text>
      <text x="18" y="47" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12.5" fill="#64748B">${escapeXml(s.nativeLabel)}</text>
      <text x="${skillCardW - 18}" y="38" text-anchor="end" font-family="'SF Mono', Menlo, monospace" font-size="26" font-weight="800" fill="#0F172A">${s.score}<tspan font-size="13" fill="#64748B">/100</tspan></text>
      <rect x="18" y="64" width="${skillCardW - 36}" height="8" rx="4" fill="#EFE7D6" />
      <rect x="18" y="64" width="${fillBarW}" height="8" rx="4" fill="${barColor}" />
      <text x="18" y="92" font-family="'SF Mono', Menlo, monospace" font-size="10.5" font-weight="700" fill="#0F766E">✓ ${s.passed ? 'PASSED' : 'RECORDED'}${s.aiGraded ? ' · AI EXAMINER' : ''}</text>
      <text x="18" y="109" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10.5" fill="#64748B">${escapeXml(rubricLine.slice(0, 48))}</text>
    </g>`;
    })
    .join('\n');

  const canDoTspans = canDoLines
    .map(
      (line, i) =>
        `<tspan x="800" dy="${i === 0 ? 0 : 20}">${escapeXml(line)}</tspan>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1130" width="1600" height="1130">
  <defs>
    <linearGradient id="parchment" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDFBF5" />
      <stop offset="50%" stop-color="#FAF5E8" />
      <stop offset="100%" stop-color="#F6EEDB" />
    </linearGradient>
    <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D7A742" />
      <stop offset="50%" stop-color="#F2D178" />
      <stop offset="100%" stop-color="#A8741C" />
    </linearGradient>
    <linearGradient id="navyRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="50%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <radialGradient id="goldSeal" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#FFF2B8" />
      <stop offset="52%" stop-color="#E5B443" />
      <stop offset="100%" stop-color="#9E6A12" />
    </radialGradient>
  </defs>

  <!-- Archival Parchment Base -->
  <rect x="0" y="0" width="1600" height="1130" fill="url(#parchment)" />

  <!-- Subtle Watermark Crest -->
  <g opacity="0.045" transform="translate(800, 565)">
    <circle cx="0" cy="0" r="280" fill="none" stroke="#1E293B" stroke-width="10" />
    <circle cx="0" cy="0" r="228" fill="none" stroke="#C28622" stroke-width="4" stroke-dasharray="10 8" />
    <ellipse cx="0" cy="0" rx="260" ry="90" transform="rotate(24)" fill="none" stroke="#1E293B" stroke-width="8" />
    <text x="0" y="55" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="180" font-weight="700" fill="#0F172A">LV</text>
  </g>

  <!-- Official Outer & Inner Guilloché Borders -->
  <rect x="32" y="32" width="1536" height="1066" rx="16" fill="none" stroke="#0F172A" stroke-width="6" />
  <rect x="46" y="46" width="1508" height="1038" rx="12" fill="none" stroke="url(#goldBorder)" stroke-width="4" />
  <rect x="60" y="60" width="1480" height="1010" rx="8" fill="none" stroke="#C9A24B" stroke-width="1.25" stroke-dasharray="6 4" />

  <!-- Corner Filigree Ornaments -->
  <g stroke="#B8862B" stroke-width="2.5" fill="none">
    <path d="M 76 116 L 76 76 L 116 76" />
    <path d="M 1484 76 L 1524 76 L 1524 116" />
    <path d="M 76 1014 L 76 1054 L 116 1054" />
    <path d="M 1484 1054 L 1524 1054 L 1524 1014" />
  </g>

  <!-- Top Institution Crest & Official Header -->
  <g transform="translate(756, 82)">
    <rect x="0" y="0" width="88" height="88" rx="20" fill="#0C1221" stroke="#EAB949" stroke-width="3" />
    <ellipse cx="44" cy="45" rx="31" ry="11" transform="rotate(24 44 45)" fill="none" stroke="#38BDF8" stroke-opacity="0.7" stroke-width="2.5" />
    <text x="44" y="58" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="36" font-weight="700" fill="#F4CF70">LV</text>
  </g>

  <text x="800" y="200" text-anchor="middle" font-family="'SF Mono', Menlo, monospace" font-size="14" font-weight="700" letter-spacing="4.5" fill="#9A6B16">LINGUAVERVE ACADEMY OF LANGUAGES · EXAMINATION BOARD</text>
  <text x="800" y="242" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="34" font-weight="700" letter-spacing="1.2" fill="#0F172A">${escapeXml(cert.documentHeader)}</text>
  <text x="800" y="268" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="13" font-weight="600" letter-spacing="2.2" fill="#475569">${escapeXml(cert.documentSubtitle)}</text>

  <!-- Gold Divider Line -->
  <line x1="280" y1="288" x2="1320" y2="288" stroke="url(#goldBorder)" stroke-width="2" />

  <!-- Certifying Phrase + Recipient Name -->
  <text x="800" y="324" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="18" fill="#475569">${escapeXml(cert.certifyingPhrase)}</text>
  <text x="800" y="388" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="54" font-weight="700" fill="#0C1221">${escapeXml(cert.recipientName)}</text>
  <line x1="410" y1="406" x2="1190" y2="406" stroke="#C9A24B" stroke-width="1.5" />

  <!-- Achievement Summary & CEFR Medallion Bar -->
  <text x="800" y="440" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="17" fill="#334155">has successfully completed and passed the full 4-Skill Simulated Certification Examination in</text>
  <text x="800" y="476" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="28" font-weight="700" fill="#0F172A">${escapeXml(cert.languageName)} (${escapeXml(cert.languageNativeName)}) — Level ${escapeXml(cert.level)} · ${escapeXml(cert.cefrBandTitle)}</text>
  <text x="800" y="504" text-anchor="middle" font-family="'SF Mono', Menlo, monospace" font-size="14" font-weight="700" fill="#1D4ED8">${escapeXml(cert.frameworkEquivalence)}</text>

  <!-- Honours Ribbon + Overall Score Pill -->
  <rect x="255" y="524" width="1090" height="54" rx="27" fill="url(#navyRibbon)" stroke="#E4BA52" stroke-width="2" />
  <text x="800" y="557" text-anchor="middle" font-family="'SF Mono', Menlo, monospace" font-size="16" font-weight="700" letter-spacing="1.2" fill="#F8DE8C">★  ${escapeXml(cert.honorsTitle)}  ·  OVERALL ${cert.overallScore}/100  ·  ${escapeXml(cert.officialGradeLabel)}  ★</text>

  <!-- 4-Skill Official Score Breakdown Cards -->
  ${skillCardsXml}

  <!-- Official CEFR Can-Do Descriptor Box -->
  <rect x="105" y="742" width="1390" height="72" rx="10" fill="#F4ECDA" stroke="#D9C598" stroke-width="1.2" />
  <text x="800" y="764" text-anchor="middle" font-family="'SF Mono', Menlo, monospace" font-size="11.5" font-weight="700" letter-spacing="1.6" fill="#8C5D0E">OFFICIAL CEFR ${escapeXml(cert.level)} CAN-DO COMPETENCY DESCRIPTOR</text>
  <text x="800" y="786" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="14" fill="#1E293B">${canDoTspans}</text>

  <!-- Examination Metadata Strip -->
  <g font-family="'SF Mono', Menlo, monospace" font-size="12" fill="#334155">
    <text x="110" y="846"><tspan font-weight="700" fill="#0F172A">DATE ISSUED:</tspan> ${escapeXml(cert.issueDateFormatted)}</text>
    <text x="480" y="846"><tspan font-weight="700" fill="#0F172A">ALIGNED EXAM:</tspan> ${escapeXml(cert.alignedCertificate.slice(0, 44))}</text>
    <text x="1080" y="846"><tspan font-weight="700" fill="#0F172A">DURATION:</tspan> ${escapeXml(cert.durationFormatted)} · PASS ≥ ${cert.passingScorePercent}%</text>
    <text x="110" y="868"><tspan font-weight="700" fill="#0F172A">CONDITIONS:</tspan> ${escapeXml(cert.examModeLabel)}</text>
    <text x="1080" y="868"><tspan font-weight="700" fill="#0F172A">CREDENTIAL ID:</tspan> ${escapeXml(cert.certificateId)}</text>
  </g>

  <!-- Bottom Signatories + Embossed Official Gold Seal -->
  <g transform="translate(0, 910)">
    <!-- Left Signatory -->
    <text x="310" y="34" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="28" fill="#1E293B">Elena Lindholm</text>
    <line x1="150" y1="48" x2="470" y2="48" stroke="#94A3B8" stroke-width="1.5" />
    <text x="310" y="70" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" font-weight="700" fill="#0F172A">${escapeXml(cert.signatories[0].name)}</text>
    <text x="310" y="89" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" fill="#475569">${escapeXml(cert.signatories[0].title)} · ${escapeXml(cert.signatories[0].division)}</text>

    <!-- Center Gold Embossed Seal -->
    <g transform="translate(800, 44)">
      <circle cx="0" cy="0" r="62" fill="url(#goldSeal)" stroke="#8B5A08" stroke-width="3" />
      <circle cx="0" cy="0" r="52" fill="none" stroke="#FFF4C2" stroke-width="1.5" stroke-dasharray="4 3" />
      <circle cx="0" cy="0" r="42" fill="#0C1221" stroke="#F5D376" stroke-width="2" />
      <text x="0" y="-11" text-anchor="middle" font-family="'SF Mono', Menlo, monospace" font-size="10" font-weight="700" letter-spacing="1.4" fill="#F5D376">CERTIFIED</text>
      <text x="0" y="15" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="28" font-weight="700" fill="#FFFFFF">${escapeXml(cert.level)}</text>
      <text x="0" y="31" text-anchor="middle" font-family="'SF Mono', Menlo, monospace" font-size="9" font-weight="700" fill="#38BDF8">LINGUAVERVE</text>
    </g>

    <!-- Right Signatory -->
    <text x="1290" y="34" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="26" fill="#1E293B">CEFR Examination Panel</text>
    <line x1="1130" y1="48" x2="1450" y2="48" stroke="#94A3B8" stroke-width="1.5" />
    <text x="1290" y="70" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" font-weight="700" fill="#0F172A">${escapeXml(cert.signatories[1].name)}</text>
    <text x="1290" y="89" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" fill="#475569">${escapeXml(cert.signatories[1].title)} · ${escapeXml(cert.signatories[1].division)}</text>
  </g>

  <!-- Archival Verification Footer -->
  <text x="800" y="1044" text-anchor="middle" font-family="'SF Mono', Menlo, monospace" font-size="10.5" fill="#64748B">VERIFICATION: ${escapeXml(cert.verificationCode)}  ·  GRADING: ${escapeXml(cert.gradingAuthority.slice(0, 62))}</text>
  <text x="800" y="1062" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="10" fill="#64748B">${escapeXml(cert.authenticityNotice)}</text>
</svg>`;
}
