---
title: "Lean-Eval: 149 of 219, and second place"
description: A general agent loop on a general model, second on a leaderboard led by a purpose-built prover — and six problems behind it.
date: 2026-07-29
authors:
  - Zhengyang Zhang
tag: HOA
---

::: tip This has since moved
Three weeks later the same loop [took first place with 172 problems](/blog/2026-08-18-lean-eval-first).
:::

Running on `gpt-5.6-sol` at max effort, [Humanize 2](/projects/humanize) solved
**149 of 219** problems on Lean-Eval, which puts it second on the leaderboard.

First is ByteDance's Seedprover, at 155 of 219.

Six problems is not a rout in either direction, and the gap is worth naming precisely because
of what is on each side of it. Seedprover is a system built for this: a prover, trained and
tuned for formal mathematics. What is second is a general-purpose model driving a general-purpose
agent loop, with no component anywhere in it that knows Lean specifically — the loop is the
same one that runs [kernel work](/projects/kda) and
[Kaggle competitions](/projects/agentkaggle).

A specialist should beat a generalist on the specialist's benchmark. That it does so by six
problems is the interesting number, and it is why we thought the gap was closable.

[HOA](/projects/hoa) · [the flows](https://github.com/humanfia/flowverse)
