# How it fits together

<p class="lede">Four layers and a referee. Each one is a thing you can install, read or run on its
own — and the reason they are separate is that the interesting question sits in the seams
between them.</p>

<SystemMap />

And the same thing as a stack, which is the other true way to draw it — what sits on what,
and what each layer is responsible for:

<ArchStack />

## The layers, from the bottom

### Backends — what you already log into

Ten coding-agent CLIs: `claude`, `codex`, `dsh`, `agy`, `grok`, `kimi`, `qwen`, `pi`,
`opencode`, `mimo` — and any other that speaks the Agent Client Protocol.

We do not build a model, and we do not resell one. The runtime drives the CLI already
installed on your machine, logged in the way you already log in, so your credentials never
pass through us and there is no key to give anybody. A backend that is not on your `PATH` is
simply not offered.

This is a deliberate bet: the frontier moves every few weeks, and the thing worth owning is
not the wrapper around one vendor's API but everything above it.

### Runtime — [humanize](/projects/humanize)

One flow, many agents, one timeline.

The runtime is what turns a loop written in Python into a run that actually happens: sessions
opened and resumed against each backend, turns taken in the order the flow asks for, work
landing in a container or on another machine when it should, a line typed mid-turn going
*into* the turn rather than after it, and every event written down as it happens so the whole
run reads back as a Chrome trace — one process per agent, one track per session, one slice per
thing it did.

An agent, here, is three things and no conversation: a backend, a model and an effort. Two
agents at the same model and effort are still two agents — which is the entire point of a
reviewer that reads an actor's work.

**[hmz.humanfia.ai](https://hmz.humanfia.ai/)** is its documentation: tutorials, a page per
feature, and the complete CLI, TUI and Python reference.

### Flows — [flowverse](/projects/flowverse)

The method, as code.

A flow is a directory of Python holding a `run(agents, task)`, whatever it imports beside it,
and the skills it brings. That is the whole interface. It says what each agent is asked, in
what order, and when to stop — and because it is a directory rather than a setting, you can
read it, fork it, run it, and ship it to somebody else.

Three of the flows in the official flowverse are ours: [RLAR](/flows/rlar),
[Flame Chase Loop](/flows/flame-chase) and [Humanize 1](/flows/humanize1). The rest are the
loops the field converged on — [Ralph Loop](/flows/#ralph-loop), [Goal](/flows/#goal) — kept
here so that a comparison against them is one flag rather than a reimplementation.

### Applications — [KDA](/applications/kda) and [HOA](/applications/hoa)

Where the flows get pointed, and where they are found out.

We deliberately chose two domains in which a claim cannot be argued with. A GPU kernel is
either faster than the baseline on the same hardware or it is not. A Lean 4 proof either
passes the kernel or it does not. There is no rubric, no LLM judge, and no way to talk your
way to a score.

- **KDA — Kernel Design Agents.** Research, implement, profile and iterate on
  performance-critical CUDA kernels. Built with MIT HAN Lab.
- **HOA — Humanize Olympic Agents.** Olympiad and competition mathematics, formally verified:
  all six IMO 2026 problems, and 670 of 672 on PutnamBench.

## The referee — [flowbench](/projects/flowbench)

Alongside the stack rather than on top of it, because it takes the whole stack as its input.

flowbench runs long-horizon tasks with the method as the variable and everything else held
fixed. It is the answer to a question that ordinarily has none: given a task that takes a day,
is the fresh-session loop better than the actor-and-reviewer one, and at which model, and by
how much?

Its output changes what everyone else does — a flow that wins becomes a default, a flow that
loses gets deleted, and a claim that a new loop is better arrives with a cell in a matrix
rather than an anecdote. flowbench is in development and not yet released.

## What each layer refuses to do

A stack is defined as much by the boundaries it keeps as the pieces it has.

| Layer | Does | Will not |
| --- | --- | --- |
| Backends | Take turns, use tools, hold logins | — |
| Runtime | Drive agents, record everything | Hold an API key, or talk to a model provider |
| Flows | Decide who is asked what, and when it ends | Know which backend it is running on |
| Benchmark | Score flows against each other | Grade with a model; every task has a real check |
| Applications | Produce work that is externally verified | Report a number we cannot hand you the code for |

[The loop that connects them →](/stack/loop)
