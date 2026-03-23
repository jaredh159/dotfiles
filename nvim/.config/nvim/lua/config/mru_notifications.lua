local M = {}

local drop_file = vim.fn.expand("$HOME/.tmux-mru-dropped")

vim.api.nvim_set_hl(0, "MruOverflowMsg", { fg = "#ffffff", bg = "#c73c3c", bold = true })

local function show_drop_notice()
  if vim.fn.filereadable(drop_file) == 0 then
    return
  end

  local lines = vim.fn.readfile(drop_file)
  pcall(vim.fn.delete, drop_file)

  local dropped_path = lines[1]
  if not dropped_path or dropped_path == "" then
    return
  end

  vim.api.nvim_echo({
    { "Removed from MRU due to stack size: ", "MruOverflowMsg" },
    { vim.fn.fnamemodify(dropped_path, ":~"), "MruOverflowMsg" },
  }, true, {})
end

vim.api.nvim_create_autocmd({ "VimEnter", "FocusGained", "BufEnter" }, {
  group = vim.api.nvim_create_augroup("mru-overflow-notifications", { clear = true }),
  callback = show_drop_notice,
})

return M
