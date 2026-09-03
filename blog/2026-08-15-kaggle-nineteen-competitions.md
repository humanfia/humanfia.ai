---
title: Ten workflows, nineteen competitions
description: Roughly ten distinct agent workflows entered real Kaggle competitions. Of nineteen completed, fourteen finished in the top 5% — and the gains came from disagreement between agents, not from a better model.
date: 2026-08-15
authors:
  - Changye Li
  - Zijian Zhang
tag: AgentKaggle
---

::: info Still running
Fourteen of these competitions are open. Public ranks move, and the private board is the only
one that counts. Everything below is a snapshot with a date on it.
:::

Kaggle is the setting we keep coming back to, because it is one of the few places an agent
loop can be wrong in public: thousands of humans on the same problem, a deadline that does not
negotiate, and a private leaderboard that arrives after every decision has already been made.

## What was run

Built on [Humanize](/projects/humanize), we designed roughly **ten distinct
agent workflows** and pointed all of them at live competitions. They differ in the things we
think actually matter on a long run:

- how context is managed across hours of work,
- how several skills are orchestrated inside one run,
- how much of an end-to-end machine-learning engineering pipeline the agents own,
- whether a second agent reviews the first one's work, and
- whether attempts run in parallel or in sequence.

## Where they landed

**Completed — nineteen competitions.** Fourteen finished in the top 5%, including five results
at or inside the **top 1%**.

**Ongoing — fourteen official competitions.** Six currently sit in the top 5%, four of them in
the top 3%, and the numbers are still moving.

For comparison, Codex on GPT-5.5 at `xhigh` reasoning effort generally peaked at around the
top-5% level across most of the same competitions. Same models, different arrangement, and the
arrangement is worth the tail of the distribution.

## What we think is doing the work

Our preliminary read is that the gains come primarily from the **diversity of reasoning
strategies** that multi-agent collaboration makes available. A single strong agent narrows
early and commits; several agents arranged to disagree keep more than one line of attack alive
long enough to be tested against a validation split that has not been quietly bent to fit.

That is a hypothesis with a number attached, not a conclusion. Further analysis is ongoing.

## What these figures are, and are not

A finish and an estimate are two different claims, and we do not report them as one. A finish
is an exact position on a closed leaderboard. An estimate is a score, submitted after the
competition closed and placed against the frozen final board — real as a score, and not a
rank, a medal, or evidence of having competed. Both appear above; the audit says which is
which, one row at a time.

[The audit](https://github.com/agentkaggle/kaggle-results-audit) ·
[the live leaderboard](https://agentkaggle.github.io/leaderboard/) ·
[AgentKaggle](/projects/agentkaggle)
