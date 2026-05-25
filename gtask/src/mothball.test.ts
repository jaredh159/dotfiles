import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { findMothballTargets } from "./mothball.ts";

describe("findMothballTargets", () => {
  let root: string;

  before(() => {
    root = mkdtempSync(join(tmpdir(), "gtask-mothball-"));
    // build output that should be found
    mkdirSync(join(root, "swift/api/.build"), { recursive: true });
    mkdirSync(join(root, "swift/node_modules"), { recursive: true });
    mkdirSync(join(root, "web/node_modules"), { recursive: true });
    mkdirSync(join(root, "swift/.nx/cache"), { recursive: true });
    // nested matches under a match must be pruned, not listed separately
    mkdirSync(join(root, "swift/api/.build/checkouts/dep/node_modules"), {
      recursive: true,
    });
    // tracked source and config that must never be returned
    mkdirSync(join(root, "swift/api/Sources"), { recursive: true });
    writeFileSync(join(root, ".gtask-ports"), "");
    writeFileSync(join(root, "swift/api/.env"), "");
  });

  after(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it("finds top-level build output dirs", () => {
    const found = findMothballTargets(root).sort();
    assert.deepStrictEqual(found, [
      "swift/.nx",
      "swift/api/.build",
      "swift/node_modules",
      "web/node_modules",
    ]);
  });

  it("prunes matches nested inside other matches", () => {
    const found = findMothballTargets(root);
    assert.ok(
      !found.some((p) => p.includes(".build/checkouts")),
      "should not descend into a matched .build dir"
    );
  });

  it("never returns tracked source or config", () => {
    const found = findMothballTargets(root);
    assert.ok(!found.some((p) => p.includes("Sources")));
    assert.ok(!found.some((p) => p.includes(".env")));
    assert.ok(!found.some((p) => p.includes(".gtask-ports")));
  });

  it("returns nothing for a tree with no build output", () => {
    const clean = mkdtempSync(join(tmpdir(), "gtask-mothball-clean-"));
    mkdirSync(join(clean, "swift/api/Sources"), { recursive: true });
    try {
      assert.deepStrictEqual(findMothballTargets(clean), []);
    } finally {
      rmSync(clean, { recursive: true, force: true });
    }
  });
});
