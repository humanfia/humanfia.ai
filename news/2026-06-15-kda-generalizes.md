---
title: "Thin docs, no corpus: KDA still finds speedups on AMD hardware"
description: "On ASM, HIP and ROCm — far less documentation, far fewer published kernels to copy from — KDA still lands the speedup. Two of them are merged in FlyDSL."
date: 2026-06-15
authors:
  - Jin Pan
tag: KDA
---

Everything published about [KDA](/projects/kda) so far has been on NVIDIA hardware with
excellent documentation, a mature profiler and a large public corpus of prior kernels. That is
a reasonable place to start and a bad place to stop, because it leaves open the obvious
objection: perhaps the agent is retrieving, not reasoning.

So we pointed it at hardware where there is much less to retrieve. On **ASM, HIP and ROCm** —
including AMD parts with substantially thinner documentation and far fewer published kernels —
KDA still finds the optimization opportunity and still lands the speedup. Two of them are in
FlyDSL, as pull requests **#711** and **#685**.

This is the property that decides whether any of this is durable. New accelerators arrive with
no corpus at all: every new accelerator will, at some point, be something an agent has read
nothing about. A loop that works only where the answers already
exist on the internet is a search engine with extra steps. A loop that works on the thin
documentation is a method.

[KDA](/projects/kda) ·
[NVlabs/kda](https://github.com/NVlabs/kda)
