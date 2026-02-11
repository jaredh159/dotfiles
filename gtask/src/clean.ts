import { readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { parseBranchFromDir, dbNameFromDir } from "./parse.ts";
import { execSafe } from "./exec.ts";
import { background } from "./exec.ts";
import { red, green } from "./color.ts";
import { readSlot, portsForSlot } from "./slot.ts";
import { TASKS_DIR, REPO } from "./constants.ts";

function getMergedPrCount(branch: string): number {
  const result = execSafe(
    `gh pr list --repo ${REPO} --head "${branch}" --state merged --json number --jq 'length'`
  );
  return parseInt(result, 10) || 0;
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

  if (toDelete.length === 0) return;

  const portKills = toDelete.flatMap((dir) => {
    const slot = readSlot(dir);
    if (slot === null) return [];
    const ports = portsForSlot(slot);
    return Object.values(ports).map(
      (port) => `pids=$(lsof -ti:${port} 2>/dev/null) && kill -9 $pids 2>/dev/null || true`
    );
  });

  const tmuxKills = toDelete.flatMap((dir) => {
    const dirname = basename(dir);
    return [
      `tmux kill-session -t "${dirname}" 2>/dev/null || true`,
      `tmux list-panes -a -F '#{pane_id} #{pane_current_path}' 2>/dev/null | while read -r pane_id pane_path; do`,
      `  case "$pane_path" in "${dir}"*) tmux kill-pane -t "$pane_id" 2>/dev/null || true ;; esac`,
      `done`,
    ];
  });

  const dbDrops = toDelete.flatMap((dir) => {
    const dbName = dbNameFromDir(basename(dir));
    return [
      `dropdb --if-exists ${dbName}`,
      `dropdb --if-exists ${dbName}_test`,
    ];
  });

  const deletions = toDelete.map((dir) => `rm -rf "${dir}" 2>/dev/null || true`);

  const cmds = [
    ...portKills,
    ...tmuxKills,
    ...dbDrops,
    ...deletions,
    `sleep 1`,
    ...deletions,
  ];

  background(cmds, { cwd: TASKS_DIR, logFile: "/dev/null" });
}
