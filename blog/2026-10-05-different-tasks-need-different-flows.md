---
title: "Flow Science: different tasks need different flows"
description: Flow-level ablations on MLE-bench, HLE, ProgramBench and Anthropic's performance take-home, with the models held fixed. The best flow differs from one benchmark to the next.
date: 2026-10-05
authors:
  - Zijian Zhang
tag: Flow Science
---

<script setup>
import DeckFigure from '../.vitepress/theme/components/flowscience/DeckFigure.vue'
</script>

[Part one](/blog/2026-10-05-flow-is-the-new-scaling-dimension) argued that the flow is a
dimension of its own: which agent goes next, what it is asked, what it remembers, and when it
stops. It also argued that one flow cannot solve every problem, because building a project is
a constraint satisfaction problem and making a kernel fast is an optimization problem.

If that is right, it should show up in a measurement. So we ran flows against each other with
the models held fixed. The best flow differs from one benchmark to the next.

The figure is rebuilt from the charts in our October 2026 "Humanize Intro" talk. Pick a
benchmark from the tabs, hover over the chart, tap it or use the arrow keys to read values, and
click a legend entry to hide that series. These are our own runs, **Humanfia-reported,
2026-10-05**, unless a figure links to something published.

## Four benchmarks, one set of models

<DeckFigure of="ABLATIONS" :n="1" title="Flow-level ablations on four benchmarks" source="slides 8 and 22" tabs-label="Benchmark" />

- **MLE-bench.** Flame Chase leads from about the first hour and ties Claude Opus 5's `/goal`
  at 52 of 75 tasks after six hours. The published [HMA](/news/2026-10-05-hma-mle-bench) result
  uses the same alternation and scores each task's best submission: 78.2% any-medal.
- **HLE.** `/goal` is fastest at first. Flame Chase catches up by about an hour and ends highest.
  The Ralph loop and RLCR are slow until a late jump.
- **ProgramBench.** Flame Chase ends highest (90.2), ahead of Opus 5 `/goal` (87.8), RLAR
  (86.4) and GPT-5.6 Sol `/goal` (79.8).
- **Anthropic's performance take-home.** Every single-model flow stops between about 1,045 and
  1,080 cycles. Only the two-model Flame Chase keeps going.

## What the ablations say

No row of that list has the same shape as another. On one benchmark `/goal` is fastest at
first, on another it ties at the end, and on the take-home every single-model flow stops while
the two-model Flame Chase keeps going. The flow is a choice to make per task, which is why
[Humanize](/projects/humanize) is a framework for writing flows, not a single loop.

## Next

Running these ablations surfaced four things we did not expect: about diversity, about
collaboration, about how the goal is posed, and about how models change over a long run. They
are in
[part three, "Four findings, and a science of flows"](/blog/2026-10-05-four-findings-on-flows).
