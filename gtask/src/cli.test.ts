import { describe, it } from "node:test";
import assert from "node:assert";
import { parseArgs, usageLines } from "./cli.ts";

describe("parseArgs", () => {
  it("parses a create slug", () => {
    assert.deepStrictEqual(parseArgs(["fix-login"]), {
      type: "create",
      slug: "fix-login",
    });
  });

  it("parses supported flags", () => {
    assert.deepStrictEqual(parseArgs(["--clean"]), { type: "clean" });
    assert.deepStrictEqual(parseArgs(["--discard"]), { type: "discard" });
    assert.deepStrictEqual(parseArgs(["--keep"]), { type: "keep" });
    assert.deepStrictEqual(parseArgs(["--sync"]), { type: "sync" });
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
    assert.throws(() => parseArgs(["fix-login", "extra"]), /Expected exactly one argument\./);
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
      "       gtask --clean",
      "       gtask --discard",
      "       gtask --keep",
      "       gtask --sync",
    ]);
  });
});
