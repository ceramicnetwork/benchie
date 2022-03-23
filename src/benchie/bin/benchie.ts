#!/usr/bin/env node

import dotenv from "dotenv";
import process from "node:process";
import { Runner } from "../runner.js";
import { program, Option } from "commander";
import { ResultsOutputText } from "../results-output.js";
import path from "node:path";

dotenv.config({
  path: ".env.defaults",
});
dotenv.config({
  path: ".env",
  override: true,
});

const cwd = new URL(`file://${process.cwd()}/`);

program
  .name("benchie")
  .description("Measure performance of a Ceramic node")
  .option(
    "-d, --dir [dir]",
    "Directory to parse, default is current working dir",
    "."
  )
  .addOption(
    new Option("-f, --format [format]", "Output format")
      .choices(["text", "json"])
      .default("text")
  )
  .parse();

async function main() {
  const options = program.opts();
  const dir = new URL(
    `file://${path.resolve(new URL(options.dir, cwd).pathname)}/`
  );

  const runner = new Runner(dir);
  const results = await runner.run();
  switch (options.format) {
    case "text": {
      new ResultsOutputText(results, dir).print();
      break;
    }
    case "json": {
      throw new Error(`JSON output is not supported yet`);
    }
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
