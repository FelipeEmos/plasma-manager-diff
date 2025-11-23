import * as Plasma from "./plasma"
import * as JsonDiff from "json-diff-ts"

class SnapshotsWatcher {
  private firstSnapshot: any
  private lastSnapshot: any
  private watcherIntervalId: NodeJS.Timeout | null = null

  constructor() { }

  async init() {
    this.firstSnapshot = await Plasma.takeSnapshot("first_snapshot")
    this.lastSnapshot = this.firstSnapshot;
  }

  start(intervalMs: number, opts?: { onChange?: (patches: JsonDiff.IChange[]) => void }): void {
    if (this.firstSnapshot === undefined) {
      console.error("You must 'init' the watcher before starting it");
      return
    }
    if (this.watcherIntervalId !== null) {
      console.warn("Watcher is already running")
      return
    }

    this.lastSnapshot = this.firstSnapshot;
    this.watcherIntervalId = setInterval(async () => {
      const newSnapshot = await Plasma.takeSnapshot("current_snapshot")

      const patches = JsonDiff.diff(this.lastSnapshot, newSnapshot)
      if (patches.length > 0) {
        this.lastSnapshot = newSnapshot
        opts?.onChange?.(patches);
      }
    }, intervalMs)
  }

  stop(): void {
    if (this.watcherIntervalId !== null) {
      clearInterval(this.watcherIntervalId)
      this.watcherIntervalId = null
    }
  }

  getTotalDiff() {
    return JsonDiff.diff(this.firstSnapshot, this.lastSnapshot)
  }
}

export default SnapshotsWatcher
