local steve_grammar = "/Users/jared/jaredh159/steve/tree-sitter-steve"

return {
  "nvim-treesitter/nvim-treesitter",
  build = ":TSUpdate",
  dependencies = {
    {
      dir = steve_grammar,
      name = "tree-sitter-steve",
      lazy = false,
    },
  },
  -- `:help nvim-treesitter`
  opts = {
    ensure_installed = {
      "bash",
      "c",
      "diff",
      "html",
      "lua",
      "luadoc",
      "markdown",
      "markdown_inline",
      "query",
      "steve",
      "vim",
      "vimdoc",
    },
    -- Autoinstall languages that are not installed
    auto_install = true,
    highlight = {
      enable = true,
    },
  },
  config = function(_, opts)
    local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
    parser_config.steve = {
      install_info = {
        url = steve_grammar,
        files = { "src/parser.c" },
      },
      filetype = "steve",
    }

    require("nvim-treesitter.configs").setup(opts)
  end,
  -- There are additional nvim-treesitter modules that you can use to interact
  -- with nvim-treesitter. You should go explore a few and see what interests you:
  --  - Incremental selection: Included, see `:help nvim-treesitter-incremental-selection-mod`
  --  - Show your current context: https://github.com/nvim-treesitter/nvim-treesitter-context
  --  - Treesitter + textobjects: https://github.com/nvim-treesitter/nvim-treesitter-textobjects
}
