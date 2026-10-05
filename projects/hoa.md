---
title: "HOA: Humanfia Olympiad Agents"
description: Competition, olympiad and research mathematics solved by agents and machine-checked in Lean 4, plus physics, chemistry, biology, programming and quantum information. No rubric and no benefit of the doubt. Lean accepts the proof or it does not.
layout: post
sidebar: false
tag: HOA

project:
  status: Open source · Apache-2.0 and CC-BY-4.0
  links:
    - { text: humanfia/hoa-qed, href: https://github.com/humanfia/hoa-qed }
    - { text: The flows, href: /flows/recursive-lean-prover }
    - { text: Datasets, href: https://huggingface.co/humanfia-lab }
  stats:
    - { value: 6, suffix: ' / 6', kicker: IMO 2026, text: 'Every problem solved, every solution verified by Lean 4', href: /news/2026-07-22-imo-2026 }
    - { value: 30, kicker: LeanEval v1, text: 'First solves, the most of any entry, and second on total by one', href: /news/2026-10-05-lean-eval-v1 }
    - { value: 249, kicker: Lean-Eval · all scopes, text: 'Distinct problems with an accepted proof, the most of any entry', href: /news/2026-10-05-lean-eval-v1 }
    - { value: 30, suffix: ' / 30', kicker: IPhO 2026 theory, text: Graded by us against the official marking scheme, href: /news/2026-10-05-olympiads }

hero:
  kicker: PutnamBench · Lean, with answers
  value: 672
  from: 600
  label: of 672 statements proved, joint first on the official leaderboard
  board:
    - { name: Humanfia · GPT-5.6, score: 672, us: true }
    - { name: Aleph Prover, score: 672 }
    - { name: NEAR AI · DeepSeek V4, score: 672 }
    - { name: Forall · Claude Opus 5, score: 672 }
    - { name: Mistral Prover, score: 658 }
    - { name: Goedel-Architect, score: 642 }

# PutnamBench: the official leaderboard data (trishullab/PutnamBench, docs/results.json), Lean
# column with answers given, each team's latest entry.
putnam:
  - { name: Humanfia · GPT-5.6 xhigh, score: 672, us: true, detail: added 2026-08-27 }
  - { name: Aleph Prover (Logical Intelligence), score: 672, detail: added 2026-08-26 }
  - { name: NEAR AI · DeepSeek V4, score: 672, detail: added 2026-09-04 }
  - { name: Forall (Astrio) · Claude Opus 5, score: 672, detail: added 2026-09-24 }
  - { name: Mistral Prover, score: 658, detail: added 2026-09-04 }
  - { name: Goedel-Architect, score: 642, detail: added 2026-07-02 }
  - { name: Leanstral 1.5, score: 588, detail: added 2026-07-19 }
  - { name: Seed-Prover 1.5 (ByteDance), score: 581, detail: added 2025-12-27 }
putnamCost:
  - { entry: Humanfia · GPT-5.6, added: '2026-08-27', cost: 44.5, basis: average, highlight: true }
  - { entry: Aleph Prover, added: '2026-08-26', cost: 74, basis: 'average · maximum $1,468' }
  - { entry: NEAR AI · DeepSeek V4, added: '2026-09-04', cost: 0.17, basis: 'mean · median $0.04' }
  - { entry: Forall · Claude Opus 5, added: '2026-09-24', cost: 3.52, basis: 'mean, actor side only' }

# Lean-Eval: the board's published data (lean-lang.org/eval/site-data/v2), LeanEval v1 scope.
leanEval:
  - { label: Total, detail: problems solved, values: { us: 79, near: 80, axiom: 74 } }
  - { label: First solves, detail: first accepted proof, values: { us: 30, near: 12, axiom: 21 } }
  - { label: Unique, detail: no other solver, values: { us: 1, near: 3, axiom: 3 } }

# IMO 2026: API minutes per problem, from the write-up; AxiomProver's as it reported them.
imo:
  - key: each
    label: Per problem
    max: 900
    rows:
      - { label: Q1, values: { gpt: 33.6, kimi: 77.7, axiom: 24 } }
      - { label: Q2, values: { gpt: 96.2, kimi: 220.2, axiom: 360 } }
      - { label: Q3, detail: the hardest, values: { gpt: 179.4, kimi: 338.4, axiom: 869 } }
      - { label: Q4, values: { gpt: 53.3, kimi: 65.6, axiom: 39 } }
      - { label: Q5, values: { gpt: 42.4, kimi: 86.7, axiom: 65 } }
      - { label: Q6, values: { gpt: 62.7, kimi: 209.0, axiom: 139 } }
  - key: total
    label: Total
    max: 1600
    rows:
      - { label: All six, values: { gpt: 467.6, kimi: 997.6, axiom: 1496 }, total: true }

# The same model, three levels of scaffolding: the Humanize ablation in the KDA² post
# (2026-09-27), the latest measurement of it.
ablation:
  - key: putnam
    label: PutnamBench
    max: 50
    rows:
      - { label: GPT-5.6-sol, values: { api: 3, cli: 46, flow: 50 } }
      - { label: Kimi-K3, values: { api: 1, cli: 4, flow: 47 } }
      - { label: GLM-5.3, values: { api: 0, cli: 2, flow: 25 } }
      - { label: DeepSeek V4 Pro, values: { api: 0, cli: 4, flow: 13 } }
  - key: physics
    label: Physics Cup
    max: 50
    rows:
      - { label: GPT-5.6-sol, values: { api: 31, cli: 41, flow: 44 } }
      - { label: Kimi-K3, values: { api: 35, cli: 37, flow: 42 } }
      - { label: GLM-5.3, values: { api: 24, cli: 34, flow: 40 } }
      - { label: DeepSeek V4 Pro, values: { api: 32, cli: 35, flow: 39 } }
---

The models HOA runs are the ones everybody has. What we change is the loop around them: who
works, who reviews, and what has to pass before anything counts.

## What it has done

| | Result | Written up |
| --- | --- | --- |
| **PutnamBench** | 672 of 672, joint first on the official leaderboard, at $44.50 a problem (670 at the June write-up) | [Aug 27](/news/2026-10-05-putnambench-672) · [Jun 26](/news/2026-06-26-putnambench) |
| **Lean-Eval** | On LeanEval v1, first by first solves (30) and second by total (79 to 80); 170 of 171 on the archive; 249 distinct problems accepted, the most of any entry | [Oct 4](/news/2026-10-05-lean-eval-v1) · [Aug 18](/news/2026-08-18-lean-eval-first) · [Jul 29](/news/2026-07-29-lean-eval-second) |
| **IMO 2026** | Six of six, on two different backends, in 3.2× less API time than AxiomProver's reported run | [Jul 18](/news/2026-07-22-imo-2026) |
| **IPhO 2026** | 30.00 of 30.00 on theory by our own grading; all 41 parts formalized in Lean | [Sep 14](/news/2026-10-05-olympiads) · [Jul 29](/news/2026-07-29-physics-and-quantum) |
| **IChO 2026** | 68 of 68 theory subquestions formalized in Lean, against 32 for the same model without the review loop | [Sep 14](/news/2026-10-05-olympiads) |
| **IOI 2026** | Six of six problems at 100%, judged on Codeforces | [Sep 14](/news/2026-10-05-olympiads) |
| **IBO 2024** | 100 of 100 theory tasks; all 400 true/false verdicts match the official key | [Sep 14](/news/2026-10-05-olympiads) |
| **QIT · QAlg** | 40 of 40 end to end (37 at the July write-up), and 36 of 36 blind | [Sep 14](/news/2026-10-05-olympiads) · [Jul 29](/news/2026-07-29-physics-and-quantum) |

None of the olympiad scores came from an official jury. Each line above means what its
write-up says it means, and each write-up says who did the grading.

## PutnamBench: 672 of 672

PutnamBench is 672 Putnam competition problems stated formally in Lean. In June our worker and
reviewer loop stood at 670. It has since closed the last two, and the PutnamBench team accepted
all 672 ([trishullab/PutnamBench#350](https://github.com/trishullab/PutnamBench/pull/350)). Three
other entries reached 672 within a month of us.

<Leaderboard
  kicker="PutnamBench · Lean, with answers · official leaderboard"
  title="A four-way tie at the top"
  label="PutnamBench official leaderboard, Lean with answers, each team's latest entry: Humanfia, Aleph Prover, NEAR AI and Forall at 672; Mistral Prover 658; Goedel-Architect 642; Leanstral 1.5 588; Seed-Prover 1.5 581."
  caption="Each team's latest entry in the Lean column with answers given, from the leaderboard's published data. Ties share a rank."
  :entries="$frontmatter.putnam"
/>

The benchmark is saturated, so the cost of a proof is now what separates the leaders, and on
cost we are not first. The four teams do not measure cost the same way, so read the column
below as orders of magnitude rather than as a ranking.

<ResultsTable
  caption="Reported cost per problem, the four entries at 672"
  :columns="[
    { key: 'entry', label: 'Entry' },
    { key: 'added', label: 'Added' },
    { key: 'cost', label: 'Per problem', prefix: '$', decimals: 2, bar: true, lowerIsBetter: true },
    { key: 'basis', label: 'As reported' },
  ]"
  :rows="$frontmatter.putnamCost"
  sort="cost"
/>

## Lean-Eval: the most first solves

[Lean-Eval](https://lean-lang.org/eval/) is research-level mathematics: theorems from papers,
stated in Lean. In August our flow was first on its single board with 172. The maintainers have
since frozen **LeanEval v1**, 128 problems, and moved the older ones to an archive of 171. Each
scope now has its own board with three columns, and each column rewards something different.

<BarChart
  orientation="vertical"
  kicker="LeanEval v1 · 128 problems · the board's published data, 5 October 2026"
  label="LeanEval v1, top three entries. Total: NEAR AI 80, Humanfia 79, Axiom Prover 74. First solves: Humanfia 30, Axiom Prover 21, NEAR AI 12. Unique: NEAR AI 3, Axiom Prover 3, Humanfia 1."
  caption="Total counts every problem an entry solved. First solves counts the problems where it had the first accepted proof. Unique counts the problems nobody else has solved. The board sorts by Unique by default."
  :series="[
    { key: 'us', label: 'Humanfia · GPT-5.6', tone: 'red' },
    { key: 'near', label: 'NEAR AI · DeepSeek V4', tone: 'ink' },
    { key: 'axiom', label: 'Axiom Prover', tone: 'grey', hatched: true },
  ]"
  :rows="$frontmatter.leanEval"
  :max="90"
/>

On the archive we have 170 of 171, tied for the most. Across both scopes, **249** distinct
problems carry an accepted Humanfia proof, more than any other entry. We made that count from
the published data. The site itself does not show a combined column.

## IMO 2026: six of six, and where the time went

Two workers, on two different backends, each closed all six problems of the 2026 International
Mathematical Olympiad with proofs Lean accepts. The chart counts **API time**, the time spent
inside model calls, so a slow harness gets no credit for it.

<BarChart
  kicker="IMO 2026 · API minutes per problem · lower is faster"
  label="IMO 2026 API time in minutes. Q1: GPT-5.6 33.6, Kimi-K3 77.7, AxiomProver 24. Q2: 96.2, 220.2, 360. Q3: 179.4, 338.4, 869. Q4: 53.3, 65.6, 39. Q5: 42.4, 86.7, 65. Q6: 62.7, 209.0, 139. Total: 467.6, 997.6, 1,496."
  caption="AxiomProver's times are as it reported them for the same statements. Switch to Total for the whole paper: 467.6 minutes against 1,496, or 3.2× less."
  :series="[
    { key: 'gpt', label: 'Humanfia · GPT-5.6', tone: 'red' },
    { key: 'kimi', label: 'Humanfia · Kimi-K3', tone: 'ink' },
    { key: 'axiom', label: 'AxiomProver', tone: 'grey', hatched: true },
  ]"
  :datasets="$frontmatter.imo"
  suffix=" min"
  :decimals="1"
/>

On Q1 and Q4, the two easiest problems, we lose. On Q3, the hardest, we are almost five times
faster. A loop pays for itself when the problem is long enough for the loop to matter. On a
problem a strong model closes in twenty minutes, the loop is overhead.

## Olympiads at full marks

After IMO, the same open harness took four more olympiads and a quantum benchmark to the top
of their scales. The scales differ, and so do the graders.

<PostCards>
<PostCard kicker="IMO 2026" metric="6 / 6" metric-label="GPT-5.6 and Kimi-K3, separately" badge="Lean 4" title="Every proof accepted by the kernel.">

Formal statements, both sets of Lean solutions and the scripts that reproduce the run are
public, pinned to Lean 4.31.0 and Mathlib.

</PostCard>
<PostCard kicker="IPhO 2026 · theory" metric="30 / 30" metric-label="GPT-5.6 Sol and Kimi K3 Max" badge="Our grading" title="Every theory subpart answered.">

Graded by us against the official solutions and marking scheme, which the workers never saw.
All 41 parts of the formal release are formalized in Lean.

</PostCard>
<PostCard kicker="IChO 2026 · theory" metric="68 / 68" metric-label="subquestions formalized in Lean" badge="Lean + review" title="Formalization coverage, not answer accuracy.">

Lean checks the deductions from the encoded inputs. Two of GPT's targets are conditional, and
the answer scores against the official key are unofficial.

</PostCard>
<PostCard kicker="IOI 2026" metric="6 / 6" metric-label="problems at 100%" badge="Codeforces" title="Judged on Codeforces' hidden tests.">

The repository compiles all six and replays every released example. The verdicts themselves
are not linked publicly.

</PostCard>
<PostCard kicker="IBO 2024 · theory" metric="100 / 100" metric-label="tasks · 400 / 400 verdicts" badge="Official key" title="Agreement with the answer key.">

The practical exams are excluded, and this is the 2024 paper, so it may be in a model's
training data.

</PostCard>
<PostCard kicker="QIT · QAlg" metric="40 / 40" metric-label="QIT end to end · QAlg 36 / 36" badge="Lean" title="Every task proved, no sorry." invert>

Semantic review, which asks whether the statement says what the problem says, is automated
rather than an independent human audit.

</PostCard>
</PostCards>

IChO shows most clearly what the loop adds. The same two models, run as a plain Codex `/goal`
on the same 68 targets, had about half of them accepted.

<BarChart
  kicker="IChO 2026 · theory subquestions accepted, of 68"
  label="IChO 2026 subquestions accepted out of 68. GPT-5.6 Sol: native /goal 32, review loop 68. Kimi-K3: native /goal 31, review loop 68."
  :series="[
    { key: 'goal', label: 'Native /goal', tone: 'grey', hatched: true },
    { key: 'flow', label: 'Formalization and proof review', tone: 'red' },
  ]"
  :rows="[
    { label: 'GPT-5.6 Sol', values: { goal: 32, flow: 68 } },
    { label: 'Kimi-K3', values: { goal: 31, flow: 68 } },
  ]"
  :baselines="['goal']"
  compare="delta"
  :max="68"
