import { createCeramic } from "./create-ceramic.js";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { StreamID } from "@ceramicnetwork/streamid";
import { CeramicApi } from "@ceramicnetwork/common";
import { tagged } from "./benchie/benchmark.js";

tagged("single-node").scenario("Load stream that is pinned", (perform) => {
  let streamId: StreamID;
  let ceramic: CeramicApi;

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
    const tile = await TileDocument.create(ceramic, content0, undefined, {
      anchor: false,
      publish: false,
    });
    const content1 = { foo: `world-${Math.random()}` };
    await tile.update(content1, undefined, { anchor: false, publish: false });
    await ceramic.pin.add(tile.id);
    streamId = tile.id;
  });

  perform.times(50).run(async () => {
    await TileDocument.load(ceramic, streamId);
  });
});
