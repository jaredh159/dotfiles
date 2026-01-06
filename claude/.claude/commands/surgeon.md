---
description: Prepare a chunk of work, but do not implement the key parts
---

Okay, I want you to analyze the task file, and I want you to plan your work with a to-do
list. Then, do all the boilerplate-y work: any new files that need to be created, any
types from a spec document or the task document that should be created. Create migrations
if necessary, new database models, modifications to existing types.

But for the two, three, or four, or maybe only one in some cases, key parts of the actual
implementation—the code that implements the feature that we're working on—I want you to
not write the code for it. Instead of the implementation, I want you to insert something
that will make the code compile.

For Swift, this would be a fatal error. If we're in TypeScript, maybe just throw an error,
or cast something to 'any.' But leave the code in a compiling state and don't write the
implementation. Instead, just write a handful of lines of comments about the design of the
implementation. These comments should contain no code snippets whatsoever.

For example, if we're working on the Gertrude API, this might mean leaving the inside of a
PairQL resolver function empty.

If the task file talks about writing unit tests, then go ahead and write the unit tests
for all the cases described in the task file. Make sure to examine similar functionality
and how it is tested in the codebase, and follow the patterns carefully. You may write all
of the test files, but again, none of the implementation.

When you're done, summarize for me the places that remain to be implemented, and stop.
