#!/usr/bin/env node

import dotenv from "dotenv";
import process from "node:process";
import { Runner } from "../runner.js";
import { program, Option } from "commander";
import { ResultsOutputText, ResultsOutputJSON } from "../results-output.js";
import path from "node:path";

dotenv.config({
  path: ".env.defaults",
});
dotenv.config({
  path: ".env",
  override: true,
});
dotenv.config({
  path: ".env.local",
  override: true,
});

const cwd = new URL(`file://${process.cwd()}/`);

program
  .name("benchie")
  .description("Measure performance of a Ceramic node")
  .option(
    "-p, --pattern [filename, dirname, or glob]",
    "Pattern (filename, dirname, or glob) to match against files in your project to determine which ones to parse. You may need to quote this argument.",
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

  const runner = new Runner(options.pattern);
  const results = await runner.run();
  const currentDir = new URL(
    `file://${path.resolve(new URL(".", cwd).pathname)}/`
  );
  switch (options.format) {
    case "text": {
      new ResultsOutputText(results, currentDir).print();
      break;
    }
    case "json": {
      new ResultsOutputJSON(results, currentDir).print();
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
