---
description: Start a task
---

Read the main `./AGENTS.md` file, and then check for a `./agent.task.md` file, and any
context catchup (ledger) files (pattern: `./agent.ledger.*.md`) referenced in the task
file, reading all of them, if they exist, in order.

**Important:** These files are gitignored. Use `ls agent.ledger.*.md` via Bash to find
them — Grep and Glob use ripgrep which silently skips gitignored files.

Then start on the task right away, unless something is significantly unclear, in which
case ask for clarification.
