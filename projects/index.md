---
description: Everything Humanfia builds, in one list — Humanize, the RLCR Loop, FlowBench, HOA, KDA and AgentKaggle.
---

# Projects

<p class="lede">Six things, one list. One runtime, the loop it grew out of, a referee, and three
places we point the flows to find out whether they are any good. They are not two categories of
project; they are one loop, and the order below is the order it runs in.</p>

<div class="card-grid">
  <a class="card" href="/projects/humanize">
    <span class="kicker">The runtime</span>
    <h3>Humanize</h3>
    <p>Orchestrate, execute and observe agent flows across ten coding-agent CLIs. It drives the agent you already log into, holds no API key, and writes the whole run down as a timeline.</p>
  </a>
  <a class="card" href="/projects/rlcr-loop">
    <span class="kicker">Where it started</span>
    <h3>RLCR Loop</h3>
    <p>The original Humanize, and still a plugin you can install today: Claude implements, Codex reviews with no memory of how the work was arrived at, and each round feeds the findings into the next until the acceptance criteria are met.</p>
  </a>
  <a class="card" href="/projects/flowbench">
    <span class="kicker">The referee</span>
    <h3>FlowBench</h3>
    <p>The benchmark that scores flows against each other on work that takes a day rather than a minute. The flow that wins becomes a default; the flow that loses is deleted, including ours. In development.</p>
  </a>
  <a class="card" href="/projects/hoa">
    <span class="kicker">Applied</span>
    <h3>HOA</h3>
    <p>Olympiad, competition and research mathematics, formally verified. Six of six at IMO 2026, 670 of 672 on PutnamBench, and first place on the Lean-Eval leaderboard.</p>
  </a>
  <a class="card" href="/projects/kda">
    <span class="kicker">Applied</span>
    <h3>KDA</h3>
    <p>Research, implement, profile and iterate on performance-critical kernels. Past human SOTA on every track of the MLSys 2026 FlashInfer contest, and shipping into SGLang in production.</p>
  </a>
  <a class="card" href="/projects/agentkaggle">
    <span class="kicker">Applied</span>
    <h3>AgentKaggle</h3>
    <p>Agents entered in real Kaggle competitions against thousands of humans and a deadline. Nineteen completed competitions, and the two kinds of result never reported as one.</p>
  </a>
</div>

## What runs on what

The runtime is the thing you install. The **flows** are the methods themselves — RLAR, Flame
Chase, the RLCR Loop, the Ralph loop — kept as directories of Python in the
[flowverse](https://docs.humanfia.ai/humanize2/guide/flowverses) rather than compiled into a
binary, so a method is something you can read, fork, publish and beat.

The three applied projects are where a flow stops being our opinion. Every layer below them
can be evaluated with numbers we chose ourselves, and numbers you choose yourself have a way
of going up. A Lean 4 kernel, a contest deadline and a private leaderboard do not care what we
intended.

<ArchStack />

## Why there is no platform-versus-application split

There used to be one on this page, and it was a distinction we cared about and nobody else
did. It also cost something real: the same work appeared in two lists, and the projects that
tell us whether the platform works were filed under "and also".

They are not "and also". The hard tasks in [FlowBench](/projects/flowbench) are work the
applied projects were doing anyway — kernels that had to get faster, proofs that had to close,
a competition that closed on a Thursday — which is the only reason the benchmark keeps
measuring something real instead of drifting into puzzles.

[What the flows have actually done →](/blog/)
