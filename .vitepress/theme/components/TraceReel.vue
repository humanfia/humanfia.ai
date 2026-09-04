<script setup lang="ts">
// One flow, several agents, one trace.
//
// This is the picture Humanize 2's own front page opens with, redrawn in this site's palette:
// a lane per agent, the tool calls of each turn landing on it as they are made, and one clock
// under all of them. Nothing here is a recording -- the slices are generated from a seeded
// sequence, so the server and the browser draw the same thing and there is no live run behind
// a marketing page pretending there is.
//
// Everything that moves is gated on `motion`, which the browser turns on after mount unless
// the reader has asked for reduced motion. Standing still it is the same diagram, finished.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const DOCS = 'https://docs.humanfia.ai/humanize2'

/** The four backends the documentation shows, with the model each is asked as. */
const AGENTS = [
  { who: 'claude/claude-opus-5:high', role: 'writes the kernel' },
  { who: 'codex/gpt-5.6-sol:high', role: 'reads what landed' },
  { who: 'dsh/deepseek-v4-pro:high', role: 'runs the benchmark' },
  { who: 'kimi/kimi-code/k3:high', role: 'ports the module' },
]

const COUNTS = [2, 3, 4]

/** What a slice is. `kind` is only a colour: read, write, run, and the model thinking. */
const KINDS = [
  { kind: 'think', label: 'turn', min: 9, max: 17 },
  { kind: 'read', label: 'Read', min: 5, max: 9 },
  { kind: 'write', label: 'Edit', min: 6, max: 11 },
  { kind: 'run', label: 'Bash', min: 8, max: 15 },
  { kind: 'read', label: 'Grep', min: 4, max: 7 },
  { kind: 'write', label: 'Write', min: 5, max: 9 },
]

/** Narrower than this and the label is two clipped letters, which is worse than no label. */
const LABEL_AT = 9

/** The span of the drawing, in arbitrary ticks. */
const SPAN = 100

/** A tiny LCG. Seeded per lane, so the same lane is the same every time anybody loads this. */
function rng(seed: number) {
  let state = seed * 1103515245 + 12345
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

interface Slice {
  at: number
  len: number
  kind: string
  label: string
  tok: number
}

/** One lane's slices, laid end to end with small gaps, out to the end of the span. */
function laneSlices(seed: number): Slice[] {
  const next = rng(seed + 7)
  const out: Slice[] = []
  let at = next() * 4
  while (at < SPAN) {
    const pick = KINDS[Math.floor(next() * KINDS.length)]
    const len = pick.min + next() * (pick.max - pick.min)
    if (at + len > SPAN) break
    out.push({
      at,
      len,
      kind: pick.kind,
      label: pick.label,
      tok: Math.round(140 + next() * 2600),
    })
    at += len + 1 + next() * 3.4
  }
  return out
}

const LANES = AGENTS.map((agent, i) => ({ ...agent, slices: laneSlices(i + 1) }))

const shown = ref(4)
const lanes = computed(() => LANES.slice(0, shown.value))

const motion = ref(false)
const playing = ref(true)
/** How far the clock has run, 0 to SPAN. Starts finished, so the still frame is the whole run. */
const now = ref(SPAN)
const root = ref<HTMLElement | null>(null)
const onScreen = ref(true)

let timer: ReturnType<typeof setInterval> | undefined
let watcher: IntersectionObserver | undefined

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  motion.value = true
  now.value = 0

  if (root.value && 'IntersectionObserver' in window) {
    watcher = new IntersectionObserver(
      (entries) => (onScreen.value = entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.2 },
    )
    watcher.observe(root.value)
  }

  timer = setInterval(() => {
    if (!playing.value || !onScreen.value) return
    now.value = now.value >= SPAN ? 0 : Math.min(SPAN, now.value + 0.55)
  }, 40)
})

onBeforeUnmount(() => {
  clearInterval(timer)
  watcher?.disconnect()
})

/** A slice, clipped to the clock: it grows as the playhead crosses it. */
const drawn = (slices: Slice[]) =>
  slices
    .filter((slice) => slice.at < now.value)
    .map((slice) => ({
      ...slice,
      width: Math.min(slice.len, now.value - slice.at),
      done: slice.at + slice.len <= now.value,
    }))

const pct = (value: number) => `${(value / SPAN) * 100}%`

/* The lane is a grid -- 190px of label, a gap, the track, a gap, 64px of count -- so the
   playhead has to be placed against the track's box rather than the figure's. */
const TRACK_LEFT = 204
const TRACK_INSET = 282
const headAt = computed(
  () => `calc(${TRACK_LEFT}px + (100% - ${TRACK_INSET}px) * ${now.value / SPAN})`,
)

const onScreenCount = computed(() =>
  lanes.value.reduce((sum, lane) => sum + lane.slices.filter((s) => s.at < now.value).length, 0),
)

/** Tokens, counted off the slices that have finished. */
const tokensOf = (slices: Slice[]) =>
  slices.filter((s) => s.at + s.len <= now.value).reduce((sum, s) => sum + s.tok, 0)

const tokens = (slices: Slice[]) => {
  const total = tokensOf(slices)
  return total >= 1000 ? `${(total / 1000).toFixed(1)}k tok` : `${total} tok`
}
</script>

