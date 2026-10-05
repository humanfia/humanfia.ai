// HMA's numbers, in one place, and nothing in here that a source does not say.
//
// MLE-bench: the repository's main results table (humanfia/hma, README "Main results"), all
// percentages over the same 75 tasks, self-reported. Kaggle: the 15 August and 5 October
// write-ups (news/) and the audit they cite. Anything a component shows that is not a number
// below is arithmetic on these numbers -- a difference, a mean -- never a new measurement.

export type Metric = 'medal' | 'gold' | 'median' | 'pct'

export const METRICS: { key: Metric; label: string; short: string; said: string }[] = [
  { key: 'medal', label: 'Any medal', short: 'Medal', said: 'Share of the 75 tasks that won any medal.' },
  { key: 'gold', label: 'Gold', short: 'Gold', said: 'Share of the 75 tasks that won gold.' },
  { key: 'median', label: 'Median+', short: 'Median+', said: 'Share of the tasks above the human leaderboard median.' },
  { key: 'pct', label: 'Mean percentile', short: 'Pctl', said: 'Mean of the task-level leaderboard percentiles.' },
]

export interface Workflow {
  id: string
  /** The models, in the order they go; one for a single agent. */
  agents: string[]
  /** The harness it ran under, when it is not HMA. */
  harness?: string
  hma: boolean
  hours: number
  values: Partial<Record<Metric, number>>
}

export const WORKFLOWS: Workflow[] = [
  { id: 'hma', agents: ['Opus 5', 'GPT-5.6-sol'], hma: true, hours: 6, values: { medal: 78.2, gold: 53.8, median: 90.7, pct: 89.0 } },
  { id: 'hma-rev', agents: ['GPT-5.6-sol', 'Opus 5'], hma: true, hours: 6, values: { medal: 73.3, gold: 50.7, median: 85.3, pct: 85.4 } },
  { id: 'opus', agents: ['Opus 5'], harness: 'native /goal', hma: false, hours: 6, values: { medal: 72.4, gold: 50.7, median: 85.3, pct: 84.8 } },
  { id: 'hma-ds', agents: ['GPT-5.6-sol', 'DeepSeek V4.1 Flash'], hma: true, hours: 6, values: { medal: 72.0, gold: 50.7, median: 85.3, pct: 84.4 } },
  { id: 'hma-kimi', agents: ['GPT-5.6-sol', 'Kimi K3'], hma: true, hours: 6, values: { medal: 70.7, gold: 50.7, median: 85.3, pct: 83.9 } },
  { id: 'scienceflow', agents: ['ScienceFlow'], hma: false, hours: 24, values: { medal: 70.2 } },
  { id: 'gpt', agents: ['GPT-5.6-sol'], harness: 'native /goal', hma: false, hours: 6, values: { medal: 68.0, gold: 47.6, median: 81.3, pct: 81.3 } },
  { id: 'mlevolve', agents: ['MLEvolve'], hma: false, hours: 12, values: { medal: 65.3, gold: 34.7, median: 76.0 } },
]

export const byId = (id: string) => WORKFLOWS.find((w) => w.id === id)!

/** The headline's own comparison: the same two models, each alone. */
export const BASELINES = ['opus', 'gpt'] as const

/** Any-medal points over the mean of the two single-agent runs. Only the any-medal column is
 *  recomputed here: the table's other columns are rounded, and a gain worked out from them can
 *  land a tenth away from the repository's own (its mean-percentile gain is 5.9, not 6.0). */
export const gainOverBaselines = (w: Workflow) => {
  const alone = BASELINES.map(byId)
  // A pairing with a model the table has no single-agent run for has no baseline here.
  if (!w.hma || !alone.every((b) => w.agents.includes(b.agents[0]))) return undefined
  return w.values.medal! - (alone[0].values.medal! + alone[1].values.medal!) / 2
}

/** The best pairing's mean-percentile gain, as the repository states it. */
export const BEST_PCT_GAIN = 5.9

/** Across the six pairings the paper evaluated, from the repository's results summary. The
 *  main table carries four of them, so this one cannot be recomputed here. */
export const AVERAGE_GAIN = 6.4
export const PAIRINGS_EVALUATED = 6

// ------------------------------------------------------------------------------- pairings

export interface Model {
  name: string
  /** The cell key; DeepSeek's two Flash versions share a row. */
  key: string
  harness: string
  /** The single-agent native /goal run, where the main table has one. */
  alone?: string
}

export const MODELS: Model[] = [
  { key: 'Opus 5', name: 'Claude Opus 5', harness: 'Claude Code', alone: 'opus' },
  { key: 'GPT-5.6-sol', name: 'GPT-5.6-sol', harness: 'Codex', alone: 'gpt' },
  { key: 'GLM-5.3', name: 'GLM-5.3', harness: 'Claude Code' },
  { key: 'DeepSeek V4.1 Flash', name: 'DeepSeek V4 / V4.1 Flash', harness: 'DeepSeek Harness' },
  { key: 'Kimi K3', name: 'Kimi K3', harness: 'Kimi Code' },
]

/** The HMA run a pairing names, first agent then second, if the main table has it. */
export const pairing = (first: string, second: string) =>
  WORKFLOWS.find((w) => w.hma && w.agents[0] === first && w.agents[1] === second)

export const TASKS = { low: 22, medium: 38, high: 15 }
export const SETUP = [
  { value: '1 × A10', said: 'NVIDIA GPU per task' },
  { value: '30', said: 'vCPUs per task' },
  { value: '220 GiB', said: 'RAM per task' },
  { value: '27', said: 'configurations in the full plan' },
  { value: '3,397', said: 'task-runs in the full plan' },
  { value: '16', said: 'tasks in the fixed subset for external harnesses' },
]

// ---------------------------------------------------------------------------------- Kaggle

/** 5 October: the best tracked result in each of 39 completed competitions, by what it is. */
export const KAGGLE_TALLY = {
  tracked: 39,
  final: 3,
  snapshot: 1,
  late: 12,
}

export const FINISHES = [
  { name: 'Predicting Student Health Risk', score: 2.0, us: true },
  { name: 'ROGII Wellbore Geology', score: 2.24, us: true },
  { name: 'Biohub · Cell Tracking', score: 4.76, us: true, detail: '188th of 3,947' },
]

export const BIOHUB = {
  public: { rank: 8, of: 2378, top: 0.34, when: '15 Aug · public board' },
  final: { rank: 188, of: 3947, top: 4.76, when: 'Final · private board' },
}
