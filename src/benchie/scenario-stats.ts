function calculateMean(samples: number[]): number {
  const sum = samples.reduce((a, b) => a + b, 0);
  return sum / samples.length;
}

function calculateMedian(values: number[]): number {
  const sorted = values.slice().sort((a, b) => a - b);
  const halfIndex = Math.floor(sorted.length / 2);

  const hasCenterEntry = sorted.length % 2;
  if (hasCenterEntry) {
    return sorted[halfIndex];
  } else {
    return (values[halfIndex - 1] + values[halfIndex]) / 2.0;
  }
}

// function calculateError(samples: number[], mean: number): number {
//   const squaredDeviationsSum = samples.reduce((acc, x) => {
//     const deviation = x - mean;
//     const squaredDeviation = Math.pow(deviation, 2);
//     return acc + squaredDeviation;
//   }, 0);
//   return ((squaredDeviationsSum / samples.length) * 2) / mean;
// }

export interface IScenarioStats {
  readonly samples: number[];
  readonly mean: number;
  readonly median: number;
  // readonly error: number;
  readonly max: number;
  readonly min: number;
}

export class ScenarioStats implements IScenarioStats {
  readonly mean: number;
  readonly median: number;
  // readonly error: number;
  readonly max: number;
  readonly min: number;

  constructor(readonly samples: number[]) {
    this.mean = calculateMean(samples);
    // this.error = calculateError(samples, this.mean);
    this.max = samples.reduce((a, b) => (a > b ? a : b));
    this.min = samples.reduce((a, b) => (a < b ? a : b));
    this.median = calculateMedian(samples);
  }
}
