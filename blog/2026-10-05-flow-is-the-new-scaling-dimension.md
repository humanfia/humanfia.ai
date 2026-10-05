---
title: "Flow Science: flow is the new scaling dimension"
description: Models scale with parameters and data, and agents scale with tools. The next dimension is the flow. Why a single /goal session is not enough on long, hard tasks, and why one flow cannot solve every problem.
date: 2026-10-05
authors:
  - Zijian Zhang
tag: Flow Science
---

<script setup>
import DeckFigure from '../.vitepress/theme/components/flowscience/DeckFigure.vue'
import NoFreeLunch from '../.vitepress/theme/components/flowscience/NoFreeLunch.vue'
</script>

Flow is the new dimension of scaling agents. Models scale with parameters and data, and agents
scale with tools. The next dimension is the flow: which agent goes next, what it is asked, what
it remembers, and when it stops. Change only the flow and the same models land somewhere else.

This is the first of three posts on what we have measured so far. This one makes the case: a
single session is not enough on long, hard tasks, and no one flow can serve every task.
[The second](/blog/2026-10-05-different-tasks-need-different-flows) runs flows against each
other on four benchmarks with the models held fixed.
[The third](/blog/2026-10-05-four-findings-on-flows) is what those runs found that we did not
expect, and why we think flows are a science rather than one more kind of engineering.

Every figure is rebuilt from the charts in our October 2026 "Humanize Intro" talk. Hover over a
figure, tap it or use the arrow keys to read values, and click a legend entry to hide that
series. These are our own runs, **Humanfia-reported, 2026-10-05**, unless a figure links to
something published.

## From session to flow

A coding agent's own `/goal` is one session pursuing one objective until it says it is done.
That works for small tasks. On long, hard ones it is not enough. On Anthropic's original
performance take-home, `/goal` with GPT-5.6 Sol spends 2.6 million output tokens to reach about
1,080 clock cycles. A Ralph loop on the same model is below 1,100 within half a million. A Flame
Chase alternating Claude Fable 5 and GPT-5.6 Sol keeps improving and finishes near 1,010.

<DeckFigure of="SESSION_TO_FLOW" :n="1" title="A simple /goal is not enough for complex tasks" source="slide 2" />

The talk summed this up as **"80 cycles better, 80% tokens saved"** against `/goal`.
*Humanfia-reported, 2026-10-05.*

## No free lunch: one flow cannot solve every problem

Our first flow, **RLCR Flow** (Ralph loop with Codex review), is good at building a
project from scratch. Coding of that kind is a **constraint satisfaction problem**. Every
requested feature must be implemented, the tests must pass and the lints must be clean, and we
do not care about the exact shape of the code. One feasible solution is enough.

A CUDA kernel is a different problem. A kernel that merely runs is not the goal: we want the
fastest one that is still correct. That makes it an **optimization problem**, and real runs
already guarantee that a candidate is feasible. For this we built the **Flame-Chase loop**: two
fresh agents take turns on one shared repository. In our runs, Claude Code with Claude Fable 5
tends toward large refactors, which sometimes make things slower. Codex with GPT-5.6 Sol tends
to fine-tune and gets stuck in a local optimum. Alternating the two lets the run jump from one
local optimum to a better one.

<NoFreeLunch />

| Problem class | What "done" means | Flow family |
| --- | --- | --- |
| Constraint satisfaction | any solution that passes every check | [RLCR](/flows/humanize1), the [Ralph loop](/flows/ralph-loop) |
| Optimization | the best solution found | [Flame Chase](/flows/flame-chase), [Parallel Flame Chase](/flows/parallel-flame-chase) |
| Decision | a yes or no, with a certificate | open |
| Prediction | a calibrated estimate | open |
| Game-theoretic | a strategy that holds against others | open |
| Counting | an exact number | open |

Theorem proving, hyperparameter tuning and many other tasks need flows of their own. That is
why [Humanize](/projects/humanize) is a framework for writing flows, not a single loop.

## Next

If the flow matters this much, the best flow should change from one task to the next, and it
should show when the models are held fixed. That is the experiment in
[part two, "Different tasks need different flows"](/blog/2026-10-05-different-tasks-need-different-flows).
