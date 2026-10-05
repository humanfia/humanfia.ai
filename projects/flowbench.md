---
title: "FlowBench: the referee"
description: Our benchmark for long-horizon agent work. It holds the model fixed and makes the flow the variable, on tasks that take hours and are scored by checks that already existed. It is not released yet.
layout: post
sidebar: false
tag: FlowBench

project:
  status: In development · not released
  links:
    - { text: The flows it scores, href: /flows/ }
    - { text: humanfia/flowverse, href: https://github.com/humanfia/flowverse }
    - { text: The runtime, href: /projects/humanize }
  stats:
    - { display: Hours, kicker: Task length, text: 'Each task takes hours of agent time. One turn is never enough' }
    - { display: '1', kicker: Variable, text: 'The flow. The model, tools, task, budget and machine stay fixed' }
    - { display: '0', kicker: LLM graders, text: 'Faster, compiles, passes: every score is a check that already existed' }
    - { display: Unreleased, kicker: Status, text: 'No FlowBench numbers are published yet. When they are, they go in the news' }
---

FlowBench decides which of our own loops survives. Nothing on this page is a FlowBench result:
the benchmark is not released, and we publish no numbers from it until it is. When it opens up
we will say so [in the news](/news/) and at [github.com/humanfia](https://github.com/humanfia).

## The question it answers

Ask which model is best at coding and a dozen benchmarks will tell you. Ask which *method* is
best, and nobody knows, because almost nothing measures it. The same model can run in a loop
that starts fresh every turn, in one that keeps a session, or in one with a second agent reading
the first one's work.

On work that takes eleven hours, the loop is worth more than the model. A run that converges and
a run that wanders back over hour three differ in what the agent is asked, when, and by whom.
They do not differ in what the model can write. FlowBench measures that difference.

<SwipeCompare
  kicker="What varies, and what is held still"
  before-label="A model benchmark"
  after-label="FlowBench"
  label="A model benchmark varies the model and holds the loop fixed. FlowBench holds the model, tools, task, budget and machine fixed and varies the flow."
>
<template #before>
<table><thead><tr><th>Part of the run</th><th>On a model benchmark</th></tr></thead><tbody><tr><td>Model</td><td><strong>varies</strong></td></tr><tr><td>Loop around it</td><td>one fixed harness, or one turn</td></tr><tr><td>Task length</td><td>minutes</td></tr><tr><td>Score</td><td>often graded by a model</td></tr><tr><td>Reads as</td><td>this vendor beat that vendor</td></tr></tbody></table>
</template>
<template #after>
<table><thead><tr><th>Part of the run</th><th>On FlowBench</th></tr></thead><tbody><tr><td>Model</td><td>held fixed</td></tr><tr><td>Loop around it</td><td><strong>varies: the flow is the variable</strong></td></tr><tr><td>Task length</td><td>hours</td></tr><tr><td>Score</td><td>a check that already existed</td></tr><tr><td>Reads as</td><td>this loop beat that loop</td></tr></tbody></table>
</template>
</SwipeCompare>

## Methodology

<AnimatedDiagram
  view-box="0 0 720 300"
  :min-width="540"
  kicker="One task · three flows · one real check"
  label="FlowBench's method. The model, tools, task, budget and machine are held fixed. Several flows run the same task in the Humanize runtime. Each run is scored by a check that already existed, and the scores are compared flow against flow."
  :steps="[
    'Fix everything but the method: the model, its tools, the task, the budget and the machine.',
    'Run several flows on the same task, unchanged, in the same runtime anybody can install.',
    'Score each run with a check that already existed: it is faster, it compiles, or it passes.',
    'Compare flow with flow. The result reads: this loop beat that loop.',
  ]"
>
  <g data-step="1" data-pop>
    <rect class="ink" x="10" y="40" width="150" height="220" />
    <text class="on-ink t-lg" x="85" y="70" text-anchor="middle">Held fixed</text>
    <text class="on-ink" x="85" y="110" text-anchor="middle">model</text>
    <text class="on-ink" x="85" y="140" text-anchor="middle">tools</text>
    <text class="on-ink" x="85" y="170" text-anchor="middle">task</text>
    <text class="on-ink" x="85" y="200" text-anchor="middle">budget</text>
    <text class="on-ink" x="85" y="230" text-anchor="middle">machine</text>
  </g>
  <path id="fb-a" class="line dash" d="M160 150 C 200 150, 210 70, 250 70 L 460 70 C 500 70, 510 150, 550 150" data-step="2" data-draw />
  <path id="fb-b" class="line dash" d="M160 150 L 550 150" data-step="2" data-draw />
  <path id="fb-c" class="line dash" d="M160 150 C 200 150, 210 230, 250 230 L 460 230 C 500 230, 510 150, 550 150" data-step="2" data-draw />
  <g data-step="2" data-pop>
    <rect class="frame" x="290" y="48" width="130" height="44" />
    <text class="ink" x="355" y="75" text-anchor="middle">ralph_loop</text>
    <rect class="frame" x="290" y="128" width="130" height="44" />
    <text class="ink" x="355" y="155" text-anchor="middle">rlar</text>
    <rect class="frame" x="290" y="208" width="130" height="44" />
    <text class="ink" x="355" y="235" text-anchor="middle">flame_chase</text>
  </g>
  <g data-step="3" data-pop>
    <rect class="red" x="550" y="110" width="160" height="80" />
    <text class="on-red t-lg" x="630" y="146" text-anchor="middle">Real check</text>
    <text class="on-red" x="630" y="170" text-anchor="middle">faster · compiles · passes</text>
  </g>
  <rect class="ink" x="-7" y="-7" width="14" height="14" data-step="3" data-travel="#fb-a" data-loop />
  <rect class="red" x="-7" y="-7" width="14" height="14" data-step="3" data-travel="#fb-b" data-loop />
  <rect class="grey" x="-7" y="-7" width="14" height="14" data-step="3" data-travel="#fb-c" data-loop />
  <text class="ink t-lg" x="630" y="236" text-anchor="middle" data-step="4">flow vs flow</text>
</AnimatedDiagram>

The flows named in the diagram are examples of what is compared, not a published result.

<PostCards numbered>
<PostCard title="The work is long.">

Tasks take hours of agent time, not one turn. Anything a strong model finishes in a single
response says nothing about the loop around it.

</PostCard>
<PostCard title="The score is real.">

Tasks come with checks that already existed: something is faster, or it compiles, or it passes.
Nothing here is graded by a language model.

</PostCard>
<PostCard title="The method is the variable.">

Everything else is held fixed, so a result reads as *this loop beat that loop* rather than
*this vendor beat that vendor*.

</PostCard>
<PostCard title="It runs the real thing.">

Flows are not reimplemented for the benchmark. What is scored is the same flow, in the same
runtime, that anybody can [install and run](/projects/humanize).

</PostCard>
</PostCards>

## Why the flow is worth measuring

FlowBench has no public numbers yet. Our other projects have measured the same thing in
passing, though, and every time the loop moved the score more than anyone would guess. These are
results from those projects, each linked to its source. They are not FlowBench results.

<StatGrid
  lead
  :items="[
    { value: 47, from: 4, kicker: 'Kimi-K3 · PutnamBench, 50 problems', text: 'Its own coding CLI solved 4. Inside a Humanize flow, the same model solved 47.' },
    { value: 68, from: 32, kicker: 'GPT-5.6 Sol · IChO 2026 subquestions', text: 'A plain /goal had 32 of 68 accepted. With formalization and proof review, 68.' },
    { value: 78.2, from: 73.3, decimals: 1, suffix: '%', kicker: 'HMA · MLE-bench any-medal', text: 'The same two models, taking turns. Only the order changed, and it was worth 4.9 points.' },
  ]"
