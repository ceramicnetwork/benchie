import { createCeramic } from "./create-ceramic.js";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { CeramicApi } from "@ceramicnetwork/common";
import { scenario } from "./benchie/benchmark.js";

scenario("Update stream that is pinned", (perform) => {
  let ceramic: CeramicApi;
  let tile: TileDocument;

  perform.beforeAll(async () => {
    ceramic = await createCeramic();
  });

  perform.afterAll(async () => {
    await ceramic.close();
  });

  perform.beforeEach(async () => {
    const content0 = {
      foo: `hello-${Math.random()}`,
    };
    tile = await TileDocument.create(ceramic, content0, null, {
      pin: true,
      anchor: false,
      publish: false,
    });
  });

  perform.times(50).run(async () => {
    const content1 = { foo: `world-${Math.random()}` };
    await tile.update(content1, undefined, { anchor: false, publish: false });
  });
});
