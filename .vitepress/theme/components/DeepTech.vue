<script setup lang="ts">
// The five things that are actually hard, each drawn rather than described. A rail of titles on
// the left, one bespoke diagram on the right; the rail advances on its own until a reader takes
// it over by hovering or clicking, and everything that moves is gated on `motion`, which the
// browser turns on after mount unless the reader has asked for reduced motion.
//
// The diagrams are data-driven wherever they repeat -- ten CLIs, six trace lanes, 672 proof
// statements -- so the template stays readable instead of being a thousand rectangles. Motion
// is CSS keyframes throughout: no SMIL, no requestAnimationFrame, nothing to leak on unmount.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface Panel {
  key: string
  kicker: string
  title: string
  blurb: string
  label: string
  note: { text: string; href: string }
}

const PANELS: Panel[] = [
  {
    key: 'syscalls',
    kicker: 'Remote execution',
    title: 'The agent runs here. Its syscalls land there.',
    blurb:
      'A seccomp-filtered ptrace supervisor takes every call one at a time and decides where it happens. The CLI is unmodified, and is told none of it.',
    label:
      'An agent on this machine, its file and process calls replayed on a target, its credentials answered locally',
    note: { text: 'Remote execution', href: 'https://hmz.humanfia.ai/guide/remote-execution' },
  },
  {
    key: 'fanout',
    kicker: 'Orchestration',
    title: 'One flow. Ten CLIs. One transcript.',
    blurb:
      'A flow is a directory of Python, not a YAML file. It opens sessions against whichever coding agents you already log into, in the order it asks for, and everything they do lands on one timeline.',
    label: 'One flow driving ten coding-agent CLIs into a single transcript',
    note: { text: 'The runtime', href: '/projects/humanize' },
  },
  {
    key: 'trace',
    kicker: 'Observability',
    title: 'Eleven hours, readable end to end.',
    blurb:
      'One process per agent, one track per session, one slice per thing it did — written as it happens, and opened afterwards in Perfetto like any other trace.',
    label: 'A trace of a long run: one lane per agent, slices for each turn, a playhead sweeping',
    note: { text: 'Tracing', href: 'https://hmz.humanfia.ai/guide/tracing' },
  },
  {
    key: 'proof',
    kicker: 'HOA',
    title: 'The kernel accepts it, or it does not.',
    blurb:
      'Olympiad mathematics, written as Lean 4 and checked by the Lean kernel. There is no grader to talk round, and no partial credit to argue for.',
    label: 'PutnamBench: 670 of 672 formal statements accepted by the Lean kernel',
    note: { text: 'Humanize Olympic Agents', href: '/applications/hoa' },
  },
  {
    key: 'kernel',
    kicker: 'KDA',
    title: 'Faster, or it is not.',
    blurb:
      'Agents that research, write, profile and rewrite CUDA kernels. The profiler is the referee, so a confident summary over a slower kernel gets nowhere.',
    label: 'A kernel design loop: research, implement, profile, measure — and the speedup per round',
    note: { text: 'Kernel Design Agents', href: '/applications/kda' },
  },
]

const at = ref(0)
const motion = ref(false)
const held = ref(false)
const panel = computed(() => PANELS[at.value])

let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  motion.value = true
  timer = setInterval(() => {
    if (!held.value) at.value = (at.value + 1) % PANELS.length
  }, 6000)
})

onBeforeUnmount(() => clearInterval(timer))

const pick = (i: number) => {
  at.value = i
}

/* ---- 02: the ten backends, each tapped off one bus. ---------------------------------- */

const CLIS = ['claude', 'codex', 'dsh', 'agy', 'grok', 'kimi', 'qwen', 'pi', 'opencode', 'mimo']

const chips = CLIS.map((name, i) => ({ name, y: 26 + i * 26 }))

/* ---- 03: the trace. A slice is [x, width] in user units, inside the 150..620 track. --- */

interface Lane {
  name: string
  kind?: string
  slices: [number, number][]
}

