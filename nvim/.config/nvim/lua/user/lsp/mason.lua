require("mason").setup({
  ui = { icons = { package_installed = "✓" } },
})

require("mason-lspconfig").setup({
  ensure_installed = {
    "jsonls",
    "zls",
    "lua_ls",
    "tsserver",
    "rust_analyzer",
    "hls",
  },
})

local lspconfig = require("lspconfig")

local opts = {
  on_attach = require("user.lsp.handlers").on_attach,
  capabilities = require("user.lsp.handlers").capabilities,
}

local function settings(lsp)
  return vim.tbl_deep_extend("force", require("user.lsp.settings." .. lsp), opts)
end

lspconfig.hls.setup(opts)
lspconfig.zls.setup(opts)
lspconfig.astro.setup(opts)
lspconfig.sourcekit.setup(settings("sourcekit"))
lspconfig.tsserver.setup(settings("tsserver"))
lspconfig.jsonls.setup(settings("jsonls"))
lspconfig.lua_ls.setup(settings("lua_ls"))
lspconfig.rust_analyzer.setup(settings("rust_analyzer"))
