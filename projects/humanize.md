---
title: "Humanize: The agent flow system"
description: The agent flow system everything Humanfia runs on. It orchestrates, runs and traces agent flows across twelve coding-agent CLIs, a model called directly through litellm, and any CLI that speaks the Agent Client Protocol.
layout: post
sidebar: false
tag: Humanize

project:
  status: Open source · Apache-2.0
  links:
    - { text: humanfia/humanize, href: https://github.com/humanfia/humanize }
    - { text: The documentation, href: https://docs.humanfia.ai/humanize/ }
    - { text: The flows, href: /flows/, more: The catalogue }
  stats:
    - { value: 12, kicker: Coding-agent CLIs, text: 'Driven through what each one offers, plus any CLI that speaks the Agent Client Protocol' }
    - { display: litellm, kicker: New harness, text: 'A model called directly: one chat completion a turn, no tools, no environment' }
    - { value: 7, kicker: Built-in flows, text: 'From chat to flame_chase, and a flowverse of more to install', href: /flows/, more: The catalogue }
    - { value: 17, kicker: Layers, text: 'Each may import only what a table lists for it, and a test holds the rule' }

hero:
  kicker: PutnamBench · Kimi-K3 · 50 problems
  value: 47
  from: 1
  label: solved inside a Humanize flow, against 4 through its own coding CLI and 1 through the raw API
  board:
    - { name: Humanize flow, score: 47, us: true }
    - { name: Coding CLI, score: 4 }
    - { name: Model API, score: 1 }

# The Humanize ablation in the KDA² post (2026-09-27): four base models, three levels of
# scaffolding, 50 problems each.
ablation:
  - key: putnam
    label: PutnamBench
    max: 50
    rows:
      - { label: GPT-5.6-sol, values: { api: 3, cli: 46, flow: 50 } }
      - { label: Kimi-K3, values: { api: 1, cli: 4, flow: 47 } }
      - { label: GLM-5.3, values: { api: 0, cli: 2, flow: 25 } }
      - { label: DeepSeek V4 Pro, values: { api: 0, cli: 4, flow: 13 } }
  - key: physics
    label: Physics Cup
    max: 50
    rows:
      - { label: GPT-5.6-sol, values: { api: 31, cli: 41, flow: 44 } }
      - { label: Kimi-K3, values: { api: 35, cli: 37, flow: 42 } }
      - { label: GLM-5.3, values: { api: 24, cli: 34, flow: 40 } }
      - { label: DeepSeek V4 Pro, values: { api: 32, cli: 35, flow: 39 } }

# Every harness `-a` takes, from hmz.flows.HarnessKind and the agents reference.
harnesses:
  - { name: claude, product: Claude Code, kind: CLI, driven: 'one claude --print held open per session' }
  - { name: codex, product: Codex, kind: CLI, driven: 'one codex app-server per agent, shared by its sessions' }
  - { name: cursor-agent, product: Cursor Agent, kind: CLI, driven: 'one cursor-agent --print per turn' }
  - { name: opencode, product: opencode, kind: CLI, driven: 'one opencode run per turn' }
  - { name: mimo, product: MiMo Code, kind: CLI, driven: 'one mimo run per turn' }
  - { name: mcode, product: MiniMax Code, kind: CLI, driven: 'one mcode exec per turn' }
  - { name: qwen, product: Qwen Code, kind: CLI, driven: 'one process held open (stream-json)' }
  - { name: kimi, product: Kimi Code, kind: CLI, driven: 'one kimi web daemon per agent' }
  - { name: grok, product: Grok Build, kind: CLI, driven: 'one grok agent stdio held open' }
  - { name: pi, product: pi, kind: CLI, driven: 'one pi --mode rpc held open per session' }
  - { name: agy, product: Antigravity CLI, kind: CLI, driven: 'one process held open (stream-json)' }
  - { name: dsh, product: DeepSeek Harness, kind: CLI, driven: 'its Python SDK, in this process' }
  - { name: litellm, product: 'a model, called directly', kind: Model · new, driven: 'one chat completion per turn over the session history', highlight: true }
  - { name: acp, product: any ACP agent, kind: Protocol, driven: 'one process held open, JSON-RPC over stdio' }
---

Humanize drives the coding-agent CLI you already log into, in the order a flow asks for, and
writes the whole run down as it happens. Every other project on this site stands on it.

<Install />

## One flow, many agents, one trace

A flow is a directory of Python that says which agents it drives, what each is asked, in what
order, and when to stop. The runtime opens the sessions, takes the turns, puts the work where
it should land, and records it. Four words carry the whole model: the **agent** is who is asked,
the **session** is what it remembers, the **turn** is one exchange, and the **env** is where
that turn's work lands.

```python
@flow(agents=Agents, envs=Envs, params=FlowParams)
async def twice(task: str, *, agents: Agents, envs: Envs,
                params: FlowParams, ctx: FlowContext) -> None:
    builder = agents["builder"]
    session = await builder.spawn()           # history, and nothing else
    await builder.run(task, session=session)  # env=None: the workspace
    await builder.run("Review it; fix what is wrong.",
                      session=session, env=envs["sandbox"])
```

```sh
hmz exec -f twice -a builder=claude/claude-opus-5:high -p budget.cost=5 "add a --dry-run flag"
```

## Agent, session, turn, env

An **agent** is settings, not a conversation: a harness, a model, an effort and the account it
runs as. `spawn()` opens a **session** from it, and a session is only history. Each `run()` is a
**turn** in that session, and the turn names its **env**, the place its work lands: this
directory, another directory, or a directory on another machine. Leave the env out and the turn
works in the workspace, the directory `hmz` runs in. Because the env belongs to the turn and
not to the session, one conversation can carry on from one machine to the next. `fork()` branches
a session into a second one that remembers everything up to there.

<AnimatedDiagram
  view-box="0 0 720 300"
  :min-width="540"
  kicker="hmz.flows · the four words"
  label="An agent spawns a session. Each run is a turn in that session, and each turn names its environment: the first works in the workspace, the second in another environment, while the session's history carries across. Fork branches the session."
  :steps="[
    'An agent is its settings: harness, model, effort, account.',
    'spawn() opens a session. A session is history, and nothing else.',
    'run() takes a turn. With env=None, the turn works in the workspace.',
    'The next turn names another env. The history carries over; only the place changes.',
    'fork() branches the session: a second conversation that remembers everything so far.',
  ]"
>
  <g data-step="1" data-pop>
    <rect class="ink" x="10" y="112" width="130" height="76" />
    <text class="on-ink t-lg" x="75" y="146" text-anchor="middle">Agent</text>
    <text class="on-ink" x="75" y="170" text-anchor="middle">claude · high</text>
  </g>
  <path class="line" d="M140 150 L 190 150" data-step="2" data-draw />
  <g data-step="2" data-pop>
    <rect class="frame" x="190" y="122" width="510" height="56" />
    <text class="ink" x="200" y="114">session · history</text>
  </g>
  <g data-step="3" data-pop>
    <rect class="red" x="206" y="132" width="110" height="36" />
    <text class="on-red" x="261" y="155" text-anchor="middle">turn 1</text>
  </g>
  <path class="line dash" d="M261 168 L 261 230" data-step="3" data-draw />
  <g data-step="3" data-pop>
    <rect class="ink" x="196" y="230" width="130" height="44" />
    <text class="on-ink" x="261" y="257" text-anchor="middle">workspace</text>
  </g>
  <g data-step="4" data-pop>
    <rect class="red" x="336" y="132" width="110" height="36" />
    <text class="on-red" x="391" y="155" text-anchor="middle">turn 2</text>
  </g>
  <path class="line dash" d="M391 168 L 391 230" data-step="4" data-draw />
  <g data-step="4" data-pop>
    <rect class="grey" x="336" y="230" width="130" height="44" />
    <text class="on-ink" x="401" y="257" text-anchor="middle">env: sandbox</text>
  </g>
  <path id="hz-carry" class="line" d="M316 150 L 336 150" data-step="4" data-draw />
  <path id="hz-fork" class="line dash" d="M446 150 C 500 150, 500 60, 560 60" data-step="5" data-draw />
  <g data-step="5" data-pop>
    <rect class="frame" x="560" y="38" width="150" height="44" />
    <text class="ink" x="635" y="65" text-anchor="middle">fork · turn 3</text>
  </g>
  <rect class="red" x="-6" y="-6" width="12" height="12" data-step="5" data-travel="#hz-fork" data-loop />
</AnimatedDiagram>

The refusals are part of the model too. A harness that cannot move between machines says so on
the turn that asks it to, rather than quietly running somewhere else. And `litellm`, which has
no tools and no filesystem, takes no env at all: give one of its turns an env and the turn is
refused with a clear error.

## The flow loop

A flow is ordinary Python, so its loop is a loop: a `while`, a turn, a look at what came back,
and a decision. The runtime adds what a loop like that needs to run for a week: a budget that
stops it, a trace of every turn, and a journal it can be picked up from. This is RLAR, one of
the built-in flows, drawn turn by turn.

<AnimatedDiagram
  view-box="0 0 720 280"
  :min-width="540"
  kicker="rlar · actor and reviewer"
  label="The RLAR flow. The actor keeps one session for the whole run and takes a turn on the task. A reviewer opens a fresh session each round and reads the work. Its words go back to the actor verbatim as the next prompt. The loop ends when the reviewer's verdict field says done, or when the budget runs out."
  :steps="[
    'The actor keeps one session for the whole run, and takes a turn on the task.',
    'Each round, the reviewer starts a fresh session and reads the work, not the conversation.',
    'What the reviewer said is the actor\'s next prompt, word for word.',
    'Done is a field in the reviewer\'s answer, not a sentence. The budget is the other way out.',
  ]"
