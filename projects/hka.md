---
description: HKA — Humanize Kaggle Agent. Agents entered in real Kaggle competitions, with every result audited, classified and published. As of the 2026-08-15 audit, nineteen completed competitions, fourteen inside the top 5% counting late estimates; four entered officially.
---

# HKA

<p class="lede">Humanize Kaggle Agent. Real competitions, real leaderboards, and an audit that
refuses to flatter itself. An official final rank and a late-submission estimate are two
different claims, and we never report them as one.</p>

[github.com/agentkaggle](https://github.com/agentkaggle) ·
[the leaderboard](https://agentkaggle.github.io/leaderboard/) ·
[the audit](https://github.com/agentkaggle/kaggle-results-audit)

<div class="stat-strip">
  <div><b>19</b><span>Completed competitions: four entered officially, fifteen scored late</span><em>Scope</em></div>
  <div><b>14</b><span>Of the nineteen inside the top 5%, official finishes and late estimates together; two official</span><em>Top 5%</em></div>
  <div><b>5</b><span>At or inside the top 1%, every one of them a late estimate</span><em>Top 1%</em></div>
  <div><b>~10</b><span>Distinct agent workflows run against them, so the comparison is between methods</span><em>Method</em></div>
</div>

## Where things stand

**Completed — nineteen competitions.** Fourteen landed in the top 5%, five of them at or
inside the top 1% — counting both kinds of result below. Only four of the nineteen were entered
before the deadline; two of those finished in the top 5%, none in the top 1%. The rest are late
estimates. These counts are the audit's, as of 2026-08-15; the
[live leaderboard](https://agentkaggle.github.io/leaderboard/) has added competitions since and
is not audited.

**Ongoing — fourteen official competitions.** Six currently sit in the top 5%, four of those in
the top 3%. Public ranks move; this is the audit's snapshot of 2026-08-15.

For comparison, Codex on GPT-5.5 at `xhigh` reasoning effort peaked around the top-5% level
across most of the same competitions. Same models, different arrangement.

[The full write-up →](/blog/2026-08-15-kaggle-nineteen-competitions)

## What the two words mean

**Official** means the run was entered before the deadline and holds an exact final position on
the Kaggle leaderboard.

**Late** means only the score is real. The submission went in after the competition closed, was
scored by Kaggle, and was then placed against the frozen final board to estimate where it would
have landed. Several of these sit at the very top, and none of them is a rank, a medal, or
evidence of having competed. They are an estimate of score strength, labelled as one everywhere
they appear.

Adding the two together makes a better headline, which is why every combined count on this
page says so and gives the official count beside it. Reporting a late estimate as a finish is
exactly the failure our [flows are built to catch](/about/#how-we-work).

## The audit

The numbers come from
[agentkaggle/kaggle-results-audit](https://github.com/agentkaggle/kaggle-results-audit), which
is a repository rather than a claim:

- **[Completed results](https://github.com/agentkaggle/kaggle-results-audit/tree/main/completed)** —
  each competition, each result marked official or late, each mapped to the session or evidence
  behind it.
- **[Ongoing results](https://github.com/agentkaggle/kaggle-results-audit/tree/main/ongoing)** —
  captured from official public leaderboards with timestamps. Public ranks are volatile and say
  so.
- **Coverage and limitations** — scan coverage, failure counts and truncation are all reported,
  so a partial result is never dressed up as a complete one. Tracked entrants with no valid
  result are written down too.

The [live leaderboard](https://agentkaggle.github.io/leaderboard/) is regenerated from the
Kaggle API and shows public and private rank and score separately, with the medal zone
estimated only where Kaggle says the competition awards points.

## Why Kaggle

A Kaggle competition is a long-horizon task with an unarguable score, a deadline, and thousands
of humans working the same problem. It is one of the few places an agent loop can be wrong in
public.

It also fails in the way we care about most. A model left alone will narrow the validation
split until the number improves, or fit the public leaderboard and fall off the private one.
The private board is the check, and it arrives after everything is decided.

## What is public, and what is not

The audit and the leaderboard are public. The per-entrant repositories of workflows and
sessions are not: they hold competition data and account credentials, and several of the
competitions are still running. So rather than link you to a page you cannot open, the audit
carries what can be published — for each best result, the session or evidence it was traced to,
and an explicit note where it could not be traced.

The loops themselves are the flows we write about elsewhere, run on
[Humanize](/projects/humanize).
