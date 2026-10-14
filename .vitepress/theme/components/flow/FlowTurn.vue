<script setup lang="ts">
// One turn, drawn from the origin rightwards, `w` wide and centred on the lane. Its outline
// says who took it -- a bar for an agent, a bubble for you, a drawn box for a program -- its
// left edge whether a session was opened for it, its glyph what it does, and a second outline
// inside the first that it runs another flow.
//
// While it runs, the edge the work has reached leaves marks behind it along one inner edge of
// the bar, in the manner of what the turn does: lines of a diff for work, a line of text lit
// as it is read for a reading, nodes joined up for a plan, checks ticked off for a program,
// and dots that bounce while you type. A review that passes or sends the work back is stamped
// so as it lands. All of it is drawn from `progress` and `stamp`, so it is where the run is at
// any moment, scrubbed or played, and none of it is drawn on a card.
import { computed } from 'vue'

import type { Does, RoleKind } from '../../flows'
import FlowGlyph from './FlowGlyph.vue'
import { SIZE } from './grammar'

const props = withDefaults(
  defineProps<{
    kind: RoleKind
    w: number
    session: 'new' | 'held' | 'none'
    does: Does
    state?: 'waiting' | 'running' | 'landed'
    progress?: number
    /** 0 to 1 while the spark of a new session bursts, else below 0. */
    ignite?: number
    pulse?: number
    lines?: string[]
    inside?: number
    calls?: string
    bare?: boolean
    /** How much of its words to show: see `legible`. */
    words?: number
    /** What seeds the marks it leaves while it runs, so each turn's are its own: its id. */
    seed?: string
    /** What a review comes back with, if it is one. */
    verdict?: 'pass' | 'reject' | null
    /** 0 to 1 as the verdict's stamp comes down, 1 once it is down, else below 0. */
    stamp?: number
    /** 0 to 1 while the ring of the stamp landing spreads, else below 0. */
    thud?: number
  }>(),
  {
    state: 'landed',
    progress: 1,
    ignite: -1,
    pulse: 0,
    lines: () => [],
    inside: 0,
    calls: '',
    bare: false,
    words: 1,
    seed: '',
    verdict: null,
    stamp: -1,
    thud: -1,
  },
)

const h = SIZE.turn
// Hard-edged, as the rest of the poster is: a bar with its corners only just eased, a bubble
// for the one of us who talks, and a program's box square.
const r = computed(() => (props.kind === 'program' ? 0 : props.kind === 'human' ? 10 : 4))
const bubble = computed(() => {
  const { w } = props
  const top = -h / 2
  const rr = r.value
  // A rounded box with a tail under its left end.
  return [
    `M ${rr} ${top} H ${w - rr} A ${rr} ${rr} 0 0 1 ${w} ${top + rr} V ${-top - rr}`,
    `A ${rr} ${rr} 0 0 1 ${w - rr} ${-top} H 28 L 15 ${-top + 8} L 17 ${-top} H ${rr}`,
    `A ${rr} ${rr} 0 0 1 0 ${-top - rr} V ${top + rr} A ${rr} ${rr} 0 0 1 ${rr} ${top} Z`,
  ].join(' ')
})
const glyphX = computed(() => (props.session === 'new' ? 22 : 17))
const textX = computed(() => (glyphX.value + 9 + props.w) / 2)
const ticks = computed(() =>
  Array.from({ length: props.inside }, (_, n) => {
    const on = props.state === 'landed' || (props.state === 'running' && props.progress * props.inside >= n + 0.35)
    // The one the backend is in now, which breathes until it is done.
    const now = props.state === 'running' && !on && props.progress * props.inside >= n - 0.65
    return { x: textX.value + (n - (props.inside - 1) / 2) * 13 - 4.5, on, now }
  }),
)

