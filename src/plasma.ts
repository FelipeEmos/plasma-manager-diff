const SNAPSHOTS_LOCATION = "/tmp/plasma-manager-snapshots";

export async function takeSnapshot(name?: string) {
  const currentTime = new Date().toISOString();

  const filePath = `${SNAPSHOTS_LOCATION}/${name || currentTime}.nix`
  await Bun.$`mkdir -p ${SNAPSHOTS_LOCATION}`

  await Bun.$`rc2nix > ${filePath}`
  return await Bun.$`nix eval --json --file ${filePath}`.json();
}
