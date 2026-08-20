---
description: Humanize 2 is the runtime everything Humanfia does runs on — it orchestrates, executes and observes agent flows across ten coding-agent CLIs, and holds no API key of its own.
---

# Humanize 2 — the runtime

<p class="lede">One flow, ten coding agents, and a timeline of everything they did. Humanize 2
drives the coding-agent CLI you already log into, in the order a flow asks for, and writes the
whole run down as it happens. It is the layer every other project on this site stands on.</p>

<Install />

## One flow, many agents, one trace

A flow is a directory of Python that says which agents it drives, what each is asked, in what
order, and when to stop. The runtime opens the sessions, takes the turns, puts the work where
it is meant to land, and records it.

The recording is the part people underestimate. Every turn's tool calls go onto one clock —
every agent, every sub-agent, and every program those turns ran — and come back out as a
Chrome trace you open in Perfetto. On an eleven-hour run that is the difference between knowing
what happened and believing what the last message said.

<TraceReel />

## What it does

<p class="kicker">The deep end</p>

The five worth reading even if you never install it.

<div class="card-grid">
  <a class="card" href="https://docs.humanfia.ai/humanize2/features/anchor">
    <span class="kicker">The anchor</span>
    <h3>The agent runs here. Its syscalls land there.</h3>
    <p>Every syscall the agent makes is decided one at a time — replayed on another machine, or answered on this one. It is told none of it.</p>
  </a>
  <a class="card" href="https://docs.humanfia.ai/humanize2/features/accounts">
    <span class="kicker">Accounts</span>
    <h3>Two accounts of one CLI</h3>
    <p>A CLI signs in once. Humanize runs it as an account it was never signed into, by answering the paths it opens with other paths.</p>
  </a>
  <a class="card" href="https://docs.humanfia.ai/humanize2/features/tracing">
    <span class="kicker">Tracing</span>
    <h3>One timeline</h3>
    <p>Every agent, every sub-agent and every program those turns ran, on one clock, in one document you open in Perfetto.</p>
  </a>
  <a class="card" href="https://docs.humanfia.ai/humanize2/features/steering">
    <span class="kicker">Steering</span>
    <h3>A line typed mid-turn</h3>
    <p>It goes <em>into</em> the turn that is running. Not queued behind it, and never quietly counted as said.</p>
  </a>
  <a class="card" href="https://docs.humanfia.ai/humanize2/features/shapes">
    <span class="kicker">Shapes</span>
    <h3>Answers in a shape</h3>
    <p>A turn given a pydantic model answers with that model. The model is the whole of the question, and the answer is read back through it.</p>
  </a>
</div>

<p class="kicker">The shape of a run</p>

<div class="card-grid">
  <a class="card" href="https://docs.humanfia.ai/humanize2/features/backends">
    <span class="kicker">Backends</span>
    <h3>Ten CLIs, one agent</h3>
    <p>Ten coding agents and anything speaking the Agent Client Protocol, each driven through whatever it actually offers.</p>
  </a>
  <a class="card" href="https://docs.humanfia.ai/humanize2/features/flows">
    <span class="kicker">Flows</span>
    <h3>A flow is Python</h3>
    <p>A loop, a subprocess call, a file read between turns. The agents are its arguments, and the shapes a loop takes are few.</p>
  </a>
  <a class="card" href="https://docs.humanfia.ai/humanize2/features/concurrency">
    <span class="kicker">Concurrency</span>
    <h3>Many turns at once</h3>
    <p>Turns are sequential only inside one session. Two hundred conversations are two hundred turns.</p>
  </a>
  <a class="card" href="https://docs.humanfia.ai/humanize2/features/resuming">
    <span class="kicker">Resuming</span>
    <h3>Picked up where it stopped</h3>
    <p>A loop meant to run for a week is a loop that will be stopped. What it was keeping track of survives; the conversation does not.</p>
  </a>
</div>

<p class="kicker">Who is at the other end</p>

