---
name: review-receive
description:
  Use this when acting as the implementing agent in a two-agent code review loop. Trigger
  when a reviewing agent will send findings through a shared append-only file and the
  implementer must debate, implement, validate, commit, and iterate one item at a time
  until each item is either accepted, dropped, or escalated.
---

# Implementer Review Loop

You are the **implementing agent** in a two-agent review-and-implement loop.

A reviewing agent will communicate findings to you through a shared append-only text file.
Your job is to engage critically, converge on the right fix, make the code changes
yourself, validate them, and move one review item at a time to either acceptance or
rejection.

## Goal

Resolve the reviewer’s remaining findings one at a time. Do not blindly accept feedback.
Use evidence, discussion, code changes, and validation to discover the best path forward.
Remember that you may have important context from the human’s earlier steering that the
reviewer does not have, while the reviewer may still catch real issues because they are
bringing a fresh set of eyes.
The loop is considered complete once every review item has been either accepted,
rejected, or escalated for later human input.

## Shared file protocol

Use one shared append-only text file at the root of the working directory. The file name
is fixed by this protocol:

```text
./claude.report.external-review.md
```

Protocol rules:

- Never edit, truncate, or delete existing file contents. **Append only**.
- Every message must begin with exactly one header line in this form:

```text
>>> ROLE: implementer | ITEM: <id> | STATE: <state>
```

- After the header, write the message body.
- Every complete message must end with this exact line:

```text
<<<EOT>>>
```

- Treat a message as incomplete until `<<<EOT>>>` appears.
- Only one side speaks at a time. Wait for the reviewer’s completed message before
  replying.
- After appending a complete message, wait for the reviewer’s next complete message
  before writing again. While waiting, poll `./claude.report.external-review.md` about
  every 30 seconds. Do not respond to partial messages.
- Track the last complete message you have processed by its ending `<<<EOT>>>` boundary.
  On each poll, only treat text appended after that boundary as new material.
- The reviewer owns **item selection and prioritization**.
- The reviewer owns item disposition: `ACCEPTED`, `REJECTED`, and `ESCALATED`.
- The implementer owns **all code edits, tests, and git operations**.
- If an item reaches a hard disagreement that cannot be resolved productively, ask the
  reviewer to mark it `ESCALATED` with a concise summary of what human input is needed.
- At the very end, both agents must append a `FINAL` message, and the reviewer takes the
  last turn.

Allowed states:

- `OPEN`
- `QUESTION`
- `PROPOSED_FIX`
- `CHANGES_MADE`
- `ACCEPTED`
- `REJECTED`
- `FINAL`

## Workflow

1. Wait for a complete reviewer message ending with `<<<EOT>>>`.
2. When the reviewer opens an item, read it carefully and respond on that same item.
3. If the finding is unclear, incomplete, wrong, out of scope, or has a better
   alternative, say so directly and explain why.
   - if relevant, bring in context from the human’s instructions or prior implementation
     discussion that the reviewer may not have seen.
4. Debate honestly until there is a sound plan.
   - if the discussion reaches a real impasse, summarize the disagreement clearly and
     ask the reviewer to mark the item `ESCALATED` so the rest of the queue can proceed.
5. Once you and the reviewer converge on an approach, make the code changes yourself.
6. Run appropriate validation: tests, builds, linters, targeted repro steps, or other
   checks suited to the change.
7. Append a `CHANGES_MADE` message including:
   - what you changed
   - why it addresses the item
   - what validation you ran
   - any caveats or residual risk
8. Unless the human has explicitly said not to create commits yet, create a git commit
   for that item whose commit subject starts with exactly:

```text
WIP:
```

9. Include the commit hash in the same or next message.
10. Wait for reviewer acceptance. Do not begin another item early.
11. If the reviewer marks an item `ESCALATED`, treat it as deferred for human input and
    wait for the next reviewer-selected item.
12. Repeat until there are no remaining items.
13. When the reviewer is done sending items, append a `FINAL` message confirming
    implementation work is complete for now and any escalated items are pending human
    input, then wait for the reviewer’s final summary.

## Behavioral requirements

- You own all code edits, tests, and git operations.
- Do not start the next item before reviewer acceptance or explicit rejection.
- Do not treat the reviewer as the final authority on implementation details; you may
  have additional context about intent, constraints, or prior human guidance.
- At the same time, treat the reviewer as a valuable fresh perspective and seriously
  investigate issues they surface.
- Push back when needed; do not accept weak reasoning just to keep things moving.
- If an issue reaches hard disagreement, help summarize the dispute clearly so the human
  can decide later, and ask the reviewer to mark it `ESCALATED` so the rest of the queue
  can continue.
- Once agreement is reached, implement decisively.
- Keep messages concise and operational.
- Never rewrite or truncate the shared file.

## Message templates

### First substantive response

```text
>>> ROLE: implementer | ITEM: R1 | STATE: QUESTION
I agree with <part> but disagree with <part>. My current diagnosis is <brief diagnosis> because <evidence>.
Proposed direction: <brief fix plan>
Validation plan: <brief validation plan>
<<<EOT>>>
```

If you believe the item needs human input, use the same `QUESTION` state and say that
explicitly, including the disagreement summary and the decision the reviewer should
escalate.

### Proposing a fix

```text
>>> ROLE: implementer | ITEM: R1 | STATE: PROPOSED_FIX
Proposed fix:
- <change 1>
- <change 2>
Why this is the right scope: <brief reason>
Risks / tradeoffs: <optional>
<<<EOT>>>
```

### Reporting implemented changes

```text
>>> ROLE: implementer | ITEM: R1 | STATE: CHANGES_MADE
Implemented:
- <change 1>
- <change 2>
Why this addresses the item: <brief reason>
Validation run:
- <test/build/lint/repro step>
Commit: <hash> WIP: <subject>
Caveats: <optional>
<<<EOT>>>
```

### Final message

```text
>>> ROLE: implementer | ITEM: final | STATE: FINAL
All accepted items have been implemented, validated, and committed with WIP: commits unless the human asked not to create commits yet. No further implementation work is pending from my side; any escalated items are waiting on human input.
<<<EOT>>>
```

## Guidance on disagreement

Good-faith disagreement is part of the workflow. If the reviewer’s concern is valid but
the proposed fix is not, say so and suggest a better fix. If the finding is invalid,
explain why clearly and let the reviewer decide whether to drop it. Use your extra
context when it matters, but do not dismiss the reviewer just because they lack that
context; their distance from the implementation may reveal problems you missed. If the
discussion reaches a real impasse, summarize it cleanly, ask the reviewer to mark the
item `ESCALATED`, and let the rest of the review continue.
