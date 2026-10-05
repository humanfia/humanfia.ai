<script setup lang="ts">
// Upstream, drawn as the history it is: SGLang's main line across August to October, each KDA
// pull request a branch merging into it on the day it was merged, the forty-odd operators that
// came before folded up at the left, and the one merge elsewhere that did not stay on a grey line
// of its own. Pick a merge (point, tap, or arrow keys) to read what it changed, on what, and what
// it was worth -- the kernel alone and the whole model, when the pull request measured both.
//
// From the `upstream:` frontmatter. The line draws itself and the merges land in order the first
// time it is on screen.
import { computed, ref } from 'vue'
import { useInView } from '../../kit/shared'

interface Pr {
  pr: string
  date: string
  change: string
  hw: string
  kernel?: number
  kernelText?: string
  model?: number
  modelLabel?: string
  result: string
}

const props = defineProps<{
  prs: Pr[]
  before: { value: string; text: string; href: string }
  reverted: { pr: string; date: string; revertedOn: string; text: string; href: string }
  from: string
  to: string
  start: string
}>()

const DAY = 86_400_000
const t0 = computed(() => Date.parse(props.from))
const t1 = computed(() => Date.parse(props.to))
/** A date's place on the line, as a percentage of the dated part of it (after the fold). */
const FOLD = 12
const x = (d: string) => FOLD + ((Date.parse(d) - t0.value) / (t1.value - t0.value)) * (100 - FOLD - 2)
const fmt = (d: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(d))

const picked = ref(props.prs.findIndex((p) => p.pr === props.start))
const pr = computed(() => props.prs[picked.value])
const num = (p: Pr) => p.pr.replace('#', '')

const root = ref<HTMLElement | null>(null)
const seen = useInView(root, 0.3)

const ticks = computed(() => {
  const out: string[] = []
  for (let t = t0.value; t <= t1.value; t += DAY) {
    const d = new Date(t)
    if (d.getUTCDate() === 1 || d.getUTCDate() === 15) out.push(d.toISOString().slice(0, 10))
  }
  return out
})

function key(e: KeyboardEvent) {
  const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
  // only between the merges themselves: the links in the graph keep their keys
  if (!step || !(e.target as HTMLElement).classList.contains('node')) return
  e.preventDefault()
  picked.value = (picked.value + step + props.prs.length) % props.prs.length
  ;(root.value?.querySelectorAll<HTMLButtonElement>('.node')[picked.value])?.focus()
}
const bar = (v: number) => `${Math.min(100, (v / 3) * 100)}%`
</script>

