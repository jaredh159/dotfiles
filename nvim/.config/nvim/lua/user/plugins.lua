local fn = vim.fn

-- install lazy.nvim if not installed
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", -- latest stable release
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

-- set space as leader
-- need to set leader before loading plugins, per lazy docs
vim.g.mapleader = " "
vim.g.maplocalleader = " "

require("lazy").setup({

  -- lots of plugins rely on these two (i think)
  "nvim-lua/popup.nvim",
  "nvim-lua/plenary.nvim",

  -- telescope
  "nvim-telescope/telescope.nvim",
  "nvim-telescope/telescope-ui-select.nvim",

  -- lightbulbs for code actions
  {
    "kosayoda/nvim-lightbulb",
    dependencies = "antoinemadec/FixCursorHold.nvim",
  },

  -- current colorscheme
  "folke/tokyonight.nvim",

  -- completion
  "hrsh7th/nvim-cmp",
  "hrsh7th/cmp-buffer", -- buffer completions
  "hrsh7th/cmp-path", -- path completions
  "hrsh7th/cmp-cmdline", -- path completions
  "hrsh7th/cmp-nvim-lsp",
  "hrsh7th/cmp-nvim-lua",
  "L3MON4D3/LuaSnip", -- snippet engine (required for completions)
  "saadparwaiz1/cmp_luasnip", -- snippet completions

  -- LSP
  "neovim/nvim-lspconfig",
  "williamboman/mason.nvim",
  "williamboman/mason-lspconfig.nvim",
  "jose-elias-alvarez/null-ls.nvim",

  -- for closing buffers
  "Asheq/close-buffers.vim",

  -- swift
  "vim-syntastic/syntastic",
  "keith/swift",

  -- copilot
  "github/copilot.vim",

  -- commenting out lines/chunks
  "tpope/vim-commentary",

  -- jsx commenting
  "JoosepAlviste/nvim-ts-context-commentstring",

  -- statusline
  "nvim-lualine/lualine.nvim",

  -- autopairs
  "windwp/nvim-autopairs",

  -- nvim-tree
  {
    "nvim-tree/nvim-tree.lua",
    dependencies = { "nvim-tree/nvim-web-devicons" }, -- for file icons
    -- try updating again later, on nov 6, had trouble with duplicating folders
    commit = "6ca6f99e7689c68679e8f0a58b421545ff52931f",
  },

  -- syntax highlighting for gql fragments in .tsx
  "jparise/vim-graphql",

  -- highlights/trims trailing whitespace
  "ntpeters/vim-better-whitespace",

  -- automatically make sessions
  "tpope/vim-obsession",

  -- git indicators in gutter, and more git stuff
  "lewis6991/gitsigns.nvim",

  -- treesiter
  { "nvim-treesitter/nvim-treesitter", build = ":TSUpdate" },

  -- surround
  "tpope/vim-surround",

  -- toggleterm
  "akinsho/toggleterm.nvim",

  -- just
  "NoahTheDuke/vim-just",
})
