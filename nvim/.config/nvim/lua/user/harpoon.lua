local opts = { noremap = true, silent = true }
local keymap = vim.api.nvim_set_keymap

require("harpoon").setup({
  menu = {
    width = math.min(vim.api.nvim_win_get_width(0) - 16, 85),
  },
})

require("hurl").setup()

-- "Harpoon Add"
keymap("n", "<leader>ha", '<cmd>lua require("harpoon.mark").add_file()<CR>', opts)

-- "Harpoon Find"
keymap("n", "<leader>hf", '<cmd>lua require("harpoon.ui").toggle_quick_menu()<CR>', opts)

-- telescope harpoon marks
keymap("n", "<leader><leader>h", "<cmd>Telescope harpoon marks<CR>", opts)

-- jump to files 1-4, without moving fingers
keymap("n", "<leader><leader>j", '<cmd>lua require("harpoon.ui").nav_file(1)<CR>', opts)
keymap("n", "<leader><leader>k", '<cmd>lua require("harpoon.ui").nav_file(2)<CR>', opts)
keymap("n", "<leader><leader>l", '<cmd>lua require("harpoon.ui").nav_file(3)<CR>', opts)
keymap("n", "<leader><leader>;", '<cmd>lua require("harpoon.ui").nav_file(4)<CR>', opts)
-- files 5-8 are up one row
keymap("n", "<leader><leader>u", '<cmd>lua require("harpoon.ui").nav_file(5)<CR>', opts)
keymap("n", "<leader><leader>i", '<cmd>lua require("harpoon.ui").nav_file(6)<CR>', opts)
keymap("n", "<leader><leader>o", '<cmd>lua require("harpoon.ui").nav_file(7)<CR>', opts)
keymap("n", "<leader><leader>p", '<cmd>lua require("harpoon.ui").nav_file(8)<CR>', opts)
