# The loop

<p class="lede">A layered diagram says what sits on what. It does not say why the pieces make
each other better. This page does.</p>

## Four moves that close

<div class="card-grid">
  <div class="card">
    <span class="kicker">01 · Applications set the task</span>
    <h3>Hard work, checkable answers</h3>
    <p>A kernel to make faster on real hardware. A problem whose proof Lean either accepts or rejects. Work that takes hours, where the honest evaluation already exists and nobody has to be asked for an opinion.</p>
  </div>
  <div class="card">
    <span class="kicker">02 · flowbench scores the loops</span>
    <h3>The same task, every way of running it</h3>
    <p>The method is the variable and everything else is held fixed, so what comes out is not a leaderboard of models but a leaderboard of ways to run them.</p>
  </div>
  <div class="card">
    <span class="kicker">03 · The winner ships as a flow</span>
    <h3>A result you can install</h3>
    <p>The loop that won is a directory of Python in a public flowverse, runnable by name. Nobody has to reimplement a paper's method from its figures — <code>-f official/rlar</code> is the method.</p>
  </div>
  <div class="card">
    <span class="kicker">04 · The runtime makes it one command</span>
    <h3>And records what happened</h3>
    <p>Every run of that flow writes down what each agent did and when, so the next question — where did the eleven hours actually go — is read off a timeline rather than guessed at.</p>
  </div>
</div>

And then round again: what the timeline shows is wrong becomes the next flow, which becomes
the next cell in the matrix.

## Why the return arrow is the whole idea

Plenty of people are building agent harnesses. Plenty of people are building agent benchmarks.
Running both, with the benchmark's winner becoming the harness's default, is a different
proposition: it means our opinions about how agents should work have to survive contact with
a score, every time, and the ones that do not survive get deleted.

Three things fall out of that, and they are the reason this is arranged the way it is.

**Methods stop being folklore.** "Start a fresh session every turn" is a well-known trick with
no published effect size. As a flow it is `ralph_loop`; as a row in flowbench it is a number,
against the same task and the same model as everything else.

**Applications are a source of tasks, not just a use of them.** A benchmark built out of a
domain nobody works in decays into a puzzle. Ours are built out of the work we were doing
anyway — the kernels, the proofs, the long refactors — so the score keeps meaning what we
wanted it to mean.

**The runtime earns its features.** A feature that does not change a cell in the matrix is a
feature we do not need. Steering a running turn, moving effort between rounds, giving an agent
its own container: each was added because a flow wanted it and the score moved.

## Where you enter

<div class="card-grid">
  <a class="card" href="https://hmz.humanfia.ai/guide/getting-started">
    <span class="kicker">Use it</span>
    <h3>Run a flow today</h3>
    <p>Install humanize, run one of the flows on a repository of yours, and read the trace back.</p>
  </a>
  <a class="card" href="/flows/">
    <span class="kicker">Fork it</span>
    <h3>Change the method</h3>
    <p>Copy a flow, edit the file, run it. If yours is better, that is a pull request to the flowverse.</p>
  </a>
  <a class="card" href="/results/">
    <span class="kicker">Check it</span>
    <h3>Reproduce a result</h3>
    <p>Every number we publish comes with the repository that produced it and the verifier that checked it.</p>
  </a>
</div>
