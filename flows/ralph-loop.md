---
pageClass: flow-page
---

# ralph_loop

Leave one agent on a long task. Every round is a fresh session that starts from the task and
the repository, so a run can go on for days without drowning in its own context.

<FlowFacts flow="ralph_loop" />

::: code-group

```text [at the prompt]
❯ $ralph_loop make every test in tests/ pass
```

```sh [hmz exec]
hmz exec -f ralph_loop -a agent=claude/claude-opus-5:high \
    -p budget.duration=6h,budget.cost=50 "$(cat TASK.md)"
```

:::

<FlowPlayer flow="ralph_loop" />

## When to use it

A round that starts clean reads the repository as it is, the test the last round broke and the
file it left half-written, with none of the reasoning that got it there. The price is that an
agent that forgets may redo work, or undo a decision it made an hour ago. Have it write its
decisions into the repository, and every round reads them back.

- The agent has to remember what it tried: [stateful_ralph](/flows/stateful-ralph).
- The model should decide when it is done: [goal](/flows/goal).
- The tree fills up with clutter over a long run:
  [flame_chasoid:agent_cleanup_ralph_loop](/flows/ralph-loop-agent-cleanup).

## Roles and params

| Role | What it is | How it is filled | |
| --- | --- | --- | --- |
| `agent` | agent, required | `-a agent=…` | Takes every round, each in a fresh session. |
| `workspace` | environment, local | the directory you start in; no `-e` | Where every round works, and all that carries from one to the next. |

Each agent role takes one `-a role=CLI[@PROVIDER]/MODEL[:EFFORT]`; several roles may share one `-a`, comma-separated. There is no `-e` to give: `workspace` is a local environment, the directory you start the run in, and an `-e` naming it is refused. See [Command-line specs](https://docs.humanfia.ai/humanize/reference/flows#running-one).

No params. The loop pauses 5 seconds between rounds.

## What ends it

- **The [budget](https://docs.humanfia.ai/humanize/features/allowances).** Whichever of its limits runs out first.
- **Three rounds in a row that answer nothing.** A round whose turn fails counts as one that
  answered nothing, so a backend that refuses the account, or will not run the model, stops the
  run within three rounds instead of burning the budget's whole duration:

```text
round 41
round 41 failed: <what the backend said>
round 42
round 42 failed: <what the backend said>
round 43
round 43 failed: <what the backend said>
stopping: 3 rounds in a row answered with nothing
```

## Picking it up

`--resume` carries on the round count: a run stopped on round 40 starts again at round 41.
Everything else the loop knows is in the repository, where it always was.

A run stopped by its budget or by a stall is not over. Fix what stopped it, then run the same
line again with `--resume` and a fresh budget. See [Picking a run up](https://docs.humanfia.ai/humanize/user/resuming).

## See also

- [stateful_ralph](/flows/stateful-ralph): one session instead, sent the task every round
- [Loops](https://docs.humanfia.ai/humanize/weaver/loops): writing a loop like this one yourself
