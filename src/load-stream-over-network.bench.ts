import { createCeramic } from "./create-ceramic.js";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { StreamID } from "@ceramicnetwork/streamid";
import { CeramicApi } from "@ceramicnetwork/common";
import { scenario } from "./benchie/benchmark.js";
import { create } from "domain";

scenario("Load stream over network", (perform) => {
  let streamId: StreamID;
  let ceramic: CeramicApi;

  perform.beforeAll(async () => {
    const secondaryCeramic = await createCeramic(
      process.env.SECONDARY_CERAMIC_ENDPOINT
    );
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
    ceramic = await createCeramic(process.env.CERAMIC_ENDPOINT);
  });

  perform.times(1).run(async () => {
    await TileDocument.load(ceramic, streamId);
  });
});
