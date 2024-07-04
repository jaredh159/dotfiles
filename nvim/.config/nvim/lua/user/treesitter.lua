local status_ok, treesitter = pcall(require, "nvim-treesitter")
if not status_ok then
  return
end

local status_ok, configs = pcall(require, "nvim-treesitter.configs")
if not status_ok then
  return
end

configs.setup({
  ensure_installed = { -- or "all"
    "swift",
    "typescript",
    "tsx",
    "javascript",
    "lua",
    "make",
    "astro",
    "markdown",
    "markdown_inline",
    "graphql",
    "haskell",
    "bash",
    "cpp",
  },
  ignore_install = {},
  sync_install = false,
  highlight = {
    enable = true,
    disable = {},
  },
  autopairs = {
    enable = true,
  },
  indent = {
    enable = true,
    disable = {},
  },
})
