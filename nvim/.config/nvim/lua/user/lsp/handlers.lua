local M = {}

M.setup = function()
  local signs = {
    { name = "DiagnosticSignError", text = "" }, -- 
    { name = "DiagnosticSignWarn", text = "" }, -- 
    { name = "DiagnosticSignHint", text = "" }, -- 
    { name = "DiagnosticSignInfo", text = "" }, -- 
  }

  for _, sign in ipairs(signs) do
    vim.fn.sign_define(sign.name, { texthl = sign.name, text = sign.text, numhl = "" })
  end

  local config = {
    -- virtual_text -- the right floaters...
    virtual_text = {
      -- use :help vim.diagnostic.config for info on configuration
      severity = { min = vim.diagnostic.severity.ERROR },
    },
    -- show signs
    signs = {
      active = signs,
    },
    update_in_insert = true,
    underline = true,
    severity_sort = true,
    float = {
      focusable = false,
      style = "minimal",
      source = "always",
      header = "",
      prefix = "",
    },
  }

  vim.diagnostic.config(config)

  vim.lsp.handlers["textDocument/hover"] = vim.lsp.with(vim.lsp.handlers.hover, {})

  vim.lsp.handlers["textDocument/signatureHelp"] = vim.lsp.with(vim.lsp.handlers.signature_help, {})
end

local function lsp_highlight_document(client)
  -- Set autocommands conditional on server_capabilities
  if client.server_capabilities.documentHighlight then
    vim.api.nvim_exec2(
      [[
      augroup lsp_document_highlight
        autocmd! * <buffer>
        autocmd CursorHold <buffer> silent! lua vim.lsp.buf.document_highlight()
        autocmd CursorMoved <buffer> silent! lua vim.lsp.buf.clear_references()
      augroup END
    ]],
      { output = false }
    )
  end
end

local function lsp_keymaps(bufnr)
  local opts = { noremap = true, silent = true }
  local keymap = vim.api.nvim_buf_set_keymap

  -- keymap(bufnr, 'n', '<space>q', "<cmd>vim.diagnostic.setloclist()<CR>", opts)
  -- keymap(bufnr, "n", "lol", "<cmd>lua vim.lsp.buf.signature_help()<CR>", opts)
  -- keymap(bufnr, "n", "gl", '<cmd>lua vim.lsp.diagnostic.show_line_diagnostics()<CR>', opts)
  -- keymap(bufnr, "n", "<leader>q", "<cmd>lua vim.diagnostic.setloclist()<CR>", opts)

  keymap(bufnr, "n", "<leader>rn", "<cmd>lua vim.lsp.buf.rename()<CR>", opts)
  keymap(bufnr, "n", "gD", "<cmd>lua vim.lsp.buf.declaration()<CR>", opts)
  keymap(bufnr, "n", "gd", "<cmd>lua vim.lsp.buf.definition()<CR>", opts)
  keymap(bufnr, "n", "gh", "<cmd>lua vim.lsp.buf.hover()<CR>", opts)
  keymap(bufnr, "n", "gi", "<cmd>lua vim.lsp.buf.implementation()<CR>", opts)
  keymap(bufnr, "n", "gr", "<cmd>lua vim.lsp.buf.references()<CR>", opts)
  keymap(bufnr, "n", "<space>e", "<cmd>lua vim.diagnostic.open_float()<CR>", opts)
  keymap(bufnr, "n", "[d", "<cmd>lua vim.diagnostic.goto_prev()<CR>", opts)
  keymap(bufnr, "n", "]d", "<cmd>lua vim.diagnostic.goto_next()<CR>", opts)

  vim.cmd([[ command! Format execute 'lua vim.lsp.buf.format()' ]])
end

M.on_attach = function(client, bufnr)
  lsp_keymaps(bufnr)
  lsp_highlight_document(client)
end

local capabilities = vim.lsp.protocol.make_client_capabilities()

local status_ok, cmp_nvim_lsp = pcall(require, "cmp_nvim_lsp")
if not status_ok then
  return
end

M.capabilities = cmp_nvim_lsp.default_capabilities(capabilities)

return M