<template>
  <div ref="root" class="merges" :class="{ seen }">
    <div class="graph" role="group" aria-label="KDA pull requests merged into SGLang, by date" @keydown="key">
      <svg class="wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path class="main-old" :d="`M0 56 H${FOLD - 3}`" />
        <path class="main" :d="`M${FOLD} 56 H100`" />
        <path
          v-for="(p, i) in prs"
          :key="p.pr"
          class="branch"
          :class="{ on: i === picked }"
          :d="`M${x(p.date) - 5} 14 C ${x(p.date) - 1} 14, ${x(p.date)} 30, ${x(p.date)} 56`"
          :style="{ '--d': `${0.5 + i * 0.12}s` }"
        />
        <path class="kmeans" :d="`M${FOLD} 86 H${x(reverted.revertedOn) + 4}`" />
      </svg>

      <a class="fold" :href="before.href" :style="{ width: `${FOLD - 3}%` }">
        <b>{{ before.value }}</b>
        <span class="kd-mono">{{ before.text }}</span>
      </a>
      <span class="lane-label kd-mono main-label" :style="{ left: `${FOLD}%` }">sgl-project/sglang · main</span>
      <a class="lane-label kd-mono kmeans-label" :href="reverted.href" target="_blank" rel="noreferrer" :style="{ left: `${FOLD}%` }">flash-kmeans</a>

      <button
        v-for="(p, i) in prs"
        :key="p.pr"
        type="button"
        class="node"
        :class="{ on: i === picked }"
        :style="{ left: `${x(p.date)}%`, '--d': `${0.7 + i * 0.12}s` }"
        :aria-pressed="i === picked"
        :aria-label="`${p.pr}, merged ${fmt(p.date)}: ${p.change}`"
        :tabindex="i === picked ? 0 : -1"
        @click="picked = i"
        @mouseenter="picked = i"
      />
      <span
        v-for="(p, i) in prs"
        :key="`l${p.pr}`"
        class="node-label kd-mono"
        :class="{ on: i === picked, high: i % 2 === 1 }"
        :style="{ left: `${x(p.date) - 5}%` }"
        aria-hidden="true"
      >{{ p.pr }}</span>

      <span class="km km-in" :style="{ left: `${x(reverted.date)}%` }" aria-hidden="true" />
      <span class="km km-out" :style="{ left: `${x(reverted.revertedOn)}%` }" aria-hidden="true">×</span>

      <div class="axis kd-mono" aria-hidden="true">
        <span v-for="d in ticks" :key="d" :style="{ left: `${x(d)}%` }">{{ fmt(d) }}</span>
      </div>
    </div>

    <div class="chips" role="group" aria-label="Pick a pull request">
      <button
        v-for="(p, i) in prs"
        :key="`c${p.pr}`"
        type="button"
        class="kd-mono"
        :aria-pressed="i === picked"
        @click="picked = i"
      >{{ p.pr }}</button>
    </div>

    <article class="card" aria-live="polite">
      <div class="card-id">
        <p class="kd-kicker">Merged {{ fmt(pr.date) }} · {{ pr.hw }}</p>
        <p class="card-pr">{{ pr.pr }}</p>
        <p class="card-change">{{ pr.change }}</p>
        <a class="kd-link kd-mono card-link" :href="`https://github.com/sgl-project/sglang/pull/${num(pr)}`" target="_blank" rel="noreferrer">
          The pull request ↗
        </a>
      </div>
      <div class="card-num">
        <template v-if="pr.kernel && pr.model">
          <div class="kvm">
            <span class="kd-mono">The kernel alone</span>
            <i><b :style="{ width: bar(pr.kernel) }" /></i>
            <span class="kd-mono kvm-v">{{ pr.kernelText ?? `${pr.kernel.toFixed(2)}×` }}</span>
          </div>
          <div class="kvm model">
            <span class="kd-mono">{{ pr.modelLabel ?? 'The whole model' }}</span>
            <i><b :style="{ width: bar(pr.model) }" /></i>
            <span class="kd-mono kvm-v">{{ pr.model.toFixed(3) }}×</span>
          </div>
        </template>
        <p class="card-result">{{ pr.result }}</p>
      </div>
    </article>

    <p class="reverted">
      <b class="kd-mono">{{ reverted.pr }} · reverted</b>
      {{ reverted.text }}
    </p>
  </div>
</template>

<style scoped>
.graph {
  position: relative;
  height: 230px;
  margin: 48px 0 28px;
}

.wires {
  position: absolute;
  inset: 0 0 30px 0;
  width: 100%;
  height: calc(100% - 30px);
  overflow: visible;
}

.wires path {
  fill: none;
  vector-effect: non-scaling-stroke;
}

.main {
  stroke: var(--kd-fg);
  stroke-width: 3;
  transform-box: fill-box;
  transform-origin: left;
}

.main-old {
  stroke: var(--kd-fg-3);
  stroke-width: 3;
  stroke-dasharray: 2 5;
}

.branch {
  stroke: var(--kd-fg-3);
  stroke-width: 1.5;
  transition: stroke 0.3s var(--kd-ease);
}

.branch.on {
  stroke: var(--kd-red);
  stroke-width: 2.5;
}

.kmeans {
  stroke: var(--kd-fg-3);
  stroke-width: 1.5;
  stroke-dasharray: 3 3;
}

.kd-motion .main {
  transition: transform 1.4s var(--kd-ease);
}

.kd-motion .merges:not(.seen) .main {
  transform: scaleX(0);
}

.kd-motion .branch,
.kd-motion .node {
  transition:
    opacity 0.5s var(--kd-ease) var(--d),
    stroke 0.3s var(--kd-ease),
    transform 0.3s var(--kd-ease);
}

.kd-motion .merges:not(.seen) .branch,
.kd-motion .merges:not(.seen) .node {
  opacity: 0;
}

.fold {
  position: absolute;
  left: 0;
  bottom: calc(30px + (100% - 30px) * 0.44 + 14px);
  display: grid;
  gap: 2px;
  color: var(--kd-fg);
  text-decoration: none;
}

.fold b {
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
}

.fold span {
  font-size: 11px;
  line-height: 1.35;
  color: var(--kd-fg-2);
}

.fold:hover b {
  color: var(--kd-red-text);
}

.lane-label {
  position: absolute;
  font-size: 11px;
  color: var(--kd-fg-3);
  white-space: nowrap;
}

