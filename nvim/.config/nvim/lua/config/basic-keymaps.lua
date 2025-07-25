-- Swap ; and :
vim.keymap.set("n", ";", ":")
vim.keymap.set("n", ":", ";")
vim.keymap.set("v", ";", ":")
vim.keymap.set("v", ":", ";")

vim.keymap.set("n", "<C-j>", "<cmd>silent !tmux split-window -p 33<CR>", { desc = "Open terminal" })

vim.keymap.set("n", "<leader>ss", ":Obsession Session.vim<CR>", { desc = "[S]tart [S]ession" })

-- nvim-tree
vim.keymap.set("n", "<C-b>", ":NvimTreeToggle<CR>", { desc = "Toggle nvim-tree" })
vim.keymap.set("n", "<leader>sf", ":NvimTreeFindFile<CR>", { desc = "Find file in nvim-tree" })

-- custom save stuff
vim.keymap.set("n", "<leader>wa", ':silent! wa! | echo "Wrote all writable buffers"<CR>', {
  silent = true,
  desc = "Write all writable",
})
vim.keymap.set("n", "<leader>xx", ':silent! wa! | echo "Wrote all writable buffers" | qa!<CR>', {
  silent = true,
  desc = "Write all writable buffers then quit",
})
vim.keymap.set("n", "<C-s>", ":w<CR>", { desc = "Save current file" })

-- copy to system clipboard
vim.keymap.set("v", "<leader>y", '"+y', { desc = "Copy to system clipboard" })
vim.keymap.set("x", "<leader>y", '"+y', { desc = "Copy to system clipboard" })
vim.keymap.set("n", "<leader>Y", '"+yg_', { desc = "Copy to end of line to system clipboard" })
vim.keymap.set("n", "<leader>y", '"+y', { desc = "Copy to system clipboard" })

-- paste from system clipboard
vim.keymap.set("n", "<leader>p", '"+p', { desc = "Paste from system clipboard after cursor" })
vim.keymap.set("n", "<leader>P", '"+P', { desc = "Paste from system clipboard before cursor" })
vim.keymap.set("v", "<leader>p", '"+p', { desc = "Paste from system clipboard" })
vim.keymap.set("v", "<leader>P", '"+P', { desc = "Paste from system clipboard" })

-- telescope keymaps
vim.keymap.set("n", "<C-p>", "<cmd>Telescope git_files<CR>", { desc = "Find git files" })
vim.keymap.set(
  "n",
  "<leader>pf",
  "<cmd>Telescope find_files find_command=rg,--hidden,--files<CR>",
  { desc = "Find files (including hidden)" }
)
vim.keymap.set("n", "<leader>ff", "<cmd>Telescope live_grep<CR>", { desc = "Live grep search" })

-- C-\ to open a vertical split
vim.keymap.set("n", "<C-\\>", "<cmd>vsplit<CR>", { desc = "Vertical split" })

-- tmux sessionizer
vim.keymap.set("n", "<C-f>", "<cmd>silent !tmux neww tmux-sessionizer.sh<CR>", { desc = "Open tmux sessionizer" })

-- custom homegown command palette goodness
vim.keymap.set("n", "<leader>cp", ":CommandPalette<CR>", { desc = "Toggle custom command palette" })

