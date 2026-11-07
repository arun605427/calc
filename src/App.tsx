/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ViewMode, CalculationRecord } from './types/math';
import { preciseAdd, formatNumber } from './utils/mathUtils';
import { Header } from './components/Header';
import { CalculatorView } from './components/CalculatorView';
import { VisualModelsView } from './components/VisualModelsView';
import { PracticeChallenge } from './components/PracticeChallenge';
import { HistoryPanel } from './components/HistoryPanel';

export default function App() {
  const [currentMode, setCurrentMode] = useState<ViewMode>('calculator');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sumflow_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Numeric inputs
  const [inputAStr, setInputAStr] = useState<string>('387');
  const [inputBStr, setInputBStr] = useState<string>('459');

  const numA = parseFloat(inputAStr) || 0;
  const numB = parseFloat(inputBStr) || 0;
  const currentSum = preciseAdd(numA, numB);

  // History state
  const [history, setHistory] = useState<CalculationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('sumflow_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'init-1',
        a: 387,
        b: 459,
        sum: 846,
        timestamp: Date.now() - 1000 * 60 * 5,
        formattedFormula: '387 + 459 = 846',
      },
      {
        id: 'init-2',
        a: 48,
        b: 75,
        sum: 123,
        timestamp: Date.now() - 1000 * 60 * 15,
        formattedFormula: '48 + 75 = 123',
      },
    ];
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sumflow_history', JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Sync theme with HTML class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sumflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sumflow_theme', 'light');
    }
  }, [isDarkMode]);

  // Record calculation into history (debounced or on demand)
  const recordCalculation = useCallback((a: number, b: number) => {
    const sum = preciseAdd(a, b);
    const formula = `${formatNumber(a)} + ${formatNumber(b)} = ${formatNumber(sum)}`;

    setHistory((prev) => {
      // avoid duplicates at top
      if (prev.length > 0 && prev[0].a === a && prev[0].b === b) {
        return prev;
      }
      const newRecord: CalculationRecord = {
        id: `calc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        a,
        b,
        sum,
        timestamp: Date.now(),
        formattedFormula: formula,
      };
      return [newRecord, ...prev.slice(0, 49)]; // keep 50 recent
    });
  }, []);

  // Update inputs and record
  const handleApplyPreset = (a: number, b: number) => {
    setInputAStr(a.toString());
    setInputBStr(b.toString());
    recordCalculation(a, b);
  };

  const handleSwap = () => {
    const tempA = inputAStr;
    setInputAStr(inputBStr);
    setInputBStr(tempA);
    recordCalculation(parseFloat(inputBStr) || 0, parseFloat(tempA) || 0);
  };

  const handleReset = () => {
    setInputAStr('0');
    setInputBStr('0');
  };

  // When user finishes typing or leaves inputs, record calculation if non-zero
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputAStr !== '' && inputBStr !== '') {
        const a = parseFloat(inputAStr) || 0;
        const b = parseFloat(inputBStr) || 0;
        if (a !== 0 || b !== 0) {
          recordCalculation(a, b);
        }
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [inputAStr, inputBStr, recordCalculation]);

  const handleSelectHistoryRecord = (record: CalculationRecord) => {
    setInputAStr(record.a.toString());
    setInputBStr(record.b.toString());
    setCurrentMode('calculator');
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleDeleteHistoryRecord = (id: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onReset={handleReset}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentMode === 'calculator' && (
          <CalculatorView
            numA={numA}
            numB={numB}
            inputAStr={inputAStr}
            inputBStr={inputBStr}
            onChangeA={setInputAStr}
            onChangeB={setInputBStr}
            onSwap={handleSwap}
            onApplyPreset={handleApplyPreset}
          />
        )}

        {currentMode === 'visuals' && (
          <div className="space-y-6">
            {/* Quick Addend Mini Bar for easy switching */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Currently Visualizing:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                  {formatNumber(numA)} + {formatNumber(numB)} = {formatNumber(currentSum)}
                </span>
              </div>
              <button
                onClick={() => setCurrentMode('calculator')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Change Numbers in Calculator &rarr;
              </button>
            </div>

            <VisualModelsView numA={numA} numB={numB} sum={currentSum} />
          </div>
        )}

        {currentMode === 'practice' && (
          <PracticeChallenge
            onLoadProblemIntoCalculator={(a, b) => {
              setInputAStr(a.toString());
              setInputBStr(b.toString());
              setCurrentMode('calculator');
            }}
          />
        )}

        {currentMode === 'history' && (
          <HistoryPanel
            history={history}
            onSelectRecord={handleSelectHistoryRecord}
            onClearHistory={handleClearHistory}
            onDeleteRecord={handleDeleteHistoryRecord}
          />
        )}
      </main>

      {/* Clean Unboxed Footer with Typographic Separators */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">SumFlow</span>
            <span aria-hidden="true">·</span>
            <span>Interactive Addition Studio</span>
            <span aria-hidden="true">·</span>
            <span>Regrouping & Place Value Learning</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Supports Whole Numbers & Decimals</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Precision Arithmetic</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
