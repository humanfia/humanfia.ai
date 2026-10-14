---
pageClass: flow-page
---

# flame_chasoid:fixed_interrupt

[flame_chase](/flows/flame-chase) on a clock. Two agents take turns in one workspace, each turn
a fresh session, but a turn ends after *k* accepted experiments, as a trusted evaluator counts
them, rather than when the agent says so. It fits a task a command can score, so that neither
agent holds the tree for long without results. At the end, the agent that did not write the
latest accepted candidate reviews them all blind and may pick an older one. This is the HMA
paper's fixed-*k* alternation, as a flow.

<FlowFacts flow="flame_chasoid:fixed_interrupt" />

<FlowPlayer flow="fixed_interrupt_flame_chase" />

::: warning Local is not isolated
Sessions are fresh, but the home directory and machine are shared; use the HMA reproduction's isolated runner for results that must match the paper.
:::

See also: [flame_chasoid:parallel_git_pr](/flows/parallel-flame-chase-git-pr), three lanes where main moves only for a measured improvement.
