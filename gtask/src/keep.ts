import { writeFileSync, existsSync, unlinkSync } from "node:fs";
import { join, relative } from "node:path";
import { TASKS_DIR, KEEP_FILE, DISCARD_FILE } from "./constants.ts";
import { cyan } from "./color.ts";

export function keep(): void {
  const cwd = process.cwd();
  const rel = relative(TASKS_DIR, cwd);

  if (!existsSync(TASKS_DIR) || rel.startsWith("..") || rel === cwd) {
    console.error("not inside a gtask directory");
    process.exit(1);
  }

  const taskRoot = join(TASKS_DIR, rel.split("/")[0]);
  const marker = join(taskRoot, KEEP_FILE);

  if (existsSync(marker)) {
    unlinkSync(marker);
    console.log(cyan(`unmarked: ${relative(TASKS_DIR, taskRoot)}`));
    return;
  }

  const discardMarker = join(taskRoot, DISCARD_FILE);
  if (existsSync(discardMarker)) unlinkSync(discardMarker);

  writeFileSync(marker, "");
  console.log(cyan(`marked as keep: ${relative(TASKS_DIR, taskRoot)}`));
}