/>

The first is from the Humanize ablation in the [KDA² post](/blog/2026-09-27-kda-for-kda), the
second from [HOA's olympiad write-up](/news/2026-10-05-olympiads), and the third from
[HMA](/projects/hma), whose numbers are self-reported. A benchmark that measured only the model
would have missed all three.

## What it changes for us

FlowBench is why the flows on this site are the flows on this site. A loop we like the sound of
but that loses on the board does not become a default, and does not stay in the
[flowverse](/projects/humanize#the-flows-it-runs). It is a slow way to build a product, and the
only way we know to tell craft from taste.

<div class="card-grid">
  <a class="card" href="/projects/humanize#the-flows-it-runs">
    <span class="kicker">Context</span>
    <h3>Where it sits</h3>
    <p>How the benchmark feeds the flows, and the flows feed the runtime.</p>
  </a>
  <a class="card" href="https://github.com/humanfia/flowverse">
    <span class="kicker">Method</span>
    <h3>What it is scoring ↗</h3>
    <p>The loops themselves: ours, and the ones the field converged on.</p>
  </a>
  <a class="card" href="/news/">
    <span class="kicker">Later</span>
    <h3>When it opens up</h3>
    <p>The release, and the first cross-flow numbers, will be written up here.</p>
  </a>
</div>

## Where it stands

<ProjectTimeline
  kicker="FlowBench · how we got here"
  label="The posts that led to FlowBench: the model, tool and flow comparison in July, the launch, the four layers and a referee in August, and the release, which has not happened yet."
  :entries="[
    { url: '/blog/2026-07-08-model-tool-flow', metric: 'API · CLI · flow' },
    { url: '/blog/2026-07-20-humanfia-launch', metric: 'Launch' },
    { url: '/blog/2026-08-17-four-layers-and-a-referee', metric: 'The referee' },
    { url: '/blog/2026-09-27-kda-for-kda', metric: '4 → 47' },
    { title: 'FlowBench is released, with the first cross-flow numbers', pending: true, metric: 'Not yet', note: 'The first numbers published will be the ones for the flows on this site, whether or not they flatter us.' },
  ]"
/>
