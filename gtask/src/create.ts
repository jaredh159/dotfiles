import { existsSync, mkdirSync, writeFileSync, statSync, statfsSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir, tmpdir } from "node:os";
import { makeTargetDir, dbNameFromDir, humanizeSlug } from "./parse.ts";
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

const MIN_DISK_GB = 15;

function withinGertrudeSyncWindow(now: Date): boolean {
  const hour = now.getHours();
  return hour >= 5 && hour < 22;
}

export function warmupCommands(target: string, ports: TaskPorts): string[] {
  return [
    `cd "${join(target, "swift")}"`,
    `run pnpm install`,
    `run git restore -- pnpm-lock.yaml`,
    ``,
    `cd "${join(target, "web")}"`,
    `run pnpm install`,
    ``,
    `cd "${join(target, "swift")}"`,
    `swift_ok=1`,
    `swiftly_bin="\${SWIFTLY_HOME_DIR:-$HOME/.swiftly}/bin/swiftly"`,
    `if [ -x "$swiftly_bin" ]; then`,
    `  swift_cmd=("$swiftly_bin" run swift)`,
    `else`,
    `  swift_cmd=(swift)`,
    `fi`,
    `echo "[gtask] swift command: \${swift_cmd[*]}" >> "$log"`,
    `if [ -f ../.swift-version ]; then echo "[gtask] pinned swift version: $(cat ../.swift-version)" >> "$log"; fi`,
    `echo "[gtask] resolved swift --version:" >> "$log"`,
    `"\${swift_cmd[@]}" --version >> "$log" 2>&1 || true`,
    `if [ -f ../.swift-version ]; then`,
    `  pinned_swift="$(tr -d '[:space:]' < ../.swift-version)"`,
    `  actual_swift="$("\${swift_cmd[@]}" --version 2>/dev/null | head -n 1 | sed -E 's/.* version ([0-9]+\\.[0-9]+\\.[0-9]+).*/\\1/')"`,
    `  if [ -z "$actual_swift" ]; then`,
    `    echo "[gtask] error: could not determine swift version from resolved swift binary" >> "$log"`,
    `    failed=1`,
    `    swift_ok=0`,
    `  fi`,
    `  if [ "$actual_swift" != "$pinned_swift" ]; then`,
    `    echo "[gtask] error: swift version mismatch: expected $pinned_swift, got $actual_swift" >> "$log"`,
    `    failed=1`,
    `    swift_ok=0`,
    `  fi`,
    `fi`,
    `export API_PORT=${ports.api}`,
    `if [ "$swift_ok" -eq 1 ]; then`,
    `run just migrate-up`,
    `run just nuke-test-db`,
    `run just build`,
    `run just macapp xcode-build`,
    `run just iosapp-xcode-build`,
    `run just test`,
    `run just lint`,
    `else`,
    `  echo "[gtask] skipping swift warm-up commands because the Swift toolchain is invalid" >> "$log"`,
    `fi`,
    ``,
    `cd "${join(target, "web")}"`,
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
    ``,
  ];
}

function makeScratchFile(slug: string): string {
  return `# 👋 ${humanizeSlug(slug)}\n`;
}

export async function create(slug: string, opts?: { light?: boolean }): Promise<void> {
  const light = opts?.light ?? false;
  const dirName = makeTargetDir(slug);
  const target = join(TASKS_DIR, dirName);

  if (existsSync(target)) {
    console.error(`Target already exists: ${target}`);
    process.exit(1);
  }

  const { bavail, bsize } = statfsSync(TASKS_DIR);
  const availGB = (bavail * bsize) / 1_073_741_824;
  if (availGB < MIN_DISK_GB) {
    console.error(`Not enough disk space: ${availGB.toFixed(1)}GB available, ${MIN_DISK_GB}GB required`);
    process.exit(1);
  }

  const syncFile = join(homedir(), ".gtask-last-sync");
  try {
    const now = new Date();
    const age = now.getTime() - statSync(syncFile).mtimeMs;
    if (age > 2 * 60 * 60 * 1000) {
      const hrs = (age / 3_600_000).toFixed(1);
      if (withinGertrudeSyncWindow(now)) {
        console.log(`⚠ gertrude_sync is ${hrs}hrs old (launchd sync may not be running)`);
      } else {
        console.log(`ℹ gertrude_sync is ${hrs}hrs old (auto-sync resumes daily 5am-10pm)`);
      }
    }
  } catch {
    console.log(`⚠ gertrude_sync age unknown (~/.gtask-last-sync missing)`);
  }

  const slot = allocateSlot();
  const ports = portsForSlot(slot);
  const ngrokSubdomain = process.env.GTASK_NGROK_SUBDOMAIN;

  const dbName = dbNameFromDir(dirName);
  const testDbName = `${dbName}_test`;

  const logFile = join(tmpdir(), `gtask-${dirName}.log`);
  const errorLog = join(target, ".gtask-error.log");

  // write slot+ports to target dir immediately so concurrent
  // `allocateSlot()` calls see this slot as occupied
  mkdirSync(target, { recursive: true });
  writeFileSync(join(target, SLOT_FILE), String(slot) + "\n");
  writeFileSync(join(target, "task.scratch.md"), makeScratchFile(slug));
  writeFileSync(
    join(target, PORTS_FILE),
    portsFileContent(ports, { ngrokSubdomain })
  );

  const staging = join(tmpdir(), `gtask-staging-${dirName}`);
  mkdirSync(staging, { recursive: true });
  writeEnvFiles(staging, dbName, testDbName, ports);

  const envCopyCmds = ENV_TEMPLATES.map(({ dest }) =>
    `run cp "${join(staging, dest)}" "${join(target, dest)}"`
  );
  const warmupCmds = light ? [] : warmupCommands(target, ports);

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
    `run git -C "${target}" fetch --depth 1 origin master`,
    `run git -C "${target}" checkout -b "${slug}" origin/master`,
    ``,
    ...envCopyCmds,
    `rm -rf "${staging}"`,
    ``,
    ...warmupCmds,
    `# best-effort history deepen after the task is already usable`,
    `git -C "${target}" fetch --deepen=49 origin master >> "$log" 2>&1 || true`,
  ];

  background(cmds, { cwd: TASKS_DIR, logFile });

  console.log(`Created: ${target}`);
}
