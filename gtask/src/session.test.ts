import { describe, it } from "node:test";
import assert from "node:assert";
import { taskSessionName } from "./session.ts";

describe("taskSessionName", () => {
  it("uses the slug verbatim when already clean", () => {
    assert.strictEqual(taskSessionName("daily-email"), "daily-email");
  });

  it("drops a trailing hyphen", () => {
    assert.strictEqual(taskSessionName("daily-email-"), "daily-email");
  });

  it("replaces tmux-special chars with hyphens", () => {
    assert.strictEqual(taskSessionName("foo.bar:baz"), "foo-bar-baz");
  });
});
