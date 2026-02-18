import { describe, it } from "node:test";
import assert from "node:assert";
import { portsForSlot, portsFileContent } from "./slot.ts";

describe("portsForSlot", () => {
  it("returns default ports for slot 0", () => {
    const ports = portsForSlot(0);
    assert.strictEqual(ports.api, 8080);
    assert.strictEqual(ports.dash, 8081);
    assert.strictEqual(ports.site, 3000);
    assert.strictEqual(ports.admin, 4243);
    assert.strictEqual(ports.storybook, 6006);
  });

  it("offsets by 10 for slot 1", () => {
    const ports = portsForSlot(1);
    assert.strictEqual(ports.api, 8090);
    assert.strictEqual(ports.dash, 8091);
    assert.strictEqual(ports.site, 3010);
    assert.strictEqual(ports.admin, 4253);
    assert.strictEqual(ports.storybook, 6016);
  });

  it("offsets by 20 for slot 2", () => {
    const ports = portsForSlot(2);
    assert.strictEqual(ports.api, 8100);
    assert.strictEqual(ports.dash, 8101);
    assert.strictEqual(ports.site, 3020);
    assert.strictEqual(ports.admin, 4263);
    assert.strictEqual(ports.storybook, 6026);
  });

  it("handles slot 29 (max)", () => {
    const ports = portsForSlot(29);
    assert.strictEqual(ports.api, 8370);
    assert.strictEqual(ports.dash, 8371);
    assert.strictEqual(ports.site, 3290);
    assert.strictEqual(ports.admin, 4533);
    assert.strictEqual(ports.storybook, 6296);
  });
});

describe("portsFileContent", () => {
  it("generates shell-sourceable content", () => {
    const ports = portsForSlot(1);
    const content = portsFileContent(ports);
    assert.ok(content.includes("API_PORT=8090"));
    assert.ok(content.includes("DASH_PORT=8091"));
    assert.ok(content.includes("SITE_PORT=3010"));
    assert.ok(content.includes("ADMIN_PORT=4253"));
    assert.ok(content.includes("STORYBOOK_PORT=6016"));
  });

  it("has one variable per line", () => {
    const ports = portsForSlot(0);
    const lines = portsFileContent(ports).trim().split("\n");
    assert.strictEqual(lines.length, 5);
  });
});
