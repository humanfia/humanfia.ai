---
description: FlowBench is our benchmark for long-horizon agent work — a way to tell which loop is actually better. In development.
---

# FlowBench

<p class="lede">The referee. FlowBench measures how well an agent stack does work that takes a
day rather than a minute, and it decides which of our own loops survives.</p>

::: info In development
FlowBench is not released yet, so this page is short on detail. When it opens up we will say so
[on the blog](/blog/) and at [github.com/humanfia](https://github.com/humanfia).
:::

## The question it answers

Ask which model is best at coding and a dozen benchmarks will tell you. Ask which *method* is
best — the same model run in a loop that starts fresh every turn, versus one that keeps a
session, versus one with a second agent reading the first one's work — and nobody knows,
because almost nothing measures it.

On work that takes eleven hours, the loop is worth more than the model: a run that converges
and a run that wanders back over hour three differ in what the agent is asked, and when, and by
whom — not in what the model can write. FlowBench measures that difference.

## What makes it different

**The work is long.** Tasks take hours of agent time, not one turn. Anything a strong model
finishes in a single response says nothing about the loop around it.

**The score is real.** Tasks come with checks that already existed: something is faster, or it
compiles, or it passes. Nothing here is graded by a language model.

**The method is the variable.** Everything else is held fixed, so a result reads as *this loop
beat that loop* rather than *this vendor beat that vendor*.

**It runs the real thing.** Flows are not reimplemented for the benchmark. What is scored is
the same flow, in the same runtime, that anybody can install and run.

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
    <p>The loops themselves — ours, and the ones the field converged on.</p>
  </a>
  <a class="card" href="/blog/">
    <span class="kicker">Later</span>
    <h3>When it opens up</h3>
    <p>The release, and the first cross-flow numbers, will be written up here.</p>
  </a>
</div>
