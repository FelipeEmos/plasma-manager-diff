import { processTotalDiffChanges } from "./process-total-diff-changes";
import SnapshotsWatcher from '../../snapshots-watcher';
import * as JsonDiffUtils from "../../utils/json-diff";
import * as CliOptions from "./options";
import { Command } from "commander"

export async function watchAction(_options: any) {
  const options = CliOptions.parseOptions(_options);
  const { interval: intervalMs } = options;
  const watcher = new SnapshotsWatcher();

  // Ctrl+C handler
  process.on('SIGINT', async () => {
    watcher.stop();

    // Delay Additional Interval
    await new Promise(resolve => setTimeout(resolve, options.interval));

    const totalDiff = watcher.getTotalDiff();
    await processTotalDiffChanges(options, totalDiff);

    process.exit(0);
  });

  await watcher.init();

  watcher.start(intervalMs, {
    onChange: (patches) => {
      const flattened = JsonDiffUtils.flattenChanges(patches);
      flattened.forEach(change => console.log(change));
    }
  });

  console.log(`🔍 Monitoring Plasma Config changes every ${intervalMs}ms... (Ctrl+C to stop and collect changes)`);
}

export function setupAction(command: Command) {
  command.action(watchAction);
}
