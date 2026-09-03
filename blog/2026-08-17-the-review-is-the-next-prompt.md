---
title: The review is the next prompt
description: Two small decisions inside RLAR — the reviewer's words go to the actor verbatim, and "done" is read off a field rather than a sentence — that changed how long-horizon runs behave.
date: 2026-08-17
authors:
  - Humanfia
tag: Method
---

[RLAR](https://github.com/humanfia/flowverse) is about forty lines. Two of them are the reason it works, and both are
the kind of decision that sounds like a detail until you watch a hundred hours of runs
without them.

## One: the review is the next prompt, verbatim

The obvious way to build an actor-and-reviewer loop is: the reviewer writes an assessment, the
loop reads it, and something — a template, a summariser, the flow itself — turns it into
instructions for the actor.

Every layer in that chain is somewhere findings go to die. The reviewer notices that the test
was narrowed; the summariser renders it as "some test changes were noted"; the actor reads
that as permission.

So in RLAR there is no chain. What the reviewer writes is passed to the actor word for word,
as its entire next prompt, and it is everything the actor will hear about that round.

The second-order effect is the interesting one. Once the reviewer knows its output *is* the
instruction, it stops writing assessments and starts writing instructions. Its skill file says
so outright:

> The review is not a report for a person. It is the next prompt of the agent that did the
> work, word for word, and it is everything that agent will hear about this round.

Reviews written under that rule cite files, lines and commands, because vagueness is no longer
somebody else's problem to resolve — it is a wasted round.

## Two: "done" is a field, not a sentence

The other decision is how the loop ends.

The common pattern is a marker: the reviewer is told to write `DONE` on its own line, and the
loop greps for it. This fails in both directions, quietly. A reviewer writing "this is not
done until the migration is added" contains the word. A reviewer that has decided the work is
finished but wrote a graceful paragraph does not.

In RLAR the reviewer answers into a shape with two fields — a `done` boolean and the `notes`
string — and the loop reads the boolean. A review that *says* the work is done and a review
that *decides* the work is done are then not the same thing, which is as it should be: one is
prose and the other is a decision.

The field's description carries the whole standard, because the description is what the
backend is given as the shape to answer in:

> True only if the task is completely and correctly done: everything asked for is implemented,
> it works, nothing was faked, stubbed or special-cased to pass, and there is no next step
> worth taking.

That is a deliberately hostile bar, and it is the one that ends the run.

## Why both of these are about reward hacking

On a long unattended run, work does not usually fail by being incompetent. It fails by looking
finished: a test narrowed until it passes, a branch special-cased on the exact input the test
uses, a stub with a confident summary written on top of it.

Every mechanism above exists to make that harder. The reviewer arrives with no memory, so it
cannot be told a story about what happened — it has to look at the repository. Its verdict is
structured, so it cannot end the run by accident. Its words reach the actor unedited, so the
one agent in the system whose job is scepticism is the one whose language the actor hears.

None of this is expensive. It is forty lines and one skill file. The reason we are writing it
down is that the cheap decisions are the ones people skip.

[Read the flow](https://github.com/humanfia/flowverse) · [Run it](/projects/humanize)
