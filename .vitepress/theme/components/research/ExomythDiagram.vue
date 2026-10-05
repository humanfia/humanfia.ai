<script setup lang="ts">
// Exomyth's picture of a run: every agent, its sub-agents and (when the run is profiled) the
// programs they started, as rows on one clock. A playhead sweeps the run and each slice appears
// as the clock reaches it; the dashed ties are what started what.
import { onBeforeUnmount, ref, watch } from 'vue'
import { still, useSeen } from './chart'
const ROWS = [
  { group: 'agent', name: 'builder · main', slices: [[2, 14, 'think'], [16, 34, 'Bash: pytest'], [36, 46, 'think'], [48, 66, 'Task: spawn'], [78, 88, 'Edit: calc.py']] },
  { group: 'agent', name: 'builder · subagent', slices: [[52, 62, 'think'], [64, 82, 'Read: …/test_calc.py']] },
  { group: 'agent', name: 'reviewer · main', slices: [[90, 100, 'review']] },
  { group: 'program', name: 'python -m pytest', slices: [[18, 32, 'pytest · 2.1 s']] },
  { group: 'program', name: 'git diff', slices: [[70, 76, 'git']] },
] as const
const root = ref<HTMLElement | null>(null)
const seen = useSeen(root)
const p = ref(100) // the playhead, 0..100 along the clock
let raf = 0
watch(seen, (on) => {
  if (!on || still()) return
  const t0 = performance.now()
  const tick = (now: number) => {
    const u = ((now - t0) % 11000) / 9000
    p.value = Math.min(100, u * 100)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))
const grown = (a: number, b: number) => Math.max(0, Math.min(p.value, b) - a)
const TIES = [
  { from: [25, 0], to: [25, 3], label: 'started' },
  { from: [57, 0], to: [57, 1], label: 'spawned' },
]
</script>

<template>
  <figure ref="root" class="ex" aria-label="One run as a timeline: an agent's sessions, its sub-agent, and the programs they started, on one clock">
    <div class="ex-clock" aria-hidden="true">
      <span v-for="t in [0, 25, 50, 75, 100]" :key="t" :style="{ left: `${t}%` }">{{ t }} s</span>
    </div>
    <div class="ex-rows">
      <div v-for="(r, i) in ROWS" :key="r.name" class="ex-row" :class="r.group">
        <span class="ex-name">{{ r.name }}</span>
        <div class="ex-track">
          <template v-for="s in r.slices" :key="s[0]">
            <span
              v-if="s[2] && p >= s[0]"
              class="ex-slice"
              :title="s[2]"
              :style="{ left: `${s[0]}%`, width: `${grown(s[0], s[1])}%` }"
            >{{ s[2] }}</span>
          </template>
          <i v-for="t in TIES.filter((t) => t.from[1] === i && p >= t.from[0])" :key="t.label" class="ex-tie" :style="{ left: `${t.from[0]}%`, '--rows': t.to[1] - t.from[1] }"><em>{{ t.label }}</em></i>
        </div>
      </div>
      <div class="ex-head" aria-hidden="true" :style="{ '--p': p / 100 }" />
    </div>
    <figcaption>
      Agent sessions (top) and, when the run is profiled, the programs they started (bottom) share one clock. The
      reviewer's row is empty until the builder hands over. Open the trace in Perfetto; nothing is uploaded.
    </figcaption>
  </figure>
</template>

<style scoped>
.ex {
  margin: 24px 0;
  padding: 18px 18px 14px;
  border: 1px solid var(--vp-c-divider);
  border-top: 4px solid var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}
.ex-clock {
  position: relative;
  height: 16px;
  margin-left: 150px;
  font: 11px var(--vp-font-family-mono);
  color: var(--vp-c-text-3);
}
.ex-clock span {
  position: absolute;
  transform: translateX(-50%);
  white-space: nowrap;
}
.ex-clock span:last-child {
  transform: translateX(-100%);
}
.ex-rows {
  position: relative;
}
.ex-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  align-items: center;
  min-height: 34px;
  border-top: 1px solid var(--vp-c-divider);
}
.ex-row.program:first-of-type,
.ex-row.agent + .ex-row.program {
  border-top: 2px solid var(--vp-c-text-1);
}
.ex-name {
  font: 12px/1.3 var(--vp-font-family-mono);
  color: var(--vp-c-text-2);
  padding-right: 8px;
}
.ex-track {
  position: relative;
  height: 34px;
}
.ex-slice {
  position: absolute;
  top: 6px;
  height: 22px;
  padding: 0 6px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font: 11px/22px var(--vp-font-family-mono);
  color: var(--vp-c-bg);
  background: var(--vp-c-text-1);
}
.program .ex-slice {
  background: var(--hf-red);
  color: #fff;
}
.dark .program .ex-slice {
  background: var(--hf-red-press);
}
.ex-tie {
  position: absolute;
  top: 28px;
  width: 0;
  height: calc(var(--rows) * var(--rowh, 35px) - 22px);
  border-left: 1.5px dashed var(--hf-red);
}
.ex-tie em {
  position: absolute;
  left: 4px;
  top: 2px;
  font: italic 11px var(--vp-font-family-mono);
  color: var(--hf-red);
  white-space: nowrap;
}
.ex-head {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(150px + (100% - 150px) * var(--p));
  width: 2px;
  background: var(--hf-red);
}
figcaption {
  margin-top: 12px;
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}
@media (max-width: 560px) {
  .ex {
    --rowh: 52px;
  }
  .ex-row {
    grid-template-columns: 1fr;
    min-height: 52px;
  }
  .ex-name {
    padding-top: 4px;
    font-size: 11px;
  }
  .ex-clock {
    margin-left: 0;
  }
  /* Too narrow to name a slice; the row names and the caption carry it. */
  .ex-slice {
    color: transparent !important;
  }
  .ex-head {
    left: calc(100% * var(--p));
  }
}
</style>
