import { describe, it } from "node:test";
import assert from "node:assert";
import {
  parseBranchFromDir,
  makeDatestamp,
  makeTargetDir,
  dbNameFromDir,
} from "./parse.ts";

describe("parseBranchFromDir", () => {
  it("parses new format: slug-MMDDYY", () => {
    assert.strictEqual(parseBranchFromDir("fix-login-020926"), "fix-login");
  });

  it("parses old format: slug--MM-DD-YYYY", () => {
    assert.strictEqual(
      parseBranchFromDir("fix-login--02-09-2026"),
      "fix-login"
    );
  });

  it("handles multi-hyphen slugs with new format", () => {
    assert.strictEqual(
      parseBranchFromDir("better-gtask-020926"),
      "better-gtask"
    );
  });

  it("handles multi-hyphen slugs with old format", () => {
    assert.strictEqual(
      parseBranchFromDir("better-gtask--02-09-2026"),
      "better-gtask"
    );
  });

  it("returns null for unrecognized format", () => {
    assert.strictEqual(parseBranchFromDir("random-directory"), null);
  });

  it("returns null for empty string", () => {
    assert.strictEqual(parseBranchFromDir(""), null);
  });

  it("does not match 5-digit suffixes", () => {
    assert.strictEqual(parseBranchFromDir("slug-12345"), null);
  });

  it("does not match 7-digit suffixes", () => {
    assert.strictEqual(parseBranchFromDir("slug-1234567"), null);
  });
});

describe("makeDatestamp", () => {
  it("returns a 6-character string", () => {
    const stamp = makeDatestamp();
    assert.strictEqual(stamp.length, 6);
    assert.match(stamp, /^\d{6}$/);
  });
});

describe("makeTargetDir", () => {
  it("combines slug with datestamp", () => {
    const result = makeTargetDir("my-feature");
    assert.match(result, /^my-feature-\d{6}$/);
  });
});

describe("dbNameFromDir", () => {
  it("converts hyphens to underscores and adds g_ prefix", () => {
    assert.strictEqual(dbNameFromDir("better-gtask-020926"), "g_better_gtask_020926");
  });

  it("handles single-word dir names", () => {
    assert.strictEqual(dbNameFromDir("hotfix-020926"), "g_hotfix_020926");
  });

  it("handles dirs with many hyphens", () => {
    assert.strictEqual(
      dbNameFromDir("fix-ios-log-search-020926"),
      "g_fix_ios_log_search_020926"
    );
  });
});
