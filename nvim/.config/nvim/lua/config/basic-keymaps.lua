-- Swap ; and :
vim.keymap.set("n", ";", ":")
vim.keymap.set("n", ":", ";")
vim.keymap.set("v", ";", ":")
vim.keymap.set("v", ":", ";")

-- split bottom window 33%
vim.keymap.set("n", "<C-j>", "<cmd>silent !tmux split-window -p 33<CR>", { desc = "Open terminal" })
-- C-\ to open a vertical split
vim.keymap.set("n", "<C-\\>", "<cmd>vsplit<CR>", { desc = "Vertical split" })

-- start a session
vim.keymap.set("n", "<leader>ss", ":Obsession Session.vim<CR>", { desc = "[S]tart [S]ession" })

-- nvim-tree
vim.keymap.set("n", "<C-b>", ":NvimTreeToggle<CR>", { desc = "Toggle nvim-tree" })
vim.keymap.set("n", "<leader>sf", ":NvimTreeFindFile<CR>", { desc = "Find file in nvim-tree" })

-- custom save stuff
vim.keymap.set("n", "<C-s>", ":w<CR>", { desc = "Save current file" })
vim.keymap.set("n", "<leader>wa", ':silent! wa! | echo "Wrote all writable buffers"<CR>', {
  silent = true,
  desc = "Write all writable",
})
vim.keymap.set("n", "<leader>xx", ':silent! wa! | echo "Wrote all writable buffers" | qa!<CR>', {
  silent = true,
  desc = "Write all writable buffers then quit",
})
vim.keymap.set("n", "<C-q>", ":Bdelete hidden<CR>", { desc = "Delete unmodified hidden buffers" })
-- close a buffer without killing window split
vim.keymap.set("n", "<leader>dd", ":b# | bd#<CR>", { desc = "Delete current buffer in place" })

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
  "<cmd>Telescope find_files find_command=rg,--hidden,--files,-g,!.git/<CR>",
  { desc = "Find files (including hidden)" }
)
vim.keymap.set("n", "<leader>ff", "<cmd>Telescope live_grep<CR>", { desc = "Live grep search" })
vim.keymap.set("n", "<leader>hh", function()
  require("telescope.builtin").find_files({
    prompt_title = "Hidden Project Files",
    find_command = {
      "rg",
      "--files",
      "--hidden",
      "-g", "**/claude.task.md",
      "-g", "**/claude.ledger.*.md",
      "-g", "**/claude.report.*.md",
      "-g", "**/task.scratch.md",
      "-g", "**/.env*",
      "-g", "**/Local.xcconfig",
    },
  })
end, { desc = "Find hidden project files (env, claude.*)" })

-- tmux sessionizer
vim.keymap.set("n", "<C-f>", "<cmd>silent !tmux neww tmux-sessionizer.sh<CR>", { desc = "Open tmux sessionizer" })

-- show tmux MRU stack in telescope, select to switch
vim.keymap.set("n", "<leader>mm", function()
  local lines = vim.fn.readfile(vim.fn.expand("~/.tmux-mru"))
  if #lines == 0 then
    vim.notify("MRU stack is empty", vim.log.levels.WARN)
    return
  end
  local pickers = require("telescope.pickers")
  local finders = require("telescope.finders")
  local conf = require("telescope.config").values
  local actions = require("telescope.actions")
  local action_state = require("telescope.actions.state")
  pickers
    .new(require("telescope.themes").get_dropdown({ previewer = false }), {
      prompt_title = "Tmux MRU Sessions",
      finder = finders.new_table({ results = lines }),
      sorter = conf.generic_sorter({}),
      attach_mappings = function(prompt_bufnr)
        actions.select_default:replace(function()
          local selection = action_state.get_selected_entry()
          actions.close(prompt_bufnr)
          if selection then
            vim.fn.system("tmux switch-client -t " .. vim.fn.shellescape(selection[1]))
          end
        end)
        return true
      end,
    })
    :find()
end, { desc = "Tmux MRU sessions" })

-- custom homegown command palette goodness
vim.keymap.set("n", "<leader>cp", ":CommandPalette<CR>", { desc = "Toggle custom command palette" })

-- change next word under cursor
vim.keymap.set("n", "cn", "*``cgn")
--
-- Clear highlights on search when pressing <Esc> in normal mode
vim.keymap.set("n", "<Esc>", "<cmd>nohlsearch<CR>")

-- Diagnostic keymaps
vim.keymap.set("n", "<leader>q", vim.diagnostic.setloclist, { desc = "Open diagnostic [Q]uickfix list" })

--  See `:help wincmd` for a list of all window commands
vim.keymap.set("n", "<C-h>", "<C-w><C-h>", { desc = "Move focus to the left window" })
vim.keymap.set("n", "<C-l>", "<C-w><C-l>", { desc = "Move focus to the right window" })

-- git add all files
vim.keymap.set("n", "<leader>gaa", ":silent! !git add .<CR><bar>:echo 'git add .'<CR>", {
  desc = "Git add all files",
})

