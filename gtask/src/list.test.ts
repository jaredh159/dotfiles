import { describe, it } from "node:test";
import assert from "node:assert";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { collectTaskRows, formatTaskTable } from "./list.ts";

describe("collectTaskRows", () => {
  it("collects task rows sorted by creation date", async () => {
    const root = mkdtempSync(join(tmpdir(), "gtask-list-"));

    try {
      mkdirSync(join(root, "old-task-052626"));
      await new Promise((resolve) => setTimeout(resolve, 10));
      mkdirSync(join(root, "new-task-052726"));

      const rows = collectTaskRows(root);

      assert.deepStrictEqual(
        rows.map((row) => row.slug),
        ["new-task-052726", "old-task-052626"]
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("formatTaskTable", () => {
  it("renders a colored table with newest row first", () => {
    const table = formatTaskTable([
      {
        slug: "new-task-052726",
        createdAt: new Date(2026, 4, 27, 9, 30),
      },
      {
        slug: "old-task-052626",
        createdAt: new Date(2026, 4, 26, 8, 15),
      },
    ]);

    assert.match(table, /\x1b\[36mslug/);
    assert.match(table, /created at/);
    assert.doesNotMatch(table, /last touched at/);
    assert.match(table, /new-task-052726/);
    assert.match(table, /2026-05-27 09:30/);
    assert.ok(
      table.indexOf("new-task-052726") < table.indexOf("old-task-052626")
    );
  });
});
