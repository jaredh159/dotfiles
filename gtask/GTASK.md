# gtask

CLI tool for managing isolated Gertrude monorepo task directories. Written in TypeScript,
run with Node's native type stripping (no build step). Zero npm dependencies.

## Commands

- `gtask <slug>` — create a new task directory at `~/gertie/tasks/<slug>-<MMDDYY>/`
- `gtask --light <slug>` — create a new task directory but skip the expensive warm-up steps
- `gtask --clean` — remove task directories whose PRs have been merged
- `gtask --discard` — mark current task for cleanup without merge check
- `gtask --keep` — toggle protection on current task (prevents cleanup even if merged)
- `gtask --sync` — drop and recreate current task's databases from `gertrude_sync`
- `gtask --heavy` — from inside a task dir, run the full warm-up/build/test pass that `--light` skips
- `gtask --mothball` — from inside a task dir, delete regenerable build output to reclaim disk while keeping all source/history

## What `create` does

1. Allocates a port slot (0–29) by scanning existing tasks
2. Writes env files and port/slot config to a tmpdir staging area
3. Kicks off a background process that:
   - Creates per-task databases from `gertrude_sync` template
   - Clones the monorepo, checks out a new branch
   - Copies env files and `.gtask-slot`/`.gtask-ports` into the task dir
   - Warms caches: `pnpm install`, `just build`, xcode builds, tests, lint
   - Deepens the shallow clone after the task is otherwise ready

With `--light`, gtask still creates the task dir, databases, env files, branch, and post-create
Git history deepen, but skips the warm-up work such as migrations, installs, builds, checks, tests,
and storybook cache priming.

If you start light and later want the full deep-work pass, run `gtask --heavy` from anywhere inside
that task directory. It backgrounds the same warm-up sequence used by a normal full create.

Returns to the shell immediately — only the staging dir setup is synchronous.

## What `mothball` does

For tasks that are dormant/on ice but you don't want to delete. Run it from inside a task
dir to reclaim disk by deleting only regenerable, gitignored build output:

- `.build` (SwiftPM build dirs — typically ~95% of a task's footprint)
- `node_modules` (pnpm workspaces under `swift/` and `web/`)
- `.nx` (Nx cache)

See `MOTHBALL_TARGETS` in `constants.ts` for the exact list. It removes these top-level
matches via `rm -rf` (pruning so a nested match is removed with its parent) and reports
the space freed. Everything else is left untouched: the `.git` repo and all commits,
tracked source, uncommitted edits and untracked new files, env files, and the
`.gtask-slot`/`.gtask-ports` config.

It deliberately does **not** use `git clean`: each `.build/checkouts/*` is a nested git
repo that `git clean` skips (leaving the bulk of the disk usage behind), and `git clean -X`
would also wipe the gitignored env and `.gtask-*` config needed to resume the task.

### Mothballed state

Mothball writes a `.gtask-mothball` marker (an ISO timestamp) so the state is explicit
rather than inferred. The `already mothballed` message keys on this marker, so a
never-warmed `--light` task (which also has no build output) is not mistaken for a
mothballed one. The marker is gitignored via the global `.gtask-*` rule.

To wake a mothballed task back up, run `gtask --heavy` inside it: it rebuilds everything
**and** clears the `.gtask-mothball` marker as its first step (`clearMothballMarker`), so
heavy is the explicit un-mothball. Marker present = dormant; absent = active.

## What `clean` does

1. Scans `~/gertie/tasks/` for task directories
2. Checks GitHub for merged PRs matching each branch
3. Backgrounds: kills ports/tmux sessions, drops databases, removes directories

## Port isolation

Five services get ports offset by `slot × 10` from their base:

| Service   | Base |
|-----------|------|
| api       | 8080 |
| dash      | 8081 |
| site      | 3000 |
| admin     | 4243 |
| storybook | 6006 |

Slot 0 = default ports. Slot 1 = 8090, 8091, 3010, etc. The monorepo justfiles read
`.gtask-ports` (shell-sourceable) via `set dotenv-filename`, falling back to defaults
when absent. If `GTASK_NGROK_SUBDOMAIN` is set in your local shell environment,
gtask also writes `NGROK_SUBDOMAIN=...` into `.gtask-ports`.

## Database isolation

- Main DB: `g_<dirname_underscored>` created from `gertrude_sync` template
- Test DB: `g_<dirname_underscored>_test` created empty
- Both dropped on `gtask --clean`

## Env file templates

Templates live in `gtask/env/` with `{{PLACEHOLDER}}` syntax. Secrets come from `GTASK_*`
env vars defined in `secrets.local` (sourced in `.zshrc`). Task-specific values
(`TASK_DATABASE_NAME`, `TASK_API_PORT`, etc.) are injected at creation time. This
includes `GTASK_NGROK_SUBDOMAIN` for local iOS/ngrok configuration and any service
credentials that need to become non-`GTASK_` runtime env vars in generated task files
such as `KEYCHAIN_CRAWLER_URL` and `KEYCHAIN_CRAWLER_AUTH_TOKEN`.

## Source files

- `src/main.ts` — CLI entry point
- `src/create.ts` — task creation
- `src/clean.ts` — merged task cleanup
- `src/discard.ts` — mark task for discard
- `src/keep.ts` — toggle keep protection on task
- `src/sync.ts` — recreate task databases from template
- `src/mothball.ts` — delete regenerable build output to reclaim disk
- `src/slot.ts` — slot allocation and port calculation
- `src/template.ts` — env template resolution
- `src/parse.ts` — dir name parsing, datestamp, db name derivation
- `src/exec.ts` — shell helpers (sync, safe, background)
- `src/constants.ts` — paths, ports, template mappings

## Tests

```bash
cd ~/.dotfiles/gtask && node --test src/*.test.ts
```
