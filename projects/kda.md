---
description: KDA — Kernel Design Agents. An agent workflow for researching, implementing, profiling and iterating on performance-critical kernels, built with MIT HAN Lab and shipping into production serving stacks.
---

# KDA

<p class="lede">Kernel Design Agents. An agent-centric workflow for the one kind of
programming where the score is never in doubt: making a kernel faster, on real hardware, without making it wrong.</p>

[mit-han-lab/kernel-design-agents](https://github.com/mit-han-lab/kernel-design-agents) ·
[KDA-Pilot](https://github.com/BBuf/KDA-Pilot) ·
built with [MIT HAN Lab](https://hanlab.mit.edu/)

<div class="stat-strip">
  <div><b>1.25–1.39×</b><span>Past the best human entries on every track of the MLSys 2026 FlashInfer contest</span><em>Contest</em></div>
  <div><b>40+</b><span>Operators optimized and merged upstream into SGLang</span><em>In production</em></div>
  <div><b>53</b><span>First-place SOL Bench rankings, generated on one node in about a week</span><em>At scale</em></div>
  <div><b>Open</b><span>The workflow, the prompts and the skills are public</span><em>Source</em></div>
</div>

## What it has done

| | Result | Written up |
| --- | --- | --- |
| **MSA indexer, in production** | 6.5× geomean on prefill, 3.3× on long-context decode, bitwise identical | [26-08-14](/blog/2026-08-14-msa-indexer) |
| **MLSys 2026 FlashInfer** | Past human SOTA on all three tracks, 1.25–1.39× | [26-08-02](/blog/2026-08-02-kda-15-past-human-sota) · [26-05-15](/blog/2026-05-15-mlsys-flashinfer-top3) |
| **SGLang-Diffusion** | A quality tier, so a bf16-order-changing fusion can ship at all | [26-08-06](/blog/2026-08-06-sglang-diffusion-quality-tiers) |
| **SOLExec Bench** | First on the L1 single-operation track, and 53 firsts in batch | [26-07-02](/blog/2026-07-02-solexec-l1) · [26-06-22](/blog/2026-06-22-sol-bench-batch) |
| **SGLang, upstream** | More than forty operators merged, with the numbers attached | [26-06-05](/blog/2026-06-05-kda-sglang) · [26-07-02](/blog/2026-07-02-sglang-omni-numerics) |
| **Other hardware** | ASM, HIP and ROCm — it works where the corpus is thin | [26-06-15](/blog/2026-06-15-kda-generalizes) |

## The problem

Kernel work is the worst case for a coding agent and the best case for a good loop.

A change is a one-line edit and a three-hour investigation. The feedback is a number, but the
number is noisy, hardware-specific and easy to fool — a kernel that is faster because it is now
subtly incorrect will happily report a speedup. The search space is enormous and mostly bad.
And the knowledge that separates a good attempt from a hopeless one is exactly the kind that
lives in profiler traces, architecture manuals and other people's kernels rather than in a
docstring.

An agent asked to "optimise this kernel" and left alone will produce something plausible,
report a win, and be wrong. The interesting engineering is entirely in what happens around that.

## What KDA does about it

**Research before writing.** The agent is given the reference material a human would want — the
profiler skill that turns an `ncu` report into something readable, and a kernel wiki of
techniques and prior art — and is expected to arrive at a plan grounded in the repository and
the hardware rather than in a hunch.

**A contract, before any code.** The objective, the constraints, the validation command and the
criterion for promoting a candidate are written down first. Everything afterwards is judged
against that, which is what stops "it got faster" from quietly replacing "it got faster and is
still correct".

**Small iterations, each verified.** Implement, validate, benchmark, profile, decide. A
candidate is promoted only when it passes the check that was fixed in advance.

**A record that outlives the run.** Candidates, benchmark results, profiling evidence and
promotion decisions are written down as the run goes, so another engineer can see what was
tried, what passed, and why the final one was chosen. On a week-long optimisation this matters
more than any single trick.

## Why it is here

KDA is one of the places our flows go to be found out. The loop being run is a flow like any
other, the runtime under it is [Humanize 2](/projects/humanize), and the score is a wall-clock
measurement
on somebody else's benchmark — or, increasingly, a pull request that a maintainer who did not
ask for it has to be willing to merge.

## Try it

The workflow is an early research prototype and is under active development — the maintainers
are asking for feedback. It is deliberately independent of any one benchmark harness or
hardware target: a downstream task brings its own evaluator, datasets, profiling tools and
references.

```sh
git clone --recurse-submodules https://github.com/mit-han-lab/kernel-design-agents.git
```

[The repository](https://github.com/mit-han-lab/kernel-design-agents) has the agent flow, the
prompt templates and the skills.
