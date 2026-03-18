local M = {}

local home = vim.fn.expand("$HOME")

M.TASKS_DIR = home .. "/gertie/tasks"
M.MRU_FILE = home .. "/.tmux-mru"
M.MRU_ICON = "●"

local ALWAYS_INCLUDE = {
  {
    path = home .. "/gertie/supervise",
    display = "~/gertie/supervise",
  },
  {
    path = home .. "/gertie/marketing",
    display = "~/gertie/marketing",
  },
  {
    path = home .. "/gertie/support",
    display = "~/gertie/support",
  },
}

local function basename(path)
  return vim.fn.fnamemodify(path, ":t")
end

function M.session_name_for_path(path)
  return basename(path):gsub("%.", "_")
end

function M.display_name_for_path(path)
  for _, entry in ipairs(ALWAYS_INCLUDE) do
    if entry.path == path then
      return entry.display
    end
  end

  if vim.startswith(path, M.TASKS_DIR .. "/") then
    return basename(path)
  end

  return vim.fn.fnamemodify(path, ":~")
end

function M.path_for_session(session)
  for _, entry in ipairs(ALWAYS_INCLUDE) do
    if M.session_name_for_path(entry.path) == session then
      return entry.path
    end
  end

  return M.TASKS_DIR .. "/" .. session
end

function M.always_include_paths()
  local paths = {}
  for _, entry in ipairs(ALWAYS_INCLUDE) do
    table.insert(paths, entry.path)
  end
  return paths
end

function M.read_mru_sessions()
  if vim.fn.filereadable(M.MRU_FILE) == 0 then
    return {}
  end

  local lines = vim.fn.readfile(M.MRU_FILE)
  return vim.tbl_filter(function(line)
    return line ~= ""
  end, lines)
end

function M.read_mru_lookup()
  local lookup = {}
  for _, session in ipairs(M.read_mru_sessions()) do
    lookup[session] = true
  end
  return lookup
end

function M.task_picker_display(task, mru_lookup)
  local prefix = "  "
  if mru_lookup[M.session_name_for_path(task.path)] then
    prefix = M.MRU_ICON .. " "
  end

  return prefix .. task.display_name
end

return M
