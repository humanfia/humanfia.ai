---
pageClass: flow-page
---

# fixed_interrupt_flame_chase

[flame_chase](/flows/flame-chase) on a clock. Two agents take turns in one workspace, each turn
a fresh session, but a turn does not end when the agent says so: it ends after *k* **accepted
experiments**, as a trusted evaluator counts them. At the end, the agent that did not write the
latest accepted candidate reviews them all blind, and may pick an older one. This is the HMA
paper's fixed-*k* alternation, as a flow.

<FlowFacts flow="fixed_interrupt_flame_chase" />

::: code-group

```sh [FlowBench task]
hmz exec -f fixed_interrupt_flame_chase \
    -a first_chaser=claude/claude-opus-5:max -a second_chaser=codex/gpt-5.6-sol:max \
    -p budget.duration=6h "$(cat TASK.md)"
```

```sh [native evaluator]
hmz exec -f fixed_interrupt_flame_chase \
    -a first_chaser=claude/claude-opus-5:max -a second_chaser=codex/gpt-5.6-sol:max \
    -p budget.duration=6h \
    -p gate_config=/ABS/trusted/gate.json -p run_dir=/ABS/results/new-task-run \
    "$(cat TASK.md)"
```

:::

<FlowPlayer flow="fixed_interrupt_flame_chase" />

## When to use it

When a command measures the work, a turn that runs until the agent feels finished wastes the
measurement: an agent can polish one idea for an hour that a score already rejected. Here the
evaluator, not the model, decides when the other agent gets the tree, so neither one holds it
for long without results. The final review guards the other way, against the last accepted
candidate winning only because it was last.

Two admission backends do the counting, chosen by whether `gate_config` is given:

| | FlowBench (`gate_config` unset) | native MLE (`gate_config` set) |
| --- | --- | --- |
| Counts | records the cell's evaluator scored without an error | the native evaluator's receipts |
| An actor submits with | `submit.py submit` (built with the workspace's `submit.sh`) | `submit.py submit PATH.csv` |
| Admission service | inside the flow process | `evaluator.py`, which you start |

The native backend needs a trusted evaluator started beside the run, with control files outside
the workspace. Its
[README](https://github.com/humanfia/fixed-interrupt-flame-chase-flow#start-the-trusted-admission-service)
walks through it.

## Roles and params

| Role | What it is | How it is filled | |
| --- | --- | --- | --- |
| `first_chaser` | agent, required | `-a first_chaser=…` | Takes the odd turns, each in a fresh session, and may be the reviewer. |
| `second_chaser` | agent, required | `-a second_chaser=…` | Takes the even turns, each in a fresh session, and may be the reviewer. |
| `workspace` | environment, local | the directory you start in; no `-e` | The task's shared workspace, which both chasers work in. Files carry over; transcripts do not. |

Each agent role takes one `-a role=CLI[@PROVIDER]/MODEL[:EFFORT]`; several roles may share one `-a`, comma-separated. There is no `-e` to give: `workspace` is a local environment, the directory you start the run in, and an `-e` naming it is refused. See [Command-line specs](https://docs.humanfia.ai/humanize/reference/flows#running-one).

Every param has a default, so FlowBench, which passes none, can run it:

| Param | Default | |
| --- | --- | --- |
| `gate_config` | unset | The trusted native evaluator's connection file, an absolute path. Unset for a FlowBench task. |
| `run_dir` | unset | A new absolute output directory outside the workspace. Unset makes one under `~/.fixed_interrupt_flame_chase/`. |
| `evaluator_url` | `http://evaluator` | The FlowBench evaluator, used when there is no `gate_config`. |
| `max_valid_submissions_per_session` | `5` | *k*: accepted experiments before a turn closes. |
| `active_time_limit_seconds` | unset | The whole run's wall clock, review included. Unset takes the budget's `duration`, else six hours. |
| `review_reserve_seconds` | `900` | Wall time kept back at the end for review and finalization. |
| `review_turn_seconds` | `600` | The longest the reviewer may run. |
| `rest_seconds` | `1` | Seconds between one turn and the next, at most 60. |

The rest, `finalize_reserve_seconds`, `cleanup_reserve_seconds`, `build_timeout_seconds` and
`poll_seconds`, are in the
[README](https://github.com/humanfia/fixed-interrupt-flame-chase-flow#params).

## What ends it

- **The wall clock.** Turns alternate until the exploration deadline, which is the wall clock
  less the review reserve. A score that lands after it is not counted.
- **One final review.** With at least two accepted candidates, the agent opposite the latest
  one's author sees them all, by identity and authorship, with no scores, and nominates one.
  Silence or an unknown nomination keeps the standing candidate. There is one ballot and no
  retry.
- **The [budget](https://docs.humanfia.ai/humanize/features/allowances).** A budget tighter
  than the wall clock can end the run earlier, even before the review.
- **A failure.** A provider or evaluator error during exploration fails the run; it is not
  treated as a handoff.

## Picking it up

It cannot be picked up, by design: an admission ledger cannot be trusted twice. After a failed
run, keep its evidence and start a new one, with a fresh `run_dir` and fresh evaluator state.
`run_dir` holds `contract.json`, `turns.json`, `review.json` and `result.json`.

::: warning Local is not isolated
The paper's runner gives every turn a new container and home directory. A local workspace does
not: sessions are fresh, but the home directory, installed packages and the machine are shared,
and nothing outside the workspace is hidden from an agent that goes looking. Use the HMA
reproduction's isolated runner for results that must match the paper's containment.
:::

## See also

- [flame_chase](/flows/flame-chase): the same relay, where a turn ends when the agent says so
- [parallel_flame_chase:git_pr](/flows/parallel-flame-chase-git-pr): three lanes, where main
  moves only for a measured improvement
- [FlowBench](/projects/flowbench): where flows like this one are scored
