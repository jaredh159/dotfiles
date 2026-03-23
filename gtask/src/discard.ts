import { writeFileSync, existsSync, unlinkSync } from "node:fs";
import { join, relative } from "node:path";
import { TASKS_DIR, DISCARD_FILE, KEEP_FILE } from "./constants.ts";
import { yellow } from "./color.ts";
import { currentTaskRoot } from "./task-root.ts";

export function discard(): void {
  let taskRoot: string;
  try {
    taskRoot = currentTaskRoot();
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }

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
