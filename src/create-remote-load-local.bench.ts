import { createCeramic } from "./create-ceramic.js";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { StreamID } from "@ceramicnetwork/streamid";
import { StreamUtils } from "@ceramicnetwork/common";
import { scenario } from "./benchie/benchmark.js";
import type { CeramicApi, StreamState } from "@ceramicnetwork/common";
import assert from "assert";

function assertEqualState(received: StreamState, expected: StreamState) {
  const receivedSerialized = StreamUtils.serializeState(received);
  const expectedSerialized = StreamUtils.serializeState(expected);
  delete receivedSerialized.anchorStatus;
  delete receivedSerialized.anchorScheduledFor;
  delete expectedSerialized.anchorStatus;
  delete expectedSerialized.anchorScheduledFor;
  assert(StreamUtils.statesEqual(receivedSerialized, expectedSerialized));
}

scenario("Load stream across nodes", (perform) => {
  let ceramicLocal: CeramicApi;
  let ceramicRemote: CeramicApi;

  let streamId: StreamID;
  let expectedState: any;

  perform.beforeAll(async () => {
    ceramicLocal = await createCeramic();
    ceramicRemote = await createCeramic(process.env.SECONDARY_CERAMIC_ENDPOINT);
  });

  perform.beforeEach(async () => {
    // Create streams on remote node
    const content0 = {
      foo: `hello-${Math.random()}`,
    };
    const tile = await TileDocument.create(ceramicRemote, content0);
    const content1 = { foo: `world-${Math.random()}` };
    await tile.update(content1);
    expectedState = tile.state;
    // await ceramicRemote.pin.add(tile.id);
    streamId = tile.id;
  });

  perform.times(100).run(async () => {
    const fromLocal = await TileDocument.load(ceramicLocal, streamId);
    assertEqualState(fromLocal.state, expectedState);
  });
});
