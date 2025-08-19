return {
  "nvim-tree/nvim-tree.lua",
  dependencies = { "nvim-tree/nvim-web-devicons" },
  opts = {
    view = { width = 36 },
    renderer = {
      group_empty = true,
      indent_width = 1,
      icons = { show = { git = false } },
    },
    trash = { cmd = "trash" },
    diagnostics = { enable = true },
    actions = { open_file = { window_picker = { enable = false } } },
    filters = {
      -- never show these dirs
      custom = { "^.git$", "^node_modules$", "^dist$", "^.build$" },
    },
  },
}
