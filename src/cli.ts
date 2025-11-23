#!/usr/bin/env bun

import { Command } from 'commander';
import SnapshotsWatcher from './snapshots-watcher.js';
import { type } from 'arktype';

const optionsSchema = type({
  "interval": type("string.integer | undefined").pipe(s => s === undefined ? 1000 : parseInt(s)),
});

export type Options = typeof optionsSchema.infer;

const program = new Command();

program
  .name('plasma-diff')
  .description('Monitor de diferenças do Plasma')
  .version('0.0.1');

program
  .command('watch')
  .description('Inicia o monitoramento')
  .option('-i, --interval <ms>', 'Intervalo em ms', '1000')
  .action(async (_options) => {
    const options = optionsSchema(_options);
    if (options instanceof type.errors) {
      console.error("ERROR on Options");
      console.log(options.summary);
      process.exit(1);
    }

    const watcher = new SnapshotsWatcher();

    // Ctrl+C handler
    process.on('SIGINT', async () => {
      console.log('\n📝 Collecting changes...');
      watcher.stop();

      const totalDiff = watcher.getTotalDiff();
      if (totalDiff.length > 0) {
        console.log('\n📊 Diff total:');
        console.log(JSON.stringify(totalDiff, null, 2));
      }

      process.exit(0);
    });

    await watcher.init();

    watcher.start(options.interval, {
      onChange: (patches) => console.log(patches)
    });

    console.log(`🔍 Monitoring Plasma Config changes every ${options.interval}ms... (Ctrl+C to stop and collect changes)`);
  });

program.parse();

if (process.argv.length <= 2) {
  program.help();
}
