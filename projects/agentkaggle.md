---
description: AgentKaggle — agents entered in real Kaggle competitions, with every result audited, classified and published. Nineteen completed competitions, fourteen inside the top 5%.
---

# AgentKaggle

<p class="lede">Real competitions, real leaderboards, and an audit that refuses to flatter
itself. An official final rank and a late-submission estimate are two different claims, and
they are never reported as one.</p>

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
the top 3%. Public ranks move; these are a snapshot.

For comparison, Codex on GPT-5.5 at `xhigh` reasoning effort generally peaked around the top-5%
level across most of the same competitions. Same models, different arrangement.

[The full write-up →](/blog/2026-08-15-kaggle-nineteen-competitions)

## What the two words mean

This is the part that matters, and the part most write-ups skip.

**Official** means the run was entered before the deadline and holds an exact final position on
the Kaggle leaderboard.

**Late** means only the score is real. The submission was made after the competition closed,
scored by Kaggle, and then placed against the frozen final board to estimate where it would
have landed. Several of these sit at the very top — and none of them is a rank, a medal, or
evidence of having competed. They are an estimate of score strength and are labelled as one
everywhere they appear.

Mixing the two would make a much better headline. It would also be the exact failure mode our
[flows are built to catch](/about/#how-we-work), so we do not.

## The audit

Every number above comes from
[agentkaggle/kaggle-results-audit](https://github.com/agentkaggle/kaggle-results-audit), which
is a repository rather than a claim:

- **[Completed results](https://github.com/agentkaggle/kaggle-results-audit/tree/main/completed)** —
  each competition, each result classified official or late, each mapped to the session or
  supporting evidence behind it.
- **[Ongoing results](https://github.com/agentkaggle/kaggle-results-audit/tree/main/ongoing)** —
  captured from official public leaderboards with the timestamps recorded. Current public ranks
  are volatile and say so.
- **Coverage and limitations** — scan coverage, failure counts and truncation are reported, so
  a partial result is never dressed up as a complete one. Tracked entrants with no valid result
  are written down too.

The [live leaderboard](https://agentkaggle.github.io/leaderboard/) is regenerated from the
Kaggle API and shows public and private rank and score separately, with the medal zone only
estimated where Kaggle says the competition awards points.

## Why Kaggle

A Kaggle competition is a long-horizon task with an unarguable score, a deadline, and thousands
of humans working the same problem. It is one of the few settings where an agent loop can be
wrong in public.

It also fails in the way we care about most. A model left alone will narrow the validation
split until the number improves, or fit the public leaderboard and fall off the private one.
The private board is the check, and it arrives after everything is already decided.

## What is public, and what is not

The [audit](https://github.com/agentkaggle/kaggle-results-audit) and the
[leaderboard](https://agentkaggle.github.io/leaderboard/) are public repositories, and they are
where every number on this page comes from.

The per-entrant repositories of workflows and sessions are not public. They hold competition
data and account credentials, and several of the competitions are still running. Rather than
link you to a page you cannot open, the audit carries what can be published: for each best
result, the session or supporting evidence it was traced to, and an explicit note where a
result could not be traced to one.

The loops themselves are the flows we write about elsewhere, run on
[Humanize](/projects/humanize).
