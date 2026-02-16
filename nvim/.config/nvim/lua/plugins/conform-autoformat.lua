return { -- Autoformat
  "stevearc/conform.nvim",
  event = { "BufWritePre" },
  cmd = { "ConformInfo" },
  keys = {
    {
      "<leader>f",
      function()
        require("conform").format({ async = true, lsp_format = "fallback" })
      end,
      mode = "",
      desc = "[F]ormat buffer",
    },
  },
  opts = {
    notify_on_error = false,
    format_on_save = function(bufnr)
      -- Disable "format_on_save lsp_fallback" for languages that don't
      -- have a well standardized coding style. You can add additional
      -- languages here or re-enable it for the disabled ones.
      local disable_filetypes = { cpp = true }
      if disable_filetypes[vim.bo[bufnr].filetype] then
        return nil
      else
        return {
          timeout_ms = 500,
          lsp_format = "fallback",
        }
      end
    end,
    formatters_by_ft = {
      c = { "clang_format" },
      lua = { "stylua" },
      swift = { "swiftformat" },
      rust = { "rustfmt" },
      -- web formats
      html = { "prettier" },
      markdown = { "prettier" },
      mdx = { "prettier" },
      javascript = { "prettier", "eslint_d" },
      javascriptreact = { "prettier", "eslint_d" },
      typescript = { "prettier", "eslint_d" },
      typescriptreact = { "prettier", "eslint_d" },
    },
  },
}
