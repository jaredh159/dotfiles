return { -- colorscheme, see others with: `:Telescope colorscheme`.
  "folke/tokyonight.nvim",
  priority = 1000,
  config = function()
    vim.cmd.colorscheme("tokyonight-storm")
  end,
}