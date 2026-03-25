local M = {}

local home = vim.fn.expand("$HOME")

M.TASKS_DIR = home .. "/gertie/tasks"
M.MRU_FILE = home .. "/.tmux-mru"
M.MRU_ICON = "●"
M.MRU_MAX_SESSIONS = 12

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
  local session = basename(path):gsub("%.", "_")
  return session
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

function M.tmux_session_exists(session)
  return vim.fn.system({ "tmux", "has-session", "-t", session }) and vim.v.shell_error == 0
end

function M.tmux_session_path(session)
  local path = vim.fn.system({ "tmux", "display-message", "-p", "-t", session, "#{session_path}" })
  if vim.v.shell_error ~= 0 then
    return nil
  end

  path = vim.trim(path)
  if path == "" then
    return nil
  end
  return path
end

function M.resolved_path_for_session(session)
  local live_path = M.tmux_session_path(session)
  if live_path then
    return live_path
  end

  local fallback_path = M.path_for_session(session)
  local stat = vim.loop.fs_stat(fallback_path)
  if stat and stat.type == "directory" then
    return fallback_path
  end

  return nil
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

function M.read_live_mru_sessions()
  return vim.tbl_filter(function(session)
    return M.tmux_session_exists(session)
  end, M.read_mru_sessions())
end

function M.read_resolved_mru_sessions()
  return vim.tbl_filter(function(session)
    return M.resolved_path_for_session(session) ~= nil
  end, M.read_mru_sessions())
end

function M.read_mru_lookup()
  local lookup = {}
  for _, session in ipairs(M.read_mru_sessions()) do
    lookup[session] = true
  end
  return lookup
end

function M.read_live_mru_lookup()
  local lookup = {}
  for _, session in ipairs(M.read_live_mru_sessions()) do
    lookup[session] = true
  end
  return lookup
end

function M.read_resolved_mru_lookup()
  local lookup = {}
  for _, session in ipairs(M.read_resolved_mru_sessions()) do
    lookup[session] = true
  end
  return lookup
end

function M.write_mru_sessions(sessions)
  vim.fn.writefile(sessions, M.MRU_FILE)
end

function M.push_sessions_to_mru(sessions)
  local merged = {}
  local seen = {}

  for _, session in ipairs(sessions) do
    if session ~= "" and not seen[session] then
      table.insert(merged, session)
      seen[session] = true
    end
  end

  for _, session in ipairs(M.read_mru_sessions()) do
    if session ~= "" and not seen[session] then
      table.insert(merged, session)
      seen[session] = true
    end
  end

  while #merged > M.MRU_MAX_SESSIONS do
    table.remove(merged)
  end

  M.write_mru_sessions(merged)
  return merged
end

function M.remove_sessions_from_mru(sessions)
  local remove = {}
  for _, session in ipairs(sessions) do
    if session ~= "" then
      remove[session] = true
    end
  end

  local kept = {}
  for _, session in ipairs(M.read_mru_sessions()) do
    if session ~= "" and not remove[session] then
      table.insert(kept, session)
    end
  end

  M.write_mru_sessions(kept)
  return kept
end

function M.task_picker_display(task, mru_lookup)
  local prefix = "  "
  if mru_lookup[M.session_name_for_path(task.path)] then
    prefix = M.MRU_ICON .. " "
  end

  return prefix .. task.display_name
end

return M
