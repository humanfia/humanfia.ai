<script setup lang="ts">
// The hero's picture: one MLE-bench task, six hours, two agents taking turns over one workspace.
//
// It is drawn in the flow grammar (components/flow/grammar.ts) rather than a grammar of its own:
// each agent a lane with a disc, coloured by what the role is -- the one that does the work in
// blue, the one taking turns with it in teal -- each turn a bar with a spark on its left edge,
// because every turn is a fresh session; files handed on as square comets; the workspace a plate
// under the lanes; the budget a bar along the bottom; the review in the reviewer's red.
//
// Everything on screen is a function of one number, the minute of the six hours the playhead is
// at, so playing, dragging the budget bar and the arrow keys are all that number moving. It plays
// only while on screen, loops with a held beat at the end, and under reduced motion it does not
// move at all: the whole run is drawn at rest, and the scrubber still walks through it.
//
// The rules are the paper's (five accepted submissions a turn, six hours, a fifteen-minute
// review); the lengths of the turns are a schematic, and the caption says so.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Clock, prefersReducedMotion } from '../../../home/motion'

const TOTAL = 360
const REVIEW = 345
/** Seconds the six hours take to play, and the beat held on the finished run. */
const PLAY = 15
const HOLD = 3.2

interface Turn {
  agent: 0 | 1
  start: number
  end: number
  /** Minutes at which a submission was accepted: never more than five a turn. */
  subs: number[]
  /** Why the turn ended. */
  why: 'cap' | 'self' | 'budget'
}

const TURNS: Turn[] = [
  { agent: 0, start: 0, end: 74, subs: [16, 31, 45, 60, 73], why: 'cap' },
  { agent: 1, start: 74, end: 152, subs: [92, 106, 121, 137, 151], why: 'cap' },
  { agent: 0, start: 152, end: 206, subs: [171, 188, 203], why: 'self' },
  { agent: 1, start: 206, end: 284, subs: [222, 238, 250, 266, 283], why: 'cap' },
  { agent: 0, start: 284, end: REVIEW, subs: [301, 318, 336], why: 'budget' },
]
/** The candidate the review settles on; any accepted one may win, not only the last. */
const PICKED = { turn: 3, sub: 2 }

const AGENTS = [
  { name: 'Opus 5', harness: 'Claude Code', role: 'maker' },
  { name: 'GPT-5.6-sol', harness: 'Codex', role: 'partner' },
]

const root = ref<HTMLElement | null>(null)
const minute = ref(TOTAL)
const motion = ref(false)
const playing = ref(true)
let clock: Clock | null = null
/** Seconds of playing so far, advanced only by frames that were drawn while playing, so leaving
 *  the screen or pausing holds the run where it was. */
let played = 0
let last: number | null = null

onMounted(() => {
  if (prefersReducedMotion() || !root.value) return
  motion.value = true
  minute.value = 0
  clock = new Clock(root.value, (t) => {
    const dt = last === null ? 0 : Math.min(0.1, Math.max(0, t - last))
    last = t
    if (!playing.value) return
    played = (played + dt) % (PLAY + HOLD)
    minute.value = Math.min(TOTAL, (played / PLAY) * TOTAL)
  })
})
onBeforeUnmount(() => clock?.destroy())

function scrub(value: number) {
  playing.value = false
  minute.value = Math.max(0, Math.min(TOTAL, value))
  played = (minute.value / TOTAL) * PLAY
}
function toggle() {
  if (!playing.value && minute.value >= TOTAL) scrub(0)
  playing.value = !playing.value
}

const x = (m: number) => `${(m / TOTAL) * 100}%`
const w = (a: number, b: number) => `${(Math.max(0, b - a) / TOTAL) * 100}%`

/** The turns and their submissions, as they stand at the playhead. */
const turns = computed(() =>
  TURNS.map((turn, i) => ({
    ...turn,
    i,
    on: minute.value >= turn.start,
    live: minute.value >= turn.start && minute.value < turn.end,
    fresh: minute.value >= turn.start && minute.value < turn.start + 9,
    reach: Math.min(minute.value, turn.end),
    subs: turn.subs.map((at, k) => ({
      at,
      k,
      in: minute.value >= at,
      // The comet's way down to the plate, 0..1, over the seven minutes after it is accepted.
      fall: Math.max(0, Math.min(1, (minute.value - at) / 7)),
      picked: i === PICKED.turn && k === PICKED.sub && minute.value >= REVIEW + 9,
    })),
  })),
)

const accepted = computed(() => TURNS.reduce((n, t) => n + t.subs.filter((s) => s <= minute.value).length, 0))
const session = computed(() => TURNS.filter((t) => t.start <= minute.value).length)
const reviewing = computed(() => minute.value >= REVIEW)

