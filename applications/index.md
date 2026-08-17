# Applications

<p class="lede">Two domains where the answer cannot be argued with. A kernel is faster or it
is not. A Lean proof compiles or it does not. We picked them on purpose: an agent loop that
only looks good under a rubric has not been tested.</p>

<div class="card-grid">
  <a class="card" href="/applications/kda">
    <span class="kicker">KDA</span>
    <h3>Kernel Design Agents</h3>
    <p>Research, implement, profile and iterate on performance-critical CUDA kernels. Built with MIT HAN Lab; the team's entries took top-three places on tracks of the MLSys 2026 FlashInfer kernel contest.</p>
  </a>
  <a class="card" href="/applications/hoa">
    <span class="kicker">HOA</span>
    <h3>Humanize Olympic Agents</h3>
    <p>Olympiad and competition mathematics, formally verified. All six IMO 2026 problems in Lean 4, and 670 of 672 on PutnamBench — first on the official leaderboard.</p>
  </a>
</div>

## Why applications are part of the platform

An application is not a demo of the platform. It is the part of the system that tells us the
truth about the platform.

Every layer below it can be evaluated with numbers we chose ourselves, and numbers you choose
yourself have a way of going up. A contest deadline, a formal verifier and a public
leaderboard do not care what we intended. When a flow wins one of those, the claim that it is
a good flow is somebody else's arithmetic.

There is a second reason, less noble and just as important: this is where the hard tasks come
from. The work that goes into [flowbench](/projects/flowbench) is work we were doing anyway —
kernels that had to get faster, proofs that had to close, refactors that took a week — which
is why the benchmark keeps measuring something real instead of drifting into puzzles.

[How the layers fit together →](/stack/)
