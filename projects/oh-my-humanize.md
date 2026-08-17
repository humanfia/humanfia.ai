# oh-my-humanize

<p class="lede">The terminal coding agent we built first: hash-anchored edits, an optimised
tool harness, LSP, Python, browser control and subagents, all in one native binary — built
for long-running agentised workflows before there was a runtime to run them under.</p>

[humanfia/oh-my-humanize](https://github.com/humanfia/oh-my-humanize) ·
[humanfia/humanize-plugin](https://github.com/humanfia/humanize-plugin)

## What it is

A workflow-native terminal agent. Where most terminal agents are a chat loop with tools
bolted on, this one was built around the assumption that a session runs for hours: edits are
anchored by content hash so a stale line number cannot corrupt a file, the tool harness is
tuned for the calls agents actually make, and code intelligence, debugging, browser control
and subagents are in the harness rather than in a plugin.

`humanize-plugin` is the same idea packaged for the coding agent you already use, if you would
rather keep your CLI and take the workflow.

## Where it sits now

oh-my-humanize is the origin of the position everything here is built on: that the leverage in
agentic development is in the *workflow*, not the wrapper. Building it is how we learned that
the workflow deserved to be a first-class object — a thing you can read, fork, publish and
score — rather than behaviour compiled into one binary.

That conclusion is [humanize](/projects/humanize), which drives whichever coding agent you
already have instead of replacing it, and [flowverse](/projects/flowverse), where the
workflows live as code.

If you want a single native harness and are happy inside it, oh-my-humanize is there and it is
Apache-2.0. If you want your existing CLI driven by a loop you can change, start with
[humanize](/projects/humanize).
