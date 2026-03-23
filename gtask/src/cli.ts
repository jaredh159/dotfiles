export type ParsedCommand =
  | { type: "create"; slug: string; light: boolean }
  | { type: "clean" | "discard" | "keep" | "sync" | "heavy" | "help" };

const FLAG_COMMANDS = new Map<string, ParsedCommand["type"]>([
  ["--clean", "clean"],
  ["--discard", "discard"],
  ["--keep", "keep"],
  ["--sync", "sync"],
  ["--heavy", "heavy"],
  ["--help", "help"],
  ["-h", "help"],
]);

const RESERVED_WORDS = new Set(["clean", "discard", "keep", "sync", "heavy", "help"]);
const VALID_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CREATE_FLAGS = new Set(["--light"]);

function levenshtein(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = prev[0];
    prev[0] = i;

    for (let j = 1; j <= b.length; j += 1) {
      const nextDiagonal = prev[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        diagonal + cost
      );
      diagonal = nextDiagonal;
    }
  }

  return prev[b.length];
}

function findSuggestion(input: string): string | null {
  const normalized = input.replace(/^-+/, "");
  let bestMatch: string | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const word of RESERVED_WORDS) {
    const distance = levenshtein(normalized, word);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = word;
    }
  }

  return bestDistance <= 2 ? bestMatch : null;
}

export function usageLines(): string[] {
  return [
    "usage: gtask <slug>",
    "       gtask --light <slug>",
    "       gtask --clean",
    "       gtask --discard",
    "       gtask --keep",
    "       gtask --sync",
    "       gtask --heavy",
    "",
    "Creates an isolated Gertrude task dir under ~/gertie/tasks/<slug>-<MMDDYY>.",
    "Each task gets its own git branch, databases, env files, and reserved port slot.",
    "",
    "Create flow:",
    "  gtask <slug>         Full create: starts warm-up in background.",
    "  gtask --light <slug> Same immediate setup, skips expensive warm-up steps.",
    "  The task directory is created immediately.",
    "  .gtask-slot, .gtask-ports, and local env files are available immediately.",
    "  That means local task files can be created right away while clone/build/test work continues.",
    "",
    "Other commands:",
    "  gtask --sync         Recreate this task's databases from gertrude_sync, then migrate.",
    "  gtask --heavy        Run the full warm-up/build/test pass in the current task dir.",
    "  gtask --discard      Mark the current task for cleanup even without a merged PR.",
    "  gtask --keep         Toggle cleanup protection for the current task.",
    "  gtask --clean        Remove merged/discarded task dirs. ⚠ Only Jared should ever run this.",
  ];
}

export function parseArgs(args: string[]): ParsedCommand {
  if (args.length === 0 || args.length > 2) {
    throw new Error("Expected a slug or one command flag.");
  }

  if (args.length === 1) {
    const input = args[0];
    const flagCommand = FLAG_COMMANDS.get(input);
    if (flagCommand) {
      return { type: flagCommand };
    }

    if (CREATE_FLAGS.has(input)) {
      throw new Error("`--light` must be used with a task slug.");
    }

    return parseSlug(input, false);
  }

  const [first, second] = args;
  if (first === "--light") {
    return parseSlug(second, true);
  }

  if (second === "--light") {
    return parseSlug(first, true);
  }

  const flagCommand = FLAG_COMMANDS.get(first) ?? FLAG_COMMANDS.get(second);
  if (flagCommand) {
    throw new Error(`\`${flagCommand}\` does not take an extra argument.`);
  }

  if (first.startsWith("--") || second.startsWith("--")) {
    const flag = first.startsWith("--") ? first : second;
    const suggestion = findSuggestion(flag);
    const suffix = suggestion ? ` Did you mean \`gtask --${suggestion}\`?` : "";
    throw new Error(`Unknown flag: ${flag}.${suffix}`);
  }

  throw new Error("Expected a single task slug.");
}

function parseSlug(input: string, light: boolean): ParsedCommand {
  const flagCommand = FLAG_COMMANDS.get(input);
  if (flagCommand) {
    return { type: flagCommand };
  }

  if (input.startsWith("--")) {
    const suggestion = findSuggestion(input);
    const suffix = suggestion ? ` Did you mean \`gtask --${suggestion}\`?` : "";
    throw new Error(`Unknown flag: ${input}.${suffix}`);
  }

  if (input.startsWith("-")) {
    throw new Error(`Unknown option: ${input}. Task slugs cannot start with '-'.`);
  }

  if (RESERVED_WORDS.has(input)) {
    throw new Error(`\`${input}\` is a command name. Did you mean \`gtask --${input}\`?`);
  }

  const suggestion = findSuggestion(input);
  if (suggestion) {
    throw new Error(`\`${input}\` looks like the \`${suggestion}\` command. Did you mean \`gtask --${suggestion}\`?`);
  }

  if (!VALID_SLUG.test(input)) {
    throw new Error(
      `Invalid slug: ${input}. Use lowercase letters, numbers, and single hyphens only.`
    );
  }

  return { type: "create", slug: input, light };
}
