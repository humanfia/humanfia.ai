---
title: "Full marks on five science exams, and the fine print on every one"
description: "IPhO 2026 theory 30 of 30, IChO 2026 formalized 68 of 68, IOI 2026 six of six, IBO 2024 theory 100 of 100, and quantum information theory 40 of 40. What each score is, who graded it, and what it does not show."
date: 2026-10-05
authors:
  - Jing Xiong
  - Zhengyang Zhang
  - Ligeng Zhu
tag: HOA
---

Since July, the same open harness has finished IPhO and the quantum run we reported then, and
has been pointed at three more olympiads. Each one reached the top of its own scale. **None of these scores came from an official
jury,** and the scales are different, so each comes with a note on what was graded and by
whom. The notes matter as much as the numbers.

| Exam | Result | Graded by |
| --- | --- | --- |
| IPhO 2026, theory | 30.00 / 30.00, both GPT-5.6 Sol and Kimi K3 Max | our audit against the official marking scheme |
| IChO 2026, theory | 68 / 68 subquestions formalized in Lean, both models | Lean, plus our own review gates |
| IOI 2026 | 6 / 6 problems at 100% | Codeforces |
| IBO 2024, theory | 100 / 100 tasks; 400 / 400 verdicts match the key | the official answer key |
| QIT | 40 / 40 tasks proved in Lean | Lean, plus automated semantic review |

## IPhO 2026: 30 of 30 on theory

Both the GPT-5.6 Sol and the Kimi K3 Max runs answered all 23 theory subparts and scored
**30.00 / 30.00** ([GPT](https://github.com/humanfia/ipho2026/blob/main/NaturalLanguage/GRADING_REPORT.md),
[Kimi](https://github.com/humanfia/ipho2026/blob/main/Kimi/NaturalLanguage/GRADING_REPORT.md)).
The workers never saw the official solutions or marking schemes. Those came in only after the
runs had finished, for grading.

The caveat is the grader. These are
[our own estimates](https://github.com/humanfia/ipho2026#results) against the official
solutions and itemized marking schemes, not a jury's adjudication.

The Lean side went further than in July. The formal release splits the paper more finely, into
**41 parts**, and every one of them now has a Lean formalization. Formalizing is harder than answering, and the two models separate here: the
GPT-5.6 Sol formalizations are estimated at
[47.45 / 50](https://github.com/humanfia/ipho2026/blob/main/GRADING_REPORT.md), Kimi's at
[29.90 / 50](https://github.com/humanfia/ipho2026/blob/main/Kimi/GRADING_REPORT.md). Every
proof elaborates without `sorry`, `admit` or custom axioms.

## IChO 2026: 68 of 68 formalized, and a baseline that shows why it matters

All **68** numbered theory subquestions across the nine problems now have Lean formalizations
that passed both formalization review and proof review, for
[GPT-5.6 Sol](https://github.com/humanfia/icho2026/tree/main/gpt-5.6-sol-full68-formalization)
and for Kimi-K3 ([32 answer-blind](https://github.com/humanfia/icho2026/tree/main/kimi-k3-answer-blind)
plus [36 more](https://github.com/humanfia/icho2026/tree/main/kimi-k3-nl-36-formalization)).
The comparison that matters is the same models without the review loop. Run as a plain
Codex `/goal` on the same 68 targets, they had
[32 / 68](https://github.com/humanfia/icho2026/tree/main/gpt-5.6-sol-native-goal68) and
[31 / 68](https://github.com/humanfia/icho2026/tree/main/kimi-k3-native-goal68) accepted.

The fine print:

- **68 / 68 is formalization coverage, not answer accuracy.** Lean checks deductions from the
  encoded inputs. It does not certify that the encoding matches the official chemistry.
- **Not every target came from the original inputs alone.** GPT has 66 targets from the
  original inputs and 2 conditional ones. One of the conditional targets, T8-A8, uses two
  disclosed contest-model axioms that we authorized.
- **Kimi's 68 is two campaigns.** One is 32 answer-blind targets; the other formalizes 36
  natural-language answers Kimi had already written. Three of those 36 are conditional and two
  carry authorized answer corrections.
- **The answer scores are generous and unofficial.** Graded against the official key with
  credit for equivalent forms and reasonable rounding, GPT scores
  [424.5 / 437](https://github.com/humanfia/icho2026/blob/main/gpt-5.6-sol-full68-formalization/grading/GRADING.md)
  and Kimi [417.5 / 437](https://github.com/humanfia/icho2026/blob/main/kimi-k3-max/GRADING.md).

## IOI 2026: six of six

All six problems over both days
[passed at 100%](https://github.com/humanfia/ioi2026#results) when the final submissions were
judged on [Codeforces](https://codeforces.com/). The
[annotated solutions](https://github.com/humanfia/ioi2026/blob/main/solutions/README.md) state
the guarantee each one meets. What you can check yourself is narrower: the repository's
`verify.sh` compiles all six and replays every released example. Codeforces' hidden tests
remain the external check, and the verdicts are not linked publicly.

## IBO 2024: 100 of 100 theory tasks

All 100 Theory A and B tasks were solved. All **400** true/false verdicts
[match the official answer key](https://github.com/humanfia/ibo2024/blob/main/GRADING.md),
with zero extraction errors. Two limits apply. The practical exams are excluded entirely, and
this is agreement with an answer key, not an official points total. It is also the 2024 paper,
because IBO withholds each paper for two years. A paper that has been public that long may
appear in a model's training data.

## Quantum information theory: 37 of 40 is now 40 of 40

In July, the blind QIT run stood at 37 of 40 end to end. After repair it is
[**40 / 40**](https://huggingface.co/datasets/humanfia-lab/QIT), alongside 36 / 36 on quantum
algorithms ([QAlg](https://huggingface.co/datasets/humanfia-lab/QAlg)). Every task compiles,
has a complete proof with no `sorry` or `admit`, and passes a full `lake build`. The caveat
is the one we drew in July: the semantic review, which judges whether a formal statement says
what the problem says, is automated, not an independent human audit.
[Both sets rebuild with one script](https://github.com/humanfia/lean-qit-qlg).

[IPhO 2026](https://github.com/humanfia/ipho2026) · [IChO 2026](https://github.com/humanfia/icho2026) ·
[IOI 2026](https://github.com/humanfia/ioi2026) · [IBO 2024](https://github.com/humanfia/ibo2024) ·
[HOA](/projects/hoa)
