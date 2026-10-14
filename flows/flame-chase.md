---
pageClass: flow-page
---

# flame_chase

Put two agents on one task and let them take turns. Each turn is a fresh session that starts
from the task and the repository, so the working tree is all that passes between them, and
every turn goes to an agent that did not write what it is looking at. Two different models fail
differently, which suits long work where one agent's blind spots would compound. The name
comes from the Flame-Chase Journey (逐火之旅) in *Honkai: Star Rail*, taken up anew each time
its world goes round again.

<FlowFacts flow="flame_chase" />

<FlowPlayer flow="flame_chase" />

See also: [flame_chasoid:agent_cleanup_flame_chase](/flows/flame-chase-agent-cleanup) · [flame_chasoid:parallel](/flows/parallel-flame-chase) · [rlar](/flows/rlar)
