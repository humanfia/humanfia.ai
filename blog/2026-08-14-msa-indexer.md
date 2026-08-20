---
title: The MSA indexer, 3.3× faster in production
description: KDA 1.5 found the hardware underutilization in the MSA prefill and decode indexers on B300 — a 6.5× geometric mean on prefill, 3.3× on long-context decode, and bitwise-identical output throughout.
date: 2026-08-14
authors:
  - Jiaming Tang
tag: KDA
---

This one is not a contest. It is a kernel in a serving path that somebody is paying for by the
hour, which is a harder test in one specific way: there is no track to win, only a regression
to avoid.

## Prefill

The MSA prefill indexer was severely underutilizing the hardware during long-context serving on
B300. [KDA](/projects/kda) found it and rewrote around it:

- **6.5× geometric mean speedup** across the workloads tested;
- **up to 14×** on the end-of-prefill chunk tails, which is where the underutilization was
  worst and where the shape is least convenient;
- **no regression** anywhere in the set.

The tails are the interesting part. A profile averaged over a run hides them, and a human
optimizing by eye tends to spend the week on the shape in the middle of the histogram. An agent
reading `ncu` output as evidence has no such preference.

## Decode

The MSA decode indexer, used in speculative verification, went **2.9× faster at the TP4
promotion shape** — past the 2.78× theoretical bandwidth band, which means the win is not
bandwidth alone — and **up to 3.3×** on longer contexts.

Accuracy was **bitwise identical** across every tested workload. That is the gate, not a
footnote: a kernel that is faster because it has quietly become incorrect will report a
speedup just as happily as one that is faster because it is better.

[KDA](/projects/kda) · [mit-han-lab/kernel-design-agents](https://github.com/mit-han-lab/kernel-design-agents)