/>

## What counts as solved

A problem counts only when its Lean file passes every gate, and the model that wrote the proof
never decides whether it is accepted. On PutnamBench the gates are these: the statement is
byte-identical to the pinned one; there is no `sorry`, `admit`, `axiom` or `native_decide`; the
file compiles against the pinned Lean and Mathlib;
[Comparator](https://github.com/leanprover/comparator) checks the statement and replays the
proof through the Lean kernel; and a separate reviewer, which cannot edit the file, gets
`okay: true` back from the [AXLE](https://axle.axiommath.ai/) API.

<AnimatedDiagram
  view-box="0 0 720 240"
  :min-width="520"
  kicker="Five gates · one way in"
  label="A proof passes five gates: the statement, no sorry, it compiles, Comparator, and an AXLE review. A proof with a sorry is refused at the second gate, one that does not compile at the third, and an honest proof passes all five and is accepted."
  :steps="[
    'The worker hands over a Lean file. It does not get to say whether it is done.',
    'Five gates stand between the file and the count, each run by something other than the worker.',
    'A proof with a sorry in it stops at the second gate.',
    'A proof that does not compile against the pinned Lean stops at the third.',
    'A proof that passes all five is counted. Nothing else is.',
  ]"
>
  <path id="hoa-gates" class="line dash" d="M120 120 L 600 120" data-step="1" data-draw />
  <g data-step="1" data-pop>
    <rect class="ink" x="10" y="88" width="110" height="64" />
    <text class="on-ink t-lg" x="65" y="126" text-anchor="middle">Worker</text>
  </g>
  <g data-step="2">
    <rect class="ink" x="173" y="74" width="14" height="92" />
    <text class="ink" x="180" y="62" text-anchor="middle">Statement</text>
    <rect class="ink" x="263" y="74" width="14" height="92" />
    <text class="ink" x="270" y="190" text-anchor="middle">No sorry</text>
    <rect class="ink" x="353" y="74" width="14" height="92" />
    <text class="ink" x="360" y="62" text-anchor="middle">Compiles</text>
    <rect class="ink" x="443" y="74" width="14" height="92" />
    <text class="ink" x="450" y="190" text-anchor="middle">Comparator</text>
    <rect class="ink" x="533" y="74" width="14" height="92" />
    <text class="ink" x="540" y="62" text-anchor="middle">AXLE review</text>
  </g>
  <rect class="grey" x="-8" y="-8" width="16" height="16" data-step="3" data-travel="#hoa-gates" data-stop="0.28" />
  <rect class="grey" x="-8" y="-8" width="16" height="16" data-step="4" data-travel="#hoa-gates" data-stop="0.465" />
  <g data-step="5" data-pop>
    <rect class="red" x="600" y="88" width="110" height="64" />
    <text class="on-red t-lg" x="655" y="126" text-anchor="middle">Counted</text>
  </g>
  <rect class="red" x="-8" y="-8" width="16" height="16" data-step="5" data-travel="#hoa-gates" data-loop />
  <text class="ink" x="360" y="228" text-anchor="middle" data-step="5">no sorry · no admit · no axiom · no native_decide</text>
</AnimatedDiagram>

Nothing is accepted with a placeholder or an unproved assumption standing in for a step. A
perfectly checked proof of the wrong statement is still a failure, so **semantic review** (does
this theorem say what the problem said?) is counted and reported separately from **proof
review**.

## What this is really testing

None of this claims that agents are good at mathematics. It is a claim about loops.

The models are the ones everybody has. What differs is the arrangement around them: who works
and who reviews, what carries between attempts and what is deliberately forgotten, when a line
of attack is abandoned, and how a run of hundreds of hours is kept from going in circles. A
formal verifier is the right instrument for measuring that, because it removes every way of
being *approximately* right.

<BarChart
  orientation="vertical"
  kicker="Same model · three levels of scaffolding · 50 problems each"
  label="The Humanize ablation. PutnamBench: GPT-5.6-sol 3, 46, 50; Kimi-K3 1, 4, 47; GLM-5.3 0, 2, 25; DeepSeek V4 Pro 0, 4, 13. Physics Cup: GPT-5.6-sol 31, 41, 44; Kimi-K3 35, 37, 42; GLM-5.3 24, 34, 40; DeepSeek V4 Pro 32, 35, 39; through the raw API, a coding CLI and a Humanize flow."
  caption="Four base models through the raw model API, through a coding CLI, and inside a Humanize flow. The small red numbers are gains over the baseline chosen above. From the ablation in the KDA² post, September 2026."
  :series="[
    { key: 'api', label: 'Model API', tone: 'grey', hatched: true },
    { key: 'cli', label: 'Coding CLI', tone: 'ink' },
    { key: 'flow', label: 'Humanize flow', tone: 'red' },
  ]"
  :datasets="$frontmatter.ablation"
  :baselines="['api', 'cli']"
  baseline="api"
  compare="delta"
