---
description:
  Prepare a chunk of work for a new PairQL resolver, but do not implement the key parts
---

Okay, I want you to mostly go ahead with the implementation, but with a couple of caveats:

Set up everything, but when you create the resolver file and the resolve function, I don't
want you to actually write the implementation inside the resolve function. I want you to
put a fatal error so that it compiles and a few lines of comments containing notes about
the different cases we want to do and what our implementation plan is, but no code
snippets—just comments about what needs to happen. That's because I'm going to actually
write the implementation of that resolver file.

Second, I want you to study some of our unit test cases for these PairQL endpoints,
especially some from a few of the recent commits, and understand the convention. What I
want is a test file that covers like 75% of the core functionality of this route. I don't
want to make it super long and cover every single possible edge case; I just want to nail
the happy path and the most important error cases, if any.

This usually means two to four tests, but can be more or less depending on the simplicity
or complexity of the task. I want you to write all those tests completely in the style of
all of our other tests. They should fail because we're going to have that fatal error, and
then just set the whole thing up ready for me to come in and implement it.

Finally print for me the isolated test watch command I can use to run just the new test
case, this would end with the name of the test class, something like:

```
just swift watch-test api GetPendingSupervisionResolverTests
```
