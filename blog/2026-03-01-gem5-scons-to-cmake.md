---
title: One person, some agents, and gem5's build system
description: A full migration of gem5's build system from SCons to CMake — 567 files changed, one engineer, and agents running for weeks.
date: 2026-03-01
authors:
  - Sihao Liu
tag: Humanize 1
---

gem5's build system was migrated from SCons to CMake in full: **567 files changed**, by one
engineer and a set of agents running for weeks.

This is the oldest result on this page and, for what we were trying to learn, one of the most
useful — because a build-system migration is the least glamorous long-horizon task there is,
and it has almost none of the properties that make a benchmark flattering.

There is no clever insight to have. There is no moment where a good idea collapses the search.
There is a very large number of mechanical changes, each of which is easy, and a build that
either works or does not, and a long stretch in the middle where it does not work for a reason
that has nothing to do with the change you just made.

Work of that shape is exactly where a session that starts fresh every turn falls apart, where a
run that keeps everything in context drowns, and where an agent left unsupervised will
eventually declare victory on a build that compiles a subset. It is the reason we started
caring about the loop rather than the model, and it is the kind of task
[FlowBench](/projects/flowbench) is being assembled out of.

One engineer, some weeks, 567 files, and a build that works.
