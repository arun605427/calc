export interface CalculationRecord {
  id: string;
  a: number;
  b: number;
  sum: number;
  timestamp: number;
  formattedFormula: string;
}

export interface ColumnStep {
  columnIndex: number; // 0 is leftmost in display
  columnName: string; // e.g., "Hundreds", "Tens", "Ones", "Tenths"
  topDigit: number | null;
  bottomDigit: number | null;
  incomingCarry: number;
  outgoingCarry: number;
  columnSum: number;
  resultDigit: number | string;
  explanation: string;
}

export interface ColumnBreakdown {
  isDecimal: boolean;
  carries: (number | null)[];
  topRow: (string | number)[];
  bottomRow: (string | number)[];
  sumRow: (string | number)[];
  steps: ColumnStep[];
  labels: string[];
}

export type ViewMode = 'calculator' | 'visuals' | 'practice' | 'history';

export type VisualModelType = 'number-line' | 'bar-model' | 'ten-frames';

export type PracticeDifficulty = 'single' | 'double' | 'triple' | 'decimals' | 'speed';
