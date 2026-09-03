<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

// The system map: Humanize at the centre, the flows in orbit around it, the CLIs feeding it
// from the left, the applications it is pointed at on the right, and flowbench underneath
// closing the loop back into the orbit.
//
// It is the diagram the first version of this site opened with -- spun orbits, a pulsing
// core, hard-shadowed node cards, dashed flow lines -- redrawn for what we actually ship, and
// this time it runs: the whole SVG is animated, and a sequencer walks the loop stage by stage
// so the order the pieces feed each other is something you watch rather than infer.
//
// Everything that moves is gated on `motion`, which starts false -- so the server renders a
// still diagram and the browser turns it on after mount, unless the reader has asked for
// reduced motion, in which case it stays still and the CSS keyframes are off too.

// `fit` is the home page's: there the map is given a whole screen and has to end where the
// screen does, so the drawing is sized off the window's height rather than the column's width.
defineProps<{ fit?: boolean }>()

const CX = 470
const CY = 310
const CORE_R = 60
const RING_R = 175

/** The five stages the sequencer walks, in the order the work actually flows. */
const STAGES = 5
const stage = ref(-1)
const motion = ref(false)
const held = ref<number | null>(null)

let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  motion.value = true
  stage.value = 0
  timer = setInterval(() => {
    if (held.value === null) stage.value = (stage.value + 1) % STAGES
  }, 2200)
})

onBeforeUnmount(() => clearInterval(timer))

/** Hovering a piece holds the sequencer on it, so a reader can stop the thing and look. */
const hot = ref<string | null>(null)

const hold = (at: number, key?: string) => {
  held.value = at
  stage.value = at
  hot.value = key ?? null
}
const release = () => {
  held.value = null
  hot.value = null
}

const live = (at: number) => stage.value === at

/** A point on the orbit, in the SVG's coordinates. `deg` runs clockwise from east. */
const on = (deg: number, r = RING_R) => ({
  x: CX + r * Math.cos((deg * Math.PI) / 180),
  y: CY + r * Math.sin((deg * Math.PI) / 180),
})

const FLOWVERSE = 'https://github.com/humanfia/flowverse'

const flows = [
  { text: 'RLAR', w: 74, at: 202, href: FLOWVERSE },
  { text: 'Flame Chase', w: 124, at: 236, href: FLOWVERSE },
  { text: 'RLCR Loop', w: 118, at: 270, href: FLOWVERSE },
  { text: 'Ralph Loop', w: 116, at: 304, href: FLOWVERSE },
  { text: 'Goal', w: 66, at: 338, href: FLOWVERSE },
].map((flow) => ({ ...flow, ...on(flow.at) }))

const nodes = [
  {
    key: 'agents',
    stage: 0,
    x: 24,
    y: 248,
    w: 232,
    h: 128,
    kicker: 'What it drives',
    title: 'The agents',
    lines: ['claude · codex · dsh · agy', 'and every other CLI you', 'already log into'],
  },
  {
    key: 'kda',
    stage: 3,
    x: 788,
    y: 96,
    w: 232,
    h: 104,
    kicker: 'Application',
    title: 'KDA',
    lines: ['Kernel Design Agents', 'Faster, or it is not'],
    href: '/projects/kda',
  },
  {
    key: 'hoa',
    stage: 3,
    x: 788,
    y: 250,
    w: 232,
    h: 104,
    kicker: 'Application',
    title: 'HOA',
    lines: ['Humanize Olympic Agents', 'Lean accepts it, or it does not'],
    href: '/projects/hoa',
  },
  {
    key: 'agentkaggle',
    stage: 3,
    x: 788,
    y: 404,
    w: 232,
    h: 104,
    kicker: 'Application',
    title: 'AgentKaggle',
    lines: ['Real Kaggle competitions', 'Kaggle says so, or it does not'],
    href: '/projects/agentkaggle',
  },
  {
    key: 'flowbench',
    stage: 4,
    x: 336,
    y: 588,
    w: 268,
    h: 104,
    kicker: 'The referee',
    title: 'FlowBench',
    lines: ['Scores the flows against', 'each other. Ours included.'],
    href: '/projects/flowbench',
  },
]

