<script setup lang="ts">
// Agent, session, turn, env: the four words, as the flow that uses them and the picture of what
// each line does. Five steps; the line of code a step is about lights up beside the part of the
// picture it builds. It steps itself while it is on screen, until the reader picks a step, and
// stands still on the whole picture for a reader who asked for less motion (and on the server).
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { prefersReducedMotion } from '../../../home/motion'

const STEPS = [
  { word: 'Agent', said: 'An agent is its settings: harness, model, effort, account.' },
  { word: 'Session', said: 'spawn() opens a session. A session is history, and nothing else.' },
  { word: 'Turn', said: 'run() takes a turn. With env=None, the turn works in the workspace.' },
  { word: 'Env', said: 'The next turn names another env. The history carries over; only the place changes.' },
  { word: 'Fork', said: 'fork() branches the session: a second conversation that remembers everything so far.' },
]

/** The flow, a line at a time, each with the step it belongs to (0: none). */
const CODE: { text: string; step: number }[] = [
  { text: '@flow(agents=Agents, envs=Envs, params=FlowParams)', step: 0 },
  { text: 'async def twice(task: str, *, agents: Agents, envs: Envs,', step: 0 },
  { text: '                params: FlowParams, ctx: FlowContext) -> None:', step: 0 },
  { text: '    builder = agents["builder"]', step: 1 },
  { text: '    session = await builder.spawn()           # history, and nothing else', step: 2 },
  { text: '    await builder.run(task, session=session)  # env=None: the workspace', step: 3 },
  { text: '    await builder.run("Review it; fix what is wrong.",', step: 4 },
  { text: '                      session=session, env=envs["sandbox"])', step: 4 },
]
const EXEC = 'hmz exec -f twice -a builder=claude/claude-opus-5:high -p budget.cost=5 "add a --dry-run flag"'

const step = ref(STEPS.length)
const held = ref(false)
const root = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setInterval> | undefined
let io: IntersectionObserver | undefined
let visible = false
let started = false

onMounted(() => {
  if (prefersReducedMotion() || !root.value) return
  io = new IntersectionObserver(
    ([entry]) => {
      const was = visible
      visible = entry.isIntersecting
      if (visible && !was && !started && !held.value) {
        started = true
        step.value = 1
      }
    },
    { threshold: 0.35 },
  )
  io.observe(root.value)
  timer = setInterval(() => {
    if (!visible || held.value) return
    step.value = step.value >= STEPS.length ? 1 : step.value + 1
  }, 3400)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  io?.disconnect()
})

const pick = (n: number) => {
  held.value = true
  step.value = n
}
/** A part of the picture is drawn from its step on, and is the subject on its step. */
const st = (n: number) => ({ shown: step.value >= n, now: step.value === n })
</script>

