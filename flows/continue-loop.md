---
pageClass: flow-page
---

# continue_loop

Send the task once, then keep saying "continue" to the same session, which is what a person at
a prompt would type. The agent keeps its whole conversation and follows its own plan, where
[stateful_ralph](/flows/stateful-ralph) repeats the task and pulls it back every round. Since
it is told to continue however done it says it is, the budget is what usually ends the run.

<FlowFacts flow="continue_loop" />

<FlowPlayer flow="continue_loop" />

See also: [stateful_ralph](/flows/stateful-ralph) · [goal](/flows/goal)
