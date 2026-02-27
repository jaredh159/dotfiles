import { existsSync } from "node:fs";
import { join, basename, relative } from "node:path";
import { execSync } from "node:child_process";
import { TASKS_DIR, TEMPLATE_DATABASE } from "./constants.ts";
import { dbNameFromDir } from "./parse.ts";

export function sync(): void {
  const cwd = process.cwd();
  const rel = relative(TASKS_DIR, cwd);

  if (!existsSync(TASKS_DIR) || rel.startsWith("..") || rel === cwd) {
    console.error("not inside a gtask directory");
    process.exit(1);
  }

  const taskRoot = join(TASKS_DIR, rel.split("/")[0]);
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
