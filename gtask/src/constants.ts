import { homedir } from "node:os";
import { join } from "node:path";

export const TASKS_DIR = join(homedir(), "gertie", "tasks");
export const REPO = "gertrude-app/gertrude";
export const REPO_SSH = "git@github.com:gertrude-app/gertrude.git";
export const GTASK_DIR = join(homedir(), ".dotfiles", "gtask");
export const TEMPLATE_DIR = join(GTASK_DIR, "env");

export const ENV_TEMPLATES = [
  { template: "api.env.template", dest: "swift/api/.env" },
  { template: "iosapp.xcconfig.template", dest: "swift/iosapp/config/Local.xcconfig" },
  { template: "dash.env.local.template", dest: "web/dash/app/.env.local" },
  { template: "site.env.local.template", dest: "web/site/.env.local" },
];

export const DEV_PORTS = [8080, 8081, 3000, 4243, 6006];

export const DEFAULT_API_PORT = 8080;
export const DEFAULT_DASHBOARD_PORT = 8081;
export const DEFAULT_DATABASE_NAME = "gertrude_sync";
export const DEFAULT_TEST_DATABASE_NAME = "gertrude_test";
