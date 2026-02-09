import { homedir } from "node:os";
import { join } from "node:path";

export const TASKS_DIR = join(homedir(), "gertie", "tasks");
export const REPO = "gertrude-app/gertrude";
export const REPO_SSH = "git@github.com:gertrude-app/gertrude.git";

export const ENV_FILES = [
  { src: "swift/api/.env", dest: "swift/api/.env" },
  {
    src: "swift/iosapp/config/Local.xcconfig",
    dest: "swift/iosapp/config/Local.xcconfig",
  },
  { src: "web/dash/app/.env.local", dest: "web/dash/app/.env.local" },
  { src: "web/site/.env.local", dest: "web/site/.env.local" },
];

export const DEV_PORTS = [8080, 8081, 3000, 4243, 6006];

export const ENV_SOURCE_DIR = join(homedir(), "gertie");
