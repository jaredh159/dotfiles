import { create } from "./create.ts";
import { clean } from "./clean.ts";

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log("usage: gtask <slug>");
  console.log("       gtask --clean");
  process.exit(1);
}

if (command === "--clean") {
  await clean();
} else {
  await create(command);
}