<template>
  <figure ref="root" class="trace" :class="{ still: !motion }">
    <header>
      <span class="run">
        <i aria-hidden="true" />
        {{ motion && playing ? 'running' : 'stopped' }}
      </span>
      <code>hmz exec -f official/flame_chase</code>

      <div class="controls">
        <div class="counts" role="group" aria-label="How many agents are on the flow">
          <button
            v-for="n in COUNTS"
            :key="n"
            type="button"
            :class="{ on: shown === n }"
            :aria-pressed="shown === n"
            @click="shown = n"
          >
            {{ n }}
          </button>
        </div>
        <button
          v-if="motion"
          type="button"
          class="play"
          :aria-label="playing ? 'Pause the run' : 'Play the run'"
          @click="playing = !playing"
        >
          {{ playing ? '❙❙' : '▶' }}
        </button>
      </div>
    </header>

    <div class="lanes">
      <div v-for="lane in lanes" :key="lane.who" class="lane">
        <div class="who">
          <b>{{ lane.who }}</b>
          <span>{{ lane.role }}</span>
        </div>
        <div class="track">
          <span
            v-for="slice in drawn(lane.slices)"
            :key="slice.at"
            class="slice"
            :class="[slice.kind, { live: !slice.done }]"
            :style="{ left: pct(slice.at), width: pct(slice.width) }"
          >
            <em v-if="slice.width >= LABEL_AT">{{ slice.label }}</em>
          </span>
        </div>
        <div class="tok">{{ tokens(lane.slices) }}</div>
      </div>

      <div v-if="motion" class="head" :style="{ left: headAt }" aria-hidden="true" />
    </div>

    <figcaption>
      {{ shown }} agents · {{ onScreenCount }} slices on screen · one track per row of an
      agent's sessions. Every turn's tool calls land on the timeline as they are made;
      <a :href="`${DOCS}/features/tracing`">the real one</a> opens in Perfetto.
    </figcaption>
  </figure>
</template>

<style scoped>
.trace {
  margin: 28px 0;
  padding: 16px 18px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
}

/* ---- The header ------------------------------------------------------------------------- */

header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.run {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
}

.run i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  animation: trace-pulse 1.8s ease-in-out infinite;
}

@keyframes trace-pulse {
  50% {
    opacity: 0.25;
  }
}

header code {
  flex: 1;
  min-width: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  color: var(--vp-c-text-2);
  background: none;
  padding: 0;
  overflow-x: auto;
  white-space: nowrap;
}

.controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.counts {
  display: flex;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
}

.counts button,
.play {
  border: 0;
  background: none;
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  color: var(--vp-c-text-3);
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
}

.counts button {
  width: 26px;
  height: 22px;
  border-radius: 999px;
}

.counts button:hover {
  color: var(--vp-c-text-1);
}

.counts button.on {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.play {
  width: 28px;
  height: 26px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.play:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

/* ---- The lanes -------------------------------------------------------------------------- */

.lanes {
  position: relative;
  padding: 12px 0 6px;
}

.lane {
  display: grid;
  grid-template-columns: minmax(0, 190px) 1fr 64px;
  align-items: center;
  gap: 14px;
  padding: 5px 0;
}

.who b {
  display: block;
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.who span {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.track {
  position: relative;
  height: 26px;
  border-radius: 6px;
  background: var(--vp-c-bg);
  box-shadow: inset 0 0 0 1px var(--vp-c-divider);
  overflow: hidden;
}

.slice {
  position: absolute;
  top: 4px;
  bottom: 4px;
  border-radius: 3px;
  overflow: hidden;
}

.slice em {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding-left: 5px;
  font-family: var(--vp-font-family-mono);
  font-size: 9.5px;
  font-style: normal;
  letter-spacing: 0.02em;
  white-space: nowrap;
  color: var(--vp-c-bg);
  opacity: 0.92;
}

/* The four colours are one hue apart from the amber, which is what a subprocess gets --
   the same rule the system map follows: warm is spent on exactly one thing. */
.slice.think {
  background: var(--hf-blue-dark);
}

.slice.read {
  background: var(--hf-blue-mid);
}

.slice.write {
  background: var(--hf-blue);
}

.slice.run {
  background: var(--hf-amber);
}

/* `.dark .x`, not `.dark .x`. Vue's scoped-style compiler adds the scope attribute to
   the last selector in a chain and leaves an ancestor selector alone, which is exactly what is
   wanted here -- `.dark` is on <html> and has no scope id. Written with `:global()` the compiler
   drops everything after it and emits a bare `.dark { ... }`: the rule stops reaching the thing
   it was written for, and instead paints every element on the page that happens to carry the
   class `dark` -- which on this site is the nav's dark logo, an <img class="VPImage dark logo">
   that turned up with an amber square behind a mark drawn to be transparent. */
.dark .slice.think {
  background: var(--hf-blue-mid);
}

.dark .slice.read {
  background: var(--hf-blue-light);
}

.dark .slice.write {
  background: var(--hf-blue);
}

.dark .slice.run {
  background: var(--hf-amber-light);
}

.dark .slice em {
  color: var(--hf-ink);
}

/* The one being made right now, rather than one already written down. */
.slice.live {
  box-shadow: 0 0 0 1px var(--vp-c-brand-1);
}

.tok {
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
  text-align: right;
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
}

.head {
  position: absolute;
  top: 12px;
  bottom: 6px;
  width: 1px;
  background: var(--vp-c-brand-1);
  opacity: 0.55;
  pointer-events: none;
}

figcaption {
  padding-top: 10px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--vp-c-text-3);
}

figcaption a {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.trace.still .run i {
  animation: none;
}

/* ---- Narrow ------------------------------------------------------------------------------ */

@media (max-width: 720px) {
  .lane {
    grid-template-columns: 1fr;
    gap: 5px;
    padding: 7px 0;
  }

  .tok {
    text-align: left;
  }

  .head {
    display: none;
  }
}
</style>
