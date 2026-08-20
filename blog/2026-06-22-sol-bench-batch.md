---
title: Fifty-three firsts on SOL Bench, from one node
description: A week of unattended kernel generation on a single 8×B200 node produced 53 first-place rankings, and it had not stopped finding them.
date: 2026-06-22
authors:
  - Lesheng Jin
  - Yuchen Jin
tag: KDA
---

::: info Ongoing
Still generating. The count below is a snapshot, and the ranking will be updated as entries land.
:::

On a **single 8×B200 node**, over about a week, [KDA](/projects/kda) generated kernels holding
**53 first-place rankings** across SOL Bench.

The number to notice is not 53, it is *one node* and *a week*. Kernel optimization has
historically priced in a scarce human: someone who knows the architecture, reads the profiler
and has the patience for the twentieth variant. What this run costs is a machine that was
already there and nobody watching it.

That changes which problems are worth attacking. A track that would take an engineer three days
and probably yield nothing is not worth an engineer's three days; it is trivially worth a slot
in a queue.

The generated kernels are being prepared for release, and the ranking will follow.

[KDA](/projects/kda) · [github.com/humanfia](https://github.com/humanfia)
