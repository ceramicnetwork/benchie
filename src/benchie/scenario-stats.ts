function calculateMean(samples: number[]) {
  const sum = samples.reduce((a, b) => a + b, 0);
  return sum / samples.length;
}

function calculateError(samples: number[], mean: number): number {
  const squaredDeviationsSum = samples.reduce((acc, x) => {
    const deviation = x - mean;
    const squaredDeviation = Math.pow(deviation, 2);
    return acc + squaredDeviation;
  }, 0);
  return ((squaredDeviationsSum / samples.length) * 2) / mean;
}

export interface IScenarioStats {
  readonly mean: number;
  readonly error: number;
  readonly max: number;
  readonly min: number;
}

export class ScenarioStats implements IScenarioStats {
  readonly mean: number;
  readonly error: number;
  readonly max: number;
  readonly min: number;

  constructor(private readonly samples: number[]) {
    this.mean = calculateMean(samples);
    this.error = calculateError(samples, this.mean);
    this.max = samples.reduce((a, b) => (a > b ? a : b));
    this.min = samples.reduce((a, b) => (a < b ? a : b));
  }
}
