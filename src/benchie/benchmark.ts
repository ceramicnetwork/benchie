import { IScenarioStats, ScenarioStats } from "./scenario-stats.js";

export let scenarios: IScenario[] = [];

export type Task = () => Promise<void>;

export interface IMethodBuilder {
  times(n: number): IMethodBuilder;
  run(task: Task): void;
}

export interface IScenarioBuilder extends IMethodBuilder {
  beforeEach(task: Task): void;
  beforeAll(task: Task): void;
}

export interface IMethod {
  run(body: Task, beforeEach?: Task): Promise<IScenarioStats>;
}

export interface IScenarioParams {
  title: string;
  body: Task;
  method: IMethod;
  beforeAll?: Task;
  beforeEach?: Task;
}

export class Method implements IMethod {
  constructor(readonly times: number, readonly warmup: number = 10) {}

  async run(body: Task, beforeEach?: Task): Promise<IScenarioStats> {
    let samples: number[] = [];
    for (let i = 0; i <= this.times + this.warmup; i++) {
      if (beforeEach) await beforeEach();
      const before = Date.now();
      await body();
      const after = Date.now();
      samples.push(after - before);
    }
    samples.splice(0, this.warmup);
    return new ScenarioStats(samples);
  }
}

export interface IScenario {
  title: string;
  run(): Promise<IScenarioStats>;
}

export class Scenario implements IScenario {
  private readonly beforeAll?: Task;
  private readonly beforeEach?: Task;
  private readonly method: IMethod;
  private readonly body: Task;
  readonly title: string;

  constructor(params: IScenarioParams) {
    this.beforeAll = params.beforeAll;
    this.beforeEach = params.beforeEach;
    this.method = params.method;
    this.body = params.body;
    this.title = params.title;
  }

  async run(): Promise<IScenarioStats> {
    if (this.beforeAll) {
      await this.beforeAll();
    }
    return this.method.run(this.body, this.beforeEach);
  }
}

export class ScenarioBuilder implements IScenarioBuilder {
  private params: Partial<IScenarioParams>;

  get scenario(): IScenario {
    const body = this.params.body;
    if (!body) throw new Error(`Body must be present`);
    const method = this.params.method;
    if (!method) throw new Error(`Method must be present`);
    return new Scenario({
      body: body,
      method: method,
      title: this.params.title,
      beforeEach: this.params.beforeEach,
      beforeAll: this.params.beforeAll,
    });
  }

  constructor(title: string) {
    this.params = { title };
  }

  beforeAll(task: Task): void {
    this.params.beforeAll = task;
  }

  beforeEach(task: Task): void {
    this.params.beforeEach = task;
  }

  run(task: Task): void {
    this.params.body = task;
  }

  times(n: number): IMethodBuilder {
    this.params.method = new Method(n);
    return this;
  }
}

export function scenario(
  title: string,
  fn: (builder: IScenarioBuilder) => void
) {
  const builder = new ScenarioBuilder(title);
  fn(builder);
  scenarios.push(builder.scenario);
}
