---
description: Cleanup current work before proceeding
argument-hint: [web|swift]
---

Okay, I think we've gotten the core requirements, and I'm comfortable with the outcomes in
general.

But now I want to take a pass to see if anything can be cleaned up. If we left any
artifacts of design or development, if there's any duplication we should avoid, or if
there's anything we should abstract away. If we're duplicating any work we do elsewhere
that would best be merged and combined.

Context for cleanup: $ARGUMENTS

If context is "web" or empty and we're working on frontend code:

- Prefer re-using existing components, search for missed opportunities
- Extract reusable components where appropriate
- Shorten verbose Tailwind class combinations (use @apply or component abstractions)
- Remove unused utilities, imports, and dead code
- Check for proper TypeScript types (avoid `any`)
- Ensure consistent naming conventions

If context is "swift" or we're working on Swift code:

- Follow existing codebase patterns strictly
- Leverage existing helper functions and services
- Check for proper error handling
- Ensure database queries are efficient
- Look for opportunities to use existing abstractions

Give it a thorough clean-up pass, but it's important that in all the cleaning up you do,
you don't change any of the appearance if it's a visual change set, or any of the core
observed functionality while you do so.

When you've finished, summarize any changes you made in 10 lines or less.
