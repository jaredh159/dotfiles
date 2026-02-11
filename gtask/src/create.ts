import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { makeTargetDir, dbNameFromDir } from "./parse.ts";
import { background } from "./exec.ts";
import { loadTemplate, resolveTemplate, buildTemplateVars } from "./template.ts";
import { allocateSlot, portsForSlot, portsFileContent } from "./slot.ts";
import {
  TASKS_DIR,
  REPO_SSH,
  TEMPLATE_DIR,
  ENV_TEMPLATES,
  TEMPLATE_DATABASE,
  SLOT_FILE,
  PORTS_FILE,
} from "./constants.ts";
import type { TaskPorts } from "./slot.ts";

function writeEnvFiles(stagingDir: string, dbName: string, testDbName: string, ports: TaskPorts): void {
  const vars = buildTemplateVars({
    TASK_DATABASE_NAME: dbName,
    TASK_TEST_DATABASE_NAME: testDbName,
    TASK_API_PORT: String(ports.api),
    TASK_DASHBOARD_PORT: String(ports.dash),
  });

  for (const { template, dest } of ENV_TEMPLATES) {
    const templatePath = join(TEMPLATE_DIR, template);
    const destPath = join(stagingDir, dest);
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

  const slot = allocateSlot();
  const ports = portsForSlot(slot);

  const dbName = dbNameFromDir(dirName);
  const testDbName = `${dbName}_test`;

  const logFile = join(tmpdir(), `gtask-${dirName}.log`);
  const errorLog = join(target, ".gtask-error.log");

  const staging = join(tmpdir(), `gtask-staging-${dirName}`);
  mkdirSync(staging, { recursive: true });
  writeEnvFiles(staging, dbName, testDbName, ports);
  writeFileSync(join(staging, SLOT_FILE), String(slot) + "\n");
  writeFileSync(join(staging, PORTS_FILE), portsFileContent(ports));

  const envCopyCmds = ENV_TEMPLATES.map(({ dest }) =>
    `run cp "${join(staging, dest)}" "${join(target, dest)}"`
  );

  const cmds = [
    `set -e`,
    `log="${logFile}"`,
    `failed=0`,
    `run() { "$@" >> "$log" 2>&1 || failed=1; }`,
    ``,
    `run createdb -T ${TEMPLATE_DATABASE} ${dbName}`,
    `run createdb ${testDbName}`,
    `run git clone --depth 50 --single-branch ${REPO_SSH} "${target}"`,
    `run git -C "${target}" checkout -b "${slug}"`,
    ``,
    ...envCopyCmds,
    `cp "${join(staging, SLOT_FILE)}" "${join(target, SLOT_FILE)}"`,
    `cp "${join(staging, PORTS_FILE)}" "${join(target, PORTS_FILE)}"`,
    `rm -rf "${staging}"`,
    ``,
    `cd "${join(target, "swift")}"`,
    `export API_PORT=${ports.api}`,
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

  background(cmds, { cwd: TASKS_DIR, logFile });

  console.log(`Created: ${target}`);
}
