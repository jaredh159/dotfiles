import { describe, it } from "node:test";
import assert from "node:assert";
import { warmupCommands } from "./create.ts";
import { portsForSlot } from "./slot.ts";

describe("warmupCommands", () => {
  it("installs pnpm dependencies before Swift warm-up work", () => {
    const commands = warmupCommands("/tmp/task", portsForSlot(0));

    assert.ok(
      commands.indexOf(`run pnpm install`) <
        commands.indexOf(`run just migrate-up`)
    );
    assert.ok(
      commands.indexOf(`run pnpm install`) <
        commands.indexOf(`run just build`)
    );
  });

  it("validates the resolved Swift toolchain through swiftly when available", () => {
    const script = warmupCommands("/tmp/task", portsForSlot(0)).join("\n");

    assert.match(script, /swiftly_bin=/);
    assert.match(script, /swift_cmd=\("\$swiftly_bin" run swift\)/);
    assert.match(script, /\[gtask\] resolved swift --version:/);
    assert.doesNotMatch(script, /xcrun --find swift/);
  });

  it("continues to web warm-up when the Swift toolchain is invalid", () => {
    const commands = warmupCommands("/tmp/task", portsForSlot(0));

    assert.ok(
      commands.indexOf(`  echo "[gtask] skipping swift warm-up commands because the Swift toolchain is invalid" >> "$log"`) <
        commands.lastIndexOf(`run just lint`)
    );
  });
});
