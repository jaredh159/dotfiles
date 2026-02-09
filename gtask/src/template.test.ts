import { describe, it } from "node:test";
import assert from "node:assert";
import { resolveTemplate, getGtaskEnvVars, buildTemplateVars } from "./template.ts";

describe("resolveTemplate", () => {
  it("replaces simple placeholders", () => {
    const result = resolveTemplate("hello {{NAME}}", { NAME: "world" });
    assert.strictEqual(result, "hello world");
  });

  it("replaces multiple placeholders", () => {
    const result = resolveTemplate("{{A}} and {{B}}", { A: "1", B: "2" });
    assert.strictEqual(result, "1 and 2");
  });

  it("replaces duplicate placeholders", () => {
    const result = resolveTemplate("{{X}} then {{X}}", { X: "val" });
    assert.strictEqual(result, "val then val");
  });

  it("throws on missing variables", () => {
    assert.throws(
      () => resolveTemplate("{{MISSING}}", {}),
      /missing template variables: MISSING/
    );
  });

  it("reports all missing variables at once", () => {
    assert.throws(
      () => resolveTemplate("{{A}} {{B}}", {}),
      /missing template variables: A, B/
    );
  });

  it("leaves non-placeholder text unchanged", () => {
    const input = "no placeholders here\njust regular text";
    const result = resolveTemplate(input, {});
    assert.strictEqual(result, input);
  });

  it("handles empty string values", () => {
    const result = resolveTemplate("key={{VAL}}", { VAL: "" });
    assert.strictEqual(result, "key=");
  });

  it("handles values with special characters", () => {
    const result = resolveTemplate("key={{VAL}}", {
      VAL: "sk_test_abc$123\\nline2",
    });
    assert.strictEqual(result, "key=sk_test_abc$123\\nline2");
  });

  it("handles multiline PEM-style values", () => {
    const pem = "-----BEGIN KEY-----\\nABC\\n-----END KEY-----";
    const result = resolveTemplate('KEY="{{VAL}}"', { VAL: pem });
    assert.strictEqual(result, `KEY="${pem}"`);
  });
});

describe("getGtaskEnvVars", () => {
  it("picks up GTASK_ prefixed env vars", () => {
    process.env.GTASK_TEST_VAR = "test_value";
    const vars = getGtaskEnvVars();
    assert.strictEqual(vars.GTASK_TEST_VAR, "test_value");
    delete process.env.GTASK_TEST_VAR;
  });

  it("ignores non-GTASK_ vars", () => {
    const vars = getGtaskEnvVars();
    assert.strictEqual(vars.HOME, undefined);
    assert.strictEqual(vars.PATH, undefined);
  });
});

describe("buildTemplateVars", () => {
  it("merges env vars with task vars", () => {
    process.env.GTASK_SECRET = "s3cret";
    const vars = buildTemplateVars({ TASK_DB_NAME: "gertrude_my_task" });
    assert.strictEqual(vars.GTASK_SECRET, "s3cret");
    assert.strictEqual(vars.TASK_DB_NAME, "gertrude_my_task");
    delete process.env.GTASK_SECRET;
  });

  it("task vars override env vars", () => {
    process.env.GTASK_OVERRIDE = "from_env";
    const vars = buildTemplateVars({ GTASK_OVERRIDE: "from_task" });
    assert.strictEqual(vars.GTASK_OVERRIDE, "from_task");
    delete process.env.GTASK_OVERRIDE;
  });
});
