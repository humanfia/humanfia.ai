<script setup lang="ts">
// The hero's figure: the same Kimi Delta Attention forward pass, run four ways, drawn as a trace
// viewer draws kernels -- one lane each, time running left to right, the work cut into tiles.
// A playhead sweeps the FlashKDA run; each KDA kernel finishes the same work at 1 / its speedup
// of that time and stamps its number. Then it holds, and runs again, while it is on screen.
//
// The final state is what the server renders and what a reader who asked for less motion sees:
// every lane finished, every number stamped.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Clock, prefersReducedMotion } from '../../../home/motion'
import { times } from './motion'

interface Lane {
  name: string
  score: number
  detail?: string
  best?: boolean
}

const props = defineProps<{ lanes: Lane[]; kicker: string }>()

/** Seconds the FlashKDA run takes on screen, and how long the finished picture holds. */
const RUN = 3.4
const HOLD = 2.6
const LEAD = 0.5

const root = ref<HTMLElement | null>(null)
const t = ref(1)
const focus = ref<number | null>(null)
let clock: Clock | null = null

onMounted(() => {
  if (prefersReducedMotion() || !root.value) return
  clock = new Clock(root.value, (s) => {
    // A beat of nothing, the run, then the finished picture held.
    const phase = s % (LEAD + RUN + HOLD)
    t.value = Math.min(1, Math.max(0, (phase - LEAD) / RUN))
  })
})
onBeforeUnmount(() => clock?.destroy())

const lanes = computed(() =>
  props.lanes.map((lane) => {
    const span = 1 / lane.score
    const done = Math.min(1, t.value * lane.score)
    return { ...lane, span, done, finished: done >= 1 }
  }),
)

const ticks = [0, 0.25, 0.5, 0.75, 1]
const label = computed(
  () =>
    `${props.kicker}. Time to run the same work, as a fraction of FlashKDA's: ` +
    props.lanes.map((l) => `${l.name} ${(1 / l.score).toFixed(2)}, ${times(l.score)}`).join('; ') +
    '.',
)
</script>

<template>
  <figure ref="root" class="race" role="img" :aria-label="label">
    <figcaption class="race-top">
      <span class="kd-kicker"><i class="race-dot" />{{ kicker }}</span>
      <span class="race-clock kd-mono" aria-hidden="true">t = {{ t.toFixed(2) }}</span>
    </figcaption>

    <div class="race-body" aria-hidden="true" @mouseleave="focus = null">
      <div class="race-grid">
        <i v-for="x in ticks" :key="x" :style="{ left: `${x * 100}%` }" />
      </div>
      <div class="race-over"><i class="race-head" :style="{ left: `${t * 100}%` }" /></div>

      <div
        v-for="(lane, i) in lanes"
        :key="lane.name"
        class="race-lane"
        :class="{ best: lane.best, base: lane.score === 1, dim: focus !== null && focus !== i, done: lane.finished }"
        @mouseenter="focus = i"
      >
        <span class="race-name">{{ lane.name }}</span>
        <span class="race-track">
          <span
            class="race-bar"
            :style="{
              width: `${lane.span * 100}%`,
              clipPath: `inset(0 ${(1 - lane.done) * 100}% 0 0)`,
            }"
          />
          <span class="race-end" :style="{ left: `${lane.span * 100}%` }">{{ lane.span.toFixed(2) }}</span>
        </span>
        <span class="race-score kd-mono">{{ times(lane.score) }}</span>
      </div>

      <div class="race-axis kd-mono">
        <span v-for="x in ticks" :key="x" :style="{ left: `${x * 100}%` }">{{ x.toFixed(2) }}</span>
      </div>
    </div>
    <p class="race-foot kd-mono">time as a fraction of FlashKDA's · geomean of six 8,192-token workloads</p>
  </figure>
</template>

<style scoped>
.race {
  margin: 0;
  padding: 22px 22px 18px;
  border: 1px solid var(--kd-line);
  background: color-mix(in srgb, var(--kd-bg) 70%, var(--kd-card));
  box-shadow: 14px 14px 0 0 var(--kd-red);
}

