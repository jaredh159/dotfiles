import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { makeTargetDir, dbNameFromDir } from "./parse.ts";
import { exec, background } from "./exec.ts";
import { loadTemplate, resolveTemplate, buildTemplateVars } from "./template.ts";
import {
  TASKS_DIR,
  REPO_SSH,
  TEMPLATE_DIR,
  ENV_TEMPLATES,
  DEFAULT_API_PORT,
  DEFAULT_DASHBOARD_PORT,
  TEMPLATE_DATABASE,
} from "./constants.ts";

function writeEnvFiles(target: string, dbName: string, testDbName: string): void {
  const vars = buildTemplateVars({
    TASK_DATABASE_NAME: dbName,
    TASK_TEST_DATABASE_NAME: testDbName,
    TASK_API_PORT: String(DEFAULT_API_PORT),
    TASK_DASHBOARD_PORT: String(DEFAULT_DASHBOARD_PORT),
  });

  for (const { template, dest } of ENV_TEMPLATES) {
    const templatePath = join(TEMPLATE_DIR, template);
    const destPath = join(target, dest);
    const content = loadTemplate(templatePath);
    const resolved = resolveTemplate(content, vars);
    mkdirSync(dirname(destPath), { recursive: true });
    writeFileSync(destPath, resolved);
  }
}

export async function create(slug: string): Promise<void> {
  const dirName = makeTargetDir(slug);
  const target = join(TASKS_DIR, dirName);

  if (existsSync(target)) {
    console.error(`Target already exists: ${target}`);
    process.exit(1);
  }

  mkdirSync(target, { recursive: true });

  const dbName = dbNameFromDir(dirName);
  const testDbName = `${dbName}_test`;
  exec(`createdb -T ${TEMPLATE_DATABASE} ${dbName}`);
  exec(`createdb ${testDbName}`);

  const logFile = join(tmpdir(), `gtask-${dirName}.log`);
  const errorLog = join(target, ".gtask-error.log");

  const envStaging = join(target, ".gtask-env-staging");
  mkdirSync(envStaging);
  writeEnvFiles(envStaging, dbName, testDbName);

  const envCopyCmds = ENV_TEMPLATES.map(({ dest }) =>
    `run cp "${join(envStaging, dest)}" "${join(target, dest)}"`
  );

  const cmds = [
    `set -e`,
    `log="${logFile}"`,
    `failed=0`,
    `run() { "$@" >> "$log" 2>&1 || failed=1; }`,
    ``,
    `run git clone --depth 50 --single-branch ${REPO_SSH} "${target}"`,
    `run git -C "${target}" checkout -b "${slug}"`,
    ``,
    ...envCopyCmds,
    `rm -rf "${envStaging}"`,
    ``,
    `cd "${join(target, "swift")}"`,
    `run just migrate-up`,
    `run pnpm install`,
    `run git restore -- pnpm-lock.yaml`,
    `run just nuke-test-db`,
    `run just build`,
    `run just macapp-xcode-build`,
    `run just iosapp-xcode-build`,
    `run just test`,
    `run just lint`,
    ``,
    `cd "${join(target, "web")}"`,
    `run pnpm install`,
    `run just lint`,
    `run just format-check`,
    `run just typecheck`,
    `run just test`,
    `run just build-storybook`,
    ``,
    `[ $failed -eq 1 ] && mv "$log" "${errorLog}" || rm -f "$log"`,
  ];

  background(cmds, { cwd: target, logFile });

  console.log(`Created: ${target}`);
}
