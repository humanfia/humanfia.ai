---
title: "Humanfia: from idea to realization"
description: Introducing an open-source agent workflow for serious L3–L4 development, and the argument that the workflow, not the model, is the thing worth building.
date: 2026-07-20
authors:
  - Humanfia
tag: Launch
---

Software agents are becoming capable enough to do more than complete isolated coding tasks.
The next challenge is not simply stronger models. It is building a workflow that can carry an
idea through architecture, implementation, independent review and refinement without losing
human intent.

Today we are introducing **Humanfia**, an open-source effort focused on agent workflows for
serious L3–L4 software development. Humanfia connects careful human-agent alignment, a
workflow-native terminal agent, and a disciplined build-review loop.

<PullQuote>Build with agents, in a humanized way.</PullQuote>

## Why workflows matter

A capable model can write a function. A capable development *system* must do much more. It has
to understand a repository, preserve constraints, use the right tools, validate its work,
incorporate external review, and continue until the actual acceptance criteria are met.

That system should not remove the human from the process. The human remains the
architect,
defining intent, evaluating tradeoffs, and deciding what "done" means. Agents provide execution
leverage inside that contract.

## From first idea to final implementation

Our intended workflow has four stages, and the last two go round until the work is done.

<AnimatedDiagram
  view-box="0 0 600 300"
  :min-width="420"
  :max-width="760"
  kicker="Idea → realization · four stages"
  label="The workflow. The human shapes the idea into a plan with acceptance criteria. Agents execute it with tools. A second model reviews the work independently. Its findings are refined back into the implementation, round after round, until the plan's contract is satisfied."
  :steps="[
    'Shape the idea: a rough direction becomes an explicit plan, with constraints and acceptance criteria. The human owns it.',
    'Execute with tools: search, edit, run, debug and browse in a workflow-native terminal.',
    'Review independently: a second model judges correctness, quality and design. The builder does not grade itself.',
    'Refine to done: findings go back into the implementation, round after round, until the plan’s contract is met.',
  ]"
>
  <path id="lx-plan" class="line dash" d="M150 70 H300 V100" data-step="2" data-draw />
  <path id="lx-out" class="line dash" d="M330 100 C 380 60, 420 60, 450 100" data-step="3" data-draw />
  <path id="lx-back" class="line red" d="M450 200 C 410 260, 340 260, 300 200" data-step="4" data-draw />
  <g data-step="1" data-pop>
    <rect class="frame" x="10" y="40" width="140" height="60" />
    <text class="ink t-lg" x="80" y="68" text-anchor="middle">Shape</text>
    <text x="80" y="90" text-anchor="middle">the plan</text>
  </g>
  <g data-step="2" data-pop>
    <rect class="ink" x="225" y="100" width="150" height="100" />
    <text class="on-ink t-lg" x="300" y="146" text-anchor="middle">Execute</text>
    <text class="on-ink" x="300" y="170" text-anchor="middle">builder</text>
  </g>
  <g data-step="3" data-pop>
    <rect class="red" x="430" y="100" width="150" height="100" />
    <text class="on-red t-lg" x="505" y="146" text-anchor="middle">Review</text>
    <text class="on-red" x="505" y="170" text-anchor="middle">second model</text>
  </g>
  <text class="red t-lg" x="375" y="288" text-anchor="middle" data-step="4">Refine to done</text>
  <rect class="ink" x="-6" y="-6" width="12" height="12" data-step="3" data-travel="#lx-out" data-loop />
  <rect class="red" x="-7" y="-7" width="14" height="14" data-step="4" data-travel="#lx-back" data-loop />
</AnimatedDiagram>

<PostCards numbered>
<PostCard title="Shape the idea.">

Expand a rough direction into an explicit plan with constraints and acceptance criteria.

</PostCard>
<PostCard title="Execute with tools.">

Search, edit, run, debug, browse and coordinate through a workflow-native terminal environment.

</PostCard>
<PostCard title="Review independently.">

Ask a second model to judge correctness, quality and design, rather than letting the builder
grade itself.

</PostCard>
<PostCard title="Refine to done." invert>

Feed findings back into implementation until the plan's contract is satisfied.

</PostCard>
</PostCards>

## Two open-source foundations

<PostCards>
<PostCard kicker="Execution" title="oh-my-humanize">

[A workflow-native terminal coding agent](https://github.com/humanfia/oh-my-humanize) with code
intelligence, debugging, subagents, browser control, review, memory and broad model support.

</PostCard>
<PostCard kicker="Feedback loop" title="RLCR Flow">

[The disciplined loop](/flows/humanize1). Claude implements, Codex independently reviews, and
review findings cycle back into implementation. The human stays responsible for the plan and the
final decision.

</PostCard>
</PostCards>

::: tip Model peer-review
The model that built the code should not be the only model judging the change. In RLCR Flow,
we recommend Claude as builder and Codex as reviewer.
:::

## Beyond general software: Kernel Design Agents

The same workflow architecture can be specialised for high-value domains.
[KDA](/projects/kda), Kernel Design Agents, applies iterative generation, benchmarking, review
and refinement to produce optimised kernels at scale.

This is where agent workflows become more than coding assistance. They become repeatable
production systems, able to explore many candidate implementations while preserving
measurement, correctness checks and human oversight.

## What comes next

We will continue improving the workflow primitives, strengthening model peer-review, and
publishing what we learn from long-running development tasks. The projects are open source,
and we welcome builders who believe the future of software development should be both more
automated and more intentional.

> The goal is not to hand software development over to agents. The goal is to give agents a
> better workflow, and give humans a better way to direct them.

## Then and now

This post was written in July 2026. Much of what it promised has since been built and measured.
Drag the divider to see what became of each piece.

<SwipeCompare kicker="Humanfia, July → October 2026" before-label="July: promised" after-label="October: built" label="What the launch post promised in July 2026, against what was built by October 2026.">
<template #before>
<table class="sw-table"><thead><tr><th>#</th><th>In July</th></tr></thead><tbody>
<tr><th>1</th><td><strong>Execution:</strong> oh-my-humanize, our own terminal agent</td></tr>
<tr><th>2</th><td><strong>The loop:</strong> RLCR Flow, Claude builds and Codex reviews</td></tr>
<tr><th>3</th><td><strong>Review:</strong> a second model, recommended</td></tr>
<tr><th>4</th><td><strong>Domains:</strong> KDA</td></tr>
<tr><th>5</th><td><strong>Measurement:</strong> "publishing what we learn"</td></tr>
</tbody></table>
</template>
<template #after>
<table class="sw-table"><thead><tr><th>#</th><th>By October</th></tr></thead><tbody>
<tr><th>1</th><td><strong>Execution:</strong> the <a href="/projects/humanize">Humanize</a> runtime, driving the CLIs you already use</td></tr>
<tr><th>2</th><td><strong>The loop:</strong> <a href="/flows/">flows</a> anyone can run: <a href="/flows/humanize1">humanize1</a>, <a href="/flows/rlar">RLAR</a> and more</td></tr>
<tr><th>3</th><td><strong>Review:</strong> any CLI in any role, with a fresh reviewer every round</td></tr>
<tr><th>4</th><td><strong>Domains:</strong> KDA, HOA and HMA</td></tr>
<tr><th>5</th><td><strong>Measurement:</strong> <a href="/projects/flowbench">FlowBench</a>, to rank the flows</td></tr>
</tbody></table>
</template>
</SwipeCompare>

The terminal agent was retired: the workflow turned out to be the valuable part, and it was
better kept outside any one agent. [Four layers and a referee](/blog/2026-08-17-four-layers-and-a-referee)
tells that story.