<template>
  <div ref="root" class="md">
    <div class="md-steps" role="tablist" aria-label="The four words">
      <button
        v-for="(s, i) in STEPS"
        :key="s.word"
        type="button"
        role="tab"
        :aria-selected="step === i + 1"
        :class="{ on: step === i + 1, past: step > i + 1 }"
        @click="pick(i + 1)"
      >
        <span>0{{ i + 1 }}</span>{{ s.word }}
      </button>
    </div>

    <div class="md-body">
      <div class="md-code" aria-label="A flow that uses all four words">
        <div class="md-pre"><code><span
          v-for="(line, i) in CODE"
          :key="i"
          class="md-line"
          :class="{ hot: line.step === step, cold: line.step !== step }"
        >{{ line.text }}</span></code></div>
        <div class="md-pre md-exec"><code :class="{ hot: step === 1 }"><span aria-hidden="true">$ </span>{{ EXEC }}</code></div>
      </div>

      <div class="md-art">
        <svg viewBox="0 0 720 300" role="img" :aria-label="STEPS.map((s) => s.said).join(' ')">
          <g class="md-part" :class="st(1)">
            <rect class="ink" x="10" y="112" width="130" height="76" />
            <text class="on-ink lg" x="75" y="146" text-anchor="middle">Agent</text>
            <text class="on-ink" x="75" y="170" text-anchor="middle">claude · high</text>
          </g>
          <path class="md-line-path" :class="st(2)" d="M140 150 L 190 150" pathLength="1" />
          <g class="md-part" :class="st(2)">
            <rect class="frame" x="190" y="122" width="510" height="56" />
            <text class="ink" x="200" y="112">session · history</text>
          </g>
          <g class="md-part" :class="st(3)">
            <rect class="red" x="206" y="132" width="110" height="36" />
            <text class="on-red" x="261" y="155" text-anchor="middle">turn 1</text>
          </g>
          <path class="md-line-path dash" :class="st(3)" d="M261 168 L 261 230" pathLength="1" />
          <g class="md-part" :class="st(3)">
            <rect class="ink" x="196" y="230" width="130" height="44" />
            <text class="on-ink" x="261" y="257" text-anchor="middle">workspace</text>
          </g>
          <path class="md-line-path" :class="st(4)" d="M316 150 L 336 150" pathLength="1" />
          <g class="md-part" :class="st(4)">
            <rect class="red" x="336" y="132" width="110" height="36" />
            <text class="on-red" x="391" y="155" text-anchor="middle">turn 2</text>
          </g>
          <path class="md-line-path dash" :class="st(4)" d="M391 168 L 391 230" pathLength="1" />
          <g class="md-part" :class="st(4)">
            <rect class="grey" x="326" y="230" width="130" height="44" />
            <text class="on-ink" x="391" y="257" text-anchor="middle">env: sandbox</text>
          </g>
          <path class="md-line-path dash" :class="st(5)" d="M446 150 C 500 150, 500 60, 560 60" pathLength="1" />
          <g class="md-part" :class="st(5)">
            <rect class="frame" x="560" y="38" width="150" height="44" />
            <text class="ink" x="635" y="65" text-anchor="middle">fork · turn 3</text>
          </g>
          <rect v-if="step === 5" class="red md-packet" x="-6" y="-6" width="12" height="12" />
        </svg>
        <p class="md-said" aria-live="polite">
          <b>0{{ step }}</b>{{ STEPS[step - 1].said }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.md-steps {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  border-top: 2px solid var(--hz-ink);
  margin-bottom: 28px;
}
.md-steps button {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 16px 4px 0;
  font-size: clamp(16px, 1.7vw, 24px);
  font-weight: 800;
  letter-spacing: -0.03em;
  text-align: left;
  color: var(--hz-ink-3);
  background: none;
  cursor: pointer;
  transition: color 0.3s;
}
.md-steps button span {
  font: 700 11px/1 var(--hz-mono);
  letter-spacing: 0.08em;
  color: var(--hz-ink-3);
}
/* The red bar along the top rule is the step in focus. */
.md-steps button::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -2px;
  height: 6px;
  background: var(--hz-red);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.6s var(--hz-ease);
}
.md-steps button.past {
  color: var(--hz-ink-2);
}
.md-steps button.on {
  color: var(--hz-ink);
}
.md-steps button.on::before {
  transform: scaleX(1);
}
.md-steps button.on span {
  color: var(--hz-red);
}

.md-body {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 1fr);
  gap: clamp(24px, 3vw, 48px);
  align-items: start;
}

/* ---- the code -------------------------------------------------------------------------- */

