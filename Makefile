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
	stow dictator
	stow launchd

share-commands: ## Symlink Claude commands/skills into OpenCode and Codex
	@# OpenCode commands: symlink each .md from Claude commands
	@mkdir -p ~/.config/opencode/commands
	@for f in $(HOME)/.claude/commands/*.md; do \
		ln -sf "$$f" ~/.config/opencode/commands/$$(basename "$$f"); \
	done
	@echo "Linked $$(ls ~/.config/opencode/commands/*.md 2>/dev/null | wc -l | tr -d ' ') commands to OpenCode"
	@# Codex skills: append skill paths to config.toml
	@mkdir -p ~/.codex
	@touch ~/.codex/config.toml
	@for d in $(HOME)/.claude/skills/*/; do \
		skill=$$(basename "$$d"); \
		if ! grep -q "path = \"$$d\"" ~/.codex/config.toml 2>/dev/null; then \
			printf '\n[[skills.config]]\nenabled = true\npath = "%s"\n' "$$d" >> ~/.codex/config.toml; \
		fi; \
	done
	@echo "Registered $$(ls -d ~/.claude/skills/*/ 2>/dev/null | wc -l | tr -d ' ') skills in Codex config"

.PHONY: stow share-commands
