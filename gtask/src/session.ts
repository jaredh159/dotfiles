import { execFileSync } from "node:child_process";

// Derive the tmux session name for a task from its slug. The slug is already
// validated to lowercase/numbers/single-hyphens, but we defensively strip the
// chars tmux treats specially in session names ('.' and ':') and drop any
// trailing hyphen so `my-feature-` → `my-feature`.
export function taskSessionName(slug: string): string {
  return slug.replace(/[.:]/g, "-").replace(/-+$/, "");
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
// single vertical split (two side-by-side panes), so the task is ready to jump
// into. Returns the session name, or null if tmux is unavailable or fails — task
// creation must never break because of tmux.
export function openTaskSession(taskRoot: string, slug: string): string | null {
  const name = taskSessionName(slug);
  try {
    if (!sessionExists(name)) {
      tmux(["new-session", "-d", "-s", name, "-c", taskRoot]);
      tmux(["split-window", "-h", "-t", name, "-c", taskRoot]);
      tmux(["select-pane", "-t", `${name}.1`]);
    }
    return name;
  } catch {
    return null;
  }
}
