<script setup lang="ts">
// The MLSys 2026 FlashInfer tracks, one column each: the contest entry (KDA 0.1), the best human
// entry, and KDA 0.5, as speedups over the FlashInfer baseline on the track's own scale, with the
// baseline ruled across at 1×. Under each, the placement in the contest and the margin over the
// best human entry the public release reports. The bars rise the first time they are on screen;
// pointing at a column picks it out.
//
// From the `mlsys:` frontmatter, which is the public release's own table.
import { ref } from 'vue'
import { useInView } from '../../kit/shared'

interface Track {
  track: string
  detail: string
  place: string
  max: number
  kda01: number
  human: number
  kda05: number
  margin: number
}

defineProps<{ tracks: Track[] }>()

const SERIES = [
  { key: 'kda01', label: 'KDA 0.1 · contest entry', cls: 'old' },
  { key: 'human', label: 'Best human entry', cls: 'human' },
  { key: 'kda05', label: 'KDA 0.5', cls: 'new' },
] as const

const root = ref<HTMLElement | null>(null)
const seen = useInView(root, 0.3)
const focus = ref<number | null>(null)
const h = (v: number, max: number) => `${Math.min(100, (v / max) * 100)}%`
</script>

<template>
  <div ref="root" class="contest" :class="{ seen }">
    <ul class="legend" aria-hidden="true">
      <li v-for="s in SERIES" :key="s.key" :class="s.cls"><i />{{ s.label }}</li>
      <li class="base"><i />FlashInfer baseline, 1×</li>
    </ul>

    <div class="tracks" @mouseleave="focus = null">
      <figure
        v-for="(t, ti) in tracks"
        :key="t.track"
        class="track"
        :class="{ dim: focus !== null && focus !== ti }"
        :aria-label="`${t.track}, ${t.detail}: KDA 0.1 ${t.kda01}×, best human entry ${t.human}×, KDA 0.5 ${t.kda05}× over the FlashInfer baseline. Contest placement ${t.place}. KDA 0.5 is ${t.margin}× the best human entry.`"
        role="img"
        @mouseenter="focus = ti"
      >
        <figcaption class="track-head">
          <span class="track-name">{{ t.track }}</span>
          <span class="kd-mono track-place">contest <b>{{ t.place }}</b></span>
        </figcaption>

        <div class="plot" aria-hidden="true">
          <i class="base-line" :style="{ bottom: h(1, t.max) }" />
          <div v-for="(s, si) in SERIES" :key="s.key" class="col" :class="s.cls">
            <span class="val kd-mono" :style="{ bottom: h(t[s.key], t.max), '--d': `${ti * 140 + si * 110}ms` }">{{ t[s.key].toFixed(2) }}×</span>
            <i class="bar" :style="{ height: h(t[s.key], t.max), '--d': `${ti * 140 + si * 110}ms` }" />
          </div>
        </div>

        <div class="margin">
          <span class="margin-value">{{ t.margin.toFixed(2) }}×</span>
          <span class="kd-mono margin-label">the best human entry · {{ t.detail }}</span>
        </div>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 22px;
  margin: 0 0 22px;
  padding: 0;
  list-style: none;
  font-family: var(--kd-mono);
  font-size: 12px;
  color: var(--kd-fg-2);
}

.legend li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend i {
  width: 12px;
  height: 12px;
  background: var(--kd-fg-3);
}

.legend .old i,
.col.old .bar {
  background: repeating-linear-gradient(-45deg, var(--kd-fg-3) 0 2px, transparent 2px 5px);
  box-shadow: inset 0 0 0 1px var(--kd-fg-3);
}

.legend .human i,
.col.human .bar {
  background: var(--kd-fg);
}

.legend .new i,
.col.new .bar {
  background: var(--kd-red);
}

.legend .base i {
  height: 0;
  border-top: 1.5px dashed var(--kd-fg-2);
  background: none;
}

.tracks {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  background: var(--kd-line);
  border: 1px solid var(--kd-line);
}

.track {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: clamp(18px, 2vw, 28px);
  background: var(--kd-bg);
  transition: opacity 0.35s var(--kd-ease);
}

.track.dim {
  opacity: 0.4;
}

.track-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--kd-line);
}

.track-name {
  font-size: clamp(18px, 1.7vw, 22px);
  font-weight: 750;
  letter-spacing: -0.02em;
}

.track-place {
  font-size: 12px;
  color: var(--kd-fg-3);
}

.track-place b {
  color: var(--kd-fg);
}

.plot {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14%;
  height: clamp(200px, 22vw, 300px);
  margin: 46px 0 0;
  padding: 0 6%;
  border-bottom: 1px solid var(--kd-fg-3);
}

.base-line {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 2;
  height: 0;
  border-top: 1.5px dashed var(--kd-fg-2);
}

.col {
  position: relative;
}

.bar {
  position: absolute;
  inset: auto 0 0 0;
  transform-origin: bottom;
}

.val {
  position: absolute;
  left: 50%;
  margin-bottom: 8px;
  transform: translateX(-50%);
  font-size: 12.5px;
  font-weight: 700;
  white-space: nowrap;
  color: var(--kd-fg-2);
}

.col.new .val {
  color: var(--kd-red);
  font-size: 14px;
}

.kd-motion .bar {
  transition: transform 1.2s var(--kd-ease) var(--d);
}

.kd-motion .val {
  transition: opacity 0.6s var(--kd-ease) calc(var(--d) + 0.7s);
}

.kd-motion .contest:not(.seen) .bar {
  transform: scaleY(0);
}

.kd-motion .contest:not(.seen) .val {
  opacity: 0;
}

.margin {
  display: grid;
  gap: 4px;
  margin-top: 22px;
}

.margin-value {
  font-size: clamp(44px, 4.6vw, 64px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--kd-red);
  font-variant-numeric: tabular-nums;
}

.margin-label {
  font-size: 12px;
  color: var(--kd-fg-2);
}

@media (max-width: 820px) {
  .tracks {
    grid-template-columns: minmax(0, 1fr);
  }
  .plot {
    height: 200px;
  }
}
</style>
