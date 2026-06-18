import { execFileSync } from "node:child_process";
import { basename, relative } from "node:path";
import { TASKS_DIR } from "./constants.ts";
import { currentTaskRoot } from "./task-root.ts";
import { parseBranchFromDir } from "./parse.ts";

const DEFAULT_SESSION = "sidewatch";

function tmux(args: string[]): string {
  return execFileSync("tmux", args, {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function tmuxInherit(args: string[]): void {
  execFileSync("tmux", args, { stdio: "inherit" });
}

function hasWindow(session: string, windowName: string): boolean {
  const windows = tmux(["list-windows", "-t", session, "-F", "#W"]);
  return windows.split("\n").includes(windowName);
}

export function sidewatchWindowName(taskRoot: string): string {
  const dirname = basename(taskRoot);
  return parseBranchFromDir(dirname) ?? dirname;
}

export function sidewatch(): void {
  let taskRoot: string;
  try {
    taskRoot = currentTaskRoot();
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    process.exit(1);
  }

  const session = process.env.GTASK_SIDEWATCH_SESSION ?? DEFAULT_SESSION;
  const windowName = sidewatchWindowName(taskRoot);
  const target = `${session}:${windowName}`;

  try {
    tmux(["has-session", "-t", session]);
  } catch {
    console.error(`tmux session not found: ${session}`);
    process.exit(1);
  }

  if (hasWindow(session, windowName)) {
    tmuxInherit(["select-window", "-t", target]);
    console.log(`selected existing ${target}`);
    return;
  }

  tmuxInherit(["new-window", "-t", `${session}:`, "-n", windowName, "-c", taskRoot]);
  tmuxInherit(["split-window", "-t", target, "-h", "-p", "50", "-c", taskRoot]);
  tmuxInherit(["split-window", "-t", `${target}.2`, "-v", "-p", "50", "-c", taskRoot]);
  tmuxInherit(["select-pane", "-t", `${target}.1`]);
  tmuxInherit(["select-window", "-t", target]);

  console.log(`created ${target} for ${relative(TASKS_DIR, taskRoot)}`);
}
