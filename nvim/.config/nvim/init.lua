-- disable netrw very early (for nvim-tree)
vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1

-- Set <space> as the leader key, must go before plugins
vim.g.mapleader = " "
vim.g.maplocalleader = " "

require("config.options")
require("config.basic-keymaps")

-- Highlight when yanking (copying) text
vim.api.nvim_create_autocmd("TextYankPost", {
  desc = "Highlight when yanking (copying) text",
  group = vim.api.nvim_create_augroup("kickstart-highlight-yank", { clear = true }),
  callback = function()
    vim.hl.on_yank()
  end,
})

-- [[ Install `lazy.nvim` plugin manager ]]
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not (vim.uv or vim.loop).fs_stat(lazypath) then
  local lazyrepo = "https://github.com/folke/lazy.nvim.git"
  local out = vim.fn.system({ "git", "clone", "--filter=blob:none", "--branch=stable", lazyrepo, lazypath })
  if vim.v.shell_error ~= 0 then
    error("Error cloning lazy.nvim:\n" .. out)
  end
end

---@type vim.Option
local rtp = vim.opt.rtp
rtp:prepend(lazypath)

-- NB: plugins
-- `:Lazy` to check status, `:Lazy update` to update plugins
require("lazy").setup({
  "keith/swift",
  "nvim-lualine/lualine.nvim",
  "tpope/vim-obsession",
  "github/copilot.vim",
  require("plugins.lsp"),
  require("plugins.toggleterm"),
  require("plugins.telescope"),
  require("plugins.gitsigns"),
  require("plugins.conform-autoformat"),
  require("plugins.nvim-tree"),
  require("plugins.which-key"),
  require("plugins.autocomplete"),
  require("plugins.treesitter"),
  require("plugins.tokyonight"),
  require("plugins.todo-comments"),
}, {
  -- empty icons = will use nerd font
  ui = { icons = {} },
})

require("config.copilot")
require("config.swift")
require("plugins.lualine")
require("plugins.command-palette")
--
-- diagnostic quickfix custom plugin
vim.keymap.set("n", "<leader>tt", function()
  require("plugins.diagnostic-quickfix").errors_to_quickfix()
end, { desc = "LSP errors to quickfix" })
