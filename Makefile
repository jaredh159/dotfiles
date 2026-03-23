stow:
	stow git
	stow karabiner
	stow nvim
	stow tmux
	stow ohmyzsh
	stow stow
	stow bin
	stow ghostty
	stow kitty
	stow claude
	stow codex
	stow dictator
	stow launchd

share-commands: ## Symlink Claude commands into OpenCode
	@# OpenCode commands: symlink each .md from Claude commands
	@mkdir -p ~/.config/opencode/commands
	@for f in $(HOME)/.claude/commands/*.md; do \
		ln -sf "$$f" ~/.config/opencode/commands/$$(basename "$$f"); \
	done
	@echo "Linked $$(ls ~/.config/opencode/commands/*.md 2>/dev/null | wc -l | tr -d ' ') commands to OpenCode"

.PHONY: stow share-commands
