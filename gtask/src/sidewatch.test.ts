import { describe, it } from "node:test";
import assert from "node:assert";
import { sidewatchWindowName } from "./sidewatch.ts";

describe("sidewatchWindowName", () => {
  it("drops the gtask date suffix", () => {
    assert.strictEqual(
      sidewatchWindowName("/Users/jared/gertie/tasks/daily-email-061726"),
      "daily-email"
    );
  });

  it("removes a separator left before a legacy date suffix", () => {
    assert.strictEqual(
      sidewatchWindowName("/Users/jared/gertie/tasks/daily-email---06-17-2026"),
      "daily-email"
    );
  });

  it("falls back to the directory name for unrecognized task dirs", () => {
    assert.strictEqual(
      sidewatchWindowName("/Users/jared/gertie/tasks/random-directory"),
      "random-directory"
    );
  });
});