// Every edge carries the verb, because a line between two boxes is not a relationship until
// somebody says which way round it reads.
const links = [
  // Out of the runtime, into the agents it drives. This is the one solid line: turns go out,
  // and no credential of yours comes back this way.
  {
    key: 'drives',
    stage: 0,
    solid: true,
    d: `M ${CX - CORE_R - 14} 310 L 262 310`,
    dur: '2.4s',
    label: 'drives',
    lx: 330,
    ly: 298,
  },
  // A flow, running on the runtime, pointed at something that can tell it it is wrong.
  { key: 'kda', stage: 2, d: 'M 641 252 C 704 208, 726 158, 782 148', dur: '3.1s' },
  {
    key: 'hoa',
    stage: 2,
    d: 'M 641 302 C 700 302, 730 302, 782 302',
    dur: '3.1s',
    label: 'is pointed at',
    lx: 711,
    ly: 290,
  },
  { key: 'agentkaggle', stage: 2, d: 'M 641 370 C 704 414, 726 448, 782 456', dur: '3.1s' },
  // What the work was worth, going to the referee.
  { key: 'kda-bench', stage: 3, d: 'M 902 206 C 948 420, 800 622, 612 618', dur: '3.6s' },
  {
    key: 'hoa-bench',
    stage: 3,
    d: 'M 902 360 C 934 506, 800 642, 612 634',
    dur: '3.6s',
    label: 'is scored by',
    lx: 856,
    ly: 552,
  },
  { key: 'kaggle-bench', stage: 3, d: 'M 902 514 C 912 584, 780 658, 612 650', dur: '3.6s' },
  // And the arrow the whole diagram is drawn for: the score, going back into the flows.
  {
    key: 'back',
    stage: 4,
    accent: true,
    d: 'M 330 634 C 200 616, 168 470, 292 348',
    dur: '3.2s',
  },
]

/** Prefix for the gradient and marker ids, so they cannot collide with another diagram's. */
const uid = 'system-map'

const VW = 1040
const VH = 720

// The links are HTML anchors laid over the drawing rather than SVG `<a>` elements: the SVG
// kind has no `pathname`, and the router's prefetcher reads one off every anchor on the page.
// Percentages of a box with the viewBox's aspect ratio land exactly on the shapes underneath.
const box = (x: number, y: number, w: number, h: number) => ({
  left: `${(x / VW) * 100}%`,
  top: `${(y / VH) * 100}%`,
  width: `${(w / VW) * 100}%`,
  height: `${(h / VH) * 100}%`,
})

const hotspots = [
  ...nodes
    .filter((node) => node.href)
    .map((node) => ({
    key: node.key,
    href: node.href,
    label: `${node.title} — ${node.lines[0]}`,
    stage: node.stage,
    round: false,
    style: box(node.x, node.y, node.w, node.h),
  })),
  ...flows.map((flow) => ({
    key: `flow-${flow.text}`,
    href: flow.href,
    label: `The ${flow.text} flow`,
    stage: 2,
    round: true,
    style: box(flow.x - flow.w / 2, flow.y - 15, flow.w, 30),
  })),
  {
    key: 'core',
    href: '/projects/humanize',
    label: 'Humanize — the runtime',
    stage: 1,
    round: true,
    style: box(CX - CORE_R, CY - CORE_R, CORE_R * 2, CORE_R * 2),
  },
]
</script>

