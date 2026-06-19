import { readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { parseBranchFromDir, dbNameFromDir } from "./parse.ts";
import { execSafe } from "./exec.ts";
import { background } from "./exec.ts";
import { red, green, yellow, cyan, gray } from "./color.ts";
import { readSlot, portsForSlot } from "./slot.ts";
import { rescueFiles, pruneAttic } from "./rescue.ts";
import {
  TASKS_DIR,
  REPO,
  DISCARD_FILE,
  KEEP_FILE,
  SLOT_FILE,
} from "./constants.ts";

function getMergedPrCount(branch: string): number {
  const result = execSafe(
    `gh pr list --repo ${REPO} --head "${branch}" --state merged --json number --jq 'length'`
  );
  return parseInt(result, 10) || 0;
}

export type CleanOptions = {
  dryRun?: boolean;
};

export async function clean(options: CleanOptions = {}): Promise<void> {
  if (!existsSync(TASKS_DIR)) {
    console.error(`Tasks directory not found: ${TASKS_DIR}`);
    process.exit(1);
  }

  const dryRun = options.dryRun ?? false;
  const now = new Date();
  if (dryRun) {
    console.log(gray("dry-run:  no files, databases, ports, tmux panes, or attic bundles will be changed"));
  } else {
    const prunedAttic = pruneAttic(now);
    if (prunedAttic.length > 0) {
      console.log(gray(`attic:    pruned ${prunedAttic.length} expired bundle(s)`));
    }
  }

  const entries = readdirSync(TASKS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  const toDelete: string[] = [];
  const toKeep: string[] = [];

  const discarded: string[] = [];
  const kept: string[] = [];
  const skipped: string[] = [];

  for (const dirname of entries) {
    const dir = join(TASKS_DIR, dirname);

    // Explicit discard always wins, even for non-task dirs.
    if (existsSync(join(dir, DISCARD_FILE))) {
      discarded.push(dir);
      continue;
    }

    if (existsSync(join(dir, KEEP_FILE))) {
      kept.push(dirname);
      continue;
    }

    // Only auto-clean real gtask task dirs. Anything without the slot marker
    // (stray notes, manually created folders) is left alone unless explicitly
    // discarded above.
    if (!existsSync(join(dir, SLOT_FILE))) {
      skipped.push(dirname);
      continue;
    }

    const branch = parseBranchFromDir(dirname);
    if (!branch) continue;

    const merged = getMergedPrCount(branch);
    if (merged > 0) {
      toDelete.push(dir);
    } else {
      toKeep.push(dirname);
    }
  }

  for (const dir of discarded) {
    console.log(yellow(`${dryRun ? "would discard:" : "discard:"}  ${basename(dir)}`));
  }

  for (const dir of toDelete) {
    console.log(red(`${dryRun ? "would remove:" : "removing:"} ${basename(dir)}`));
  }

  for (const dirname of kept) {
    console.log(cyan(`keeping:  ${dirname} (keep)`));
  }

  for (const dirname of toKeep) {
    console.log(green(`keeping:  ${dirname}`));
  }

  for (const dirname of skipped) {
    console.log(gray(`skipping: ${dirname} (not a task dir)`));
  }

  toDelete.push(...discarded);

  if (toDelete.length === 0) return;

  if (dryRun) return;

  // Rescue irreplaceable context (gitignored ledgers/notes, uncommitted SQL)
  // into the attic before anything is destroyed.
  for (const dir of toDelete) {
    const result = rescueFiles(dir, now);
    if (result.count > 0) {
      console.log(
        cyan(`rescued:  ${result.count} file(s) from ${basename(dir)} -> .gtask-attic/${result.bundle}`)
      );
    }
  }

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

  const mruFile = join(process.env.HOME ?? "", ".tmux-mru");
  const mruEjects = toDelete.map((dir) => {
    const dirname = basename(dir);
    return `grep -v "^${dirname}$" "${mruFile}" > "${mruFile}.tmp" && mv "${mruFile}.tmp" "${mruFile}" || true`;
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
    ...mruEjects,
    ...portKills,
    ...tmuxKills,
    ...dbDrops,
    ...deletions,
    `sleep 1`,
    ...deletions,
  ];

  background(cmds, { cwd: TASKS_DIR, logFile: "/dev/null" });
}
