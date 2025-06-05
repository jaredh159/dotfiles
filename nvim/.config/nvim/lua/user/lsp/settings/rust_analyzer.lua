return {
  settings = {
    ["rust-analyzer"] = {
      hint = { enable = true },
      checkOnSave = { command = "clippy" },
      cargo = { features = "all" },
      diagnostics = { disabled = { "macro-error" } },
    },
  },
}
