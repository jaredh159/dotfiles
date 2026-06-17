import {
  readdirSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  writeFileSync,
  statSync,
  rmSync,
} from "node:fs";
import { join, dirname, extname, basename } from "node:path";
import { execSafe } from "./exec.ts";
import {
  RESCUE_DIR,
  RESCUE_EXTENSIONS,
  RESCUE_PRUNE_DIRS,
  RESCUE_MAX_DEPTH,
  RESCUE_RETENTION_DAYS,
} from "./constants.ts";

export type RescueResult = {
  count: number;
  bundle: string | null; // basename of the attic bundle, or null when nothing rescued
  dest: string | null; // absolute path to the bundle, or null
  files: string[]; // task-relative paths that were rescued
};

type CollectOpts = {
  maxDepth?: number;
  extensions?: string[];
  prune?: string[];
};

// Collect candidate files under `dir`: extension in the rescue set, no deeper
// than `maxDepth` path segments (root files + one level), and not inside a
// pruned build/VCS directory. Returns task-relative POSIX paths.
export function collectCandidates(dir: string, opts: CollectOpts = {}): string[] {
  const maxDepth = opts.maxDepth ?? RESCUE_MAX_DEPTH;
  const extensions = opts.extensions ?? RESCUE_EXTENSIONS;
  const prune = opts.prune ?? RESCUE_PRUNE_DIRS;
  const out: string[] = [];
  walk(dir, "", 0, maxDepth, extensions, prune, out);
  return out;
}

function walk(
  root: string,
  rel: string,
  dirDepth: number,
  maxDepth: number,
  extensions: string[],
  prune: string[],
  out: string[]
): void {
  let entries;
  try {
    entries = readdirSync(rel ? join(root, rel) : root, { withFileTypes: true });
  } catch {
    return; // unreadable dir — skip rather than throw mid-clean
  }

  for (const entry of entries) {
    const childRel = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isFile()) {
      if (extensions.includes(extname(entry.name).toLowerCase())) {
        out.push(childRel);
      }
    } else if (entry.isDirectory()) {
      if (dirDepth + 1 < maxDepth && !prune.includes(entry.name)) {
        walk(root, childRel, dirDepth + 1, maxDepth, extensions, prune, out);
      }
    }
  }
}

// The set of task-relative paths that git already stores safely (tracked AND
// unmodified vs HEAD). A merged PR puts these on the remote, so they need no
// rescue. Returns null when `dir` is not a git repo — nothing is "safe" there,
// so every candidate should be rescued.
export function safeTrackedPaths(dir: string): Set<string> | null {
  if (!existsSync(join(dir, ".git"))) return null;

  const tracked = execSafe(`git -C "${dir}" ls-files -z`)
    .split("\0")
    .filter(Boolean);
  const modified = new Set(
    execSafe(`git -C "${dir}" diff --name-only -z HEAD`)
      .split("\0")
      .filter(Boolean)
  );

  const safe = new Set<string>();
  for (const path of tracked) {
    if (!modified.has(path)) safe.add(path);
  }
  return safe;
}

// Copy irreplaceable context out of `dir` into the attic before it is deleted.
// "Irreplaceable" = a rescue-extension file that git is not already keeping
// safe (untracked, ignored, or modified) — or any match at all when `dir` is
// not a git repo. Copies (never moves) so the subsequent rm is the only delete.
export function rescueFiles(
  dir: string,
  now: Date,
  opts: { atticDir?: string } = {}
): RescueResult {
  const atticDir = opts.atticDir ?? RESCUE_DIR;
  const empty: RescueResult = { count: 0, bundle: null, dest: null, files: [] };

  const candidates = collectCandidates(dir);
  if (candidates.length === 0) return empty;

  const safe = safeTrackedPaths(dir);
  const toRescue = candidates.filter((rel) => !safe || !safe.has(rel));
  if (toRescue.length === 0) return empty;

  const bundle = `${basename(dir)}-${rescueStamp(now)}`;
  const dest = join(atticDir, bundle);

  const rescued: string[] = [];
  for (const rel of toRescue) {
    try {
      const target = join(dest, rel);
      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(join(dir, rel), target);
      rescued.push(rel);
    } catch {
      // a single unreadable/vanished file should not abort the rescue
    }
  }

  if (rescued.length === 0) return empty;

  writeFileSync(
    join(dest, "RESCUE.txt"),
    [
      `source: ${dir}`,
      `rescued: ${now.toISOString()}`,
      `files:`,
      ...rescued.map((f) => `  ${f}`),
      "",
    ].join("\n")
  );

  return { count: rescued.length, bundle, dest, files: rescued };
}

// Delete attic bundles older than the retention window. Runs each clean so the
// attic stays bounded ("cleaned up eventually") while leaving a recovery window.
export function pruneAttic(
  now: Date,
  opts: { atticDir?: string; retentionDays?: number } = {}
): string[] {
  const atticDir = opts.atticDir ?? RESCUE_DIR;
  const retentionDays = opts.retentionDays ?? RESCUE_RETENTION_DAYS;
  if (!existsSync(atticDir)) return [];

  const cutoff = now.getTime() - retentionDays * 24 * 60 * 60 * 1000;
  const removed: string[] = [];

  for (const entry of readdirSync(atticDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = join(atticDir, entry.name);
    if (statSync(path).mtimeMs < cutoff) {
      rmSync(path, { recursive: true, force: true });
      removed.push(entry.name);
    }
  }
  return removed;
}

function rescueStamp(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${date}-${time}`;
}
