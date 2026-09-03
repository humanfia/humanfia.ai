---
description: The RLCR Loop is the original Humanize — a Claude Code plugin in which Claude implements, Codex reviews independently, and the loop runs until the acceptance criteria are met.
---

# RLCR Loop

<p class="lede">The first Humanize, and the one everything else grew out of. One agent builds,
a second arrives with no memory of how the work was arrived at and reviews it, and the findings
become the next prompt — until the acceptance criteria are met rather than until the model says
it is finished.</p>

[PolyArch/humanize](https://github.com/PolyArch/humanize) ·
proposed at [UCLA PolyArch](https://polyarch.cs.ucla.edu/) ·
derived from [GAAC](https://github.com/SihaoLiu/gaac) · MIT

## What RLCR stands for

**Ralph-Loop with Codex Review** — the ralph-loop plugin, with an independent Codex review
wired into every round. It also reads as **Reinforcement Learning with Code Review**, which is
the honest description of what the loop is doing: the review is the reward signal, and the
next round is the update.

## The four ideas it is made of

<div class="card-grid">
  <div class="card">
    <span class="kicker">Iteration over perfection</span>
    <h3>Nobody gets it right in one shot</h3>
    <p>Rather than one long prompt hoping for a finished answer, the work is refined in rounds, and a problem found in round two costs a round rather than a rewrite.</p>
  </div>
  <div class="card">
    <span class="kicker">One build, one review</span>
    <h3>The builder is not the judge</h3>
    <p>Claude implements; Codex reviews independently and marks severity. Two models with different blind spots, and neither grading its own homework.</p>
  </div>
  <div class="card">
    <span class="kicker">The loop</span>
    <h3>It ends on the criteria, not the vibe</h3>
    <p>Findings feed back into implementation until every acceptance criterion is met. Optionally in parallel, with agent teams working the same plan.</p>
  </div>
  <div class="card">
    <span class="kicker">Begin with the end in mind</span>
    <h3>The human is checked too</h3>
    <p>Before the loop starts, it verifies that <em>you</em> understand the plan about to be executed. The person stays the architect; the agents are the leverage.</p>
  </div>
</div>

## Installing it

It is a Claude Code plugin, so it installs from inside Claude Code:

```
/plugin marketplace add PolyArch/humanize
/plugin install humanize@PolyArch
```

Reviews go through the [codex CLI](https://github.com/openai/codex), which has to be on the
path. `#dev` on the marketplace line takes the development branch instead.

## The commands

| Command | What it does |
| --- | --- |
| `/humanize:gen-idea` | Opens a loose thought into a draft, exploring several directions in parallel |
| `/humanize:gen-plan` | Turns a draft into a plan, written to a file you can read and edit |
| `/humanize:refine-plan` | Folds a reviewer's inline comments back into the plan before any code is written |
| `/humanize:start-rlcr-loop` | Runs the loop: Claude implements, Codex reviews, repeat until the criteria are met |
| `/humanize:ask-gemini` | Hands a research question to the Gemini CLI when the answer is on the web |

A `humanize monitor` dashboard runs beside it in a second terminal, so a loop left going for
hours is something you can watch rather than something you find out about afterwards.

## What became of it

Two things, and both are still here.

The **method** was ported into the [flowverse](https://github.com/humanfia/flowverse) as the
`humanize1` flows — the three commands above, each set up on its own agents — where it sits
next to RLAR, Flame Chase and the Ralph loop and can be run, forked and beaten like any other
flow. What it established is the rule the rest of them are built on: the reviewer arrives with
no memory, reads the repository rather than the transcript, and what it noticed is what the
actor hears next.

The **loop** outgrew being a plugin. A plugin can drive the coding agent it is installed in;
[Humanize](/projects/humanize) drives ten of them, on machines that are not yours, for eleven
hours at a time, and writes down everything that happened. That is the runtime everything on
this site now runs on — and it is a straight line from this page.

[Humanize — the runtime](/projects/humanize) ·
[FlowBench](/projects/flowbench) ·
[who built it](/team/#rlcr-loop)
