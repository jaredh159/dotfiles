import { execSync, spawn } from "node:child_process";
import { openSync } from "node:fs";

export function exec(cmd: string, opts?: { cwd?: string }): string {
  return execSync(cmd, {
    cwd: opts?.cwd,
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();
}

export function execSafe(cmd: string, opts?: { cwd?: string }): string {
  try {
    return exec(cmd, opts);
  } catch {
    return "";
  }
}

export function withXcrunSwiftFirst(cmds: string[]): string {
  return [
    `if command -v xcrun >/dev/null 2>&1; then`,
    `  swift_path="$(xcrun --find swift 2>/dev/null || true)"`,
    `  if [ -n "$swift_path" ]; then`,
    `    swift_bin="$(dirname "$swift_path")"`,
    `    case ":$PATH:" in`,
    `      *":$swift_bin:"*) ;;`,
    `      *) export PATH="$swift_bin:$PATH" ;;`,
    `    esac`,
    `  fi`,
    `fi`,
    ``,
    ...cmds,
  ].join("\n");
}

export function background(
  cmds: string[],
  opts: { cwd: string; logFile: string }
): void {
  const script = withXcrunSwiftFirst(cmds);
  const logFd = openSync(opts.logFile, "a");
  const child = spawn("bash", ["-c", script], {
    cwd: opts.cwd,
    detached: true,
    stdio: ["ignore", logFd, logFd],
  });

  child.unref();
}
