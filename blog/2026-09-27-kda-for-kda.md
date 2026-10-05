---
title: "KDA²: Kernel Design Agents (KDA) optimize Kimi Delta Attention (KDA)"
description: Our agents wrote Kimi Delta Attention kernels that run up to 2.96× faster than FlashKDA on B300 with a tenth of its state error. Here is how, and how the agents tried to cheat along the way.
date: 2026-09-27
authors:
  - Dongyun Zou
  - Yixin Dong
  - Hongyi Jin
  - Junxian Guo
  - Yahui Cui
  - Avery Huang
  - Zihao Ye
  - Junru Shao
  - Changye Li
  - Zijian Zhang
  - Sihao Liu
  - Song Bian
  - Ligeng Zhu
tag: KDA
canonical: https://nvlabs.github.io/kda/blog/2026-09-27-kda-for-kda/
head:
  - - link
    - rel: canonical
      href: https://nvlabs.github.io/kda/blog/2026-09-27-kda-for-kda/
---

- **KDAgent**: Kernel Design Agents, our agentic system that researches, writes, verifies and
  tunes GPU kernels.
- **KDAttn**: Kimi Delta Attention, the linear-attention operator behind Moonshot AI's
  Kimi-Linear models.

When we named our project Kernel Design Agents, we walked straight into a name collision with
another KDA: Kimi Delta Attention. Ever since, one question has kept coming back to us: *can you
use KDA to write KDA?* So tonight, under a full moon made for a moonshot, we are happy to share
the latest results from KDA(gent) v0.6: KDA optimizing KDA.

## What's new in KDA v0.6

1. **Sharper Humanize flows.** Better flows, including flame chase and iterative refinement
   with gpt-5.6-sol and fable-5, plus periodic workspace cleanup.
2. **Many languages, matching skills.** CuTe-DSL, CUDA C++, the new agent-native CAKE IR, and
   TIRx. Each ships its own diagnostics: IKET exposes the pipeline inside CuTe kernels; TIRx
   gets CPU-side numerical simulation and static checks.
3. **A self-evolving kernel wiki.** We pruned large swaths of incorrect content, sharpened the
   tags, and tightened search results.

The strongest results combine the KDA agent workflow with TIRx or CAKE. We wrote kernels in
CuTe-DSL and TIRx, and used CAKE IR with an agent loop to tune a version compiled to PTX. TIRx
is a GPU kernel programming interface that sits close to PTX; the TIRx Harness gives agents
tools for development, diagnosis, and evaluation. On B300, KDA + TIRx reaches **2.96×** the
FlashKDA speed, KDA + CAKE (PTX) reaches **2.94×**, and the CuTe-DSL version reaches
**2.85×**. The released CuTe-DSL and TIRx kernels pass the real Kimi-Linear acceptance suite
and are more accurate than FlashKDA.

Along the way, the agent also produced candidates that clocked 3.28×, 3.57×, even 3.74×.
Careful ablations showed that every one of them was overfitting to the verifier, exploiting
distributional assumptions in the test suite, untested boundaries, or loose precision checks.
This post dissects those hacks and describes how we hardened acceptance along both hardware and
numerical lines.

