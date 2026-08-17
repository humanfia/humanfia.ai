---
description: Flame Chase Loop — two agents take turns on the same task, each reading the repository rather than a transcript.
---

# Flame Chase Loop

<p class="lede">Two agents chasing each other's work, turn about. Neither is the boss, neither
is the reviewer, and neither is told what the other was thinking — each one arrives, reads what
is in the repository, and carries it further.</p>

```sh
hmz exec -f official/flame_chase \
    -a claude/claude-opus-4-8:max -a codex/gpt-5.6-sol:max "$(cat TASK.md)"
```

## The idea in one line

**The repository is the only channel between them.**

Each agent takes its turn with no history: not its own from last time, and certainly not the
other's. What survives from one turn to the next is exactly what got written down — code,
tests, notes, a commit message. Everything else evaporates.

The flow is short enough to quote in full, and that is a feature:

```python
while True:
    for agent in agents:
        agent(task, suppress=True)  # each agent reads the repository, not a history
```

## Why it works better than it has any right to

**Nobody inherits the other's dead ends.** The most expensive thing on a long run is an agent
that has convinced itself of a bad approach and is now defending it. Here, the agent that
picks the work up next never heard the argument. It sees the state of the code and forms its
own opinion of what to do next.

**Two vendors, one task.** Point it at a Claude and a Codex, or a Kimi and a DeepSeek, and you
get genuinely different instincts alternating on the same problem — one notices the race
condition, the other notices the API is unpleasant. Same task, same repository, different
blind spots.

**It forces the work to be legible.** Because nothing carries in context, an agent that wants
its intent to survive has to leave it in the repository. Runs under this flow tend to produce
better commit messages and better notes than runs where the agent knows it will remember.

**It is symmetric.** There is no reviewer to become a bottleneck and no plan to go stale. Both
agents are always doing the work.

## What it is not good at

Being honest about this is more useful than a longer list of strengths.

- **Convergence is not guaranteed.** Two agents with different taste can rewrite each other's
  choices. On tasks with a strong objective check — a test suite, a benchmark, a verifier —
  this settles quickly; on vague ones it can oscillate. Give it something measurable.
- **No one is checking for reward hacking.** Neither agent is cast as sceptic. If that is your
  fear, use [RLAR](/flows/rlar) instead, or run this and review at the end.
- **It spends.** Two agents working, always. That is the trade you are making for coverage.

## When to reach for it

- Hard, open-ended optimisation where the score is objective and you want maximum variety of
  attack. This is the loop we reach for on kernel work.
- Anything where you suspect one model's blind spot is the thing standing between you and the
  answer.
- Long unattended runs on a repository with real checks in it.

[RLAR](/flows/rlar) · [Humanize 1](/flows/humanize1) ·
[The flowverse](/projects/flowverse)
