---
title: 17,520 QCode definitions across 21 lattices
description: "QCode Discovery has searched 17,520 quantum-code definitions over 21 lattices and kept 5,178 that could win. Now nothing counts as a win without an exact construction, an independent check and a fresh replay of the IBM baselines. Humanfia-reported."
date: 2026-07-31
authors:
  - Jing Xiong
tag: Humanize

hero:
  kicker: QCode Discovery · Humanfia-reported
  value: 17520
  label: quantum-code definitions processed across 21 lattices, and a win now needs a certificate
  board:
    - { name: Definitions processed, score: 17520 }
    - { name: "Winner-capable, kept", score: 5178, us: true }
---

Search over quantum codes has an unpleasant property. The cheap metric that ranks candidates
and the expensive certificate that proves one is genuinely better are not the same thing. The
gap between them is exactly where a long unattended run will settle if you let it.

The QCode Discovery pipeline now sits on the other side of that gap. It is **fail-closed**: a
candidate becomes a result because it was certified, never because of its heuristic
score.<Sidenote>These figures come from the run's own records and have not been published
anywhere else, so we label them Humanfia-reported.</Sidenote>

## The state of the search

<StatGrid
  lead
  :items="[
    { value: 17520, kicker: 'Definitions processed', text: 'Every candidate code definition the search has scored so far.' },
    { value: 21, kicker: 'Lattices', text: 'The lattices those definitions span.' },
    { value: 5178, kicker: 'Winner-capable, kept', text: 'About three in ten: definitions persisted because they could still beat a baseline.' },
  ]"
/>

A winner-capable definition is not a win. It is a candidate that the cheap metric says is worth
the expensive check. Everything after that point is the part that changed.

## What a win now requires

<AnimatedDiagram
  view-box="0 0 720 230"
  :min-width="440"
  :max-width="820"
  kicker="Fail-closed · 3 gates · 1 way out"
  label="The fail-closed pipeline. A candidate must pass three gates in order: an exact construction, an independent verification, and a strict replay against the IBM baselines. A candidate that only has a good score is stopped at the first gate; one whose baseline has drifted is stopped at the third; a certified candidate passes all three and is reported as a win."
  :steps="[
    'A winner-capable candidate arrives with a good heuristic score. The score alone counts for nothing.',
    'Gate 1 asks for an exact construction. A score that only implies one exists is stopped here.',
    'Gate 2 verifies that construction independently.',
    'Gate 3 replays the IBM baselines it is compared against. A drifted baseline is stopped here.',
    'Only a candidate through all three gates is reported as a win.',
  ]"
>
  <path id="qc-lane" class="line dash" d="M10 120 H560" data-step="1" data-draw />
  <text class="ink" x="10" y="100" data-step="1">candidates</text>
  <g data-step="2">
    <rect class="ink" x="176" y="74" width="8" height="92" />
    <text class="ink t-lg" x="180" y="40" text-anchor="middle">1</text>
    <text class="ink" x="180" y="60" text-anchor="middle">construct</text>
  </g>
  <g data-step="3">
    <rect class="ink" x="316" y="74" width="8" height="92" />
    <text class="ink t-lg" x="320" y="40" text-anchor="middle">2</text>
    <text class="ink" x="320" y="60" text-anchor="middle">verify</text>
  </g>
  <g data-step="4">
    <rect class="ink" x="456" y="74" width="8" height="92" />
    <text class="ink t-lg" x="460" y="40" text-anchor="middle">3</text>
    <text class="ink" x="460" y="60" text-anchor="middle">replay IBM</text>
  </g>
  <rect class="grey" x="-9" y="-9" width="18" height="18" data-step="2" data-travel="#qc-lane" data-stop="0.3" data-loop />
  <rect class="grey" x="-9" y="-9" width="18" height="18" data-step="4" data-travel="#qc-lane" data-stop="0.81" data-loop />
  <g data-step="5" data-pop>
    <rect class="red" x="574" y="93" width="136" height="54" transform="rotate(-17 642 120)" />
    <text class="on-red t-lg" x="642" y="126" text-anchor="middle" transform="rotate(-17 642 120)">WIN</text>
  </g>
  <rect class="red" x="-9" y="-9" width="18" height="18" data-step="5" data-travel="#qc-lane" data-loop />
  <text class="grey" x="10" y="222" data-step="2">■ refused</text>
  <text class="red" x="400" y="222" data-step="5">■ certified</text>
</AnimatedDiagram>

<PostCards numbered>
<PostCard title="An exact construction.">

The code itself, written out, not a score that implies one exists.

</PostCard>
<PostCard title="An independent verification.">

The construction is checked again, by something other than the process that found it.

</PostCard>
<PostCard title="A strict final replay." invert>

The established IBM baselines the candidate is compared against are revalidated, in the same
run, before the comparison is allowed to stand.

</PostCard>
</PostCards>

The third gate is the one that gets skipped in practice, and it catches the failure mode we
care about most. A baseline drifts, or was measured under conditions that no longer hold, and
a comparison looks like a win when the only thing that moved was the reference.

> The run is allowed to be wrong. It is not allowed to be wrong quietly.

This is the same discipline as everything else here, and the same one the
[KDA² hardening](/blog/2026-09-27-kda-for-kda) arrived at for kernels: an agent optimizes the
score it is given, so the score has to be the certificate.
