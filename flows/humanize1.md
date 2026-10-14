---
pageClass: flow-page
---

# humanize1

The [Claude Code plugin](https://github.com/PolyArch/humanize) the rest of humanfia grew out
of, proposed at [UCLA PolyArch](https://polyarch.cs.ucla.edu/), as three flows you run one
after another: `gen-idea` opens a loose idea into a draft, `gen-plan` turns the draft into a
plan two agents agreed on, and `rlcr` builds that plan under review until nothing is left to
say. Each phase is a run of its own, and what passes from one to the next is a file you can
read and edit before going on. Its loop, RLCR, is a Ralph loop with an independent code review
every round: the reviewer arrives with no memory, reads the repository, and its findings are
what the builder hears next.

<FlowFacts flow="humanize1" />

<Badge type="warning" text="rlcr builder: claude · codex · kimi" />
<Badge type="info" text="rlcr needs a git repository" />

## 1 · gen-idea {#gen-idea}

One agent explores several directions for the idea and writes a draft, with no code.

<FlowPlayer flow="humanize1-gen-idea" />

## 2 · gen-plan {#gen-plan}

A planner writes the plan and an analyst reviews it, fresh each time, until they agree.

<FlowPlayer flow="humanize1-gen-plan" />

## 3 · rlcr {#rlcr}

A builder works through the plan; a fresh reviewer checks each round, then the whole change.

<FlowPlayer flow="humanize1-rlcr" />

See also: [rlar](/flows/rlar), the same loop without a plan, and
[recursive_lean_prover](/flows/recursive-lean-prover), built out of `gen-plan` and `rlcr`.
