<script setup lang="ts">
// What one turn hands the next, in screen space: the curve, the part of it already travelled,
// the comet on it with its wake, the ring where it lands, and what it carries. Words are a
// solid curve and a round comet; files left in the tree are a dotted curve and a square one.
//
// What it carries rides with it: a chip that is packed at the turn handing it on, travels just
// over the comet, and is taken in by the turn it reaches, shrinking into it. At rest, with no
// comet, the chip sits half way along the curve instead, so the whole run reads at a glance.
import type { RoleKind } from '../../flows'
import FlowGlyph from './FlowGlyph.vue'
import { legible } from './grammar'

export interface Dot {
  x: number
  y: number
  r: number
  o: number
}

withDefaults(
  defineProps<{
    kind: RoleKind
    via: 'text' | 'tree'
    d: string
    lit?: string
    trail?: Dot[]
    head?: { x: number; y: number; s: number } | null
    ripple?: Dot | null
    said?: string
    at?: { x: number; y: number; s: number } | null
    labelOn?: number
    /** How big to draw the chip, against its full size, while it rides. */
    grow?: number
  }>(),
  { lit: '', trail: () => [], head: null, ripple: null, said: '', at: null, labelOn: 0, grow: 1 },
)
</script>

<template>
  <g class="f-wire" :class="[`k-${kind}`, via]">
    <path v-if="d" class="track" :d="d" />
    <path v-if="lit" class="lit" :d="lit" />
    <circle v-for="(dot, n) in trail" :key="`t${n}`" class="trail" :cx="dot.x" :cy="dot.y" :r="dot.r" :opacity="dot.o" />
    <g v-if="head" :transform="`translate(${head.x} ${head.y}) scale(${head.s})`">
      <circle class="halo" r="10" />
      <circle v-if="via === 'text'" class="comet" r="4" />
      <rect v-else class="comet" x="-3.8" y="-3.8" width="7.6" height="7.6" />
    </g>
    <circle v-if="ripple" class="ripple" :cx="ripple.x" :cy="ripple.y" :r="ripple.r" :opacity="ripple.o" />
    <g
      v-if="said && at && labelOn * legible(at.s) > 0.01"
      class="said"
      :transform="`translate(${at.x} ${at.y}) scale(${at.s * grow})`"
      :opacity="labelOn * legible(at.s)"
    >
      <rect :x="-(said.length * 6.5 + 30) / 2" y="-9.5" :width="said.length * 6.5 + 30" height="19" rx="9.5" />
      <FlowGlyph :name="via === 'tree' ? 'folder' : 'say'" :x="-(said.length * 6.5) / 2 - 3" :size="10" />
      <text x="8" y="4">{{ said }}</text>
    </g>
  </g>
</template>
