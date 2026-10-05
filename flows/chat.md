---
pageClass: flow-page
---

# chat

Talk to one coding agent, with no loop around it: it answers, and what you type back is its
next turn. It is the one flow that needs no budget, and the one `hmz` opens on in a new
project, so there typing a line is all it takes to start. Once you have run another flow,
`$chat` brings you back.

<FlowFacts flow="chat" />

::: code-group

```text [at the prompt]
❯ $chat what does this repository do?
```

```sh [hmz exec]
hmz exec -f chat -a assistant=claude/claude-opus-5:high "what does this repository do?"
```

:::

<FlowPlayer flow="chat" />

Under `hmz exec` nobody is at the prompt to answer, so a run is a single turn: one question
answered, or one task done.

## Roles and params

| Role | What it is | How it is filled | |
| --- | --- | --- | --- |
| `assistant` | agent, required | `-a assistant=…` | The agent you talk to. It may also search and read the web. |
| `human` | you | filled by humanize; no `-a` | The person at the prompt. |
| `workspace` | environment, local | the directory you start in; no `-e` | Where the assistant reads and works. |

Each agent role takes one `-a role=CLI[@PROVIDER]/MODEL[:EFFORT]`; several roles may share one `-a`, comma-separated. There is no `-e` to give: `workspace` is a local environment, the directory you start the run in, and an `-e` naming it is refused. See [Command-line specs](https://docs.humanfia.ai/humanize/reference/flows#running-one).

No params.

## While you talk

- **Type while it works.** The line goes to the agent, into the turn under way where its
  backend allows. See [Talking to a running turn](https://docs.humanfia.ai/humanize/user/steering).
- **Answer its questions.** When the agent stops to ask you something, the question comes to
  your prompt. This works on `claude`, `codex`, `kimi` and `pi`.
- **Keep several going.** See [Many conversations at once](https://docs.humanfia.ai/humanize/user/conversations).

## What ends it

- **Nothing comes back from you.** At the prompt, that is `/stop`, or [`/afk`](https://docs.humanfia.ai/humanize/user/afk),
  which answers for you with nothing. Under `hmz exec`, it is the end of the first turn.
- **The first turn fails.** If the conversation cannot start at all, say because the backend
  refused the account or will not run the model, the run ends with what the backend said. After
  the first turn, a failed turn is reported to you and the conversation goes on.

## Picking it up

`chat` keeps nothing for `--resume`: running it again starts a new conversation. To read an old
one, [export the run](https://docs.humanfia.ai/humanize/user/export) from `/epics` and open its [trace](https://docs.humanfia.ai/humanize/user/tracing).

::: details The whole loop, for the curious
This is the heart of the flow, as humanize ships it:

```python
conversation = await assistant.spawn()
person = await human.spawn()
said = task
while said:
    answered = await assistant.run(said, session=conversation)
    said = await human.run(answered, session=person)
```

[Writing a flow](https://docs.humanfia.ai/humanize/weaver/writing-a-flow) starts from a loop like this one.
:::

## See also

- [ralph_loop](/flows/ralph-loop): one agent, with a loop around it
- [goal](/flows/goal): one agent that keeps going until it says it is done
