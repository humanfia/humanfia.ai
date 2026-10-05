// Every figure on the Flow Science page, as data. The points were read off the charts in the
// "Humanize Intro" deck (October 2026) by tracing each series' colour column by column in the
// slide images and converting pixels back to values with the figure's own axis ticks; end points
// the slides print as numbers (MLE-bench's 48/75, ProgramBench's 90.2, ...) are pinned to the
// printed value. A curve is therefore as accurate as a careful reading of the published figure,
// and no more: these are the deck's runs, Humanfia-reported, not a benchmark leaderboard.

import raw from './deck-data.json'
import { kilo, knots, linear, log, type Point, type Scale, type Series } from './chart'

type Raw = { id: string; points: Point[] }[]
const R = raw as unknown as Record<string, Raw | Raw[]>

const pick = (rows: Raw, spec: [string, string, number][]): Series[] =>
  spec.map(([id, label, tone]) => {
    const row = rows.find((r) => r.id === id)
    if (!row) throw new Error(`no series ${id}`)
    return { id, label, tone, points: row.points }
  })

export interface Figure {
  key: string
  tab: string
  series: Series[]
  x: Scale
  y: Scale
  xLabel: string
  yLabel: string
  step?: boolean
  lowerBetter?: boolean
  readout?: (v: number) => string
  summary: string
  note: string
}

const pct = (v: number) => `${Math.round(v)}%`
const hours = (v: number) => `${+v.toFixed(v < 10 ? 1 : 0)}h`
const cycles = linear(1000, 1500, [1000, 1100, 1200, 1300, 1400, 1500], (v) => `${Math.round(v)}`)

// ------------------------------------------------------------------------------- ablations

export const ABLATIONS: Figure[] = [
  {
    key: 'mle',
    tab: 'MLE-bench',
    series: pick(R.mle as Raw, [
      ['flame-chase', 'Flame Chase · Opus 5 ↔ GPT-5.6 Sol', 0],
      ['goal-opus', '/goal · Claude Opus 5', 1],
      ['pfc-gitpr', 'Parallel Flame Chase · Git/PR', 3],
      ['goal-gpt', '/goal · GPT-5.6 Sol', 2],
    ]),
    x: linear(0, 6, [0, 1, 2, 3, 4, 5, 6], (v) => `${+v.toFixed(1)}h`),
    y: linear(0, 100, [0, 20, 40, 60, 80, 100], pct),
    xLabel: 'Active time per task',
    yLabel: 'Latest-submission any-medal score',
    readout: (v) => `${Math.round((v * 75) / 100)}/75 · ${v.toFixed(1)}%`,
    summary:
      'MLE-bench, 75 tasks, six hours: Flame Chase and Claude Opus 5 /goal both end at 52 of 75 (69.3%), Parallel Flame Chase at 50 (66.7%), GPT-5.6 Sol /goal at 48 (64.0%). Flame Chase leads for most of the run.',
    note: '75 tasks (22 lite, 38 medium, 15 hard), max effort. Each valid submission replaces the task’s previous status, so a later medal loss subtracts a point. This is the deck’s latest-submission metric; HMA’s published best-of-run figure is 78.2% any-medal.',
  },
  {
    key: 'hle',
    tab: 'HLE',
    series: pick(R.hle as Raw, [
      ['flame-chase', 'Flame Chase', 0],
      ['goal', 'Humanize /goal', 1],
      ['rlcr', 'RLCR', 3],
      ['ralph-loop', 'Ralph loop', 2],
    ]),
    x: knots(
      [[0, 0.02], [1, 0.096], [3, 0.193], [10, 0.42], [30, 0.653], [60, 0.805], [120, 0.946], [150, 1]],
      (v) => `${v < 10 ? +v.toFixed(1) : Math.round(v)} min`,
    ),
    y: linear(0, 60, [0, 10, 20, 30, 40, 50, 60], pct),
    xLabel: 'Elapsed time per task (uneven scale)',
    yLabel: 'Strict score',
    readout: (v) => `${v.toFixed(1)}%`,
    summary:
      'HLE subset, strict score against minutes per task: /goal climbs fastest, Flame Chase catches it by about an hour and finishes highest near 53%; the Ralph loop and RLCR are slow and only jump at the end.',
    note: 'Shaded bands in the source (seed spread) are not redrawn. The time axis follows the source’s uneven spacing.',
  },
  {
    key: 'programbench',
    tab: 'ProgramBench',
    series: pick(R.programbench as Raw, [
      ['flame-chase', 'Flame Chase · Opus 5 ↔ GPT-5.6 Sol', 0],
      ['goal-opus', '/goal · Claude Opus 5', 1],
      ['rlar', 'RLAR · Opus 5 writes, GPT-5.6 Sol reviews', 3],
      ['goal-gpt', '/goal · GPT-5.6 Sol', 2],
    ]),
    x: linear(0, 12, [0, 2, 4, 6, 8, 10, 12], hours),
    y: linear(0, 100, [0, 20, 40, 60, 80, 100], (v) => `${v}`),
    xLabel: 'Active time per task',
    yLabel: 'Best-so-far score, mean over tasks (0–100)',
    readout: (v) => v.toFixed(1),
    summary:
      'ProgramBench, four tasks, twelve hours: Flame Chase ends at 90.2, Claude Opus 5 /goal at 87.8, RLAR at 86.4 and GPT-5.6 Sol /goal at 79.8. GPT /goal is fastest for the first two hours and then stalls.',
    note: 'Four tasks (7zip, delta, scc, zk), three seeds per arm, max effort. A panel measurement, not the ProgramBench leaderboard result in the news.',
  },
  {
    key: 'takehome',
    tab: 'Performance take-home',
    series: pick(R['takehome-gpt'] as Raw, [
      ['flame-chase', 'Flame Chase · Fable 5 ↔ GPT-5.6 Sol', 0],
      ['always-continue', 'Always continue', 3],
      ['ralph-loop', 'Ralph loop', 1],
      ['arar', 'ARAR', 5],
      ['always-prompt', 'Always prompt', 2],
      ['goal', '/goal', 4],
    ]),
    x: linear(0, 32, [0, 4, 8, 12, 16, 20, 24, 28, 32], hours),
    y: cycles,
    xLabel: 'Time elapsed',
    yLabel: 'Best clock cycles (lower is better)',
    lowerBetter: true,
    readout: (v) => `${Math.round(v)} cycles`,
    summary:
      'Anthropic’s original performance take-home, best cycle count over time: every single-model flow on GPT-5.6 Sol settles between about 1,045 and 1,080 cycles; the Flame Chase alternating Claude Fable 5 and GPT-5.6 Sol keeps going down, to about 1,005.',
    note: 'All single-model arms are GPT-5.6 Sol at max effort; Flame Chase alternates Claude Fable 5 and GPT-5.6 Sol.',
  },
]

