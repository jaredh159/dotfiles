import { describe, it, before, after, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  existsSync,
  readFileSync,
  readdirSync,
  utimesSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execSync } from "node:child_process";
import {
  collectCandidates,
  safeTrackedPaths,
  rescueFiles,
  pruneAttic,
} from "./rescue.ts";

describe("collectCandidates", () => {
  let root: string;

  before(() => {
    root = mkdtempSync(join(tmpdir(), "gtask-rescue-"));
    // root-level rescuable files
    writeFileSync(join(root, "agent.ledger.1.md"), "ledger");
    writeFileSync(join(root, "scratch.sql"), "select 1;");
    // wrong extension at root
    writeFileSync(join(root, "Session.vim"), "vim");
    // one level deep — rescuable
    mkdirSync(join(root, "web"), { recursive: true });
    writeFileSync(join(root, "web/dump.sql"), "select 2;");
    // two levels deep — too deep
    mkdirSync(join(root, "web/admin"), { recursive: true });
    writeFileSync(join(root, "web/admin/notes.md"), "deep");
    // build/vcs dirs that must never be descended into
    mkdirSync(join(root, "node_modules/pkg"), { recursive: true });
    writeFileSync(join(root, "node_modules/pkg/README.md"), "junk");
    mkdirSync(join(root, ".git"), { recursive: true });
    writeFileSync(join(root, ".git/COMMIT_MSG.md"), "junk");
    mkdirSync(join(root, ".next"), { recursive: true });
    writeFileSync(join(root, ".next/trace.md"), "junk");
  });

  after(() => rmSync(root, { recursive: true, force: true }));

  it("finds root and one-level-deep files with rescue extensions", () => {
    const found = collectCandidates(root).sort();
    assert.deepStrictEqual(found, [
      "agent.ledger.1.md",
      "scratch.sql",
      "web/dump.sql",
    ]);
  });

  it("ignores files deeper than one level", () => {
    assert.ok(!collectCandidates(root).includes("web/admin/notes.md"));
  });

  it("never descends into pruned build/vcs dirs", () => {
    const found = collectCandidates(root);
    assert.ok(!found.some((f) => f.startsWith("node_modules/")));
    assert.ok(!found.some((f) => f.startsWith(".git/")));
    assert.ok(!found.some((f) => f.startsWith(".next/")));
  });

  it("ignores non-rescue extensions", () => {
    assert.ok(!collectCandidates(root).includes("Session.vim"));
  });
});

describe("safeTrackedPaths", () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "gtask-rescue-git-"));
  });

  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it("returns null for a non-git dir", () => {
    assert.strictEqual(safeTrackedPaths(root), null);
  });

  it("treats committed-clean files as safe, but not modified ones", () => {
    const git = (cmd: string) => execSync(`git -C "${root}" ${cmd}`, { stdio: "pipe" });
    git("init -q");
    git("config user.email t@t.t");
    git("config user.name t");
    writeFileSync(join(root, "tracked.md"), "v1");
    writeFileSync(join(root, "also.md"), "stable");
    git("add -A");
    git("commit -q -m init");
    // modify one tracked file after commit
    writeFileSync(join(root, "tracked.md"), "v2");

    const safe = safeTrackedPaths(root);
    assert.ok(safe instanceof Set);
    assert.ok(safe!.has("also.md"), "clean tracked file is safe");
    assert.ok(!safe!.has("tracked.md"), "modified tracked file is not safe");
  });
});

describe("rescueFiles", () => {
  let root: string;
  let attic: string;
  const now = new Date("2026-06-17T15:30:00");

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "gtask-rescue-task-"));
    attic = mkdtempSync(join(tmpdir(), "gtask-attic-"));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
    rmSync(attic, { recursive: true, force: true });
  });

  it("rescues all matching files from a non-git dir, preserving structure", () => {
    writeFileSync(join(root, "agent.ledger.1.md"), "ledger");
    mkdirSync(join(root, "web"), { recursive: true });
    writeFileSync(join(root, "web/dump.sql"), "select 1;");

    const result = rescueFiles(root, now, { atticDir: attic });

    assert.strictEqual(result.count, 2);
    assert.ok(result.bundle!.startsWith("gtask-rescue-task-"));
    assert.ok(existsSync(join(result.dest!, "agent.ledger.1.md")));
    assert.ok(existsSync(join(result.dest!, "web/dump.sql")));
    assert.ok(existsSync(join(result.dest!, "RESCUE.txt")));
    // original is untouched (copy, not move)
    assert.ok(existsSync(join(root, "agent.ledger.1.md")));
  });

  it("skips committed-clean files but rescues untracked/ignored ones", () => {
    const git = (cmd: string) => execSync(`git -C "${root}" ${cmd}`, { stdio: "pipe" });
    git("init -q");
    git("config user.email t@t.t");
    git("config user.name t");
    writeFileSync(join(root, "README.md"), "tracked");
    writeFileSync(join(root, ".gitignore"), "agent.*\n");
    git("add README.md .gitignore");
    git("commit -q -m init");
    // gitignored ledger + untracked scratch — both irreplaceable
    writeFileSync(join(root, "agent.ledger.1.md"), "ledger");
    writeFileSync(join(root, "scratch.sql"), "select 1;");

    const result = rescueFiles(root, now, { atticDir: attic });

    assert.strictEqual(result.count, 2);
    assert.deepStrictEqual(result.files.sort(), [
      "agent.ledger.1.md",
      "scratch.sql",
    ]);
    assert.ok(!existsSync(join(result.dest!, "README.md")), "tracked-clean skipped");
  });

  it("returns an empty result when there is nothing to rescue", () => {
    writeFileSync(join(root, "session.vim"), "wrong ext");
    const result = rescueFiles(root, now, { atticDir: attic });
    assert.strictEqual(result.count, 0);
    assert.strictEqual(result.dest, null);
    assert.strictEqual(readdirSync(attic).length, 0);
  });

  it("writes a manifest listing the rescued files", () => {
    writeFileSync(join(root, "agent.ledger.1.md"), "ledger");
    const result = rescueFiles(root, now, { atticDir: attic });
    const manifest = readFileSync(join(result.dest!, "RESCUE.txt"), "utf-8");
    assert.ok(manifest.includes("agent.ledger.1.md"));
    assert.ok(manifest.includes(root));
  });
});

describe("pruneAttic", () => {
  let attic: string;
  const now = new Date("2026-06-17T12:00:00");

  beforeEach(() => {
    attic = mkdtempSync(join(tmpdir(), "gtask-attic-prune-"));
  });

  afterEach(() => rmSync(attic, { recursive: true, force: true }));

  it("removes bundles older than the retention window, keeps fresh ones", () => {
    const old = join(attic, "old-bundle");
    const fresh = join(attic, "fresh-bundle");
    mkdirSync(old);
    mkdirSync(fresh);
    const days = (n: number) => now.getTime() / 1000 - n * 24 * 60 * 60;
    utimesSync(old, days(40), days(40));
    utimesSync(fresh, days(5), days(5));

    const removed = pruneAttic(now, { atticDir: attic, retentionDays: 30 });

    assert.deepStrictEqual(removed, ["old-bundle"]);
    assert.ok(!existsSync(old));
    assert.ok(existsSync(fresh));
  });

  it("returns an empty list when the attic does not exist", () => {
    rmSync(attic, { recursive: true, force: true });
    assert.deepStrictEqual(pruneAttic(now, { atticDir: attic }), []);
  });
});
