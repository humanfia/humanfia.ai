---
title: "HMA: Humanize MLE Agents"
description: Two native coding agents take turns over one shared machine-learning workspace, each starting fresh. On 75 MLE-bench tasks with a six-hour budget, 78.2% any-medal and 53.8% gold, self-reported while the paper is pending.
layout: post
sidebar: false
tag: HMA

project:
  status: Paper experiment code · self-reported results
  links:
    - { text: humanfia/hma, href: https://github.com/humanfia/hma }
    - { text: The flow, href: /flows/fixed-interrupt-flame-chase }
    - { text: The write-up, href: /news/2026-10-05-hma-mle-bench }
  stats:
    - { value: 53.8, decimals: 1, suffix: '%', kicker: Gold, text: 'Gold-medal rate on the same 75 tasks', href: /news/2026-10-05-hma-mle-bench }
    - { value: 90.7, decimals: 1, suffix: '%', kicker: Median+, text: 'Of tasks above the human leaderboard median' }
    - { value: 89.0, decimals: 1, kicker: Percentile, text: 'Mean leaderboard percentile across the tasks' }
    - { value: 6.4, decimals: 1, prefix: '+', kicker: Average gain, text: 'Points of any-medal rate over the mean single-agent baseline, across six pairings' }
  note: From the repository's results table. Not on the official MLE-bench leaderboard.

hero:
  kicker: MLE-bench · 75 tasks · 6 h
  value: 78.2
  from: 60
  decimals: 1
  suffix: '%'
  label: any-medal rate, Claude Opus 5 ↔ GPT-5.6-sol taking turns
  board:
    - { name: HMA · Opus 5 ↔ GPT-5.6-sol, score: 78.2, us: true }
    - { name: Opus 5 · native /goal, score: 72.4 }
    - { name: ScienceFlow · 24 h, score: 70.2 }
    - { name: GPT-5.6-sol · native /goal, score: 68.0 }
    - { name: MLEvolve · 12 h, score: 65.3 }

# The repository's main results table (humanfia/hma, README "Main results"); percentages.
results:
  - { label: Any medal, values: { opus: 72.4, gpt: 68.0, hma: 78.2, hmaRev: 73.3 } }
  - { label: Gold, values: { opus: 50.7, gpt: 47.6, hma: 53.8, hmaRev: 50.7 } }
  - { label: Median+, detail: above the human median, values: { opus: 85.3, gpt: 81.3, hma: 90.7, hmaRev: 85.3 } }
  - { label: Mean percentile, values: { opus: 84.8, gpt: 81.3, hma: 89.0, hmaRev: 85.4 } }
order:
  - { name: HMA · Opus 5 ↔ GPT-5.6-sol, score: 78.2, us: true }
  - { name: HMA · GPT-5.6-sol ↔ Opus 5, score: 73.3, us: true }
  - { name: Opus 5 · native /goal, score: 72.4 }
  - { name: HMA · GPT-5.6-sol ↔ DeepSeek V4.1 Flash, score: 72.0, us: true }
  - { name: HMA · GPT-5.6-sol ↔ Kimi K3, score: 70.7, us: true }
  - { name: ScienceFlow · 24 h, score: 70.2 }
  - { name: GPT-5.6-sol · native /goal, score: 68.0 }
  - { name: MLEvolve · 12 h, score: 65.3 }

# Kaggle: authenticated final private ranks, from the 5 October write-up and the audit.
kaggle:
  - { name: Predicting Student Health Risk, score: 2.00, us: true }
  - { name: ROGII Wellbore Geology, score: 2.24, us: true }
  - { name: Biohub · Cell Tracking, score: 4.76, us: true, detail: 188th of 3,947 }
---

Two native coding agents take turns over one shared machine-learning workspace, each starting
with a fresh context. Each one builds on the other's code, models and candidate solutions, and
together they medal more often than either does alone.

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

<AnimatedDiagram
  view-box="0 0 720 300"
  :min-width="540"
  kicker="HMA · one task, six hours"
  label="HMA's alternation. Two agents take turns over one shared workspace. Agent A works a session in its own harness until five accepted submissions, then agent B starts a fresh session in the same workspace; the files carry over and the context does not. They alternate until the last fifteen minutes, which review the accepted candidates and pick one."
  :steps="[
    'One shared workspace: the code, the models, the evaluated results and the candidates.',
    'Agent A works in its own native harness, until five accepted submissions or until it stops.',
    'Agent B starts a fresh session in the same workspace. The files carry over. A\'s context does not.',
    'They keep alternating, each session fresh, within the six-hour budget.',
    'The last 15 minutes pick one candidate that was already accepted. No agent sees a private score.',
  ]"