.md-code {
  min-width: 0;
  border: 1px solid var(--hz-line);
  background: var(--hz-card);
}
.md-pre {
  margin: 0;
  padding: 20px 0;
  overflow-x: auto;
}
.md-code code {
  display: inline-block;
  min-width: 100%;
  font-size: 12px;
  line-height: 1.75;
  color: var(--hz-ink);
  background: none;
}
.md-line {
  display: block;
  padding: 0 20px;
  border-left: 4px solid transparent;
  white-space: pre;
  transition: background-color 0.35s, border-color 0.35s, opacity 0.35s;
}
.md-line.cold {
  opacity: 0.5;
}
.md-line.hot {
  opacity: 1;
  border-left-color: var(--hz-red);
  background: color-mix(in srgb, var(--hz-red) 10%, transparent);
}
.md-pre.md-exec {
  padding: 14px 0;
  border-top: 1px solid var(--hz-line);
}
.md-exec code {
  display: inline-block;
  min-width: 100%;
  padding: 0 20px;
  border-left: 4px solid transparent;
  white-space: pre;
  color: var(--hz-ink-2);
  transition: background-color 0.35s, border-color 0.35s;
}
.md-exec code span {
  color: var(--hz-red);
}
.md-exec code.hot {
  border-left-color: var(--hz-red);
  background: color-mix(in srgb, var(--hz-red) 10%, transparent);
  color: var(--hz-ink);
}

/* ---- the picture ----------------------------------------------------------------------- */

.md-art svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}
/* 15 units in a 720-wide picture: 11px or more at the narrowest the picture is drawn. */
.md-art text {
  font: 15px var(--hz-mono);
}
.md-art text.lg {
  font: 800 19px var(--vp-font-family-base);
  letter-spacing: -0.02em;
}
.md-art .ink {
  fill: var(--hz-ink);
}
.md-art text.ink {
  fill: var(--hz-ink);
}
.md-art .on-ink {
  fill: var(--hz-on-ink);
}
.md-art .on-red {
  fill: #fff;
}
.md-art .red {
  fill: var(--hz-red);
}
.md-art .grey {
  fill: var(--hz-ink-3);
}
.md-art .frame {
  fill: none;
  stroke: var(--hz-ink);
  stroke-width: 2;
}
.md-part {
  opacity: 0.08;
  transform-box: fill-box;
  transform-origin: center;
  transition:
    opacity 0.6s var(--hz-ease),
    transform 0.6s var(--hz-ease);
}
.md-part.shown {
  opacity: 0.55;
}
.md-part.now {
  opacity: 1;
  animation: md-pop 0.7s var(--hz-ease);
}
.md-part.shown:not(.now) {
  opacity: 0.75;
}
@keyframes md-pop {
  from {
    transform: translateY(10px) scale(0.96);
  }
}
.md-line-path {
  fill: none;
  stroke: var(--hz-ink);
  stroke-width: 2;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 0.8s var(--hz-ease) 0.15s;
}
.md-line-path.shown {
  stroke-dashoffset: 0;
}
.md-line-path.dash.shown {
  stroke-dasharray: 0.04 0.03;
}
.md-packet {
  offset-path: path('M446 150 C 500 150, 500 60, 560 60');
  offset-rotate: 0deg;
  animation: md-travel 1.6s var(--hz-ease) 0.3s infinite;
}
@keyframes md-travel {
  from {
    offset-distance: 0%;
  }
  to {
    offset-distance: 100%;
  }
}
.md-said {
  display: flex;
  gap: 14px;
  min-height: 3.2em;
  margin: 18px 0 0;
  font-size: clamp(16px, 1.3vw, 19px);
  line-height: 1.45;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--hz-ink);
}
.md-said b {
  flex: none;
  font: 700 12px/1.9 var(--hz-mono);
  color: var(--hz-red);
}

@media (max-width: 960px) {
  .md-body {
    grid-template-columns: minmax(0, 1fr);
  }
  .md-art {
    order: -1;
  }
}
@media (max-width: 560px) {
  .md-steps {
    grid-template-columns: repeat(5, auto);
    overflow-x: auto;
  }
  .md-steps button {
    flex-direction: column;
    gap: 4px;
    padding-right: 14px;
    font-size: 15px;
  }
  /* Too narrow to read the picture scaled down: it keeps its size and scrolls instead. */
  .md-art {
    overflow-x: auto;
  }
  .md-art svg {
    width: 600px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .md-part.now {
    animation: none;
  }
  .md-packet {
    animation: none;
    offset-distance: 100%;
  }
}
</style>
