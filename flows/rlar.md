---
description: RLAR — an actor works in one session and a fresh reviewer reads its work, until the reviewer has nothing left to say.
---

# RLAR

<p class="lede">Reinforcement Learning by Actor and Reviewer, without the reinforcement
learning. An actor works in one long session. A reviewer arrives with no memory each round,
reads the repository rather than the story about it, and decides both what the actor hears
next and whether the run is over.</p>

```sh
hmz exec -f official/rlar \
    -a claude/claude-opus-4-8:high -a claude/claude-opus-4-8:high "$(cat TASK.md)"
```

## The idea in one line

**The side that writes remembers, and the side that reads must not.**

Give the two agents the same model and the same effort and they are still two agents, which is
exactly the point. The actor accumulates context — what it tried, what failed, what it decided
in round three. The reviewer accumulates nothing: every round it is a session that has just
started, is handed the task as if for the first time, and has to find out what happened by
looking at the repository.

That asymmetry is the whole mechanism. An agent that reviews its own work is grading its own
memory of it, and its memory is the most flattering document in the room.

## What a round is

1. The actor takes a turn in its session.
2. If that turn landed, a fresh reviewer is opened, given the task, and told to check what
   was actually done against the state of the repository.
3. The reviewer answers two things at once: **whether the task is finished**, and **what to
   say to the actor about it**.
4. The second becomes the actor's next prompt, word for word. The first is what ends the loop.

A turn that failed answers with nothing, so the round is taken again rather than advanced past
a review the actor never saw.

## The two decisions that make it work

### The review is read off a shape, not off a sentence

The reviewer is held to an object with a `done` boolean and a `notes` string, and both are
read off that object. So a review that *says* the work is done and a review that *decides* the
work is done are not the same thing — a paragraph ending in "it is done" cannot end the run,
and a review that only marks itself done is not one.

`done` is defined tightly on purpose: true only if everything asked for is implemented, it
works, nothing was faked, stubbed or special-cased to pass, and there is no next step worth
taking.

### The review *is* the next prompt

Not a summary of it, not an input to something that writes one. What the reviewer noticed is
what the actor hears, in the reviewer's words, and it is all the actor will hear about that
round. Which forces the review to be written as an instruction rather than as an assessment,
and removes the layer where good findings usually get lost.

## The skill it carries

RLAR brings one skill, `review-notes`, mounted onto every session either agent opens. It is
how to read a round of work against the repository it landed in, and how to write the review
the actor is then handed. Its first instruction is the important one:

> What the working agent said it did is a claim. What the repository holds is the evidence.

And its list of what to look for is ordered by how often each one is the answer — a test
weakened, skipped or narrowed until it passes; a branch special-cased on the exact input the
test uses. Reward hacking is treated as the thing the reviewer is most there to catch, because
on a long run it is.

The skill belongs to the flow rather than to the machine, so a fork that wants its reviews
written differently edits that one Markdown file and runs.

## When to reach for it

- Long tasks with a real acceptance criterion, where the failure mode you fear is *plausible
  but not actually done*.
- Any run where you will not be watching, and something has to be sceptical on your behalf.
- Work where you want two different models involved — an actor and a reviewer from different
  vendors disagree in useful ways.

A trace of an RLAR run reads as two processes: the actor's one long session, and the
reviewer's rounds side by side with it.

[The flow's source](https://github.com/humanfia/flowverse) ·
[Flame Chase Loop](/flows/flame-chase) · [Humanize 1](/flows/humanize1)
