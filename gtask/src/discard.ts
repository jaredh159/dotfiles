import { writeFileSync, existsSync, unlinkSync } from "node:fs";
import { join, resolve, relative } from "node:path";
import { TASKS_DIR, DISCARD_FILE, KEEP_FILE } from "./constants.ts";
import { yellow } from "./color.ts";

export function discard(): void {
  const cwd = process.cwd();
  const rel = relative(TASKS_DIR, cwd);

  if (!existsSync(TASKS_DIR) || rel.startsWith("..") || rel === cwd) {
    console.error("not inside a gtask directory");
    process.exit(1);
  }

  const taskRoot = join(TASKS_DIR, rel.split("/")[0]);
  const marker = join(taskRoot, DISCARD_FILE);

  if (existsSync(marker)) {
    console.log(yellow(`already marked: ${relative(TASKS_DIR, taskRoot)}`));
    return;
  }

  const keepMarker = join(taskRoot, KEEP_FILE);
  if (existsSync(keepMarker)) unlinkSync(keepMarker);

  writeFileSync(marker, "");
  console.log(yellow(`marked for discard: ${relative(TASKS_DIR, taskRoot)}`));
}