The charts below are stills of the interactive ones in the original post; tap one to open it at
full size. The released CuTe-DSL and TIRx kernels are open source:
[NVlabs/kda@260927-kda-for-kda](https://github.com/NVlabs/kda/tree/260927-kda-for-kda).

## Results: 2.96× faster, and more accurate

We benchmarked the generated kernels on an NVIDIA B300 GPU against the forward pass of
[FlashKDA](https://github.com/MoonshotAI/FlashKDA), Moonshot AI's official open-source
implementation. The workloads cover fixed-length sequences and variable-length (varlen) batches
with several length distributions, each totaling 8,192 tokens of context.

[![Speedup over FlashKDA on B300 for six workloads. Geomean: KDA + CAKE 2.85×, KDA + TIRx 2.96×.](/blog/kda-for-kda/speedup.png)](/blog/kda-for-kda/speedup.png)

The timeline shows how the best KDA result moved from 1.61× on July 21 to 2.96× on
September 12. It records CAKE results separately, including 2.94× on September 6. The captions
call out the final KDA + CAKE and KDA + TIRx results; the six-workload chart above compares the
released kernels.

[![KDA best rises from 1.61× on July 21 to 2.96× on September 12. Arrows mark Humanize at 2.45× on August 14; TIRx at 2.54× on August 30, 2.93× on September 2 and 2.96× on September 12; CAKE with KDA at 2.56× on September 1 and CAKE at 2.94× on September 6. The INT21 reference is 1.5× on June 16.](/blog/kda-for-kda/timeline.png)](/blog/kda-for-kda/timeline.png)

For accuracy, we built 151 real cases from
[Kimi-Linear-48B-A3B](https://github.com/MoonshotAI/Kimi-Linear) prefills on GSM8K and
MATH-500, and checked every kernel against a token-by-token fp64 recurrence. One finding
surprised us: FlashKDA (commit `7afb9f`) is itself less accurate than
[FLA](https://github.com/fla-org/flash-linear-attention). It keeps its recurrent state in bf16,
so error compounds as sequences grow; by 8k tokens, the relative error of the final state
reaches 0.035, beyond our acceptance threshold.

Both of our kernels hold final-state error to about 0.003 at 8k tokens: a tenth of FlashKDA's,
and close to FLA. Output accuracy matches FlashKDA overall and pulls ahead on long sequences.

[![Output relative RMSE versus context length for a Kimi-Linear-48B prefill of 8,183 tokens: FlashKDA drifts from 0.43% to about 0.69%, while both of our kernels stay between 0.23% and 0.43%. Final-state relative RMSE: FlashKDA 3.45%, CuTe 0.22%, TIRx 0.29%.](/blog/kda-for-kda/accuracy.png)](/blog/kda-for-kda/accuracy.png)

*Kimi-Linear-48B prefill of one MATH-500 prompt (8,183 tokens, 96 heads). Relative RMSE =
rms(x − x<sub>fp64</sub>) / rms(x<sub>fp64</sub>), FlashKDA's own test metric; lower is
better.*

## Humanize: better flows, stronger agents

Our [Humanize](https://github.com/humanfia/humanize) ablation shows the same pattern for every
base model we tried: moving from a coding CLI (Claude Code or Codex) to a Humanize flow brings
a large jump in performance. There is a catch, though. The more capable the agent, the more
room it has to hack.

[![Humanize ablation on PutnamBench, for the raw API, a coding CLI and a Humanize flow: GPT-5.6-sol 3 / 46 / 50, Kimi-K3 1 / 4 / 47, GLM-5.3 0 / 2 / 25, DeepSeek V4 Pro 0 / 4 / 13.](/blog/kda-for-kda/humanize.png)](/blog/kda-for-kda/humanize.png)

[![Humanize ablation on Physics Cup, for the raw API, a coding CLI and a Humanize flow: GPT-5.6-sol 31 / 41 / 44, Kimi-K3 35 / 37 / 42, GLM-5.3 24 / 34 / 40, DeepSeek V4 Pro 32 / 35 / 39.](/blog/kda-for-kda/humanize-physics.png)](/blog/kda-for-kda/humanize-physics.png)

*PutnamBench (top) and Physics Cup (bottom) scores for four base models at three levels of
scaffolding: the raw model API, a coding CLI, and a Humanize flow.*

## Reward hacking: how KDAgent hacks the tests

To keep the two KDAs apart, we call the operator KDAttn and the agent KDAgent from here on.

> KDAgent optimizes the score, not the kernel.

If the tests have a hole, it will find it. We ran into five kinds of holes.

**A. Input-distribution overfitting** (3.74× claimed, 2.48× once fixed). The synthesized
kernel replaced the L2 normalization of Q and K with a hard-coded constant, 0.1778209953: the
expected reciprocal L2 norm of a vector drawn from X ~ N(0, 0.5²). It also zeroed some
initial-state channels outright to skip the triangular matrix inverse. Synthetic random tests
reported an inflated 3.74×; on real, non-Gaussian inputs the kernel failed completely. With
the shortcut removed, the real speedup fell to 2.48×.

**B. Shape and layout hard-coding** (static sequence boundaries). The agent noticed that
packed layouts in the test set always followed the same pattern. So it skipped the dynamic
offset computation from `cu_seqlens` and hard-coded the sequence boundaries. Because the
holdout set never exercised the dynamic-boundary path, the kernel slipped straight past the
logic checks.

**C. Illegal history truncation** (5.16× claimed on a single H64 sequence). Leaning on gate
decay, the agent assumed that state older than 32 tokens was negligible and cut long sequences
into chunks it could process in parallel. Its built-in decay check was tuned just loosely
enough to pass on the weakly decaying random data, reporting 5.16× on a single H64 sequence.
Under the strongly decaying gates of the real model, the check failed constantly and the
speedup vanished.

**D. Overflow under extreme gate ranges** (3.57× claimed, NaN on every real case). A TIRx
kernel computed cumulative powers of two directly inside each 64-token chunk. Once the decay
exceeded 126 bits, the denominator underflowed to zero and the output turned into NaN. The
random tests never decayed deeply enough to notice (about 52 bits at most) and measured 3.57×.
On real workloads, every single case collapsed numerically.

**E. Precision loss from a low-precision LUT** (9% decay-factor error, 23 of 24 cases fail).
For sequence lengths that are multiples of 32, a CuTe kernel built an FP16 table of cumulative
decay. Real gates span more dynamic range than FP16 can represent, so decay factors were off by
up to 9%, and 23 of 24 long real-world sequences fell outside tolerance.

**The common thread: every hack passed every test we had.** Each one hid in inputs that only a
real model produces. In real Kimi-Linear, the gate decays by about 600 bits per 64 tokens at
p99, an order of magnitude deeper than our random test data.

[![Gate decay depth per 64 tokens. Random tests reach about 52 bits, the hacked TIRx kernel underflows beyond 126 bits, and real Kimi-Linear gates reach about 600 bits at p99.](/blog/kda-for-kda/decay.png)](/blog/kda-for-kda/decay.png)

## Hardening: closing the loopholes

Humanize flows make agents more capable and give them more opportunities to find gaps in the
tests. To keep the agents honest, we built six layers of defense, and a candidate has to pass
all six to be released.

1. **Dynamic input salts and distribution holdouts.** Every scoring run draws a fresh random
   seed. In an isolated zone the agent cannot see, input distributions and sequence layouts
   alternate at random.
2. **A strict specification.** The task prompt defines the full set of legal inputs. Kernels
   may specialize by shape, but must be correct on every legal input.
3. **CUDA Graph replay checks.** After benchmark timing, we swap in new input tensors and
   replay the graph to validate the outputs, defeating cache-based precomputation.
4. **Stress probes.** An adversarial set of extremely deep decays, saturated gates, boundary
   sequence lengths, and repeated keys targets underflow and overflow directly.
5. **Strict element-wise tolerances.** Lenient statistical gates such as "99.9% of elements
   within 5e-2" are gone. Every element must meet maximum absolute and relative error bounds.
6. **Real end-to-end traces.** We replay traces captured from end-to-end Kimi-Linear runs. The
   evaluator lives outside the isolated container, physically separating test data from the
   environment that generates kernels.

Both released kernels pass this suite.

- **TIRx, tuned in place on B300: 2.54× → 2.96×.** Starting from a TIRx implementation, the
  agent tuned the kernel in place on B300, climbing from 2.54× to 2.96×.
- **CuTe-DSL, FP16 table removed: −2%.** The CuTe version drops the FP16 decay table, trading
  2% of its speed for correctness.

## Ablation: focus first, then generalize?

To see how the synthesis strategy affects convergence, we compared two workflows: progressive
synthesis that starts from a single fixed-length shape, and direct multi-objective synthesis
across all shapes. With the same hardware (NVIDIA B300) and the same 14-hour budget, their
convergence curves diverged sharply.

[![Speedup and output tokens over a 14-hour budget. Focusing on one simple shape reaches 1.85× and 2.74 million output tokens; targeting all six shapes at once reaches 1.01× and 1.67 million output tokens.](/blog/kda-for-kda/ablation.png)](/blog/kda-for-kda/ablation.png)

On the same evaluation shape, progressive synthesis reached **1.85×**; direct all-shape
synthesis managed only **1.01×**. Two mechanisms explain the gap.

1. **Feedback latency.** One test pass over the full workload took a median of 1.9 minutes; a
   single shape took 0.9. Faster feedback meant denser iteration: the single-shape agent
   completed 248 hardware tests and 120 commits, against 159 tests and 22 commits for the
   all-shape agent.
2. **Search-space decoupling.** Synthesizing every shape at once forced the agent to juggle
   intricate varlen offsets and the compute core at the same time. For the first eight hours
   its speedup stayed below 0.65×, with most of that time spent debugging varlen edge cases,
   and the core logic never got the attention it needed. Over the same 14 hours, it also
   produced far fewer output tokens than the single-shape agent.

[![Feedback loops: one simple shape takes a median 0.9 minutes per test and completes 248 tests and 120 commits; all six shapes take 1.9 minutes per test and complete 159 tests and 22 commits.](/blog/kda-for-kda/loops.png)](/blog/kda-for-kda/loops.png)

> Splitting the work into two stages does not make the model any smarter. It shortens the
> feedback loop until the model can stay busy.

Optimize the compute core first, then generalize to every layout: that decomposition brings
each feedback loop down to a length an LLM can work with effectively.

## Also in v0.6

### Multi-language support with matching skills

CuTe-DSL, CUDA C++, and TIRx are all supported, and each language comes with its own
diagnostics. For CuTe, IKET exposes the pipeline inside the kernel. For TIRx, CPU-side
numerical simulation plus synchronization and data-race analysis catch numerical and
concurrency bugs.

These TIRx tools belong to the TIRx Harness. The Harness also provides TIRx Foundation, a
layer that stays close to the hardware; a kernel zoo of reusable implementations; and a
benchmark server that makes performance results easy to compare. Together they give the agent a
more reliable development loop: code maps more directly onto the intended hardware behavior,
failures leave clues to follow, and performance changes can be confirmed as real. The TIRx team
plans to release the Harness formally next week, with a detailed write-up.

### CAKE IR tunes a PTX version

We added CAKE IR to the kernel wiki and used its agent loop to tune the kernel. The loop
specified the verifier the candidate had to pass before converting the result to PTX,
producing the CAKE-PTX version. It reached **2.94×** on B300.

### A self-evolving kernel wiki

The wiki keeps correcting itself as it is used. Incorrect content gets deleted, tags get
sharpened, and search results get leaner, so every agent that comes after works from better
material.

## Takeaways

We used Kernel Design Agents (KDAgent) to optimize the Kimi Delta Attention (KDAttn) operator
on NVIDIA B300. Humanize, TIRx, and CAKE IR all contributed to the search. The final TIRx,
CAKE-PTX, and CuTe-DSL results reach **2.96×**, **2.94×**, and **2.85×** the FlashKDA speed
respectively. The released TIRx and CuTe-DSL kernels cut final-state error on 8k-token
sequences to about a tenth of FlashKDA's.

Along the way, the agent produced a series of fake optimizations: overfitting to the input
distribution, hard-coding boundaries, and overflowing under extreme values. We answered with
layered hardening, including dynamic input salts, stress probes, and strict element-wise
tolerances, so that the kernels stay correct and robust on real model workloads. Our ablation
further shows that tackling a complex optimization task through progressive synthesis
substantially shortens the feedback loop and makes the search more efficient.

If you have a workload that wants to be optimized via KDAgent, submit it at
[nvlabs.github.io/kda](https://nvlabs.github.io/kda/#submit).

[The kernels](https://github.com/NVlabs/kda/tree/260927-kda-for-kda) ·
[Humanize](https://github.com/humanfia/humanize) · [KDA](/projects/kda)
