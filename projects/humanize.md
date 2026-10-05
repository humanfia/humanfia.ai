---
description: 'Humanize is the agent flow system everything Humanfia does runs on — it orchestrates, executes and observes agent flows across twelve coding-agent CLIs, and any other that speaks the Agent Client Protocol.'
---

# Humanize

<p class="lede">One flow, twelve coding agents, and a timeline of everything they did. Humanize
drives the coding-agent CLI you already log into, in the order a flow asks for, and writes the
whole run down as it happens. Every other project on this site stands on it.</p>

<a class="docs-cta" href="https://docs.humanfia.ai/humanize/">
  <span class="docs-cta-said">
    <span class="kicker">The documentation</span>
    <strong>Every feature, every command</strong>
    <span class="docs-cta-note">The install, the quickstart, and every feature, at
    <code>docs.humanfia.ai/humanize</code>.</span>
  </span>
  <em>&#8599;</em>
</a>

<Install />

## One flow, many agents, one trace

A flow is a directory of Python that says which agents it drives, what each is asked, in what
order, and when to stop. The runtime opens the sessions, takes the turns, puts the work where
it should land, and records it.

The recording is the part people underestimate. Every turn's tool calls go onto one clock —
every agent, every sub-agent, every program those turns ran — and come back as a Chrome trace
you open in Perfetto. On an eleven-hour run that is the difference between knowing what
happened and believing the last message.

<TraceReel />

## What it does

<p class="kicker">The deep end</p>

<div class="card-grid">
  <div class="card">
    <span class="kicker">The anchor</span>
    <h3>The agent runs here. Its syscalls land there.</h3>
    <p>Every syscall the agent makes is decided one at a time — replayed on another machine, or answered on this one. It is told none of it.</p>
  </div>
  <div class="card">
    <span class="kicker">Accounts</span>
    <h3>Two accounts of one CLI</h3>
    <p>A CLI signs in once. Humanize runs it as an account it was never signed into, by answering the paths it opens with other paths.</p>
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
    <h3>Twelve CLIs, one agent</h3>
    <p>Twelve coding agents and anything speaking the Agent Client Protocol, each driven through whatever it actually offers.</p>
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

Hooks, capabilities, surfaces and the daemon are in there too:
[every feature, one picture each ↗](https://docs.humanfia.ai/humanize/features/).

## The agent runs here. Its syscalls land there.

The anchor is the piece we would point at if we were only allowed one. A seccomp-filtered
ptrace supervisor sits between the coding agent and the kernel and decides every call it makes:
replay it on the target, or answer it here.

There is no plugin, no configuration and no cooperation, because the agent is never asked. It
opens a file; the file it gets is the target's. It runs `pytest`; the process is the target's,
in the target's working directory, reaching whatever the target reaches. It reads its own
credentials, and those are answered here.

<AnchorSplit />

## Seventeen layers, and a test that holds them

The runtime drives twelve different CLIs without becoming twelve different products because
the layering is a rule rather than an intention: each layer may import only what a table lists
for it, no two layers name each other but one pair, and a test fails a build that bends it.

<LayerStack />

## The real thing, recorded

Not drawn — recorded from `hmz` itself, in a container with a stand-in coding agent in it.

<TerminalReel />

## The flows it runs

The runtime runs flows; it does not decide what a good flow is. That split is deliberate, and
everything else at Humanfia is built on it.

A **flow** is a directory of Python that says which agents it drives, what each is asked, in
what order and when to stop. The ones that ship with the runtime, plus the flowverse it
fetches, cover most of the loop shapes the field has converged on:

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
    <p><code>rlar</code> gives the actor one session for the whole run and the reviewer a
    fresh one every round. What the reviewer noticed is what the actor hears, word for word,
    and the reviewer is what ends the run.</p>
  </div>
  <a class="card" href="/flows/humanize1">
    <span class="kicker">A plan first</span>
    <h3>Plan, then build under review</h3>
    <p><code>humanize1</code>: an idea opened into a draft, a plan two agents agree on, and a
    build under review until nothing is left to say — the Claude Code plugin Humanize grew out
    of, as three flows.</p>
  </a>
  <div class="card">
    <span class="kicker">Seven agents</span>
    <h3>Three lanes, one writer</h3>
    <p><code>parallel_flame_chase</code>: a coordinator plans three lanes and leaves. Lane 1
    alone writes your tree; lanes 2 and 3 work on private copies and reach it by report.</p>
  </div>
  <a class="card" href="/flows/">
    <span class="kicker">The catalogue</span>
    <h3>Every flow, with its loop drawn</h3>
    <p>A page each: the <code>hmz exec</code> line, what it takes, what ends it, and what a run
    picked up a week later carries in.</p>
  </a>
</div>

The loops the field already converged on ship built in; the rest are listed in a
**flowverse** — an index in git that pins each version of a flow to a commit of the repository
it lives in, which anybody can read, fork, publish to or beat. Either way, comparing one method
against another is a flag rather than a reimplementation. Which is actually better is
[FlowBench](/projects/flowbench)'s question, and the answer is allowed to delete ours.

[humanfia/flowverse ↗](https://github.com/humanfia/flowverse) ·
[FlowBench](/projects/flowbench)

## What it is not

**Not a model.** We do not train one, serve one or resell one.

**Not a wrapper around one vendor.** Humanize drives the CLI you already log into, under your
own subscription. It holds a credential only when you hand it one — an account can be a second
login, an API key or a gateway of your own, kept apart from the CLI's own sign-in — and every
turn is billed to the account you named. The frontier moves every few weeks; a wrapper around
one vendor is the least durable thing we could build.

**Not a coding agent.** It does not replace `claude` or `codex` — it takes turns on them. If a
better one ships next month, it is a name in a list.

::: warning Permissions
Humanize runs every agent with approvals bypassed: nothing an agent does is put to you first.
What holds it back is what its flow declares, role by role. Read [Security ↗](https://docs.humanfia.ai/humanize/user/security) before pointing one at a
repository you care about.
:::

## Where to go next

<div class="card-grid">
  <a class="card" href="https://docs.humanfia.ai/humanize/">
    <span class="kicker">All of it</span>
    <h3>The documentation ↗</h3>
    <p>Install, quickstart, and every feature.</p>
  </a>
  <a class="card" href="https://docs.humanfia.ai/humanize/reference/cli">
    <span class="kicker">Look it up</span>
    <h3>The CLI reference ↗</h3>
    <p>Every command, key, flag and Python call, in one place.</p>
  </a>
  <a class="card" href="https://github.com/humanfia/humanize">
    <span class="kicker">Read it</span>
    <h3>humanfia/humanize ↗</h3>
    <p>The source, Apache-2.0. Issues and pull requests are the fastest way to reach us.</p>
  </a>
</div>
