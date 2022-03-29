import { createCeramic } from "./create-ceramic.js";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { StreamID } from "@ceramicnetwork/streamid";
import { CeramicApi } from "@ceramicnetwork/common";
import { scenario } from "./benchie/benchmark.js";

scenario("Load stream that is pinned", (perform) => {
  let streamId: StreamID;
  let ceramic: CeramicApi;

  perform.beforeAll(async () => {
    ceramic = await createCeramic();
  });

  perform.beforeEach(async () => {
    const content0 = {
      foo: `hello-${Math.random()}`,
    };
    const tile = await TileDocument.create(ceramic, content0);
    const content1 = { foo: `world-${Math.random()}` };
    await tile.update(content1);
    await ceramic.pin.add(tile.id);
    streamId = tile.id;
  });

  perform.times(100).run(async () => {
    await TileDocument.load(ceramic, streamId);
  });
});
