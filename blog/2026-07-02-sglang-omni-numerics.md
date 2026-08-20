---
title: "Lossless is a choice: the numerics under SGLang-Omni"
description: A competing stack bought its speed with approximate kernels and skipped steps. Reading their implementation carefully turned into three lossless PRs and 20%+ on our own LTX2.3 baseline.
date: 2026-07-02
authors:
  - Xiangyu Zhang
tag: KDA
---

We spent a while reading another framework's implementation closely, because its published
numbers were better than ours and we wanted to know why.

The answer was that a good deal of the speed was bought. The stack uses agents to build many
Triton fused kernels based on **approximate computation**, and layers a number of
sparsification tricks on top — caching results, skipping certain steps. Each of these is a
legitimate technique. Together, and ungated, they noticeably hurt accuracy: with a slightly
more sensitive prompt, the gap between their output and ours becomes clear.

This is worth naming as a general hazard rather than as a complaint about one project. When an
agent loop is scored on latency and the correctness check is loose, approximation is the path
of least resistance and the loop will find it. It is [reward hacking](/about/#how-we-work) with
a plausible engineering story attached, which is the hardest kind to catch.

## What we did with it

Rather than match the trade, we cherry-picked the optimization opportunities in that analysis
that are **lossless**, and reimplemented them with [KDA-Pilot](https://github.com/BBuf/KDA-Pilot):

- [sgl-project/sglang#29708](https://github.com/sgl-project/sglang/pull/29708)
- [sgl-project/sglang#29390](https://github.com/sgl-project/sglang/pull/29390)
- [sgl-project/sglang#29361](https://github.com/sgl-project/sglang/pull/29361)

Together they improved our LTX2.3 baseline speed on B200 by **more than 20%**, with no accuracy
loss at all.

Where a deviation genuinely is worth having, it should be something the caller asks for — which
is what the [quality tier](/blog/2026-08-06-sglang-diffusion-quality-tiers) turned into a month
later.

[KDA](/projects/kda)
