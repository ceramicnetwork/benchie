import { IScenarioResult } from "./scenario-result";

const groupResults = (
  results: IScenarioResult[]
): Map<string, IScenarioResult[]> => {
  const grouped = new Map<string, IScenarioResult[]>();
  for (let r of results) {
    const found = grouped.get(r.filepath.href) || [];
    grouped.set(r.filepath.href, found.concat(r));
  }

  return grouped;
};
export class ResultsOutputText {
  constructor(readonly results: IScenarioResult[], readonly dir: URL) {}

  print() {
    const grouped = groupResults(this.results);
    for (let [href, results] of grouped.entries()) {
      const filepath = new URL(href);
      const filename = filepath.href.replace(this.dir.href, "");
      console.log(filename);
      for (let r of results) {
        console.log(`  ${r.title}`);
        console.log(`    mean: ${r.stats.mean.toFixed(3)}`);
        console.log(`    min: ${r.stats.min.toFixed(3)}`);
        console.log(`    max: ${r.stats.max.toFixed(3)}`);
        // console.log(`    error: ${r.stats.error.toString(3)}`);
      }
    }
  }
}

export class ResultsOutputJSON {
  constructor(readonly results: IScenarioResult[], readonly dir: URL) {}

  print() {
    const grouped = groupResults(this.results);
    const output = {};
    for (let [href, results] of grouped.entries()) {
      const filepath = new URL(href);
      const filename = filepath.href.replace(this.dir.href, "");
      output[filename] = {};
      for (let r of results) {
        Object.assign(output[filename], {
          [r.title]: {
            samples: r.stats.samples,
            mean: r.stats.mean.toFixed(3),
            min: r.stats.min.toFixed(3),
            max: r.stats.max.toFixed(3),
          },
        });
      }
    }
    console.log(JSON.stringify(output, null, 2));
  }
}
