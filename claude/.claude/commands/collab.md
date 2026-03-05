---
description: Collaborate with another Claude Code instance via shared file
allowed-tools: Bash, Read, Write, Glob
---

# Collab - Inter-Instance Communication

This skill enables two Claude Code instances to communicate through a shared file system.

**Argument:** `$ARGUMENTS`

## Protocol

### Mode Detection

- If `$ARGUMENTS` is empty or blank: you are the **initiator**. Go to "Initiator Setup."
- If `$ARGUMENTS` is a session ID (short alphanumeric string): you are the **joiner**. Go to "Joiner Setup."

---

### Initiator Setup

1. Generate a short random session ID (6 chars, lowercase alphanumeric) via:
   ```
   cat /dev/urandom | LC_ALL=C tr -dc 'a-z0-9' | head -c 6
   ```

2. Create the session directory:
   ```
   mkdir -p /tmp/claude-collab/<session-id>
   ```

3. Determine your identity:
   - Run `git branch --show-current` to get your branch name
   - Run `basename $(pwd)` to get your project directory
   - Your agent ID is: `agent-1`

4. Create `/tmp/claude-collab/<session-id>/meta.json`:
   ```json
   {
     "created": "<ISO timestamp>",
     "agent-1": {
       "branch": "<branch>",
       "cwd": "<working directory>"
     }
   }
   ```

5. Create `/tmp/claude-collab/<session-id>/messages.md` with initial content:
   ```
   # Collab Session <session-id>
   ```

6. Create `/tmp/claude-collab/<session-id>/turn` with content: `agent-1`
   (You go first since you're initiating.)

7. Copy the session ID to the clipboard:
   ```
   echo -n "<session-id>" | pbcopy
   ```

8. Tell the user:
   > Collab session created. The session ID `<session-id>` has been copied to your clipboard. Run `/collab <session-id>` in your other Claude Code instance to join.

9. Now write your first message. Go to "Writing a Message."

---

### Joiner Setup

1. Verify the session exists:
   ```
   ls /tmp/claude-collab/$ARGUMENTS/
   ```
   If it doesn't exist, tell the user the session ID is invalid.

2. Determine your identity:
   - Run `git branch --show-current` to get your branch name
   - Run `basename $(pwd)` to get your project directory
   - Your agent ID is: `agent-2`

3. Read and update `/tmp/claude-collab/<session-id>/meta.json` to add your info:
   ```json
   {
     "agent-2": {
       "branch": "<branch>",
       "cwd": "<working directory>"
     }
   }
   ```

4. Read `/tmp/claude-collab/<session-id>/messages.md` to see any existing messages.

5. Check `/tmp/claude-collab/<session-id>/turn` to see whose turn it is.
   - If it says `agent-2`, go to "Writing a Message."
   - If it says `agent-1`, go to "Polling for Messages."

---

### Writing a Message

1. Read the current `messages.md` to see full conversation history.

2. Append your message to `messages.md` in this format:
   ```
   ---
   **[<your-agent-id>]** (<branch>) - <ISO timestamp>

   <your message content here>
   ```

3. After writing your complete message, update the `turn` file to the OTHER agent's ID.
   - If you are `agent-1`, write `agent-2` to the turn file.
   - If you are `agent-2`, write `agent-1` to the turn file.

4. Tell the user what you wrote (brief summary).

5. Now go to "Polling for Messages."

---

### Polling for Messages

Wait for the other agent to respond by checking the `turn` file periodically.

**Polling schedule (strictly follow this to avoid burning tokens):**

- **Minutes 0-5:** Check every 60 seconds (up to 5 checks)
- **Minutes 5-10:** Check every 2 minutes
- **After 10 minutes with no response:** Tell the user you haven't heard back and ask if they want you to keep waiting
- If they say yes: check every 10 minutes
- **After 2 hours total with no response:** Stop polling entirely. Tell the user the session appears inactive.

**Each poll iteration:**

1. Read the `turn` file.
2. If it contains YOUR agent ID, a new message is waiting:
   - Read `messages.md` to see the new message(s).
   - Display the new message to the user.
   - Go to "Writing a Message" (you can now compose a reply).
3. If it still contains the OTHER agent's ID, no new message yet. Wait and poll again per the schedule above.

To poll, use:
```
sleep 60 && cat /tmp/claude-collab/<session-id>/turn
```

---

### Ending a Session

Either agent can end the session by writing a final message that says they're signing off. Append a closing message to `messages.md` and update the turn file one last time so the other agent sees it.

---

## Guidelines for Communication

- Keep messages concise. The other agent will read the full message log each time.
- Be specific about file paths, branch names, and what you need from the other agent.
- If coordinating code changes, clearly state which files you're modifying to avoid conflicts.
- Use the message to share context the other agent can't easily discover on their own.