.race-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  padding-bottom: 14px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--kd-line);
}

.race-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 8px;
  background: var(--kd-red);
}

.race-clock {
  white-space: nowrap;
  font-size: 12px;
  color: var(--kd-fg-2);
  min-width: 7ch;
  text-align: right;
}

.race-body {
  position: relative;
  --tiles: 32;
  --name: 150px;
  --score: 64px;
  --gap: 14px;
}

/* The grid and the playhead live over the track column only. */
.race-grid,
.race-over {
  position: absolute;
  left: calc(var(--name) + var(--gap));
  right: calc(var(--score) + var(--gap));
}

.race-grid {
  top: 0;
  bottom: 32px;
  pointer-events: none;
}

.race-grid i {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--kd-grid);
}

.race-over {
  top: -8px;
  bottom: 30px;
  pointer-events: none;
  z-index: 2;
}

.race-head {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--kd-fg);
  opacity: 0.55;
}

.race-lane {
  position: relative;
  display: grid;
  grid-template-columns: var(--name) minmax(0, 1fr) var(--score);
  gap: var(--gap);
  align-items: center;
  height: 52px;
  transition: opacity 0.3s var(--kd-ease);
}

.race-lane.dim {
  opacity: 0.35;
}

.race-name {
  font-family: var(--kd-mono);
  font-size: 12.5px;
  line-height: 1.25;
  color: var(--kd-fg-2);
}

.race-lane.best .race-name {
  color: var(--kd-fg);
  font-weight: 700;
}

.race-track {
  position: relative;
  height: 28px;
  border-left: 1px solid var(--kd-line);
}

.race-bar {
  position: absolute;
  inset: 0 auto 0 0;
  background-color: var(--kd-fg-3);
  /* the tiles: one per chunk of the run, cut by a hairline of the ground */
  background-image: linear-gradient(90deg, transparent calc(100% - 1px), var(--kd-bg) 0);
  /* the same number of tiles in every lane: the same work, in less time */
  background-size: calc(100% / var(--tiles)) 100%;
}

.race-lane:not(.base) .race-bar {
  background-color: var(--kd-fg);
}

.race-lane.best .race-bar {
  background-color: var(--kd-red);
}

.race-end {
  position: absolute;
  top: 100%;
  margin-top: 2px;
  transform: translateX(-100%);
  font-family: var(--kd-mono);
  font-size: 11px;
  color: var(--kd-fg-3);
  opacity: 0;
  transition: opacity 0.4s var(--kd-ease);
}

.race-lane.done:not(.base) .race-end {
  opacity: 1;
}

.race-score {
  font-size: 17px;
  font-weight: 700;
  text-align: right;
  color: var(--kd-fg);
  opacity: 0.18;
  transform: translateX(-6px);
  transition:
    opacity 0.35s var(--kd-ease),
    transform 0.5s var(--kd-ease);
}

.race-lane.done .race-score {
  opacity: 1;
  transform: none;
}

.race-lane.best .race-score {
  color: var(--kd-red);
}

.race-axis {
  position: relative;
  margin-left: calc(var(--name) + var(--gap));
  margin-right: calc(var(--score) + var(--gap));
  height: 26px;
  margin-top: 6px;
}

.race-axis span {
  position: absolute;
  top: 8px;
  transform: translateX(-50%);
  font-size: 11px;
  color: var(--kd-fg-3);
}

.race-axis span:first-child {
  transform: none;
}

.race-axis span:last-child {
  transform: translateX(-100%);
}

.race-foot {
  margin: 10px 0 0;
  font-size: 11px;
  color: var(--kd-fg-3);
  text-align: right;
}

@media (max-width: 560px) {
  .race {
    padding: 16px 14px 14px;
    box-shadow: 8px 8px 0 0 var(--kd-red);
  }
  .race-body {
    --tiles: 12;
    --name: 92px;
    --score: 50px;
    --gap: 10px;
  }
  .race-name {
    font-size: 11px;
  }
  .race-score {
    font-size: 14px;
  }
  .race-axis span:nth-child(even) {
    display: none;
  }
  .race-top .kd-kicker {
    font-size: 11px;
  }
}
</style>
