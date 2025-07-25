-- Don't show the mode, since it's already in the status line
vim.o.showmode = false

-- tab stuff
vim.opt.tabstop = 2
vim.opt.shiftwidth = 2
vim.opt.softtabstop = 2
vim.opt.expandtab = true
vim.opt.autoindent = true
vim.opt.smarttab = true

-- rust and swift need special help to stick to my 2 space weirdness
vim.api.nvim_create_autocmd("FileType", {
  pattern = { "swift", "rust" },
  callback = function()
    vim.bo.shiftwidth = 2
    vim.bo.tabstop = 2
    vim.bo.expandtab = true
    vim.bo.softtabstop = 2
  end,
})

vim.opt.termguicolors = true
vim.opt.swapfile = false
vim.g.have_nerd_font = true
vim.o.mouse = "a"
vim.o.number = true
vim.o.breakindent = true -- wrapped lines align w/ indent
vim.o.undofile = true -- save undo history
vim.o.signcolumn = "yes" -- always show sign col
vim.o.updatetime = 250 -- decrease update time
vim.o.scrolloff = 12
vim.o.sidescrolloff = 8
vim.o.cursorline = true -- show which line cursor is on

-- fewer, shorter messages
vim.o.shortmess = "ac"

-- make search/replace global by default
vim.o.gdefault = true

-- Case-insensitive searching UNLESS \C or one or more capital letters in the search term
vim.o.ignorecase = true
vim.o.smartcase = true

-- Decrease mapped sequence wait time
vim.o.timeoutlen = 300

-- Configure how new splits should be opened
vim.o.splitright = true
vim.o.splitbelow = true

-- Sets how neovim will display certain whitespace characters in the editor.
--  See `:help 'list'`
--  and `:help 'listchars'`
--
--  Notice listchars is set using `vim.opt` instead of `vim.o`.
--  It is very similar to `vim.o` but offers an interface for conveniently interacting with tables.
--   See `:help lua-options`
--   and `:help lua-options-guide`
vim.o.list = true
vim.opt.listchars = { tab = "» ", trail = "·", nbsp = "␣" }

-- Preview substitutions live, as you type!
vim.o.inccommand = "split"

-- if performing an operation that would fail due to unsaved changes in the buffer (like `:q`),
-- instead raise a dialog asking if you wish to save the current file(s)
-- See `:help 'confirm'`
vim.o.confirm = true