const clockText = computed(() => {
  const m = Math.floor(minute.value)
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`
})

/** One line for what is happening at the playhead. */
const status = computed(() => {
  if (minute.value >= TOTAL) return 'Review picks one accepted candidate. No private score was seen.'
  if (reviewing.value) return 'Last 15 minutes: review the accepted candidates and pick one.'
  const now = TURNS.find((t) => minute.value >= t.start && minute.value < t.end)!
  const who = AGENTS[now.agent]
  if (minute.value < now.start + 9 && now.start > 0)
    return `Handoff. ${who.name} opens a fresh session: the files carry over, the context does not.`
  const done = now.subs.filter((s) => s <= minute.value).length
  return `${who.name} in ${who.harness} · ${done} of at most 5 accepted this turn`
})
</script>

<template>
  <figure
    ref="root"
    class="hma-relay flow-ui"
    :class="{ moving: motion, reviewing }"
    aria-label="One HMA task, schematic. Opus 5 in Claude Code and GPT-5.6-sol in Codex take turns over one shared workspace for six hours. Each turn is a fresh session that ends after at most five accepted submissions, or when the agent stops. The code, models, results and candidates stay in the workspace; the context does not. The last fifteen minutes review the accepted candidates and pick one."
  >
    <div class="relay-top">
      <span class="relay-kicker">One task · 6 h · schematic</span>
      <span class="relay-status" aria-hidden="true">{{ status }}</span>
    </div>

    <div class="relay-grid" aria-hidden="true">
      <!-- Lane heads. -->
      <div v-for="(agent, a) in AGENTS" :key="agent.name" class="relay-head" :class="[agent.role, `lane-${a}`]">
        <i class="relay-disc" />
        <span><b>{{ agent.name }}</b><em>{{ agent.harness }}</em></span>
      </div>
      <div class="relay-head ws">
        <i class="relay-plate-mark" />
        <span><b>Workspace</b><em>shared</em></span>
      </div>

      <!-- The track: two lanes and the plate between them. -->
      <div class="relay-track">
        <div class="relay-lane lane-0" />
        <div class="relay-plate">
          <span class="relay-plate-label">code · models · results · candidates</span>
        </div>
        <div class="relay-lane lane-1" />

        <div class="relay-review" :style="{ left: x(REVIEW), width: w(REVIEW, TOTAL) }">
          <span>review</span>
        </div>

        <template v-for="turn in turns" :key="turn.i">
          <!-- The handoff: files, not words, so dotted. -->
          <i
            v-if="turn.i > 0"
            class="relay-pass"
            :class="{ on: turn.on }"
            :style="{ left: x(turn.start) }"
          />
          <div
            class="relay-bar"
            :class="[AGENTS[turn.agent].role, `lane-${turn.agent}`, { live: turn.live, on: turn.on }]"
            :style="{ left: x(turn.start), width: w(turn.start, turn.reach) }"
          >
            <i v-if="turn.on" class="relay-spark" :class="{ ring: turn.fresh && motion }" />
          </div>
          <template v-for="sub in turn.subs" :key="sub.k">
            <i
              v-if="sub.in"
              class="relay-sub"
              :class="`lane-${turn.agent}`"
              :style="{ left: x(sub.at) }"
            />
            <i
              v-if="sub.in"
              class="relay-cand"
              :class="{ landed: sub.fall >= 1, picked: sub.picked }"
              :style="{
                left: x(sub.at),
                '--fall': sub.fall,
                '--from': turn.agent === 0 ? '-1' : '1',
              }"
            />
          </template>
        </template>

        <i class="relay-head-line" :style="{ left: x(minute) }" />
      </div>

      <!-- The budget. -->
      <div class="relay-head budget"><span><b>Budget</b><em>6 hours</em></span></div>
      <div class="relay-budget">
        <i class="relay-budget-fill" :style="{ width: x(minute) }" />
        <i class="relay-budget-review" :style="{ left: x(REVIEW) }" />
        <span v-for="h in 7" :key="h" class="relay-tick" :style="{ left: x((h - 1) * 60) }">{{ h - 1 }}h</span>
      </div>
    </div>

    <div class="relay-controls">
      <button
        v-if="motion"
        type="button"
        class="relay-play"
        :aria-label="playing ? 'Pause' : 'Play'"
        @click="toggle"
      >
        <svg v-if="playing" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" /><rect x="7" y="1.5" width="3" height="9" /></svg>
        <svg v-else viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5 L10.5 6 L3 10.5 Z" /></svg>
      </button>
      <input
        class="relay-scrub"
        type="range"
        min="0"
        :max="TOTAL"
        step="1"
        :value="Math.round(minute)"
        :aria-valuetext="`${clockText}: ${status}`"
        aria-label="Time into the six-hour task"
        @input="scrub(+($event.target as HTMLInputElement).value)"
      />
      <span class="relay-clock">{{ clockText }}</span>
      <span class="relay-count"><b>{{ accepted }}</b> accepted · session <b>{{ session }}</b></span>
    </div>
    <figcaption class="relay-caption">
      Turn lengths are illustrative. The rules are not: a turn ends after at most five accepted
      submissions, or when the agent stops; the next one starts fresh in the same workspace.
    </figcaption>
  </figure>
</template>
