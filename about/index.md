---
description: Who Humanfia is, what we believe about long-horizon agent work, and how to reach us.
---

# About Humanfia

<p class="lede">We are a small group building the layer above the model: the runtime, the
flows and the benchmark that decide whether an agent finishes the work or merely starts it
impressively.</p>

## The bet

Everyone can see that models are getting better. Fewer people are working on the thing that
determines whether eleven hours of agent time produces a merged change or a pile of plausible
diffs — the loop.

We think that loop is the durable artefact. Models are rented and replaced; a method that
works is something you can write down, publish, measure and improve. So we build methods,
we give them away, and we score them against each other in public. If one of ours loses, it
goes.

That is also why we do not build a model, resell an API or hold anybody's key. The runtime
drives the coding-agent CLI you already log into. If we are adding value, it is above that
line or not at all.

## How we work

### Automation without abdication

The human owns the intent, the tradeoffs and the definition of done. Agents are leverage
inside that contract, not a replacement for it. In [Humanize 1](/flows/humanize1), the person
is literally one of the agents in the loop.

### The builder is not the judge

The model that wrote the code should not be the only model deciding whether the code is good.
Every serious flow we run has a second agent that arrives with no memory of how the work was
arrived at and reads the repository instead. This is the single highest-leverage thing we
know.

### Reward hacking is the default failure

Not incompetence. On a long run, the way work fails is that it *looks* finished: a test
narrowed until it passes, a branch special-cased on the input the test uses, a stub with a
confident summary on top. Our reviewers are told this is the thing they are most there to
catch, and our applications are chosen so that it cannot survive the check.

### If it is not measured, it is a preference

Anyone can have a theory about how agents should be run. [flowbench](/projects/flowbench) is
us agreeing, in advance, to find out whether ours are right — and to delete the ones that are
not.

### Build in public

The runtime, the flows and the reproduction code are open source. When we publish a number, we
publish what it takes to check it, including the parts that need caveats.

## Who is behind it

Humanfia is maintained by [@futrime](https://github.com/futrime) and built alongside
collaborators in academia and industry — the [KDA](/applications/kda) work is joint with
[MIT HAN Lab](https://hanlab.mit.edu/), and the loop that became
[Humanize 1](/flows/humanize1) began at [PolyArch](https://github.com/PolyArch).

The code is Apache-2.0. Everything we ship is at
[github.com/humanfia](https://github.com/humanfia).

## Get in touch

- **A question, a bug, or a flow that beats ours:** open an issue or a pull request on the
  repository it belongs to — [humanize](https://github.com/humanfia/humanize2),
  [flowverse](https://github.com/humanfia/flowverse), or
  [this site](https://github.com/humanfia/humanfia.ai).
- **Working on long-horizon agent systems and want to compare notes:** we are interested. Open
  a discussion on [humanize](https://github.com/humanfia/humanize2/issues).
- **Following along:** [the blog](/blog/), its [RSS feed](/blog/feed.rss), or
  [github.com/humanfia](https://github.com/humanfia).
