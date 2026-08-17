---
description: What Humanfia's agent flows have actually done — IMO 2026, PutnamBench, the MLSys 2026 kernel contest — and how to check each one yourself.
---

# Results

<p class="lede">Numbers somebody else can check. Each of these was produced by a flow you can
install, run by a runtime that is open source, and scored by a verifier or a leaderboard we do
not control.</p>

<div class="stat-strip">
  <div><b>6 / 6</b><span>IMO 2026, every proof machine-checked in Lean 4</span><em>2026</em></div>
  <div><b>99.7%</b><span>PutnamBench, 670 of 672 — #1 on the official leaderboard</span><em>2026</em></div>
  <div><b>#1–#3</b><span>MLSys 2026 FlashInfer kernel contest track placements, with MIT HAN Lab</span><em>2026</em></div>
  <div><b>1.4k★</b><span>On the original Humanize plugin, before any of this had a website</span><em>Open source</em></div>
</div>

## Formal mathematics

### IMO 2026 — all six problems

A fully agentic run on the [Humanize 1](/flows/humanize1) loop solved all six problems of the
2026 International Mathematical Olympiad. Every solution is machine-checked in Lean 4 against
the formal statements published by AxiomMath.

- **497.7 minutes** of API time for the GPT-5.6 run — 3.0× faster than the previously
  reported agentic result on the same statements.
- **$57.70** for the Kimi-K3 hybrid run, a 54.7% saving, still six for six.
- Statements, both sets of Lean solutions and the reproduction scripts are all released.

[humanfia/imo2026](https://github.com/humanfia/imo2026) · [the per-problem
table](/applications/hoa#imo-2026-six-of-six)

### PutnamBench — 670 of 672, ranked #1

The same approach across all 672 formal statements: **99.7%** verified, **first place** on the
[official leaderboard](https://trishullab.github.io/PutnamBench/leaderboard.html), confirmed
by the PutnamBench team. A problem counted only if the Lean file passed every gate — Lean
kernel, Comparator and AXLE, all three agreeing.

[humanfia/putnambench-solver](https://github.com/humanfia/putnambench-solver) ·
[the detail](/applications/hoa#putnambench-670-of-672)

## Systems performance

### MLSys 2026 FlashInfer kernel contest

Kernels designed with the [KDA](/applications/kda) workflow, by the MIT HAN Lab team, took
top-three placements on tracks of the contest. The evaluation and reproduction code is public.

[mit-han-lab/mlsys2026-flashinfer-contest](https://github.com/mit-han-lab/mlsys2026-flashinfer-contest)
· [mit-han-lab/kernel-design-agents](https://github.com/mit-han-lab/kernel-design-agents)

## Live competition

Agents run on live Kaggle competitions, with the results and their caveats published rather
than summarised: which are official final ranks, which are late-submission estimates against a
frozen leaderboard, and what a snapshot of an ongoing competition is worth.

[The leaderboard](https://agentkaggle.github.io/leaderboard/) ·
[the audit](https://github.com/agentkaggle/kaggle-results-audit)

## Check it yourself

We would rather be checked than believed, so every claim above comes with the thing that
produced it.

| Claim | How to check it |
| --- | --- |
| IMO 2026, 6/6 | Clone [humanfia/imo2026](https://github.com/humanfia/imo2026) and run the AXLE verification script against the published Lean solutions. |
| PutnamBench, 99.7% | The [official leaderboard](https://trishullab.github.io/PutnamBench/leaderboard.html), plus the AXLE API, which needs Python 3 and a network connection and nothing else. |
| Kernel contest placements | [The contest repository](https://github.com/mit-han-lab/mlsys2026-flashinfer-contest) has the evaluation and reproduction code. |
| Kaggle results | [The audit](https://github.com/agentkaggle/kaggle-results-audit) states its snapshot times, its exclusions, and what each figure is not. |
| The flows themselves | `pip install` [humanize](/projects/humanize), then `hmz exec -f official/…` and watch the whole run. |

::: info On what these results do and do not show
None of this says agents are good at mathematics or at kernels. It says that the *arrangement*
around a model — who works, who reviews, what is remembered, what is deliberately forgotten,
when to stop — is worth a large multiple on hard work, and that the multiple can be measured
by people who are not us. That is the claim, and it is the reason
[flowbench](/projects/flowbench) exists.
:::