>
  <path id="hma-handoff" class="line dash" d="M95 64 L 95 150 L 245 150 L 245 236 L 395 236 L 395 150 L 545 150 L 545 64 L 545 150 L 655 150" data-step="4" data-draw />
  <text class="ink" x="10" y="38">Agent A · Opus 5 · Claude Code</text>
  <text class="ink" x="10" y="292">Agent B · GPT-5.6-sol · Codex</text>
  <g data-step="1" data-pop>
    <rect class="frame" x="20" y="128" width="690" height="44" />
    <text class="ink" x="30" y="155">shared workspace</text>
  </g>
  <g data-step="2" data-pop>
    <rect class="ink" x="20" y="46" width="150" height="40" />
    <text class="on-ink" x="95" y="71" text-anchor="middle">fresh · ≤ 5 accepted</text>
  </g>
  <rect class="red" x="180" y="140" width="12" height="12" data-step="2" data-pop />
  <rect class="red" x="198" y="140" width="12" height="12" data-step="2" data-pop />
  <g data-step="3" data-pop>
    <rect class="ink" x="170" y="214" width="150" height="40" />
    <text class="on-ink" x="245" y="239" text-anchor="middle">fresh · ≤ 5 accepted</text>
  </g>
  <rect class="red" x="330" y="148" width="12" height="12" data-step="3" data-pop />
  <g data-step="4" data-pop>
    <rect class="ink" x="320" y="46" width="150" height="40" />
    <text class="on-ink" x="395" y="71" text-anchor="middle">fresh session</text>
    <rect class="ink" x="470" y="214" width="150" height="40" />
    <text class="on-ink" x="545" y="239" text-anchor="middle">fresh session</text>
  </g>
  <rect class="red" x="480" y="140" width="12" height="12" data-step="4" data-pop />
  <rect class="red" x="630" y="148" width="12" height="12" data-step="4" data-pop />
  <g data-step="5" data-pop>
    <rect class="red" x="620" y="46" width="90" height="40" />
    <text class="on-red" x="665" y="71" text-anchor="middle">review</text>
  </g>
  <text class="red" x="665" y="104" text-anchor="middle" data-step="5">last 15 min</text>
  <rect class="ink" x="-7" y="-7" width="14" height="14" data-step="4" data-travel="#hma-handoff" data-loop />
</AnimatedDiagram>

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


<BarChart
  orientation="vertical"
  kicker="MLE-bench · 75 tasks · six-hour budget · %"
  label="HMA against its two single-agent baselines on 75 MLE-bench tasks. Any medal: Opus 5 /goal 72.4, GPT-5.6-sol /goal 68.0, HMA Opus first 78.2, HMA GPT first 73.3. Gold: 50.7, 47.6, 53.8, 50.7. Median+: 85.3, 81.3, 90.7, 85.3. Mean percentile: 84.8, 81.3, 89.0, 85.4."
  caption="The same two models, alone and taking turns, in both orders. Compare against either baseline to read the gain as points."
  :series="[
    { key: 'opus', label: 'Opus 5 · /goal', tone: 'ink' },
    { key: 'gpt', label: 'GPT-5.6-sol · /goal', tone: 'grey', hatched: true },
    { key: 'hma', label: 'HMA · Opus first', tone: 'red' },
    { key: 'hmaRev', label: 'HMA · GPT first', tone: 'pale' },
  ]"
  :rows="$frontmatter.results"
  :baselines="['opus', 'gpt']"
  compare="delta"
  suffix="%"
  :decimals="1"
  :max="100"
