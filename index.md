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
      text: Projects
      link: /projects/
    - theme: alt
      text: GitHub
      link: https://github.com/humanfia
---

<section class="hf-section hf-tall">
  <header>
    <p class="hf-eyebrow">the blog</p>
    <h2>What came back, <em>most recent first</em></h2>
    <p>One result, one post. What was run, who ran it, and the thing somebody else can check it against.</p>
  </header>
  <PostMosaic :limit="12" />
  <p class="hf-note">
    Everything, newest first: <a href="/blog/">the blog</a> · <a href="/blog/feed.rss">RSS</a>.
  </p>
</section>

<section class="hf-section hf-screen">
  <header>
    <p class="hf-eyebrow">ecosystem</p>
    <h2>The projects, and <em>the loop between them</em></h2>
    <p>Where a flow comes from, what runs it, where it is pointed, and who keeps the score.</p>
  </header>
  <SystemMap fit />
  <div class="mobile-only"><ArchStack /></div>
</section>
