import { TMP_LOCATION } from "./constants";

export async function takeSnapshot(name?: string) {
  const currentTime = new Date().toISOString();

  const filePath = `${TMP_LOCATION}/${name || currentTime}.nix`
  await Bun.$`mkdir -p ${TMP_LOCATION}`

  await Bun.$`rc2nix > ${filePath}`
  return await Bun.$`nix eval --json --file ${filePath}`.json();
}
