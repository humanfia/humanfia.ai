---
description: HOA — Humanfia Olympiad Agents. Competition, olympiad and research mathematics solved by agents and machine-checked in Lean 4, plus physics and quantum information formalized end to end.
---

# HOA

<p class="lede">Humanfia Olympiad Agents. Mathematics, physics and quantum information, solved by
agents and checked by a proof assistant. No rubric, no grader, no benefit of the doubt: Lean 4
accepts the proof or it does not.</p>

<div class="stat-strip">
  <div><b>6 / 6</b><span>IMO 2026 problems, every solution formally verified in Lean 4</span><em>IMO 2026</em></div>
  <div><b>672 / 672</b><span>PutnamBench formal statements, 100%, joint first on the official leaderboard</span><em>PutnamBench</em></div>
  <div><b>251</b><span>Lean-Eval problems accepted, more than any other entry on the board</span><em>Lean-Eval</em></div>
  <div><b>23 / 23</b><span>IPhO 2026 theory subproblems, sorry-free, full lake build passing</span><em>IPhO 2026</em></div>
</div>

## What it has done

| | Result | Written up |
| --- | --- | --- |
| **Lean-Eval** | 251 problems accepted, the most of any entry; on the v1 set, first by first solves and second by total, 79 of 128 | [26-08-18](/news/2026-08-18-lean-eval-first) · [26-07-29](/news/2026-07-29-lean-eval-second) |
| **IMO 2026** | Six of six, on two different backends, 3.2× faster than the reported agentic result | [26-07-22](/news/2026-07-22-imo-2026) |
| **PutnamBench** | 672 of 672, joint first on the official leaderboard (670 at the June write-up), and every problem in Putnam 2025 | [26-06-26](/news/2026-06-26-putnambench) |
| **IPhO 2026** | 23 of 23 theory subproblems, sorry-free; 30 of 30 theory points by our own grading | [26-07-29](/news/2026-07-29-physics-and-quantum) |
| **QAlg** | 36 of 36, blind | [26-07-29](/news/2026-07-29-physics-and-quantum) |
| **QIT** | 40 of 40 end to end (37 of 40 at the July write-up) | [26-07-29](/news/2026-07-29-physics-and-quantum) |
| **Physics Cup · SuperChem · HLE** | The model / tool / flow comparison | [26-07-08](/blog/2026-07-08-model-tool-flow) |

## What counts as solved

A problem counts only when the Lean file passes every gate. The worker runs a comparator check
on its own output; the reviewer re-verifies independently through the AXLE API, with no access
to how the proof was reached; and the Lean kernel has to accept the term. Candidates that fail
any gate are kept for inspection and never counted.

Nothing is accepted with a `sorry` placeholder or an unproved assumption standing in for a
step. A perfectly checked proof of the wrong statement is still a failure, so **semantic
review** — does this theorem say what the problem said — is counted and reported separately
from **proof review**.

## What this is really testing

None of this claims agents are good at mathematics. It is a claim about loops.

The models are the ones everybody has. What differs is the arrangement around them: who works
and who reviews, what carries between attempts and what is deliberately forgotten, when a line
of attack is abandoned, and how a run of hundreds of hours is kept from going in circles. A
formal verifier is the right instrument for measuring that, because it removes every way of
being *approximately* right.

The clearest version of the argument is the [model / tool / flow
table](/blog/2026-07-08-model-tool-flow): the same model scores 2 of 50 through the raw API, 18
of 50 through its own CLI, and 50 of 50 inside a flow.

## Where the code is

All of HOA is one repository, [humanfia/hoa-qed](https://github.com/humanfia/hoa-qed). Each
competition or library is a directory in it, with its own README and its history intact:

| Directory | What is in it |
| --- | --- |
| [`putnambench/`](https://github.com/humanfia/hoa-qed/tree/main/putnambench) | PutnamBench: the solver, the pinned statements and the scripts that re-run it |
| [`imo2026/`](https://github.com/humanfia/hoa-qed/tree/main/imo2026) | IMO 2026: formal statements, Lean solutions and the scripts that reproduce them |
| [`ioi2026/`](https://github.com/humanfia/hoa-qed/tree/main/ioi2026) | IOI 2026 |
| [`ipho2026/`](https://github.com/humanfia/hoa-qed/tree/main/ipho2026) | IPhO 2026 |
| [`icho2026/`](https://github.com/humanfia/hoa-qed/tree/main/icho2026) | IChO 2026 |
| [`ibo2024/`](https://github.com/humanfia/hoa-qed/tree/main/ibo2024) | IBO 2024 |
| [`chemlib/`](https://github.com/humanfia/hoa-qed/tree/main/chemlib) | Chemlib, a Lean 4 library for mathematical chemistry |
| [`lean-qit-qlg/`](https://github.com/humanfia/hoa-qed/tree/main/lean-qit-qlg) | QAlg and QIT: Lean formalizations and proofs |

The flows the runs used are in [humanfia/flowverse](https://github.com/humanfia/flowverse); the
proofs are also published as datasets, for example the
[IPhO 2026 dataset](https://huggingface.co/datasets/humanfia-lab/IPHO2026).

These runs are flows on [Humanize](/projects/humanize): PutnamBench is a Ralph loop with Codex
as both worker and reviewer, and Lean-Eval is refined against the compiler by HOA's agents and
the [humanize1](/flows/humanize1) flow's plan-then-review loop. Watching them run for weeks is
most of why [RLAR](/projects/humanize#the-flows-it-runs) and the rest of the
[flows](/flows/) look the way they do.
