# gtask

CLI tool for managing isolated Gertrude monorepo task directories. Written in TypeScript,
run with Node's native type stripping (no build step). Zero npm dependencies.

## Commands

- `gtask <slug>` — create a new task directory at `~/gertie/tasks/<slug>-<MMDDYY>/`
- `gtask --light <slug>` — create a new task directory but skip the expensive warm-up steps
- `gtask --clean` — remove task directories whose PRs have been merged
- `gtask --discard` — mark current task for cleanup without merge check
- `gtask --keep` — toggle protection on current task (prevents cleanup even if merged)
- `gtask --sync` — drop and recreate current task's databases from `gertrude_sync`, then migrate

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

Returns to the shell immediately — only the staging dir setup is synchronous.

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
includes `GTASK_NGROK_SUBDOMAIN` for local iOS/ngrok configuration.

## Source files

- `src/main.ts` — CLI entry point
- `src/create.ts` — task creation
- `src/clean.ts` — merged task cleanup
- `src/discard.ts` — mark task for discard
- `src/keep.ts` — toggle keep protection on task
- `src/sync.ts` — recreate task databases from template
- `src/slot.ts` — slot allocation and port calculation
- `src/template.ts` — env template resolution
- `src/parse.ts` — dir name parsing, datestamp, db name derivation
- `src/exec.ts` — shell helpers (sync, safe, background)
- `src/constants.ts` — paths, ports, template mappings

## Tests

```bash
cd ~/.dotfiles/gtask && node --test src/*.test.ts
```
