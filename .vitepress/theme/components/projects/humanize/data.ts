// What the Humanize page says, in one place: the numbers, the harnesses, the features and the
// flows. The components lay it out; nothing here is drawn.

export const REPO = 'https://github.com/humanfia/humanize'

/** The four numbers under the hero. */
export const STATS = [
  { value: 13, kicker: 'Coding-agent CLIs', text: 'Plus any CLI that speaks the Agent Client Protocol' },
  { display: 'litellm', kicker: 'Model harness', text: 'One chat completion per turn, with no tools or environment' },
  { value: 7, kicker: 'Built-in flows', text: 'From chat to flame_chase; more in the flowverse', href: '/flows/' },
  { value: 20, kicker: 'Layers', text: 'A test checks which may import which' },
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
  { name: 'mimo', product: 'mimocode', kind: 'CLI', driven: 'one mimo run per turn' },
  { name: 'mcode', product: 'MiniMax Code', kind: 'CLI', driven: 'one mcode exec per turn' },
  { name: 'qwen', product: 'Qwen Code', kind: 'CLI', driven: 'one process held open (stream-json)' },
  { name: 'kimi', product: 'Kimi Code', kind: 'CLI', driven: 'one kimi web daemon per agent' },
  { name: 'grok', product: 'Grok Build', kind: 'CLI', driven: 'one grok agent stdio held open' },
  { name: 'pi', product: 'pi', kind: 'CLI', driven: 'one pi --mode rpc held open per session' },
  { name: 'omp', product: 'Oh My Pi', kind: 'CLI', driven: 'one omp --mode rpc held open per session' },
  { name: 'agy', product: 'Antigravity CLI', kind: 'CLI', driven: 'one process held open (stream-json)' },
  { name: 'dsh', product: 'DeepSeek Harness', kind: 'CLI', driven: 'its Python SDK, in this process' },
  { name: 'litellm', product: 'a model, called directly', kind: 'Model', driven: 'one chat completion per turn over the session history', highlight: true },
  { name: 'acp', product: 'any ACP agent', kind: 'Protocol', driven: 'one process held open, JSON-RPC over stdio' },
]

/** Twelve features, one card each. A card whose title says it all, and links on, has no body. */
export const FEATURES = [
  { kicker: 'The anchor', title: 'Run an agent’s work on another machine', body: 'Each syscall is replayed on the other machine or answered locally. The agent is unchanged.', href: '#coganchor' },
  { kicker: 'Accounts', title: 'One CLI, signed in as several accounts', body: 'Humanize points the CLI’s credential files at each account’s own.' },
  { kicker: 'Tracing', title: 'Every agent and program on one timeline', href: '#exomyth' },
  { kicker: 'Steering', title: 'Steer a turn while it runs', body: 'A message goes into the running turn; a failed delivery is reported.' },
  { kicker: 'Shapes', title: 'Typed answers from a pydantic model', body: 'The answer is validated against the model.' },
  { kicker: 'Backends', title: 'Thirteen CLIs, LiteLLM and any ACP agent', href: '#every-harness' },
  { kicker: 'Flows', title: 'A flow is Python', href: '#the-flows-it-runs' },
  { kicker: 'Concurrency', title: 'Many turns at once', body: 'Turns in one session run in order; separate sessions run in parallel.' },
  { kicker: 'Resuming', title: 'Resume a run where it stopped', body: 'The flow’s state is restored from its journal. A conversation goes on only if the flow kept it.' },
  { kicker: 'Goals', title: 'Keep going until the goal is met', body: 'With the backend’s goal feature, a turn that would end starts another until the model says the goal is met.' },
  { kicker: 'The person', title: 'You, as one of the agents', body: 'A flow can ask a person to review or decide at any step.' },
  { kicker: 'Interfaces', title: 'A terminal, a browser or a Mac app', body: 'hmz, hmz web and Humanize Desktop show the same epics. An epic keeps running when the window closes.' },
]

/** The loop shapes that ship, each drawn by its own scene from theme/flows.ts. */
export const FLOWS = [
  { kicker: 'One agent', title: 'A fresh session each round, or one kept throughout', scene: 'ralph_loop', href: '/flows/ralph-loop', body: 'ralph_loop opens a fresh session each round; stateful_ralph and continue_loop keep one throughout.' },
  { kicker: 'Two agents', title: 'Take turns on the same tree', scene: 'flame_chase', href: '/flows/flame-chase', body: 'flame_chase alternates two agents on one task. Each reads the repository, not the other’s history.' },
  { kicker: 'Actor and reviewer', title: 'The reviewer’s notes become the actor’s next prompt', scene: 'rlar', href: '/flows/rlar', body: 'rlar keeps one actor session for the whole run and opens a fresh reviewer session each round.' },
  { kicker: 'A plan first', title: 'Plan, then build under review', scene: 'humanize1-rlcr', href: '/flows/humanize1', body: 'RLCR Flow (humanize1): an idea is drafted, two agents agree a plan, then the build is reviewed until approved.' },
  { kicker: 'Seven agents', title: 'Three parallel lanes; only lane 1 writes your tree', scene: 'parallel_flame_chase', href: '/flows/parallel-flame-chase', body: 'flame_chasoid:parallel: a coordinator plans three lanes. Lanes 2 and 3 work on private copies and report to lane 1.' },
]
