import { TMP_LOCATION } from "./constants";

export async function takeSnapshot(name?: string) {
  const currentTime = new Date().toISOString();

  const filePath = `${TMP_LOCATION}/${name || currentTime}.nix`
  await Bun.$`mkdir -p ${TMP_LOCATION}`

  // NOTE: Spawn processes so the SIGINT isnt' captured
  // by them instead of the main program
  const p1 = Bun.spawn(["rc2nix"], {
    stdout: "pipe",
    stderr: "ignore",
  });
  await p1.exited;
  const p1_out = await p1.stdout.text();
  await Bun.write(filePath, p1_out);


  // NOTE: Spawn processes so the SIGINT isnt' captured
  // by them instead of the main program
  const p2 = Bun.spawn(["nix", "eval", "--json", "--file", filePath], {
    stdout: "pipe",
    stderr: "ignore",
  });
  await p2.exited;
  const p2_out = await p2.stdout.text();
  return JSON.parse(p2_out);
}
