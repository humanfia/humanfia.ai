---
description: Humanize 1 — idea to draft, draft to plan, plan to built-and-reviewed. The RLCR loop behind the IMO 2026 and PutnamBench results.
---

# Humanize 1

<p class="lede">The loop we are known for. An idea is opened into a repo-grounded draft, the
draft is argued into a plan, and the plan is built under continuous review until there is
nothing left to say. It began as a Claude Code plugin with more than 1,300 stars; in the
flowverse it is three flows that run on any backend.</p>

```sh
hmz exec -f official/humanize1:gen-idea -a claude/claude-opus-4-8:max \
    "add undo/redo to the editor"

hmz exec -f official/humanize1:gen-plan \
    -a claude/claude-opus-4-8:max -a codex/gpt-5.6-sol:max \
    "add undo/redo to the editor"

hmz exec -f official/humanize1:rlcr \
    -a claude/claude-opus-4-8:max -a codex/gpt-5.6-sol:max "build it"
```

## Three stages, because three things stop separately

| Stage | Agents | What comes out |
| --- | --- | --- |
| `gen-idea` | a drafter | A loose idea opened into a draft grounded in this repository. |
| `gen-plan` | a planner and an analyst that reads it back | A plan the two have converged on. |
| `rlcr` | a builder, a reviewer, and you | The plan, built, under review, until nothing is left. |

What passes between them is a file — the draft, then the plan — so an idea can be opened on
one model, planned on another and built on a third, with as much reading and editing by a
human in between as you like. That is not a limitation of the design; it is the design. The
human owns the plan.

## RLCR: the loop at the end

`rlcr` is the part people mean when they say Humanize. Run in a git repository, the work is
anchored to the commit the plan was fixed at, and every review reads what came after it.

**The side that writes remembers; the side that reads does not.** The builder holds one
session for the whole loop. Every review is a session that has just started, reads the
repository itself, and is told nothing about how the work was arrived at. (If that sounds
familiar, [RLAR](/flows/rlar) is what happens when you take this one idea and throw away
everything else.)

**The loop is a hook, not a countdown.** A round does not end when a timer expires or a
counter is reached. It ends when the builder believes the entire plan is done and tries to
stop — and what the reviewer says is what it hears *instead of* stopping. There is no way to
declare victory unilaterally.

**The plan stays fixed.** Guards sit on the one moment a refusal actually reaches an agent, so
the builder cannot quietly rewrite the plan it is being held to, and cannot write the loop's
own state.

**A person is one of the agents.** In `rlcr` you are in the flow, not outside it — asked when
the flow needs a human, on the same footing as the other two.

## What changed in the port

The plugin is Claude-and-Codex; the flow is whatever two agents you name. Making that true
meant replacing four things that were mechanism rather than behaviour — most notably `codex
review`, which is a Codex feature that takes no prompt, with an explicit review prompt that
asks for exactly the same graded output the loop then reads the same way.

Everything that was *behaviour* was kept: every gate the plugin's stop hook runs is run here,
in the same order, in its own words, and what it writes is written where the plugin writes it.

## What it has done

This is the loop behind the results on [HOA](/applications/hoa): all six IMO 2026 problems
with Lean 4 verification, and 670 of 672 on PutnamBench at first place on the official
leaderboard. Weeks of watching it run is where most of our opinions about long-horizon agent
work came from — including the ones that turned into other flows.

[PolyArch/humanize](https://github.com/PolyArch/humanize) — the original plugin ·
[RLAR](/flows/rlar) · [Flame Chase Loop](/flows/flame-chase)
