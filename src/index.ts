import * as Snapshots from "./utils/snapshots"
import * as JsonDiff from "json-diff-ts"

const SNAPSHOT_INTERVAL_MS = 1000;
let lastSnapshot = await Snapshots.getSnapshot();

setInterval(async () => {
  const snapshot = await Snapshots.getSnapshot();

  const patches = JsonDiff.diff(lastSnapshot, snapshot);
  if (patches.length > 0) {
    console.log("Changed!", patches);
    lastSnapshot = snapshot;
  }
}, SNAPSHOT_INTERVAL_MS);
