import glob from "fast-glob";
import {
  IScenarioResult,
  IScenariosPerFile,
  ScenarioResult,
} from "./scenario-result.js";
import { scenarios } from "./benchmark.js";
import path from "path";
import fs from "fs";

const createFileGlob = (pattern: string, absolutePath: string): string => {
  // if the pattern is not a path create a glob that returns files that include the pattern
  if (path.basename(pattern) === pattern && pattern !== ".") {
    const dir = path.dirname(absolutePath);
    const base = path.basename(absolutePath);

    return path.resolve(dir, "**", `*${base}*`);
  }

  // if the pattern is a path create a glob that returns files that extend the path
  return `${absolutePath}*`;
};

const getFiles = async (pattern: string): Promise<string[]> => {
  const globs = [];
  const absolutePath = path.resolve(process.cwd(), pattern);

  // if its a dir or a file
  if (!glob.isDynamicPattern(pattern)) {
    globs.push(createFileGlob(pattern, absolutePath));

    // if the pattern is not an actual file or is a directory we will treat it as a directory
    if (!fs.existsSync(pattern) || fs.statSync(pattern).isDirectory()) {
      const dirGlob = path.resolve(absolutePath, "**", "*.bench.js");
      globs.push(dirGlob);
    }
  } else {
    globs.push(pattern);
  }

  const allFiles = await glob(globs, {
    absolute: true,
    onlyFiles: true,
    unique: true,
    ignore: [
      path.resolve(absolutePath, "**", "node_modules", "**"),
      path.resolve("**", "node_modules", "**"),
    ],
  });

  return allFiles.filter((file) => file.endsWith(".bench.js"));
};

export class Runner {
  constructor(readonly pattern: string) {}

  async run(): Promise<IScenarioResult[]> {
    const benchFiles = await getFiles(this.pattern);

    if (benchFiles.length === 0) {
      throw new Error(`No .bench.js files found using pattern ${this.pattern}`);
    }

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
