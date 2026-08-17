# flowverse

<p class="lede">The flows humanize offers but does not ship. A flowverse is a git repository
with a <code>flows/</code> directory in it — which makes a method something you publish, fork
and version rather than something you describe in a paragraph and hope was understood.</p>

## What is in the official one

[humanfia/flowverse](https://github.com/humanfia/flowverse) is offered from the start, under
the name `official`, and is fetched the first time somebody runs one of its flows.

| Flow | What it does |
| --- | --- |
| [`official/rlar`](/flows/rlar) | An actor works and a reviewer reads it, until the reviewer has nothing left. |
| [`official/flame_chase`](/flows/flame-chase) | Two agents chasing each other's work, turn about. |
| [`official/humanize1:gen-idea`](/flows/humanize1) | Opens a loose idea into a repo-grounded draft. |
| [`official/humanize1:gen-plan`](/flows/humanize1) | Turns that draft into a plan both sides have converged on. |
| [`official/humanize1:rlcr`](/flows/humanize1) | Builds the plan under review until nothing is left to say. |
| [`official/goal`](/flows/#goal) | One agent given a goal, asked again until the goal is met. |
| [`official/continue_loop`](/flows/#continue-loop) | One session told to continue until it says it is finished. |
| [`official/fixed_juice_ralph`](/flows/#fixed-juice-ralph) | A ralph loop held to an answer size, the effort moved between turns. |

`ralph_loop` and `chat` ship inside humanize itself, so they need no flowverse at all.

## Why a repository and not a config file

Three consequences, all of them the point.

**A method is readable.** Every flow above is a file short enough to read in a sitting. What
it drives, what it can be set up with, and the line that starts it are at the top of it.

**A method is forkable.** Press `f` on a flow in the `/flow` menu and humanize writes a copy
into `.humanize/flows/` for you to change. The skills it carries come with it, so a fork that
wants its reviews written differently edits one Markdown file and runs.

**A method is yours.** Anybody can publish a flowverse. Point humanize at your repository and
your team's loops are one name away for everyone on it — which is the same shape as a plugin
registry, except that what is being distributed is a way of working rather than a tool.

## Run one

```sh
hmz exec -f official/rlar \
    -a claude/claude-opus-4-8:max -a codex/gpt-5.6-sol:max "$(cat TASK.md)"
```

Every flow there is named `official/<flow>`, and one file that holds several entry points is
`official/<flow>:<name>`. `hmz exec -f official/<flow> --help` says what a given flow drives
and what it can be told.

## Write one

```
flowverse/
├── flows/                   what humanize reads, and the only thing it reads
│   ├── rlar/                →  official/rlar
│   │   ├── __init__.py         the flow itself
│   │   └── skills/             what it brings: one directory per skill, each a SKILL.md
│   └── humanize1/           →  official/humanize1:gen-idea, :gen-plan, :rlcr
│       ├── __init__.py
│       └── _humanize1/         not a flow; what the flow beside it imports
└── tests/                   this repository's own, run against humanize itself
```

A flow is one directory in `flows/` whose `__init__.py` imports nothing of humanize but
`hmz.agents`, and holds a `run(agents, task)` — or several entry points marked with `@flow`,
which is what makes one flow three flows. A flow that brings nothing with it may be a single
`.py` file instead.

The [tutorial on writing flows](https://hmz.humanfia.ai/guide/tutorial-first-flow) goes from
an empty file to a published flowverse in ten steps.

::: warning Reading a flow means running it
A flow is Python. Adding somebody's flowverse is trusting that repository with your machine —
the same trust as installing their package, and worth the same amount of looking first.
:::
