import { describe, it, expect } from 'vitest';
import { ExamAttemptRecord } from '../types';
import {
  buildCertificateSVG,
  buildLinguaVerveCertificate,
} from '../utils/certificate';
import {
  createEmptyLearnerState,
  exportLearnerProgressJSON,
  parseImportedLearnerProgressJSON,
  setLearnerNameInState,
} from '../utils/progressStore';

function makePassedAttempt(overrides: Partial<ExamAttemptRecord> = {}): ExamAttemptRecord {
  return {
    id: 'attempt-cert-001',
    timestamp: '2026-11-27T14:30:00Z',
    examId: 'exam-de-b2',
    examTitle: 'Goethe-Zertifikat B2 / telc B2 Full Simulation',
    alignedCertificate: 'Goethe-Zertifikat B2 / telc Deutsch B2',
    languageId: 'german',
    level: 'B2',
    mode: 'strict',
    durationUsedSeconds: 2645,
    overallScore: 88,
    passed: true,
    officialGradeLabel: 'Goethe/telc: gut (88/100)',
    skills: {
      reading: { score: 89, passed: true, feedback: '8/9 correct (P1: 3/3 · P2: 3/3 · P3: 2/3)' },
      listening: { score: 78, passed: true, feedback: '7/9 correct (T1: 3/3 · T2: 2/3 · T3: 2/3)' },
      writing: {
        score: 91,
        passed: true,
        feedback: 'T1 (40%): 90% · T2 (60%): 92%',
        aiGraded: true,
        rubric: {
          taskFulfillment: 92,
          coherenceCohesion: 90,
          lexicalRange: 91,
          grammaticalAccuracy: 90,
        },
      },
      speaking: {
        score: 94,
        passed: true,
        feedback: 'Parts: 3/3 — Confident spontaneous argument',
        aiGraded: true,
        rubric: {
          taskFulfillment: 95,
          coherenceCohesion: 93,
          lexicalRange: 94,
          grammaticalAccuracy: 92,
        },
      },
    },
    ...overrides,
  };
}

