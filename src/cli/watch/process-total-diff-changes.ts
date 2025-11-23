import * as JsonDiff from "json-diff-ts";
import * as CliOptions from './options';
import { TMP_LOCATION } from '../../constants';
import * as JsonDiffUtils from "../../utils/json-diff";

export async function processTotalDiffChanges(options: CliOptions.Options, totalDiff: JsonDiff.IChange[]) {
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

  if (!options.open) {
    return;
  }
  Bun.$`xdg-open ${filePath}`;
}
