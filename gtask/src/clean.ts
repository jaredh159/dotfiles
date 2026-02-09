import { readdirSync, existsSync, rmSync } from "node:fs";
import { join, basename } from "node:path";
import { parseBranchFromDir } from "./parse.ts";
import { exec, execSafe } from "./exec.ts";
import { red, green } from "./color.ts";
import { TASKS_DIR, REPO, DEV_PORTS } from "./constants.ts";

function getMergedPrCount(branch: string): number {
  const result = execSafe(
    `gh pr list --repo ${REPO} --head "${branch}" --state merged --json number --jq 'length'`
  );
  return parseInt(result, 10) || 0;
}

function killDevPorts(): void {
  for (const port of DEV_PORTS) {
    const pids = execSafe(`lsof -ti:${port}`);
    if (pids) {
      for (const pid of pids.split("\n").filter(Boolean)) {
        execSafe(`kill -9 ${pid}`);
      }
    }
  }
}

function killTmuxForDir(dir: string): void {
  const dirname = basename(dir);
  execSafe(`tmux kill-session -t "${dirname}"`);

  const panes = execSafe(`tmux list-panes -a -F '#{pane_id} #{pane_current_path}'`);
  for (const line of panes.split("\n").filter(Boolean)) {
    const spaceIdx = line.indexOf(" ");
    if (spaceIdx === -1) continue;
    const paneId = line.slice(0, spaceIdx);
    const panePath = line.slice(spaceIdx + 1);
    if (panePath.startsWith(dir)) {
      execSafe(`tmux kill-pane -t "${paneId}"`);
    }
  }
}

export async function clean(): Promise<void> {
  if (!existsSync(TASKS_DIR)) {
    console.error(`Tasks directory not found: ${TASKS_DIR}`);
    process.exit(1);
  }

  const entries = readdirSync(TASKS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  const toDelete: string[] = [];
  const toKeep: string[] = [];

  for (const dirname of entries) {
    const branch = parseBranchFromDir(dirname);
    if (!branch) continue;

    const merged = getMergedPrCount(branch);
    if (merged > 0) {
      toDelete.push(join(TASKS_DIR, dirname));
    } else {
      toKeep.push(dirname);
    }
  }

  for (const dir of toDelete) {
    console.log(red(`removing: ${basename(dir)}`));
  }

  for (const dirname of toKeep) {
    console.log(green(`keeping:  ${dirname}`));
  }

  killDevPorts();

  for (const dir of toDelete) {
    killTmuxForDir(dir);
  }

  for (const _pass of [1, 2]) {
    for (const dir of toDelete) {
      if (existsSync(dir)) {
        try {
          rmSync(dir, { recursive: true, force: true });
        } catch {}
      }
    }
  }
}
