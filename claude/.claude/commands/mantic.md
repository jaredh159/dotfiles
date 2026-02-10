---
description: Explain Mantic
---

# Search Capability

You have access to a cli tool called `mantic` that gives token-efficient, semantic code
search across the entire codebase. Prefer using it for exploratory search tasks then use
normal grepping when necessary.

## Basic Search

```
mantic "your query here"
```

## Advanced Features

**Zero-Query Mode (Context Detection):**

```
mantic ""  # Shows modified files, suggestions, impact
```

**Context Carryover (Session Mode):**

```
mantic "query" --session "session-name"
```

**Output Formats:**

```
mantic "query" --json        # Full metadata
mantic "query" --files       # Paths only
mantic "query" --markdown    # Pretty output
```

**Impact Analysis:**

```
mantic "query" --impact  # Shows blast radius
```

**File Type Filters:**

```
mantic "query" --code     # Code files only
mantic "query" --test     # Test files only
mantic "query" --config   # Config files only
```

### Search Quality

- CamelCase detection: "ScriptController" finds script_controller.h
- Exact filename matching: "download_manager.cc" returns exact file first
- Path sequence: "blink renderer core dom" matches directory structure
- Word boundaries: "script" won't match "javascript"
- Directory boosting: "gpu" prioritizes files in gpu/ directories

### Do NOT use grep/find blindly. Use mantic first.
