---
description: KDA — Kernel Design Agents. An agent workflow for researching, implementing, profiling and iterating on performance-critical CUDA kernels, built with MIT HAN Lab.
---

# KDA — Kernel Design Agents

<p class="lede">An agent-centric workflow for the one kind of programming where the score is
never in doubt: making a CUDA kernel faster, on real hardware, without making it wrong.</p>

[mit-han-lab/kernel-design-agents](https://github.com/mit-han-lab/kernel-design-agents) ·
built with [MIT HAN Lab](https://hanlab.mit.edu/)

<div class="stat-strip">
  <div><b>#1–#3</b><span>Track placements at the MLSys 2026 FlashInfer kernel contest, by the HAN Lab team</span><em>Contest</em></div>
  <div><b>ncu</b><span>Profiler output read by the agent as evidence, not decoration</span><em>Method</em></div>
  <div><b>Open</b><span>The workflow, the prompts and the skills are public</span><em>Source</em></div>
</div>

## The problem

Kernel work is the worst case for a coding agent and the best case for a good loop.

A change is a one-line edit and a three-hour investigation. The feedback is a number, but the
number is noisy, hardware-specific and easy to fool — a kernel that is faster because it is
now subtly incorrect will happily report a speedup. The search space is enormous and mostly
bad. And the knowledge that separates a good attempt from a hopeless one is exactly the kind
that lives in profiler traces, architecture manuals and other people's kernels rather than in
a docstring.

An agent asked to "optimise this kernel" and left alone will produce something plausible,
report a win, and be wrong. The interesting engineering is entirely in what happens around
that.

## What KDA does about it

**Research before writing.** The agent is given the reference material a human would want —
the profiler skill that turns an `ncu` report into something readable, and a kernel wiki of
techniques and prior art — and is expected to arrive at a plan grounded in the repository and
the hardware rather than in a hunch.

**A contract, before any code.** The objective, the constraints, the validation command and
the criterion for promoting a candidate are written down first. Everything afterwards is
judged against that, which is what stops "it got faster" from quietly replacing "it got faster
and is still correct".

**Small iterations, each verified.** Implement, validate, benchmark, profile, decide. A
candidate is promoted only when it passes the check that was fixed in advance.

**A record that outlives the run.** Candidates, benchmark results, profiling evidence and
promotion decisions are written down as the run goes, so another engineer can see what was
tried, what passed, and why the final one was chosen. On a week-long optimisation this matters
more than any single trick.

## Why it is here

KDA is one of the two places our flows go to be found out. The loop being run is a
[flow](/flows/) like any other, the runtime under it is [humanize](/projects/humanize), and
the score is a wall-clock measurement on somebody else's benchmark.

The HAN Lab team's entries built this way took top-three places on tracks of the MLSys 2026
FlashInfer kernel contest; the evaluation and reproduction code for that is at
[mit-han-lab/mlsys2026-flashinfer-contest](https://github.com/mit-han-lab/mlsys2026-flashinfer-contest).

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
