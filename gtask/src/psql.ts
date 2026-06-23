import { execFileSync } from "node:child_process";
import { basename } from "node:path";
import { dbNameFromDir } from "./parse.ts";
import { currentTaskRoot } from "./task-root.ts";

export function databaseNameForTaskRoot(taskRoot: string): string {
  return dbNameFromDir(basename(taskRoot));
}

export function psql(): void {
  let taskRoot: string;
  try {
    taskRoot = currentTaskRoot();
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    process.exit(1);
  }

  execFileSync("psql", ["--dbname", databaseNameForTaskRoot(taskRoot)], {
    stdio: "inherit",
  });
}
