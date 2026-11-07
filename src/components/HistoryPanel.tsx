import React from 'react';
import { CalculationRecord } from '../types/math';
import { formatNumber } from '../utils/mathUtils';
import { Trash2, Copy, Download, ArrowUpRight, Check, History as HistoryIcon } from 'lucide-react';

interface HistoryPanelProps {
  history: CalculationRecord[];
  onSelectRecord: (record: CalculationRecord) => void;
  onClearHistory: () => void;
  onDeleteRecord: (id: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelectRecord,
  onClearHistory,
  onDeleteRecord,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (record: CalculationRecord) => {
    navigator.clipboard.writeText(record.formattedFormula);
    setCopiedId(record.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Timestamp,Number 1,Number 2,Sum']
        .concat(
          history.map(
            (r) =>
              `"${new Date(r.timestamp).toISOString()}",${r.a},${r.b},${r.sum}`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `addition_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cumulativeSum = history.reduce((acc, curr) => acc + curr.sum, 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <HistoryIcon className="w-4 h-4 text-indigo-500" />
            Calculation History & Session Tally
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Past additions from this session with grand total tally
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClearHistory}
              className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <HistoryIcon className="w-10 h-10 mx-auto stroke-[1.2] mb-3 opacity-40" />
          <p className="text-sm font-medium">No calculations yet</p>
          <p className="text-xs mt-1">Add any two numbers in the calculator to record them here.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {/* Cumulative Total Strip */}
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                Cumulative Sum of All Additions
              </span>
              <p className="text-xs text-indigo-600/80 dark:text-indigo-400">
                Total from {history.length} addition {history.length === 1 ? 'operation' : 'operations'}
              </p>
            </div>
            <div className="text-2xl font-extrabold font-mono text-indigo-700 dark:text-indigo-300">
              {formatNumber(cumulativeSum)}
            </div>
          </div>

          {/* Records List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.map((record) => (
              <div
                key={record.id}
                className="py-3 flex items-center justify-between gap-4 group hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-mono font-medium text-slate-900 dark:text-white">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">{formatNumber(record.a)}</span>
                    <span className="mx-2 text-slate-400">+</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{formatNumber(record.b)}</span>
                    <span className="mx-2 text-slate-400">=</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatNumber(record.sum)}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(record)}
                    title="Copy formula"
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  >
                    {copiedId === record.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => onSelectRecord(record)}
                    title="Load into Calculator"
                    className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-xs"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Load</span>
                  </button>
                  <button
                    onClick={() => onDeleteRecord(record.id)}
                    title="Delete record"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
