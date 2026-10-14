---
pageClass: flow-page
---

# ralph_loop

Leave one agent on a long task. Every round is a fresh session that starts from the task and
the repository, so a run can go on for days without drowning in its own context. The price is
that an agent that forgets may redo work, so it suits tasks whose progress shows in the
repository itself, such as tests that pass one by one.

<FlowFacts flow="ralph_loop" />

<FlowPlayer flow="ralph_loop" />

See also: [stateful_ralph](/flows/stateful-ralph) · [goal](/flows/goal) · [flame_chasoid:agent_cleanup_ralph_loop](/flows/ralph-loop-agent-cleanup)