/>

On PutnamBench, Kimi-K3 goes from 4 of 50 in its CLI to 47 of 50 inside a flow. On Physics Cup
the gains are smaller. Not every benchmark is limited by the loop, and the flow cannot fix what
is not. The [earlier version of this comparison](/blog/2026-07-08-model-tool-flow) adds
SuperChem and an HLE subset.

## Where the code is

All of HOA is one repository, [humanfia/hoa-qed](https://github.com/humanfia/hoa-qed). Each
competition or library is a directory in it, with its own README and its history intact:

| Directory | What is in it |
| --- | --- |
| [`putnambench/`](https://github.com/humanfia/hoa-qed/tree/main/putnambench) | PutnamBench: the solver, the pinned statements and the scripts that re-run it |
| [`imo2026/`](https://github.com/humanfia/hoa-qed/tree/main/imo2026) | IMO 2026: formal statements, Lean solutions and the scripts that reproduce them |
| [`ioi2026/`](https://github.com/humanfia/hoa-qed/tree/main/ioi2026) | IOI 2026: problem packages, submissions and annotated solutions |
| [`ipho2026/`](https://github.com/humanfia/hoa-qed/tree/main/ipho2026) | IPhO 2026: natural-language solutions, grading reports and Lean formalizations |
| [`icho2026/`](https://github.com/humanfia/hoa-qed/tree/main/icho2026) | IChO 2026: Lean formalizations, native `/goal` baselines and grading reports |
| [`ibo2024/`](https://github.com/humanfia/hoa-qed/tree/main/ibo2024) | IBO 2024: worked theory solutions and grading evidence |
| [`chemlib/`](https://github.com/humanfia/hoa-qed/tree/main/chemlib) | Chemlib, a Lean 4 library for mathematical chemistry |
| [`lean-qit-qlg/`](https://github.com/humanfia/hoa-qed/tree/main/lean-qit-qlg) | QAlg and QIT: Lean formalizations and proofs |

The flows the runs used are in [humanfia/flowverse](https://github.com/humanfia/flowverse). The
proofs are also published as datasets, for example the
[IPhO 2026 dataset](https://huggingface.co/datasets/humanfia-lab/IPHO2026). At the PutnamBench
authors' request only a [preview](https://huggingface.co/datasets/humanfia-lab/putnambench-solution-preview)
of those proofs is public.

These runs are flows on [Humanize](/projects/humanize). PutnamBench is a Ralph loop with Codex
as both worker and reviewer. Lean-Eval is refined against the compiler by HOA's agents and the
[RLCR Flow](/flows/humanize1)'s plan-then-review loop. Watching them run for weeks is most
of why [RLAR](/projects/humanize#the-flows-it-runs) and the rest of the [flows](/flows/) look the
way they do.

## Results, as they came in

<ProjectTimeline
  kicker="HOA · every write-up"
  label="HOA results from June to October 2026: 670 of 672 on PutnamBench, the model, tool and flow comparison, six of six at IMO 2026, second and then first on Lean-Eval, IPhO and quantum formalized, 672 of 672 on PutnamBench, the most first solves on LeanEval v1, and five olympiads at full marks."
  :entries="[
    { url: '/news/2026-06-26-putnambench', metric: '670 / 672' },
    { url: '/blog/2026-07-08-model-tool-flow', metric: '50 / 50' },
    { url: '/news/2026-07-22-imo-2026', metric: '6 / 6' },
    { url: '/news/2026-07-29-lean-eval-second', metric: '#2 · 149' },
    { url: '/news/2026-07-29-physics-and-quantum', metric: '23 / 23' },
    { url: '/news/2026-08-18-lean-eval-first', metric: '#1 · 172' },
    { url: '/news/2026-10-05-putnambench-672', metric: '672 / 672' },
    { url: '/news/2026-10-05-lean-eval-v1', metric: '30 first solves' },
    { url: '/news/2026-10-05-olympiads', metric: '5 × full marks' },
  ]"
/>
