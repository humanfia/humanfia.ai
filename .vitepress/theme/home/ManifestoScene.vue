<script setup lang="ts">
// The manifesto, told as a picture rather than a paragraph, in three acts and four captions.
//
//   1. A model, upgraded twice. On its own the work it puts out rolls off and goes nowhere.
//   2. A flow is drawn round it: a prompt goes in, a maker and a reviewer take turns on it, the
//      reviewer sends the first attempt back, and a stop condition ends the loop.
//   3. The work leaves the loop for a leaderboard that is not ours, and climbs it.
//
// The markup is the last frame, so the server-rendered page, a reader who asked for less motion
// and a reader who scrolled past all see the whole argument; the timeline (GSAP) rewinds it to
// the first frame once the page has mounted, and plays the first time the scene is on screen.
// The work is the mark's red circle, and the roles are the flow grammar's colours (`flow-ui`).
//
// The loop is drawn the same at every width; the leaderboard sits beside it, or under it on a
// phone, where the scene is taller rather than smaller so that its labels stay legible.
import { gsap } from 'gsap'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { onFirstSight, prefersReducedMotion } from './motion'

const CAPTIONS = [
  'Models improve.',
  'The flow makes the result.',
  'Somebody else keeps the score.',
  'We build the flow, in the open.',
]

// The loop, in viewBox units: the model in the middle, the maker on the left, the reviewer at
// the top, the stop condition on the right. The work goes round it clockwise.
const C = { x: 270, y: 220 }
const R = 140
const at = (deg: number) => {
  const a = (deg * Math.PI) / 180
  return { x: C.x + R * Math.cos(a), y: C.y + R * Math.sin(a) }
}
const MAKER = 180
const REVIEWER = 270
const GATE = 360
const maker = at(MAKER)
const reviewer = at(REVIEWER)
const gate = at(GATE)
const CHIP = 84

// The leaderboard, beside the loop or under it. Its rows are 42 apart; ours ends at the top.
const LAYOUTS = {
  wide: { viewBox: '0 24 720 344', board: { x: 470, y: 100, w: 240 }, exit: [gate.x + 17, gate.y, 470, 220] },
  narrow: { viewBox: '0 24 440 640', board: { x: 20, y: 430, w: 400 }, exit: [gate.x, gate.y + 17, 410, 430] },
}
const ROW = 42
const rowY = (k: number) => 64 + k * ROW
const OURS = 86.4
const THEIRS = [71.0, 64.2, 58.7]

const narrow = ref(false)
const L = computed(() => (narrow.value ? LAYOUTS.narrow : LAYOUTS.wide))
const barMax = computed(() => L.value.board.w - 104)
const bar = (v: number) => (v / 100) * barMax.value

const root = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const motion = ref(false)
let tl: gsap.core.Timeline | null = null
let mq: MediaQueryList | null = null
let seen = false

/** The timeline, from the first frame to the last. Every tween states where it starts, so the
 *  timeline can be rewound, replayed or jumped to the end from wherever it is. */
