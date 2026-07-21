#!/usr/bin/env bash

dirs() {
  find ~ ~/gertie ~/gertie/tasks ~/mfl/en ~/mfl/es ~/playground ~/jaredh159 ~/jaredh159/twrnc ~/sites -mindepth 1 -maxdepth 1 -type d
}

if [[ -n "$1" ]]; then
  # non-interactive: best fuzzy match for a query (voice-driven via dictator)
  SESSION=$(dirs | fzf --filter "$1" | head -1)
else
  SESSION=$(dirs | fzf)
fi

[[ -n "$SESSION" ]] || exit 0
SESSION_NAME=$(basename "$SESSION" | tr . _);

if ! tmux has-session -t "$SESSION_NAME" 2> /dev/null; then
  tmux new-session -s "$SESSION_NAME" -c "$SESSION" -d
fi

# when invoked by voice, target the focused client explicitly
client_args=()
[[ -n "${TMUX_VOICE_CLIENT:-}" ]] && client_args=(-c "$TMUX_VOICE_CLIENT")
tmux switch-client "${client_args[@]}" -t "$SESSION_NAME"