const LANES: Lane[] = [
  { name: 'the flow', kind: 'flow', slices: [[150, 470]] },
  {
    name: 'agent · claude',
    slices: [
      [154, 88],
      [258, 58],
      [334, 118],
      [468, 148],
    ],
  },
  {
    name: 'agent · codex',
    slices: [
      [168, 68],
      [252, 146],
      [416, 78],
      [510, 104],
    ],
  },
  {
    name: 'agent · dsh',
    slices: [
      [186, 116],
      [322, 42],
      [388, 186],
    ],
  },
  {
    name: 'reviewer · fresh',
    kind: 'review',
    slices: [
      [298, 58],
      [418, 68],
      [538, 76],
    ],
  },
  {
    name: 'checks',
    kind: 'check',
    slices: [
      [230, 22],
      [300, 22],
      [396, 22],
      [468, 22],
      [558, 22],
    ],
  },
]

const laneY = (i: number) => 62 + i * 33

const TICKS = [
  { x: 150, label: '0h' },
  { x: 268, label: '3h' },
  { x: 385, label: '6h' },
  { x: 503, label: '9h' },
  { x: 620, label: '11h' },
]

/* ---- 04: 672 statements, two of which nobody has closed. ------------------------------ */

const COLS = 32
const TOTAL = 672
const MISSED = new Set([311, 508])

const cells = Array.from({ length: TOTAL }, (_, i) => ({
  i,
  x: 306 + (i % COLS) * 10,
  y: 56 + Math.floor(i / COLS) * 10,
  missed: MISSED.has(i),
  delay: (i % COLS) * 0.008 + Math.floor(i / COLS) * 0.022,
}))

/* ---- 05: the loop, and what the profiler said each round. ----------------------------- */

const FLOOR = 262
const CEIL = 74
const LOW = 0.5
const HIGH = 2.9

/** Where a speedup sits on the chart's y axis. */
const yFor = (value: number) => FLOOR - ((value - LOW) / (HIGH - LOW)) * (FLOOR - CEIL)

const bars = [
  { label: 'base', value: 1 },
  { label: '1', value: 1.35 },
  { label: '2', value: 1.28 },
  { label: '3', value: 1.94 },
  { label: '4', value: 2.31 },
  { label: '5', value: 2.7 },
].map((round, i, all) => ({
  ...round,
  x: 336 + i * 48,
  y: yFor(round.value),
  height: FLOOR - yFor(round.value),
  best: i === all.length - 1,
}))

const best = bars[bars.length - 1]

// The loop, laid out on a circle: research at the top, then clockwise. Each label sits outside
// the ring on the side its node is on, so none of them lands on the text in the middle.
const CYCLE = [
  { name: 'research', deg: -90, dx: 0, dy: -15, anchor: 'middle' },
  { name: 'implement', deg: 0, dx: 16, dy: 4, anchor: 'start' },
  { name: 'profile', deg: 90, dx: 0, dy: 23, anchor: 'middle' },
  { name: 'measure', deg: 180, dx: -16, dy: 4, anchor: 'end' },
]

const cycleNodes = CYCLE.map((step, i) => {
  const angle = step.deg * (Math.PI / 180)
  const x = 160 + 84 * Math.cos(angle)
  const y = 168 + 84 * Math.sin(angle)
  return { ...step, x, y, lx: x + step.dx, ly: y + step.dy, delay: i * 0.9 }
})
</script>