// ---------------------------------------------------------------------------------- tokens

export const SESSION_TO_FLOW: Figure = {
  key: 'tokens',
  tab: 'Output tokens',
  series: pick(R['takehome-tokens'] as Raw, [
    ['flame-chase', 'Flame Chase · Fable 5 ↔ GPT-5.6 Sol', 0],
    ['goal', '/goal · GPT-5.6 Sol', 1],
    ['ralph-loop', 'Ralph loop · GPT-5.6 Sol', 3],
    ['arar', 'ARAR · GPT-5.6 Sol', 5],
    ['always-prompt', 'Always prompt · GPT-5.6 Sol', 2],
  ]),
  x: linear(0, 3.2, [0, 0.5, 1, 1.5, 2, 2.5, 3], (v) => kilo(v * 1e6)),
  y: cycles,
  xLabel: 'Output tokens spent',
  yLabel: 'Best clock cycles (lower is better)',
  lowerBetter: true,
  readout: (v) => `${Math.round(v)} cycles`,
  summary:
    'The performance take-home, best cycle count against output tokens: /goal reaches about 1,080 cycles after 2.6 million tokens; the Ralph loop is below 1,100 within half a million; Flame Chase ends near 1,010.',
  note: 'The Always-continue arm is in the source but too faint there to trace, so it is left out here.',
}

// -------------------------------------------------------------------------------- findings

const panels = (
  rows: Raw[],
  spec: [string, string, number][],
  axes: { tab: string; x: Scale; xLabel: string }[],
  base: Omit<Figure, 'key' | 'tab' | 'x' | 'xLabel' | 'series'>,
): Figure[] =>
  axes.map((a, i) => ({ ...base, key: a.tab, tab: a.tab, x: a.x, xLabel: a.xLabel, series: pick(rows[i], spec) }))

const tokensAxis = (max: number) => ({
  tab: 'Output tokens',
  x: linear(0, max, Array.from({ length: Math.floor(max) + 1 }, (_, i) => i), (v) => kilo(v * 1e6)),
  xLabel: 'Output tokens spent',
})
const costAxis = (max: number, every: number) => ({
  tab: 'Cost',
  x: linear(0, max, Array.from({ length: Math.floor(max / every) + 1 }, (_, i) => i * every), (v) => `$${Math.round(v)}`),
  xLabel: 'Cost (USD)',
})
const timeAxis = (max: number) => ({
  tab: 'Time',
  x: linear(0, max, [0, 5, 10, 15, 20, 25, 30].filter((v) => v <= max), hours),
  xLabel: 'Time elapsed',
})