>
  <g data-step="1" data-pop>
    <rect class="ink" x="20" y="100" width="170" height="80" />
    <text class="on-ink t-lg" x="105" y="134" text-anchor="middle">Actor</text>
    <text class="on-ink" x="105" y="158" text-anchor="middle">one session</text>
  </g>
  <g data-step="2" data-pop>
    <rect class="frame" x="330" y="100" width="170" height="80" />
    <text class="ink t-lg" x="415" y="134" text-anchor="middle">Reviewer</text>
    <text class="ink" x="415" y="158" text-anchor="middle">fresh every round</text>
  </g>
  <path id="rl-out" class="line dash" d="M190 120 C 240 70, 280 70, 330 120" data-step="2" data-draw />
  <path id="rl-back" class="line dash" d="M330 160 C 280 210, 240 210, 190 160" data-step="3" data-draw />
  <text class="ink" x="260" y="64" text-anchor="middle" data-step="2">the work</text>
  <text class="red" x="260" y="228" text-anchor="middle" data-step="3">the review, verbatim</text>
  <rect class="ink" x="-7" y="-7" width="14" height="14" data-step="2" data-travel="#rl-out" data-loop />
  <rect class="red" x="-7" y="-7" width="14" height="14" data-step="3" data-travel="#rl-back" data-loop />
  <path class="line" d="M500 140 L 560 140" data-step="4" data-draw />
  <g data-step="4" data-pop>
    <rect class="red" x="560" y="110" width="140" height="60" />
    <text class="on-red t-lg" x="630" y="146" text-anchor="middle">done: true</text>
  </g>
  <text class="ink" x="630" y="200" text-anchor="middle" data-step="4">or the budget runs out</text>
