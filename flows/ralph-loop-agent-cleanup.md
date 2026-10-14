---
pageClass: flow-page
---

# flame_chasoid:agent_cleanup_ralph_loop

Keep a long run's workspace tidy. [ralph_loop](/flows/ralph-loop), with a `cleaner` that
steps in every few turns: it keeps the work under `work_paths`, deletes what strayed, writes a
short `NEXT.md` of what is next, and the repository's history becomes one commit of what
survived. It fits a run long enough that the tree fills with scratch files and dead ends. The
same cleaner between two agents taking turns is
[flame_chasoid:agent_cleanup_flame_chase](/flows/flame-chase-agent-cleanup).

<FlowFacts flow="flame_chasoid:agent_cleanup_ralph_loop" />

<Badge type="warning" text="every role: claude · codex · kimi · pi" />

<FlowPlayer flow="ralph_loop_agent_cleanup" />

::: danger Each cleaning rewrites your git history
The old history is [archived](https://github.com/humanfia/flame-chasoid-flows/blob/main/flame_chasoid/_agent_cleanup/README.md#history-archive), not deleted, but run this on a clone you are willing to have rewritten.
:::
