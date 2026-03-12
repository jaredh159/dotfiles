export type ParsedCommand =
  | { type: "create"; slug: string }
  | { type: "clean" | "discard" | "keep" | "sync" | "help" };

const FLAG_COMMANDS = new Map<string, ParsedCommand["type"]>([
  ["--clean", "clean"],
  ["--discard", "discard"],
  ["--keep", "keep"],
  ["--sync", "sync"],
  ["--help", "help"],
  ["-h", "help"],
]);

const RESERVED_WORDS = new Set(["clean", "discard", "keep", "sync", "help"]);
const VALID_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
    "       gtask --clean",
    "       gtask --discard",
    "       gtask --keep",
    "       gtask --sync",
  ];
}

export function parseArgs(args: string[]): ParsedCommand {
  if (args.length !== 1) {
    throw new Error("Expected exactly one argument.");
  }

  const input = args[0];
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

  return { type: "create", slug: input };
}
