import { create } from "./create.ts";
import { clean } from "./clean.ts";
import { discard } from "./discard.ts";
import { keep } from "./keep.ts";
import { sync } from "./sync.ts";
import { psql } from "./psql.ts";
import { heavy } from "./heavy.ts";
import { mothball } from "./mothball.ts";
import { list } from "./list.ts";
import { sidewatch } from "./sidewatch.ts";
import { parseArgs, usageLines } from "./cli.ts";

function printUsage(): void {
  for (const line of usageLines()) {
    console.log(line);
  }
}

let parsed;
try {
  parsed = parseArgs(process.argv.slice(2));
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  }
  printUsage();
  process.exit(1);
}

if (parsed.type === "help") {
  printUsage();
  process.exit(0);
}

if (parsed.type === "clean") {
  await clean({ dryRun: parsed.dryRun });
} else if (parsed.type === "discard") {
  discard();
} else if (parsed.type === "keep") {
  keep();
} else if (parsed.type === "sync") {
  sync();
} else if (parsed.type === "psql") {
  psql();
} else if (parsed.type === "heavy") {
  heavy();
} else if (parsed.type === "mothball") {
  mothball();
} else if (parsed.type === "list") {
  list();
} else if (parsed.type === "sidewatch") {
  sidewatch();
} else {
  await create(parsed.slug, { light: parsed.light });
}
