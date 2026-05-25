import { rmSync, writeFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { TASKS_DIR, MOTHBALL_TARGETS, MOTHBALL_FILE } from "./constants.ts";
import { execSafe } from "./exec.ts";
import { green, yellow, cyan } from "./color.ts";
import { currentTaskRoot } from "./task-root.ts";

// Locate top-level build-output dirs under `root`, returned as paths relative to
// it. `-prune` stops descent into a match, so nested copies (e.g. a node_modules
// inside .build) are removed with their parent rather than listed separately.
export function findMothballTargets(root: string): string[] {
  const nameExpr = MOTHBALL_TARGETS.map((name) => `-name '${name}'`).join(" -o ");
  const out = execSafe(`find . -type d \\( ${nameExpr} \\) -prune -print`, {
    cwd: root,
  });
  return out
    .split("\n")
    .filter(Boolean)
    .map((p) => p.replace(/^\.\//, ""));
}

function humanSize(kb: number): string {
  if (kb >= 1024 * 1024) return `${(kb / 1024 / 1024).toFixed(1)}G`;
  if (kb >= 1024) return `${Math.round(kb / 1024)}M`;
  return `${kb}K`;
}

function totalSizeKb(relDirs: string[], cwd: string): number {
  if (relDirs.length === 0) return 0;
  const args = relDirs.map((d) => `"${d}"`).join(" ");
  const out = execSafe(`du -skc ${args} | tail -1`, { cwd });
  return parseInt(out, 10) || 0;
}

export function mothball(): void {
  let taskRoot: string;
  try {
    taskRoot = currentTaskRoot();
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    process.exit(1);
  }

  const label = relative(TASKS_DIR, taskRoot);
  const markerPath = join(taskRoot, MOTHBALL_FILE);
  const targets = findMothballTargets(taskRoot);

  if (targets.length === 0) {
    if (existsSync(markerPath)) {
      console.log(cyan(`already mothballed: ${label}`));
      return;
    }
    writeMarker(markerPath);
    console.log(green(`mothballed ${label}: no build output to remove`));
    return;
  }

  const freedKb = totalSizeKb(targets, taskRoot);

  for (const rel of targets) {
    console.log(yellow(`removing: ${rel}`));
    rmSync(join(taskRoot, rel), { recursive: true, force: true });
  }

  writeMarker(markerPath);
  console.log(
    green(`mothballed ${label}: freed ${humanSize(freedKb)} across ${targets.length} dirs`)
  );
  console.log(cyan("run `gtask --heavy` inside this task to rebuild."));
}

function writeMarker(markerPath: string): void {
  writeFileSync(markerPath, `${new Date().toISOString()}\n`);
}
