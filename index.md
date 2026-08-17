---
layout: home
title: Humanfia — we build the flow around the agent
titleTemplate: false
# What follows the hero is this site's own sections, not a document: no .vp-doc wrapper.
markdownStyles: false
description: A research team working on long-horizon agent systems — and the results that say whether the flow works, in Lean, in CUDA and on Kaggle.

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
    <p class="hf-eyebrow">the system</p>
    <h2>The projects, and <em>the loop between them</em></h2>
    <p>Where a flow comes from, what runs it, where it is pointed, and who keeps the score.</p>
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
  <p class="hf-note">
    Each of these is reproducible from a public repository. <a href="/results/">The receipts</a>.
  </p>
</section>
