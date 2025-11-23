import { type } from "arktype";
import { DEFAULT_INTERVAL } from "../../constants";
import { Command } from "commander"

export const optionsSchema = type({
  "file?": "string",
  "interval": type("string.integer | undefined").pipe(s => s === undefined ? DEFAULT_INTERVAL : parseInt(s)),
  "open?": "boolean",
});

export type Options = typeof optionsSchema.infer;

export function parseOptions(_opts: any): Options {
  const options = optionsSchema(_opts);
  if (options instanceof type.errors) {
    console.error("ERROR on Options");
    console.log(options.summary);
    process.exit(1);
  }
  return options;
}

export function setupOptions(command: Command) {
  command
    .option('-i, --interval <ms>', 'Interval in Milisseconds', DEFAULT_INTERVAL.toString())
    .option('-f, --file <filename>', 'Nix file to apply the accumulated changes', undefined)
    .option('-o, --open', 'Open, in default $EDITOR, the specified file after operations are done', false)
}
