import { createCeramic } from "./create-ceramic.js";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { StreamID } from "@ceramicnetwork/streamid";
import { CeramicApi } from "@ceramicnetwork/common";
import { tagged } from "./benchie/benchmark.js";

const NUMBER_OF_COMMITS = 100;

tagged("multi-node").scenario(
  "Load stream with many commits over network",
  (perform) => {
    let streamId: StreamID;
    let primaryCeramic: CeramicApi;
    let secondaryCeramic: CeramicApi;

    perform.beforeAll(async () => {
      primaryCeramic = await createCeramic(process.env.CERAMIC_ENDPOINT);
      secondaryCeramic = await createCeramic(
        process.env.SECONDARY_CERAMIC_ENDPOINT
      );
    });

    perform.afterAll(async () => {
      await primaryCeramic.close();
      await secondaryCeramic.close();
    });

    perform.beforeEach(async () => {
      const content0 = {
        foo: `hello-${Math.random()}`,
      };
      const tile = await TileDocument.create(secondaryCeramic, content0, null, {
        anchor: false,
        pin: true,
        publish: false,
      });

      for (let i = 0; i < NUMBER_OF_COMMITS; i++) {
        const content1 = { foo: `world-${Math.random()}` };
        await tile.update(content1, null, {
          anchor: false,
          pin: true,
          publish: false,
        });
      }

      streamId = tile.id;
    });

    perform.times(10).run(async () => {
      await TileDocument.load(primaryCeramic, streamId);
    });
  }
);
