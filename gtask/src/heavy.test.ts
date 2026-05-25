import { describe, it } from "node:test";
import assert from "node:assert";
import { mkdtempSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { clearMothballMarker } from "./heavy.ts";
import { MOTHBALL_FILE } from "./constants.ts";

describe("clearMothballMarker", () => {
  it("removes the mothball marker when present", () => {
    const root = mkdtempSync(join(tmpdir(), "gtask-heavy-"));
    const marker = join(root, MOTHBALL_FILE);
    writeFileSync(marker, "2026-05-25T00:00:00.000Z\n");
    try {
      assert.ok(existsSync(marker));
      clearMothballMarker(root);
      assert.ok(!existsSync(marker), "marker should be removed");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("is a no-op when no marker exists", () => {
    const root = mkdtempSync(join(tmpdir(), "gtask-heavy-"));
    try {
      assert.doesNotThrow(() => clearMothballMarker(root));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
