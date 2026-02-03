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

-- Disable dimming of inactive/cfg-disabled code from rust-analyzer semantic tokens
vim.api.nvim_set_hl(0, "@lsp.mod.inactive", {})
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

-- Auto-reload files changed by external processes (like Claude Code)
vim.o.autoread = true
vim.api.nvim_create_autocmd({ "FocusGained", "BufEnter", "CursorHold", "CursorHoldI" }, {
  group = vim.api.nvim_create_augroup("auto-reload", { clear = true }),
  command = "checktime",
})

-- Auto-close old buffers to keep the buffer list manageable
local max_buffers = 10
vim.api.nvim_create_autocmd("BufEnter", {
  group = vim.api.nvim_create_augroup("auto-close-old-buffers", { clear = true }),
  callback = function()
    -- Skip during session restore (vim-obsession sets SessionLoad)
    if vim.g.SessionLoad then return end

    local bufs = vim.fn.getbufinfo({ buflisted = 1 })
    if #bufs <= max_buffers then return end

    local visible = {}
    for _, win in ipairs(vim.api.nvim_list_wins()) do
      visible[vim.api.nvim_win_get_buf(win)] = true
    end

    local candidates = {}
    for _, buf in ipairs(bufs) do
      if not visible[buf.bufnr]
        and not vim.bo[buf.bufnr].modified
        and vim.bo[buf.bufnr].buftype == "" then
        table.insert(candidates, buf)
      end
    end

    table.sort(candidates, function(a, b)
      return (a.lastused or 0) < (b.lastused or 0)
    end)

    local to_close = #bufs - max_buffers
    for i = 1, math.min(to_close, #candidates) do
      vim.api.nvim_buf_delete(candidates[i].bufnr, {})
    end
  end,
})
