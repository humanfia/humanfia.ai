---
pageClass: flow-page
---

# goal

Hand the task to the agent as its own goal: the model keeps working, turn after turn, in one
session, until it says the goal is met. It fits when the agent can tell for itself that the
work is done; the catch is that it judges its own work, where [rlar](/flows/rlar) asks a
separate reviewer instead. It needs a backend with a goal feature of its own.

<FlowFacts flow="goal" />

<Badge type="warning" text="worker: claude · codex · dsh · kimi" />

<FlowPlayer flow="goal" />

See also: [rlar](/flows/rlar) · [ralph_loop](/flows/ralph-loop)