<template>
  <figure class="map" :class="{ still: !motion, fit }">
    <div class="map-scroll">
     <div class="map-stage">
      <svg
        viewBox="0 0 1040 720"
        role="img"
        aria-label="How the projects relate: Humanize runs the flows and drives the coding agents, a flow is pointed at KDA, HOA or AgentKaggle, each is scored by FlowBench, and FlowBench selects the flow that goes back into the orbit"
      >
        <defs>
          <radialGradient :id="`${uid}-core`" cx="35%" cy="30%">
            <stop offset="0%" class="core-stop-1" />
            <stop offset="100%" class="core-stop-2" />
          </radialGradient>
          <radialGradient :id="`${uid}-halo`">
            <stop offset="0%" class="halo-stop-1" />
            <stop offset="100%" class="halo-stop-2" />
          </radialGradient>
          <linearGradient :id="`${uid}-sweep`" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" class="sweep-stop-1" />
            <stop offset="100%" class="sweep-stop-2" />
          </linearGradient>
          <marker
            :id="`${uid}-arrow`"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L8 4 L0 8 Z" class="arrowhead" />
          </marker>
          <marker
            :id="`${uid}-arrow-accent`"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L8 4 L0 8 Z" class="arrowhead accent" />
          </marker>
        </defs>

        <!-- The glow the whole thing sits in. -->
        <circle :cx="CX" :cy="CY" r="300" :fill="`url(#${uid}-halo)`" class="halo" />

        <!-- Connections, under everything, so a card always wins. -->
        <g class="links">
          <g
            v-for="link in links"
            :key="link.key"
            :class="['link', { accent: link.accent, solid: link.solid, live: live(link.stage) }]"
          >
            <path
              :d="link.d"
              :marker-end="`url(#${uid}-${link.accent ? 'arrow-accent' : 'arrow'})`"
            />
            <circle v-if="motion" :r="link.accent ? 5.5 : 4.5" class="packet">
              <animateMotion :path="link.d" :dur="link.dur" repeatCount="indefinite" />
            </circle>
            <text v-if="link.label" :x="link.lx" :y="link.ly" class="link-label">
              {{ link.label }}
            </text>
          </g>
        </g>

        <!-- The orbit the flows sit on, and the sweep going round it. -->
        <g :class="['orbit', { live: live(2) }]" @mouseenter="hold(2)" @mouseleave="release">
          <circle :cx="CX" :cy="CY" :r="RING_R" class="ring" />
          <g v-if="motion">
            <path
              :d="`M ${CX} ${CY} L ${CX + RING_R} ${CY} A ${RING_R} ${RING_R} 0 0 0 ${
                CX + RING_R * Math.cos((-46 * Math.PI) / 180)
              } ${CY + RING_R * Math.sin((-46 * Math.PI) / 180)} Z`"
              :fill="`url(#${uid}-sweep)`"
              class="sweep"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                :from="`0 ${CX} ${CY}`"
                :to="`360 ${CX} ${CY}`"
                dur="11s"
                repeatCount="indefinite"
              />
            </path>
          </g>
          <circle :cx="CX" :cy="CY" :r="RING_R + 26" class="ring dashed">
            <animateTransform
              v-if="motion"
              attributeName="transform"
              type="rotate"
              :from="`360 ${CX} ${CY}`"
              :to="`0 ${CX} ${CY}`"
              dur="42s"
              repeatCount="indefinite"
            />
          </circle>
          <text :x="CX" :y="CY - RING_R - 44" class="orbit-label">
            THE FLOWS WE WRITE · WHAT IT RUNS
          </text>
        </g>

        <!-- The flows themselves, sitting on the orbit. -->
        <g
          v-for="flow in flows"
          :key="flow.text"
          :class="['chip', { live: live(2), hot: hot === `flow-${flow.text}` }]"
        >
          <rect :x="flow.x - flow.w / 2" :y="flow.y - 15" :width="flow.w" height="30" rx="15" />
          <text :x="flow.x" :y="flow.y + 4">{{ flow.text }}</text>
        </g>

        <!-- The core: the runtime everything else is arranged around. -->
        <g :class="['core', { live: live(1), hot: hot === 'core' }]">
          <g v-if="motion">
            <circle
              v-for="delay in ['0s', '1.3s', '2.6s']"
              :key="delay"
              :cx="CX"
              :cy="CY"
              :r="CORE_R"
              class="pulse"
            >
              <animate
                attributeName="r"
                :begin="delay"
                :values="`${CORE_R};${CORE_R + 62}`"
                dur="3.9s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                :begin="delay"
                values="0.5;0"
                dur="3.9s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
          <circle :cx="CX" :cy="CY" :r="CORE_R + 13" class="core-halo" />
          <circle :cx="CX" :cy="CY" :r="CORE_R" :fill="`url(#${uid}-core)`" class="core-disc" />
          <!-- The humanize mark, at the size the core is. -->
          <g :transform="`translate(${CX - 31} ${CY - 31}) scale(0.62)`" class="core-mark">
            <path d="M 30 24 L 60 50 L 30 76" />
            <path d="M 92 76 L 68 76" />
          </g>
          <text :x="CX" :y="CY + CORE_R + 30" class="core-name">Humanize</text>
          <text :x="CX" :y="CY + CORE_R + 48" class="core-role">THE RUNTIME</text>
        </g>

        <!-- The cards. -->
        <g
          v-for="node in nodes"
          :key="node.key"
          :class="['node', { live: live(node.stage), hot: hot === node.key }]"
        >
          <rect :x="node.x + 7" :y="node.y + 7" :width="node.w" :height="node.h" class="node-cast" />
          <rect :x="node.x" :y="node.y" :width="node.w" :height="node.h" class="node-box" />
          <text :x="node.x + 18" :y="node.y + 26" class="node-kicker">
            {{ node.kicker.toUpperCase() }}
          </text>
          <text :x="node.x + 18" :y="node.y + 54" class="node-title">{{ node.title }}</text>
          <text
            v-for="(line, i) in node.lines"
            :key="line"
            :x="node.x + 18"
            :y="node.y + 74 + i * 16"
            class="node-line"
          >
            {{ line }}
          </text>
        </g>

        <!-- What the return arrow is. -->
        <text x="42" y="500" class="back-label">MEASURES</text>
        <text x="42" y="518" class="back-label">SELECTS</text>
        <text x="42" y="536" class="back-label accent">SHIPS IT BACK</text>
      </svg>

      <!-- The links, over the drawing: one per thing on it that has a page. -->
      <a
        v-for="spot in hotspots"
        :key="spot.key"
        class="hotspot"
        :class="{ round: spot.round, live: live(spot.stage) }"
        :href="spot.href"
        :style="spot.style"
        :aria-label="spot.label"
        @mouseenter="hold(spot.stage, spot.key)"
        @mouseleave="release"
        @focus="hold(spot.stage, spot.key)"
        @blur="release"
      />
     </div>
    </div>

    <figcaption>
      <span class="scroll-hint">Scroll the diagram sideways to see all of it. </span>
      Humanize runs the flows and drives the agents you already log into; a flow is pointed at
      one of the three applications, which is where it is found out; and FlowBench scores what
      came back and sends the winner into the next flow. Hover any piece to hold it.
    </figcaption>
  </figure>
</template>

<style scoped>
.map {
  margin: 32px 0;
}

/* Sized to end where the screen does. The stage keeps the viewBox's aspect ratio, so capping
   its width by what the window has left over -- the nav floating over the top, and about 350px
   of heading above the drawing and caption below it -- is how the whole figure lands inside one
   screen. The floor stops a short window shrinking the drawing to something nobody can read;
   the ceiling is the column, as before. */
.map.fit {
  margin: 24px 0 0;
}

.map.fit .map-stage {
  min-width: 0;
  max-width: max(600px, min(100%, calc((100svh - var(--vp-nav-height) - 356px) * 1040 / 720)));
  margin: 0 auto;
}

.map-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  border-radius: 14px;
}

