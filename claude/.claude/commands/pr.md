---
description: Create a pull request
---

First, search the repo for a `git.md` file at any level. If that file contains
instructions about opening pull requests, follow those instructions and consider them to
override the instructions in this prompt.

But if not, check the repo or use your knowledge from a `CLAUDE.md` file to figure out if
there are formatting steps, lint steps, a check script, an adjust file, or an npm
`package.json`, and run those first. If they don't seem to check out, then stop and advise
the user.

If all that looks good, open a pull request. When opening pull requests, if there's only a
single commit in the branch that's on top of `master`, use the commit message as the title
of the PR. If there are multiple, then make a short PR title, all lowercase, referencing
the most important commits or contents, separated by commas.

If there are small little cleanup or tangential commits, they don't need to be referenced
in the title. Keep the title relatively short, all lowercase. For most PRs, the body
should be empty. If it seems like the PR is doing something sufficiently large, complex,
or tricky, then make a short body in a very casual tone, all lowercase, one or two
paragraphs max.

This is my tone and style on GitHub. If there's some critical documentation, then put a
link to it, but just by dumping the plain URL. Don't do a bunch of fancy markdown and
sections and stuff like that. That makes it look like an LLM did it, and that's not how I
do my PRs.

Go ahead and open the PR, and then output the link to the PR when you're done.