.main-label {
  top: calc((100% - 30px) * 0.56 + 10px);
}

.kmeans-label {
  top: calc((100% - 30px) * 0.86 + 6px);
  text-decoration: none;
}

.kmeans-label:hover {
  color: var(--kd-fg);
}

.node {
  position: absolute;
  top: calc((100% - 30px) * 0.56);
  width: 18px;
  height: 18px;
  margin: -9px 0 0 -9px;
  padding: 0;
  background: var(--kd-bg);
  border: 3px solid var(--kd-fg);
  border-radius: 50%;
  cursor: pointer;
}

.node::after {
  /* a larger target than the dot */
  content: '';
  position: absolute;
  inset: -12px;
}

.node.on {
  background: var(--kd-red);
  border-color: var(--kd-red);
  transform: scale(1.25);
}

.node-label {
  position: absolute;
  top: calc((100% - 30px) * 0.14 - 22px);
  transform: translateX(-50%);
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  color: var(--kd-fg-3);
  pointer-events: none;
  transition: color 0.3s var(--kd-ease);
}

.node-label.high {
  top: calc((100% - 30px) * 0.14 - 42px);
}

.node-label.on {
  color: var(--kd-red-text);
}

.chips {
  display: none;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0 0 16px;
}

.chips button {
  padding: 6px 10px;
  font-size: 12px;
  color: var(--kd-fg-2);
  border: 1px solid var(--kd-line);
  background: transparent;
  cursor: pointer;
}

.chips button[aria-pressed='true'] {
  color: var(--kd-on-red);
  background: var(--kd-red);
  border-color: var(--kd-red);
}

.km {
  position: absolute;
  top: calc((100% - 30px) * 0.86);
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
  border-radius: 50%;
  background: var(--kd-fg-3);
}

.km-out {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  margin: -9px 0 0 -9px;
  font-family: var(--kd-mono);
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  color: var(--kd-bg);
  background: var(--kd-fg-3);
}

.axis {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 22px;
  border-top: 1px solid var(--kd-line);
}

.axis span {
  position: absolute;
  top: 6px;
  transform: translateX(-50%);
  font-size: 11px;
  color: var(--kd-fg-3);
  white-space: nowrap;
}

.card {
  color: var(--kd-fg);
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: clamp(24px, 4vw, 64px);
  padding: clamp(22px, 3vw, 36px);
  background: var(--kd-card);
  border: 1px solid var(--kd-line);
  border-top: 4px solid var(--kd-red);
}

.card-pr {
  margin: 8px 0 0;
  color: var(--kd-fg);
  font-size: clamp(44px, 5vw, 68px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.045em;
  font-variant-numeric: tabular-nums;
}

.card-change {
  margin: 10px 0 0;
  font-size: 19px;
  font-weight: 650;
  line-height: 1.35;
  color: var(--kd-fg);
}

.card-link {
  display: inline-block;
  margin-top: 16px;
  font-size: 12.5px;
}

.card-num {
  display: grid;
  align-content: center;
  gap: 14px;
}

.kvm {
  display: grid;
  grid-template-columns: 12em minmax(0, 1fr) 6.5em;
  gap: 12px;
  align-items: center;
  font-size: 12px;
  color: var(--kd-fg-2);
}

.kvm i {
  position: relative;
  height: 18px;
  background: var(--kd-grid);
}

.kvm b {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--kd-fg);
  transition: width 0.7s var(--kd-ease);
}

.kvm.model b {
  background: var(--kd-red);
}

.kvm-v {
  text-align: right;
  font-size: 15px;
  font-weight: 700;
  color: var(--kd-fg);
}

.card-result {
  margin: 0;
  font-size: 16px;
  line-height: 1.55;
  color: var(--kd-fg-2);
}

.reverted {
  max-width: 80ch;
  margin: 22px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--kd-fg-3);
}

.reverted b {
  margin-right: 8px;
  font-size: 12px;
  color: var(--kd-fg-2);
}

@media (max-width: 760px) {
  .graph {
    height: 200px;
  }
  .node-label:not(.on) {
    display: none;
  }
  .node-label.high {
    top: calc((100% - 30px) * 0.14 - 22px);
  }
  .chips {
    display: flex;
  }
  .fold span {
    display: none;
  }
  .card {
    grid-template-columns: minmax(0, 1fr);
  }
  .kvm {
    grid-template-columns: minmax(0, 1fr) 5.4em;
    gap: 6px 12px;
  }
  .kvm > span:first-child {
    grid-column: 1 / -1;
  }
}
</style>