/* The stage carries the viewBox's aspect ratio, so a hotspot placed at a percentage of it
   lands on the shape it belongs to at every width. */
.map-stage {
  position: relative;
  width: 100%;
  min-width: 720px;
  aspect-ratio: 1040 / 720;
}

.map svg {
  display: block;
  width: 100%;
  height: 100%;
}

.hotspot {
  position: absolute;
  border-radius: 4px;
  outline-offset: 3px;
}

.hotspot.round {
  border-radius: 999px;
}

.hotspot:focus-visible {
  outline: 2px solid var(--map-accent);
}

/* Palette. Everything comes from the site's tokens in theme/style.css -- the map names shapes,
   not colours. `signal` is the amber one, and it marks the single link that runs the other way:
   the benchmark handing its score back to the runtime. */
.map {
  --map-ink: var(--vp-c-text-1);
  --map-line: var(--vp-c-divider);
  --map-accent: var(--hf-blue);
  --map-accent-soft: color-mix(in srgb, var(--hf-blue) 18%, transparent);
  --map-signal: var(--hf-amber);
  --map-card: var(--vp-c-bg);
  --map-cast: color-mix(in srgb, var(--hf-blue) 14%, transparent);
}

:global(.dark) .map {
  --map-accent: var(--hf-blue-light);
  --map-accent-soft: color-mix(in srgb, var(--hf-blue-light) 16%, transparent);
  --map-signal: var(--hf-amber-light);
  --map-card: var(--vp-c-bg-soft);
  --map-cast: color-mix(in srgb, var(--hf-blue-light) 16%, transparent);
}

/* The core disc, lit from the top left. Light to dark either way round, so the white mark on
   top of it stays legible in both themes. */
.core-stop-1 { stop-color: var(--hf-blue); }
.core-stop-2 { stop-color: var(--hf-blue-dark); }
:global(.dark) .core-stop-1 { stop-color: var(--hf-blue-mid); }
:global(.dark) .core-stop-2 { stop-color: var(--hf-blue-dark); }

.halo-stop-1 { stop-color: var(--map-accent); stop-opacity: 0.09; }
.halo-stop-2 { stop-color: var(--map-accent); stop-opacity: 0; }

