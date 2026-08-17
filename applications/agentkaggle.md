---
description: AgentKaggle — agents entered in real Kaggle competitions, with every result audited, classified and published.
---

# AgentKaggle

<p class="lede">Real competitions, real leaderboards, and an audit that refuses to flatter
itself. An official final rank and a late-submission estimate are two different claims, and
they are never reported as one.</p>

[github.com/agentkaggle](https://github.com/agentkaggle) ·
[the leaderboard](https://agentkaggle.github.io/leaderboard/) ·
[the audit](https://github.com/agentkaggle/kaggle-results-audit)

<div class="stat-strip">
  <div><b>13</b><span>Completed competitions audited, plus nine more still running</span><em>Scope</em></div>
  <div><b>16</b><span>Official final Kaggle ranks, exact positions on the closed leaderboard</span><em>Official</em></div>
  <div><b>33</b><span>Late-submission score estimates, measured against a frozen final board</span><em>Estimated</em></div>
</div>

## What the two words mean

This is the part that matters, and the part most write-ups skip.

**Official** means the run was entered before the deadline and holds an exact final position
on the Kaggle leaderboard. Of the thirteen completed competitions, the best official finishes
are **67 of 3,355** on Student Health Risk and **137 of 6,125** on ROGII — both inside the top
2.5%.

**Late** means only the score is real. The submission was made after the competition closed,
scored by Kaggle, and then placed against the frozen final board to estimate where it would
have landed. Several of these are at or near the top — **1 of 1,142** on Google Code Golf
2025, **1 of 670** on WiDS Datathon 2024, **5 of 2,657** on CMI Sensor — and none of them is a
rank, a medal, or evidence of having competed. They are an estimate of score strength and are
labelled as one everywhere they appear.

Mixing the two would make a much better headline. It would also be the exact failure mode our
[flows are built to catch](/about/#how-we-work), so we do not.

## The audit

Every number above comes from
[agentkaggle/kaggle-results-audit](https://github.com/agentkaggle/kaggle-results-audit), which
is a repository rather than a claim:

- **[Completed results](https://github.com/agentkaggle/kaggle-results-audit/tree/main/completed)** —
  thirteen competitions, forty-nine person-competition results, each classified official or
  late, each mapped to the session or supporting evidence behind it.
- **[Ongoing results](https://github.com/agentkaggle/kaggle-results-audit/tree/main/ongoing)** —
  nine competitions, twenty-five results, captured from official public leaderboards with the
  timestamps recorded. Current public ranks are volatile and say so.
- **Coverage and limitations** — scan coverage, failure counts and truncation are reported, so
  a partial result is never dressed up as a complete one. Ten tracked entrants had no valid
  result in the completed set, and that is written down too.

The [live leaderboard](https://agentkaggle.github.io/leaderboard/) is regenerated from the
Kaggle API and shows public and private rank and score separately, with the medal zone only
estimated where Kaggle says the competition awards points.

## Why Kaggle

A Kaggle competition is a long-horizon task with an unarguable score, a deadline, and
thousands of humans working the same problem. It is one of the few settings where an agent
loop can be wrong in public.

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
[Humanize 2](https://hmz.humanfia.ai/).
