# Dotfiles

Personal dotfiles managed with GNU stow. All configs live here and are symlinked to
`$HOME`.

## Installation

```bash
make stow  # Symlinks all packages to home directory
```

## How Stow Works

Each top-level directory is a "stow package" that mirrors `$HOME` structure:

- `git/.config/git/config` → `~/.config/git/config`
- `tmux/.tmux.conf` → `~/.tmux.conf`
- `bin/.local/scripts/` → `~/.local/scripts/`

The Makefile runs `stow <package>` for each directory, creating symlinks.

## Packages

| Package      | Contents                                | Target Location             |
| ------------ | --------------------------------------- | --------------------------- |
| `git/`       | Git config, global ignore               | `~/.config/git/`            |
| `nvim/`      | Neovim config (Lua)                     | `~/.config/nvim/`           |
| `tmux/`      | Tmux configuration                      | `~/.tmux.conf`              |
| `ohmyzsh/`   | Zsh config, oh-my-zsh, p10k             | `~/.zshrc`, `~/.oh-my-zsh/` |
| `bin/`       | Shell scripts (gtask, tmux-sessionizer) | `~/.local/scripts/`         |
| `karabiner/` | Keyboard remapping (macOS)              | `~/.config/karabiner/`      |
| `kitty/`     | Kitty terminal config                   | `~/.config/kitty/`          |
| `ghostty/`   | Ghostty terminal config                 | `~/.config/ghostty/`        |
| `claude/`    | Claude CLI settings, commands           | `~/.claude/`                |
| `stow/`      | Stow ignore patterns                    | `~/.stow-global-ignore`     |

## Key Files

- `Makefile` - Single `stow` target that symlinks all packages
- `stow/.stow-global-ignore` - Patterns stow ignores (.DS_Store, .git, readme.md)
- `nvim/.config/nvim/init.lua` - Neovim entry point
- `ohmyzsh/.zshrc` - Shell configuration
- `bin/.local/scripts/` - Custom shell utilities

## Adding New Configs

1. Create directory: `mkdir -p newpkg/.config/newpkg`
2. Add config files inside mirroring home structure
3. Add `stow newpkg` to Makefile
4. Run `make stow`
