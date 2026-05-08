---
description: Capture current context for resumption
---

Capture the context that materially helps the next session resume work.

Default to updating or consolidating the current resume context when that keeps the resume
path easier to read.

## Core goals

- Preserve concise, high-value resume context
- Prefer durable decisions, current state, remaining work, blockers, and open questions
- Skip implementation residue that is unlikely to matter next session
- Keep the task file's resume list focused so future agents do not reread stale context

## Size and reuse guidelines

- Aim for **60-120 lines**.
- It is fine to go longer when the task is unusually complex or nuance would be lost.
- Prefer **updating the latest ledger** when it already covers the same workstream and can
  stay readable after pruning.
- Create a **new** ledger when there is a real phase boundary, topic shift, or the current
  ledger would become unwieldy.
- If there are already many ledgers, consider creating a **consolidated ledger** that
  supersedes older ones, then trim the resume list in `agent.task.md` to the files still
  worth reading.

## What to include

- What we are doing and why
- What is actually done in user-meaningful terms
- What remains, especially the next sensible starting point
- Durable architecture / product / workflow decisions
- Important gotchas that are likely to bite a future session again
- Open questions, unresolved tradeoffs, and explicitly deferred work
- Blocking failures that are still unresolved or changed the plan

## What to omit or summarize unless essential

- Exact test counts, "all tests pass", lint/typecheck summaries, or routine validation
- Temporary tool noise: SourceKit glitches, stale build errors, linter churn, formatter
  edits
- Exact short IDs, log IDs, Slack tags, event IDs, request IDs, or `sid --llm` output
- Step-by-step implementation history when the end state can be summarized directly
- Micro-iterations of copy/layout/styling unless they encode a durable user preference
- "user tweaked X / then changed Y / then changed it back" narration
- Storybook scaffolding details unless storybook itself is the deliverable
- Background-task / async / helper extraction details unless they affect future work
- File-by-file inventories when a compact grouped summary is enough
- Low-value "nothing in progress" sections that add little information

## Token efficiency rules

- Write for the next agent who needs to act, not for audit history.
- Usually summarize end state over chronology.
- Collapse repeated implementation patterns into one reusable note when it preserves the
  useful signal.
- Mention tests when they affect resume behavior, such as:
  - a failure is still blocking
  - a missing test is important
  - a specific regression risk should be rechecked
- Mention commands/tooling when a future session would benefit from knowing them.
- Prefer a few grouped bullets over long sub-bullets and exhaustive file lists.
- If older ledgers are fully superseded, say so plainly in the consolidated ledger.

## Ledger decision heuristic

Decide between **update latest**, **append new**, and **consolidate** in this order.

### Update the latest ledger

Use this when the session is continuing the same phase of work and the latest ledger can
still serve as the single best resume document after pruning.

Good fit:

- Same workstream, goals, and general direction
- New information mostly changes current state, remaining work, blockers, or a few
  decisions
- The revised ledger will still fit within the recommended size
- A future agent could safely treat the updated latest ledger as the primary resume
  document

Prefer this option when it remains a good resume document.

### Append a new ledger

Use this when there is a real boundary that deserves its own resumable chunk.

Good fit:

- A new phase started: planning -> implementation, backend -> frontend, spike ->
  production
- A substantial new topic or branch of work opened
- The previous ledger remains a useful closed snapshot
- Folding the new session into the prior ledger would make it too long or muddy

Avoid appending just because another session happened.

### Consolidate

Use this when the active resume path has become too long or repetitive.

Good fit:

- `agent.task.md` would otherwise point to more than about 3 ledgers
- Multiple ledgers repeat the same background or decisions
- Earlier ledgers contain outdated theories or superseded context
- Resuming would require synthesis across many files instead of reading one current
  summary

When consolidating:

- Write one ledger that captures the current truth
- Explicitly note which older ledgers it supersedes for resume purposes
- Update `agent.task.md` so the resume list points to the files still worth reading

### Thresholds

- `0-2` active ledgers: usually fine
- `3` active ledgers: acceptable only if each has clearly distinct scope
- `4+` active ledgers: consider consolidation
- If the latest ledger would become hard to scan after cleanup, either split at a real
  phase boundary or consolidate

## Steps

### 1. Inspect existing resume context

- List existing `agent.ledger.*.md` files in the project root using `ls agent.ledger.*.md`
  via Bash (these files are gitignored, so Grep/Glob will silently skip them).
- Read the latest ledger first, and any other ledgers still referenced by `agent.task.md`.
- Decide whether to:
  - update the latest ledger in place
  - create a new ledger for a new phase
  - create a consolidation ledger that replaces several older ledgers for resume purposes

### 2. Write or update the ledger using this structure

```md
# Session Ledger {N} - {YYYY-MM-DD}

## Summary

2-4 lines on the current task state and why it matters.

## Completed

- Durable progress. Group related changes.

## Current State

- Current working state, partial work that matters, active blockers

## Remaining

- Outstanding work, open questions, next sensible step

## Key Decisions / Context

- Durable decisions, gotchas, deferred items, resume-critical context
```

Notes:

- Sections may be omitted or merged if they would be empty or repetitive.
- Add file paths only where they materially help the next session.
- Use compact bullets and short paragraphs. Avoid deep nesting.

### 3. Update `agent.task.md`

- If missing header, prepend:

  ```md
  # Initial Task Prompt
  ```

- Append/update `## Ongoing Progress` section at EOF:

  ```md
  ## Ongoing Progress

  Read these files sequentially to resume:

  - `./agent.ledger.N.md` — 1-line reason this file is still worth reading
  - `./agent.ledger.M.md` — when still independently valuable
  ```

- Keep this list **focused**. Do not link every historical ledger by default.
- Remove older ledgers from the resume list when a newer ledger clearly supersedes them.
- Older ledgers may stay on disk, but currently useful ones should remain in the task
  file's resume sequence.
- After reading them, tell the user which files (including the agent.task.md file) that
  you read to resume context.
