import { ColumnBreakdown, ColumnStep } from '../types/math';

/**
 * Perform precise floating point addition to avoid IEEE 754 precision issues (like 0.1 + 0.2)
 */
export function preciseAdd(a: number, b: number): number {
  if (isNaN(a) || isNaN(b)) return 0;
  const aStr = a.toString();
  const bStr = b.toString();
  const aDec = aStr.includes('.') ? aStr.split('.')[1].length : 0;
  const bDec = bStr.includes('.') ? bStr.split('.')[1].length : 0;
  const maxDec = Math.max(aDec, bDec);

  const factor = Math.pow(10, Math.min(maxDec, 10));
  const result = Math.round((a + b) * factor) / factor;
  return Number(result.toFixed(Math.min(maxDec, 10)));
}

/**
 * Format number with comma thousand separators and clean decimals
 */
export function formatNumber(num: number, maximumFractionDigits: number = 8): string {
  if (isNaN(num)) return '0';
  if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

  // Format parts to keep accurate decimal representations
  const parts = num.toString().split('.');
  const integerPart = Number(parts[0]).toLocaleString('en-US');
  if (parts.length > 1) {
    const decPart = parts[1].slice(0, maximumFractionDigits);
    return `${integerPart}.${decPart}`;
  }
  return integerPart;
}

export function getPlaceValueName(power: number): string {
  switch (power) {
    case 5:
      return 'Hundred Thousands';
    case 4:
      return 'Ten Thousands';
    case 3:
      return 'Thousands';
    case 2:
      return 'Hundreds';
    case 1:
      return 'Tens';
    case 0:
      return 'Ones';
    case -1:
      return 'Tenths';
    case -2:
      return 'Hundredths';
    case -3:
      return 'Thousandths';
    default:
      if (power > 5) return `10^${power} Place`;
      return `10^(${power}) Place`;
  }
}

export function isPrime(n: number): boolean {
  if (n <= 1 || !Number.isInteger(n)) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

/**
 * Generate aligned column breakdown for step-by-step long addition.
 * Operates on positive numbers for the standard column carry algorithm.
 */
export function generateColumnBreakdown(numA: number, numB: number): ColumnBreakdown {
  const aAbs = Math.abs(numA);
  const bAbs = Math.abs(numB);

  const aStr = aAbs.toString();
  const bStr = bAbs.toString();

  const isDecimal = aStr.includes('.') || bStr.includes('.');

  let aInt = aStr.includes('.') ? aStr.split('.')[0] : aStr;
  let aDec = aStr.includes('.') ? aStr.split('.')[1] : '';
  let bInt = bStr.includes('.') ? bStr.split('.')[0] : bStr;
  let bDec = bStr.includes('.') ? bStr.split('.')[1] : '';

  const maxDecLen = Math.max(aDec.length, bDec.length);
  aDec = aDec.padEnd(maxDecLen, '0');
  bDec = bDec.padEnd(maxDecLen, '0');

  const maxIntLen = Math.max(aInt.length, bInt.length);
  aInt = aInt.padStart(maxIntLen, '0');
  bInt = bInt.padStart(maxIntLen, '0');

  // Combined digit sequences (ignoring decimal point for column iteration)
  const fullA = isDecimal ? `${aInt}.${aDec}` : aInt;
  const fullB = isDecimal ? `${bInt}.${bDec}` : bInt;

  // Compute addition column-by-column from right to left
  const steps: ColumnStep[] = [];
  const totalLength = fullA.length;

  let currentCarry = 0;
  const carryByCol: (number | null)[] = new Array(totalLength + 1).fill(null);
  const resultDigits: (string | number)[] = [];

  // Iterate right-to-left
  for (let i = totalLength - 1; i >= 0; i--) {
    const charA = fullA[i];
    const charB = fullB[i];

    if (charA === '.') {
      resultDigits.unshift('.');
      continue;
    }

    const digitA = parseInt(charA, 10);
    const digitB = parseInt(charB, 10);
    const incomingCarry = currentCarry;
    const sum = digitA + digitB + incomingCarry;
    const outDigit = sum % 10;
    const outgoingCarry = Math.floor(sum / 10);

    // Compute power of 10
    const decimalIndex = isDecimal ? fullA.indexOf('.') : fullA.length;
    let power: number;
    if (i < decimalIndex) {
      power = decimalIndex - 1 - i;
    } else {
      power = -(i - decimalIndex);
    }

    const placeName = getPlaceValueName(power);

    let explanation = '';
    if (incomingCarry > 0) {
      explanation = `${digitA} + ${digitB} + carry ${incomingCarry} = ${sum}. Write down ${outDigit}`;
    } else {
      explanation = `${digitA} + ${digitB} = ${sum}. Write down ${outDigit}`;
    }

    if (outgoingCarry > 0) {
      explanation += `, carry ${outgoingCarry} to the next column (${getPlaceValueName(power + 1)}).`;
    } else {
      explanation += `, no carry.`;
    }

    steps.push({
      columnIndex: i,
      columnName: placeName,
      topDigit: digitA,
      bottomDigit: digitB,
      incomingCarry,
      outgoingCarry,
      columnSum: sum,
      resultDigit: outDigit,
      explanation,
    });

    resultDigits.unshift(outDigit);
    currentCarry = outgoingCarry;
    carryByCol[i] = outgoingCarry > 0 ? outgoingCarry : null;
  }

  // If there's an outgoing carry remaining on the leftmost column
  if (currentCarry > 0) {
    resultDigits.unshift(currentCarry);
    // Add extra column at the left
    steps.push({
      columnIndex: -1,
      columnName: 'Carried Value',
      topDigit: 0,
      bottomDigit: 0,
      incomingCarry: currentCarry,
      outgoingCarry: 0,
      columnSum: currentCarry,
      resultDigit: currentCarry,
      explanation: `Bring down the remaining carry of ${currentCarry}.`,
    });
  }

  // Format final grid representation
  const topRowFormatted: (string | number)[] = [];
  const bottomRowFormatted: (string | number)[] = [];
  const carriesFormatted: (number | null)[] = [];
  const labelsFormatted: string[] = [];

  const leftPadNeeded = currentCarry > 0 ? 1 : 0;
  if (leftPadNeeded) {
    topRowFormatted.push(' ');
    bottomRowFormatted.push(' ');
    carriesFormatted.push(currentCarry);
    labelsFormatted.push('Carry');
  }

  for (let i = 0; i < totalLength; i++) {
    const charA = fullA[i];
    const charB = fullB[i];
    topRowFormatted.push(charA === '.' ? '.' : parseInt(charA, 10));
    bottomRowFormatted.push(charB === '.' ? '.' : parseInt(charB, 10));
    carriesFormatted.push(carryByCol[i]);

    if (charA === '.') {
      labelsFormatted.push('·');
    } else {
      const decIdx = isDecimal ? fullA.indexOf('.') : fullA.length;
      const power = i < decIdx ? decIdx - 1 - i : -(i - decIdx);
      labelsFormatted.push(getPlaceValueName(power));
    }
  }

  // Reverse steps so they are ordered step 1, step 2, step 3 (from right-most place value to leftmost)
  // steps were pushed right to left, so steps[0] is the rightmost (e.g. ones or tenths)
  return {
    isDecimal,
    carries: carriesFormatted,
    topRow: topRowFormatted,
    bottomRow: bottomRowFormatted,
    sumRow: resultDigits,
    steps,
    labels: labelsFormatted,
  };
}
