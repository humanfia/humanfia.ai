---
title: Four layers and a referee
description: How Humanfia is put together — a runtime, a flowverse, a benchmark and two applications — and why the arrow from the benchmark back into the flows is the only part that matters.
date: 2026-08-17
authors:
  - Humanfia
tag: Architecture
---

A month ago this site said we were building two things: a terminal agent and a review loop.
Since then the shape of the work has changed enough to be worth redrawing, so here is the
whole of it in one picture and about a thousand words.

<ArchStack />

## What changed

The July version of Humanfia was a coding agent with a good workflow inside it. Building it
taught us something inconvenient: the workflow was the valuable part, and putting it inside a
binary was the worst possible place to keep it. You cannot read it, you cannot fork it, you
cannot publish yours, and — the one that actually hurt — you cannot measure it against
somebody else's.

So we took it apart along that seam.

The loop became a **flow**: a directory of Python that says what each agent is asked, in what
order, and when to stop. The thing that runs it became a **runtime** that drives whichever
coding-agent CLI you already log into, rather than replacing it. And because flows are now
comparable objects, we could finally do the thing we wanted all along, which is find out which
ones are actually better.

## The layers

**Backends.** Ten coding-agent CLIs — `claude`, `codex`, `dsh`, `kimi` and the rest — driven
through the interfaces they already serve. We hold no API key and talk to no model provider.
The frontier moves every few weeks; the wrapper around one vendor is the least valuable thing
in this diagram.

**Runtime.** [Humanize 2](https://docs.humanfia.ai/humanize2/) opens and resumes sessions, takes turns in the
order a flow asks for, puts work in a container or on another machine when it should, and
writes the whole run down as it happens so it reads back as a timeline. Its documentation is
at [docs.humanfia.ai/humanize2](https://docs.humanfia.ai/humanize2/).

**Flows.** [The flowverse](https://docs.humanfia.ai/humanize2/guide/flowverses): [RLAR](https://github.com/humanfia/flowverse),
[Flame Chase](https://github.com/humanfia/flowverse), [Humanize 1](https://github.com/humanfia/flowverse), and the loops everyone
already uses, kept alongside so a comparison is a flag rather than a reimplementation.

**Applications.** [KDA](/projects/kda) for GPU kernels and [HOA](/projects/hoa) for
olympiad mathematics. Both chosen because the scoreboard belongs to somebody else.

## Why the benchmark is a layer and not a report

[FlowBench](/projects/flowbench) sits alongside the stack rather than on top of it, and the
arrow that matters is the one going back up.

There is a well-known trick where you start a fresh session every turn so nothing carries over
and the agent cannot talk itself into a hole. Everybody has heard of it. Nobody has published
what it is worth. Ask how much better it is than holding one session, on a task that takes a
day, at a given model, and the honest answer is a shrug and an anecdote.

That is the state of the entire field of agent methodology, and it is unusual — imagine
compilers with strongly held opinions about loop unrolling and no benchmark suite.

So: the method becomes the variable, everything else is held fixed, the tasks are long enough
that the loop matters more than the model, and the scoring is done by something real rather
than by another language model asked to be a judge. The flow that wins becomes a default. The
flow that loses gets deleted, including ours.

That last clause is the whole design. A benchmark that ranks things is a scoreboard. A
benchmark whose winner becomes the next default is a flywheel — and it means our opinions have
to survive contact with a number, every time.

FlowBench is not released yet. When it is, the first thing published will be the numbers for
the flows on this site, whether or not they flatter us.

## The part that keeps us honest

The applications are not demos. They are the reason any of this is trustworthy.

Every layer below them can be evaluated with numbers we chose ourselves, and numbers you
choose yourself have a way of going up. A Lean 4 kernel does not care what we intended. A
contest deadline does not care. A public leaderboard does not care. So far that has produced
[all six IMO 2026 problems formally verified](/projects/hoa),
[670 of 672 on PutnamBench](/blog/2026-06-26-putnambench), and top-three track placements at the
MLSys 2026 FlashInfer kernel contest with MIT HAN Lab.

They are also where the hard tasks come from. A benchmark assembled out of a domain nobody
works in decays into a puzzle collection within a year. Ours is assembled out of work we were
doing anyway.

## What is next

- **FlowBench, released**, with the first cross-flow numbers.
- **More flows**, including several that only exist because a trace showed us where an
  eleven-hour run went wrong.
- **More applications**, on the same rule: somebody else keeps the scoreboard.

Everything is at [github.com/humanfia](https://github.com/humanfia). If you have a loop you
think beats ours, we would genuinely like to see it — that is the entire point of publishing
the ones we have.
