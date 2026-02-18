import { readdirSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { TASKS_DIR, SLOT_FILE, BASE_PORTS } from "./constants.ts";

export interface TaskPorts {
  api: number;
  dash: number;
  site: number;
  admin: number;
  storybook: number;
}

export function portsForSlot(slot: number): TaskPorts {
  return {
    api: BASE_PORTS.api + slot * 10,
    dash: BASE_PORTS.dash + slot * 10,
    site: BASE_PORTS.site + slot * 10,
    admin: BASE_PORTS.admin + slot * 10,
    storybook: BASE_PORTS.storybook + slot * 10,
  };
}

export function allocateSlot(): number {
  const used = usedSlots();
  for (let i = 0; i < 30; i++) {
    if (!used.has(i)) return i;
  }
  throw new Error("no available slots (max 30 concurrent tasks)");
}

export function readSlot(taskDir: string): number | null {
  const slotPath = join(taskDir, SLOT_FILE);
  if (!existsSync(slotPath)) return null;
  const val = parseInt(readFileSync(slotPath, "utf-8").trim(), 10);
  return isNaN(val) ? null : val;
}

export function portsFileContent(ports: TaskPorts): string {
  return [
    `API_PORT=${ports.api}`,
    `DASH_PORT=${ports.dash}`,
    `SITE_PORT=${ports.site}`,
    `ADMIN_PORT=${ports.admin}`,
    `STORYBOOK_PORT=${ports.storybook}`,
    ``,
  ].join("\n");
}

function usedSlots(): Set<number> {
  const slots = new Set<number>();
  if (!existsSync(TASKS_DIR)) return slots;
  const entries = readdirSync(TASKS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory());
  for (const entry of entries) {
    const slot = readSlot(join(TASKS_DIR, entry.name));
    if (slot !== null) slots.add(slot);
  }
  return slots;
}
