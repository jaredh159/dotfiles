import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import { TASKS_DIR } from "./constants.ts";

export function currentTaskRoot(cwd = process.cwd()): string {
  const rel = relative(TASKS_DIR, cwd);

  if (!existsSync(TASKS_DIR) || rel.startsWith("..") || rel === cwd) {
    throw new Error("not inside a gtask directory");
  }

  return join(TASKS_DIR, rel.split("/")[0]);
}