<template>
  <div
    class="deep"
    :class="{ still: !motion }"
    @mouseenter="held = true"
    @mouseleave="held = false"
    @focusin="held = true"
    @focusout="held = false"
  >
    <div class="rail" role="tablist" aria-label="What is hard about this">
      <button
        v-for="(item, i) in PANELS"
        :key="item.key"
        class="pick"
        :class="{ on: at === i }"
        type="button"
        role="tab"
        :aria-selected="at === i"
        @click="pick(i)"
        @mouseenter="pick(i)"
        @focus="pick(i)"
      >
        <span class="idx">{{ String(i + 1).padStart(2, '0') }}</span>
        <span class="body">
          <span class="eyebrow">{{ item.kicker }}</span>
          <strong>{{ item.title }}</strong>
          <span class="blurb">{{ item.blurb }}</span>
        </span>
      </button>
    </div>

    <div class="stage">
      <svg viewBox="0 0 640 300" role="img" :aria-label="panel.label">
        <!-- 01 — the supervisor, drawn as the router it is. -->
        <g v-if="panel.key === 'syscalls'" key="syscalls" class="panel">
          <text x="14" y="24" class="side">this machine</text>
          <text x="626" y="24" class="side end">the target</text>
          <rect x="8" y="34" width="272" height="252" rx="14" class="zone" />
          <rect x="392" y="34" width="240" height="252" rx="14" class="zone remote" />

          <rect x="30" y="54" width="228" height="46" rx="9" class="box" />
          <text x="144" y="76" class="ttl mid">claude · codex · dsh · …</text>
          <text x="144" y="92" class="sub mid">unmodified, and told none of this</text>

          <path d="M 144 102 L 144 122" class="feed" />
          <text x="152" y="118" class="sub">syscalls</text>

          <rect x="30" y="126" width="228" height="62" rx="9" class="box strong" />
          <text x="144" y="150" class="ttl mid">supervisor</text>
          <text x="144" y="167" class="sub mid">seccomp filter · ptrace</text>
          <text x="144" y="181" class="sub mid">every call decided one at a time</text>

          <rect x="30" y="222" width="206" height="46" rx="9" class="box lit" />
          <text x="133" y="243" class="ttl mid">answered here</text>
          <text x="133" y="259" class="sub mid">credentials · state · the provider</text>

          <path d="M 258 150 C 330 150 340 112 412 112" class="wire" />
          <path d="M 258 150 C 330 150 340 112 412 112" class="wire run" />
          <path d="M 258 166 C 296 182 268 214 236 236" class="wire" />
          <path d="M 258 166 C 296 182 268 214 236 236" class="wire run back" />
          <text x="318" y="96" class="sub mid">ssh · docker · a pipe</text>

          <rect x="412" y="92" width="200" height="40" rx="9" class="box strong" />
          <text x="512" y="117" class="ttl mid">files · processes · network</text>

          <rect x="412" y="152" width="200" height="36" rx="9" class="box" />
          <text x="512" y="175" class="sub mid">the working directory, mirrored</text>

          <rect x="412" y="204" width="200" height="36" rx="9" class="box" />
          <text x="512" y="227" class="sub mid">the exit status is the target's own</text>
        </g>

        <!-- 02 — one flow, ten backends, one transcript. -->
        <g v-else-if="panel.key === 'fanout'" key="fanout" class="panel">
          <rect x="8" y="128" width="140" height="56" rx="10" class="box strong" />
          <text x="78" y="151" class="ttl mid">one flow</text>
          <text x="78" y="168" class="sub mid">a directory of Python</text>

          <path d="M 148 156 L 178 156" class="feed" />
          <path d="M 178 32 L 178 286" class="bus" />
          <path d="M 396 32 L 396 286" class="bus" />
          <path d="M 396 156 L 428 156" class="feed" />

          <g
            v-for="(chip, i) in chips"
            :key="chip.name"
            class="cli"
            :style="{ '--d': `${i * 0.13}s` }"
          >
            <path :d="`M 178 ${chip.y + 11} L 210 ${chip.y + 11}`" class="tap" />
            <rect x="210" :y="chip.y" width="150" height="22" rx="6" class="box" />
            <text x="285" :y="chip.y + 15" class="mono mid">{{ chip.name }}</text>
            <path :d="`M 360 ${chip.y + 11} L 396 ${chip.y + 11}`" class="tap" />
          </g>

          <rect x="428" y="128" width="204" height="56" rx="10" class="box strong lit" />
          <text x="530" y="151" class="ttl mid">one transcript</text>
          <text x="530" y="168" class="sub mid">every turn, in order</text>
        </g>

        <!-- 03 — the run, as a trace. -->
        <g v-else-if="panel.key === 'trace'" key="trace" class="panel">
          <g v-for="tick in TICKS" :key="tick.label">
            <path :d="`M ${tick.x} 36 L ${tick.x} 272`" class="grid" />
            <text :x="tick.x" y="26" class="mono mid tickmark">{{ tick.label }}</text>
          </g>

          <g v-for="(lane, i) in LANES" :key="lane.name">
            <text x="140" :y="laneY(i) + 15" class="sub end">{{ lane.name }}</text>
            <rect
              v-for="(slice, j) in lane.slices"
              :key="`${lane.name}-${j}`"
              :x="slice[0]"
              :y="laneY(i)"
              :width="slice[1]"
              height="21"
              rx="4"
              class="slice"
              :class="lane.kind"
              :style="{ '--d': `${i * 0.1 + j * 0.14}s` }"
            />
          </g>

          <g class="playhead"><path d="M 150 34 L 150 274" /></g>

          <text x="150" y="292" class="sub">
            one process per agent · one track per session · one slice per thing it did
          </text>
        </g>

        <!-- 04 — 672 formal statements, and the two nobody has closed. -->
        <g v-else-if="panel.key === 'proof'" key="proof" class="panel">
          <rect x="14" y="60" width="256" height="38" rx="9" class="box" />
          <text x="142" y="84" class="ttl mid">a statement, in Lean 4</text>

          <path d="M 142 98 L 142 122" class="feed" />

          <rect x="14" y="126" width="256" height="52" rx="9" class="box strong" />
          <text x="142" y="149" class="ttl mid">the flow</text>
          <text x="142" y="166" class="sub mid">search, write, retry, give up honestly</text>

          <path d="M 142 178 L 142 202" class="feed" />

          <rect x="14" y="206" width="256" height="52" rx="9" class="box lit" />
          <text x="142" y="229" class="ttl mid">the Lean kernel</text>
          <text x="142" y="246" class="sub mid">nothing here to talk round</text>

          <rect
            v-for="cell in cells"
            :key="cell.i"
            :x="cell.x"
            :y="cell.y"
            width="8"
            height="8"
            rx="1.5"
            class="cell"
            :class="{ missed: cell.missed }"
            :style="{ '--d': `${cell.delay}s` }"
          />
          <text x="306" y="288" class="count">670 / 672 accepted · first on the leaderboard</text>
        </g>

        <!-- 05 — the kernel loop, and what the profiler said each round. -->
        <g v-else key="kernel" class="panel">
          <circle cx="160" cy="168" r="84" class="orbit" />
          <path class="orbit-run" d="M 160 84 A 84 84 0 1 1 159.9 84" />

          <g
            v-for="node in cycleNodes"
            :key="node.name"
            class="stepnode"
            :style="{ '--d': `${node.delay}s` }"
          >
            <circle :cx="node.x" :cy="node.y" r="7" />
            <text :x="node.lx" :y="node.ly" :text-anchor="node.anchor" class="mono step">
              {{ node.name }}
            </text>
          </g>

          <text x="160" y="164" class="ttl mid">one kernel</text>
          <text x="160" y="182" class="sub mid">until the profiler agrees</text>

          <path :d="`M 320 ${FLOOR} L 626 ${FLOOR}`" class="grid" />
          <path :d="`M 320 ${yFor(2)} L 626 ${yFor(2)}`" class="grid soft" />
          <text x="316" :y="yFor(2) + 4" class="sub end">2×</text>
          <text x="316" :y="yFor(1) + 4" class="sub end">1×</text>
          <path :d="`M 320 ${yFor(1)} L 626 ${yFor(1)}`" class="grid soft" />

          <g v-for="(bar, i) in bars" :key="bar.label" class="bar" :style="{ '--d': `${i * 0.13}s` }">
            <rect
              :x="bar.x"
              :y="bar.y"
              width="30"
              :height="bar.height"
              rx="4"
              :class="{ best: bar.best }"
            />
            <text :x="bar.x + 15" y="278" class="mono mid tickmark">{{ bar.label }}</text>
          </g>

          <text x="336" y="52" class="sub">speedup over the reference kernel, round by round</text>
          <text :x="best.x + 15" :y="best.y - 10" class="mid best-label">2.7×</text>
        </g>
      </svg>

      <p class="note"><a :href="panel.note.href">{{ panel.note.text }}</a></p>
    </div>
  </div>
