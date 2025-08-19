-- copilot
vim.g.copilot_no_tab_map = true
vim.g.copilot_assume_mapped = true
vim.g.copilot_node_command = "/usr/local/n/versions/node/23.10.0/bin/node"
vim.g.copilot_filetypes = { ["TelescopePrompt"] = false }
vim.keymap.set("i", "<C-l>", 'copilot#Accept("\\<CR>")', { silent = true, expr = true, replace_keycodes = false })
vim.keymap.set("i", "<C-.>", "copilot#Next()", { expr = true })
