---
layout: home
title: Humanfia — we build the flow around the agents
titleTemplate: false
# What follows the hero is this site's own sections, not a document: no .vp-doc wrapper.
markdownStyles: false
description: The runtime, the flows and the benchmark for long-horizon agent work — and the results that say whether the flow works, in Lean, in CUDA and on Kaggle.

hero:
  name: Humanfia
  text: We build the flow around the agents
  image:
    light: /logo.svg
    dark: /logo-dark.svg
    alt: Humanfia
  actions:
    - theme: brand
      text: Humanize 2
      link: /projects/humanize
    - theme: alt
      text: GitHub
      link: https://github.com/humanfia
---

<section class="hf-section hf-tall">
  <header>
    <p class="hf-eyebrow">blog</p>
    <h2>What came back</h2>
    <p>Every number we have published, and what it takes to check it.</p>
  </header>
  <PostMosaic :limit="12" />
  <p class="hf-note">
    <a href="/blog/">All posts</a> · <a href="/blog/feed.rss">RSS</a>
  </p>
</section>

<section class="hf-section hf-screen">
  <header>
    <p class="hf-eyebrow">ecosystem</p>
    <h2>The projects, and <em>the loop between them</em></h2>
  </header>
  <SystemMap fit />
  <div class="mobile-only"><ArchStack /></div>
</section>
