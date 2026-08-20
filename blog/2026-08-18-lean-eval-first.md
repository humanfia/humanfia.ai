---
title: "Lean-Eval: first place, and 172 research-level proofs"
description: A fully agentic run took first place on the Lean-Eval leaderboard with 172 research-level mathematics problems — every accepted proof sorry-free and independently re-verified.
date: 2026-08-18
authors:
  - Zhengyang Zhang
  - Hongzhou Lin
tag: HOA
---

Three weeks ago this flow was [second on Lean-Eval](/blog/2026-07-29-lean-eval-second), 149 of
219, behind a specialist prover. It is now first, with **172 research-level problems** solved
and machine-checked in Lean 4, using GPT-5.6 and a fully agentic workflow.

The model is one anybody can rent. What changed is the arrangement around it.

## What the loop does

**Argue first, formalize second.** The flow writes a natural-language proof strategy before it
writes any Lean, then converts that strategy into Lean statements. A formalization that starts
from a plan fails in ways that are legible; one that starts from a blank file fails in ways
that are not.

**The compiler is the reviewer that never gets tired.** Lean's error output is fed back into
the run and the code is refined against it, round after round, by [Humanize](/projects/hoa) and
RLCR agents. Nothing about this is clever — it is just that almost nobody does it for hundreds
of rounds without a human losing patience.

**Seed the hard ones with the easy ones.** For the problems that resist, the argument is first
turned into a precise, stepwise informal plan, and the run is seeded with reusable Lean proofs
from related problems that already closed. The agent then spends its budget formalizing the
ideas that are actually missing rather than re-deriving the ones that are not.

## What counts as solved

Two independent gates, on two different agents, before anything is accepted:

- the **worker** runs a comparator check on its own output; and
- the **reviewer** re-verifies through the AXLE API, which has no access to how the proof was
  arrived at.

Nothing is accepted with a `sorry` placeholder or an unproved assumption standing in for a
step. That bar is the whole reason a leaderboard position in formal mathematics means anything
at all: a proof either has a term the Lean kernel accepts, or it does not exist.

[HOA](/projects/hoa) · [the flows](https://github.com/humanfia/flowverse) ·
[the runtime](https://docs.humanfia.ai/humanize2/)
