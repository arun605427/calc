import React, { useState, useEffect, useRef } from 'react';
import { PracticeDifficulty } from '../types/math';
import { preciseAdd, formatNumber, generateColumnBreakdown } from '../utils/mathUtils';
import { ColumnAdditionView } from './ColumnAdditionView';
import { Trophy, Flame, CheckCircle2, XCircle, ArrowRight, RotateCcw, HelpCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PracticeChallengeProps {
  onLoadProblemIntoCalculator: (a: number, b: number) => void;
}

export const PracticeChallenge: React.FC<PracticeChallengeProps> = ({
  onLoadProblemIntoCalculator,
}) => {
  const [difficulty, setDifficulty] = useState<PracticeDifficulty>('double');
  const [numA, setNumA] = useState<number>(15);
  const [numB, setNumB] = useState<number>(27);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [totalAttempted, setTotalAttempted] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Play synthesized positive / negative chime
  const playSound = (isSuccess: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (isSuccess) {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(329.63, audioCtx.currentTime); // E4
        osc.frequency.setValueAtTime(293.66, audioCtx.currentTime + 0.12); // D4
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {
      // AudioContext unavailable or blocked by browser
    }
  };

  // Generate new problem based on difficulty
  const generateNewProblem = (level = difficulty) => {
    setUserAnswer('');
    setFeedback('idle');
    setShowExplanation(false);

    let a = 0;
    let b = 0;

    switch (level) {
      case 'single':
        a = Math.floor(Math.random() * 9) + 1;
        b = Math.floor(Math.random() * 9) + 1;
        break;
      case 'double':
        a = Math.floor(Math.random() * 89) + 11;
        b = Math.floor(Math.random() * 89) + 11;
        break;
      case 'triple':
        a = Math.floor(Math.random() * 899) + 101;
        b = Math.floor(Math.random() * 899) + 101;
        break;
      case 'decimals':
        a = Number((Math.floor(Math.random() * 90) / 10 + 1).toFixed(1));
        b = Number((Math.floor(Math.random() * 90) / 10 + 1).toFixed(1));
        break;
      case 'speed':
        a = Math.floor(Math.random() * 49) + 5;
        b = Math.floor(Math.random() * 49) + 5;
        break;
    }

    setNumA(a);
    setNumB(b);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  useEffect(() => {
    generateNewProblem(difficulty);
  }, [difficulty]);

  const expectedSum = preciseAdd(numA, numB);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userAnswer.trim()) return;

    const parsed = parseFloat(userAnswer);
    const isCorrect = Math.abs(parsed - expectedSum) < 0.0001;

    setTotalAttempted((prev) => prev + 1);

    if (isCorrect) {
      playSound(true);
      setFeedback('correct');
      setScore((prev) => prev + 10);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });

      // Auto advance to next question after brief celebration
      setTimeout(() => {
        generateNewProblem();
      }, 1200);
    } else {
      playSound(false);
      setFeedback('wrong');
      setStreak(0);
    }
  };

  const handleDifficultyChange = (newDiff: PracticeDifficulty) => {
    setDifficulty(newDiff);
  };

  const breakdown = generateColumnBreakdown(numA, numB);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        {/* Practice Header & Score Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Addition Practice & Mental Math Drills
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Solve interactive addition problems and build arithmetic fluency
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Streak: {streak}</span>
              <span className="text-amber-400">·</span>
              <span>Best: {bestStreak}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300">
              <Trophy className="w-3.5 h-3.5 text-indigo-500" />
              <span>Score: {score} pts</span>
            </div>
          </div>
        </div>

        {/* Difficulty Tabs */}
        <div className="flex items-center gap-1.5 py-4 overflow-x-auto scrollbar-none">
          <span className="text-xs text-slate-400 font-medium mr-2">Level:</span>
          {(
            [
              { id: 'single', label: 'Single Digits (1-9)' },
              { id: 'double', label: 'Double Digits (10-99)' },
              { id: 'triple', label: 'Hundreds (100-999)' },
              { id: 'decimals', label: 'Decimals' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => handleDifficultyChange(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                difficulty === item.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Flashcard Question Area */}
        <div className="py-8 flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-slate-50 dark:bg-slate-950/70 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center relative overflow-hidden shadow-sm">
            {/* Feedback Banner */}
            <AnimatePresence>
              {feedback === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-3 left-0 right-0 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Correct! +10 Points</span>
                </motion.div>
              )}
              {feedback === 'wrong' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-3 left-0 right-0 flex items-center justify-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Not quite! Correct answer is {expectedSum}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Arithmetic Formula Flashcard */}
            <div className="flex items-center justify-center gap-4 text-4xl sm:text-5xl font-extrabold font-mono text-slate-900 dark:text-white my-4">
              <span>{formatNumber(numA)}</span>
              <span className="text-indigo-600 dark:text-indigo-400">+</span>
              <span>{formatNumber(numB)}</span>
              <span className="text-slate-400">=</span>
            </div>

            {/* Answer Input Field */}
            <form onSubmit={handleSubmit} className="w-full mt-4 flex flex-col items-center">
              <div className="w-full flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="number"
                  step="any"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter sum..."
                  className={`w-full text-center text-2xl font-mono font-bold py-3 px-4 rounded-xl border-2 outline-none transition-all ${
                    feedback === 'correct'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                      : feedback === 'wrong'
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500'
                  }`}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!userAnswer.trim()}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-medium rounded-xl transition-colors shrink-0 shadow-sm"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Action buttons below input */}
              <div className="flex items-center justify-between w-full mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => generateNewProblem()}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Skip Question</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showExplanation ? 'Hide Solution' : 'Show Carrying Steps'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onLoadProblemIntoCalculator(numA, numB)}
                    className="text-slate-600 dark:text-slate-300 hover:underline"
                  >
                    Load in Calculator
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Step by Step Breakdown Drawer if user asks for solution */}
      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
        >
          <ColumnAdditionView numA={numA} numB={numB} breakdown={breakdown} />
        </motion.div>
      )}
    </div>
  );
};
