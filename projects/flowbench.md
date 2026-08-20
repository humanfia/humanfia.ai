---
description: FlowBench is our benchmark for long-horizon agent work — a way to tell which loop is actually better. In development.
---

# FlowBench

<p class="lede">The referee. FlowBench measures how well an agent stack does work that takes
a day rather than a minute, and it is how we decide which of our own loops survives.</p>

::: info In development
FlowBench is not released yet, and this page is deliberately short on detail. When it opens
up, it will be announced [on the blog](/blog/) and at
[github.com/humanfia](https://github.com/humanfia).
:::

## The question it exists to answer

Ask which model is best at coding and there are a dozen benchmarks waiting to tell you. Ask
which *method* is best — the same model, run in a loop that starts fresh every turn, versus
one that keeps a session, versus one with a second agent reading the first one's work — and
the honest answer today is that nobody knows, because almost nothing measures it.

That gap is not academic. On work that takes eleven hours, the loop is worth more than the
model: the difference between a run that converges and a run that wanders back over ground it
covered at hour three is not a difference in what the model can write, it is a difference in
what it is being asked, and when, and by whom.

FlowBench measures that difference.

## What makes it different from a coding benchmark

**The work is long.** Tasks are chosen to take hours of agent time, not one turn. Anything a
strong model finishes in a single response tells you nothing about the loop around it.

**The score is real.** Tasks come with checks that already existed — something is faster, or
it compiles, or it passes — rather than a rubric and a model asked to grade. Nothing here is
scored by another language model.

**The method is the variable.** The comparison being drawn is between ways of running agents,
holding everything else fixed, so a result reads as *this loop beat that loop* rather than
*this vendor beat that vendor*.

**It runs the real thing.** Flows are not reimplemented for the benchmark. What is scored is
the same flow, in the same runtime, that anybody can install and run.

## What it changes for us

FlowBench is why the flows on this site are the flows on this site. A loop that we like the
sound of but that loses on the board does not become a default, and does not stay in the
[flowverse](https://docs.humanfia.ai/humanize2/guide/flowverses). It is a slow and slightly humbling way to build a product,
and it is the only way we know of to tell craft from taste.

<div class="card-grid">
  <a class="card" href="/projects/">
    <span class="kicker">Context</span>
    <h3>Where it sits</h3>
    <p>How the benchmark feeds the flows, and the flows feed the runtime.</p>
  </a>
  <a class="card" href="https://docs.humanfia.ai/humanize2/guide/flowverses">
    <span class="kicker">Method</span>
    <h3>What it is scoring</h3>
    <p>The loops themselves — ours, and the ones the field converged on.</p>
  </a>
  <a class="card" href="/blog/">
    <span class="kicker">Later</span>
    <h3>When it opens up</h3>
    <p>The release, and the first cross-flow numbers, will be written up here.</p>
  </a>
</div>
