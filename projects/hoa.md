---
description: HOA — Humanize Olympic Agents. Competition, olympiad and research mathematics solved by agents and machine-checked in Lean 4, plus physics and quantum information formalized end to end.
---

# HOA

<p class="lede">Humanize Olympic Agents. Mathematics, physics and quantum information, solved
by agents and checked by a proof assistant. No rubric, no grader, no benefit of the doubt: Lean 4 either accepts the proof
or it does not.</p>

<div class="stat-strip">
  <div><b>6 / 6</b><span>IMO 2026 problems, every solution formally verified in Lean 4</span><em>IMO 2026</em></div>
  <div><b>670 / 672</b><span>PutnamBench formal statements, 99.7%, past the previous 99.4%</span><em>PutnamBench</em></div>
  <div><b>#1</b><span>Lean-Eval, with 172 research-level problems machine-checked</span><em>Lean-Eval</em></div>
  <div><b>23 / 23</b><span>IPhO 2026 theory subproblems, sorry-free, full lake build passing</span><em>IPhO 2026</em></div>
</div>

## What it has done

| | Result | Written up |
| --- | --- | --- |
| **Lean-Eval** | First place, 172 research-level problems | [26-08-18](/blog/2026-08-18-lean-eval-first) · [26-07-29](/blog/2026-07-29-lean-eval-second) |
| **IMO 2026** | Six of six, on two different backends, 3.2× faster than the reported agentic result | [26-07-22](/blog/2026-07-22-imo-2026) |
| **PutnamBench** | 670 of 672, and every problem in Putnam 2025 | [26-06-26](/blog/2026-06-26-putnambench) |
| **IPhO 2026** | 23 of 23 theory subproblems, sorry-free | [26-07-29](/blog/2026-07-29-physics-and-quantum) |
| **QAlg** | 36 of 36, blind | [26-07-29](/blog/2026-07-29-physics-and-quantum) |
| **QIT** | 37 of 40 end to end, 92.5% | [26-07-29](/blog/2026-07-29-physics-and-quantum) |
| **Physics Cup · SuperChem · HLE** | The model / tool / flow comparison | [26-07-08](/blog/2026-07-08-model-tool-flow) |

## What counts as solved

A problem counts only when the Lean file passes *every* gate. The worker runs a comparator
check on its own output; the reviewer re-verifies independently through the AXLE API, with no
access to how the proof was arrived at; and the Lean kernel has to accept the term. Candidates
that fail any gate are kept for inspection and are never counted.

Nothing is accepted with a `sorry` placeholder or an unproved assumption standing in for a
step. And because a perfectly checked proof of the wrong statement is a real failure mode,
**semantic review** — does this theorem actually say what the problem said — is counted and
reported separately from **proof review**, rather than folded into one number.

## What this is really testing

None of this is a claim that agents are good at mathematics. It is a claim about loops.

The models are the ones everybody has. What differs is the arrangement around them: who works
and who reviews, what carries between attempts and what is deliberately forgotten, when a line
of attack is abandoned, and how a run of hundreds of hours is kept from going in circles. A
formal verifier is the ideal instrument for measuring that, because it removes every way of
being *approximately* right.

The clearest version of the argument is the [model / tool / flow
table](/blog/2026-07-08-model-tool-flow): the same model scores 2 of 50 through the raw API, 18
of 50 through its own CLI, and 50 of 50 inside a flow.

## Where the code is

[humanfia/imo2026](https://github.com/humanfia/imo2026) ·
[humanfia/putnambench-solver](https://github.com/humanfia/putnambench-solver) ·
[humanfia/flowverse](https://github.com/humanfia/flowverse) ·
[IPhO 2026 dataset](https://huggingface.co/datasets/humanfia-lab/IPHO2026)

The loop these runs were built on is the [RLCR Loop](/projects/rlcr-loop). What
we learned from watching it run for weeks is most of why
[RLAR](https://github.com/humanfia/flowverse) and the rest of the
[flowverse](https://docs.humanfia.ai/humanize2/guide/flowverses) look the way they do.
