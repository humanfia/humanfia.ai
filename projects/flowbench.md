---
title: "FlowBench: The referee"
description: Our benchmark for long-horizon agent work. It holds the model fixed and makes the flow the variable, on tasks that take hours and are scored by checks that already existed. It is not released yet.
layout: page
pageClass: fb-page
sidebar: false
aside: false
outline: false
---

<script setup>
import { FbArena, FbHero, FbLog, FbReplays, FbRule, FbSection, FbVariable } from '../.vitepress/theme/components/projects/flowbench'
</script>

<FbHero />

<FbSection n="01" kicker="The question">

## The question it answers

Ask which **model** is best at coding and a dozen benchmarks will tell you. Ask which **method**
is best, and nobody knows: almost nothing measures it.

<FbVariable />

On work that takes eleven hours, the loop is worth more than the model. A run that converges and
a run that wanders back over hour three differ in what the agent is asked, when, and by whom.
They do not differ in what the model can write. FlowBench measures that difference.

</FbSection>

<FbSection n="02" kicker="Methodology" band>

## Methodology

One task, several flows, one real check. Everything but the method is held still.

<FbArena />

<div class="fb-rules">

<FbRule n="1" title="The work is long.">

Tasks take hours of agent time, not one turn. Anything a strong model finishes in a single
response says nothing about the loop around it.

</FbRule>
<FbRule n="2" title="The score is real.">

Every task comes with a check that already existed: something is faster, or it compiles, or it
passes. Nothing here is graded by a language model.

</FbRule>
<FbRule n="3" title="The method is the variable.">

Everything else is held fixed, so a result reads as *this loop beat that loop*, not *this vendor
beat that vendor*.

</FbRule>
<FbRule n="4" title="It runs the real thing.">

Flows are not reimplemented for the benchmark. What is scored is the same flow, in the same
runtime, that anybody can [install and run](/projects/humanize).

</FbRule>

</div>

</FbSection>

<FbSection n="03" kicker="Replays, not results">

## Why the flow is worth measuring

FlowBench has no public numbers yet. Our other projects have measured the same thing in passing,
and every time the loop moved the score more than anyone would guess. These are **not FlowBench
results**.

<FbReplays />

The first is from the Humanize ablation in the [KDA² post](/blog/2026-09-27-kda-for-kda), the
second from [HOA's olympiad write-up](/news/2026-10-05-olympiads), and the third from
[HMA](/projects/hma), whose numbers are self-reported. A benchmark that measured only the model
would have missed all three.

</FbSection>

<FbSection n="04" kicker="The arrow back" band>

## What it changes for us

<p class="fb-quote">A loop that loses on the board does not become a&nbsp;default.</p>

FlowBench is why the flows on this site are the flows on this site. A loop we like the sound of
but that loses does not stay in the [flowverse](/projects/humanize#the-flows-it-runs). It is a
slow way to build a product, and the only way we know to tell craft from taste.

<div class="fb-tiles">

- [**Where it sits** How the benchmark feeds the flows, and the flows feed the runtime.](/projects/humanize#the-flows-it-runs)
- [**What it scores** The loops themselves: ours, and the ones the field converged on.](https://github.com/humanfia/flowverse)
- [**When it opens up** The release, and the first cross-flow numbers, will be written up here.](/news/)

</div>

</FbSection>

<FbSection n="05" kicker="The match log">

## Where it stands

Nothing on this page is a FlowBench result. When the benchmark opens up we will say so
[in the news](/news/) and at [github.com/humanfia](https://github.com/humanfia).

<FbLog
  :entries="[
    { url: '/blog/2026-07-08-model-tool-flow', metric: 'API · CLI · flow' },
    { url: '/blog/2026-07-20-humanfia-launch', metric: 'Launch' },
    { url: '/blog/2026-08-17-four-layers-and-a-referee', metric: 'The referee' },
    { url: '/blog/2026-09-27-kda-for-kda', metric: '4 → 47' },
    { title: 'FlowBench is released, with the first cross-flow numbers', metric: 'Not yet', note: 'The first numbers published will be the ones for the flows on this site, whether or not they flatter us.' },
  ]"
/>

</FbSection>
