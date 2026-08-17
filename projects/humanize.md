# humanize

<p class="lede">The runtime. It takes a flow — a loop written in Python — and makes it a run
that really happens: across ten coding-agent CLIs, on this machine or another one, with every
event written down as it goes.</p>

<div class="stat-strip">
  <div><b>hmz.humanfia.ai</b><span>Tutorials, a page per feature, and the complete CLI, TUI and Python reference</span><em>Documentation</em></div>
  <div><b>10</b><span>Coding-agent CLIs driven through the interfaces they already serve</span><em>Backends</em></div>
  <div><b>Apache-2.0</b><span>humanfia/humanize2 on GitHub, with the flowverse alongside it</span><em>Licence</em></div>
</div>

::: tip The documentation lives at hmz.humanfia.ai
This page is the summary. **[hmz.humanfia.ai](https://hmz.humanfia.ai/)** is the real thing —
installation, nineteen tutorials, one page per feature, and the full reference.
:::

## Install it

```sh
pip install git+https://github.com/humanfia/humanize2.git
```

Then open the interface:

```sh
hmz
```

Or run a flow over the agents you name, one `-a` apiece:

```sh
hmz exec -f official/flame_chase \
    -a claude/claude-opus-4-8:high -a codex/gpt-5.6-sol:high "fix the build"
```

Then read the whole thing back:

```sh
hmz trace collect
```

## What it is for

### One flow, many agents

A flow says what each agent is asked, in what order, and when to stop. The runtime is what
carries that out — opening a session, resuming it, discarding it when the flow wants an agent
that remembers nothing, running many turns at once when the flow wants them concurrent.

### Ten CLIs, one interface

`claude`, `codex`, `dsh`, `agy`, `grok`, `kimi`, `qwen`, `pi`, `opencode` and `mimo`, driven
through the CLI you already log into — plus anything else that speaks the Agent Client
Protocol. humanize holds no API key and talks to no model provider itself, so a flow written
for one backend runs on another by changing a flag.

### A prompt you can watch

A transcript per conversation, **tab** to step between the agents that are working, and a line
typed mid-turn that goes *into* the turn rather than queueing behind it. When you are away,
`/afk` decides whether an agent may stop and ask you something.

### Somewhere other than here

An agent can be given a container of its own, or moored to an ssh host so its commands land
there while the process stays on this machine. Worktrees let one agent work in several places
at once.

### The whole run as a timeline

Every run is written down as it happens, and `hmz trace collect` turns it into a Chrome trace
you open in Perfetto: one process per agent, one track per row of its sessions, one slice per
thing it did. This is how a question like *where did the eleven hours go* gets an answer
instead of a theory.

## Three things to know before pointing it at a repository you care about

- Agents run with **permission prompts disabled**, and nothing turns them back on.
- **A flow is a directory of Python, and reading one means running it** — adding a flowverse
  is trusting that repository with the machine.
- **An `hmz anchor` port is equivalent to a shell on that machine.**

The [Security](https://hmz.humanfia.ai/guide/security) page says exactly what each of these
means and what to do about it.

## Where to go next

<div class="card-grid">
  <a class="card" href="https://hmz.humanfia.ai/guide/getting-started">
    <span class="kicker">Guide</span>
    <h3>Getting started</h3>
    <p>From nothing installed to a run you can read back.</p>
  </a>
  <a class="card" href="https://hmz.humanfia.ai/guide/concepts">
    <span class="kicker">Guide</span>
    <h3>Concepts</h3>
    <p>The ten words the rest of the documentation is written in.</p>
  </a>
  <a class="card" href="/flows/">
    <span class="kicker">Method</span>
    <h3>The flows to run on it</h3>
    <p>RLAR, Flame Chase, Humanize 1, and the loops everyone knows.</p>
  </a>
  <a class="card" href="https://github.com/humanfia/humanize2">
    <span class="kicker">Source</span>
    <h3>humanfia/humanize2</h3>
    <p>Apache-2.0. Issues and pull requests welcome.</p>
  </a>
</div>
