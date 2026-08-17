---
description: What Humanfia's agent flows have actually done — IMO 2026, PutnamBench, the MLSys 2026 kernel contest and Kaggle — one page each, with how to check it.
---

# Results

<p class="lede">Numbers somebody else can check. Each was produced by a flow you can read, and
scored by a verifier or a leaderboard we do not control. One page each, because a result and
its caveats belong together rather than in a summary.</p>

<div class="card-grid">
  <a class="card" href="/results/imo-2026">
    <span class="kicker">Formal mathematics</span>
    <h3>IMO 2026 — six of six</h3>
    <p>All six problems, machine-checked in Lean 4. Three times faster than the previously reported agentic result, at less than half the cost.</p>
  </a>
  <a class="card" href="/results/putnambench">
    <span class="kicker">Formal mathematics</span>
    <h3>PutnamBench — 670 of 672</h3>
    <p>99.7% verified and first on the official leaderboard, with three independent checkers having to agree before a proof counted.</p>
  </a>
  <a class="card" href="/results/mlsys-2026">
    <span class="kicker">Systems performance</span>
    <h3>MLSys 2026 kernel contest</h3>
    <p>First, second and third on tracks of the FlashInfer contest, with MIT HAN Lab, on the contest's own hardware.</p>
  </a>
  <a class="card" href="/results/kaggle">
    <span class="kicker">Live competition</span>
    <h3>Kaggle — thirteen competitions</h3>
    <p>Sixteen official final ranks and thirty-three late-submission estimates, audited in public and never mixed together.</p>
  </a>
</div>

## Check it yourself

We would rather be checked than believed, so every claim comes with the thing that produced it.
Each page above ends with how to re-run it; this is the short version.

| Claim | How to check it |
| --- | --- |
| [IMO 2026, 6/6](/results/imo-2026) | Clone [humanfia/imo2026](https://github.com/humanfia/imo2026) and run the AXLE verification script against the published Lean solutions. |
| [PutnamBench, 99.7%](/results/putnambench) | The [official leaderboard](https://trishullab.github.io/PutnamBench/leaderboard.html), plus the AXLE API, which needs Python 3 and a network connection and nothing else. |
| [Kernel contest placements](/results/mlsys-2026) | [The contest repository](https://github.com/mit-han-lab/mlsys2026-flashinfer-contest) has the evaluation and reproduction code. |
| [Kaggle results](/results/kaggle) | [The audit](https://github.com/agentkaggle/kaggle-results-audit) states its snapshot times, its exclusions, and what each figure is not. |

::: info On what these results do and do not show
None of this says agents are good at mathematics or at kernels. It says that the *arrangement*
around an agent — who works, who reviews, what is remembered, what is deliberately forgotten,
when to stop — is worth a large multiple on hard work, and that the multiple can be measured by
people who are not us. That is the claim, and it is the reason
[FlowBench](/projects/flowbench) exists.
:::