<div class="card-grid">
  <a class="card" href="https://docs.humanfia.ai/humanize2/features/goals">
    <span class="kicker">Goals</span>
    <h3>It decides when it is done</h3>
    <p>The backend's own goal feature: a turn that would have ended starts another, until the model says the objective is met.</p>
  </a>
  <a class="card" href="https://docs.humanfia.ai/humanize2/features/human">
    <span class="kicker">The person</span>
    <h3>You, as one of the agents</h3>
    <p>A flow asks a person the same way it asks a model — which is how a human stays the architect rather than the bottleneck.</p>
  </a>
  <a class="card" href="https://docs.humanfia.ai/humanize2/features/">
    <span class="kicker">Everything else</span>
    <h3>Twelve pages, one picture each</h3>
    <p>Hooks, remote execution, providers, containers — a page and a diagram apiece, on the documentation site.</p>
  </a>
</div>

## The agent runs here. Its syscalls land there.

The anchor is the piece we would point at if we were only allowed to point at one. A
seccomp-filtered ptrace supervisor sits between the coding agent and the kernel, and decides
every call it makes: replay it on the target, or answer it on this machine.

There is no plugin, no configuration and no cooperation, because the agent is never asked. It
opens a file; the file it gets is the target's. It runs `pytest`; the process is the target's,
in the target's working directory, reaching whatever the target reaches. It reads its own
credentials, and those are answered here.

<AnchorSplit />

## Twelve layers, one direction

The reason the runtime can drive ten different CLIs without becoming ten different products is
that the layering is a rule rather than an intention: everything points downward, nothing
points both ways, and a test fails a build that bends it.

<LayerStack />

## Where the flows come from

The runtime runs flows; it does not decide what a good flow is. That is deliberate, and it is
the seam the whole of Humanfia is built along.

Flows live in a **flowverse** — a directory of Python that anybody can read, fork, publish or
beat. The three that ship are there alongside the loops the field already converged on, so
comparing a method against another method is a flag rather than a reimplementation. Which of
them is actually better is [FlowBench](/projects/flowbench)'s question, and the answer is
allowed to delete ours.

[Flowverses ↗](https://docs.humanfia.ai/humanize2/guide/flowverses) ·
[humanfia/flowverse ↗](https://github.com/humanfia/flowverse) ·
[FlowBench](/projects/flowbench)

## What it is not

**It is not a model.** We do not train one, serve one or resell one.

**It is not an API client.** Humanize 2 holds no API key and talks to no model provider. It
drives the CLI you already log into, under your own subscription, the way you already log in.
The frontier moves every few weeks; a wrapper around one vendor is the least durable thing we
could build.

**It is not a coding agent.** It does not replace `claude` or `codex` — it takes turns on them.
If a better one ships next month, it is a name in a list.

::: warning Permissions
Humanize runs every agent with permission prompts disabled, and nothing turns them back on.
Read [Security ↗](https://docs.humanfia.ai/humanize2/guide/security) before pointing one at a
repository you care about.
:::

## Where to go next

<div class="card-grid">
  <a class="card" href="https://docs.humanfia.ai/humanize2/guide/installation">
    <span class="kicker">Install it</span>
    <h3>The installation guide ↗</h3>
    <p>Prerequisites, the three ways in, which backends count as available, and how to check.</p>
  </a>
  <a class="card" href="https://docs.humanfia.ai/humanize2/guide/">
    <span class="kicker">Learn it</span>
    <h3>The guides ↗</h3>
    <p>Concepts, loops, containers, remote execution, providers, hooks — how do I use this.</p>
  </a>
  <a class="card" href="https://docs.humanfia.ai/humanize2/reference/cli">
    <span class="kicker">Look it up</span>
    <h3>The CLI reference ↗</h3>
    <p>Every command, key, flag and Python call, in one place.</p>
  </a>
  <a class="card" href="https://github.com/humanfia/humanize2">
    <span class="kicker">Read it</span>
    <h3>humanfia/humanize2 ↗</h3>
    <p>The source, Apache-2.0. Issues and pull requests are the fastest way to reach us.</p>
  </a>
</div>
