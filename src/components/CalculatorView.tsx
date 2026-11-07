import React, { useState } from 'react';
import { preciseAdd, formatNumber, isPrime, generateColumnBreakdown } from '../utils/mathUtils';
import { ColumnAdditionView } from './ColumnAdditionView';
import {
  Plus,
  ArrowLeftRight,
  Copy,
  Check,
  Volume2,
  Sparkles,
  Shuffle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CalculatorViewProps {
  numA: number;
  numB: number;
  inputAStr: string;
  inputBStr: string;
  onChangeA: (val: string) => void;
  onChangeB: (val: string) => void;
  onSwap: () => void;
  onApplyPreset: (a: number, b: number) => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  numA,
  numB,
  inputAStr,
  inputBStr,
  onChangeA,
  onChangeB,
  onSwap,
  onApplyPreset,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showStepByStep, setShowStepByStep] = useState<boolean>(true);
  const [showProperties, setShowProperties] = useState<boolean>(true);

  const sum = preciseAdd(numA, numB);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${formatNumber(numA)} + ${formatNumber(numB)} = ${formatNumber(sum)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `${numA} plus ${numB} equals ${sum}`
      );
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Quick adjust helper
  const adjustValue = (currentStr: string, delta: number, setter: (val: string) => void) => {
    const currentNum = parseFloat(currentStr) || 0;
    const newNum = preciseAdd(currentNum, delta);
    setter(newNum.toString());
  };

  const toggleSign = (currentStr: string, setter: (val: string) => void) => {
    const currentNum = parseFloat(currentStr) || 0;
    setter((-currentNum).toString());
  };

  const setZero = (setter: (val: string) => void) => {
    setter('0');
  };

  // Breakdown for column addition
  const breakdown = generateColumnBreakdown(numA, numB);

  // Computed properties
  const isSumInteger = Number.isInteger(sum);
  const isSumEven = isSumInteger ? Math.abs(sum) % 2 === 0 : null;
  const isSumPrime = isSumInteger && sum > 1 && sum < 1000000 ? isPrime(sum) : null;
  const diff = preciseAdd(Math.abs(numA), -Math.abs(numB));
  const absDiff = Math.abs(diff);
  const average = sum / 2;
  const pctA = sum !== 0 ? Math.round((numA / sum) * 100) : 50;
  const pctB = sum !== 0 ? Math.round((numB / sum) * 100) : 50;

  return (
    <div className="space-y-6">
      {/* Primary Calculator Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* Presets Bar */}
        <div className="flex items-center justify-between gap-2 pb-6 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Quick Pairs:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            <button
              onClick={() => onApplyPreset(7, 9)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap"
            >
              Single: 7 + 9
            </button>
            <button
              onClick={() => onApplyPreset(48, 75)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap"
            >
              Carry: 48 + 75
            </button>
            <button
              onClick={() => onApplyPreset(387, 459)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap"
            >
              Hundreds: 387 + 459
            </button>
            <button
              onClick={() => onApplyPreset(19.95, 4.5)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap"
            >
              Decimals: 19.95 + 4.50
            </button>
            <button
              onClick={() => onApplyPreset(12500, 8750)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap"
            >
              Thousands: 12.5k + 8.75k
            </button>
            <button
              onClick={() => {
                const r1 = Math.floor(Math.random() * 500) + 1;
                const r2 = Math.floor(Math.random() * 500) + 1;
                onApplyPreset(r1, r2);
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <Shuffle className="w-3 h-3" />
              <span>Random</span>
            </button>
          </div>
        </div>

        {/* The Two Number Inputs Split */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Box 1: Number A */}
          <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
              <span>First Number (A)</span>
              <span className="font-mono">{formatNumber(numA)}</span>
            </div>

            <input
              type="number"
              step="any"
              value={inputAStr}
              onChange={(e) => onChangeA(e.target.value)}
              className="w-full text-3xl sm:text-4xl font-bold font-mono text-slate-900 dark:text-white bg-transparent border-0 outline-none p-0 tracking-tight"
              placeholder="0"
            />

            {/* Micro Quick Controls */}
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-1.5 flex-wrap text-xs font-mono">
              <button
                onClick={() => adjustValue(inputAStr, 1, onChangeA)}
                className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
              >
                +1
              </button>
              <button
                onClick={() => adjustValue(inputAStr, -1, onChangeA)}
                className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
              >
                -1
              </button>
              <button
                onClick={() => adjustValue(inputAStr, 10, onChangeA)}
                className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
              >
                +10
              </button>
              <button
                onClick={() => adjustValue(inputAStr, -10, onChangeA)}
                className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
              >
                -10
              </button>
              <button
                onClick={() => toggleSign(inputAStr, onChangeA)}
                className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
              >
                ±
              </button>
              <button
                onClick={() => setZero(onChangeA)}
                className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-500"
              >
                C
              </button>
            </div>
          </div>

          {/* Plus Sign & Swap Center Action */}
          <div className="md:col-span-1 flex flex-col items-center justify-center gap-2 py-2">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-md">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <button
              onClick={onSwap}
              title="Swap Number A and Number B"
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Box 2: Number B */}
          <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
              <span>Second Number (B)</span>
              <span className="font-mono">{formatNumber(numB)}</span>
            </div>

            <input
              type="number"
              step="any"
              value={inputBStr}
              onChange={(e) => onChangeB(e.target.value)}
              className="w-full text-3xl sm:text-4xl font-bold font-mono text-slate-900 dark:text-white bg-transparent border-0 outline-none p-0 tracking-tight"
              placeholder="0"
            />

            {/* Micro Quick Controls */}
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-1.5 flex-wrap text-xs font-mono">
              <button
                onClick={() => adjustValue(inputBStr, 1, onChangeB)}
                className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
              >
                +1
              </button>
              <button
                onClick={() => adjustValue(inputBStr, -1, onChangeB)}
                className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
              >
                -1
              </button>
              <button
                onClick={() => adjustValue(inputBStr, 10, onChangeB)}
                className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
              >
                +10
              </button>
              <button
                onClick={() => adjustValue(inputBStr, -10, onChangeB)}
                className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
              >
                -10
              </button>
              <button
                onClick={() => toggleSign(inputBStr, onChangeB)}
                className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
              >
                ±
              </button>
              <button
                onClick={() => setZero(onChangeB)}
                className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-500"
              >
                C
              </button>
            </div>
          </div>
        </div>

        {/* Hero Result Banner */}
        <div className="mt-4 p-6 sm:p-8 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border-2 border-indigo-200/80 dark:border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Sum (Total Addition)
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl sm:text-5xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                {formatNumber(sum)}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
              {formatNumber(numA)} + {formatNumber(numB)} = {formatNumber(sum)}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleSpeak}
              title="Read calculation aloud"
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Formula!' : 'Copy Result'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Number Properties Accordion / Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div
          onClick={() => setShowProperties(!showProperties)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Mathematical Insights & Properties
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Characteristics of {formatNumber(sum)} and relationship between addends
            </p>
          </div>
          <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            {showProperties ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <AnimatePresence>
          {showProperties && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                {/* Property 1: Parity */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Parity</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {isSumEven === null ? 'Decimal' : isSumEven ? 'Even Number' : 'Odd Number'}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {isSumEven === null ? 'Non-integer' : `${sum} mod 2 = ${Math.abs(sum) % 2}`}
                  </span>
                </div>

                {/* Property 2: Prime Check */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Prime Check</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {isSumPrime === null ? 'N/A' : isSumPrime ? 'Prime' : 'Composite'}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {isSumPrime === true ? 'Only divisible by 1 and itself' : 'Has multiple factors'}
                  </span>
                </div>

                {/* Property 3: Difference */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Difference</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-1">
                    {formatNumber(absDiff)}
                  </div>
                  <span className="text-[11px] text-slate-500">|{numA} - {numB}|</span>
                </div>

                {/* Property 4: Mean / Average */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Average (Mean)</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-1">
                    {formatNumber(average)}
                  </div>
                  <span className="text-[11px] text-slate-500">({numA} + {numB}) / 2</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Embedded Column Addition Step-by-Step Breakdown */}
      <div>
        <ColumnAdditionView numA={numA} numB={numB} breakdown={breakdown} />
      </div>
    </div>
  );
};
