import React, { useState } from 'react';
import { X, Code2, Check, Copy, Sparkles, Layers } from 'lucide-react';
import { LANGUAGES } from '../data/languages';

interface ExtensibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXTENSION_CODE_SNIPPET = `// 1. Add your language to src/data/languages.ts:
{
  id: 'spanish',
  name: 'Spanish',
  nativeName: 'Español',
  flag: '🇪🇸',
  tagline: 'The Expressive Romance Tongue',
  estimatedHoursToC1: 600,
  difficultyRating: 'Category I',
  status: 'active'
}

// 2. Create your tips file in src/data/tips/spanish.ts:
import { TipItem } from '../../types';

export const SPANISH_TIPS: TipItem[] = [
  {
    id: 'es-a1-pronunciation-r',
    title: 'The Mechanical Rolled R: Tongue Vibration Hack',
    languageId: 'spanish',
    level: 'A1',
    category: 'pronunciation',
    summary: 'Master the alveolar trill by releasing tension at the alveolar ridge.',
    goldenRule: 'Do not blow air harder; blow faster with a completely relaxed tongue tip.',
    tactics: ['Say "butter" rapidly in American English to locate the tapping spot', ...],
    commonPitfall: 'Using throat friction like a French R.',
    timeCommitment: '5 mins/day',
    tags: ['pronunciation', 'rolled-r', 'phonetics']
  }
];

// 3. Import and export in src/data/index.ts:
// Everything (filters, CEFR pipelines, search, bookmarking, and tests) works automatically!`;

export const ExtensibilityModal: React.FC<ExtensibilityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(EXTENSION_CODE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewLanguages = LANGUAGES.filter((l) => l.status === 'preview');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                Extensible Architecture: Add Any Language
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Designed to easily scale from English & German to 50+ languages with strict TypeScript schemas.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Staged languages */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Next In Line / Staged Languages:
              </h4>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {previewLanguages.map((lang) => (
                <div
                  key={lang.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                      Ready to Plug In
                    </span>
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">{lang.name}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{lang.family}</p>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {lang.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3-Step Guide */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              How Extension Works (3 Minutes to Add a Language):
            </h4>
            <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <span className="font-bold text-sky-600 dark:text-sky-400 block">Step 1: Register Language</span>
                <p>Add metadata (flag, name, family, C1 hours) to <code className="text-sky-500">src/data/languages.ts</code>.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <span className="font-bold text-sky-600 dark:text-sky-400 block">Step 2: Create Tips File</span>
                <p>Create <code className="text-sky-500">src/data/tips/[language].ts</code> with A1 to C2 blueprints.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <span className="font-bold text-sky-600 dark:text-sky-400 block">Step 3: Auto-Integration</span>
                <p>Export in <code className="text-sky-500">src/data/index.ts</code>. Filters, search, and Vitest suite handle the rest!</p>
              </div>
            </div>
          </div>

          {/* Code Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-sky-500" />
                <span>Reference TypeScript Schema:</span>
              </span>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800">
              <code>{EXTENSION_CODE_SNIPPET}</code>
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
};
