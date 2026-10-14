---
pageClass: flow-page
---

# flame_chasoid:parallel

Chase three leads at once. A coordinator plans three lanes and leaves; in each lane two actors
take turns in fresh sessions, and the lanes keep each other informed by report. Only lane 1
writes your tree: lanes 2 and 3 work on private copies, and what they find reaches lane 1 as a
report and an artifact. It fits a task open enough that three approaches are worth trying side
by side, with the budget for seven agents.

<FlowFacts flow="flame_chasoid:parallel" />

<FlowPlayer flow="parallel_flame_chase" />

See also: [flame_chasoid:parallel_git_pr](/flows/parallel-flame-chase-git-pr), the same lanes, each with a clone and pull requests.
