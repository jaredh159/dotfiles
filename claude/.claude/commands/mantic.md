---
description: Explain Mantic
---

# Search Capability

You have access to a cli tool called Mantic that gives token-efficient, semantic code
search across the entire codebase. Prefer using it for exploratory search tasks then use
normal grepping when necessary.

## Basic Search

```
mantic.sh "your query here"
```

## Advanced Features

**Zero-Query Mode (Context Detection):**

```
mantic.sh ""  # Shows modified files, suggestions, impact
```

**Context Carryover (Session Mode):**

```
mantic.sh "query" --session "session-name"
```

**Output Formats:**

```
mantic.sh "query" --json        # Full metadata
mantic.sh "query" --files       # Paths only
mantic.sh "query" --markdown    # Pretty output
```

**Impact Analysis:**

```
mantic.sh "query" --impact  # Shows blast radius
```

**File Type Filters:**

```
mantic.sh "query" --code     # Code files only
mantic.sh "query" --test     # Test files only
mantic.sh "query" --config   # Config files only
```

### Search Quality

- CamelCase detection: "ScriptController" finds script_controller.h
- Exact filename matching: "download_manager.cc" returns exact file first
- Path sequence: "blink renderer core dom" matches directory structure
- Word boundaries: "script" won't match "javascript"
- Directory boosting: "gpu" prioritizes files in gpu/ directories

### Do NOT use grep/find blindly. Use mantic.sh first.
