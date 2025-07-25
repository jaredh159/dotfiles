return { -- Autoformat
  "stevearc/conform.nvim",
  event = { "BufWritePre" },
  cmd = { "ConformInfo" },

  config = function()
    require("conform").formatters.eslint_d = {
      append_args = {
        "--rule",
        "@typescript-eslint/no-unused-vars: warn",
        "--rule",
        "@typescript-eslint/quotes: off",
        "--rule",
        "no-only-tests/no-only-tests: off",
        "--ignore-pattern",
        "'!**/.storybook/**/*'",
        "--cache",
      },
    }
  end,

  keys = {
    {
      "<leader>f",
      function()
        require("conform").format({ async = true, lsp_format = "never" })
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
      local disable_filetypes = { c = true, cpp = true }
      if disable_filetypes[vim.bo[bufnr].filetype] then
        return nil
      else
        return {
          timeout_ms = 500,
          lsp_format = "fallback",
        }
      end
    end,
    log_level = vim.log.levels.DEBUG,
    formatters_by_ft = {
      lua = { "stylua" },
      swift = { "swiftformat" },
      rust = { "rustfmt" },
      -- not sure these are right?
      jsx = { "prettier", "eslint" },
      typescriptreact = { "prettier", "eslint_d" },
      javascript = { "prettier", "eslint_d" },
      typescript = { "prettier", "eslint_d" },
    },
  },
}