</AnimatedDiagram>

What the loop is worth is measurable. In the ablation behind the [KDA² post](/blog/2026-09-27-kda-for-kda),
the same four models were run three ways on the same problems: through the raw model API,
through a coding CLI, and inside a Humanize flow.

<BarChart
  orientation="vertical"
  kicker="Same model · three levels of scaffolding · 50 problems each"
  label="The Humanize ablation. PutnamBench: GPT-5.6-sol 3, 46, 50; Kimi-K3 1, 4, 47; GLM-5.3 0, 2, 25; DeepSeek V4 Pro 0, 4, 13. Physics Cup: GPT-5.6-sol 31, 41, 44; Kimi-K3 35, 37, 42; GLM-5.3 24, 34, 40; DeepSeek V4 Pro 32, 35, 39; through the raw API, a coding CLI and a Humanize flow."
  caption="Problems solved of 50, by four base models through the raw model API, a coding CLI and a Humanize flow. The small red numbers are gains over the baseline chosen above."
  :series="[
    { key: 'api', label: 'Model API', tone: 'grey', hatched: true },
    { key: 'cli', label: 'Coding CLI', tone: 'ink' },
    { key: 'flow', label: 'Humanize flow', tone: 'red' },
  ]"
  :datasets="$frontmatter.ablation"
  :baselines="['api', 'cli']"
  baseline="cli"
  compare="delta"
  invert
