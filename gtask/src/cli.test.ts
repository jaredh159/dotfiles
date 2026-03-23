import { describe, it } from "node:test";
import assert from "node:assert";
import { parseArgs, usageLines } from "./cli.ts";

describe("parseArgs", () => {
  it("parses a create slug", () => {
    assert.deepStrictEqual(parseArgs(["fix-login"]), {
      type: "create",
      slug: "fix-login",
      light: false,
    });
  });

  it("parses light create mode", () => {
    assert.deepStrictEqual(parseArgs(["--light", "fix-login"]), {
      type: "create",
      slug: "fix-login",
      light: true,
    });
    assert.deepStrictEqual(parseArgs(["fix-login", "--light"]), {
      type: "create",
      slug: "fix-login",
      light: true,
    });
  });

  it("parses supported flags", () => {
    assert.deepStrictEqual(parseArgs(["--clean"]), { type: "clean" });
    assert.deepStrictEqual(parseArgs(["--discard"]), { type: "discard" });
    assert.deepStrictEqual(parseArgs(["--keep"]), { type: "keep" });
    assert.deepStrictEqual(parseArgs(["--sync"]), { type: "sync" });
    assert.deepStrictEqual(parseArgs(["--heavy"]), { type: "heavy" });
  });

  it("rejects bare command names", () => {
    assert.throws(() => parseArgs(["clean"]), /Did you mean `gtask --clean`\?/);
  });

  it("rejects misspelled bare command names", () => {
    assert.throws(() => parseArgs(["kee0p"]), /Did you mean `gtask --keep`\?/);
  });

  it("rejects unknown double-dash flags", () => {
    assert.throws(() => parseArgs(["--kee0p"]), /Unknown flag: --kee0p\./);
    assert.throws(() => parseArgs(["--kee0p"]), /Did you mean `gtask --keep`\?/);
  });

  it("rejects leading-dash slugs", () => {
    assert.throws(
      () => parseArgs(["-feature"]),
      /Task slugs cannot start with '-'\./
    );
  });

  it("rejects invalid slug characters", () => {
    assert.throws(
      () => parseArgs(["Fix_Login"]),
      /Use lowercase letters, numbers, and single hyphens only\./
    );
  });

  it("rejects extra arguments", () => {
    assert.throws(() => parseArgs(["fix-login", "extra"]), /Expected a single task slug\./);
  });

  it("rejects bare light flag", () => {
    assert.throws(() => parseArgs(["--light"]), /`--light` must be used with a task slug\./);
  });

  it("supports help flags", () => {
    assert.deepStrictEqual(parseArgs(["--help"]), { type: "help" });
    assert.deepStrictEqual(parseArgs(["-h"]), { type: "help" });
  });
});

describe("usageLines", () => {
  it("includes the supported commands", () => {
    assert.deepStrictEqual(usageLines(), [
      "usage: gtask <slug>",
      "       gtask --light <slug>",
      "       gtask --clean",
      "       gtask --discard",
      "       gtask --keep",
      "       gtask --sync",
      "       gtask --heavy",
      "",
      "Creates an isolated Gertrude task dir under ~/gertie/tasks/<slug>-<MMDDYY>.",
      "Each task gets its own git branch, databases, env files, and reserved port slot.",
      "",
      "Create flow:",
      "  gtask <slug>         Full create: starts warm-up in background.",
      "  gtask --light <slug> Same immediate setup, skips expensive warm-up steps.",
      "  The task directory is created immediately.",
      "  .gtask-slot, .gtask-ports, and local env files are available immediately.",
      "  That means local task files can be created right away while clone/build/test work continues.",
      "",
      "Other commands:",
      "  gtask --sync         Recreate this task's databases from gertrude_sync, then migrate.",
      "  gtask --heavy        Run the full warm-up/build/test pass in the current task dir.",
      "  gtask --discard      Mark the current task for cleanup even without a merged PR.",
      "  gtask --keep         Toggle cleanup protection for the current task.",
      "  gtask --clean        Remove merged/discarded task dirs. ⚠ Only Jared should ever run this.",
    ]);
  });
});
