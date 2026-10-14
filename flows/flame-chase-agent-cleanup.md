---
pageClass: flow-page
---

# flame_chasoid:agent_cleanup_flame_chase

Keep a long relay's workspace tidy. [flame_chase](/flows/flame-chase), with a `cleaner` that
steps in every few turns between the two chasers: it keeps the work under `work_paths`,
deletes what strayed, writes a short `NEXT.md` of what is next, and the repository's history
becomes one commit of what survived. Its params are those of
[flame_chasoid:agent_cleanup_ralph_loop](/flows/ralph-loop-agent-cleanup), the same cleaner
behind one agent.

<FlowFacts flow="flame_chasoid:agent_cleanup_flame_chase" />

<Badge type="warning" text="every role: claude · codex · kimi · pi" />

<FlowPlayer flow="flame_chase_agent_cleanup" />

::: danger Each cleaning rewrites your git history
The old history is [archived](https://github.com/humanfia/flame-chasoid-flows/blob/main/flame_chasoid/_agent_cleanup/README.md#history-archive), not deleted, but run this on a clone you are willing to have rewritten.
:::
