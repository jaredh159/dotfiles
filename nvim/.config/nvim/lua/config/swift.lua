local lspconfig = require("lspconfig")
lspconfig.sourcekit.setup({
  root_dir = lspconfig.util.root_pattern("Package.swift"),
  capabilities = vim.tbl_deep_extend("force", require("blink.cmp").get_lsp_capabilities(), {
    workspace = {
      didChangeWatchedFiles = {
        dynamicRegistration = true,
      },
    },
  }),
})
