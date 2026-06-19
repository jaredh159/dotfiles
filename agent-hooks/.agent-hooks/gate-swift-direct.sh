#!/usr/bin/env bash
set -uo pipefail

input=$(cat)
command=$(jq -r '.tool_input.command // ""' <<<"$input")

if ! printf '%s' "$command" | grep -Eq '(^|[[:space:];&|(])swift[[:space:]]+(build|test)([[:space:]]|$)'; then
  exit 0
fi

cwd=$(jq -r '.cwd // ""' <<<"$input")
dir=${cwd:-$PWD}

while [[ -n "$dir" && "$dir" != "/" ]]; do
  if [[ -f "$dir/swift/AGENTS.md" ]]; then
    cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Don't run `swift build` or `swift test` directly in this repo. Use the `just` scripts described in swift/AGENTS.md instead — read swift/AGENTS.md first for the required workflow."
  }
}
EOF
    exit 0
  fi
  dir=$(dirname "$dir")
done

exit 0
