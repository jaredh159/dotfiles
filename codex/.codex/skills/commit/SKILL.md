---
name: commit
description:
  Use this when preparing a git commit and you need repository-specific commit guidance,
  commit-message style guidance, and a lightweight pre-commit workflow.
---

# Commit Guidance

First, check the repo you're working in for a `git.md` file at any level. If you find
one, read and follow the instructions there.

If you don't, then check if the repo has formatting or lint fixing steps, or if it has a
`just` file, or npm scripts, etc. If there's a check script, run that. Don't commit if
you see problems with that.

If all that looks clear, then sample the last 10 git commit messages by looking at `git
log --oneline` and follow the style of commits that are being made in this repository.

Beyond that, write commit messages in all lowercase. Keep them short and specific. Not
crazy short, but do not get too verbose about them.
