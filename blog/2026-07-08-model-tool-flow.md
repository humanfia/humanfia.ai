---
title: Model level, tool level, flow level
description: The same model, measured three ways — raw API, the vendor's CLI, and the CLI inside a flow — across PutnamBench, Physics Cup, SuperChem and an HLE subset. The flow is worth more than the gap between model generations.
date: 2026-07-08
authors:
  - Zhengyang Zhang
  - Changye Li
tag: Humanize
---

There is a claim we keep making on this site — that the loop around the agent is worth a large
multiple on hard work — and it is the kind of claim that is easy to assert and annoying to
measure. This is the cleanest version of the measurement we have.

One model. Three ways of running it. Four benchmarks.

| | PutnamBench | Physics Cup | SuperChem | HLE subset |
| --- | ---: | ---: | ---: | ---: |
| **Model level** — the GPT API, called directly | 2/50 | 22/50 | 47.0% | 29% |
| **Tool level** — the GPT CLI, with its own tools | 18/50 * | 33/50 | 56.8% | 42% |
| **Flow level** — the same CLI, inside Humanize | **50/50** | **40/50** | **62.4%** | **63%** |

<p class="footnote">* Tool level on PutnamBench was measured without the comparator gate.</p>

## Reading the table

**Tools are worth a lot.** Giving the model a shell, a file system and a compiler roughly
doubles it on the formal benchmarks. Nobody disputes this; it is why coding CLIs exist.

**The flow is worth more.** From 18 to 50 on PutnamBench, and from 42% to 63% on the HLE
subset, is not a refinement of the tool-level result. It is a different regime, produced by
holding the model and the tools fixed and changing only who is asked what, in what order, and
when the run is allowed to stop.

**The saturation is informative too.** Physics Cup goes 22 → 33 → 40, a real gain that is
visibly running into something the loop cannot fix. Not every benchmark is loop-limited, and a
method that claimed to help everywhere equally would be describing something other than what it
does.

Humanize is, in the least glamorous sense available, a model-ability booster: it does not make
the model smarter, it stops the run from wasting what the model already has.

[The flows](https://github.com/humanfia/flowverse) ·
[the runtime](https://docs.humanfia.ai/humanize2/)
