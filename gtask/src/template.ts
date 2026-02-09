import { readFileSync } from "node:fs";

export function resolveTemplate(
  templateContent: string,
  vars: Record<string, string>
): string {
  const missing: string[] = [];
  const result = templateContent.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = vars[key];
    if (value === undefined) {
      missing.push(key);
      return match;
    }
    return value;
  });

  if (missing.length > 0) {
    throw new Error(`missing template variables: ${missing.join(", ")}`);
  }

  return result;
}

export function loadTemplate(templatePath: string): string {
  return readFileSync(templatePath, "utf-8");
}

export function getGtaskEnvVars(): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith("GTASK_") && value !== undefined) {
      vars[key] = value;
    }
  }
  return vars;
}

export function buildTemplateVars(
  taskVars: Record<string, string>
): Record<string, string> {
  return { ...getGtaskEnvVars(), ...taskVars };
}
