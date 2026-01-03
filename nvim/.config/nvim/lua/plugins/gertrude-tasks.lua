local themes = require("telescope.themes")
local pickers = require("telescope.pickers")
local finders = require("telescope.finders")
local conf = require("telescope.config").values
local actions = require("telescope.actions")
local action_state = require("telescope.actions.state")

local TASKS_DIR = vim.fn.expand("$HOME/gertie/tasks")

local function get_tasks_sorted_by_mtime()
  local tasks = {}
  local handle = vim.loop.fs_scandir(TASKS_DIR)
  if not handle then
    return tasks
  end

  while true do
    local name, type = vim.loop.fs_scandir_next(handle)
    if not name then
      break
    end
    if type == "directory" then
      local path = TASKS_DIR .. "/" .. name
      local stat = vim.loop.fs_stat(path)
      if stat then
        table.insert(tasks, {
          name = name,
          path = path,
          mtime = stat.mtime.sec,
        })
      end
    end
  end

  -- sort by mtime descending (most recent first)
  table.sort(tasks, function(a, b)
    return a.mtime > b.mtime
  end)

  return tasks
end

local function gertrude_tasks(opts)
  opts = opts or {}
  local tasks = get_tasks_sorted_by_mtime()
  local cwd = vim.fn.getcwd()

  -- filter out current task
  tasks = vim.tbl_filter(function(task)
    return task.path ~= cwd
  end, tasks)

  if #tasks == 0 then
    vim.notify("No other tasks found", vim.log.levels.WARN)
    return
  end

  pickers
    .new(opts, {
      prompt_title = "Gertrude Tasks",
      finder = finders.new_table({
        results = tasks,
        entry_maker = function(entry)
          return {
            value = entry,
            display = entry.name,
            ordinal = entry.name,
          }
        end,
      }),
      sorter = conf.generic_sorter(opts),
      attach_mappings = function(prompt_bufnr)
        actions.select_default:replace(function()
          actions.close(prompt_bufnr)
          local selection = action_state.get_selected_entry()
          local path = selection.value.path
          local session_name = selection.value.name:gsub("%.", "_")

          -- create session if it doesn't exist, then switch to it
          vim.fn.system(string.format(
            'tmux has-session -t "%s" 2>/dev/null || tmux new-session -s "%s" -c "%s" -d',
            session_name,
            session_name,
            path
          ))
          vim.fn.system(string.format('tmux switch-client -t "%s"', session_name))
        end)
        return true
      end,
    })
    :find()
end

vim.api.nvim_create_user_command("GertrudeTasks", function()
  gertrude_tasks(themes.get_dropdown({
    previewer = false,
    layout_config = {
      width = 0.6,
    },
  }))
end, { nargs = 0 })

vim.keymap.set("n", "<leader>gg", ":GertrudeTasks<CR>", { desc = "[G]ertrude [G]o to task" })
