<script setup lang="ts">
// The axes a Flame Chase can be ablated along, drawn as bars radiating from the flow (the red
// circle) -- a Rodchenko compass rather than a radar chart, because the axes are not on one
// scale. Pick one to see what varies along it and which figure on this page already moves it.
import { computed, ref } from 'vue'

const AXES = [
  {
    name: 'Models involved',
    values: 'Claude Fable 5 ↔ GPT-5.6 Sol · Opus 5 ↔ GPT-5.6 Sol · one model alone',
    seen: 'Fig. 3 compares two models alternating with each model alone.',
    href: '#higher-diversity-higher-score',
  },
  {
    name: 'Model order',
    values: 'who opens the chase: the refactorer first, or the fine-tuner first',
    seen: 'HMA’s pairings show order matters: Opus 5 ↔ GPT-5.6 Sol 78.2%, the reverse 73.3%.',
    href: '/news/2026-10-05-hma-mle-bench',
  },
  {
    name: 'Invocation ratio',
    values: '1 : 1 alternation · 2 : 1 · interrupt only at accepted experiments',
    seen: 'The fixed-interrupt Flame Chase flow switches at accepted-experiment boundaries.',
    href: '/flows/fixed-interrupt-flame-chase',
  },
  {
    name: 'Parallel pattern',
    values: 'one chase · three lanes with snapshots · lanes merged by pull request',
    seen: 'Fig. 4: Parallel Flame Chase, and its Git/PR variant.',
    href: '#better-collaboration-better-performance',
  },
  {
    name: 'Collaboration pattern',
    values: 'shared workspace · reports between lanes · a coordinator that merges',
    seen: 'Fig. 4 again: the Git/PR coordinator is the best of the three.',
    href: '#better-collaboration-better-performance',
  },
  {
    name: 'Task tracking',
    values: 'one fixed goal · a progressive goal · a written plan the agents update',
    seen: 'Fig. 5: the same Ralph loop with a progressive goal.',
    href: '#a-progressive-goal-keeps-agents-on-track',
  },
]
const at = ref(0)
const axis = computed(() => AXES[at.value])
const R = 120
const spoke = (i: number) => {
  const a = (-90 + i * (360 / AXES.length)) * (Math.PI / 180)
  return { x: Math.cos(a) * R, y: Math.sin(a) * R, deg: -90 + i * (360 / AXES.length) }
}
</script>

<template>
  <div class="ax">
    <svg viewBox="-185 -185 370 370" class="ax-svg" aria-hidden="true">
      <g v-for="(a, i) in AXES" :key="a.name" class="ax-spoke" :class="{ on: i === at }" @click="at = i">
        <rect :transform="`rotate(${spoke(i).deg}) translate(30,-5)`" :width="i === at ? R : R * 0.72" height="10" />
        <text :x="spoke(i).x * 1.42" :y="spoke(i).y * 1.42" text-anchor="middle" dy="0.35em">{{ i + 1 }}</text>
      </g>
      <circle r="26" class="ax-core" />
      <text class="ax-core-label" text-anchor="middle" dy="0.35em">FC</text>
    </svg>
    <div class="ax-panel">
      <div class="ax-tabs" role="tablist" aria-label="Ablation axes of the Flame Chase">
        <button
          v-for="(a, i) in AXES"
          :key="a.name"
          type="button"
          role="tab"
          :aria-selected="i === at"
          :class="{ on: i === at }"
          @click="at = i"
        ><span>{{ i + 1 }}</span>{{ a.name }}</button>
      </div>
      <div class="ax-detail" role="tabpanel">
        <p><b>Varies:</b> {{ axis.values }}</p>
        <p><b>Already on this site:</b> <a :href="axis.href">{{ axis.seen }}</a></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ax {
  display: grid;
  grid-template-columns: minmax(200px, 300px) 1fr;
  gap: 20px;
  align-items: center;
  margin: 24px 0;
}
@media (max-width: 640px) {
  .ax {
    grid-template-columns: 1fr;
  }
  .ax-svg {
    max-width: 260px;
    margin: 0 auto;
  }
}
.ax-svg {
  width: 100%;
  height: auto;
  display: block;
}
.ax-spoke {
  cursor: pointer;
}
.ax-spoke rect {
  fill: var(--vp-c-text-1);
  transition: width 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), fill 0.3s;
}
.ax-spoke.on rect {
  fill: var(--hf-red);
}
.ax-spoke text {
  font: 700 16px var(--vp-font-family-mono);
  fill: var(--vp-c-text-2);
}
.ax-spoke.on text {
  fill: var(--hf-red);
}
.ax-core {
  fill: var(--hf-red);
}
.ax-core-label {
  font: 700 14px var(--vp-font-family-mono);
  fill: #fff;
}
.ax-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 6px;
}
.ax-tabs button {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 7px 10px;
  border: 1px solid var(--vp-c-divider);
  text-align: left;
  font: 600 13.5px/1.3 var(--vp-font-family-base);
  color: var(--vp-c-text-1);
  cursor: pointer;
}
.ax-tabs button span {
  font: 700 12px var(--vp-font-family-mono);
  color: var(--vp-c-text-3);
}
.ax-tabs button.on {
  border-color: var(--hf-red);
  box-shadow: 3px 3px 0 var(--hf-red);
}
.ax-tabs button.on span {
  color: var(--hf-red);
}
.ax-detail {
  margin-top: 12px;
  padding: 12px 14px;
  border-left: 4px solid var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}
.ax-detail p {
  margin: 0 0 6px !important;
  font-size: 14px;
  line-height: 1.5;
}
.ax-detail p:last-child {
  margin-bottom: 0 !important;
}
</style>
