import React, { useState, useEffect } from 'react';
import { ColumnBreakdown, ColumnStep } from '../types/math';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ColumnAdditionViewProps {
  numA: number;
  numB: number;
  breakdown: ColumnBreakdown;
}

export const ColumnAdditionView: React.FC<ColumnAdditionViewProps> = ({
  numA,
  numB,
  breakdown,
}) => {
  const steps = breakdown.steps;
  const totalSteps = steps.length;
  // Step index: 0 is rightmost column calculation, up to totalSteps - 1
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Reset step index if inputs change
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [numA, numB]);

  // Autoplay timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      if (currentStepIndex < totalSteps - 1) {
        timer = setTimeout(() => {
          setCurrentStepIndex((prev) => prev + 1);
        }, 1500);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, totalSteps]);

  const currentStep: ColumnStep | undefined = steps[currentStepIndex];

  // Quick navigation handlers
  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleShowAll = () => {
    setIsPlaying(false);
    setCurrentStepIndex(totalSteps - 1);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Column Addition & Carrying Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Step-by-step place value arithmetic with regrouping
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={handleReset}
            title="Start from beginning"
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            title="Previous step"
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-40"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause' : 'Play steps'}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Auto Play</span>
              </>
            )}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStepIndex >= totalSteps - 1}
            title="Next step"
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-40"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={handleShowAll}
            className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            All
          </button>
        </div>
      </div>

      {/* Grid Display Section */}
      <div className="py-8 flex flex-col items-center justify-center">
        {/* Arithmetic Table */}
        <div className="inline-block px-8 py-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 font-mono">
          {/* Header Row: Place value names */}
          <div className="flex justify-end gap-3 sm:gap-6 mb-2 text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span className="w-6 text-center"></span>
            {breakdown.labels.map((label, idx) => (
              <span key={idx} className="w-8 sm:w-10 text-center truncate" title={label}>
                {label === '·' ? '' : label.slice(0, 3)}
              </span>
            ))}
          </div>

          {/* Row 0: Carries line */}
          <div className="flex items-center justify-end gap-3 sm:gap-6 text-xs text-amber-600 dark:text-amber-400 font-bold h-7 mb-1">
            <span className="w-6 text-right text-[10px] uppercase text-amber-500 font-normal">carry</span>
            {breakdown.carries.map((carry, idx) => {
              // Determine if this carry was generated by a step up to currentStepIndex
              const isCarried = carry !== null;
              return (
                <div
                  key={idx}
                  className="w-8 sm:w-10 flex items-center justify-center"
                >
                  {isCarried ? (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-xs shadow-xs"
                    >
                      {carry}
                    </motion.span>
                  ) : (
                    <span className="opacity-0">0</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Row 1: Top Number (A) */}
          <div className="flex items-center justify-end gap-3 sm:gap-6 text-2xl sm:text-3xl text-slate-900 dark:text-white font-semibold">
            <span className="w-6 text-center text-slate-400 font-normal text-lg"> </span>
            {breakdown.topRow.map((char, idx) => (
              <span key={idx} className="w-8 sm:w-10 text-center">
                {char}
              </span>
            ))}
          </div>

          {/* Row 2: Bottom Number (B) with Plus sign */}
          <div className="flex items-center justify-end gap-3 sm:gap-6 text-2xl sm:text-3xl text-slate-900 dark:text-white font-semibold mt-1">
            <span className="w-6 text-center text-indigo-600 dark:text-indigo-400 font-bold text-2xl">+</span>
            {breakdown.bottomRow.map((char, idx) => (
              <span key={idx} className="w-8 sm:w-10 text-center">
                {char}
              </span>
            ))}
          </div>

          {/* Divider Line */}
          <div className="border-b-2 border-slate-900 dark:border-white my-3" />

          {/* Row 3: Result Sum Line */}
          <div className="flex items-center justify-end gap-3 sm:gap-6 text-2xl sm:text-3xl text-indigo-600 dark:text-indigo-400 font-bold">
            <span className="w-6 text-center text-slate-400 font-normal text-lg">=</span>
            {breakdown.sumRow.map((char, idx) => {
              // Check if this digit has been revealed in the step-by-step
              const reverseIdx = breakdown.sumRow.length - 1 - idx;
              const isRevealed = reverseIdx <= currentStepIndex;

              return (
                <div key={idx} className="w-8 sm:w-10 text-center relative">
                  <AnimatePresence>
                    {isRevealed ? (
                      <motion.span
                        key="digit"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block"
                      >
                        {char}
                      </motion.span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-700 select-none">·</span>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Step Explanation Card */}
        {currentStep && (
          <div className="mt-6 w-full max-w-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Step {currentStepIndex + 1} of {totalSteps}: {currentStep.columnName}
              </span>
              <span className="font-mono">
                {Math.round(((currentStepIndex + 1) / totalSteps) * 100)}% Complete
              </span>
            </div>

            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {currentStep.explanation}
            </p>

            <div className="mt-3 flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Calculation:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {currentStep.topDigit} + {currentStep.bottomDigit}
                  {currentStep.incomingCarry > 0 ? ` + ${currentStep.incomingCarry} (carry)` : ''} = {currentStep.columnSum}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <div>
                <span className="text-slate-400">Write: </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentStep.resultDigit}</span>
                {currentStep.outgoingCarry > 0 && (
                  <span className="ml-1 text-amber-600 dark:text-amber-400">
                    (Carry {currentStep.outgoingCarry})
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
