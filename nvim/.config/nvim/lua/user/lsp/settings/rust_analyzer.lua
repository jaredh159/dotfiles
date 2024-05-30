return {
  settings = {
    ["rust-analyzer"] = {
      hint = { enable = true },
      checkOnSave = { command = "clippy" },
    },
  },
}
