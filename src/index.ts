#!/usr/bin/env bun

import { Command } from 'commander';
import { watchCommand } from './cli/watch/index.js';

const program = new Command();

program
  .name('plasma-diff')
  .description('plasma-manager that reviews the state every interval and accumulates them')
  .version('0.0.1');

program.addCommand(watchCommand);

program.parse();

if (process.argv.length <= 2) {
  program.help();
}
