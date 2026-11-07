import React, { useState } from 'react';
import { VisualModelType } from '../types/math';
import { formatNumber } from '../utils/mathUtils';
import { ArrowRight, Sliders, Layers, Grid } from 'lucide-react';
import { motion } from 'motion/react';

interface VisualModelsViewProps {
  numA: number;
  numB: number;
  sum: number;
}

export const VisualModelsView: React.FC<VisualModelsViewProps> = ({ numA, numB, sum }) => {
  const [modelType, setModelType] = useState<VisualModelType>('number-line');

  // Tape diagram proportional widths
  const absA = Math.abs(numA);
  const absB = Math.abs(numB);
  const totalAbs = absA + absB || 1;
  const pctA = Math.max(8, Math.min(92, Math.round((absA / totalAbs) * 100)));
  const pctB = 100 - pctA;

  // Number Line Calculations
  const minVal = Math.min(0, numA, sum);
  const maxVal = Math.max(0, numA, sum);
  const range = Math.max(1, maxVal - minVal);
  const padding = range * 0.15;
  const viewMin = Math.floor(minVal - padding);
  const viewMax = Math.ceil(maxVal + padding);
  const viewSpan = viewMax - viewMin || 1;

  // Convert coordinate to percentage across SVG line
  const getXPercent = (val: number) => {
    return ((val - viewMin) / viewSpan) * 100;
  };

  const x0 = getXPercent(0);
  const xA = getXPercent(numA);
  const xSum = getXPercent(sum);

  // Generate tick marks for number line
  const stepCount = 8;
  const rawStep = viewSpan / stepCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.max(1, rawStep))));
  const tickStep = Math.max(1, Math.round(rawStep / magnitude) * magnitude);
  
  const ticks: number[] = [];
  const startTick = Math.ceil(viewMin / tickStep) * tickStep;
  for (let t = startTick; t <= viewMax; t += tickStep) {
    ticks.push(t);
  }

  // Ten-Frames dot calculation (for positive values under 100)
  const isDotModelSupported = numA >= 0 && numB >= 0 && sum <= 120;
  const dotsA = Math.min(100, Math.round(numA));
  const dotsB = Math.min(100, Math.round(numB));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      {/* Header & Model Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Visual Math Representations
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Understand addition conceptually through geometry and models
          </p>
        </div>

        {/* Model Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setModelType('number-line')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              modelType === 'number-line'
                ? 'bg-white text-slate-900 dark:bg-slate-700 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Number Line</span>
          </button>
          <button
            onClick={() => setModelType('bar-model')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              modelType === 'bar-model'
                ? 'bg-white text-slate-900 dark:bg-slate-700 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tape Diagram (Bar)</span>
          </button>
          <button
            onClick={() => setModelType('ten-frames')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              modelType === 'ten-frames'
                ? 'bg-white text-slate-900 dark:bg-slate-700 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Ten-Frames</span>
          </button>
        </div>
      </div>

      <div className="py-6">
        {/* MODEL 1: NUMBER LINE */}
        {modelType === 'number-line' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Jump 1: Start at 0, jump{' '}
                <strong className="text-slate-900 dark:text-white">+{numA}</strong>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" /> Jump 2: From {numA}, jump{' '}
                <strong className="text-slate-900 dark:text-white">+{numB}</strong>
              </span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                Land: {formatNumber(sum)}
              </span>
            </div>

            {/* Responsive SVG Number Line Canvas */}
            <div className="relative w-full h-52 bg-slate-50 dark:bg-slate-950/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 flex items-center overflow-hidden">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 200">
                <defs>
                  <marker
                    id="arrow-blue"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#3b82f6" />
                  </marker>
                  <marker
                    id="arrow-indigo"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#6366f1" />
                  </marker>
                </defs>

                {/* Horizontal Baseline Axis */}
                <line
                  x1="20"
                  y1="140"
                  x2="980"
                  y2="140"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-slate-300 dark:text-slate-700"
                />

                {/* Axis Arrow Ends */}
                <polygon points="15,140 25,135 25,145" className="fill-slate-300 dark:fill-slate-700" />
                <polygon points="985,140 975,135 975,145" className="fill-slate-300 dark:fill-slate-700" />

                {/* Ticks and Axis Numbers */}
                {ticks.map((t, idx) => {
                  const tickX = 20 + (getXPercent(t) / 100) * 960;
                  if (tickX < 20 || tickX > 980) return null;
                  return (
                    <g key={idx}>
                      <line
                        x1={tickX}
                        y1="134"
                        x2={tickX}
                        y2="146"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-slate-400 dark:text-slate-600"
                      />
                      <text
                        x={tickX}
                        y="166"
                        textAnchor="middle"
                        fontSize="11"
                        className="fill-slate-500 dark:fill-slate-400 font-mono"
                      >
                        {formatNumber(t)}
                      </text>
                    </g>
                  );
                })}

                {/* Arc 1: From 0 to numA */}
                {(() => {
                  const p0 = 20 + (x0 / 100) * 960;
                  const pA = 20 + (xA / 100) * 960;
                  const midX = (p0 + pA) / 2;
                  const arcHeight = Math.min(80, Math.max(35, Math.abs(pA - p0) * 0.25));
                  const controlY = 140 - arcHeight;

                  return (
                    <g>
                      <path
                        d={`M ${p0} 140 Q ${midX} ${controlY} ${pA} 140`}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeDasharray="4 2"
                        markerEnd="url(#arrow-blue)"
                      />
                      <circle cx={p0} cy="140" r="4" fill="#3b82f6" />
                      <circle cx={pA} cy="140" r="5" fill="#3b82f6" />
                      <text
                        x={midX}
                        y={controlY - 8}
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="bold"
                        fill="#2563eb"
                        className="font-mono"
                      >
                        +{numA}
                      </text>
                    </g>
                  );
                })()}

                {/* Arc 2: From numA to sum */}
                {(() => {
                  const pA = 20 + (xA / 100) * 960;
                  const pSum = 20 + (xSum / 100) * 960;
                  const midX = (pA + pSum) / 2;
                  const arcHeight = Math.min(95, Math.max(40, Math.abs(pSum - pA) * 0.25));
                  const controlY = 140 - arcHeight;

                  return (
                    <g>
                      <path
                        d={`M ${pA} 140 Q ${midX} ${controlY} ${pSum} 140`}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3.5"
                        markerEnd="url(#arrow-indigo)"
                      />
                      <circle cx={pSum} cy="140" r="6" fill="#6366f1" />
                      <text
                        x={midX}
                        y={controlY - 8}
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="bold"
                        fill="#4f46e5"
                        className="font-mono"
                      >
                        +{numB}
                      </text>
                      {/* Destination Flag */}
                      <g transform={`translate(${pSum}, 130)`}>
                        <line x1="0" y1="0" x2="0" y2="-45" stroke="#4f46e5" strokeWidth="2" />
                        <rect x="-35" y="-62" width="70" height="22" rx="6" fill="#4f46e5" />
                        <text
                          x="0"
                          y="-47"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="bold"
                          className="font-mono"
                        >
                          {formatNumber(sum)}
                        </text>
                      </g>
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>
        )}

        {/* MODEL 2: TAPE DIAGRAM / BAR MODEL */}
        {modelType === 'bar-model' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* Top Whole Summary */}
            <div className="text-center">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Whole (Total Sum)</span>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                {formatNumber(sum)}
              </div>
            </div>

            {/* Whole Bar Bracket */}
            <div className="relative pt-6 pb-2">
              <div className="h-16 w-full rounded-2xl flex overflow-hidden border-2 border-slate-900/10 dark:border-white/10 shadow-inner">
                {/* Part A Bar */}
                <motion.div
                  style={{ width: `${pctA}%` }}
                  className="bg-blue-500 dark:bg-blue-600 flex flex-col items-center justify-center text-white px-2 transition-all relative group"
                >
                  <span className="text-xs font-medium opacity-90 truncate">Part 1</span>
                  <span className="text-lg font-bold font-mono truncate">{formatNumber(numA)}</span>
                  <span className="text-[10px] opacity-75">{pctA}%</span>
                </motion.div>

                {/* Part B Bar */}
                <motion.div
                  style={{ width: `${pctB}%` }}
                  className="bg-indigo-600 dark:bg-indigo-500 flex flex-col items-center justify-center text-white px-2 transition-all relative group"
                >
                  <span className="text-xs font-medium opacity-90 truncate">Part 2</span>
                  <span className="text-lg font-bold font-mono truncate">{formatNumber(numB)}</span>
                  <span className="text-[10px] opacity-75">{pctB}%</span>
                </motion.div>
              </div>

              {/* Arithmetic Relationship Equation */}
              <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/70 dark:border-slate-800">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  Part A ({formatNumber(numA)})
                </span>
                <span className="text-slate-400">+</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  Part B ({formatNumber(numB)})
                </span>
                <span className="text-slate-400">=</span>
                <span className="font-bold text-slate-900 dark:text-white underline underline-offset-4 decoration-indigo-500">
                  Whole ({formatNumber(sum)})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* MODEL 3: TEN-FRAMES & DOT MATRIX */}
        {modelType === 'ten-frames' && (
          <div className="space-y-6">
            {!isDotModelSupported ? (
              <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Ten-frames are best suited for positive integers where the sum is $\le 120$.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Current inputs ({numA} + {numB} = {sum}) exceed this range. Switch to the Number Line or Tape Diagram to view arbitrary or large numbers!
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-md bg-blue-500 inline-block" /> Number 1: {numA}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-md bg-indigo-500 inline-block" /> Number 2: {numB}
                    </span>
                  </div>
                  <span>Total dots: {sum} (organized in standard 10-frames of 2×5)</span>
                </div>

                {/* Render Ten-Frames */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Array.from({ length: Math.ceil(sum / 10) || 1 }).map((_, frameIdx) => {
                    const startDot = frameIdx * 10;
                    return (
                      <div
                        key={frameIdx}
                        className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 shadow-2xs"
                      >
                        <div className="text-[10px] text-slate-400 font-mono mb-1 text-center">
                          Ten-Frame {frameIdx + 1}
                        </div>
                        <div className="grid grid-cols-5 gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                          {Array.from({ length: 10 }).map((_, dotIdx) => {
                            const globalDotIndex = startDot + dotIdx;
                            const isDotA = globalDotIndex < dotsA;
                            const isDotB = globalDotIndex >= dotsA && globalDotIndex < dotsA + dotsB;
                            const isFilled = isDotA || isDotB;

                            return (
                              <div
                                key={dotIdx}
                                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                  isDotA
                                    ? 'bg-blue-500 shadow-2xs'
                                    : isDotB
                                    ? 'bg-indigo-500 shadow-2xs'
                                    : 'border border-dashed border-slate-200 dark:border-slate-700 bg-transparent'
                                }`}
                              >
                                {isFilled && (
                                  <span className="text-[9px] font-bold text-white font-mono">
                                    {globalDotIndex + 1}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
