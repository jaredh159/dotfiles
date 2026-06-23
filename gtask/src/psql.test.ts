import { describe, it } from "node:test";
import assert from "node:assert";
import { databaseNameForTaskRoot } from "./psql.ts";

describe("databaseNameForTaskRoot", () => {
  it("derives the main database name from a task directory", () => {
    assert.strictEqual(
      databaseNameForTaskRoot("/Users/jared/gertie/tasks/fix-login-062326"),
      "g_fix_login_062326"
    );
  });
});