/>

The best pairing beats the mean of its two single-agent baselines by **8.0 points** of
any-medal rate and **5.9** of mean percentile. Across the six pairings evaluated, the average
gain is **6.4 points**. Use that average when comparing, because the order of the agents
matters a lot. The same two models score 78.2% with Opus first and 73.3% with GPT-5.6-sol
first, so picking the better order afterwards flatters the headline.


<Leaderboard
  kicker="MLE-bench · any-medal rate · every row in the table"
  title="Which agent goes first is worth nearly five points"
  label="Any-medal rate on 75 MLE-bench tasks: HMA Opus 5 then GPT-5.6-sol 78.2; HMA GPT-5.6-sol then Opus 5 73.3; Opus 5 /goal 72.4; HMA GPT-5.6-sol with DeepSeek V4.1 Flash 72.0; HMA GPT-5.6-sol with Kimi K3 70.7; ScienceFlow 70.2 at 24 hours; GPT-5.6-sol /goal 68.0; MLEvolve 65.3 at 12 hours."
  caption="HMA rows in red. ScienceFlow and MLEvolve ran with longer budgets."
  :entries="$frontmatter.order"
  :decimals="1"
  suffix="%"
/>

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

<!-- The old HKA page's section ids, so a /projects/hka#... link still lands in this section. -->
<span id="why-kaggle"></span>

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

### Where it ended {#where-things-stand}

- **[15 August](/news/2026-08-15-kaggle-nineteen-competitions):** 14 of 19 completed
  competitions in the top 5%, counting late estimates. Only two of those were official
  finishes.
- **[5 October](/news/2026-10-05-kaggle-biohub-final):** of 39 tracked completed
  competitions, 16 have a best result in the top 5%, and most of those are not finishes. Three of those are
  authenticated final private ranks: Student Health Risk (top 2.00%), ROGII (top 2.24%) and
  Biohub (top 4.76%). One is a public rank at the snapshot, with the final private rank not
  yet recorded. Twelve are late estimates.


<Leaderboard
  kicker="Kaggle · authenticated final private ranks in the top 5%"
  label="Kaggle finishes with an authenticated final private rank in the top 5%: Predicting Student Health Risk top 2.00%, ROGII Wellbore Geology top 2.24%, Biohub Cell Tracking top 4.76%, 188th of 3,947."
  caption="Top percent of the final private leaderboard, lower is better. Late estimates and public snapshot ranks are not finishes and are not on this board."
  :entries="$frontmatter.kaggle"
  :decimals="2"
  prefix="top "
  suffix="%"
  lower-is-better
/>

### The audit {#the-audit}

<span id="what-is-public-and-what-is-not"></span>The numbers come from
[agentkaggle/kaggle-results-audit](https://github.com/agentkaggle/kaggle-results-audit). It
marks each result as official or late, maps it to the session or evidence behind it, and
reports coverage and failures. The
[Team Radar leaderboard](https://agentkaggle.github.io/leaderboard/) is regenerated from the
Kaggle API and is not audited. The per-entrant repositories stay private, because they hold
competition data and account credentials.

## Results, as they came in

<ProjectTimeline
  kicker="HMA and the Kaggle work before it"
  label="HMA and Kaggle write-ups: fourteen of nineteen Kaggle competitions in the top 5% counting late estimates in August; in October, HMA's 78.2% medal rate on MLE-bench and Biohub's final rank of 188th of 3,947."
  :entries="[
    { url: '/news/2026-08-15-kaggle-nineteen-competitions', metric: '14 of 19' },
    { url: '/news/2026-10-05-hma-mle-bench', metric: '78.2%' },
    { url: '/news/2026-10-05-kaggle-biohub-final', metric: '188 / 3,947' },
    { title: 'The HMA paper', pending: true, metric: 'Pending', note: 'The manuscript behind these numbers. Until it is out, every HMA number here is self-reported.' },
  ]"
/>
