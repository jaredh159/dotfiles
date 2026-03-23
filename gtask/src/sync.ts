import { basename, join, relative } from "node:path";
import { execSync } from "node:child_process";
import { TASKS_DIR, TEMPLATE_DATABASE } from "./constants.ts";
import { dbNameFromDir } from "./parse.ts";
import { currentTaskRoot } from "./task-root.ts";

export function sync(): void {
  let taskRoot: string;
  try {
    taskRoot = currentTaskRoot();
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }

  const dirname = basename(taskRoot);
  const dbName = dbNameFromDir(dirname);

  console.log(`dropping ${dbName}...`);
  execSync(`dropdb --if-exists ${dbName}`, { stdio: "inherit" });

  console.log(`recreating from ${TEMPLATE_DATABASE}...`);
  execSync(`createdb -T ${TEMPLATE_DATABASE} ${dbName}`, { stdio: "inherit" });

  console.log(`running migrate-up...`);
  execSync(`just migrate-up`, { cwd: join(taskRoot, "swift"), stdio: "inherit" });

  console.log(`done`);
}
