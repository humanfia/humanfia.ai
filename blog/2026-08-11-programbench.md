---
title: "ProgramBench: 3.5%, against 0.5% and 0%"
description: The same two models that solve 0.5% and 0% of ProgramBench on their own solve 3.5% of it arranged as a builder and a reviewer in a loop — and the curve had not flattened when the clock ran out.
date: 2026-08-11
authors:
  - Zheng Du
tag: Humanize 2
---

::: info Ongoing
Runs are still going and the numbers below are a checkpoint, not a final result.
:::

ProgramBench is hard enough that single-shot numbers are close to the floor, which makes it an
unusually clean instrument for measuring a loop.

| | Solved |
| --- | ---: |
| Opus-4.8, on its own | **0%** |
| GPT-5.5, on its own | **0.5%** |
| Humanize 2 — Opus-4.8 building, GPT-5.5 reviewing | **3.5%** |
| Reported state of the art (Opus-5) | 4.5% |

Two models that solve almost nothing separately solve seven times the better one's share when
they are arranged as a builder and an independent reviewer inside a
[Ralph loop](/projects/humanize#the-flows-it-runs). Across tasks, the loop averages a
**14.2% improvement** over the single-shot baseline.

## The part that bothers us

Performance was still rising at roughly **1.2% per round** in the later rounds when the runs
were cut off.

That is not a result, it is a missing one. The runs are constrained by a four-hour time budget
rather than by having converged, so what we have measured is partly the budget rather than the
method. The honest statement is: this is the number at four hours, the slope at four hours is
positive, and we do not yet know where it goes.

Which is the sort of thing [FlowBench](/projects/flowbench) exists to stop us from guessing at.
