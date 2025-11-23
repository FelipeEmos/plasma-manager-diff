#!/usr/bin/env bun

import { Command } from 'commander';
import SnapshotsWatcher from './snapshots-watcher.js';

const program = new Command();

program
  .name('plasma-diff')
  .description('Monitor de diferenças do Plasma')
  .version('0.0.1');

program
  .command('watch')
  .description('Inicia o monitoramento')
  .option('-i, --interval <ms>', 'Intervalo em ms', '1000')
  .action(async (options) => {
    const watcher = new SnapshotsWatcher();
    const intervalMs = parseInt(options.interval, 10);

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

    watcher.start(intervalMs, {
      onChange: (patches) => console.log(patches)
    });

    console.log(`🔍 Monitoring Plasma Config changes every ${intervalMs}ms... (Ctrl+C to stop and collect changes)`);
  });

program.parse();

if (process.argv.length <= 2) {
  program.help();
}
