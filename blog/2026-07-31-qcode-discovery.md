---
title: QCode Discovery, made fail-closed
description: A search that reported wins on a heuristic now reports them only on an exact construction, an independent verification and a replay against established IBM baselines — 17,520 definitions across 21 lattices.
date: 2026-07-31
authors:
  - Jing Xiong
tag: Humanize
---

Search over quantum codes has an unpleasant property: the cheap metric that ranks candidates
and the expensive certificate that proves one is genuinely better are not the same thing, and
the gap between them is exactly where a long unattended run will settle if you let it.

The QCode Discovery pipeline has been moved onto the other side of that gap. It is now
**fail-closed**: verified certification, not heuristic score, is what makes a candidate a
result.

## The state of the search

- **17,520 definitions** processed across **21 lattices**;
- **5,178 winner-capable definitions** persisted for further work.

## What a win now requires

No candidate is reported as a win without all three of:

1. an **exact construction**, not a score that implies one exists;
2. an **independent verification** of that construction; and
3. a **strict final replay** that revalidates the established IBM baselines it is being
   compared against.

The third is the one that gets skipped in practice, and it is the one that catches the failure
mode we care about — a baseline that drifted, or was measured under conditions that no longer
hold, making a comparison look like a win when the only thing that moved was the reference.

This is the same discipline as everything else here: the run is allowed to be wrong, and it is
not allowed to be wrong quietly.