</template>

<style scoped>
.deep {
  display: grid;
  grid-template-columns: minmax(280px, 350px) 1fr;
  gap: 20px;
  align-items: stretch;
  margin: 28px 0 0;
}

/* ---- The rail ------------------------------------------------------------------------ */

.rail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pick {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: none;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.25s, border-color 0.25s;
}

.pick:hover,
.pick.on {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.idx {
  flex: none;
  padding-top: 3px;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  color: var(--vp-c-text-3);
  transition: color 0.25s;
}

.pick.on .idx {
  color: var(--vp-c-brand-1);
}

.body {
  display: block;
  min-width: 0;
}

.eyebrow {
  display: block;
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  transition: color 0.25s;
}

.pick.on .eyebrow {
  color: var(--vp-c-brand-1);
}

.pick strong {
  display: block;
  margin-top: 3px;
  font-size: 15px;
  line-height: 1.35;
  letter-spacing: -0.01em;
  font-weight: 650;
  color: var(--vp-c-text-1);
}

.blurb {
  display: none;
  margin-top: 7px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}

.pick.on .blurb {
  display: block;
}

/* ---- The stage ----------------------------------------------------------------------- */

/* The stage stretches to the rail's height and holds the diagram in the middle of it, so the
   two columns end level however many lines the open blurb runs to. */
.stage {
  display: grid;
  align-content: center;
  padding: 10px 10px 2px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
}

svg {
  display: block;
  width: 100%;
  height: auto;
}

.panel {
  animation: arrive 0.45s ease both;
}

@keyframes arrive {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

.note {
  margin: 0;
  padding: 2px 10px 10px;
  font-size: 13px;
  text-align: right;
}

.note a {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

/* ---- The shared drawing vocabulary ---------------------------------------------------- */

.zone {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-divider);
  stroke-width: 1.2;
}

.zone.remote {
  stroke-dasharray: 4 6;
}

.box {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-divider);
  stroke-width: 1.2;
}

.box.strong {
  stroke: var(--vp-c-brand-2);
}

.box.lit {
  fill: var(--vp-c-brand-soft);
  stroke: var(--vp-c-brand-2);
}

.ttl {
  fill: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 600;
}

.sub {
  fill: var(--vp-c-text-3);
  font-size: 11px;
}

.mono {
  fill: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
}

.mid {
  text-anchor: middle;
}

.end {
  text-anchor: end;
}

.side {
  fill: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.feed,
.bus,
.tap,
.wire {
  fill: none;
  stroke: var(--vp-c-divider);
  stroke-width: 1.4;
}

.feed {
  stroke: var(--vp-c-brand-2);
}

/* ---- 01: the wires, with the current shown as dashes running along them --------------- */

.wire.run {
  stroke: var(--vp-c-brand-2);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 5 11;
  animation: current 0.9s linear infinite;
}

.wire.run.back {
  stroke: var(--vp-c-brand-3);
  animation-direction: reverse;
}

@keyframes current {
  to {
    stroke-dashoffset: -16;
  }
}

/* ---- 02 ------------------------------------------------------------------------------- */

.bus {
  stroke: var(--vp-c-brand-2);
  stroke-width: 1.8;
}

.cli {
  animation: lift 3s ease-in-out var(--d, 0s) infinite;
}

.cli .tap {
  animation: tap 3s ease-in-out var(--d, 0s) infinite;
}

@keyframes lift {
  0%,
  72%,
  100% {
    opacity: 0.66;
  }
  26% {
    opacity: 1;
  }
}

@keyframes tap {
  0%,
  72%,
  100% {
    stroke: var(--vp-c-divider);
  }
  26% {
    stroke: var(--vp-c-brand-2);
  }
}

/* ---- 03 ------------------------------------------------------------------------------- */

.grid {
  fill: none;
  stroke: var(--vp-c-divider);
  stroke-width: 1;
}

.grid.soft {
  stroke-dasharray: 3 5;
}

.tickmark {
  fill: var(--vp-c-text-3);
  font-size: 10px;
}

.slice {
  fill: var(--vp-c-brand-soft);
  stroke: var(--vp-c-brand-2);
  stroke-width: 1;
  transform-box: fill-box;
  transform-origin: left center;
  animation: grow 0.55s ease-out var(--d, 0s) both;
}

.slice.flow {
  fill: none;
  stroke-dasharray: 3 4;
}

.slice.review {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-brand-1);
}

.slice.check {
  fill: var(--vp-c-brand-3);
  stroke: none;
}

@keyframes grow {
  from {
    transform: scaleX(0.02);
  }
}

.playhead path {
  fill: none;
  stroke: var(--vp-c-brand-1);
  stroke-width: 1.6;
}

.playhead {
  animation: sweep 7s linear infinite;
}

@keyframes sweep {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(470px);
  }
}

