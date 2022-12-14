local fn = vim.fn

-- Automatically install packer
local install_path = fn.stdpath("data") .. "/site/pack/packer/start/packer.nvim"
if fn.empty(fn.glob(install_path)) > 0 then
  PACKER_BOOTSTRAP = fn.system({
    "git",
    "clone",
    "--depth",
    "1",
    "https://github.com/wbthomason/packer.nvim",
    install_path,
  })
  print("Installing packer close and reopen Neovim...")
  vim.cmd([[packadd packer.nvim]])
end

-- Autocommand that reloads neovim whenever you save the plugins.lua file
vim.cmd([[
  augroup packer_user_config
    autocmd!
    autocmd BufWritePost plugins.lua source <afile> | PackerSync
  augroup end
]])

-- Use a protected call so we don't error out on first use
local status_ok, packer = pcall(require, "packer")
if not status_ok then
  print("couldn't require packer")
  return
end

-- Have packer use a popup window
packer.init({
  display = {
    open_fn = function()
      return require("packer.util").float({ border = "rounded" })
    end,
  },
})

return packer.startup(function(use)
  -- lets packer manage itself
  use("wbthomason/packer.nvim")

  -- lots of plugins rely on these two (i think)
  use("nvim-lua/popup.nvim")
  use("nvim-lua/plenary.nvim")

  -- telescope
  use("nvim-telescope/telescope.nvim")
  use("nvim-telescope/telescope-ui-select.nvim")

  -- lightbulbs for code actions
  use({
    "kosayoda/nvim-lightbulb",
    requires = "antoinemadec/FixCursorHold.nvim",
  })

  -- current colorscheme
  use("folke/tokyonight.nvim")

  -- completion
  use("hrsh7th/nvim-cmp")
  use("hrsh7th/cmp-buffer") -- buffer completions
  use("hrsh7th/cmp-path") -- path completions
  use("hrsh7th/cmp-cmdline") -- path completions
  use("hrsh7th/cmp-nvim-lsp")
  use("hrsh7th/cmp-nvim-lua")
  use("L3MON4D3/LuaSnip") -- snippet engine (required for completions)
  use("saadparwaiz1/cmp_luasnip") -- snippet completions

  -- LSP
  use("neovim/nvim-lspconfig")
  use("williamboman/nvim-lsp-installer")
  use("jose-elias-alvarez/null-ls.nvim")

  -- prettier (do i need this? isn't null-ls handling it?)
  -- use("prettier/vim-prettier")

  -- for closing buffers
  use("Asheq/close-buffers.vim")

  -- swift
  use("vim-syntastic/syntastic")
  use("keith/swift")

  -- copilot
  use("github/copilot.vim")

  -- commenting out lines/chunks
  use("tpope/vim-commentary")

  -- jsx commenting
  use("JoosepAlviste/nvim-ts-context-commentstring")

  -- statusline
  use("nvim-lualine/lualine.nvim")

  -- autopairs
  use("windwp/nvim-autopairs")

  -- nvim-tree
  use({
    "nvim-tree/nvim-tree.lua",
    requires = { "nvim-tree/nvim-web-devicons" }, -- for file icons
    -- try updating again later, on nov 6, had trouble with duplicating folders
    commit = "6ca6f99e7689c68679e8f0a58b421545ff52931f",
  })

  -- syntax highlighting for gql fragments in .tsx
  use("jparise/vim-graphql")

  -- highlights/trims trailing whitespace
  use("ntpeters/vim-better-whitespace")

  -- automatically make sessions
  use("tpope/vim-obsession")

  -- git indicators in gutter, and more git stuff
  use("lewis6991/gitsigns.nvim")

  -- treesiter
  use({ "nvim-treesitter/nvim-treesitter", run = ":TSUpdate" })

  -- surround
  use("tpope/vim-surround")

  -- toggleterm
  use("akinsho/toggleterm.nvim")

  -- automatically set up configuration after cloning packer.nvim
  if PACKER_BOOTSTRAP then
    require("packer").sync()
  end
end)
