---
description: 'Humanize 2: Agent Flow System is the runtime everything Humanfia does runs on — it orchestrates, executes and observes agent flows across ten coding-agent CLIs, and holds no API key of its own.'
---

# Humanize 2: Agent Flow System

<p class="lede">One flow, ten coding agents, and a timeline of everything they did. Humanize 2
drives the coding-agent CLI you already log into, in the order a flow asks for, and writes the
whole run down as it happens. It is the layer every other project on this site stands on.</p>

<a class="docs-cta" href="https://docs.humanfia.ai/humanize2/">
  <span class="docs-cta-said">
    <span class="kicker">The documentation</span>
    <strong>Every feature, every flow, every command</strong>
    <span class="docs-cta-note">Humanize 2 is documented at <code>docs.humanfia.ai/humanize2</code>
    — a site of its own, with the install, the quickstart and a page per feature. This page
    introduces it; it is not a copy of it.</span>
  </span>
  <em>&#8599;</em>
</a>

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

The five we would show first.

<div class="card-grid">
  <div class="card">
    <span class="kicker">The anchor</span>
    <h3>The agent runs here. Its syscalls land there.</h3>
    <p>Every syscall the agent makes is decided one at a time — replayed on another machine, or answered on this one. It is told none of it.</p>
  </div>
  <div class="card">
    <span class="kicker">Accounts</span>
    <h3>Two accounts of one CLI</h3>
    <p>A CLI signs in once. Humanize 2 runs it as an account it was never signed into, by answering the paths it opens with other paths.</p>
  </div>
  <div class="card">
    <span class="kicker">Tracing</span>
    <h3>One timeline</h3>
    <p>Every agent, every sub-agent and every program those turns ran, on one clock, in one document you open in Perfetto.</p>
  </div>
  <div class="card">
    <span class="kicker">Steering</span>
    <h3>A line typed mid-turn</h3>
    <p>It goes <em>into</em> the turn that is running. Not queued behind it, and never quietly counted as said.</p>
  </div>
  <div class="card">
    <span class="kicker">Shapes</span>
    <h3>Answers in a shape</h3>
    <p>A turn given a pydantic model answers with that model. The model is the whole of the question, and the answer is read back through it.</p>
  </div>
</div>

<p class="kicker">The shape of a run</p>

<div class="card-grid">
  <div class="card">
    <span class="kicker">Backends</span>
    <h3>Ten CLIs, one agent</h3>
    <p>Ten coding agents and anything speaking the Agent Client Protocol, each driven through whatever it actually offers.</p>
  </div>
  <div class="card">
    <span class="kicker">Flows</span>
    <h3>A flow is Python</h3>
    <p>A loop, a subprocess call, a file read between turns. The agents are its arguments, and the shapes a loop takes are few.</p>
  </div>
  <div class="card">
    <span class="kicker">Concurrency</span>
    <h3>Many turns at once</h3>
    <p>Turns are sequential only inside one session. Two hundred conversations are two hundred turns.</p>
  </div>
  <div class="card">
    <span class="kicker">Resuming</span>
    <h3>Picked up where it stopped</h3>
    <p>A loop meant to run for a week is a loop that will be stopped. What it was keeping track of survives; the conversation does not.</p>
  </div>
</div>

<p class="kicker">Who is at the other end</p>

<div class="card-grid">
  <div class="card">
    <span class="kicker">Goals</span>
    <h3>It decides when it is done</h3>
    <p>The backend's own goal feature: a turn that would have ended starts another, until the model says the objective is met.</p>
  </div>
  <div class="card">
    <span class="kicker">The person</span>
    <h3>You, as one of the agents</h3>
    <p>A flow asks a person the same way it asks a model — which is how a human stays the architect rather than the bottleneck.</p>
  </div>
</div>

Each of those is a page of its own on the documentation site, with a diagram, and the eleven
above are not all of them — hooks, capabilities, surfaces and the daemon are pages too:
[every feature, one picture each ↗](https://docs.humanfia.ai/humanize2/features/).

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

## The real thing, recorded

Everything above is drawn. This is not: five screens of `hmz`, recorded from the program, in a
container with a stand-in coding agent in it.

<TerminalReel />

## The flows it runs

The runtime runs flows; it does not decide what a good flow is. That is deliberate, and it is
the seam the whole of Humanfia is built along.

A **flow** is a directory of Python that says which agents it drives, what each is asked, in
what order and when to stop. Eleven come with the runtime or with the flowverse it fetches, and
they are between them most of the loop shapes the field has converged on:

<div class="card-grid">
  <div class="card">
    <span class="kicker">One agent</span>
    <h3>Forget every round, or remember all of them</h3>
    <p><code>ralph_loop</code> opens a session of its own each round; <code>stateful_ralph</code>
    and <code>continue_loop</code> hold one and keep going. Same loop, opposite trade.</p>
  </div>
  <div class="card">
    <span class="kicker">Two agents</span>
    <h3>Take turns on the same tree</h3>
    <p><code>flame_chase</code> alternates two agents on one task, each reading the repository
    rather than a history — so neither compounds the other's blind spot.</p>
  </div>
  <div class="card">
    <span class="kicker">Actor and reviewer</span>
    <h3>The review is the next prompt</h3>
    <p><code>rlar</code> gives the actor one session and the reviewer none. What the reviewer
    noticed is what the actor hears, word for word, and the reviewer is what ends the run.</p>
  </div>
  <div class="card">
    <span class="kicker">A plan first</span>
    <h3>Humanize 1, as three flows</h3>
    <p>An idea opened into a draft, a plan two sides converge on, and a build under review —
    <a href="/projects/rlcr-loop">Humanize 1</a>'s three commands, on their own agents.</p>
  </div>
  <div class="card">
    <span class="kicker">Seven agents</span>
    <h3>Three lanes, one writer</h3>
    <p>A coordinator plans three isolated lanes. Lane 1 alone owns your working tree; the other
    two work in private snapshots and publish artifacts rather than writes.</p>
  </div>
  <a class="card" href="https://docs.humanfia.ai/humanize2/flows/">
    <span class="kicker">The catalogue</span>
    <h3>Every flow, with its loop drawn ↗</h3>
    <p>A page each: the <code>hmz exec</code> line, what it takes, what ends it, and what a run
    picked up a week later carries in.</p>
  </a>
</div>

Flows live in a **flowverse** — a git repository anybody can read, fork, publish or beat. The
loops the field already converged on are in there beside ours, so comparing a method against
another method is a flag rather than a reimplementation. Which of them is actually better is
[FlowBench](/projects/flowbench)'s question, and the answer is allowed to delete ours.

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
Humanize 2 runs every agent with permission prompts disabled, and nothing turns them back on.
Read [Security ↗](https://docs.humanfia.ai/humanize2/user/security) before pointing one at a
repository you care about.
:::

## Where to go next

<div class="card-grid">
  <a class="card" href="https://docs.humanfia.ai/humanize2/">
    <span class="kicker">All of it</span>
    <h3>The documentation ↗</h3>
    <p>Install, quickstart, a page per feature, a page per flow. Everything this page is an
    introduction to.</p>
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
