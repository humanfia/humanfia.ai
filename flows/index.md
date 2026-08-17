# Flows

<p class="lede">A flow is a loop, written down as code. It says what each agent is asked, in
what order, and when to stop — and because it is a directory of Python rather than a setting,
it can be read in a sitting, forked in one keystroke and shipped to somebody else.</p>

This is the layer we care most about. A model is something you rent; a flow is something you
can actually own, improve and prove.

```sh
hmz exec -f official/rlar \
    -a claude/claude-opus-4-8:max -a codex/gpt-5.6-sol:max "$(cat TASK.md)"
```

## Ours

Three loops we designed, and use, and measure everything else against.

<div class="card-grid">
  <a class="card" href="/flows/rlar">
    <span class="kicker">official/rlar</span>
    <h3>RLAR</h3>
    <p>An actor works in one long session; a reviewer arrives fresh each round, reads the repository, and decides both what the actor hears next and whether the run is over.</p>
  </a>
  <a class="card" href="/flows/flame-chase">
    <span class="kicker">official/flame_chase</span>
    <h3>Flame Chase Loop</h3>
    <p>Two agents take turns on the same task, each reading the repository rather than a transcript. Neither is in charge, and each one inherits the other's work in progress.</p>
  </a>
  <a class="card" href="/flows/humanize1">
    <span class="kicker">official/humanize1</span>
    <h3>Humanize 1</h3>
    <p>Idea to draft, draft to plan, plan to built-and-reviewed. The three-stage loop behind the IMO and PutnamBench results, now runnable on any backend.</p>
  </a>
</div>

## The common ones

The loops the field converged on, kept here so that comparing against them is a flag rather
than a reimplementation. They need no introduction from us — these are the descriptions from
the flows themselves.

### Ralph Loop

A fresh session every turn, so nothing carries over. Each round starts from the task and the
repository, whatever happened in the last one; what the agent did is not kept, only which
round it is on, so a loop left going for days picks up where it stopped rather than starting
at one.

The strongest simple baseline there is, and the reason so much of what follows is measured
against it.

```sh
hmz exec -f ralph_loop -a claude/claude-opus-4-8:high "$(cat TASK.md)"
```

### Goal

Ralph, with the task set as the agent's own goal. A turn here is a whole pursuit: the agent
keeps itself going until it believes it has met the task, and the loop is only what starts it
over when it stopped without having.

```sh
hmz exec -f official/goal -a claude/claude-opus-4-8:max "$(cat TASK.md)"
```

### Continue loop

Send the task once, then keep nudging *continue* in the same session. One conversation, held
open, with the history intact — the opposite end of the axis from the ralph loop.

### Fixed-juice ralph

A ralph loop with a governor on it: a fresh session every turn, and between turns the effort
moved up or down to hold the agent to a target output size per model turn. What it keeps
steady is how much of an answer each turn is worth — not a clock and not a budget.

## Where they come from

`ralph_loop` and `chat` ship inside humanize. Everything else lives in the
[official flowverse](/projects/flowverse), which humanize fetches the first time you run one
of them, and which anybody can fork.

Writing your own is [a tutorial and about twenty
lines](https://hmz.humanfia.ai/guide/tutorial-first-flow). If it beats one of ours, we would
like the pull request.
