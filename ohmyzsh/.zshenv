# for vim fzf preview highlighting
BAT_THEME='Visual Studio Dark+'
COLORTERM="truecolor"

export GIT_EDITOR=nvim
export EDITOR=nvim

# try to prevent homebrew from randomly breaking everything
export HOMEBREW_NO_AUTO_UPDATE=1
export HOMEBREW_NO_INSTALL_CLEANUP=1

# keep on latest npm, no matter what node version is used
export N_PRESERVE_NPM=1

# flp stuff
export PUPPETEER_PRODUCT=firefox

# pnpm
export PNPM_HOME="$HOME/Library/pnpm"

# android (react-native)
export ANDROID_HOME=$HOME/Library/Android/sdk

# swift/gertrude
export TASK_MEGA_YIELD_COUNT=100

# clear out the path, start brand new
PATH=""

path+=$PNPM_HOME
# path+=~/.nvim-0.10.3/nvim-macos-arm64/bin # neovim 0.10.3
path+=~/.nvim-0.11.3/nvim-macos-arm64/bin # neovim 0.11.3
path+=~/.zig-0.15.0
path+=/opt/homebrew/opt/openjdk@11/bin # java 11, react native (old: 1.8)
path+=~/.rbenv/shims # ruby version manager, for react native
export PATH="$HOME/.jenv/bin:$PATH"
path+=~/.local/scripts
path+=/usr/local/bin
path+=/usr/.local/bin # for haskell stack
path+=$HOME/.ghcup/bin
path+=/usr/local/sbin
path+=/usr/bin
path+=/usr/sbin
path+=/bin
path+=/sbin
path+=/opt/homebrew/bin
path+=/opt/homebrew/sbin
path+=/Applications/Ghostty.app/Contents/MacOS
path+=/opt/homebrew/opt/postgresql@17/bin
path+=~/.npm-global/bin
path+=/Applications/kitty.app/Contents/MacOS
path+=$ANDROID_HOME/emulator
path+=$ANDROID_HOME/platform-tools
path+=~/.lmstudio/bin

export PATH

# haskell
[ -f "/Users/jared/.ghcup/env" ] && . "/Users/jared/.ghcup/env"
