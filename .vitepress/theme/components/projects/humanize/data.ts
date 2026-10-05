// What the Humanize page says, in one place: the numbers, the harnesses, the features and the
// flows. The components lay it out; nothing here is drawn.

export const DOCS = 'https://docs.humanfia.ai/humanize'
export const REPO = 'https://github.com/humanfia/humanize'

/** The four numbers under the hero. */
export const STATS = [
  { value: 12, kicker: 'Coding-agent CLIs', text: 'Driven through what each one offers, plus any CLI that speaks the Agent Client Protocol' },
  { display: 'litellm', kicker: 'New harness', text: 'A model called directly: one chat completion a turn, no tools, no environment' },
  { value: 7, kicker: 'Built-in flows', text: 'From chat to flame_chase, and a flowverse of more to install', href: '/flows/' },
  { value: 17, kicker: 'Layers', text: 'Each may import only what a table lists for it, and a test holds the rule' },
]

/** The Humanize ablation in the KDA² post (2026-09-27): four base models, three levels of
 *  scaffolding, 50 problems each. */
export const ABLATION = [
  {
    key: 'putnam',
    label: 'PutnamBench',
    rows: [
      { label: 'GPT-5.6-sol', api: 3, cli: 46, flow: 50 },
      { label: 'Kimi-K3', api: 1, cli: 4, flow: 47 },
      { label: 'GLM-5.3', api: 0, cli: 2, flow: 25 },
      { label: 'DeepSeek V4 Pro', api: 0, cli: 4, flow: 13 },
    ],
  },
  {
    key: 'physics',
    label: 'Physics Cup',
    rows: [
      { label: 'GPT-5.6-sol', api: 31, cli: 41, flow: 44 },
      { label: 'Kimi-K3', api: 35, cli: 37, flow: 42 },
      { label: 'GLM-5.3', api: 24, cli: 34, flow: 40 },
      { label: 'DeepSeek V4 Pro', api: 32, cli: 35, flow: 39 },
    ],
  },
] as const

export const LEVELS = [
  { key: 'api', label: 'Model API' },
  { key: 'cli', label: 'Coding CLI' },
  { key: 'flow', label: 'Humanize flow' },
] as const

/** Every harness `-a` takes, from hmz.flows.HarnessKind and the agents reference. */
export const HARNESSES = [
  { name: 'claude', product: 'Claude Code', kind: 'CLI', model: 'claude-opus-5:high', driven: 'one claude --print held open per session' },
  { name: 'codex', product: 'Codex', kind: 'CLI', model: 'gpt-5.6-sol:high', driven: 'one codex app-server per agent, shared by its sessions' },
  { name: 'cursor-agent', product: 'Cursor Agent', kind: 'CLI', driven: 'one cursor-agent --print per turn' },
  { name: 'opencode', product: 'opencode', kind: 'CLI', driven: 'one opencode run per turn' },
  { name: 'mimo', product: 'MiMo Code', kind: 'CLI', driven: 'one mimo run per turn' },
  { name: 'mcode', product: 'MiniMax Code', kind: 'CLI', driven: 'one mcode exec per turn' },
  { name: 'qwen', product: 'Qwen Code', kind: 'CLI', driven: 'one process held open (stream-json)' },
  { name: 'kimi', product: 'Kimi Code', kind: 'CLI', driven: 'one kimi web daemon per agent' },
  { name: 'grok', product: 'Grok Build', kind: 'CLI', driven: 'one grok agent stdio held open' },
  { name: 'pi', product: 'pi', kind: 'CLI', driven: 'one pi --mode rpc held open per session' },
  { name: 'agy', product: 'Antigravity CLI', kind: 'CLI', driven: 'one process held open (stream-json)' },
  { name: 'dsh', product: 'DeepSeek Harness', kind: 'CLI', driven: 'its Python SDK, in this process' },
  { name: 'litellm', product: 'a model, called directly', kind: 'Model · new', driven: 'one chat completion per turn over the session history', highlight: true },
  { name: 'acp', product: 'any ACP agent', kind: 'Protocol', driven: 'one process held open, JSON-RPC over stdio' },
]

/** Eleven features, one line each. */
export const FEATURES = [
  { kicker: 'The anchor', title: 'The agent runs here. Its syscalls land there.', body: 'Every syscall the agent makes is decided one at a time — replayed on another machine, or answered on this one. It is told none of it.', href: '#coganchor' },
  { kicker: 'Accounts', title: 'Two accounts of one CLI', body: 'A CLI signs in once. Humanize runs it as an account it was never signed into, by answering the paths it opens with other paths.' },
  { kicker: 'Tracing', title: 'One timeline', body: 'Every agent, every sub-agent and every program those turns ran, on one clock, in one document you open in Perfetto.', href: '#exomyth' },
  { kicker: 'Steering', title: 'A line typed mid-turn', body: 'It goes into the turn that is running. Not queued behind it, and never quietly counted as said.' },
  { kicker: 'Shapes', title: 'Answers in a shape', body: 'A turn given a pydantic model answers with that model. The model is the whole of the question, and the answer is read back through it.' },
  { kicker: 'Backends', title: 'Twelve CLIs, one agent', body: 'Twelve coding agents, a model called directly through litellm, and anything speaking the Agent Client Protocol.', href: '#every-harness' },
  { kicker: 'Flows', title: 'A flow is Python', body: 'A loop, a subprocess call, a file read between turns. The agents are its arguments, and the shapes a loop takes are few.', href: '#the-flows-it-runs' },
  { kicker: 'Concurrency', title: 'Many turns at once', body: 'Turns are sequential only inside one session. Two hundred conversations are two hundred turns.' },
  { kicker: 'Resuming', title: 'Picked up where it stopped', body: 'A loop meant to run for a week is a loop that will be stopped. What it was keeping track of survives; the conversation does not.' },
  { kicker: 'Goals', title: 'It decides when it is done', body: 'The backend’s own goal feature: a turn that would have ended starts another, until the model says the objective is met.' },
  { kicker: 'The person', title: 'You, as one of the agents', body: 'A flow asks a person the same way it asks a model — which is how a human stays the architect rather than the bottleneck.' },
]

/** The loop shapes that ship, each drawn by its own scene from theme/flows.ts. */
export const FLOWS = [
  { kicker: 'One agent', title: 'Forget every round, or remember all of them', scene: 'ralph_loop', href: '/flows/ralph-loop', body: 'ralph_loop opens a session of its own each round; stateful_ralph and continue_loop hold one and keep going. Same loop, opposite trade.' },
  { kicker: 'Two agents', title: 'Take turns on the same tree', scene: 'flame_chase', href: '/flows/flame-chase', body: 'flame_chase alternates two agents on one task, each reading the repository rather than a history — so neither compounds the other’s blind spot.' },
  { kicker: 'Actor and reviewer', title: 'The review is the next prompt', scene: 'rlar', href: '/flows/rlar', body: 'rlar gives the actor one session for the whole run and the reviewer a fresh one every round. What the reviewer noticed is what the actor hears, word for word.' },
  { kicker: 'A plan first', title: 'Plan, then build under review', scene: 'humanize1-rlcr', href: '/flows/humanize1', body: 'RLCR Flow (humanize1): an idea opened into a draft, a plan two agents agree on, and a build under review until nothing is left to say.' },
  { kicker: 'Seven agents', title: 'Three lanes, one writer', scene: 'parallel_flame_chase', href: '/flows/parallel-flame-chase', body: 'parallel_flame_chase: a coordinator plans three lanes and leaves. Lane 1 alone writes your tree; lanes 2 and 3 work on private copies and reach it by report.' },
]
