---
title: Deep Tech
description: The engine under Humanize, by codename. Phobos, the flow compiler; Exomyth, the visualizer; CogAnchor, remote execution.
outline: [2, 3]
---

<script setup>
import PhobosDiagram from '../.vitepress/theme/components/projects/humanize/PhobosDiagram.vue'
import ExomythDiagram from '../.vitepress/theme/components/projects/humanize/ExomythDiagram.vue'
import CogAnchorDiagram from '../.vitepress/theme/components/projects/humanize/CogAnchorDiagram.vue'
</script>

# Deep Tech

<p class="lede">Humanize has three subsystems under its runtime that we refer to by codename.
Phobos compiles a flow, Exomyth shows what a run did, and CogAnchor lets an agent work on a
machine other than the one it is running on. Each section below says how much of it you can
use today.</p>

[Flow Science](/research/flow-science) is about what the flows find. This page is about the
machinery that lets one flow run for a day, on any machine, and be read afterwards.

## Phobos: the flow compiler {#phobos}

<p class="status"><b>Status:</b> in development, not yet in a Humanize release. Today a flow is
loaded as a Python package straight from a directory, an index or a <code>git+</code>
reference.</p>

A flow in Humanize is ordinary Python: a decorator, the agents it takes and the turns it asks
for. Phobos turns that source into an artifact that can be checked, shipped and composed. It
works in three phases:

1. **Compile and verify.** The compiler lowers the Python flow into a flow IR (intermediate
   representation). A verifier validates the IR and issues a checksum, so every flow has a
   verified identity.
2. **Assemble.** The assembler packs the IR, its checksum and the flow's assets (skills and
   related files) into one unit flow artifact.
3. **Link.** The linker resolves the artifact against the other flows it calls and against an
   external dynamic-link interface for runtime symbols and bindings. The result is one bundle
   that is ready to run.

<PhobosDiagram />

The point is the same as for any compiler. A flow that calls other flows, such as
[AOT](/flows/aot) writing a flow or [humanize1](/flows/humanize1) chaining gen-idea, gen-plan
and RLCR, becomes one verified bundle with known dependencies. Without that, a flow is a
directory whose imports are resolved at run time.

## Exomyth: the visualizer {#exomyth}

<p class="status"><b>Status:</b> shipped in Humanize, as the run trace and program profiling. It
began as its own repository and was merged into the runtime in April.</p>

Exomyth turns the logs that agents leave behind into one Chrome JSON trace, which you open in
[Perfetto](https://ui.perfetto.dev). Each agent of the run is a process. Its sessions and
sub-agents are tracks, and every thing it did (a turn, a tool call, a message, time spent
thinking) is a slice, with the prompt and output attached. If you profile the run, each program
an agent started is added as a process of its own on the same clock, so a slow test suite shows
up as a wide slice under the tool call that launched it.

<ExomythDiagram />

It reads the session logs of every CLI that Humanize drives and that writes them. The trace is
built when you export a run, and nothing is uploaded: Perfetto reads the file in your browser.
How to use it: [Tracing a run](https://docs.humanfia.ai/humanize/user/tracing).

## CogAnchor: remote execution {#coganchor}

<p class="status"><b>Status:</b> shipped in Humanize, as <code>hmz.coganchor</code>. Its
command line is <code>hmz internal anchor</code>.</p>

CogAnchor runs an agent on one machine and has it act on another. The coding agent CLI stays
where it is installed and signed in. The files it reads and writes and the commands it runs
(builds, tests, `git`) are on the target, at the target's own paths. You point one of a flow's
environments at another machine with `-e`, for example
`-e box=ssh@[build-box]/home/me/proj`, and that is where the work happens.

There are three arrangements, depending on where the agent's own process runs:

- **Supervised** (the default). The agent runs here under a seccomp-filtered ptrace supervisor.
  The supervisor stops the agent's path, exec and connect system calls and answers them from
  the target. The workspace is mirrored here and filled lazily.
- **Afar.** The agent and its supervisor run next to the work, on the target or on a third
  machine. Only the agent's standard streams come back.
- **Native.** The target's own installed CLI takes the turn. CogAnchor forwards its streams,
  signals and exit status.

<CogAnchorDiagram />

The serving side needs nothing installed on the target: a POSIX `/bin/sh` and Python 3.12 or
later, with no root, no compiler and no kernel module. When two machines cannot reach each
other directly, a broker introduces them and relays the connection. The fence, which limits
what an agent's processes may reach, is enforced on both machines. Details:
[Remote execution](https://docs.humanfia.ai/humanize/user/remote-execution) and the
[reference](https://docs.humanfia.ai/humanize/reference/remote-execution).
