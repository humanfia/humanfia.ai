---
description: HOA — Humanize Olympic Agents. All six IMO 2026 problems machine-checked in Lean 4, and 670 of 672 on PutnamBench, ranked first on the official leaderboard.
---

# HOA — Humanize Olympic Agents

<p class="lede">Competition mathematics, solved by agents and checked by a proof assistant.
No rubric, no grader, no benefit of the doubt: Lean 4 either accepts the proof or it does
not.</p>

<div class="stat-strip">
  <div><b>6 / 6</b><span>IMO 2026 problems, every solution formally verified in Lean 4</span><em>IMO 2026</em></div>
  <div><b>99.7%</b><span>PutnamBench: 670 of 672 formal statements, ranked #1 on the official leaderboard</span><em>PutnamBench</em></div>
  <div><b>3.0×</b><span>Faster than the previously reported agentic result on IMO 2026, at less than half the cost</span><em>Efficiency</em></div>
</div>

## IMO 2026: six of six

Running a fully agentic, YOLO-style loop on
[Humanize](/flows/humanize1), we solved all six problems of the 2026 International
Mathematical Olympiad, and every solution is machine-checked in Lean 4 against the formal
statements published by [AxiomMath](https://github.com/AxiomMath/IMO2026).

Times below are **API time** — the time actually spent inside model calls — compared with the
times reported by [AxiomProver](https://github.com/AxiomMath/IMO2026) on the same statements.

| Problem | Humanfia (GPT-5.6) | Humanfia (Kimi-K3) | AxiomProver |
| --- | ---: | ---: | ---: |
| **Total** | **497.7 min** | 1,034.9 min | 1,496 min |
| Q1 | 38.1 min | 87.1 min | **24 min** |
| Q2 | **100.4 min** | 224.3 min | 360 min |
| Q3 | **187.1 min** | 343.7 min | 869 min |
| Q4 | 58.7 min | 75.6 min | **39 min** |
| Q5 | **46.5 min** | 91.9 min | 65 min |
| Q6 | **66.9 min** | 212.4 min | 139 min |

The Kimi-K3 run is a hybrid — a Kimi worker paired with a Codex reviewer — and cost
**$57.70** in total, a 54.7% saving against the GPT-5.6 run's $127.41. That is the part worth
sitting with: two different backends, the same loop, and the cheaper one still closes all six.

Everything is released: the formal statements, both sets of Lean solutions, and the scripts to
reproduce the solving process. Pinned to Lean 4.31.0 and Mathlib.

[humanfia/imo2026](https://github.com/humanfia/imo2026)

## PutnamBench: 670 of 672

The same approach across the whole of PutnamBench — all 672 formal statements — produced 670
verified Lean proofs, a 99.7% pass rate, and **first place on the
[official leaderboard](https://trishullab.github.io/PutnamBench/leaderboard.html)**. The
result has been verified by the PutnamBench team.

| | |
| --- | --- |
| Verified proofs | **670 of 672** |
| Pass rate | **99.7%** |
| Ranking | #1 on the official leaderboard |
| Worker / reviewer model | `gpt-5.5`, reasoning effort `xhigh` |
| Toolchain | Lean 4.27.0, Mathlib pinned |
| Acceptance | Lean kernel, Comparator and AXLE — all three must agree |

A problem counts as solved only when the Lean file passes *every* gate. Candidates that fail
any gate are kept for inspection and are never counted. The fastest way to check us is the
AXLE verification API, which needs Python 3 and a network connection and nothing else — no
Lean, no Mathlib, no model calls, no API key.

At the PutnamBench authors' request the full solution set is not open-sourced; a
[preview of the first twelve](https://huggingface.co/datasets/humanfia-lab/putnambench-solution-preview)
is published for review, and the entire solving pipeline is public.

[humanfia/putnambench-solver](https://github.com/humanfia/putnambench-solver)

## Live competitions

Formal mathematics is the cleanest test but not the only one. We also run these loops on live
Kaggle competitions and publish what comes of it, including the parts that need caveats —
which results are official final ranks, which are late-submission estimates against a frozen
leaderboard, and what a snapshot of an ongoing competition is and is not worth.

[agentkaggle/leaderboard](https://agentkaggle.github.io/leaderboard/) ·
[the audit](https://github.com/agentkaggle/kaggle-results-audit)

## What this is really testing

None of this is a claim that agents are good at mathematics. It is a claim about loops.

The models here are the ones everybody has. What differs is the arrangement around them: who
works and who reviews, what carries between attempts and what is deliberately forgotten, when
a line of attack is abandoned, and how a run of hundreds of hours is kept from going in
circles. A formal verifier is the ideal instrument for measuring that, because it removes
every way of being *approximately* right.

The loop used for these runs is [Humanize 1](/flows/humanize1). What we learned from watching
it run for weeks is most of why [RLAR](/flows/rlar) and the rest of the
[flowverse](/projects/flowverse) look the way they do.
