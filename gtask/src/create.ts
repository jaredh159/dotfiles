import { existsSync, mkdirSync, copyFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { makeTargetDir } from "./parse.ts";
import { background } from "./exec.ts";
import {
  TASKS_DIR,
  REPO_SSH,
  ENV_SOURCE_DIR,
  ENV_FILES,
} from "./constants.ts";

export async function create(slug: string): Promise<void> {
  const dirName = makeTargetDir(slug);
  const target = join(TASKS_DIR, dirName);

  if (existsSync(target)) {
    console.error(`Target already exists: ${target}`);
    process.exit(1);
  }

  mkdirSync(target, { recursive: true });

  const logFile = join(tmpdir(), `gtask-${dirName}.log`);
  const errorLog = join(target, ".gtask-error.log");

  const cmds = [
    `set -e`,
    `log="${logFile}"`,
    `failed=0`,
    `run() { "$@" >> "$log" 2>&1 || failed=1; }`,
    ``,
    `run git clone --depth 50 --single-branch ${REPO_SSH} "${target}"`,
    `run git -C "${target}" checkout -b "${slug}"`,
    ``,
    ...ENV_FILES.map(
      (f) =>
        `run cp "${join(ENV_SOURCE_DIR, f.src)}" "${join(target, f.dest)}"`
    ),
    ``,
    `cd "${join(target, "swift")}"`,
    `run just migrate-up`,
    `run pnpm install`,
    `run git restore -- pnpm-lock.yaml`,
    `run just nuke-test-db`,
    `run just build`,
    `run just macapp-xcode-build`,
    `run just iosapp-xcode-build`,
    `run just test`,
    `run just lint`,
    ``,
    `cd "${join(target, "web")}"`,
    `run pnpm install`,
    `run just lint`,
    `run just format-check`,
    `run just typecheck`,
    `run just test`,
    `run just build-storybook`,
    ``,
    `[ $failed -eq 1 ] && mv "$log" "${errorLog}" || rm -f "$log"`,
  ];

  background(cmds, { cwd: target, logFile });

  console.log(`Created: ${target}`);
}
