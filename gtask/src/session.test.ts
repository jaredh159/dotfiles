import { describe, it } from "node:test";
import assert from "node:assert";
import { taskSessionName } from "./session.ts";

describe("taskSessionName", () => {
  it("uses the directory basename as the session name", () => {
    assert.strictEqual(taskSessionName("/home/user/gertie/tasks/daily-email-062424"), "daily-email-062424");
  });

  it("handles a plain basename without a date suffix", () => {
    assert.strictEqual(taskSessionName("/gertie/tasks/my-feature"), "my-feature");
  });
});
