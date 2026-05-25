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
  { template: "macapp.xcconfig.template", dest: "swift/macapp/config/Local.xcconfig" },
  { template: "dash.env.local.template", dest: "web/dash/app/.env.local" },
  { template: "site.env.local.template", dest: "web/site/.env.local" },
  { template: "admin.env.local.template", dest: "web/admin/.env.local" },
];

export const SLOT_FILE = ".gtask-slot";
export const PORTS_FILE = ".gtask-ports";
export const DISCARD_FILE = ".gtask-discard";
export const KEEP_FILE = ".gtask-keep";
export const MOTHBALL_FILE = ".gtask-mothball";
export const TEMPLATE_DATABASE = "gertrude_sync";

// Gitignored, regenerable build output removed by `--mothball`. All are rebuilt
// by `gtask --heavy` (SwiftPM `.build`, pnpm `node_modules`, Nx cache).
export const MOTHBALL_TARGETS = [".build", "node_modules", ".nx"];

export const BASE_PORTS = {
  api: 8080,
  dash: 8081,
  site: 3000,
  admin: 4243,
  storybook: 6006,
};
