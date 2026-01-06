---
description: Capture current context for resumption
---

Create a brief ledger file to preserve session context for resumption.

Important: Ledger files should be less than 200 lines, unless the task is very complex and
nuanced.

## Steps

### 1. Determine ledger number

- List existing `claude.ledger.*.md` files in the project root
- New file = `claude.ledger.{max + 1}.md` (or `1` if none exist)

### 2. Create the ledger file with this structure:

```md
# Session Ledger {N} - {YYYY-MM-DD}

## Summary

Brief description of this session's focus.

## Completed

- [ ] Task/change with relevant file paths

## In Progress

- Current state, any partial work, blockers

## Remaining

- Outstanding items, open questions from original task scope

## Key Decisions / Context

- Architecture choices, gotchas, or context a future session needs
```

### 3. Update `claude.task.md`

- If missing header, prepend:

  ```md
  # Initial Task Prompt
  ```

- Append/update `## Ongoing Progress` section at EOF:

  ```md
  ## Ongoing Progress

  Read these files sequentially to resume:

  - `./claude.ledger.1.md`
  - `./claude.ledger.2.md` ...
  ```

- Ensure ALL existing ledger files are linked (not just the new one).
- After reading them, tell the user which files (including the claude.task.md file) that
  you read to resume context.
