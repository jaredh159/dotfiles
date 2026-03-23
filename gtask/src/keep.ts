import { writeFileSync, existsSync, unlinkSync } from "node:fs";
import { join, relative } from "node:path";
import { TASKS_DIR, KEEP_FILE, DISCARD_FILE } from "./constants.ts";
import { cyan } from "./color.ts";
import { currentTaskRoot } from "./task-root.ts";

export function keep(): void {
  let taskRoot: string;
  try {
    taskRoot = currentTaskRoot();
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }

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