/* ---- 04 ------------------------------------------------------------------------------- */

.cell {
  fill: var(--vp-c-brand-2);
  animation: pop 0.4s ease-out var(--d, 0s) both;
}

.cell.missed {
  fill: var(--vp-c-text-3);
  opacity: 0.35;
}

@keyframes pop {
  from {
    opacity: 0;
  }
}

.count {
  fill: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 600;
}

/* ---- 05 ------------------------------------------------------------------------------- */

.orbit {
  fill: none;
  stroke: var(--vp-c-divider);
  stroke-width: 1.4;
  stroke-dasharray: 3 8;
}

.orbit-run {
  fill: none;
  stroke: var(--vp-c-brand-2);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 70 458;
  animation: orbit 3.6s linear infinite;
}

@keyframes orbit {
  to {
    stroke-dashoffset: -528;
  }
}

.stepnode circle {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-brand-2);
  stroke-width: 2;
  animation: blink 3.6s ease-in-out var(--d, 0s) infinite;
}

@keyframes blink {
  0%,
  55%,
  100% {
    fill: var(--vp-c-bg);
  }
  18% {
    fill: var(--vp-c-brand-2);
  }
}

.step {
  fill: var(--vp-c-text-2);
  font-size: 11px;
}

.bar rect {
  fill: var(--vp-c-brand-soft);
  stroke: var(--vp-c-brand-2);
  stroke-width: 1.2;
  transform-box: fill-box;
  transform-origin: center bottom;
  animation: rise 0.65s cubic-bezier(0.2, 0.8, 0.3, 1) var(--d, 0s) both;
}

.bar rect.best {
  fill: var(--vp-c-brand-3);
  stroke: var(--vp-c-brand-3);
}

.best-label {
  fill: var(--vp-c-brand-1);
  font-size: 13px;
  font-weight: 700;
}

@keyframes rise {
  from {
    transform: scaleY(0);
  }
}

/* ---- Reduced motion, and the server's first render ------------------------------------ */

.still .panel,
.still .wire.run,
.still .cli,
.still .cli .tap,
.still .slice,
.still .playhead,
.still .cell,
.still .orbit-run,
.still .stepnode circle,
.still .bar rect {
  animation: none;
}

.still .playhead {
  opacity: 0;
}

.still .cli {
  opacity: 1;
}

/* ---- Narrow --------------------------------------------------------------------------- */

@media (max-width: 899px) {
  .deep {
    grid-template-columns: 1fr;
  }

  .pick strong {
    font-size: 14px;
  }
}
</style>
