import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { TASKS_DIR } from "./constants.ts";
import { cyan, green, yellow } from "./color.ts";

export type TaskListRow = {
  slug: string;
  createdAt: Date;
};

export function list(root = TASKS_DIR): void {
  if (!existsSync(root)) {
    console.error(`Tasks directory not found: ${root}`);
    process.exit(1);
  }

  const rows = collectTaskRows(root);
  if (rows.length === 0) {
    console.log(cyan("no gtask directories found"));
    return;
  }

  console.log(formatTaskTable(rows));
}

export function collectTaskRows(root: string): TaskListRow[] {
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = join(root, entry.name);
      const stats = statSync(dir);
      return {
        slug: entry.name,
        createdAt: createdAt(stats),
      };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function formatTaskTable(rows: TaskListRow[]): string {
  const slugWidth = Math.max(
    "slug".length,
    ...rows.map((row) => row.slug.length)
  );

  const header = [
    cyan(pad("slug", slugWidth)),
    cyan("created at"),
  ].join("  ");

  const body = rows.map((row) =>
    [
      green(pad(row.slug, slugWidth)),
      yellow(formatDate(row.createdAt)),
    ].join("  ")
  );

  return [header, ...body].join("\n");
}

function createdAt(stats: { birthtimeMs: number; birthtime: Date; ctime: Date }): Date {
  return stats.birthtimeMs > 0 ? stats.birthtime : stats.ctime;
}

function pad(text: string, width: number): string {
  return text.padEnd(width, " ");
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}`;
}
