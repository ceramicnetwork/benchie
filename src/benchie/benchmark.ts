import { IScenarioStats, ScenarioStats } from "./scenario-stats.js";

export let scenarios: IScenario[] = [];

export type Task = () => Promise<void>;

export interface IMethodBuilder {
  times(n: number): IMethodBuilder;
  run(task: Task): void;
}

export interface IScenarioBuilder extends IMethodBuilder {
  tagged(...tags: string[]): IScenarioBuilder;
  beforeEach(task: Task): void;
  beforeAll(task: Task): void;
  afterAll(task: Task): void;
  afterEach(task: Task): void;
}

export interface IMethod {
  run(body: Task, beforeEach?: Task, afterEach?: Task): Promise<IScenarioStats>;
}

export interface IScenarioParams {
  title: string;
  body: Task;
  method: IMethod;
  tags: Set<string>;
  beforeAll?: Task;
  beforeEach?: Task;
  afterAll?: Task;
  afterEach?: Task;
}

export class Method implements IMethod {
  constructor(readonly times: number, readonly warmup: number = 0) {}

  async run(
    body: Task,
    beforeEach?: Task,
    afterEach?: Task
  ): Promise<IScenarioStats> {
    let samples: number[] = [];
    for (let i = 0; i <= this.times + this.warmup - 1; i++) {
      if (beforeEach) await beforeEach();
      const before = Date.now();
      await body();
      const after = Date.now();
      samples.push(after - before);
      if (afterEach) await afterEach();
    }
    samples.splice(0, this.warmup);
    return new ScenarioStats(samples);
  }
}

export interface IScenario {
  title: string;
  tags: Set<string>;
  run(): Promise<IScenarioStats>;
}

export class Scenario implements IScenario {
  private readonly beforeAll?: Task;
  private readonly beforeEach?: Task;
  private readonly afterAll?: Task;
  private readonly afterEach?: Task;
  private readonly method: IMethod;
  private readonly body: Task;
  readonly title: string;
  readonly tags: Set<string>;

  constructor(params: IScenarioParams) {
    this.beforeAll = params.beforeAll;
    this.afterAll = params.afterAll;
    this.beforeEach = params.beforeEach;
    this.afterEach = params.afterEach;
    this.method = params.method;
    this.body = params.body;
    this.title = params.title;
    this.tags = params.tags;
  }

  async run(): Promise<IScenarioStats> {
    if (this.beforeAll) {
      await this.beforeAll();
    }
    const stats = await this.method.run(
      this.body,
      this.beforeEach,
      this.afterEach
    );
    if (this.afterAll) {
      await this.afterAll();
    }
    return stats;
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
      afterEach: this.params.afterEach,
      beforeAll: this.params.beforeAll,
      afterAll: this.params.afterAll,
      tags: this.params.tags,
    });
  }

  constructor(title: string, tags: Set<string>) {
    this.params = { title, tags };
  }

  beforeAll(task: Task): void {
    this.params.beforeAll = task;
  }

  beforeEach(task: Task): void {
    this.params.beforeEach = task;
  }

  afterAll(task: Task): void {
    this.params.afterAll = task;
  }

  afterEach(task: Task): void {
    this.params.afterEach = task;
  }

  tagged(...tags: string[]): this {
    this.params.tags = new Set(tags);
    return this;
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
  const builder = new ScenarioBuilder(title, new Set());
  fn(builder);
  scenarios.push(builder.scenario);
}