export const DIVERSITY = panels(
  R.diversity as Raw[],
  [
    ['flame-chase', 'Flame Chase · Fable 5 ↔ GPT-5.6 Sol', 0],
    ['ralph-fable', 'Ralph loop · Claude Fable 5', 5],
    ['ralph-gpt', 'Ralph loop · GPT-5.6 Sol', 1],
  ],
  [tokensAxis(4.2), costAxis(520, 100), timeAxis(30)],
  {
    y: linear(950, 1500, [1000, 1100, 1200, 1300, 1400, 1500], (v) => `${v}`),
    yLabel: 'Best clock cycles (lower is better)',
    lowerBetter: true,
    readout: (v) => `${Math.round(v)} cycles`,
    summary:
      'Take-home, two models alternating against each model alone: the Flame Chase of Claude Fable 5 and GPT-5.6 Sol ends near 1,000 cycles; each model in a Ralph loop on its own stops around 1,035 to 1,065, on any of tokens, cost or time.',
    note: 'Seed mean; the source shades the seed range, which is not redrawn. Same task as the take-home ablation.',
  },
)

export const COLLABORATION = panels(
  R.collab as Raw[],
  [
    ['pfc-lite', 'Parallel Flame Chase · Git/PR Lite', 0],
    ['pfc', 'Parallel Flame Chase', 3],
    ['fc', 'Flame Chase', 1],
  ],
  [
    { tab: 'Active time', x: linear(0, 12.5, [0, 2, 4, 6, 8, 10, 12], hours), xLabel: 'Active elapsed time' },
    { tab: 'Total tokens', x: linear(0, 5, [0, 1, 2, 3, 4, 5], (v) => kilo(v * 1e6)), xLabel: 'Cumulative output tokens, all model calls' },
    {
      tab: 'Critical-path tokens',
      x: linear(0, 1.8, [0, 0.4, 0.8, 1.2, 1.6], (v) => kilo(v * 1e6)),
      xLabel: 'Coordinator + the busiest lane’s tokens',
    },
  ],
  {
    y: linear(950, 1200, [950, 1000, 1050, 1100, 1150, 1200], (v) => `${v}`),
    yLabel: 'Mean best valid cycles (lower is better)',
    lowerBetter: true,
    readout: (v) => `${Math.round(v)} cycles`,
    summary:
      'Take-home over 12 hours, three ways of collaborating: Flame Chase ends near 1,013 cycles, Parallel Flame Chase near 1,004, and Parallel Flame Chase coordinated through Git pull requests near 986 — the best, on time and on critical-path tokens alike.',
    note: 'Three-seed mean. Tokens count from the first valid evaluation. Critical-path tokens are the coordinator’s plus the busiest of the three lanes; for plain Flame Chase it equals the total.',
  },
)

export const PROGRESSIVE = panels(
  R.progressive as Raw[],
  [
    ['ralph-progressive', 'Ralph loop · progressive goal', 0],
    ['ralph', 'Ralph loop · one fixed goal', 1],
  ],
  [tokensAxis(3.5), costAxis(410, 100), timeAxis(30)],
  {
    y: linear(950, 1500, [1000, 1100, 1200, 1300, 1400, 1500], (v) => `${v}`),
    yLabel: 'Best clock cycles (lower is better)',
    lowerBetter: true,
    readout: (v) => `${Math.round(v)} cycles`,
    summary:
      'Take-home, GPT-5.6 Sol in a Ralph loop: given a progressive goal it gets below 1,000 cycles; given the one fixed goal it levels off near 1,060, on any axis.',
    note: 'Seed mean; the source shades the seed range, which is not redrawn.',
  },
)

// ----------------------------------------------------------------------------- degradation

const FLOWS6: [string, string, number][] = [
  ['flame-chase', 'Flame Chase', 0],
  ['ralph-loop', 'Ralph loop', 1],
  ['goal', 'Goal', 3],
  ['always-continue', 'Always continue', 4],
  ['always-prompt', 'Always prompt', 2],
  ['arar', 'ARAR', 5],
]
const tokensY = log(10, 100000, [10, 100, 1000, 10000, 100000], kilo)
const degrade = (key: string, tab: string, summary: string): Figure => ({
  key,
  tab,
  series: pick(R[key] as Raw, FLOWS6),
  x: linear(0, 24, [0, 4, 8, 12, 16, 20, 24], hours),
  y: tokensY,
  xLabel: 'Active elapsed time in a single run',
  yLabel: 'Output tokens per response (log scale)',
  step: false,
  readout: (v) => kilo(v),
  summary,
  note: 'Smoothed per-flow trend lines, max effort; the source’s per-response scatter is not redrawn.',
})
export const DEGRADATION = [
  degrade(
    'degrade-gpt',
    'GPT-5.6 Sol',
    'GPT-5.6 Sol: every flow holds between roughly 300 and 1,000 output tokens per response for the whole 24 hours.',
  ),
  degrade(
    'degrade-fable',
    'Claude Fable 5',
    'Claude Fable 5: responses fall from tens of thousands of tokens to under a hundred within five to ten hours in Always continue, Always prompt and ARAR; Goal and the Ralph loop level off in the hundreds; Flame Chase stays near a thousand.',
  ),
]
