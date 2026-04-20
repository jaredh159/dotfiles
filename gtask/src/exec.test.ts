import { describe, it } from "node:test";
import assert from "node:assert";
import { withXcrunSwiftFirst } from "./exec.ts";

describe("withXcrunSwiftFirst", () => {
  it("prepends xcrun-resolved swift setup before commands", () => {
    const script = withXcrunSwiftFirst([`echo "hello"`]);

    assert.match(script, /xcrun --find swift/);
    assert.match(script, /export PATH="\$swift_bin:\$PATH"/);
    assert.match(script, /echo "hello"/);
    assert.ok(script.indexOf(`xcrun --find swift`) < script.indexOf(`echo "hello"`));
  });
});
