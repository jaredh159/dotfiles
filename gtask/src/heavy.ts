import { join, basename, relative } from "node:path";
import { tmpdir } from "node:os";
import { existsSync } from "node:fs";
import { background } from "./exec.ts";
import { warmupCommands } from "./create.ts";
import { TASKS_DIR, SLOT_FILE } from "./constants.ts";
import { readSlot, portsForSlot } from "./slot.ts";
import { currentTaskRoot } from "./task-root.ts";

export function heavy(): void {
  let taskRoot: string;
  try {
    taskRoot = currentTaskRoot();
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }

  const dirName = basename(taskRoot);
  const slotPath = join(taskRoot, SLOT_FILE);
  if (!existsSync(slotPath)) {
    console.error(`missing ${SLOT_FILE} in ${relative(TASKS_DIR, taskRoot)}`);
    process.exit(1);
  }

  const slot = readSlot(taskRoot);
  if (slot === null) {
    console.error(`invalid ${SLOT_FILE} in ${relative(TASKS_DIR, taskRoot)}`);
    process.exit(1);
  }

  const ports = portsForSlot(slot);
  const logFile = join(tmpdir(), `gtask-heavy-${dirName}.log`);
  const errorLog = join(taskRoot, ".gtask-error.log");
  const lockFile = join(taskRoot, ".gtask-heavy.lock");

  const cmds = [
    `set -e`,
    `log="${logFile}"`,
    `failed=0`,
    `lock="${lockFile}"`,
    `cleanup() {`,
    `  rm -f "$lock"`,
    `  [ $failed -eq 1 ] && mv "$log" "${errorLog}" || rm -f "$log"`,
    `}`,
    `trap cleanup EXIT`,
    `if ! ( set -o noclobber; : > "$lock" ) 2>/dev/null; then`,
    `  echo "heavy warm-up already running for ${relative(TASKS_DIR, taskRoot)}" >> "$log"`,
    `  failed=1`,
    `  exit 1`,
    `fi`,
    `run() { "$@" >> "$log" 2>&1 || failed=1; }`,
    ``,
    ...warmupCommands(taskRoot, ports),
  ];

  background(cmds, { cwd: taskRoot, logFile });
  console.log(`Heavy warm-up started: ${taskRoot}`);
}
