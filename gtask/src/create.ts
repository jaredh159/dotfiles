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

  // write slot+ports to target dir immediately so concurrent
  // `allocateSlot()` calls see this slot as occupied
  mkdirSync(target, { recursive: true });
  writeFileSync(join(target, SLOT_FILE), String(slot) + "\n");
  writeFileSync(join(target, PORTS_FILE), portsFileContent(ports));

  const staging = join(tmpdir(), `gtask-staging-${dirName}`);
  mkdirSync(staging, { recursive: true });
  writeEnvFiles(staging, dbName, testDbName, ports);

  const envCopyCmds = ENV_TEMPLATES.map(({ dest }) =>
    `run cp "${join(staging, dest)}" "${join(target, dest)}"`
  );

  const cmds = [
    `set -e`,
    `log="${logFile}"`,
    `failed=0`,
    `cleanup() { [ $failed -eq 1 ] && mv "$log" "${errorLog}" || rm -f "$log"; }`,
    `trap cleanup EXIT`,
    `run() { "$@" >> "$log" 2>&1 || failed=1; }`,
    ``,
    `run createdb -T ${TEMPLATE_DATABASE} ${dbName}`,
    `run createdb ${testDbName}`,
    `run git init "${target}"`,
    `run git -C "${target}" remote add origin ${REPO_SSH}`,
    `run git -C "${target}" fetch --depth 50 origin master`,
    `run git -C "${target}" checkout -b "${slug}" FETCH_HEAD`,
    ``,
    ...envCopyCmds,
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
    `# warm storybook dev cache (start dev server, wait for ready, kill)`,
    `just storybook >> "$log" 2>&1 &`,
    `sb_pid=$!`,
    `for i in $(seq 1 180); do`,
    `  curl -sf -o /dev/null "http://localhost:${ports.storybook}/" && break`,
    `  sleep 1`,
    `done`,
    `kill $sb_pid 2>/dev/null || true`,
    `lsof -ti :${ports.storybook} | xargs kill 2>/dev/null || true`,
    `wait $sb_pid 2>/dev/null || true`,
  ];

  background(cmds, { cwd: TASKS_DIR, logFile });

  console.log(`Created: ${target}`);
}
