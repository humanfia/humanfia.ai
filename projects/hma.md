---
description: HMA — Humanize MLE Agents. Two native coding agents take turns over one shared workspace, each starting fresh. On 75 MLE-bench tasks with a six-hour budget, 78.2% any-medal and 53.8% gold, self-reported while the paper is pending.
---

# HMA

<p class="lede">Humanize MLE Agents. Two native coding agents take turns over one shared
machine-learning workspace, each starting with a fresh context. Each one builds on the other's
code, models and candidate solutions, and together they medal more often than either does
alone.</p>

[humanfia/hma](https://github.com/humanfia/hma) ·
[the flow](/flows/fixed-interrupt-flame-chase) ·
[the write-up](/news/2026-10-05-hma-mle-bench)

<div class="stat-strip">
  <div><b>78.2%</b><span>Any-medal rate on 75 MLE-bench tasks, Opus 5 ↔ GPT-5.6-sol, six-hour budget</span><em>Medal</em></div>
  <div><b>53.8%</b><span>Gold-medal rate on the same 75 tasks</span><em>Gold</em></div>
  <div><b>90.7%</b><span>Of tasks above the human leaderboard median</span><em>Median+</em></div>
  <div><b>89.0</b><span>Mean leaderboard percentile across the tasks</span><em>Percentile</em></div>
</div>

::: warning Self-reported
These numbers come from the [repository's results table](https://github.com/humanfia/hma#main-results).
The paper is not out yet, and the runs are not on the official
[MLE-bench leaderboard](https://github.com/openai/mle-bench#leaderboard), which has not
reviewed them.
:::

## How it works

A long-running agent improves more and more slowly. The harness built around one model also
matters less as the model gets better. HMA does not add a new harness. It coordinates two
agents across sessions instead:

1. The first agent works the task in its own native harness, with its own tools and loop, and
   submits candidate solutions.
2. After at most **five accepted submissions**, or when it stops by itself, the other agent
   starts a **fresh session** in the same workspace. The code, models, evaluated results and
   candidates carry over. The first agent's context does not.
3. The two alternate within a **six-hour** task budget.
4. The last **15 minutes** go to a review that picks one of the candidates already accepted.
   Neither agent ever sees a private test score.

The repository credits two effects. **Context renewal** restarts the improvement curve that a
long session flattens. **Complementary capabilities** help because the second model searches
differently from the first. No task-specific prior knowledge is added. The paper models the
process as a context-reset semi-Markov process.

## Results

All values are percentages over the 75 tasks. "Any medal" is the medal rate over all of them,
"Median+" is the share above the human leaderboard median, and the percentile is the mean of
the task-level leaderboard percentiles.

| Workflow | Budget | Any medal | Gold | Median+ | Mean percentile |
| --- | ---: | ---: | ---: | ---: | ---: |
| Claude Opus 5, native `/goal` | 6 h | 72.4 | 50.7 | 85.3 | 84.8 |
| GPT-5.6-sol, native `/goal` | 6 h | 68.0 | 47.6 | 81.3 | 81.3 |
| ScienceFlow | 24 h | 70.2 | — | — | — |
| MLEvolve | 12 h | 65.3 | 34.7 | 76.0 | — |
| **HMA: Opus 5 ↔ GPT-5.6-sol** | **6 h** | **78.2** | **53.8** | **90.7** | **89.0** |
| HMA: GPT-5.6-sol ↔ Opus 5 | 6 h | 73.3 | 50.7 | 85.3 | 85.4 |
| HMA: GPT-5.6-sol ↔ DeepSeek V4.1 Flash | 6 h | 72.0 | 50.7 | 85.3 | 84.4 |
| HMA: GPT-5.6-sol ↔ Kimi K3 | 6 h | 70.7 | 50.7 | 85.3 | 83.9 |

The best pairing beats the mean of its two single-agent baselines by **8.0 points** of
any-medal rate and **5.9** of mean percentile. Across the six pairings evaluated, the average
gain is **6.4 points**. Use that average when comparing, because the order of the agents
matters a lot. The same two models score 78.2% with Opus first and 73.3% with GPT-5.6-sol
first, so picking the better order afterwards flatters the headline.

## The pairings

Every agent runs in its native harness at `max` reasoning effort. HMA starts with the first
model listed in a pairing.

| Model | Native harness |
| --- | --- |
| Claude Opus 5 | Claude Code |
| GPT-5.6-sol | Codex |
| GLM-5.3 | Claude Code |
| DeepSeek-V4-Flash, V4.1-Flash | DeepSeek Harness |
| Kimi K3 | Kimi Code |

The 75 tasks are 22 low-, 38 medium- and 15 high-complexity MLE-bench tasks. The paper gives
each task one NVIDIA A10, 30 vCPUs and 220 GiB of RAM. The full plan is 27 configurations and
3,397 task-runs. The external harnesses, ML-Master 2.0, MLEvolve and ScienceFlow, are compared
on a fixed 16-task subset.

## Reproduce it, or use it

[humanfia/hma](https://github.com/humanfia/hma) is the paper's experiment code. It contains the
native baselines, HMA, natural-termination alternation, the cap and starting-order ablations,
and the external harness comparisons. You can run one experiment on one machine or the whole
suite on 75 machines, and generate the tables and figures from the runs. Its
[validation record](https://github.com/humanfia/hma/blob/main/docs/verification.md) lists what
has and has not been checked. For example, the rerun setup still uses the public upstream
answer keys rather than the manuscript's corrected ones.

To use the method in your own work, run
[`fixed_interrupt_flame_chase`](/flows/fixed-interrupt-flame-chase). It brings the same fixed-*k*
alternation to [Humanize](/projects/humanize) as a flow.

## Before HMA: live Kaggle

HMA grew out of our earlier work on live Kaggle competitions, which ran under the name
AgentKaggle. That work is history here, not an HMA track. The two differ in three ways:

- **Different method.** The Kaggle entries came from roughly ten different agent workflows,
  run from about twenty tracked accounts. HMA is one method, a fixed alternation between two
  agents.
- **Different setting.** The Kaggle entries were live competitions on Kaggle's own boards. HMA
  is evaluated offline, on MLE-bench's copies of 75 Kaggle competitions with a hidden grader.
- **Different evidence.** The [HMA repository](https://github.com/humanfia/hma) never cites the
  Kaggle results. What it takes from that work is infrastructure: its data preparation came
  from agentkaggle/KaggleBench, a private repository, as its
  [provenance](https://github.com/humanfia/hma/blob/main/docs/provenance.md) records. The same
  people did both pieces of work.

### What the two words mean

On Kaggle we report two kinds of result, and never as one.

**Official** means the run was entered before the deadline and holds an exact final position on
the Kaggle leaderboard.

**Late** means only the score is real. The submission went in after the competition closed, was
scored by Kaggle, and was then placed against the frozen final board to estimate where it would
have landed. A late result is an estimate of score strength. It is not a rank, a medal, or
evidence of having competed, and it is labelled as an estimate everywhere it appears. Reporting
one as a finish is exactly the failure our [flows are built to catch](/about/#how-we-work).

### Where it ended

- **[15 August](/news/2026-08-15-kaggle-nineteen-competitions):** 14 of 19 completed
  competitions in the top 5%, counting late estimates. Only two of those were official
  finishes.
- **[5 October](/news/2026-10-05-kaggle-biohub-final):** counting only final ranks. Of 39
  tracked completed competitions, 16 have a best result in the top 5%. Three of those are
  authenticated final private ranks: Student Health Risk (top 2.00%), ROGII (top 2.24%) and
  Biohub (top 4.76%). Twelve are late estimates.

The numbers come from
[agentkaggle/kaggle-results-audit](https://github.com/agentkaggle/kaggle-results-audit). It
marks each result as official or late, maps it to the session or evidence behind it, and
reports coverage and failures. The
[Team Radar leaderboard](https://agentkaggle.github.io/leaderboard/) is regenerated from the
Kaggle API and is not audited. The per-entrant repositories stay private, because they hold
competition data and account credentials.
