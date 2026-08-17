---
description: PutnamBench — 670 of 672 formal statements verified, first place on the official leaderboard, confirmed by the PutnamBench team.
---

# PutnamBench — 670 of 672

<p class="lede">The same approach as IMO 2026, across all 672 formal statements of
PutnamBench: 99.7% verified, and first place on the leaderboard we do not control.</p>

<div class="stat-strip">
  <div><b>670 / 672</b><span>Formal statements verified end to end</span><em>Result</em></div>
  <div><b>#1</b><span>On the official leaderboard, confirmed by the PutnamBench team</span><em>Rank</em></div>
  <div><b>3</b><span>Independent gates a proof had to pass to be counted</span><em>Method</em></div>
</div>

## What counts as solved

A problem counted only if the Lean file passed **every** gate — the Lean kernel, Comparator and
AXLE, all three agreeing. Any one of them alone is a weaker claim, and a proof that satisfies
one checker and not another is exactly the sort of thing a long agentic run produces if nobody
is looking.

The two that are not closed are not closed. They are drawn as such everywhere we show this.

## Check it yourself

The [official leaderboard](https://trishullab.github.io/PutnamBench/leaderboard.html) is
maintained by the PutnamBench team. Re-verification needs the AXLE API, which wants Python 3
and a network connection and nothing else.

[humanfia/putnambench-solver](https://github.com/humanfia/putnambench-solver) ·
[the leaderboard](https://trishullab.github.io/PutnamBench/leaderboard.html) ·
[HOA](/applications/hoa)
