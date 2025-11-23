#!/usr/bin/env bun

import { Command } from 'commander';
import SnapshotsWatcher from './snapshots-watcher.js';
import * as JsonDiff from "json-diff-ts"
import * as JsonDiffUtils from "./utils/json-diff"
import { type } from 'arktype';

const optionsSchema = type({
  "interval": type("string.integer | undefined").pipe(s => s === undefined ? 1000 : parseInt(s)),
});

type Options = typeof optionsSchema.infer;
function parseOptions(_opts: any): Options {
  const options = optionsSchema(_opts);
  if (options instanceof type.errors) {
    console.error("ERROR on Options");
    console.log(options.summary);
    process.exit(1);
  }
  return options;
}

const program = new Command();

program
  .name('plasma-diff')
  .description('Monitor de diferenças do Plasma')
  .version('0.0.1');

program
  .command('watch')
  .description('Inicia o monitoramento')
  .option('-i, --interval <ms>', 'Interval in Milisseconds', '1000')
  .option('-o, --output <filename>', 'Output nix file with all captured changes', undefined)
  .action(async (_options) => {
    const options = parseOptions(_options);
    const watcher = new SnapshotsWatcher();

    // Ctrl+C handler
    process.on('SIGINT', async () => {
      console.log('\n📝 Collecting changes...');
      watcher.stop();

      const totalDiff = watcher.getTotalDiff();
      if (totalDiff.length > 0) {
        const skeleton = JsonDiffUtils.buildSkeletonFromChanges(totalDiff);
        const resultingObj = JsonDiff.applyChangeset(skeleton, totalDiff);
        console.log(JSON.stringify(resultingObj, null, 2));
      }

      process.exit(0);
    });

    await watcher.init();

    watcher.start(options.interval, {
      onChange: (patches) => {
        const flattened = JsonDiffUtils.flattenChanges(patches);
        flattened.forEach(change => console.log(change));
      }
    });

    console.log(`🔍 Monitoring Plasma Config changes every ${options.interval}ms... (Ctrl+C to stop and collect changes)`);
  });

program.parse();

if (process.argv.length <= 2) {
  program.help();
}
