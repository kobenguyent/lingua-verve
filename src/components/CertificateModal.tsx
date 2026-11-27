import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileImage,
  Printer,
  ShieldCheck,
  Sparkles,
  UserPen,
  X,
} from 'lucide-react';
import { ExamAttemptRecord } from '../types';
import {
  buildCertificateSVG,
  buildLinguaVerveCertificate,
} from '../utils/certificate';
import { soundEngine } from '../utils/audio';
import { BrandMark } from './BrandMark';

interface CertificateModalProps {
  attempt: ExamAttemptRecord | null;
  learnerName?: string;
  passingScorePercent?: number;
  onUpdateLearnerName?: (name: string) => void;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  attempt,
  learnerName,
  passingScorePercent = 60,
  onUpdateLearnerName,
  onClose,
}) => {
  const [nameInput, setNameInput] = useState(learnerName || '');
  const [copied, setCopied] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    setNameInput(learnerName || '');
  }, [learnerName, attempt?.id]);

  useEffect(() => {
    if (!attempt) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [attempt, onClose]);

  const certificate = useMemo(() => {
    if (!attempt) return null;
    return buildLinguaVerveCertificate({
      attempt,
      learnerName: nameInput,
      passingScorePercent,
    });
  }, [attempt, nameInput, passingScorePercent]);

  if (!attempt || !certificate) return null;

  const fileStem = `LinguaVerve-Certificate-${certificate.languageId.toUpperCase()}-${certificate.level}-${certificate.issueDateCompact}`;

  const flashNotice = (msg: string) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(null), 3000);
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadSVG = () => {
    soundEngine.playSuccessChime();
    const svg = buildCertificateSVG(certificate);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    triggerDownload(blob, `${fileStem}.svg`);
    flashNotice(`Saved ${fileStem}.svg`);
  };

  const handleDownloadPNG = () => {
    soundEngine.playSuccessChime();
    const svg = buildCertificateSVG(certificate);
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 2400;
        canvas.height = 1695;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          triggerDownload(svgBlob, `${fileStem}.svg`);
          flashNotice(`Saved ${fileStem}.svg`);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            triggerDownload(pngBlob, `${fileStem}.png`);
            flashNotice(`Saved high-resolution ${fileStem}.png`);
          } else {
            triggerDownload(svgBlob, `${fileStem}.svg`);
            flashNotice(`Saved ${fileStem}.svg`);
          }
        }, 'image/png');
      } catch {
        URL.revokeObjectURL(url);
        triggerDownload(svgBlob, `${fileStem}.svg`);
        flashNotice(`Saved ${fileStem}.svg`);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      triggerDownload(svgBlob, `${fileStem}.svg`);
      flashNotice(`Saved ${fileStem}.svg`);
    };
    img.src = url;
  };

  const handlePrintCertificate = () => {
    soundEngine.playClickSound();
    const svg = buildCertificateSVG(certificate);
    const win = window.open('', '_blank', 'width=1200,height=860');
    if (!win) {
      window.print();
      return;
    }
    win.document.open();
    win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${certificate.certificateId} — LinguaVerve Official Certificate</title>
  <style>
    @page { size: A4 landscape; margin: 8mm; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #111827;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    svg {
      width: 100%;
      max-width: 1120px;
      height: auto;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
    }
    @media print {
      html, body { background: #FAF5E8 !important; min-height: auto; }
      svg { max-width: 100%; width: 100%; box-shadow: none; }
    }
  </style>
</head>
<body>${svg}</body>
</html>`);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 250);
  };

  const handleCopyCredential = async () => {
    try {
      await navigator.clipboard?.writeText(certificate.plainTextCredential);
      soundEngine.playClickSound();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable in headless test environments
    }
  };

  const handleNameChange = (value: string) => {
    setNameInput(value);
    onUpdateLearnerName?.(value);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`LinguaVerve Certificate ${certificate.certificateId}`}
    >
      <div
        className="w-full max-w-5xl max-h-[94vh] overflow-y-auto rounded-2xl bg-slate-900 border border-amber-400/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Personalization & Export Bar */}
        <div className="sticky top-0 z-20 px-4 sm:px-6 py-3.5 bg-slate-900/95 backdrop-blur border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>{certificate.certificateId}</span>
            </div>

            <label className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 flex-1 max-w-xs">
              <UserPen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="sr-only">Recipient Name on Certificate</span>
              <input
                type="text"
                aria-label="Recipient Name on Certificate"
                value={nameInput}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter your full name…"
                className="bg-transparent w-full text-xs text-white placeholder-slate-400 focus:outline-none"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPNG}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors"
            >
              <FileImage className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSVG}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>SVG</span>
            </button>

            <button
              type="button"
              onClick={handlePrintCertificate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCredential}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy ID'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close certificate"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Celebratory Encouragement Strip */}
        <div className="px-4 sm:px-6 pt-4">
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-sky-500/15 border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <div className="font-bold text-amber-200">{certificate.encouragementHeadline}</div>
                <p className="text-slate-200/90 mt-0.5">{certificate.encouragementMessage}</p>
              </div>
            </div>
            {exportNotice && (
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                ✓ {exportNotice}
              </span>
            )}
          </div>
        </div>

        {/* Official Archival Diploma Frame */}
        <div className="p-4 sm:p-6">
          <article className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#FDFBF5] via-[#FAF5E8] to-[#F5EBD5] text-slate-900 shadow-2xl border-[5px] border-[#0F172A] p-2 sm:p-3">
            {/* Champagne-Gold Inner Guilloché Frame */}
            <div className="relative rounded-lg border-[3px] border-[#D4A43C] p-1.5 sm:p-2">
              <div className="relative rounded-md border border-dashed border-[#C79C3E]/70 px-5 sm:px-10 py-7 sm:py-9 space-y-6">
                {/* Corner Filigree Accents */}
                <span className="pointer-events-none absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#B38122]" />
                <span className="pointer-events-none absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#B38122]" />
                <span className="pointer-events-none absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#B38122]" />
                <span className="pointer-events-none absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#B38122]" />

                {/* Subtle Center Crest Watermark */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.045]">
                  <BrandMark className="w-80 h-80" />
                </div>

                {/* 1. Official Institution Header */}
                <header className="relative text-center space-y-2.5">
                  <div className="flex justify-center">
                    <BrandMark className="w-16 h-16 drop-shadow-md" />
                  </div>
                  <div className="text-[11px] font-mono font-bold uppercase tracking-[0.26em] text-[#946414]">
                    LinguaVerve Academy of Languages · Examination Board
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-[#0C1221]">
                    {certificate.documentHeader}
                  </h2>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                    {certificate.documentSubtitle}
                  </p>
                  <div className="mx-auto w-2/3 h-[2px] bg-gradient-to-r from-transparent via-[#D4A43C] to-transparent" />
                </header>

                {/* 2. Recipient Name & Certification Statement */}
                <section className="relative text-center space-y-2.5 pt-1">
                  <p className="font-serif italic text-sm sm:text-base text-slate-600">
                    {certificate.certifyingPhrase}
                  </p>
                  <div className="font-display text-3xl sm:text-5xl font-bold text-[#0C1221] tracking-tight px-2">
                    {certificate.recipientName}
                  </div>
                  <div className="mx-auto w-3/5 h-px bg-[#C79C3E]/70" />
                  <p className="text-xs sm:text-sm text-slate-700 pt-1">
                    has successfully completed and passed the full 4-Skill Simulated Certification Examination in
                  </p>
                  <div className="font-display text-xl sm:text-2xl font-bold text-[#0F172A]">
                    {certificate.languageFlag} {certificate.languageName} ({certificate.languageNativeName}) — Level{' '}
                    <span className="text-[#946414]">{certificate.level}</span> · {certificate.cefrBandTitle}
                  </div>
                  <div className="text-xs font-mono font-bold text-sky-800">
                    {certificate.frameworkEquivalence}
                  </div>
                </section>

                {/* 3. Honours Ribbon & Overall Official Result */}
                <section className="relative flex justify-center">
                  <div className="w-full max-w-3xl px-5 py-3 rounded-full bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border-2 border-[#E3B74F] text-center shadow-md space-y-0.5">
                    <div className="text-xs sm:text-sm font-mono font-bold tracking-wider text-[#F9E08D]">
                      ★ {certificate.honorsTitle} · OVERALL {certificate.overallScore}/100 · {certificate.officialGradeLabel} ★
                    </div>
                    <div className="text-[11px] font-medium text-sky-200">
                      {certificate.honorsNativeLabel}
                    </div>
                  </div>
                </section>

                {/* 4. Official 4-Skill Modular Score Transcript */}
                <section className="relative space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-[#8B5D10]">
                    <span>Official 4-Skill Examination Transcript</span>
                    <span>Pass Threshold: ≥ {certificate.passingScorePercent}% per Skill</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {certificate.skills.map((s) => (
                      <div
                        key={s.skill}
                        className="p-3.5 rounded-xl bg-white/95 border border-[#DAC69B] shadow-sm space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-display text-xs font-bold uppercase tracking-wide text-[#0F172A]">
                              {s.englishLabel}
                            </div>
                            <div className="text-[11px] text-slate-500">{s.nativeLabel}</div>
                          </div>
                          <div className="font-mono text-xl font-extrabold text-[#0F172A] tabular-nums">
                            {s.score}
                            <span className="text-[11px] font-semibold text-slate-400">/100</span>
                          </div>
                        </div>

                        <div className="h-2 rounded-full bg-[#EFE7D5] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.score >= 85
                                ? 'bg-emerald-600'
                                : s.score >= 70
                                ? 'bg-sky-600'
                                : 'bg-amber-600'
                            }`}
                            style={{ width: `${Math.max(6, Math.min(100, s.score))}%` }}
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono font-bold">
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{s.passed ? 'PASSED' : 'RECORDED'}</span>
                          </span>
                          {s.aiGraded && (
                            <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                              AI EXAMINER
                            </span>
                          )}
                        </div>

                        {s.rubric && (
                          <div className="pt-1.5 border-t border-slate-100 grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-600">
                            <span>Task: {s.rubric.taskFulfillment}%</span>
                            <span>Coh: {s.rubric.coherenceCohesion}%</span>
                            <span>Lex: {s.rubric.lexicalRange}%</span>
                            <span>Gram: {s.rubric.grammaticalAccuracy}%</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* 5. Official CEFR Can-Do Competency Descriptor */}
                <section className="relative p-3.5 rounded-xl bg-[#F4ECDA]/90 border border-[#DAC69B] text-center space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#8B5D10]">
                    Official CEFR {certificate.level} Can-Do Competency Descriptor
                  </div>
                  <p className="font-serif italic text-xs sm:text-sm text-slate-800 leading-relaxed max-w-3xl mx-auto">
                    “{certificate.cefrCanDoStatement}”
                  </p>
                </section>

                {/* 6. Official Examination Record Metadata Grid */}
                <section className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-[11px] font-mono bg-white/75 rounded-xl border border-[#DFCEAA] p-3.5 text-slate-700">
                  <div>
                    <span className="font-bold text-slate-900">DATE ISSUED: </span>
                    {certificate.issueDateFormatted}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">ALIGNED EXAM: </span>
                    {certificate.alignedCertificate}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">DURATION: </span>
                    {certificate.durationFormatted}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">CONDITIONS: </span>
                    {certificate.examModeLabel}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">GRADING: </span>
                    {certificate.gradingAuthority}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">CREDENTIAL ID: </span>
                    {certificate.certificateId}
                  </div>
                </section>

                {/* 7. Signatories + Gold Embossed Official Seal */}
                <footer className="relative pt-2 grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center">
                  {/* Left Signatory */}
                  <div className="space-y-1">
                    <div className="font-serif italic text-2xl text-slate-800">Elena Lindholm</div>
                    <div className="mx-auto w-48 h-px bg-slate-400" />
                    <div className="text-xs font-bold text-slate-900">{certificate.signatories[0].name}</div>
                    <div className="text-[11px] text-slate-600">
                      {certificate.signatories[0].title} · {certificate.signatories[0].division}
                    </div>
                  </div>

                  {/* Center Embossed Gold Seal */}
                  <div className="flex justify-center">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#FFF1B5] via-[#E5B443] to-[#9E6A12] p-1.5 shadow-lg border-2 border-[#8A5A0A] flex items-center justify-center">
                      <div className="w-full h-full rounded-full border border-dashed border-[#FFF3C4] p-1 flex items-center justify-center">
                        <div className="w-full h-full rounded-full bg-[#0C1221] border-2 border-[#F4CF70] flex flex-col items-center justify-center text-center">
                          <span className="text-[8px] font-mono font-bold tracking-widest text-[#F4CF70]">
                            CERTIFIED
                          </span>
                          <span className="font-display text-2xl font-bold text-white leading-none my-0.5">
                            {certificate.level}
                          </span>
                          <span className="text-[7px] font-mono font-bold tracking-wider text-sky-400">
                            LINGUAVERVE
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Signatory */}
                  <div className="space-y-1">
                    <div className="font-serif italic text-2xl text-slate-800">CEFR Examination Panel</div>
                    <div className="mx-auto w-48 h-px bg-slate-400" />
                    <div className="text-xs font-bold text-slate-900">{certificate.signatories[1].name}</div>
                    <div className="text-[11px] text-slate-600">
                      {certificate.signatories[1].title} · {certificate.signatories[1].division}
                    </div>
                  </div>
                </footer>

                {/* 8. Verification Stamp & Archival Authenticity Notice */}
                <div className="relative pt-3 border-t border-[#DFCEAA] text-center space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      VERIFICATION CODE: {certificate.verificationCode} · CREDENTIAL: {certificate.certificateId}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 max-w-3xl mx-auto leading-relaxed">
                    {certificate.authenticityNotice}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
