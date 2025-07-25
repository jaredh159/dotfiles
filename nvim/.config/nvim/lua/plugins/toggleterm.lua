return { -- floating terminal
  "akinsho/toggleterm.nvim",
  version = "*",
  opts = {
    open_mapping = [[<c-t>]],
    direction = "float",
    float_opts = {
      border = "curved",
      width = 150,
      height = 30,
    },
  },
}