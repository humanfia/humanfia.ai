---
title: Top three on every track at the MLSys FlashInfer contest
description: KDA-designed kernels placed in the top three on all tracks of the MLSys 2026 FlashInfer contest — 1.4× on FP8 MoE, 33.3× on DSA, 17.6× on GDN.
date: 2026-05-15
authors:
  - Dongyun Zou
tag: KDA
---

Kernels designed with [KDA](/projects/kda) placed in the **top three on every track** of the
MLSys 2026 FlashInfer kernel contest. Speedups over the FlashInfer baseline:

| Track | Speedup |
| --- | ---: |
| FP8 MoE | **1.4×** |
| DSA | **33.3×** |
| GDN | **17.6×** |

A kernel contest is the closest thing to an ideal test for an agent loop. The score is a
wall-clock measurement, the machine belongs to the organizers, the reference implementation is
theirs, and correctness is a gate rather than a matter of interpretation — a kernel that is
faster because it has quietly become incorrect does not place, it fails.

The kernels are published.

[The contest kernels](https://github.com/mit-han-lab/mlsys2026-flashinfer-constest-solution) ·
[the contest](https://github.com/mit-han-lab/mlsys2026-flashinfer-contest) ·
[KDA](/projects/kda)
