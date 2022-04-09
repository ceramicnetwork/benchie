# Ceramic performance testing suite

Measuring performance of Ceramic nodes.

## Table of contents

- [Background](#background)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Background

As a developers of a Ceramic network, we would like to have a repeatable way of measuring node performance.
This repository contains performance scenarios as well as a toolkit to run them.

In essence, a scenario executes a single function many times (configurable). We measure how much time each run takes.
After all runs are processed, we calculate statistics - average, minimum, maximum.
We understand that some preparations might be required for the function to run. Current API allows a developer to specify
`beforeAll`, `beforeEach`, `afterAll`, `afterEach`, similar to Jest - to perform adequate tear-up and tear-down.
These do not contribute to measurements.

The performance suite is a macro-benchmark, as opposed to a micro-benchmark. We do not have to worry much about GC interference.
All code is written as ES modules, to be able to use Ceramic packages written as ES modules.

## Usage

Before running the suite:

- download the repository
- `npm install`
- `npm run build`

### Running performance suite

The whole suite is written in TypeScript. We do not want to deal with TypeScript compilation inside our code.
We expect an engineer to compile the suite to JavaScript via `npm run build` before running.

There are two options to run the suite:

1. `node ./dist/benchie/bin/benchie.js`

   It will find all the `*.bench.js` files in the current directory and use them as a source of performance scenarios.
   These `*.bench.js` files are compiled from TypeScript. Sources are in `*.bench.ts` files.

2. `npm run start`

   It is an alias for the command above.

The results are printed to `STDOUT` by default. You could see additional options by running the same `benchie` executable with `--help` flag:

- `node ./dist/benchie/bin/benchie.js --help` or
- `npm run start -- --help`.

The configuration can be adjusted through your `.env` file. Defaults are provided in `.env.defaults`.

### Writing scenario

A scenario file name should have a name conforming to `*.bench.ts` glob.
Feel free to put it anywhere inside `/src` folder. One file could contain multiple scenarios.

We strive to make a scenario code similar to [Jest](https://jestjs.io) test. Generally, a scenario looks like this:

```typescript
import { scenario } from "./benchie/benchmark.js"; // If the scenario file is in `/src`

scenario("Scenario Title", (perform) => {
  perform.tagged('first', 'second'); // Optional. Can later run only scenarios with specific tags.
  // Place for ancillary stuff: variables, helper functions, etc.

  perform.beforeAll(async () => {
    // Code to be executed once before all the runs.
    // It does not affect performance metrics.
  });

  perform.beforeEach(async () => {
    // Code to be executed before each run.
    // It does not affect performance metrics.
  });

  perform.afterAll(async () => {
    // Code to be executed once after all the runs.
    // It does not affect performance metrics.
  });

  perform.afterEach(async () => {
    // Code to be executed after each run.
    // It does not affect performance metrics.
  });

  perform.times(1).run(async () => {
    // Measured code: single run.
    // Executed just `1` time here. You could pass any suitable number instead.
  });
});
```

Hooks like `beforeAll`, `beforeEach`, `afterAll`, `afterEach` are optional. Feel free to only use them when needed.
You do not have to worry about how much time a hook takes. Hook execution time do not contribute to performance metrics.

### Internals

**Processing:** `benchie` executable by default tries to load every `*.bench.js` file in the current folder.
It then parses every scenario there. After all the loading is done,
it starts to sequentially run the scenarios.

**Folder layout:** All the code should be written in TypeScript. The files should be located in `/src` folder.
A file that contains a scenario should be named `*.bench.ts`. A bench-file should not import other bench-file.
It could import any other files though, so feel free to extract valuable shared functionality into own files.
While you are free to use any folder structure for the bench-files in `/src`, it is advised not to put any scenarios
to `/src/benchie`. This folder contains infrastructure for the scenario runner.

## Contributing

We are happy to accept small and large contributions, feel free to make a suggestion or submit a pull request.

## License

[MIT](https://tldrlegal.com/license/mit-license) or [Apache-2.0](<https://tldrlegal.com/license/apache-license-2.0-(apache-2.0)>)
