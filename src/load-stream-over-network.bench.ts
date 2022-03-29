import { createCeramic } from "./create-ceramic.js";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { StreamID } from "@ceramicnetwork/streamid";
import { CeramicApi } from "@ceramicnetwork/common";
import { scenario } from "./benchie/benchmark.js";

scenario("Load stream over network", (perform) => {
  let streamId: StreamID;
  let primaryCeramic: CeramicApi;
  let secondaryCeramic: CeramicApi;

  perform.beforeAll(async () => {
    primaryCeramic = await createCeramic(process.env.CERAMIC_ENDPOINT);
    secondaryCeramic = await createCeramic(
      process.env.SECONDARY_CERAMIC_ENDPOINT
    );
  });

  perform.beforeEach(async () => {
    const content0 = {
      foo: `hello-${Math.random()}`,
    };
    const tile = await TileDocument.create(secondaryCeramic, content0, null, {
      anchor: false,
      pin: true,
    });
    const content1 = { foo: `world-${Math.random()}` };
    await tile.update(content1, null, { anchor: false, pin: true });

    streamId = tile.id;
  });

  perform.times(100).run(async () => {
    await TileDocument.load(primaryCeramic, streamId);
  });
});