.sweep-stop-1 { stop-color: var(--map-accent); stop-opacity: 0.22; }
.sweep-stop-2 { stop-color: var(--map-accent); stop-opacity: 0; }

.arrowhead {
  fill: var(--map-accent);
}

.arrowhead.accent {
  fill: var(--map-signal);
}

/* Orbit */
.ring {
  fill: none;
  stroke: var(--map-line);
  stroke-width: 1.5;
}

.ring.dashed {
  stroke-dasharray: 3 13;
  stroke-width: 1.5;
}

.orbit.live .ring {
  stroke: var(--map-accent);
  opacity: 0.75;
}

.orbit-label {
  fill: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-anchor: middle;
}

.orbit.live .orbit-label {
  fill: var(--map-accent);
}

/* Flow chips */
.chip rect {
  fill: var(--map-card);
  stroke: var(--map-line);
  stroke-width: 1.2;
  transition: stroke 0.3s, fill 0.3s;
}

.chip text {
  fill: var(--map-ink);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  text-anchor: middle;
}

.chip.live rect,
.chip.hot rect {
  stroke: var(--map-accent);
  fill: var(--map-accent-soft);
}

.chip.hot text {
  fill: var(--map-accent);
}

/* Core */
.core-halo {
  fill: var(--map-accent);
  opacity: 0.14;
  transition: opacity 0.4s;
}

.core.live .core-halo {
  opacity: 0.3;
}

.core-disc {
  stroke: var(--map-accent);
  stroke-width: 1;
}

.pulse {
  fill: none;
  stroke: var(--map-accent);
  stroke-width: 1.5;
}

.core-mark path {
  fill: none;
  stroke: #fff;
  stroke-width: 13;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.core-name {
  fill: var(--map-ink);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-anchor: middle;
}

.core-role {
  fill: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-anchor: middle;
}

.core.live .core-role {
  fill: var(--map-accent);
}

/* Cards */
.node-cast {
  fill: var(--map-cast);
}

.node-box {
  fill: var(--map-card);
  stroke: var(--map-ink);
  stroke-width: 1.4;
  transition: stroke 0.3s;
}

.node.live .node-box,
.node.hot .node-box {
  stroke: var(--map-accent);
  stroke-width: 2;
}

.node-kicker {
  fill: var(--map-accent);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  letter-spacing: 0.16em;
}

.node-title {
  fill: var(--map-ink);
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.node-line {
  fill: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
}

/* Connections */
.link path {
  fill: none;
  stroke: var(--map-accent);
  stroke-width: 1.6;
  stroke-dasharray: 5 7;
  opacity: 0.5;
  animation: map-dash 14s linear infinite;
  transition: opacity 0.35s, stroke-width 0.35s;
}

.link.solid path {
  stroke-dasharray: none;
  stroke-width: 2.4;
  animation: none;
  opacity: 0.65;
}

.link.accent path {
  stroke: var(--map-signal);
  stroke-width: 2.2;
  stroke-dasharray: 7 7;
  opacity: 0.75;
}

.link.live path {
  opacity: 1;
  stroke-width: 2.6;
}

.packet {
  fill: var(--map-accent);
}

.link.accent .packet {
  fill: var(--map-signal);
}

/* The verb on an edge. Same weight as the rest of the small print until its stage comes up,
   so the diagram reads as a whole and then one relationship at a time. */
.link-label {
  fill: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  text-anchor: middle;
  transition: fill 0.3s;
}

.link.live .link-label,
.link:hover .link-label {
  fill: var(--map-accent);
}

.back-label {
  fill: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  letter-spacing: 0.16em;
}

.back-label.accent {
  fill: var(--map-signal);
  font-weight: 700;
}

.map a.hotspot {
  cursor: pointer;
  text-decoration: none;
}

@keyframes map-dash {
  to {
    stroke-dashoffset: -240;
  }
}

figcaption {
  margin-top: 14px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-3);
}

.scroll-hint {
  display: none;
}

/* Narrower than this the drawing cannot be read at all, and <ArchStack> stands in for it. */
@media (max-width: 899px) {
  .map {
    display: none;
  }
}

@media (max-width: 1180px) {
  .scroll-hint {
    display: inline;
  }
}

/* A reader who has asked for less motion gets the diagram, standing still. */
.map.still .link path {
  animation: none;
}

@media (prefers-reduced-motion: reduce) {
  .link path {
    animation: none;
  }
}
</style>
