---
title: Physics and quantum, formalized end to end
description: All 23 IPhO 2026 theory subproblems machine-checked in Lean 4, 36 of 36 on a blind quantum-algorithms benchmark, and 92.5% end to end on quantum information theory.
date: 2026-07-29
authors:
  - Jing Xiong
  - Zhengyang Zhang
tag: HOA
---

::: info Ongoing
The Kimi-K3 run below is still going. Everything else here is complete.
:::

Formal mathematics is where an agent loop can be checked without argument. Physics and quantum
information are the interesting extension of that, because the statements have to be
*formalized* before they can be proved — and the formalization is where a run can go wrong in a
way that a compiler will happily accept.

## IPhO 2026: 23 of 23

All **23 theory subproblems** (T1–T3) of the 2026 International Physics Olympiad were completed:
23/23 passed both semantic review and proof review, every Lean 4 file is **sorry-free**, and the
full `lake build` passed.

The change that produced it was a new **proof-to-formalization routing**. On the same 22-target
comparison, it took the run from 20/22 to **22/22** while cutting summed wall time by **62.1%**.
One additional theory target brought the final run to 23 of 23.

A separate 28-target run with a **Kimi-K3** worker has solved 23 targets through proof review,
with 24 of 28 passing formalization review. The remaining five are in retry or redraft, or have
not yet reached proof dispatch.

[The dataset](https://huggingface.co/datasets/humanfia-lab/IPHO2026)

## QAlg: 36 of 36

A **blind** run — given only the public TeX statements and the benchmark's base library, with no
access to reference solutions — produced compiling, semantically accepted, Lean-kernel-checked,
sorry-free proofs for **all 36 quantum-algorithm tasks**. The full `lake build` passed.

## QIT: 92.5% end to end

On the 40-task blind Quantum Information Theory benchmark: **38 of 40** semantic review passes
and **37 of 40** end-to-end proof review passes, for 92.5%. Conditional on semantic acceptance,
the proof rate is **97.4%** — that is, once the statement is right, the proof almost always
follows. The full `lake build` passed.

## Why "sorry-free" is reported separately from "correct"

`sorry` is Lean's placeholder for a step nobody has proved. A sorry-free result means every
theorem has an actual proof term checked by the Lean kernel, rather than an unproved claim
sitting behind a placeholder.

It does **not** by itself guarantee that the theorem faithfully matches the original problem.
That is a separate question, and it is why semantic review and proof review are counted and
reported as two numbers rather than folded into one. A perfectly checked proof of the wrong
statement is the exact failure this pair of gates exists to catch.

[HOA](/projects/hoa)
