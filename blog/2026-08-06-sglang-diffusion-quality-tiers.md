---
title: A quality tier, so the fast kernel can ship at all
description: Most profitable diffusion fusions change the output at the level of bf16 rounding order — enough to fail a bitwise CI, not enough for a human to see. So we gave the request a quality tier instead of arguing about the diff.
date: 2026-08-06
authors:
  - Xiangyu Zhang
tag: KDA
---

A large share of the profitable kernel fusions in a diffusion serving stack change the output
only at the level of **bf16 rounding order**. Folding the FFN tanh-GELU into the up-projection
GEMM as a cuBLASLt epilogue is the canonical example: mathematically the same computation, a
different order of operations, and therefore a different last bit.

SGLang's diffusion CI compares generated images **bitwise** against the diffusers ground truth.
So none of these fusions could ever land on the default path. This is not hypothetical — an
ungated FLUX GELU fusion was merged as
[#28166](https://github.com/sgl-project/sglang/pull/28166) and reverted in
[#28708](https://github.com/sgl-project/sglang/pull/28708) for exactly this reason.

The usual next move is to argue about the tolerance in CI. That trade is bad in both
directions: loosen it and the guarantee everyone relies on is gone, keep it and a whole class
of real speedups is unshippable.

## The tier

[#33453](https://github.com/sgl-project/sglang/pull/33453) adds a per-request
`--quality {lossless, high}` tier:

- **`lossless`**, the default, stays byte-identical to the reference implementation. The
  ground-truth CI stays green and nobody's guarantee changed.
- **`high`** opts into validated fast paths whose deviation is bounded and visually
  indistinguishable.

"Visually indistinguishable" is a claim, so it has a gate: a same-seed full-image **PSNR above
25 dB** is required, and **34–58 dB** was measured across every PR shipped under the tier.
Side-by-side samples are in each one.

The general lesson is not about diffusion. When correctness is a spectrum and the CI has to be
a boolean, the fix is usually to make the request say which end of the spectrum it wants —
rather than to move the boolean.

[KDA](/projects/kda) · [the PR](https://github.com/sgl-project/sglang/pull/33453)