/** A number from 0 to 1 that is always the same for the same turn and mark. */
const grain = (k: number) => {
  let h = 2166136261
  for (const c of `${props.seed}:${k}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return ((h >>> 0) % 1000) / 1000
}

type Mark = { key: string; d: string; cls: string; done: string; ends: number; shown: 'always' | 'done' }

/** Where the marks a running turn leaves behind it go. They sit along the bottom of the bar
 *  under a one-line label, and along its top over a two-line one, so they never cross a word.
 *  Laid out once a turn; only which of them the edge has passed changes as it runs. */
const layout = computed<Mark[]>(() => {
  const { w, does, bare, inside, kind } = props
  if (bare || inside || kind === 'human') return []
  const y = props.lines.length > 1 ? -h / 2 + 4.5 : h / 2 - 6.5
  const x1 = w - 8
  const out: Mark[] = []
  let x = glyphX.value + 11
  for (let k = 0; x < x1 && k < 40; k++) {
    const g = grain(k)
    if (does === 'work') {
      // A diff: lines of differing length, now and then one taken out rather than put in.
      const len = Math.min(x1 - x, 4 + 10 * g)
      out.push({ key: `m${k}`, d: `M ${x.toFixed(1)} ${y} h ${len.toFixed(1)}`, cls: '', done: g > 0.78 ? 'del' : 'add', ends: x + len, shown: 'done' })
      x += len + 3
    } else if (does === 'read') {
      // A line of text, read: words lit as the edge passes them.
      const len = Math.min(x1 - x, 3 + 6 * g)
      out.push({ key: `m${k}`, d: `M ${x.toFixed(1)} ${y} h ${len.toFixed(1)}`, cls: 'unseen', done: 'seen', ends: x + len, shown: 'always' })
      x += len + 3
    } else if (does === 'plan') {
      // Steps of a plan, each joined to the one before as it is laid down.
      const yy = y + (g - 0.5) * 2.4
      out.push({ key: `n${k}`, d: `M ${(x - 1.4).toFixed(1)} ${yy.toFixed(1)} h 2.8`, cls: '', done: 'node', ends: x, shown: 'done' })
      const nx = x + 9
      if (nx < x1) {
        const ny = y + (grain(k + 1) - 0.5) * 2.4
        const d = `M ${(x + 1.4).toFixed(1)} ${yy.toFixed(1)} L ${(nx - 1.4).toFixed(1)} ${ny.toFixed(1)}`
        out.push({ key: `j${k}`, d, cls: '', done: 'join', ends: nx, shown: 'done' })
      }
      x = nx
    } else {
      // A program's checks, each ticked as it is reached.
      if (x + 5 > x1) break
      out.push({ key: `c${k}`, d: `M ${x.toFixed(1)} ${y - 2} h 5 v 4 h -5 Z`, cls: 'todo', done: 'check', ends: x + 5, shown: 'always' })
      x += 8
    }
  }
  return out
})

/** The marks as the edge the work has reached leaves them. */
const marks = computed(() => {
  if (props.state !== 'running') return []
  const edge = props.w * props.progress
  const out: { key: string; d: string; cls: string }[] = []
  for (const m of layout.value) {
    const passed = m.ends <= edge
    if (passed) out.push({ key: m.key, d: m.d, cls: m.done })
    else if (m.shown === 'always') out.push({ key: m.key, d: m.d, cls: m.cls })
  }
  return out
})

/** You, typing: three dots at the end of the bubble that rise and fall one after another. */
const typing = computed(() => {
  if (props.bare || props.kind !== 'human' || props.state !== 'running') return []
  const phase = props.progress * 9 * Math.PI
  return [0, 1, 2].map((n) => ({ x: props.w - 30 + n * 8, y: h / 2 - 7 - 2.2 * Math.max(0, Math.sin(phase - n * 0.9)) }))
})

const VERDICT_SAID = { pass: 'passes', reject: 'sent back' } as const
const stampW = computed(() => (props.verdict ? VERDICT_SAID[props.verdict].length * 6.6 + 26 : 0))
const stampAt = computed(() => {
  const u = Math.min(1, Math.max(0, props.stamp))
  // Brought down from a little above and larger, the way a stamp is, and landing square.
  const k = 1 + 0.9 * (1 - u) ** 2
  return {
    // On the bar's lower right corner: what the turn hands on is packed over its upper one.
    m: `translate(${props.w - stampW.value / 2 - 4} ${h / 2 + 7 - 10 * (1 - u)}) rotate(-6) scale(${k.toFixed(3)})`,
    o: Math.min(1, u * 2.5),
  }
})
</script>

<template>
  <g class="f-turn" :class="[`k-${kind}`, state, session]">
    <rect
      v-if="state === 'running' && !bare"
      class="aura"
      x="-5"
      :y="-h / 2 - 5"
      :width="w + 10"
      :height="h + 10"
      :rx="r + 5"
      :opacity="0.2 + 0.25 * pulse"
    />
    <path v-if="kind === 'human'" class="shell" :d="bubble" />
    <rect v-else class="shell" x="0" :y="-h / 2" :width="w" :height="h" :rx="r" />
    <rect
      v-if="state === 'running' && progress > 0.01"
      class="fill"
      x="0"
      :y="-h / 2"
      :width="Math.max(2 * r, w * progress)"
      :height="h"
      :rx="r"
    />
    <line
      v-if="state === 'running' && progress > 0.02 && progress < 0.98"
      class="edge"
      :x1="w * progress"
      :x2="w * progress"
      :y1="-h / 2 + 3"
      :y2="h / 2 - 3"
    />
    <rect
      v-if="calls"
      class="inner"
      x="4"
      :y="-h / 2 + 4"
      :width="w - 8"
      :height="h - 8"
      :rx="Math.max(2, r - 4)"
    />
    <g v-if="session === 'new'" class="spark">
      <circle v-if="ignite >= 0 && ignite < 1" class="burst" :r="5 + 18 * ignite" :opacity="0.6 * (1 - ignite)" />
      <circle class="dot" r="5.2" />
      <circle class="core" r="1.9" />
    </g>
    <FlowGlyph :name="does" :x="glyphX" :y="inside && !bare ? -4 : 0" :size="13" class="does" />
    <g v-if="!bare && words > 0" :opacity="words < 1 ? words : undefined">
      <text
        v-for="(line, n) in lines"
        :key="n"
        class="label"
        :x="textX"
        :y="(lines.length === 1 ? 4 : n * 13 - 2.5) - (inside ? 5 : 0)"
      >
        {{ line }}
      </text>
      <text v-if="calls" class="calls mono" x="8" :y="h / 2 + 13">↳ {{ calls }}</text>
    </g>
    <rect
      v-for="(tick, n) in ticks"
      :key="`i${n}`"
      class="tick"
      :class="{ on: tick.on, now: tick.now }"
      :x="tick.x"
      :y="h / 2 - 9"
      width="9"
      height="3"
      rx="1.5"
      :opacity="tick.now ? 0.35 + 0.65 * pulse : undefined"
    />
    <path v-for="mark in marks" :key="mark.key" class="mark" :class="mark.cls" :d="mark.d" />
    <circle v-for="(dot, n) in typing" :key="`y${n}`" class="typing" :cx="dot.x" :cy="dot.y" r="2" />
    <g v-if="verdict && stamp >= 0 && !bare" class="stamp" :class="`v-${verdict}`" :transform="stampAt.m" :opacity="stampAt.o">
      <circle v-if="thud >= 0 && thud < 1" class="thud" :r="10 + 28 * thud" :opacity="0.55 * (1 - thud)" />
      <rect :x="-stampW / 2" y="-9" :width="stampW" height="18" rx="2" />
      <FlowGlyph :name="verdict === 'pass' ? 'done' : 'fail'" :x="-stampW / 2 + 11" :size="11" />
      <text v-if="words > 0" class="mono" :x="-stampW / 2 + 20" y="4" :opacity="words < 1 ? words : undefined">
        {{ VERDICT_SAID[verdict] }}
      </text>
    </g>
  </g>
</template>
