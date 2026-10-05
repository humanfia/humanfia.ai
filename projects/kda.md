---
title: "KDA: Kernel Design Agents"
description: An agent workflow that researches, writes, verifies and tunes performance-critical kernels on real hardware, without letting them get wrong on the way. Built with MIT HAN Lab, and shipping into production serving stacks.
layout: post
sidebar: false
tag: KDA

project:
  status: Open research prototype · built with MIT HAN Lab
  links:
    - { text: NVlabs/kda, href: https://github.com/NVlabs/kda }
    - { text: The project site, href: https://nvlabs.github.io/kda/ }
    - { text: KDA-Pilot, href: https://github.com/BBuf/KDA-Pilot }
    - { text: The wishlist, href: https://docs.humanfia.ai/kda-wishlist/ }
  stats:
    - { value: 1.69, from: 1, decimals: 2, suffix: ×, kicker: MLSys 2026 · GDN prefill, text: 'Past the best human entry, as public KDA 0.5 kernels on B200', href: /news/2026-10-05-kda-upstream }
    - { value: 40, suffix: '+', kicker: SGLang, text: 'Agent-optimized operators merged upstream, with the numbers attached', href: /news/2026-06-05-kda-sglang }
    - { value: 6, kicker: SGLang · since August, text: 'More pull requests merged, the best adding 8.73% end to end', href: /news/2026-10-05-kda-upstream }
    - { value: 53, kicker: SOL Bench, text: 'First-place rankings from one 8×B200 node in about a week', href: /news/2026-06-22-sol-bench-batch }
  note: The SOL Bench count is a June snapshot, Humanfia-reported.

hero:
  kicker: KDA² · Kimi Delta Attention on B300
  value: 2.96
  from: 1
  decimals: 2
  suffix: ×
  label: geomean speedup over FlashKDA, with a tenth of its final-state error
  board:
    - { name: KDA + TIRx, score: 2.96, us: true }
    - { name: KDA + CAKE (PTX), score: 2.94, us: true }
    - { name: KDA + CAKE (CuTe), score: 2.85, us: true }
    - { name: FlashKDA, score: 1 }

# MLSys 2026 FlashInfer contest: the public release's own table
# (mit-han-lab/mlsys2026-flashinfer-contest-solution, README "Results"): geomean over the
# official workloads on B200, CUPTI kernel spans, speedup over the FlashInfer baseline.
mlsys:
  - key: gdn
    label: GDN prefill
    max: 12
    rows:
      - { label: GDN prefill, detail: B200 · official workloads, values: { kda01: 1.42, human: 6.06, kda05: 10.36 } }
  - key: moe
    label: MoE FP8
    max: 2
    rows:
      - { label: MoE, detail: FP8 block scale, values: { kda01: 0.67, human: 1.33, kda05: 1.57 } }
  - key: dsa
    label: DSA
    max: 40
    rows:
      - { label: DSA attention, detail: sparse, values: { kda01: 3.51, human: 27.55, kda05: 38.33 } }

# KDA²: the best result over time, from the KDA² post.
timeline:
  dates: ['6/16', '7/21', '7/30', '8/10', '8/14', '8/25', '8/30', '9/1', '9/2', '9/3', '9/4', '9/6', '9/12']
  kda: [[1, 1.61], [2, 1.61], [3, 1.61], [4, 2.45], [5, 2.45], [6, 2.54], [7, 2.56], [8, 2.93], [9, 2.93], [10, 2.93], [11, 2.94], [12, 2.96]]
  cake: [[2, 2.048], [3, 2.048], [4, 2.09], [5, 2.373], [6, 2.373], [7, 2.373], [8, 2.373], [9, 2.373], [10, 2.732], [11, 2.94]]
  int21: [[0, 1.5]]
  milestones:
    - { x: 4, y: 2.45, label: Humanize, detail: 8/14 · KDA 2.45×, tone: red }
    - { x: 6, y: 2.54, label: TIRx, detail: 8/30 · 2.54×, tone: ink }
    - { x: 8, y: 2.93, label: TIRx, detail: 9/2 · 2.93×, tone: ink }
    - { x: 12, y: 2.96, label: TIRx, detail: 9/12 · 2.96×, tone: ink }

# SGLang pull requests since August, from the upstream write-up.
upstream:
  - { pr: '#36865', change: NVFP4 GEMM for Qwen3.x, hw: SM120, kernel: 1.319, e2e: '+8.73% throughput' }
  - { pr: '#38082', change: FP8 skinny GEMM, hw: SM120, e2e: '+0.2% to +4.06%' }
  - { pr: '#41305', change: SANA-Video residual-gate add, hw: H200, kernel: 2.54, e2e: '−1.7% time' }
  - { pr: '#41459', change: LTX-2.3 QK norm + split RoPE, hw: H200, kernel: 2.58, e2e: '−1.0% to −1.2% time' }
  - { pr: '#36845', change: QSA decode, hw: SM121, e2e: a correctness fix }
  - { pr: '#37385', change: KernelBackend.KDA, hw: any, e2e: provenance }
---

KDA works on the one kind of programming where the score is never in doubt: making a kernel
faster on real hardware, without making it wrong. Its kernels are judged by contest harnesses,
by public leaderboards, and by maintainers who did not ask for them and still merged them.

## What it has done

| | Result | Written up |
| --- | --- | --- |
| **KDA², v0.6** | Kimi Delta Attention on B300, 2.96× geomean over FlashKDA at 8,192 tokens, with a tenth of its final-state error | [Sep 27](/blog/2026-09-27-kda-for-kda) |
| **SGLang, upstream** | More than forty operators merged by June, and six more pull requests since August | [Oct 1](/news/2026-10-05-kda-upstream) · [Jun 19](/news/2026-06-05-kda-sglang) |
| **MLSys 2026 FlashInfer** | Past the best human entry on all three tracks: 1.17× to 1.69× as the public KDA 0.5 kernels on B200 (1.25× to 1.39× on B300 in August, under a different protocol) | [Oct 1](/news/2026-10-05-kda-upstream) · [Aug 2](/news/2026-08-02-kda-15-past-human-sota) · [May 15](/news/2026-05-15-mlsys-flashinfer-top3) |
| **MSA indexer, in production** | 6.5× geomean on prefill, up to 3.3× on long-context decode, bitwise identical (Humanfia-reported) | [Aug 14](/news/2026-08-14-msa-indexer) |
| **SGLang-Diffusion** | A quality tier, so a fusion that changes bf16 rounding order can ship at all | [Aug 6](/blog/2026-08-06-sglang-diffusion-quality-tiers) |
| **SOLExec Bench** | First on the L1 single-operation track, 0.7608 against 0.7584 (Humanfia-reported; private on the board) | [Jul 2](/news/2026-07-02-solexec-l1) |
| **SOL Bench** | 53 first-place rankings from one 8×B200 node in about a week (Humanfia-reported) | [Jun 22](/news/2026-06-22-sol-bench-batch) |
| **Other hardware** | ASM, HIP and ROCm, where the documentation is thin; two pull requests in FlyDSL | [Jun 26](/news/2026-06-15-kda-generalizes) |

## The problem

Kernel work is the worst case for a coding agent and the best case for a good loop.

A change is a one-line edit and a three-hour investigation. The feedback is a number, but the
number is noisy, specific to the hardware and easy to fool: a kernel that is faster because it
is now subtly incorrect will happily report a speedup. The search space is enormous and mostly
bad. And what separates a good attempt from a hopeless one lives in profiler traces,
architecture manuals and other people's kernels, not in a docstring.

An agent told to "optimise this kernel" and left alone will produce something plausible,
report a win, and be wrong. The engineering is in what happens around that.

## How the loop works

<AnimatedDiagram
  view-box="0 0 720 300"
  :min-width="540"
  kicker="KDA · one iteration"
  label="The KDA loop: research, a contract written before any code, then implement, validate, benchmark and profile. A candidate that is faster but wrong is refused at validation; one that passes the contract is promoted, and the loop goes round again."
  :steps="[
    'Research first: a profiler skill, a kernel wiki, and the repository itself.',
    'A contract before any code: the objective, the validation command, and the bar for promotion.',
    'Implement, validate, benchmark, profile. Each iteration is small.',
    'A candidate that is faster because it is wrong stops at validation.',
    'One that clears the bar fixed in advance is promoted, and the record says why.',
  ]"
>
  <path id="kda-loop" class="line dash" d="M250 150 L 360 150 L 470 150 L 580 150 L 580 240 L 250 240 Z" data-step="3" data-draw />
  <g data-step="1" data-pop>
    <rect class="ink" x="10" y="40" width="160" height="56" />
    <text class="on-ink t-lg" x="90" y="74" text-anchor="middle">Research</text>
  </g>
  <g data-step="2" data-pop>
    <rect class="frame" x="10" y="122" width="160" height="56" />
    <text class="ink t-lg" x="90" y="156" text-anchor="middle">Contract</text>
  </g>
  <path class="line" d="M90 96 L 90 122" data-step="2" data-draw />
  <path class="line" d="M170 150 L 214 150" data-step="3" data-draw />
  <g data-step="3">
    <rect class="ink" x="214" y="126" width="72" height="48" />
    <text class="on-ink" x="250" y="155" text-anchor="middle">Write</text>
    <rect class="ink" x="324" y="126" width="72" height="48" />
    <text class="on-ink" x="360" y="155" text-anchor="middle">Validate</text>
    <rect class="ink" x="434" y="126" width="72" height="48" />
    <text class="on-ink" x="470" y="155" text-anchor="middle">Bench</text>
    <rect class="ink" x="544" y="126" width="72" height="48" />
    <text class="on-ink" x="580" y="155" text-anchor="middle">Profile</text>
    <text class="ink" x="415" y="266" text-anchor="middle">decide · and go round again</text>
  </g>
  <rect class="grey" x="-8" y="-8" width="16" height="16" data-step="4" data-travel="#kda-loop" data-stop="0.14" />
  <text class="red" x="360" y="112" text-anchor="middle" data-step="4">faster, and wrong: refused</text>
  <g data-step="5" data-pop>
    <rect class="red" x="560" y="30" width="150" height="56" />
    <text class="on-red t-lg" x="635" y="64" text-anchor="middle">Promoted</text>
  </g>
  <path class="line" d="M616 126 L 635 86" data-step="5" data-draw />
  <rect class="red" x="-8" y="-8" width="16" height="16" data-step="5" data-travel="#kda-loop" data-loop />
</AnimatedDiagram>

**Research before writing.** The agent gets the reference material a human would want: a
profiler skill that turns an `ncu` report into something readable, and a kernel wiki of
techniques and prior art. It is expected to come back with a plan grounded in the repository
and the hardware rather than a hunch.

**A contract, before any code.** The objective, the constraints, the validation command and the
bar for promoting a candidate are written down first. Everything after is judged against that,
which is what stops "it got faster" from quietly replacing "it got faster and is still
correct".

**Small iterations, each verified.** Implement, validate, benchmark, profile, decide. A
candidate is promoted only when it passes the check fixed in advance.

**A record that outlives the run.** Candidates, benchmark results, profiling evidence and
promotion decisions are written down as the run goes, so another engineer can see what was
tried, what passed, and why the winner won. On a week-long optimisation that matters more than
any single trick.

## Speedups: past the best human kernels

In May, KDA's kernels placed in the top three on every track of the MLSys 2026 FlashInfer
contest. With CuteDSL, a profiling skill and a better flow, it went past the best human
entries on all three. Those kernels are now public as **KDA 0.5**, with a benchmark that pins
the human winners' own repositories and refuses to run if they are modified.

<BarChart
  kicker="MLSys 2026 FlashInfer · B200 · speedup over the FlashInfer baseline"
  label="MLSys 2026 FlashInfer contest tracks on B200, speedup over the FlashInfer baseline. GDN prefill: KDA 0.1 1.42×, human SOTA 6.06×, KDA 0.5 10.36×. MoE FP8: 0.67×, 1.33×, 1.57×. DSA attention: 3.51×, 27.55×, 38.33×. KDA 0.5 over the best human entry: 1.688×, 1.173×, 1.408×."
  caption="The public release's own table: the geomean over the official workloads, timed as CUPTI kernel spans, which is not how the contest scored. Pick a track, and compare with the best human entry to read KDA 0.5's margin: 1.69× on GDN prefill, 1.17× on MoE, 1.41× on DSA."
  :series="[
    { key: 'kda01', label: 'KDA 0.1 · contest entry', tone: 'grey', hatched: true },
    { key: 'human', label: 'Best human entry', tone: 'ink' },
    { key: 'kda05', label: 'KDA 0.5', tone: 'red' },
  ]"
  :datasets="$frontmatter.mlsys"
  :reference="{ value: 1, label: 'FlashInfer 1.00×' }"
  :baselines="['human']"
  suffix="×"
  :decimals="2"
/>

The MoE track is the one to look at. The original entry was *slower than the baseline* there,
at 0.67×. The same application with a profiling skill and a different loop is now past the best
human entry. The model did not change.

Then KDA was pointed at a kernel it is named after. [KDA²](/blog/2026-09-27-kda-for-kda) is
Kernel Design Agents optimising Kimi Delta Attention, and its best result climbed from 1.61× to
2.96× over FlashKDA in eight weeks:

<LineChart
  kicker="KDA² · best result over time · B300"
  title="From 1.61× to 2.96×"
  label="KDA² best speedup over FlashKDA rises from 1.61× on July 21 to 2.96× on September 12. Humanize flows lift it to 2.45× on August 14; TIRx kernels reach 2.54× on August 30, 2.93× on September 2 and 2.96× on September 12. CAKE reaches 2.94× on September 6."
  :series="[
    { key: 'kda', label: 'KDA best', tone: 'red', data: $frontmatter.timeline.kda, dots: true },
    { key: 'cake', label: 'CAKE', tone: 'ink', data: $frontmatter.timeline.cake, dots: true, dashed: true },
    { key: 'int21', label: 'INT21 reference', tone: 'grey', data: $frontmatter.timeline.int21 },
  ]"
  :x="{ categories: $frontmatter.timeline.dates, label: 'Date' }"
  :y="{ min: 1.4, max: 3.1, ticks: [1.5, 2, 2.5, 3], decimals: 2, tickDecimals: 1, suffix: '×' }"
  :annotations="$frontmatter.timeline.milestones"
  :min-width="560"
  :height="300"
/>

Along the way the agents also produced candidates that clocked 3.28×, 3.57× and 3.74×. Every
one of them was overfitting the verifier. How they cheated, and the six gates that now stop
them, is the [KDA² post](/blog/2026-09-27-kda-for-kda).

## Upstream: kernels a maintainer merged

A contest is scored by a harness we can read. A serving framework is scored by maintainers who
did not ask for the change and will reject it if it is slower on a shape nobody thought of,
harder to maintain, or wrong. More than forty KDA operators were merged into
[SGLang](https://github.com/sgl-project/sglang) by June. These six pull requests have landed
since August:

<ResultsTable
  caption="SGLang pull requests with KDA-written kernels, merged since August 2026"
  :columns="[
    { key: 'pr', label: 'PR' },
    { key: 'change', label: 'What it does' },
    { key: 'hw', label: 'On' },
    { key: 'kernel', label: 'Kernel', suffix: '×', decimals: 2, bar: true },
    { key: 'e2e', label: 'End to end' },
  ]"
  :rows="$frontmatter.upstream"
/>

**A kernel speedup is not a model speedup.** The two diffusion kernels are about 2.5× faster on
their own and save one to two percent of a whole video generation, because they are a small
part of it. Both pull requests report both numbers. **A pull request can also get smaller under
review**: #41305 began with 40 kernel families and merged with one, after every family that
showed a regression, or no end-to-end benefit, was taken out.

One merge did not stay. A KDA backend for Flash-KMeans, measured at 7.31× on a real
LongCat-Video workload, was merged in August and reverted the next day to keep that repository
simple. It is not counted as upstream.

## Why it is here

KDA is one of the places our flows go to be found out. Its first runs planned and built under
review with the Humanize Claude Code plugin, now the [humanize1](/flows/humanize1) flow. KDA²
runs on [Humanize](/projects/humanize) flows. Either way the loop is a flow like any other, and
the score is a wall-clock measurement on somebody else's benchmark, or a pull request a
maintainer has to be willing to merge.

## Try it

KDA is an early research prototype under active development, and the maintainers want
feedback. It is deliberately independent of any one benchmark harness or hardware target: a
task brings its own evaluator, datasets, profiling tools and references.

```sh
git clone --recurse-submodules https://github.com/NVlabs/kda.git
```

[The repository](https://github.com/NVlabs/kda) has the agent flow, the prompt templates and
the skills. Kernels the community wants next, with reproducible definitions and workloads, are
collected in the [KDA wishlist](https://docs.humanfia.ai/kda-wishlist/)
([humanfia/kda-wishlist](https://github.com/humanfia/kda-wishlist)).

## Results, as they came in

<ProjectTimeline
  kicker="KDA · every write-up"
  label="KDA results from May to October 2026: top three on every MLSys track, forty operators in SGLang, speedups on AMD hardware, 53 first places on SOL Bench, lossless SGLang-Omni numerics, first on SOLExec L1, KDA 1.5 past the human entries, quality tiers for diffusion, the MSA indexer, KDA², and six more SGLang pull requests."
  :entries="[
    { url: '/news/2026-05-15-mlsys-flashinfer-top3', metric: 'Top 3 × 3' },
    { url: '/news/2026-06-05-kda-sglang', metric: '40+ ops' },
    { url: '/news/2026-06-15-kda-generalizes', metric: 'ASM · HIP · ROCm' },
    { url: '/news/2026-06-22-sol-bench-batch', metric: '53 × #1' },
    { url: '/blog/2026-07-02-sglang-omni-numerics', metric: '+20%' },
    { url: '/news/2026-07-02-solexec-l1', metric: '#1 · 0.7608' },
    { url: '/news/2026-08-02-kda-15-past-human-sota', metric: '1.25–1.39×' },
    { url: '/blog/2026-08-06-sglang-diffusion-quality-tiers', metric: 'Quality tiers' },
    { url: '/news/2026-08-14-msa-indexer', metric: '6.5×' },
    { url: '/blog/2026-09-27-kda-for-kda', metric: '2.96×' },
    { url: '/news/2026-10-05-kda-upstream', metric: '6 PRs' },
  ]"
/>
