local M = {}

function M.errors_to_quickfix()
  local diagnostics = vim.diagnostic.get(nil, { severity = vim.diagnostic.severity.ERROR })
  local qf_list = {}
  for _, d in ipairs(diagnostics) do
    table.insert(qf_list, {
      bufnr = d.bufnr,
      lnum = d.lnum + 1,
      col = d.col + 1,
      text = d.message,
      type = "E",
    })
  end
  if #qf_list == 0 then
    vim.notify("No LSP errors found", vim.log.levels.INFO)
    return
  end
  vim.fn.setqflist(qf_list, "r")
  vim.cmd("cfirst")
end

return M