/>

## Every harness

A harness is what `-a` names: `-a builder=codex/gpt-5.6-sol:high`. Twelve are coding-agent
CLIs, each driven through whatever it actually offers: a print mode, an app server, an RPC
mode, a daemon or an SDK. One is the Agent Client Protocol, for a CLI you add by hand. And one is
new: **`litellm`**, which is not a CLI at all.

<ResultsTable
  caption="Every harness, by the name -a gives it"
  :columns="[
    { key: 'name', label: '-a' },
    { key: 'product', label: 'What it is' },
    { key: 'kind', label: 'Kind' },
    { key: 'driven', label: 'How a turn is run' },
  ]"
  :rows="$frontmatter.harnesses"
/>

`litellm` calls a model directly. Each turn is one streamed chat completion over the session's
history plus the prompt: no tools, no filesystem and no hooks, and so no env. Its model is a
[LiteLLM](https://github.com/BerriAI/litellm) model string, as in
`-a writer=litellm@acct/openai/gpt-5`, and it signs in through Humanize's accounts like any other
harness: a vendor key, an OpenAI- or Anthropic-compatible gateway, or Bedrock, Vertex or Azure.
Usage goes into the same tally, so a flow can mix a model call with coding agents and still be
priced and traced as one run. It ships as an optional extra, `hmz[litellm]`.

<AnimatedDiagram
  view-box="0 0 720 220"
  :min-width="520"
  kicker="Two kinds of turn"
  label="A coding-agent turn runs a CLI with tools against an environment. A litellm turn sends the session's history plus the prompt to a model and gets text back, with no tools and no environment."
  :steps="[
    'A coding-agent turn: the CLI works with its tools, in the env the turn names.',
    'A litellm turn: the history and the prompt go to the model, and an answer comes back. No tools, no env.',
  ]"
>
  <g data-step="1" data-pop>
    <rect class="ink" x="10" y="30" width="150" height="56" />
    <text class="on-ink" x="85" y="63" text-anchor="middle">turn · claude</text>
  </g>
  <path id="lt-cli" class="line dash" d="M160 58 L 330 58" data-step="1" data-draw />
  <g data-step="1" data-pop>
    <rect class="frame" x="330" y="30" width="150" height="56" />
    <text class="ink" x="405" y="63" text-anchor="middle">tools · files</text>
  </g>
  <path class="line dash" d="M480 58 L 560 58" data-step="1" data-draw />
  <g data-step="1" data-pop>
    <rect class="grey" x="560" y="30" width="150" height="56" />
    <text class="on-ink" x="635" y="63" text-anchor="middle">env</text>
  </g>
  <rect class="ink" x="-6" y="-6" width="12" height="12" data-step="1" data-travel="#lt-cli" data-loop />
  <g data-step="2" data-pop>
    <rect class="red" x="10" y="134" width="150" height="56" />
    <text class="on-red" x="85" y="167" text-anchor="middle">turn · litellm</text>
  </g>
  <path id="lt-call" class="line dash" d="M160 162 L 560 162" data-step="2" data-draw />
  <text class="ink" x="360" y="150" text-anchor="middle" data-step="2">history + prompt → one completion</text>
  <g data-step="2" data-pop>
    <rect class="frame" x="560" y="134" width="150" height="56" />
    <text class="ink" x="635" y="167" text-anchor="middle">model</text>
  </g>
  <text class="red" x="360" y="208" text-anchor="middle" data-step="2">env=None, always</text>
  <rect class="red" x="-6" y="-6" width="12" height="12" data-step="2" data-travel="#lt-call" data-loop />
