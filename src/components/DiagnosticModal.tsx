import React, { useState } from 'react';
import { X, Award, Compass, ArrowRight, RotateCcw } from 'lucide-react';
import { DIAGNOSTIC_QUESTIONS, calculateDiagnosticLevel, CEFR_LEVELS } from '../data';
import { CEFRLevel } from '../types';
import { soundEngine } from '../utils/audio';

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyLevel: (level: CEFRLevel) => void;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  isOpen,
  onClose,
  onApplyLevel,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, CEFRLevel>>({});
  const [calculatedLevel, setCalculatedLevel] = useState<CEFRLevel | null>(null);

  if (!isOpen) return null;

  const currentQuestion = DIAGNOSTIC_QUESTIONS[currentStep];
  const isFinished = currentStep >= DIAGNOSTIC_QUESTIONS.length;

  const handleSelectOption = (level: CEFRLevel) => {
    soundEngine.playClickSound();
    const updated = { ...answers, [currentQuestion.id]: level };
    setAnswers(updated);

    if (currentStep + 1 < DIAGNOSTIC_QUESTIONS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      soundEngine.playSuccessChime();
      const finalLevel = calculateDiagnosticLevel(updated);
      setCalculatedLevel(finalLevel);
      setCurrentStep(DIAGNOSTIC_QUESTIONS.length);
    }
  };

  const handleReset = () => {
    soundEngine.playClickSound();
    setCurrentStep(0);
    setAnswers({});
    setCalculatedLevel(null);
  };

  const levelDetail = calculatedLevel 
    ? CEFR_LEVELS.find((l) => l.id === calculatedLevel) 
    : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                CEFR Level Diagnostic Finder
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Determine your authentic functional proficiency tier in 2 minutes.
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
        <div className="p-6">
          {!isFinished ? (
            <div className="space-y-6">
              {/* Progress indicator */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Question {currentStep + 1} of {DIAGNOSTIC_QUESTIONS.length}</span>
                  <span>{Math.round(((currentStep + 1) / DIAGNOSTIC_QUESTIONS.length) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-sky-500 transition-all duration-300 rounded-full"
                    style={{ width: `${((currentStep + 1) / DIAGNOSTIC_QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question title */}
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {currentQuestion.question}
              </h4>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt.level)}
                    className="w-full p-4 rounded-xl text-left border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/30 transition-all flex items-start gap-3 group"
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                      {opt.level}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {opt.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-5 animate-fadeIn">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/10">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Diagnostic Result:
                </span>
                <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  You are at Level {calculatedLevel}: {levelDetail?.stageName}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                  {levelDetail?.milestoneGoal}
                </p>
              </div>

              {levelDetail && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-left text-xs space-y-2 max-w-md mx-auto">
                  <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Immediate Breakthrough Goal:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    Focus on our <strong>{calculatedLevel} tactical blueprints</strong> to consolidate your foundations and breach into the next CEFR tier.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => {
                    if (calculatedLevel) onApplyLevel(calculatedLevel);
                    onClose();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-500/20 transition-all"
                >
                  <span>Filter Tips for {calculatedLevel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Quiz</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
