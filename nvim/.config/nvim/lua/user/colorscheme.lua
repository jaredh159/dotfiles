vim.cmd("colorscheme default")

local colorscheme = "tokyonight-storm"

local status_ok, _ = pcall(vim.cmd, "colorscheme " .. colorscheme)
if not status_ok then
  vim.notify("Failed to load colorscheme: `" .. colorscheme .. "`")
  return
end
