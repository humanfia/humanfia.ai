---
title: "FlowBench: A benchmark that holds the model fixed and scores the flow"
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

<FbSection n="01" kicker="The gap">

## Benchmarks rank models, but almost nothing ranks the method around them

Many benchmarks compare coding **models**. Almost none compare the **method** around the model.

<FbVariable />

On work that takes eleven hours, the loop matters more than the model. A run that converges and
a run that goes back over hour three differ in what the agent is asked, when, and by whom, with
the same model in both. FlowBench measures the effect of that loop.

</FbSection>

<FbSection n="02" kicker="Methodology" band>

## Everything is held fixed except the flow

Each task is run once per flow, and the same existing check scores every run.

<FbArena />

<div class="fb-rules">

<FbRule n="1" title="Tasks take hours of agent time">

Anything a strong model finishes in a single response says nothing about the loop around it.

</FbRule>
<FbRule n="2" title="Scores come from checks, never from a language model">

Every task comes with a check that already existed: something is faster, or it compiles, or it
passes.

</FbRule>
<FbRule n="3" title="Model, tools and budget never change between runs">

Everything else is held fixed, so a difference in score comes from the flow, not the model.

</FbRule>
<FbRule n="4" title="Flows are scored exactly as users run them">

Flows are not reimplemented for the benchmark. What is scored is the same flow, in the same
runtime, that anybody can [install and run](/projects/humanize).

</FbRule>

</div>

</FbSection>

<FbSection n="03" kicker="Evidence so far">

## Three results from our other projects where the loop moved the score

FlowBench has no public numbers yet. Our other projects have measured the same thing in passing,
and in each case changing the loop changed the score substantially. These are **not FlowBench
results**.

<FbReplays />

The first is from the Humanize ablation in the [KDA² post](/blog/2026-09-27-kda-for-kda), the
second from [HOA's olympiad write-up](/news/2026-10-05-olympiads), and the third from
[HMA](/projects/hma), whose numbers are self-reported. In all three the model was fixed and only
the loop changed.

</FbSection>

<FbSection n="04" kicker="What it changes" band>

## Only flows that win on the board stay on this site

The flows on this site are the ones that hold up on FlowBench. A flow that loses is removed from
the [flowverse](/projects/humanize#the-flows-it-runs), however much we like it.

<div class="fb-tiles">

- [**Where it sits** How benchmark winners become the default flows in Humanize.](/projects/humanize#the-flows-it-runs)
- [**What it scores** Our flows, and widely used ones such as the Ralph loop.](https://github.com/humanfia/flowverse)
- [**When it opens up** The release, and the first cross-flow numbers, will be written up here.](/news/)

</div>

</FbSection>

<FbSection n="05" kicker="Status">

## These posts track FlowBench until it is released

Nothing on this page is a FlowBench result. When the benchmark opens up we will say so
[in the news](/news/) and at [github.com/humanfia](https://github.com/humanfia).

<FbLog
  :entries="[
    { url: '/blog/2026-07-08-model-tool-flow', metric: 'API · CLI · flow' },
    { url: '/blog/2026-08-17-four-layers-and-a-referee', metric: 'Architecture' },
    { url: '/blog/2026-09-27-kda-for-kda', metric: '4 → 47' },
    { title: 'FlowBench is released, with the first cross-flow numbers', metric: 'Not yet', note: 'The first numbers published will be the ones for the flows on this site, including any where ours lose.' },
  ]"
/>

</FbSection>
