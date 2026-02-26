import { create } from "./create.ts";
import { clean } from "./clean.ts";
import { discard } from "./discard.ts";
import { keep } from "./keep.ts";

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log("usage: gtask <slug>");
  console.log("       gtask --clean");
  console.log("       gtask --discard");
  console.log("       gtask --keep");
  process.exit(1);
}

if (command === "--clean") {
  await clean();
} else if (command === "--discard") {
  discard();
} else if (command === "--keep") {
  keep();
} else {
  await create(command);
}
