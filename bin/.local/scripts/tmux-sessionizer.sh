#!/usr/bin/env bash

SESSION=$(find ~ ~/gertie ~/mfl/en ~/mfl/es ~/playground ~/jaredh159 ~/jaredh159/twrnc ~/sites -mindepth 1 -maxdepth 1 -type d | fzf);
SESSION_NAME=$(basename "$SESSION" | tr . _);

if ! tmux has-session -t "$SESSION_NAME" 2> /dev/null; then
  tmux new-session -s "$SESSION_NAME" -c "$SESSION" -d
fi

tmux switch-client -t "$SESSION_NAME"
