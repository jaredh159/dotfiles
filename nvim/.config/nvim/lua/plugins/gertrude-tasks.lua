local themes = require("telescope.themes")
local pickers = require("telescope.pickers")
local finders = require("telescope.finders")
local conf = require("telescope.config").values
local actions = require("telescope.actions")
local action_state = require("telescope.actions.state")
local tmux_projects = require("config.tmux_projects")

local TASKS_DIR = tmux_projects.TASKS_DIR

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
          display_name = tmux_projects.display_name_for_path(path),
          mtime = stat.mtime.sec,
        })
      end
    end
  end

  -- add always-included paths
  local seen = {}
  for _, task in ipairs(tasks) do
    seen[task.path] = true
  end
  for _, path in ipairs(tmux_projects.always_include_paths()) do
    if not seen[path] then
      local stat = vim.loop.fs_stat(path)
      if stat then
        table.insert(tasks, {
          name = vim.fn.fnamemodify(path, ":t"),
          path = path,
          display_name = tmux_projects.display_name_for_path(path),
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
  local mru_lookup = tmux_projects.read_resolved_mru_lookup()
  local cwd = vim.fn.getcwd()

  -- filter out current task
  tasks = vim.tbl_filter(function(task)
    return task.path ~= cwd
  end, tasks)

  if #tasks == 0 then
    vim.notify("No other tasks found", vim.log.levels.WARN)
    return
  end

  local function make_finder()
    return finders.new_table({
      results = tasks,
      entry_maker = function(entry)
        return {
          value = entry,
          display = tmux_projects.task_picker_display(entry, mru_lookup),
          ordinal = entry.display_name,
        }
      end,
    })
  end

  local function refresh_picker(prompt_bufnr, selection_row)
    local current_picker = action_state.get_current_picker(prompt_bufnr)
    if current_picker then
      if selection_row ~= nil then
        local callbacks = { unpack(current_picker._completion_callbacks) }
        current_picker:register_completion_callback(function(self)
          self:set_selection(selection_row)
          self._completion_callbacks = callbacks
        end)
      end
      current_picker:refresh(make_finder(), { reset_prompt = false })
    end
  end

  local function push_entries_to_mru(entries)
    local sessions = {}
    for _, entry in ipairs(entries) do
      table.insert(sessions, tmux_projects.session_name_for_path(entry.value.path))
    end

    if #sessions == 0 then
      return
    end

    tmux_projects.push_sessions_to_mru(sessions)
    for _, session in ipairs(sessions) do
      mru_lookup[session] = true
    end
  end

  local function remove_entries_from_mru(entries)
    local sessions = {}
    for _, entry in ipairs(entries) do
      table.insert(sessions, tmux_projects.session_name_for_path(entry.value.path))
    end

    if #sessions == 0 then
      return
    end

    tmux_projects.remove_sessions_from_mru(sessions)
    for _, session in ipairs(sessions) do
      mru_lookup[session] = nil
    end
  end

  local function push_current_entry_to_mru(prompt_bufnr, next_selection_row)
    local current = action_state.get_selected_entry()
    if not current then
      return
    end

    push_entries_to_mru({ current })
    refresh_picker(prompt_bufnr, next_selection_row)
  end

  local function toggle_current_entry_in_mru(prompt_bufnr, next_selection_row)
    local current = action_state.get_selected_entry()
    if not current then
      return
    end

    local session = tmux_projects.session_name_for_path(current.value.path)
    if mru_lookup[session] then
      remove_entries_from_mru({ current })
    else
      push_entries_to_mru({ current })
    end
    refresh_picker(prompt_bufnr, next_selection_row)
  end

  local function push_marked_entries(prompt_bufnr)
    local selected = action_state.get_current_picker(prompt_bufnr):get_multi_selection()
    if #selected == 0 then
      local current = action_state.get_selected_entry()
      if current then
        selected = { current }
      end
    end

    if #selected == 0 then
      return
    end

    table.sort(selected, function(a, b)
      return (a.index or 0) < (b.index or 0)
    end)

    push_entries_to_mru(selected)
    refresh_picker(prompt_bufnr)

    vim.notify(string.format("Added %d session%s to tmux MRU", #selected, #selected == 1 and "" or "s"))
  end

  pickers
    .new(opts, {
      prompt_title = "Gertrude Tasks",
      finder = make_finder(),
      sorter = conf.generic_sorter(opts),
      attach_mappings = function(prompt_bufnr, map)
        actions.select_default:replace(function()
          actions.close(prompt_bufnr)
          local selection = action_state.get_selected_entry()
          local path = selection.value.path
          local session_name = tmux_projects.session_name_for_path(path)

          -- create session if it doesn't exist, then switch to it
          vim.fn.system(string.format(
            'tmux has-session -t "%s" 2>/dev/null || tmux new-session -s "%s" -c "%s" -d',
            session_name,
            session_name,
            path
          ))
          vim.fn.system(string.format('tmux switch-client -t "%s"', session_name))
        end)

        local function telescope_map(mode, lhs, rhs)
          map(mode, lhs, rhs)
        end

        local function push_current_and_move(selection_delta)
          return function()
            local picker = action_state.get_current_picker(prompt_bufnr)
            local current_row = picker and picker:get_selection_row() or 0
            toggle_current_entry_in_mru(prompt_bufnr, math.max(0, current_row + selection_delta))
          end
        end

        local function toggle_selection_only()
          return function()
            actions.toggle_selection(prompt_bufnr)
          end
        end

        telescope_map("i", "<Tab>", push_current_and_move(1))
        telescope_map("n", "<Tab>", push_current_and_move(1))
        telescope_map("i", "<C-i>", push_current_and_move(1))
        telescope_map("n", "<C-i>", push_current_and_move(1))
        telescope_map("i", "<M-Tab>", push_current_and_move(1))
        telescope_map("n", "<M-Tab>", push_current_and_move(1))
        telescope_map("i", "<S-Tab>", push_current_and_move(-1))
        telescope_map("n", "<S-Tab>", push_current_and_move(-1))
        telescope_map("i", "<C-Space>", toggle_selection_only())
        telescope_map("n", "<C-Space>", toggle_selection_only())
        telescope_map("n", "m", toggle_selection_only())
        telescope_map("i", "<C-y>", function()
          push_marked_entries(prompt_bufnr)
        end)
        telescope_map("n", "<C-y>", function()
          push_marked_entries(prompt_bufnr)
        end)
        return true
      end,
    })
    :find()
end

vim.api.nvim_create_user_command("GertrudeTasks", function()
  gertrude_tasks(vim.tbl_deep_extend("force", themes.get_dropdown({
    previewer = false,
    layout_strategy = "vertical",
    layout_config = {
      width = 0.7,
      height = function(self, _, max_lines)
        local needed = #self.finder.results + 5
        local capped = math.floor(max_lines * 0.8)
        return math.min(needed, capped)
      end,
      prompt_position = "top",
    },
  }), {
    sorting_strategy = "ascending",
  }))
end, { nargs = 0 })

vim.keymap.set("n", "<leader>gg", ":GertrudeTasks<CR>", { desc = "[G]ertrude [G]o to task" })
