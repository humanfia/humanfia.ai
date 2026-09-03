---
title: Forty operators into SGLang
description: Six shipped kernel PRs with the numbers attached — router tokenization, allreduce fusion, NVFP4 fused-MoE, KDA prefill, progressive diffusion and a VAE decode — with another twenty operators running.
date: 2026-06-05
authors:
  - Xiaoyu Zhang
tag: KDA
---

More than **40 operators** optimized and merged into SGLang, with another batch of twenty
running for GLM5.2. These are the six worth showing the numbers for.

**Router long-context tokenization dedup** —
[#28744](https://github.com/sgl-project/sglang/pull/28744). Idle TTFT: −29% at 60k, −41% at
125k. Under load at 60k: −34% to −49%.

**Qwen3-Next FlashInfer allreduce fusion** —
[#22664](https://github.com/sgl-project/sglang/pull/22664). Throughput +71.4%; mean TTFT
456.24 ms → 167.54 ms, about −63.3%.

**Cohere2Moe NVFP4 fused-MoE** —
[#27401](https://github.com/sgl-project/sglang/pull/27401). Throughput +26% on chat, +21% on
summarization; against vLLM, +4.1% and +6.8%.

**Kimi Delta Attention CuteDSL prefill** —
[#27488](https://github.com/sgl-project/sglang/pull/27488). 1.08× to 1.52× over Triton.

**Spectral Progressive Diffusion** —
[#27524](https://github.com/sgl-project/sglang/pull/27524). Denoising: FLUX.1 1.63×, FLUX.2
1.77×, Z-Image 2.07×, Wan 2.32×, Qwen-Image 1.6×.

**LTX-2 VAE decode, channels-last-3d** —
[#27431](https://github.com/sgl-project/sglang/pull/27431). Decode 5.41 s → 3.84 s, about
1.41×; latency about −29.0%.

## Why an upstream PR is the test we like most

A contest track is scored by a harness we can read. A production serving framework is scored by
maintainers who did not ask for the change, do not care that an agent wrote it, and will reject
it if it is slower on a shape we did not think about, harder to maintain, or wrong. Every
number above survived that.

[KDA](/projects/kda) · [KDA-Pilot](https://github.com/BBuf/KDA-Pilot)
