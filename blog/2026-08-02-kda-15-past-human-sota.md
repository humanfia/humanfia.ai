---
title: KDA 1.5 goes past human SOTA on every contest track
description: A rerun of the MLSys 2026 FlashInfer kernel contest with CuteDSL support, a profiling skill and a better loop — 1.25× to 1.39× past the best human entries on all three tracks.
date: 2026-08-02
authors:
  - Dongyun Zou
tag: KDA
---

In May, [KDA took top-three placements on every track](/blog/2026-05-15-mlsys-flashinfer-top3)
of the MLSys 2026 FlashInfer kernel contest. That was a good result against the field. It was
not a good result against the field's best entries, which were written by people.

KDA 1.5 changes three things and reruns the contest:

1. **CuteDSL support**, so the agent can express the layouts it wants rather than the ones the
   previous toolchain made convenient;
2. the **IKET profiling skill**, which turns a profiler report into something an agent can
   reason from instead of a wall of counters; and
3. a **better agent loop flow** — the arrangement of who writes, who checks and what carries
   between attempts.

## The rerun

All numbers are speedups over the FlashInfer baseline, on B300.

| Track | KDA 1.0 · 2026-05 | Human SOTA · 2026-05 | KDA 1.5 · 2026-07 | KDA 1.5 over human |
| --- | ---: | ---: | ---: | ---: |
| MoE FP8 block scale | 0.67× | 1.80× | **2.25×** | **1.25×** |
| DSA sparse attention | 11.91× | 22.99× | **29.95×** | **1.30×** |
| GDN prefill | 1.16× | 4.42× | **6.10×** | **1.39×** |

The MoE row is the one worth sitting with. KDA 1.0 was *slower than the baseline* there — 0.67×
— and the same application, with a profiling skill and a different loop, is now past the best
human entry. Nothing about the model changed.

## A workload nobody had tuned

Contest tracks have been optimized by many people, which makes them a fair test and a stale
one. So we also pointed KDA 1.5 at **Flash-KMeans**, which nobody had worked over: balanced
k-means for the Wan 2.2 workload on B200 came back **6.1× faster**.

[KDA](/projects/kda) ·
[the contest kernels](https://github.com/mit-han-lab/mlsys2026-flashinfer-constest-solution)
