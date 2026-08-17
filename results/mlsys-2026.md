---
description: MLSys 2026 FlashInfer kernel contest — first, second and third on tracks of the contest, with MIT HAN Lab.
---

# MLSys 2026 FlashInfer kernel contest

<p class="lede">Kernels designed with the [KDA](/applications/kda) workflow, by the MIT HAN Lab
team, took top-three placements on tracks of the contest. The contest is the referee, on its
own hardware and against its own reference implementation.</p>

<div class="stat-strip">
  <div><b>#1–#3</b><span>Track placements at the contest</span><em>Result</em></div>
  <div><b>ncu</b><span>Profiler output read by the agent as evidence, not decoration</span><em>Method</em></div>
  <div><b>Public</b><span>The evaluation and reproduction code, and the workflow itself</span><em>Source</em></div>
</div>

## Why a kernel contest is a good test

A kernel is either faster or it is not, and the machine that decides is not ours. It is also
the failure mode we care about most: a kernel that is faster because it has quietly become
incorrect will happily report a speedup, so correctness has to be a gate rather than a hope.

What is published is the placement, not a per-kernel speedup — so that is what we claim.

## Check it yourself

The contest repository has the evaluation harness and the reproduction code, and the agent
workflow that produced the kernels is public too.

[mit-han-lab/mlsys2026-flashinfer-contest](https://github.com/mit-han-lab/mlsys2026-flashinfer-contest) ·
[mit-han-lab/kernel-design-agents](https://github.com/mit-han-lab/kernel-design-agents) ·
[KDA](/applications/kda)