describe('Official LinguaVerve Certificate Engine', () => {
  it('builds a deterministic official certificate with German headers, native skill labels, honours, and CEFR descriptor', () => {
    const attempt = makePassedAttempt();
    const cert1 = buildLinguaVerveCertificate({ attempt, learnerName: 'Lina Bergmann' });
    const cert2 = buildLinguaVerveCertificate({ attempt, learnerName: 'Lina Bergmann' });

    expect(cert1.certificateId).toBe(cert2.certificateId);
    expect(cert1.verificationCode).toBe(cert2.verificationCode);
    expect(cert1.certificateId).toMatch(/^LV-DE-B2-20261127-[0-9A-F]{6}$/);
    expect(cert1.verificationCode).toMatch(/^VER-[0-9A-F]{4}-[0-9A-F]{4}$/);
    expect(cert1.recipientName).toBe('Lina Bergmann');
    expect(cert1.hasCustomRecipientName).toBe(true);
    expect(cert1.documentHeader).toBe('ZERTIFIKAT · SPRACHPRÜFUNG DEUTSCH');
    expect(cert1.honorsTier).toBe('distinction');
    expect(cert1.honorsTitle).toBe('WITH DISTINCTION');
    expect(cert1.skills.map((s) => s.nativeLabel)).toEqual(['Lesen', 'Hören', 'Schreiben', 'Sprechen']);
    expect(cert1.strongestSkill).toBe('speaking');
    expect(cert1.nextMilestoneLevel).toBe('C1');
    expect(cert1.cefrCanDoStatement.length).toBeGreaterThan(40);
    expect(cert1.encouragementMessage).toContain('Speaking');
    expect(cert1.plainTextCredential).toContain(cert1.certificateId);
    expect(cert1.plainTextCredential).toContain('Lina Bergmann');
  });

  it('supports English, French (DELF/DALF), and Japanese (JLPT) official headers, honours tiers, and C2 mastery messaging', () => {
    const enCert = buildLinguaVerveCertificate({
      attempt: makePassedAttempt({
        id: 'en-c2',
        languageId: 'english',
        level: 'C2',
        overallScore: 95,
        officialGradeLabel: 'Cambridge Grade A (Est. IELTS 9.0)',
        alignedCertificate: 'Cambridge C2 Proficiency (CPE)',
      }),
    });
    expect(enCert.certificateId).toMatch(/^LV-EN-C2-20261127-[0-9A-F]{6}$/);
    expect(enCert.recipientName).toBe('LinguaVerve Scholar');
    expect(enCert.honorsTier).toBe('highest-distinction');
    expect(enCert.nextMilestoneLevel).toBeUndefined();
    expect(enCert.encouragementMessage).toContain('pinnacle');

    const frCert = buildLinguaVerveCertificate({
      attempt: makePassedAttempt({
        id: 'fr-b1',
        languageId: 'french',
        level: 'B1',
        overallScore: 76,
        officialGradeLabel: 'DELF B1: Mention Bien (76/100)',
        alignedCertificate: 'DELF B1',
      }),
      learnerName: 'Camille Laurent',
    });
    expect(frCert.certificateId).toMatch(/^LV-FR-B1-20261127-[0-9A-F]{6}$/);
    expect(frCert.documentHeader).toContain('DIPLÔME DE COMPÉTENCE EN LANGUE FRANÇAISE');
    expect(frCert.honorsTier).toBe('merit');
    expect(frCert.skills[0].nativeLabel).toBe('Compréhension écrite');

    const jaCert = buildLinguaVerveCertificate({
      attempt: makePassedAttempt({
        id: 'ja-b2',
        languageId: 'japanese',
        level: 'B2',
        overallScore: 66,
        officialGradeLabel: 'JLPT N2: 合格 · Passed (119/180)',
        alignedCertificate: 'JLPT N2 (日本語能力試験 N2)',
      }),
      learnerName: 'Haruto Sato',
    });
    expect(jaCert.certificateId).toMatch(/^LV-JA-B2-20261127-[0-9A-F]{6}$/);
    expect(jaCert.documentHeader).toContain('日本語能力認定証');
    expect(jaCert.honorsTier).toBe('pass');
    expect(jaCert.skills.map((s) => s.nativeLabel)).toEqual([
      '読解 (Dokkai)',
      '聴解 (Chōkai)',
      '作文 (Sakubun)',
      '会話 (Kaiwa)',
    ]);
  });

  it('generates a complete, XML-escaped vector SVG archival diploma', () => {
    const cert = buildLinguaVerveCertificate({
      attempt: makePassedAttempt(),
      learnerName: 'Max & Clara <Schüler>',
    });
    const svg = buildCertificateSVG(cert);

    expect(svg.startsWith('<?xml version="1.0"')).toBe(true);
    expect(svg).toContain('viewBox="0 0 1600 1130"');
    expect(svg).toContain('Max &amp; Clara &lt;Schüler&gt;');
    expect(svg).toContain(cert.certificateId);
    expect(svg).toContain(cert.verificationCode);
    expect(svg).toContain('LINGUAVERVE');
    expect(svg).toContain('ZERTIFIKAT · SPRACHPRÜFUNG DEUTSCH');
  });

  it('persists learnerName cleanly through state updates and JSON backup export/import', () => {
    const initial = createEmptyLearnerState();
    const named = setLearnerNameInState(initial, '  Elena Rostova  ');
    expect(named.learnerName).toBe('Elena Rostova');

    const backup = exportLearnerProgressJSON(named);
    const restored = parseImportedLearnerProgressJSON(backup);
    expect(restored.learnerName).toBe('Elena Rostova');

    const cleared = setLearnerNameInState(restored, '   ');
    expect(cleared.learnerName).toBeUndefined();
  });
});
