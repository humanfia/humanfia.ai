---
title: "Six KDA pull requests land in SGLang, the best adding 8.7% end to end"
description: "Since August, SGLang has merged six pull requests carrying kernels our agents wrote, and the MLSys contest kernels are now public with a benchmark anyone can rerun. One upstream merge was reverted the next day."
date: 2026-10-01
authors:
  - Xiaoyu Zhang
  - Dongyun Zou
tag: KDA
achievement:
  topic: SGLang
  value: 8.7
  prefix: "+"
  decimals: 1
  suffix: "%"
  label: "Throughput from one KDA kernel in SGLang"
  body: "Qwen3.5-4B at concurrency 1, from one of six KDA pull requests SGLang merged since August."
---

A kernel that wins a benchmark is a claim. A kernel a maintainer merges into the engine people
serve models with is something else. That is the bar this post is about. Since August, six
pull requests carrying [KDA](/projects/kda)-written kernels have been merged into
[SGLang](https://github.com/sgl-project/sglang), all from Xiaoyu Zhang. We also count one
merge elsewhere that did not stay.

## Into SGLang

| Pull request | What it does | Measured |
| --- | --- | --- |
| [#36865](https://github.com/sgl-project/sglang/pull/36865) | NVFP4 GEMM for Qwen3.x on SM120 | 1.319× kernel geomean over 16 production shapes; Qwen3.5-4B output throughput **+8.73%** at concurrency 1, +6.5% at 8 |
| [#38082](https://github.com/sgl-project/sglang/pull/38082) | FP8 skinny GEMM on SM120 | end to end +0.2% to **+4.06%** across five models |
| [#41305](https://github.com/sgl-project/sglang/pull/41305) | SANA-Video residual-gate add on H200 | **2.54×** on the two real SANA-Video layouts; −1.7% end-to-end time |
| [#41459](https://github.com/sgl-project/sglang/pull/41459) | LTX-2.3 QK norm + split RoPE on H200 | **2.58×** to 2.61× kernel geomean; −1.0% to −1.2% end-to-end time |
| [#36845](https://github.com/sgl-project/sglang/pull/36845) | QSA decode on SM121 (GB10) | a correctness fix: the old path silently corrupted long-context decode |
| [#37385](https://github.com/sgl-project/sglang/pull/37385) | registers the merged agent kernels under a `KernelBackend.KDA` | provenance, so the engine records which kernels an agent wrote |

Two things in that table are worth reading slowly.

**A kernel speedup is not a model speedup.** The two diffusion kernels are about 2.5× faster
on their own and save one to two percent of a whole video generation, because they are a
small part of it. Both pull requests report both numbers, and #41305 kept a kernel only if
end-to-end time improved by at least 1.5% in both of its measurement groups.

**A pull request can get smaller under review.** #41305 began with 40 kernel families. It
merged with one, after every family that showed a measured regression, or had no established
end-to-end benefit, was taken out. The other 39 are listed in its
[selection record](https://github.com/BBuf/sglang/blob/42d1d19e5f876e7b5977fb55d90073230bce1655/diffusion-prs/kda-residual-gate-h200-20260927/selection.json).

Three of the six (#36845, #41305 and #41459) credit the kernel to KDA running with Codex and
**Kimi K3**.

## The contest kernels, public

The MLSys 2026 FlashInfer contest kernels are now
[public](https://github.com/mit-han-lab/mlsys2026-flashinfer-contest-solution) (Dongyun Zou),
as release **KDA 0.5**, with a benchmark that pins the human winners' own repositories and
refuses to run if they are modified. On B200, as the geometric mean over the official
workloads:

| Track | KDA 0.5 over the FlashInfer baseline | KDA 0.5 over the best human entry |
| --- | ---: | ---: |
| GDN prefill | 10.36× | **1.688×** |
| MoE, FP8 block scale | 1.57× | **1.173×** |
| DSA sparse attention | 38.33× | **1.408×** |

The repository [states its own caveats](https://github.com/mit-han-lab/mlsys2026-flashinfer-contest-solution#results),
and they apply here:

- The timing is CUPTI kernel spans. The contest was scored by the organizers' wall-clock
  harness, so these are not contest scores.
- The kernels are tuned to the official shapes, so do not expect the same speedups elsewhere.
- The pinned human repositories are a few commits past the contest deadline.
- The repository numbers its releases from 0.1, the original contest entry. Our [August post](/news/2026-08-02-kda-15-past-human-sota)
  called the same two generations KDA 1.0 and 1.5, and reported 1.25× to 1.39× over the human
  entries on B300 under a different protocol. The two tables are not comparable, and the MoE margin is smaller in this one.

## One merge that did not stay

On 27 August, [svg-project/flash-kmeans#23](https://github.com/svg-project/flash-kmeans/pull/23)
merged a KDA-generated CuTe backend for Flash-KMeans, measured at **7.31×** on a real
LongCat-Video workload on B200. The next day the maintainer
[reverted it](https://github.com/svg-project/flash-kmeans/pull/24) to keep the repository
simple and asked for it to go to FlashLib instead. That has not happened yet. So, for now, it
is not upstream.

## And the long version

How our agents wrote Kimi Delta Attention kernels up to 2.96× faster than FlashKDA on B300, and
how they tried to cheat along the way, is in
[KDA²: KDA optimizes KDA](/blog/2026-09-27-kda-for-kda).

[KDA](/projects/kda) · [kernel-design-agents](https://github.com/mit-han-lab/kernel-design-agents)