</AnimatedDiagram>

## Tracing: one timeline

The recording is the part people underestimate. Every turn's tool calls go onto one clock:
every agent, every sub-agent, and every program those turns ran. The run comes back as a Chrome
trace you open in Perfetto. On an eleven-hour run that is the difference between knowing what
happened and believing the last message.

<div class="post-wide">

<TraceReel />

</div>

The trace is written as the run goes, so a run that is stopped halfway still has one, and the
same record is what lets a stopped run be [picked up where it stopped](https://docs.humanfia.ai/humanize/user/resuming).

## What it does

Eleven features, one line each.

<PostCards>
<PostCard kicker="The anchor" title="The agent runs here. Its syscalls land there.">

Every syscall the agent makes is decided one at a time — replayed on another machine, or answered on this one. It is told none of it.

</PostCard>
<PostCard kicker="Accounts" title="Two accounts of one CLI">

A CLI signs in once. Humanize runs it as an account it was never signed into, by answering the paths it opens with other paths.

</PostCard>
<PostCard kicker="Tracing" title="One timeline">

Every agent, every sub-agent and every program those turns ran, on one clock, in one document you open in Perfetto.

</PostCard>
<PostCard kicker="Steering" title="A line typed mid-turn">

It goes <em>into</em> the turn that is running. Not queued behind it, and never quietly counted as said.

</PostCard>
<PostCard kicker="Shapes" title="Answers in a shape">

A turn given a pydantic model answers with that model. The model is the whole of the question, and the answer is read back through it.

</PostCard>
<PostCard kicker="Backends" title="Twelve CLIs, one agent">

Twelve coding agents, a model called directly through litellm, and anything speaking the Agent Client Protocol, each driven through whatever it actually offers.

</PostCard>
<PostCard kicker="Flows" title="A flow is Python">

A loop, a subprocess call, a file read between turns. The agents are its arguments, and the shapes a loop takes are few.

</PostCard>
<PostCard kicker="Concurrency" title="Many turns at once">

Turns are sequential only inside one session. Two hundred conversations are two hundred turns.

</PostCard>
<PostCard kicker="Resuming" title="Picked up where it stopped">

A loop meant to run for a week is a loop that will be stopped. What it was keeping track of survives; the conversation does not.

</PostCard>
<PostCard kicker="Goals" title="It decides when it is done">

The backend's own goal feature: a turn that would have ended starts another, until the model says the objective is met.

</PostCard>
<PostCard kicker="The person" title="You, as one of the agents">

A flow asks a person the same way it asks a model — which is how a human stays the architect rather than the bottleneck.

</PostCard>
</PostCards>

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

This is CogAnchor, one of the three subsystems on the [Deep Tech](/research/deep-tech#coganchor)
page, next to Phobos (the flow compiler) and Exomyth (the trace).

## Seventeen layers, and a test that holds them

The runtime drives twelve different CLIs without becoming twelve different products because
the layering is a rule rather than an intention: each layer may import only what a table lists
for it, no two layers name each other but one pair, and a test fails a build that bends it.

<LayerStack />

## The real thing, recorded

Not drawn — recorded from `hmz` itself, in a container with a stand-in coding agent in it.

<TerminalReel />

And two takes from the talk where we introduced it: the same Ralph loop started from the command
line, and from inside `hmz` with `/flow`, where you pick the flow, set up its agent, save, and
type the task.

<DemoVideo src="/media/ralph-loop-cli.mp4" poster="/media/ralph-loop-cli.webp" title="A Ralph loop started with hmz exec: two fresh rounds, each picking up from the repository" caption="hmz exec -f ralph_loop with a budget file and one agent: round 1 maps the palette and adds dark-mode tokens, round 2 starts fresh, wires the toggle and finishes TASK.md." />

<DemoVideo src="/media/ralph-loop-tui.mp4" poster="/media/ralph-loop-tui.webp" title="The same Ralph loop from inside hmz: /flow, choose ralph_loop, set up the agent, save, then the task" caption="Inside hmz: /flow, choose ralph_loop, set up its one agent, save, then say what to do. Each round is a fresh session with its own codename." />

## The flows it runs

The runtime runs flows; it does not decide what a good flow is. That split is deliberate, and
everything else at Humanfia is built on it.

A **flow** is a directory of Python that says which agents it drives, what each is asked, in
what order and when to stop. The ones that ship with the runtime, plus the flowverse it
fetches, cover most of the loop shapes the field has converged on:

<PostCards>
<PostCard kicker="One agent" title="Forget every round, or remember all of them">

<code>ralph_loop</code> opens a session of its own each round; <code>stateful_ralph</code> and <code>continue_loop</code> hold one and keep going. Same loop, opposite trade.

</PostCard>
<PostCard kicker="Two agents" title="Take turns on the same tree">

<code>flame_chase</code> alternates two agents on one task, each reading the repository rather than a history — so neither compounds the other's blind spot.

</PostCard>
<PostCard kicker="Actor and reviewer" title="The review is the next prompt">

<code>rlar</code> gives the actor one session for the whole run and the reviewer a fresh one every round. What the reviewer noticed is what the actor hears, word for word, and the reviewer is what ends the run.

</PostCard>
<PostCard kicker="A plan first" title="Plan, then build under review">

RLCR Flow (<code>humanize1</code>): an idea opened into a draft, a plan two agents agree on, and a build under review until nothing is left to say — the Claude Code plugin Humanize grew out of, as three flows. [Read it →](/flows/humanize1)

</PostCard>
<PostCard kicker="Seven agents" title="Three lanes, one writer">

<code>parallel_flame_chase</code>: a coordinator plans three lanes and leaves. Lane 1 alone writes your tree; lanes 2 and 3 work on private copies and reach it by report.

</PostCard>
<PostCard kicker="The catalogue" title="Every flow, with its loop drawn">

A page each: the <code>hmz exec</code> line, what it takes, what ends it, and what a run picked up a week later carries in. [Read it →](/flows/)

</PostCard>
</PostCards>

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

## Results, as they came in

<ProjectTimeline
  kicker="Humanize · write-ups"
  label="Humanize write-ups from March to September 2026: the gem5 build port, the model, tool and flow comparison, the launch, QCode Discovery, ProgramBench, the four layers and a referee, the review is the next prompt, and the KDA² ablation."
  :entries="[
    { url: '/news/2026-03-01-gem5-scons-to-cmake', metric: '567 files' },
    { url: '/blog/2026-07-08-model-tool-flow', metric: '2 → 50' },
    { url: '/blog/2026-07-20-humanfia-launch', metric: 'Launch' },
    { url: '/news/2026-07-31-qcode-discovery', metric: '17,520 defs' },
    { url: '/news/2026-08-11-programbench', metric: '3.5%' },
    { url: '/blog/2026-08-17-four-layers-and-a-referee', metric: '4 layers' },
    { url: '/blog/2026-08-17-the-review-is-the-next-prompt', metric: 'RLAR' },
    { url: '/blog/2026-09-27-kda-for-kda', metric: '4 → 47' },
  ]"
/>

## Where to go next

<PostCards>
<PostCard kicker="All of it" title="The documentation">

Install, quickstart, and every feature. [Open it ↗](https://docs.humanfia.ai/humanize/)

</PostCard>
<PostCard kicker="Look it up" title="The CLI reference">

Every command, key, flag and Python call, in one place. [Open it ↗](https://docs.humanfia.ai/humanize/reference/cli)

</PostCard>
<PostCard kicker="Read it" title="humanfia/humanize">

The source, Apache-2.0. Issues and pull requests are the fastest way to reach us. [Open it ↗](https://github.com/humanfia/humanize)

</PostCard>
</PostCards>
