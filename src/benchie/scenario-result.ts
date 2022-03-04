import type { IScenarioStats } from "./scenario-stats.js";
import type { IScenario } from "./benchmark.js";

export interface IScenariosPerFile {
  filepath: URL;
  scenarios: IScenario[];
}

export interface IScenarioResult {
  filepath: URL;
  title: string;
  stats: IScenarioStats;
}

export class ScenarioResult implements IScenarioResult {
  constructor(
    readonly filepath: URL,
    readonly title: string,
    readonly stats: IScenarioStats
  ) {}
}
