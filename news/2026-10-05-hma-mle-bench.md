---
title: "78.2% medal rate on MLE-bench in six hours, by making two agents take turns"
description: "Two coding agents alternating over one workspace, each starting fresh, beat both of them working alone on 75 MLE-bench tasks: 78.2% any-medal against 72.4% and 68.0%. Self-reported, and not on the official leaderboard."
date: 2026-10-05
authors:
  - Changye Li
tag: HMA
---

Take two strong coding agents. Give each the same machine-learning task and six hours, and
Claude Opus 5 wins a medal on **72.4%** of [MLE-bench](https://github.com/openai/mle-bench)'s
75 Kaggle tasks while GPT-5.6-sol wins one on **68.0%**. Now give them *one* six-hour budget
and make them take turns in the same workspace. Together they medal on **78.2%**.

That is [Humanize MLE Agents (HMA)](https://github.com/humanfia/hma), and the number comes
from its [results table](https://github.com/humanfia/hma#main-results).

| Workflow | Budget | Any medal | Gold | Above human median |
| --- | ---: | ---: | ---: | ---: |
| Claude Opus 5, native `/goal` | 6 h | 72.4% | 50.7% | 85.3% |
| GPT-5.6-sol, native `/goal` | 6 h | 68.0% | 47.6% | 81.3% |
| **HMA: Opus 5 ↔ GPT-5.6-sol** | **6 h** | **78.2%** | **53.8%** | **90.7%** |
| HMA: GPT-5.6-sol ↔ Opus 5 | 6 h | 73.3% | 50.7% | 85.3% |
| HMA: GPT-5.6-sol ↔ DeepSeek V4.1 Flash | 6 h | 72.0% | 50.7% | 85.3% |
| HMA: GPT-5.6-sol ↔ Kimi K3 | 6 h | 70.7% | 50.7% | 85.3% |

Against the mean of its two single-agent runs, the best pairing is **8.0 points** higher on
any-medal rate. Across all six pairings evaluated, the average gain is
[6.4 points](https://github.com/humanfia/hma#results-summary).

## Taking turns, with a clean slate

The arrangement is simple, and almost all of it is about what is *not* carried over:

1. One agent works the task in its own native harness and submits candidate solutions.
2. After at most **five accepted submissions**, it stops. The other agent starts a **fresh
   session** in the same workspace: same code, models and candidates, but none of the first
   agent's context.
3. They alternate until the six hours are nearly up. The last **15 minutes** go to picking one
   of the candidates already accepted. Private test scores are never shown to either agent.

The repository credits [two effects at once](https://github.com/humanfia/hma#figure-1-hma-overview):
**context renewal**, because a long-running agent improves more and more slowly and a fresh
session restarts that curve, and **complementary capabilities**, because the second model
searches differently from the first. The handoff keeps everything the first agent built and drops only its
train of thought.

## What to be careful with

- **Order matters a lot.** The same two models score 78.2% with Opus going first and 73.3%
  with GPT-5.6-sol going first. Choosing the best order after the fact flatters the headline.
  The average over pairings, 6.4 points, is the more conservative figure.
- **This is self-reported, and it is not on the official leaderboard.** The
  [MLE-bench leaderboard](https://github.com/openai/mle-bench#leaderboard) has not reviewed
  these runs, and it has not taken new submissions since April. For scale only, its highest "All" entry today is 64.44%, with a 24-hour budget
  and an older model. Different models, budgets and repeat counts make that a different
  experiment, not a lower bar.
- **The paper is not out yet.** The arXiv link will be
  [added with the paper release](https://github.com/humanfia/hma#citation). Until then, the
  full ablations exist only in the repository's
  [experiment map](https://github.com/humanfia/hma/blob/main/docs/experiments.md).

The whole suite reruns from the repository: the baselines, HMA, and the cap and starting-order
ablations.

[humanfia/hma](https://github.com/humanfia/hma) · [HMA](/projects/hma)
