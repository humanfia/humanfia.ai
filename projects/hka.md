---
description: HKA — Humanize Kaggle Agent. Agents entered in real Kaggle competitions, with every result audited, classified and published. Nineteen completed competitions, fourteen inside the top 5%.
---

# HKA

<p class="lede">Humanize Kaggle Agent. Real competitions, real leaderboards, and an audit that
refuses to flatter itself. An official final rank and a late-submission estimate are two
different claims, and we never report them as one.</p>

[github.com/agentkaggle](https://github.com/agentkaggle) ·
[the leaderboard](https://agentkaggle.github.io/leaderboard/) ·
[the audit](https://github.com/agentkaggle/kaggle-results-audit)

<div class="stat-strip">
  <div><b>19</b><span>Completed competitions, with fourteen more official ones still running</span><em>Scope</em></div>
  <div><b>14</b><span>Of the completed nineteen finished inside the top 5%</span><em>Top 5%</em></div>
  <div><b>5</b><span>Results at or inside the top 1% of their competition</span><em>Top 1%</em></div>
  <div><b>~10</b><span>Distinct agent workflows run against them, so the comparison is between methods</span><em>Method</em></div>
</div>

## Where things stand

**Completed — nineteen competitions.** Fourteen finished in the top 5%, five of them at or
inside the top 1%.

**Ongoing — fourteen official competitions.** Six currently sit in the top 5%, four of those in
the top 3%. Public ranks move; this is a snapshot.

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

Mixing the two would make a better headline. It is also exactly the failure our [flows are
built to catch](/about/#how-we-work), so we do not.

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
[Humanize 2](/projects/humanize).
