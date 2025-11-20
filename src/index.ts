import SnapshotsWatcher from "./snapshots-watcher";

const watcher = new SnapshotsWatcher();
await watcher.init();
watcher.start(1000, { onChange: (patches) => console.log(JSON.stringify(patches, null, 2)) })
