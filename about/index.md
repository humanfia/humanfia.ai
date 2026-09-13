---
description: What Humanfia believes about long-horizon agent work, how we work, and how to reach us.
---

# About Humanfia

<p class="lede">We build the flow around the agent: the method, the referee, and the
applications that show whether an agent finishes the work or just starts it impressively. This
page is what we believe and how we work. <a href="/team/">The team</a> is who.</p>

## The bet

A better model writes a better function. It does not, on its own, work for eleven hours, notice
that the third approach was the right one, hold on to a constraint from round one, and stop
when the job is done. That is the loop around the agent — the thing that decides whether eleven
hours of agent time ends in a merged change or a pile of plausible diffs — and almost nobody
measures it.

We think the loop is what lasts. Models are rented and replaced; a method can be written down,
published, measured and improved. So we build methods, give them away, and score them against
each other in public. When one of ours loses, it goes.

It is also why we do not build a model, resell an API or hold anybody's key. The runtime drives
the coding-agent CLI you already log into. If we are adding value, it is above that line.

## How we work

### The person decides what done means

People own the intent, the tradeoffs and the definition of done. Agents are leverage inside
that, not a replacement for it. In [Humanize 1](/projects/rlcr-loop), the person is one of the
agents in the loop.

### The builder is not the judge

The model that wrote the code should not be the only one deciding whether it is any good. Every
serious flow we run has a second agent that arrives with no memory of the work and reads the
repository instead. It is the most useful thing we know.

### Reward hacking is the normal failure

Not incompetence. On a long run, work fails by *looking* finished: a test narrowed until it
passes, a branch special-cased on the input that test uses, a stub with a confident summary on
top. Our reviewers are told to look for exactly that, and our applications are picked so it
cannot survive the check.

### If it is not measured, it is a preference

Anyone can have a theory about how to run agents. [FlowBench](/projects/flowbench) is us
agreeing in advance to find out whether ours are right, and to delete the ones that are not.

### Build in public

The runtime, the flows and the reproduction code are open source. When we publish a number, we
publish what it takes to check it, caveats included.

## Who is behind it

[Sihao Liu](https://sihaoliu.github.io/) proposed Humanize 1 at UCLA
[PolyArch](https://github.com/PolyArch), and [Ligeng Zhu](https://lzhu.me) built the team around
it. Everyone else is on [the team page](/team/). Each result is credited at the top of the post
that reports it rather than folded into a team byline.

The code is Apache-2.0, at [github.com/humanfia](https://github.com/humanfia).

## Get in touch

- **A question, a bug, or a flow that beats ours:** open an issue or a pull request on the
  repository it belongs to — [Humanize 2](https://github.com/humanfia/humanize),
  [flowverse](https://github.com/humanfia/flowverse), or
  [this site](https://github.com/humanfia/humanfia.ai).
- **Working on long-horizon agent systems:** we would like to compare notes. Open a discussion
  on [Humanize 2](https://github.com/humanfia/humanize/issues).
- **Who does what:** [the team](/team/).
- **Following along:** [the blog](/blog/), its [RSS feed](/blog/feed.rss), or
  [github.com/humanfia](https://github.com/humanfia).
