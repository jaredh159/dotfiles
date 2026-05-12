---
description: Prep a task before starting implementation
---

Read the main `./AGENTS.md` file, and then check for a `./agent.task.md` file, and any
context catchup (ledger) files (pattern: `./agent.ledger.*.md`) referenced in the task
file, reading all of them, if they exist, in order.

**Important:** These files are gitignored. Use `ls agent.ledger.*.md` via Bash to find
them — Grep and Glob use ripgrep which silently skips gitignored files.

Summarize your understanding of the task and context in < 20 lines. If something seems
very unclear that would stop you from proceeding, point it out.

If, in the next command, I say something like "start" or "go ahead", or "proceed", then
start with your proposed implementation. If the task documentation specifies phases, be
sure to stop after the first phase.
