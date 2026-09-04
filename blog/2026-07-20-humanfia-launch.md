---
title: "Humanfia: from automated idea factory to realization"
description: Introducing an open-source agent workflow for serious L3–L4 development — and the argument that the workflow, not the model, is the thing worth building.
date: 2026-07-20
authors:
  - Humanfia
tag: Launch
---

Software agents are becoming capable enough to do more than complete isolated coding tasks.
The next challenge is not simply stronger models — it is building a workflow that can carry an
idea through architecture, implementation, independent review and refinement without losing
human intent.

Today we are introducing **Humanfia**, an open-source effort focused on agent workflows for
serious L3–L4 software development. Humanfia connects careful human-agent alignment, a
workflow-native terminal agent, and a disciplined build-review loop.

> Build with agents, in a humanized way.

## Why workflows matter

A capable model can write a function. A capable development *system* must do much more:
understand a repository, preserve constraints, use the right tools, validate its work,
incorporate external review, and continue until the actual acceptance criteria are met.

That system should not remove the human from the process. The human remains the architect —
defining intent, evaluating tradeoffs, and deciding what "done" means. Agents provide
execution leverage inside that contract.

## From first idea to final implementation

Our intended workflow has four stages:

1. **Shape the idea.** Expand a rough direction into an explicit plan with constraints and
   acceptance criteria.
2. **Execute with tools.** Search, edit, run, debug, browse and coordinate through a
   workflow-native terminal environment.
3. **Review independently.** Ask a second model to judge correctness, quality and design
   rather than letting the builder grade itself.
4. **Refine to done.** Feed findings back into implementation until the plan's contract is
   satisfied.

## Two open-source foundations

[**oh-my-humanize**](https://github.com/humanfia/oh-my-humanize) is the execution environment:
a workflow-native terminal coding agent with code intelligence, debugging, subagents, browser
control, review, memory and broad model support.

[**Humanize 1: RLCR Loop**](https://github.com/PolyArch/humanize) supplies the disciplined
feedback loop. Claude implements, Codex independently reviews, and review findings cycle back
into implementation. The human stays responsible for the plan and the final decision.

::: tip Model peer-review
The model that built the code should not be the only model judging the change. In Humanize 1,
we recommend Claude as builder and Codex as reviewer.
:::

## Beyond general software: Kernel Design Agents

The same workflow architecture can be specialised for high-value domains. KDA — Kernel Design
Agents — applies iterative generation, benchmarking, review and refinement to produce
optimised kernels at scale.

This is where agent workflows become more than coding assistance. They become repeatable
production systems: capable of exploring many candidate implementations while preserving
measurement, correctness checks and human oversight.

## What comes next

We will continue improving the workflow primitives, strengthening model peer-review, and
publishing what we learn from long-running development tasks. The projects are open source,
and we welcome builders who believe the future of software development should be both more
automated and more intentional.

The goal is not to hand software development over to agents. The goal is to give agents a
better workflow — and give humans a better way to direct them.

---

*Written in July 2026. Much of what this post promised has since been built and measured:
the runtime became [Humanize 2](/projects/humanize), the loop became a
[flowverse of flows](/projects/humanize#the-flows-it-runs) anyone can run, and the review
discipline is now [RLAR](https://github.com/humanfia/flowverse). What that turned into is
described in
[Four layers and a referee](/blog/2026-08-17-four-layers-and-a-referee).*
