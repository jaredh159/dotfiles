---
name: point-free
description: Use this when a task involves the Point-Free ecosystem, the Point-Free Way, or Swift libraries and patterns from Point-Free such as Composable Architecture, Dependencies, Swift Navigation, Case Paths, Sharing, SQLiteData, StructuredQueries, SnapshotTesting, CustomDump, Testing, Modern SwiftUI, Perception, macro testing, issue reporting, observable models, or SPM integration.
metadata:
  short-description: Entry point for Point-Free Way guidance.
---

# Point-Free

Use this as the single entry point for Point-Free Way guidance in Claude Code and Codex.

## Workflow

1. Read [references/catalog.md](references/catalog.md) to find the relevant upstream skill.
2. If you use any nested Point-Free skill, also read [references/upstream/pfw/SKILL.md](references/upstream/pfw/SKILL.md).
3. Load only the upstream skill files that match the request, using paths like `references/upstream/<skill>/SKILL.md`.
4. Follow the nested skill's own instructions for any additional reference files.

## Notes

- The upstream Point-Free skills are nested under `references/upstream/` on purpose so the visible skill list stays small.
- Refresh the nested upstream links and catalog with `scripts/sync-upstream-skills.sh` after updating `~/.pfw/skills`.