-- xcode run/stop
vim.keymap.set("n", "<leader>33", ":silent !xcode-build<CR>", { desc = "Xcode build" })
vim.keymap.set("n", "<leader>88", ":silent !xcode-stop<CR>", { desc = "Xcode stop" })

-- org repo
vim.keymap.set("n", "<leader>sp", ":e ~/jaredh159/org/scratch.md<CR>", {
  desc = "Open scratchpad",
})
vim.keymap.set("n", "<leader>id", ":e ~/jaredh159/org/ideas.md<CR>", {
  desc = "Open ideas file",
})
vim.keymap.set("n", "<leader>tt", ":e ~/jaredh159/org/today.md<CR>", {
  desc = "Open today's todos",
})

-- scratch eject: archive selected text and delete from buffer
vim.keymap.set("v", "<leader>se", function()
  local vstart = vim.fn.getpos("v")
  local vend = vim.fn.getpos(".")
  local line1 = math.min(vstart[2], vend[2])
  local line2 = math.max(vstart[2], vend[2])

  local lines = vim.api.nvim_buf_get_lines(0, line1 - 1, line2, false)
  local archive_path = vim.fn.expand("~/jaredh159/org/archive/ejected-scratch.md")
  local timestamp = os.date("## %Y-%m-%d %H:%M")

  -- read existing content
  local existing = ""
  local file = io.open(archive_path, "r")
  if file then
    existing = file:read("*a")
    file:close()
  end

  -- insert after `---` separator (preserving header)
  local new_entry = timestamp .. "\n\n" .. table.concat(lines, "\n") .. "\n\n"
  local separator = "---\n"
  local sep_pos = existing:find(separator, 1, true)
  local output
  if sep_pos then
    local header = existing:sub(1, sep_pos + #separator - 1)
    local rest = existing:sub(sep_pos + #separator)
    output = header .. "\n" .. new_entry .. rest
  else
    -- no separator found, just prepend
    output = new_entry .. existing
  end

  file = io.open(archive_path, "w")
  if file then
    file:write(output)
    file:close()
  end

  -- delete the lines from buffer
  vim.api.nvim_buf_set_lines(0, line1 - 1, line2, false, {})

  local esc = vim.api.nvim_replace_termcodes("<Esc>", true, false, true)
  vim.api.nvim_feedkeys(esc, "n", false)
  vim.notify("Ejected " .. #lines .. " lines to scratch archive")
end, { desc = "Eject selection to scratch archive" })

-- markdown todo abbreviation
vim.api.nvim_create_autocmd("FileType", {
  pattern = "markdown",
  callback = function()
    vim.cmd([=[iabbrev <buffer> td - [ ]]=])
  end,
})

-- code actions
vim.keymap.set("n", "<leader>aa", vim.lsp.buf.code_action, { desc = "Code action" })

-- inlinay hints
vim.keymap.set("n", "<leader>ii", function()
  vim.lsp.inlay_hint.enable(not vim.lsp.inlay_hint.is_enabled())
end, { desc = "Toggle inlay hints" })

-- replace word with new short id (like ciw but inserts a fresh uuid[:8])
-- uses feedkeys so dot repeat inserts the same ID (vim remembers the literal text, not the function)
vim.keymap.set("n", "cid", function()
  local sid = vim.fn.system("/usr/local/bin/uuid"):gsub("%s+", ""):match("^[^-]+")
  local esc = vim.api.nvim_replace_termcodes("<Esc>", true, true, true)
  vim.api.nvim_feedkeys("ciw" .. sid .. esc, "n", false)
  vim.notify("new short id: " .. sid)
end, { desc = "Change word to new short ID" })

-- quickfix enter closes window
vim.api.nvim_create_autocmd("FileType", {
  pattern = "qf",
  callback = function()
    vim.keymap.set("n", "<CR>", "<CR>:cclose<CR>", { buffer = true })
  end,
})

-- copy markdown to clipboard with line wrapping removed (for pasting into Gmail, etc.)
vim.keymap.set("v", "<leader>mc", function()
  -- Get visual selection boundaries (works while still in visual mode)
  local vstart = vim.fn.getpos("v")
  local vend = vim.fn.getpos(".")
  local line1 = math.min(vstart[2], vend[2])
  local line2 = math.max(vstart[2], vend[2])

  local lines = vim.api.nvim_buf_get_lines(0, line1 - 1, line2, false)
  local text = table.concat(lines, "\n")

  -- Format with prettier (unwrap prose) and copy to clipboard
  vim.fn.system("prettier --parser markdown --prose-wrap never | pbcopy", text)

  -- Exit visual mode and notify
  local esc = vim.api.nvim_replace_termcodes("<Esc>", true, false, true)
  vim.api.nvim_feedkeys(esc, "n", false)
  vim.notify("Markdown copied to clipboard")
end, { desc = "Copy markdown to clipboard (unwrapped)" })
