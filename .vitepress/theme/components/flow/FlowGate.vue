<script setup lang="ts">
// The finish: a post at the right of the run, and every way the run ends beside it. The first
// is the one this run reaches; once it has, it lights, in the colour of how it ended -- done,
// gave up, budget, or you -- and bursts. Drawn from the post's top at the origin.
//
// The burst is a ring, rays thrown out from the ending that lit and a scatter of flat poster
// shards falling away from it, each placed by `fired` alone, so a scrub through the finish
// draws it exactly. A card's small picture keeps the ring and nothing more.
import { computed } from 'vue'

import type { Outcome } from '../../flows'
import FlowGlyph from './FlowGlyph.vue'

const props = withDefaults(
  defineProps<{
    ends: { is: Outcome; said: string }[]
    h: number
    /** 0 before the run ends; then 0 to 1 as the ending lands. */
    fired?: number
    bare?: boolean
    words?: number
  }>(),
  { fired: 0, bare: false, words: 1 },
)

const on = computed(() => props.fired > 0)
const first = computed(() => props.ends[0]?.is ?? 'budget')

/** Where the burst comes from: the glyph of the ending that lit. */
const CX = 23
const CY = 34
const live = computed(() => !props.bare && props.fired > 0 && props.fired < 1)
const out = computed(() => 1 - (1 - props.fired) ** 3)
const rays = computed(() =>
  live.value
    ? Array.from({ length: 12 }, (_, n) => {
        const a = (n / 12) * Math.PI * 2 + 0.2
        const r0 = 12 + 34 * out.value
        const r1 = r0 + 12 * (1 - props.fired)
        return `M ${(CX + r0 * Math.cos(a)).toFixed(1)} ${(CY + r0 * Math.sin(a)).toFixed(1)} L ${(CX + r1 * Math.cos(a)).toFixed(1)} ${(CY + r1 * Math.sin(a)).toFixed(1)}`
      })
    : [],
)
/** Shards in the poster's colours, each thrown its own way and pulled down as they slow. */
const TONES = ['hue', 'mark', 'maker', 'steward', 'partner'] as const
const shards = computed(() =>
  live.value
    ? Array.from({ length: 16 }, (_, n) => {
        const a = -Math.PI / 2 + ((n * 137.5) % 360) * (Math.PI / 180)
        const v = 40 + ((n * 53) % 37)
        const u = props.fired
        const x = CX + Math.cos(a) * v * out.value
        const y = CY + Math.sin(a) * v * out.value + 30 * u * u
        return {
          m: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(n * 47 + 540 * u).toFixed(0)})`,
          tone: TONES[n % TONES.length],
          w: n % 3 === 0 ? 7 : 4,
          o: Math.min(1, (1 - u) * 1.6),
        }
      })
    : [],
)
/** The ending that lit swells a little as it lands, and settles. */
const swell = computed(() => (live.value ? 1 + 0.14 * Math.sin(Math.PI * Math.min(1, props.fired * 1.6)) : 1))
</script>

<template>
  <g class="f-gate" :class="[{ on }, `o-${first}`]">
    <line class="post" x1="0" y1="0" x2="0" :y2="h" />
    <path class="flag" d="M 0 0 H 17 L 12.5 6 L 17 12 H 0 Z" />
    <circle v-if="bare && on && fired < 1" class="burst" :cx="CX" :cy="CY" :r="8 + 30 * fired" :opacity="0.6 * (1 - fired)" />
    <circle v-if="live" class="burst" :cx="CX" :cy="CY" :r="8 + 64 * out" :opacity="0.35 * (1 - fired)" />
    <path v-for="(d, n) in rays" :key="`r${n}`" class="ray" :d="d" :opacity="1 - fired" />
    <rect
      v-for="(shard, n) in shards"
      :key="`s${n}`"
      class="shard"
      :class="`t-${shard.tone}`"
      :transform="shard.m"
      :x="-shard.w / 2"
      y="-2"
      :width="shard.w"
      height="4"
      :opacity="shard.o"
    />
    <g
      v-for="(end, n) in ends"
      :key="n"
      class="end"
      :class="[`o-${end.is}`, { lit: on && n === 0 }]"
      :transform="`translate(10 ${34 + n * 26})${n === 0 && swell !== 1 ? ` scale(${swell.toFixed(3)})` : ''}`"
    >
      <rect v-if="!bare" class="chip" x="0" y="-10.5" :width="end.said.length * 6.4 + 34" height="21" rx="10.5" />
      <FlowGlyph :name="end.is" :x="13" :size="12" :fill="end.is === 'you'" />
      <text v-if="!bare && words > 0" class="said" x="26" y="4" :opacity="words < 1 ? words : undefined">{{ end.said }}</text>
    </g>
  </g>
</template>
