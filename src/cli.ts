#!/usr/bin/env bun

import { Command } from 'commander';
import SnapshotsWatcher from './snapshots-watcher.js';
import * as JsonDiff from "json-diff-ts"
import * as JsonDiffUtils from "./utils/json-diff"
import { type } from 'arktype';
import { TMP_LOCATION } from './constants.js';

const DEFAULT_INTERVAL = 2000;

const optionsSchema = type({
  "file?": "string",
  "interval": type("string.integer | undefined").pipe(s => s === undefined ? DEFAULT_INTERVAL : parseInt(s)),
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

async function processTotalDiffChanges(options: Options, totalDiff: JsonDiff.IChange[]) {
  const { file: filePath } = options;

  if (!totalDiff.length) {
    console.log('\n🫗 Empty changes... doing nothing');
    return;
  }
  console.log('\n📝 Collecting changes...');

  const skeleton = JsonDiffUtils.buildSkeletonFromChanges(totalDiff);
  const resultingObj = JsonDiff.applyChangeset(skeleton, totalDiff);
  console.log(JSON.stringify(resultingObj, null, 2));

  if (!filePath) {
    return;
  }

  console.log("📁 Evaluating changes into file...")

  const bunFile = Bun.file(filePath);
  const fileExists = await bunFile.exists();

  const oldContent = fileExists ? await Bun.$`nix eval --json --file ${filePath}`.json() : {};

  JsonDiffUtils.prepareObjToApplyChanges(oldContent, totalDiff);
  const newContent = JsonDiff.applyChangeset(oldContent, totalDiff);

  // Ensure temp directory exists
  await Bun.$`mkdir -p ${TMP_LOCATION}`;

  // Write temporary JSON file
  const tempJsonPath = `${TMP_LOCATION}/temp-config.json`;
  await Bun.write(tempJsonPath, JSON.stringify(newContent, null, 2));

  // Evaluate the expression with Nix and get formatted Nix output
  const nixExpression = `builtins.fromJSON (builtins.readFile ${tempJsonPath})`;
  const nixOutput = await Bun.$`nix eval --impure --expr ${nixExpression}`.text();

  // Write the formatted Nix output to file
  await Bun.write(filePath, nixOutput);

  console.log(`✅ Configuration written to ${filePath}`);
}

const program = new Command();

program
  .name('plasma-diff')
  .description('Monitor de diferenças do Plasma')
  .version('0.0.1');

program
  .command('watch')
  .description('Inicia o monitoramento')
  .option('-i, --interval <ms>', 'Interval in Milisseconds', DEFAULT_INTERVAL.toString())
  .option('-f, --file <filename>', 'Nix file to apply the accumulated changes', undefined)
  .action(async (_options) => {
    const options = parseOptions(_options);
    const { interval: intervalMs } = options;
    const watcher = new SnapshotsWatcher();

    // Ctrl+C handler
    process.on('SIGINT', async () => {
      watcher.stop();

      // Delay 1000 ms
      await new Promise(resolve => setTimeout(resolve, 500));

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
  });

program.parse();

if (process.argv.length <= 2) {
  program.help();
}
