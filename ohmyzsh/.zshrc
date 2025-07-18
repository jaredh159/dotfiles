export ZSH="$HOME/.oh-my-zsh"

# ZSH_THEME="robbyrussell"

ZSH_THEME="agnoster"
DEFAULT_USER="jared"

# Source secrets if they exist
[ -f "$HOME/.dotfiles/secrets.local" ] && source "$HOME/.dotfiles/secrets.local"

plugins=(git)

source $HOME/.zshenv
source $ZSH/oh-my-zsh.sh
source $ZSH/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh
source $HOME/.cargo/env # rust

# enable completions for `just`
# eval "$(brew shellenv)"
fpath=($HOMEBREW_PREFIX/share/zsh/site-functions $fpath)

bindkey -s ^f "tmux-sessionizer.sh\n"

# atuin
eval "$(atuin init zsh --disable-up-arrow)"

# fixes kitty + tmux for some reason...
unset MANPATH

# usage: `release 1.2.1`
release() {
  git tag v$1
  git push origin master
  git push origin tag v$1
  gh release create v$1 --title v$1 --notes ""
}


# when you transfer to headless mini, start with pulling latest cli changes + npm install + run compile, etc...
alias flpub='fell clone && fell branch && fell status && fell sync && fl publish --slack'

acommit() {
  git commit -am "$1"
}

mcommit() {
  git commit -m "$1"
}

new() {
  tmux new-window -n "$1"
}

vims() {
  if [ -f Session.vim ]; then
    nvim -S Session.vim
  else
    nvim .
  fi
}

sid() {
  UUID=$(/usr/local/bin/uuid | perl -pe "s/\s//g" | perl -pe "s/-.*//");
  printf $UUID | pbcopy;
  printf "\n$UUID (copied to clipboard)\n\n";
}

ssid() {
  UUID=$(/usr/local/bin/uuid | perl -pe "s/\s//g" | perl -pe "s/-.*//");
  printf $UUID
}

uuid() {
  UUID=$(/usr/local/bin/uuid | perl -pe "s/\s//g");
  printf $UUID | pbcopy;
  printf "\n$UUID (copied to clipboard)\n\n";
}

# flp aliases
alias fl="/Users/jared/mfl/node_modules/.bin/ts-node \
  --project /Users/jared/mfl/apps/cli/tsconfig.json \
  /Users/jared/mfl/apps/cli/src/app.ts ${@}"
alias fell="/Users/jared/mfl/node_modules/.bin/ts-node \
  --project /Users/jared/mfl/apps/fell/tsconfig.json \
  /Users/jared/mfl/apps/fell/src/app.ts ${@}"

# misc aliases
alias cat=bat
alias issue="gh issue create --repo gertrude-app/project"
alias vim="nvim"
alias vi="/usr/bin/vim"
alias ksh="kitty +kitten ssh"
alias st='~/jaredh159/Swiftest/.build/debug/Swiftest'
alias lnhelp='cat ~/.lnhelp'
alias taghelp='cat ~/.taghelp'
alias run='npm run "$@"'
alias diffall="git difftool HEAD"
alias diff="git diff -- . ':(exclude)package-lock.json' ':(exclude)ios/FriendsLibrary.xcodeproj/project.pbxproj'"
alias giff="git add . ; github ."
alias stignore="echo .DS_Store >> .gitignore && echo \"*.swp\" >> .gitignore && echo node_modules/ >> .gitignore && echo .env >> .gitignore"
alias s="git s"
alias l="git l"
alias cowpath="echo $PATH | perl -pe 's/:/\n/g' | cowsay"
alias back="cd -"
alias ndate="node -e \"process.stdout.write(new Date().toISOString())\" | pbcopy"
alias grep="rg"
alias tailpg="tail -f /opt/homebrew/var/log/postgresql@17.log"
alias tree='tree -I "node_modules|target|.git|.build|.spm"'
alias j='/Users/jared/playground/lgit/target/debug/lgit "$@"'
alias jsondiff='pdiffjson --sort-arrays'

# bun completions
[ -s "/Users/jared/.bun/_bun" ] && source "/Users/jared/.bun/_bun"

# bun
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# pnpm
export PNPM_HOME="/Users/jared/Library/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
# pnpm end

. "$HOME/.local/bin/env"

