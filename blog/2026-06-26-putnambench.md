---
title: 670 of 672 on PutnamBench
description: A Ralph loop with Codex as both worker and reviewer closed 99.7% of PutnamBench and every problem in Putnam 2025 — past an EBM-based prover at 99.4% and an autoregressive one at 88.8%.
date: 2026-06-26
authors:
  - Zhengyang Zhang
tag: HOA
---

PutnamBench is 672 formal statements. A Ralph loop running Codex as **both worker and
reviewer** closed **670** of them — 99.7% — including every problem in Putnam 2025.

| | Solved |
| --- | ---: |
| **Humanfia** — Ralph loop, Codex worker and reviewer | **670 / 672 · 99.7%** |
| Logical Intelligence's Aleph, EBM-based | 99.4% |
| Goedel-Architect, autoregressive | 88.8% |

The two that are not closed are not closed. They are drawn as such everywhere we show this.

## Where the turns go

More than **90% of problems are solved within ten turns**. The loop is not, for most of the
benchmark, doing anything exotic — it writes a proof, the compiler objects, it fixes it, and it
is done well inside the budget.

The tail is where the argument is. For the harder problems, the extra multi-turn trials raise
the solve rate measurably: the same worker, given more rounds against the same feedback, closes
problems it did not close in ten. That is the entire thesis of this site stated as an
experiment — the model was capable of the proof the whole time, and what was missing was the
arrangement that let it keep going without wandering.

## Checking it

The [official leaderboard](https://trishullab.github.io/PutnamBench/leaderboard.html) is
maintained by the PutnamBench team. Proof files are published as a dataset, and a
[preview set](https://huggingface.co/datasets/humanfia-lab/putnambench-solution-preview) is
open for review; the full solving pipeline is public.

[humanfia/putnambench-solver](https://github.com/humanfia/putnambench-solver) ·
[HOA](/projects/hoa)
