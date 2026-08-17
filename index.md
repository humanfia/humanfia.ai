---
layout: home
title: Humanfia — Agent flows that finish the work
titleTemplate: false

hero:
  name: Humanfia
  text: Agent flows that finish the work
  tagline: We build the runtime, the flows and the benchmark for long-horizon agent work — then point them at problems where being right is checkable. GPU kernels. Olympiad mathematics. Week-long engineering.
  image:
    src: /logo.svg
    alt: Humanfia
  actions:
    - theme: brand
      text: See the stack
      link: /stack/
    - theme: alt
      text: Run humanize
      link: https://hmz.humanfia.ai/
    - theme: alt
      text: What we have shipped
      link: /results/

features:
  - title: humanize — the runtime
    details: Orchestrate, execute and observe. One flow drives many agents across ten coding-agent CLIs, and the whole run is written down as it happens — one timeline you can read afterwards.
    link: /projects/humanize
    linkText: The runtime
  - title: flowverse — the flows
    details: A flow is a directory of Python that says what each agent is asked, in what order, and when to stop. RLAR, Flame Chase, Humanize 1 and the classics, all runnable by name.
    link: /flows/
    linkText: The flows
  - title: flowbench — the referee
    details: Long-horizon tasks, run across every flow, model and effort, scored the same way. It is how we know which loop is actually better rather than newer.
    link: /projects/flowbench
    linkText: In development
  - title: KDA — Kernel Design Agents
    details: Agents that research, implement, profile and iterate on performance-critical CUDA kernels, built with MIT HAN Lab, and pointed at contest and production workloads.
    link: /applications/kda
    linkText: Kernel design
  - title: HOA — Humanize Olympic Agents
    details: All six IMO 2026 problems, machine-checked in Lean 4. 670 of 672 on PutnamBench, ranked first on the official leaderboard. Competition as the hardest honest test of a loop.
    link: /applications/hoa
    linkText: Olympic agents
  - title: Built in public
    details: The runtime, the flows and the reproduction code are Apache-2.0 on GitHub. When we claim a number, we publish what it takes to check it.
    link: https://github.com/humanfia
    linkText: github.com/humanfia
---

## The numbers we lead with

<div class="stat-strip">
  <div><b>6 / 6</b><span>IMO 2026 problems solved, every proof machine-checked in Lean 4</span><em>HOA</em></div>
  <div><b>99.7%</b><span>PutnamBench: 670 of 672 formal statements, ranked #1 on the official leaderboard</span><em>HOA</em></div>
  <div><b>#1–#3</b><span>Track placements at the MLSys 2026 FlashInfer kernel contest, with MIT HAN Lab</span><em>KDA</em></div>
  <div><b>10</b><span>Coding-agent CLIs driven by one runtime, on credentials that never pass through us</span><em>humanize</em></div>
</div>

<p class="footnote">Every one of these is reproducible from a public repository. <a href="/results/">The receipts</a>.</p>

## One picture of the whole thing

Four layers that sit on each other, and a benchmark alongside them that decides what the
middle two should be.

<ArchStack />

[The stack, explained](/stack/) · [The loop that connects them](/stack/loop)

## Why this and not a bigger model

A stronger model writes a better function. It does not, on its own, work for eleven hours,
notice that the third approach was the right one, keep the constraint it was given in round
one, and stop when the job is actually done. That is a property of the loop around the model,
and almost nobody measures it.

So we build the loop, and we measure it. A **flow** is that loop written down as code you can
read, fork and run. A **runtime** makes running it one command over whichever coding agent
you already pay for. A **benchmark** says which flow wins on work that takes a day rather
than a minute. And an **application** is the part that keeps everyone honest — a kernel is
either faster or it is not, and a Lean proof either compiles or it does not.

## Start somewhere

<div class="card-grid">
  <a class="card" href="/stack/">
    <span class="kicker">Architecture</span>
    <h3>How it fits together</h3>
    <p>The four layers, what each one is responsible for, and why the benchmark is a layer rather than a report.</p>
  </a>
  <a class="card" href="/flows/">
    <span class="kicker">Method</span>
    <h3>The flows we wrote</h3>
    <p>RLAR, Flame Chase Loop and Humanize 1 — what each one does differently, and when to reach for it.</p>
  </a>
  <a class="card" href="https://hmz.humanfia.ai/guide/getting-started">
    <span class="kicker">Hands on</span>
    <h3>Run one in ten minutes</h3>
    <p>Install humanize, point it at a repository, and read the whole run back as a timeline.</p>
  </a>
  <a class="card" href="/blog/">
    <span class="kicker">Notes</span>
    <h3>What we are learning</h3>
    <p>Results, post-mortems and the occasional strong opinion about long-horizon agent work.</p>
  </a>
</div>
