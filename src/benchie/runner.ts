import glob from "fast-glob";
import {
  IScenarioResult,
  IScenariosPerFile,
  ScenarioResult,
} from "./scenario-result.js";
import { scenarios } from "./benchmark.js";

export class Runner {
  constructor(readonly rootDir: URL) {}

  async run(): Promise<IScenarioResult[]> {
    const benchFiles = await glob(`${this.rootDir.pathname}/**/*.bench.js`).then(
      (results) => results.filter((path) => !path.includes("node_modules"))
    );
    let filenamesAndScenarios: IScenariosPerFile[] = [];
    for (let entry of benchFiles) {
      const fullFilePath = new URL(`file://${entry}`);
      const before = scenarios.length;
      await import(fullFilePath.href);
      const after = scenarios.length;
      const added = scenarios.slice(before, after);
      filenamesAndScenarios.push({
        filepath: fullFilePath,
        scenarios: added,
      });
    }
    const results: IScenarioResult[] = [];
    for (let file of filenamesAndScenarios) {
      for (let scenario of file.scenarios) {
        const stats = await scenario.run();
        results.push(new ScenarioResult(file.filepath, scenario.title, stats));
      }
    }
    return results;
  }
}
