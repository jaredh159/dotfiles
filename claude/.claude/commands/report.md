---
description: Write the recent assessment to a report file
---

I want you to take the report/assessment of what you just told me and write it to a report
file in the root of this repo, in the format of `claude.report.{slug}.md` where slug is a
short identifier for this content, less than 16 characters.

Keep the file contents very similar to what you just output, don't modify it hardly at
all, except basic markdown formatting if necessary. The goal is to have a report file that
looks very similar to the output I just read.

If there is a `claude.task.md` file in the root, make a short note referencing the new
report file and what it covers. Do not use `@` to force the reading, just specify the path
so the agent can decide to read if it needs it.
