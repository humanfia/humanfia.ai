---
title: "Flow Science: four findings, and engineering or a science?"
description: "What the flow-level ablations found that we did not expect: higher diversity, higher score; better collaboration, better performance; a progressive goal keeps agents on track; and Claude degrades across turns where GPT does not. Then: is a flow just engineering?"
date: 2026-10-05
authors:
  - Zijian Zhang
tag: Flow Science
---

<script setup>
import DeckFigure from '../.vitepress/theme/components/flowscience/DeckFigure.vue'
import FlowLadder from '../.vitepress/theme/components/flowscience/FlowLadder.vue'
import AblationAxes from '../.vitepress/theme/components/flowscience/AblationAxes.vue'
</script>

[Part one](/blog/2026-10-05-flow-is-the-new-scaling-dimension) made the case that the flow is
the next dimension of scaling agents, and that one flow cannot solve every problem.
[Part two](/blog/2026-10-05-different-tasks-need-different-flows) ran flows against each other
on four benchmarks with the models held fixed, and the best flow differed from one benchmark to
the next.

This last part is what those runs taught us beyond the leaderboard: four findings we did not
expect, and the question they raise. Every figure is rebuilt from the charts in our October 2026
"Humanize Intro" talk. Hover over a figure, tap it or use the arrow keys to read values, and
click a legend entry to hide that series. These are our own runs, **Humanfia-reported,
2026-10-05**, unless a figure links to something published.

## Higher diversity, higher score

Two different models taking turns beat either model working alone, whether you measure tokens,
dollars or hours. The Flame Chase of Claude Fable 5 and GPT-5.6 Sol goes below either model's
own Ralph loop and keeps going after both have stopped.

<DeckFigure of="DIVERSITY" :n="1" title="Two models alternating against each model alone" source="slide 23" tabs-label="X axis" />

## Better collaboration, better performance

Parallelism helps only as much as the lanes can work together. Three Flame Chase lanes that
share reports beat one chase. The same three lanes with a coordinator merging their work
through Git pull requests beat both, on wall-clock time and on the tokens along the critical
path.

<DeckFigure of="COLLABORATION" :n="2" title="Flame Chase, Parallel Flame Chase and its Git/PR variant, 12 hours" source="slide 24" tabs-label="X axis" />

## A progressive goal keeps agents on track

In a Ralph loop, every round starts from a fresh session with the same goal. Agents lose their
way: a round redoes work or polishes the wrong thing. If the goal advances as milestones are
met, the same model on the same task gets below 1,000 cycles. With a fixed goal it levels off
near 1,060.

<DeckFigure of="PROGRESSIVE" :n="3" title="Ralph loop, one fixed goal against a progressive goal" source="slide 25" tabs-label="X axis" />

## Claude degrades across turns, GPT does not, and Flame Chase helps

Measured by output tokens per response over a 24-hour run, GPT-5.6 Sol works at the same
length from the first hour to the last in every flow. Claude Fable 5 starts with very long
responses. In the flows that keep one session going (Always continue, Always prompt, ARAR), it
falls to under a hundred tokens per response within five to ten hours. At that point it is
barely working. The Flame Chase, where a fresh Fable session alternates with GPT, keeps it near
a thousand. On the take-home, that is also where the cycles keep falling.

<DeckFigure of="DEGRADATION" :n="4" title="Output tokens per response over a 24-hour run" source="slides 26 and 27" tabs-label="Model" />

The talk also showed this measurement for a Ralph loop at every effort level on ten models,
five from each vendor. The GPT models stay flat. Some of the Claude models decay over the run,
most clearly Fable 5 at both effort levels and Opus 4.8 at `xhigh`.

## Engineering, or a science?

Is a flow just one more kind of prompt, context, skill or loop engineering? We think it can be
more than that.

<FlowLadder />

A flow family can be studied the way a model architecture is: hold everything else fixed, vary
one thing and measure the result. These are the axes along which we are ablating the Flame
Chase:

<AblationAxes />

The work needs a runtime that can express any of these variations as a short piece of Python,
run it for a day on real hardware and record every turn on one clock. That is what
[Humanize](/projects/humanize) is. The engine underneath it is described in
[Deep Tech](/projects/humanize#deep-tech).

This closes the series. Start again from
[part one](/blog/2026-10-05-flow-is-the-new-scaling-dimension), or go to
[part two](/blog/2026-10-05-different-tasks-need-different-flows) for the ablations these
findings came out of.
