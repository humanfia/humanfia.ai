---
layout: home
title: Humanfia — we build the flow around the agent
titleTemplate: false
# What follows the hero is this site's own sections, not a document: no .vp-doc wrapper.
markdownStyles: false
description: The runtime, the flows and the benchmark for long-horizon agent work — and the results that say whether the flow works, in Lean, in CUDA and on Kaggle.

hero:
  name: Humanfia
  text: We build the flow around the agent
  image:
    light: /logo.svg
    dark: /logo-dark.svg
    alt: Humanfia
  actions:
    - theme: brand
      text: Humanize 2 — the docs
      link: https://docs.humanfia.ai/humanize2/
    - theme: alt
      text: What we build
      link: /projects/
    - theme: alt
      text: GitHub
      link: https://github.com/humanfia
---

<section class="hf-section">
  <header>
    <p class="hf-eyebrow">news</p>
    <h2>What came back, <em>most recent first</em></h2>
    <p>One result, one post. What was run, who ran it, and the thing somebody else can check it against.</p>
  </header>
  <News />
  <p class="hf-note">
    Everything, newest first: <a href="/blog/">the blog</a> · <a href="/blog/feed.rss">RSS</a>.
  </p>
</section>

<section class="hf-section">
  <header>
    <p class="hf-eyebrow">humanize 2</p>
    <h2>The runtime all of it runs on, <em>installed in one line</em></h2>
    <p>Humanize 2 orchestrates, executes and observes agent flows across ten coding-agent CLIs. It drives the one you already log into — we hold no API key, and neither does it.</p>
  </header>
  <Install />
</section>

<section class="hf-section">
  <header>
    <p class="hf-eyebrow">the system</p>
    <h2>The projects, and <em>the loop between them</em></h2>
    <p>Where a flow comes from, what runs it, where it is pointed, and who keeps the score.</p>
  </header>
  <SystemMap />
  <div class="mobile-only"><ArchStack /></div>
  <div class="hf-paths">
    <a href="/projects/">
      <strong>The projects →</strong>
      <span>The runtime, the referee and the three places the flows are pointed.</span>
    </a>
    <a href="/blog/">
      <strong>The results →</strong>
      <span>Every result we have published, one post each, with its caveats attached.</span>
    </a>
    <a href="/about/">
      <strong>Who we are →</strong>
      <span>The bet, how we work, and how to reach us.</span>
    </a>
    <a href="https://github.com/humanfia">
      <strong>GitHub →</strong>
      <span>The runtime, the flows and the reproduction code. Apache-2.0.</span>
    </a>
  </div>
</section>
