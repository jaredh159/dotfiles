import { execFileSync, execSync, spawn } from "node:child_process";
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

export function copyToClipboard(text: string): void {
  try {
    execFileSync("pbcopy", [], { input: text, stdio: "ignore" });
  } catch {
    // Clipboard integration is optional and must not affect task creation.
  }
}

export function background(
  cmds: string[],
  opts: { cwd: string; logFile: string }
): void {
  const script = cmds.join("\n");
  const logFd = openSync(opts.logFile, "a");
  const child = spawn("bash", ["-c", script], {
    cwd: opts.cwd,
    detached: true,
    stdio: ["ignore", logFd, logFd],
  });

  child.unref();
}
