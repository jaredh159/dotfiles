import { execFileSync } from "node:child_process";
import { basename } from "node:path";

// Derive the tmux session name for a task from its directory path.
// Uses the directory basename to match what tmux-sessionizer.sh derives
// (SESSION_NAME=$(basename "$SESSION" | tr . _) — task dirs have no dots).
export function taskSessionName(taskRoot: string): string {
  return basename(taskRoot);
}

function tmux(args: string[]): void {
  execFileSync("tmux", args, { stdio: "ignore" });
}

function sessionExists(name: string): boolean {
  try {
    // `=name` forces an exact match instead of tmux's default prefix matching.
    execFileSync("tmux", ["has-session", "-t", `=${name}`], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Best-effort: spin up a detached tmux session rooted at the new task dir with a
// single vertical split (two side-by-side panes), left pane focused, so the task
// is ready to jump into. Task creation must never break because of tmux.
export function openTaskSession(taskRoot: string): void {
  const name = taskSessionName(taskRoot);
  try {
    if (sessionExists(name)) return;
    tmux(["new-session", "-d", "-s", name, "-c", taskRoot]);
  } catch {
    return;
  }
  try {
    // -b creates the new pane BEFORE (to the left of) the existing pane and
    // focuses it — so we land in the left pane with no select-pane call and
    // no dependency on base-index / pane-base-index settings.
    // Note: split-window -t takes a pane target (no = prefix).
    tmux(["split-window", "-h", "-b", "-t", name, "-c", taskRoot]);
  } catch {
    // session exists and is usable even without the split
  }
}
