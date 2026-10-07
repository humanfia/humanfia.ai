---
pageClass: flow-page
---

# flame_chasoid:parallel_git_pr

Chase three leads at once, the way a team works a repository: **every lane has a clone of its
own and opens pull requests**, and a pull request reaches `main` only when a measurement shows
it is better. There is no reviewer. Its setup is fixed to the one that did best in a
twelve-hour experiment.

<FlowFacts flow="flame_chasoid:parallel_git_pr" />

::: code-group

```text [at the prompt]
❯ $flame_chasoid:parallel_git_pr get the solver under 10 s on every benchmark in bench/
```

```sh [hmz exec]
hmz exec -f flame_chasoid:parallel_git_pr \
    -a orchestrator=codex/gpt-5.6-sol:max \
    -a lane_1_actor_a=codex/gpt-5.6-sol:max,lane_1_actor_b=claude/claude-opus-5:max \
    -a lane_2_actor_a=claude/claude-opus-5:max,lane_2_actor_b=codex/gpt-5.6-sol:max \
    -a lane_3_actor_a=claude/claude-opus-5:max,lane_3_actor_b=codex/gpt-5.6-sol:max \
    -p budget.duration=12h,budget.cost=500 "$(cat TASK.md)"
```

:::

<FlowPlayer flow="parallel_flame_chase_git_pr" />

## When to use it

When the task has a number to beat, such as a benchmark, a score or a size, and a command that
measures it. Nothing here asks a model whether a change is good: the measurement decides. If
the task has no such number, use [flame_chasoid:parallel](/flows/parallel-flame-chase), where
one lane writes your tree and the other two report to it.

## How a change reaches main

1. A lane may keep many drafts, but only one pull request ready at a time. A ready pull request
   is frozen, and a newer one from the same lane replaces it.
2. The lane measures it with `pfc evaluate -- <command>`, which runs your evaluator on a clean
   tree and keeps a receipt of the result that cannot be changed.
3. The best candidate is merged only if its receipt improves on `main`. The repository itself
   refuses a `main` that is not exactly the tree that was measured.

What lanes learn from each other is their reports, and the flow's own reports of what was
merged and what was refused.

## Roles and params

| Role | What it is | How it is filled | |
| --- | --- | --- | --- |
| `orchestrator` | agent, required | `-a orchestrator=…` | Plans the three lanes, once. |
| `lane_1_actor_a` · `lane_1_actor_b` | agent, required | `-a lane_1_actor_a=…,lane_1_actor_b=…` | Lane 1, taking turns in fresh sessions, in a clone of its own. |
| `lane_2_actor_a` · `lane_2_actor_b` | agent, required | `-a lane_2_actor_a=…,lane_2_actor_b=…` | Lane 2, the same. |
| `lane_3_actor_a` · `lane_3_actor_b` | agent, required | `-a lane_3_actor_a=…,lane_3_actor_b=…` | Lane 3, the same. |
| `human` | you | filled by humanize; no `-a` | Asked only to confirm copying a very large workspace. |
| `workspace` | environment, local | the directory you start in; no `-e` | Your tree, from which the run makes a central repository and a clone per lane. |

Each agent role takes one `-a role=CLI[@PROVIDER]/MODEL[:EFFORT]`; several roles may share one `-a`, comma-separated. There is no `-e` to give: `workspace` is a local environment, the directory you start the run in, and an `-e` naming it is refused. See [Command-line specs](https://docs.humanfia.ai/humanize/reference/flows#running-one).

Any backend can fill any role. The lane actors may also write outside their clone, which is how
they push to the run's central repository.

| Param | Default | |
| --- | --- | --- |
| `rest_seconds` | `1.0` | Seconds the scheduler rests between passes, 0.05 to 60. |
| `resume_mode` | `auto` | `auto` picks up a compatible earlier run; `fresh` starts another. |
| `confirm_large_workspace_copies` | `false` | Ask before making the copies of a very large workspace. Under `hmz exec` nobody answers, so the run does not start. |
| `workspace_file_warning_threshold` | `5000` | Files that make a workspace very large. |
| `workspace_copy_warning_threshold_bytes` | `1073741824` | Bytes of copies that make it very large (1 GiB): the lanes' clones, the planning tree and the git objects. |

Five more params are fixed, so that a launch cannot turn the measured setup into a different
one: `git_pr_enabled` is `true`, and `global_knowledge_enabled`, `experiment_memory_enabled`,
`token_efficient_enabled` and `main_update_monitor_enabled` are `false`.

## What ends it

**The [budget](https://docs.humanfia.ai/humanize/features/allowances), or you.** The lanes go on for as long as the run does, so
give it `budget.duration`. When it runs out, the turns under way finish and are recorded, and the
run stops.

## Picking it up

`--resume` picks up the central repository, the receipts, the artifacts and the reports, and
carries on. `-p resume_mode=fresh` starts another run instead. See
[Picking a run up](https://docs.humanfia.ai/humanize/user/resuming).

Leave your source tree alone while a run holds it. Only one run may hold a source tree at a
time, whether of this flow or of `flame_chasoid:parallel`: a second one refuses to start.

## See also

- [flame_chasoid:parallel](/flows/parallel-flame-chase): the same lanes, with one writer and two
  private copies
- [Many turns at once](https://docs.humanfia.ai/humanize/features/concurrency): why the lanes run side by side, not in a queue
