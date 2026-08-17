---
layout: home
title: Humanfia — we build the flow around the agent
titleTemplate: false
# What follows the hero is this site's own sections, not a document: no .vp-doc wrapper.
markdownStyles: false
description: A research team working on long-horizon agent systems — and the results that say whether the loop works, in Lean, in CUDA and on Kaggle.

hero:
  name: Humanfia
  text: We build the flow around the agent
  tagline: A research team working on long-horizon agent systems. We only work on problems where being right is checkable, so that the answer to “did it work” is never a matter of opinion.
  image:
    light: /logo.svg
    dark: /logo-dark.svg
    alt: Humanfia
  actions:
    - theme: brand
      text: What we have shipped
      link: /results/
    - theme: alt
      text: Who we are
      link: /about/
    - theme: alt
      text: GitHub
      link: https://github.com/humanfia
---

<section class="hf-section">
  <header>
    <p class="hf-eyebrow">the record</p>
    <h2>Four numbers, <em>all of them checkable</em></h2>
  </header>
  <Numbers />
  <p class="hf-note">
    Every one is reproducible from a public repository. <a href="/results/">The receipts</a>.
  </p>
</section>

<section class="hf-section">
  <header>
    <p class="hf-eyebrow">the system</p>
    <h2>The projects, and <em>the loop between them</em></h2>
    <p>What a flow drives, what we write, where it is pointed, and who keeps the score.</p>
  </header>
  <SystemMap />
</section>

<section class="hf-section">
  <header>
    <p class="hf-eyebrow">the results</p>
    <h2>A proof compiles, a kernel is faster, <em>or a leaderboard says so</em></h2>
    <p>Three places we point the flows, and what came back. Pick one.</p>
  </header>
  <Results />
</section>

<section class="hf-section">
  <div class="hf-paths">
    <a href="/applications/hoa">
      <strong>HOA</strong>
      <span>Humanize Olympic Agents. Olympiad mathematics, machine-checked in Lean 4.</span>
    </a>
    <a href="/applications/kda">
      <strong>KDA</strong>
      <span>Kernel Design Agents. CUDA kernels that are faster on real hardware, with MIT HAN Lab.</span>
    </a>
    <a href="/applications/agentkaggle">
      <strong>AgentKaggle</strong>
      <span>Agents in real Kaggle competitions, with every result audited and published.</span>
    </a>
    <a href="/projects/flowbench">
      <strong>FlowBench</strong>
      <span>The referee. Long-horizon tasks, scored the same way across every loop. Ours included.</span>
    </a>
  </div>
</section>