function build() {
  const q = (s: string) => root.value!.querySelectorAll<SVGElement | HTMLElement>(s)
  const one = (s: string) => q(s)[0]
  const token = one('.m-token')
  const caption = (k: number) => q('.h-manifesto-acts li')[k]
  const [ex0, ey0, ex1, ey1] = L.value.exit
  // Every origin is set once, before anything moves: an origin given to a later tween makes
  // GSAP shift the element to keep it where it was, and the heads would drift off the loop.
  gsap.set([one('.m-chip'), ...q('.m-pulse')], { svgOrigin: `${C.x} ${C.y}` })
  gsap.set(one('.m-maker'), { svgOrigin: `${maker.x} ${maker.y}` })
  gsap.set(one('.m-reviewer'), { svgOrigin: `${reviewer.x} ${reviewer.y}` })
  gsap.set(one('.m-gate'), { svgOrigin: `${gate.x} ${gate.y}` })
  gsap.set(one('.m-bar-ours'), { transformOrigin: '0% 50%' })
  const t = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } })

  // ---- 1. a model, upgraded, going nowhere
  const chip = one('.m-chip')
  const versions = q('.m-ver')
  t.fromTo(caption(0), { opacity: 0.16 }, { opacity: 1, duration: 0.5 }, 0)
  t.fromTo(chip, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }, 0.1)
  t.fromTo(versions, { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0)
  t.set(versions[0], { opacity: 1 }, 0.35)
  q('.m-pulse').forEach((pulse, k) => {
    const when = 0.95 + k * 0.6
    t.set(versions[k], { opacity: 0 }, when)
    t.set(versions[k + 1], { opacity: 1 }, when)
    t.fromTo(chip, { scale: 1 }, { scale: 1.1, duration: 0.14, ease: 'power2.out', yoyo: true, repeat: 1, immediateRender: false }, when)
    t.fromTo(
      pulse,
      { opacity: 0.9, scale: 1 },
      { opacity: 0, scale: 1.7, duration: 0.7, ease: 'power2.out', immediateRender: false },
      when,
    )
  })
  // The work rolls off the model and drops: there is nothing to take it anywhere.
  t.fromTo(token, { opacity: 0, attr: { cx: C.x + CHIP / 2, cy: C.y } }, { opacity: 1, duration: 0.15 }, 2.25)
  t.to(token, { attr: { cx: C.x + CHIP / 2 + 70 }, duration: 0.5, ease: 'power1.out' }, 2.25)
  t.to(token, { attr: { cy: C.y + 70 }, opacity: 0, duration: 0.45, ease: 'power2.in' }, 2.7)

  // ---- 2. the flow round it
  t.fromTo(caption(1), { opacity: 0.16 }, { opacity: 1, duration: 0.5 }, 3.2)
  t.fromTo(one('.m-loop'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9 }, 3.2)
  t.fromTo(q('.m-head'), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)', stagger: 0.15 }, 3.5)
  t.fromTo(q('.m-spoke'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 3.8)
  t.fromTo(one('.m-prompt'), { opacity: 0, x: -36 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 4.0)

  const turn = { a: MAKER }
  const place = () => {
    const p = at(turn.a)
    token.setAttribute('cx', `${p.x}`)
    token.setAttribute('cy', `${p.y}`)
  }
  const go = (from: number, to: number, when: number, duration = 0.6) =>
    t.fromTo(turn, { a: from }, { a: to, duration, onUpdate: place, immediateRender: false }, when)
  const nudge = (s: string, when: number) =>
    t.fromTo(one(s), { scale: 1 }, { scale: 1.2, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, when)
  const verdicts = q('.m-verdict')

  t.set(token, { opacity: 1, attr: { cx: maker.x, cy: maker.y } }, 4.45)
  nudge('.m-maker', 4.45)
  go(MAKER, REVIEWER, 4.6)
  nudge('.m-reviewer', 5.2)
  t.fromTo(verdicts, { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0)
  t.set(verdicts[0], { opacity: 1 }, 5.2) // sent back
  go(REVIEWER, MAKER, 5.5)
  t.set(verdicts[0], { opacity: 0 }, 6.0)
  nudge('.m-maker', 6.1)
  go(MAKER, REVIEWER, 6.25)
  nudge('.m-reviewer', 6.85)
  t.set(verdicts[1], { opacity: 1 }, 6.85) // passed
  go(REVIEWER, GATE, 7.0, 0.55)
  t.fromTo(one('.m-gate-fill'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 7.55)
  nudge('.m-gate', 7.55)

  // ---- 3. out of the loop and up somebody else's board
  t.fromTo(caption(2), { opacity: 0.16 }, { opacity: 1, duration: 0.5 }, 7.75)
  t.fromTo(one('.m-exit'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.35, ease: 'none' }, 7.75)
  t.fromTo(token, { attr: { cx: ex0, cy: ey0 } }, { attr: { cx: ex1, cy: ey1 }, duration: 0.35, ease: 'power1.in', immediateRender: false }, 7.75)
  t.to(token, { opacity: 0, duration: 0.15 }, 8.1)
  t.fromTo(one('.m-board-flash'), { opacity: 0 }, { opacity: 1, duration: 0.15, yoyo: true, repeat: 1 }, 8.1)

  const ours = one('.m-row-ours')
  t.fromTo(ours, { y: 3 * ROW }, { y: 0, duration: 0.9, ease: 'power3.inOut' }, 8.3)
  t.fromTo(q('.m-row-theirs'), { y: -ROW }, { y: 0, duration: 0.9, ease: 'power3.inOut' }, 8.3)
  t.fromTo(one('.m-bar-ours'), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power2.out' }, 8.2)
  const score = one('.m-score-ours')
  const n = { v: 0 }
  t.fromTo(
    n,
    { v: 0 },
    { v: OURS, duration: 1.1, ease: 'power2.out', onUpdate: () => void (score.textContent = n.v < 0.05 ? '—' : n.v.toFixed(1)) },
    8.2,
  )

  t.fromTo(caption(3), { opacity: 0.16 }, { opacity: 1, duration: 0.6 }, 9.4)
  return t
}

function replay() {
  tl?.restart()
}

/** The phone layout changes where the leaderboard is, so the timeline is built again for it --
 *  at the end if it had already played, at the start if it had not. */
async function relayout() {
  narrow.value = !!mq?.matches
  if (!motion.value) return
  const played = tl ? tl.progress() > 0 : false
  tl?.kill()
  await nextTick()
  tl = build()
  if (played) tl.progress(1)
}

onMounted(async () => {
  mq = matchMedia('(max-width: 640px)')
  narrow.value = mq.matches
  mq.addEventListener('change', relayout)
  if (prefersReducedMotion()) return
  motion.value = true
  await nextTick()
  tl = build()
  if (seen) tl.play()
})

onFirstSight(
  stage,
  () => {
    seen = true
    tl?.play()
  },
  // a third of the stage, which even a phone on its side can show
  0.3,
)

onBeforeUnmount(() => {
  mq?.removeEventListener('change', relayout)
  tl?.kill()
})
</script>

<template>
  <section ref="root" class="h-manifesto" :class="{ 'is-narrow': narrow }" aria-label="Why Humanfia">
    <div class="h-wrap h-manifesto-grid">
      <div class="h-manifesto-copy">
        <ol class="h-manifesto-acts">
          <li v-for="(c, k) in CAPTIONS" :key="c" :class="{ last: k === CAPTIONS.length - 1 }">{{ c }}</li>
        </ol>
        <button v-if="motion" class="h-manifesto-replay" type="button" @click="replay">
          <span aria-hidden="true">↻</span> Replay
        </button>
      </div>

      <div ref="stage" class="h-manifesto-stage">
        <svg class="h-manifesto-svg flow-ui" :viewBox="L.viewBox" aria-hidden="true">
          <!-- the loop, its spokes to the model, and the way out -->
          <circle class="m-loop" :cx="C.x" :cy="C.y" :r="R" pathLength="1" />
          <line class="m-spoke" :x1="C.x - CHIP / 2" :y1="C.y" :x2="maker.x + 22" :y2="maker.y" />
          <line class="m-spoke" :x1="C.x" :y1="C.y - CHIP / 2" :x2="reviewer.x" :y2="reviewer.y + 22" />
          <line class="m-exit" :x1="L.exit[0]" :y1="L.exit[1]" :x2="L.exit[2]" :y2="L.exit[3]" pathLength="1" />

          <!-- the model -->
          <rect class="m-pulse" v-for="n in 2" :key="n" :x="C.x - CHIP / 2" :y="C.y - CHIP / 2" :width="CHIP" :height="CHIP" />
          <g class="m-chip">
            <rect class="m-chip-plate" :x="C.x - CHIP / 2" :y="C.y - CHIP / 2" :width="CHIP" :height="CHIP" />
            <text v-for="v in 3" :key="v" class="m-ver" :x="C.x" :y="C.y + 11" :style="v < 3 ? 'opacity: 0' : undefined">v{{ v }}</text>
            <text class="m-label" :x="C.x" :y="C.y + CHIP / 2 + 22">model</text>
          </g>

          <!-- what it is asked -->
          <g class="m-prompt">
            <rect class="m-card" x="0" :y="maker.y - 18" width="78" height="36" />
            <text class="m-card-text" x="39" :y="maker.y + 5">prompt</text>
            <line class="m-arrow" x1="78" :y1="maker.y" :x2="maker.x - 26" :y2="maker.y" />
          </g>

          <!-- who goes next, who checks, when it stops -->
          <g class="m-head m-maker k-maker">
            <circle :cx="maker.x" :cy="maker.y" r="22" />
            <text class="m-label" :x="maker.x" :y="maker.y + 46">maker</text>
          </g>
          <g class="m-head m-reviewer k-checker">
            <circle :cx="reviewer.x" :cy="reviewer.y" r="22" />
            <text class="m-verdict no" :x="reviewer.x" :y="reviewer.y + 7" style="opacity: 0">✕</text>
            <text class="m-verdict" :x="reviewer.x" :y="reviewer.y + 7">✓</text>
            <text class="m-label" :x="reviewer.x" :y="reviewer.y - 34">reviewer</text>
          </g>
          <g class="m-head m-gate">
            <rect class="m-gate-edge" :x="gate.x - 17" :y="gate.y - 17" width="34" height="34" />
            <rect class="m-gate-fill" :x="gate.x - 10" :y="gate.y - 10" width="20" height="20" />
            <text class="m-label" :x="gate.x" :y="gate.y + 46">stop</text>
          </g>

          <!-- somebody else's leaderboard -->
          <g :transform="`translate(${L.board.x} ${L.board.y})`">
            <rect class="m-board-frame" x="0" y="0" :width="L.board.w" :height="rowY(3) + 26" />
            <rect class="m-board-flash" x="0" y="0" :width="L.board.w" :height="rowY(3) + 26" style="opacity: 0" />
            <text class="m-board-title" x="14" y="26">leaderboard</text>
            <line class="m-board-rule" x1="0" y1="38" :x2="L.board.w" y2="38" />
            <text v-for="k in 4" :key="k" class="m-rank" x="14" :y="rowY(k - 1) + 5">{{ k }}</text>
            <g v-for="(v, k) in THEIRS" :key="v" :transform="`translate(0 ${rowY(k + 1)})`">
              <g class="m-row-theirs">
                <rect class="m-bar" x="36" y="-6" :width="bar(v)" height="12" />
                <text class="m-score" :x="L.board.w - 14" y="5">{{ v.toFixed(1) }}</text>
              </g>
            </g>
            <g :transform="`translate(0 ${rowY(0)})`">
              <g class="m-row-ours">
                <rect class="m-bar m-bar-ours" x="36" y="-6" :width="bar(OURS)" height="12" />
                <text class="m-score m-score-ours" :x="L.board.w - 14" y="5">{{ OURS.toFixed(1) }}</text>
              </g>
            </g>
          </g>

          <!-- the work -->
          <circle class="m-token" :cx="gate.x" :cy="gate.y" r="8" style="opacity: 0" />
        </svg>
      </div>
    </div>
  </section>
</template>
