<script setup lang="ts">
// The hero: a proof, being checked. On the left, the project; on the right, an editor plate
// with a small Lean 4 theorem and, under it, its proof tree in natural-deduction form -- the
// goal at the bottom, each tactic a rule, each branch closed by a red tombstone. As the tactics
// are applied the line in the source lights up, the rule draws, the subgoals appear above it and
// the goal count falls, until there are none and the kernel accepts the file.
//
// The proof is real (sum of the first n odd numbers is n², by induction; it checks against
// current Mathlib), and small enough to read whole: an illustration of the kind of object HOA
// produces, not one of its results.
//
// The markup is the last frame, so the server, a reader who asked for less motion, and a reader
// who has already scrolled past all get the finished, checked proof. The timeline (GSAP) rewinds
// it on mount and plays once, when the plate is first on screen; the button plays it again.
//
// Under it, a strip of HOA's headline numbers, read off the news: the newest `achievement:` of
// each of HOA's topics (achievements.data.mts), so a new write-up moves the strip by itself.
import { gsap } from 'gsap'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { data as achievements } from '../../../achievements.data.mts'
import { onFirstSight, prefersReducedMotion } from '../../../home/motion'
import NumberTicker from '../../kit/NumberTicker.vue'

defineProps<{ links: { text: string; href: string }[] }>()

/** HOA's topics on the news, in the order the page tells them. */
const TOPICS = ['PutnamBench', 'IMO 2026', 'Lean-Eval', 'Science olympiads']
const stats = computed(() =>
  TOPICS.map((topic) => achievements.find((a) => a.topic.toLowerCase() === topic.toLowerCase())).filter(
    (a): a is (typeof achievements)[number] => !!a,
  ),
)

// The source, one line per entry, as [text, kind] runs. Which line each step of the proof lights
// is set by the timeline in `build`.
type Run = [string, ('kw' | 'tac' | 'id' | 'op' | '')?]
const SOURCE: Run[][] = [
  [['theorem', 'kw'], [' sum_odd', 'id'], [' (n : ℕ) :']],
  [['    ∑ i ∈ Finset.range n, (2 * i + 1)']],
  [['      = n ^ 2 '], [':=', 'op'], [' by', 'kw']],
  [['  '], ['induction', 'tac'], [' n '], ['with', 'kw']],
  [['  | zero '], ['=>', 'op'], [' simp', 'tac']],
  [['  | succ k ih '], ['=>', 'op']],
  [['    '], ['rw', 'tac'], [' [Finset.sum_range_succ, ih]']],
  [['    '], ['ring', 'tac']],
]

/** The line lit in the source, and the open goals; -1 and 0 are the finished proof. */
const line = ref(-1)
const goals = ref(0)
const playing = ref(false)

const root = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

let tl: gsap.core.Timeline | null = null

/** Rewind the plate to an empty file and build the timeline that checks it, paused. */
function build() {
  ctx?.revert()
  ctx = gsap.context(() => {
    const q = (s: string) => root.value!.querySelectorAll(s)
    const at = (k: number, n: number) => () => {
      line.value = k
      goals.value = n
    }
    const draw = (name: string) => [q(`[data-bar="${name}"]`), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power3.out' }] as const
    const show = (sel: string, y = 8) => [q(sel), { autoAlpha: 0, y }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' }] as const
    const pop = (sel: string) => [q(sel), { scale: 0 }, { scale: 1, duration: 0.45, ease: 'back.out(3)' }] as const

    at(0, 0)()
    gsap.set(q('.lp-line, .lp-tree [data-k], .lp-done, .lp-stamp'), { autoAlpha: 0 })
    gsap.set(q('[data-bar]'), { scaleX: 0 })
    gsap.set(q('.lp-leaf'), { scale: 0 })

    tl = gsap.timeline({ paused: true, onStart: () => (playing.value = true), onComplete: () => (playing.value = false) })
    tl.fromTo(q('.lp-line'), { autoAlpha: 0, x: -6 }, { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.06 }, 0)
      // The statement is the goal.
      .call(at(1, 1), [], 0.55)
      .fromTo(...show('[data-k="root"]'), 0.6)
      // induction n: two cases.
      .call(at(3, 2), [], 1.3)
      .fromTo(...draw('root'), 1.35)
      .fromTo(...show('[data-r="root"]', 0), 1.5)
      .fromTo(...show('[data-k="zero"], [data-k="succ"]'), 1.6)
      // zero => simp: closed.
      .call(at(4, 1), [], 2.4)
      .fromTo(...draw('zero'), 2.45)
      .fromTo(...show('[data-r="zero"]', 0), 2.55)
      .fromTo(...pop('[data-leaf="zero"]'), 2.7)
      // succ: rw [sum_range_succ, ih] leaves an equation of polynomials.
      .call(at(6, 1), [], 3.3)
      .fromTo(...draw('succ'), 3.35)
      .fromTo(...show('[data-r="succ"]', 0), 3.45)
      .fromTo(...show('[data-k="eq"]'), 3.55)
      // ring: closed.
      .call(at(7, 0), [], 4.3)
      .fromTo(...draw('eq'), 4.35)
      .fromTo(...show('[data-r="eq"]', 0), 4.45)
      .fromTo(...pop('[data-leaf="eq"]'), 4.6)
      // No goals: the kernel has the last word.
      .call(at(-1, 0), [], 5.2)
      .fromTo(...show('.lp-done', 0), 5.2)
      .fromTo(q('.lp-stamp'), { autoAlpha: 0, scale: 0.4, rotate: -24 }, { autoAlpha: 1, scale: 1, rotate: -8, duration: 0.6, ease: 'back.out(2.2)' }, 5.35)
  }, root.value!)
}

function replay() {
  if (prefersReducedMotion() || !root.value) return
  build()
  tl?.play()
}

// Rewound on mount, played the first time the plate is on screen -- at once on a wide screen,
// and on a phone only once the reader has scrolled down to it.
onMounted(() => {
  if (!prefersReducedMotion()) build()
})
onFirstSight(root, () => tl?.play(), 0.3)
onBeforeUnmount(() => ctx?.revert())

const external = (href: string) => /^https?:/.test(href)
</script>

<template>
  <header class="hoa-hero">
    <div class="hh-grid">
      <div class="hh-copy">
        <p class="hoa-kicker hh-in" style="--d: 0.05s">Project · Open source · Apache-2.0 and CC-BY-4.0</p>
        <h1 class="hh-title hh-in" style="--d: 0.15s">
          <span class="hh-mark">HOA</span>
          <span class="hh-sub">Humanfia Olympiad Agents</span>
        </h1>
        <p class="hh-lead hh-in" style="--d: 0.3s">
          Olympiad and research mathematics, solved by agents and checked by Lean&nbsp;4. Then
          physics, chemistry, biology, programming and quantum information.
        </p>
        <p class="hh-rule hh-in" style="--d: 0.4s">
          No rubric. No benefit of the doubt. The kernel accepts the proof or it does not.
        </p>
        <ul class="hh-links hh-in" style="--d: 0.5s">
          <li v-for="link in links" :key="link.href">
            <a
              :href="link.href"
              :target="external(link.href) ? '_blank' : undefined"
              :rel="external(link.href) ? 'noreferrer' : undefined"
            >{{ link.text }}<span aria-hidden="true">{{ external(link.href) ? ' ↗' : ' →' }}</span></a>
          </li>
        </ul>
      </div>

      <figure ref="root" class="lp hh-in" style="--d: 0.25s" aria-label="A small Lean 4 proof, checked: the sum of the first n odd numbers is n squared, by induction. The proof tree closes both cases and Lean reports no goals.">
        <div class="lp-bar">
          <span class="lp-dots" aria-hidden="true"><i /><i /><i /></span>
          <span class="lp-file">SumOdd.lean</span>
          <span class="lp-goals" aria-live="off">
            <template v-if="goals">{{ goals }} goal{{ goals === 1 ? '' : 's' }}</template>
            <template v-else-if="line === 0">elaborating…</template>
            <template v-else><b>✓</b> no goals</template>
          </span>
        </div>

        <div class="lp-src" aria-hidden="true">
          <span v-for="(runs, i) in SOURCE" :key="i" class="lp-line" :class="{ on: line === i }">
            <span class="lp-no">{{ i + 1 }}</span>
            <span v-for="([text, kind], j) in runs" :key="j" :class="kind">{{ text }}</span>
          </span>
        </div>

        <div class="lp-tree" aria-hidden="true">
          <div class="inf">
            <div class="prem">
              <div class="inf" data-k="zero">
                <div class="prem"><i class="lp-leaf" data-leaf="zero" /></div>
                <div class="bar"><i data-bar="zero" /><span class="rule" data-r="zero" :class="{ on: line === 4 }">simp</span></div>
                <div class="concl"><b>⊢</b><var>P</var> 0</div>
              </div>
              <div class="inf" data-k="succ">
                <div class="prem">
                  <div class="inf" data-k="eq">
                    <div class="prem"><i class="lp-leaf" data-leaf="eq" /></div>
                    <div class="bar"><i data-bar="eq" /><span class="rule" data-r="eq" :class="{ on: line === 7 }">ring</span></div>
                    <div class="concl"><b>⊢</b><var>k</var>² + (2<var>k</var> + 1) = (<var>k</var> + 1)²</div>
                  </div>
                </div>
                <div class="bar"><i data-bar="succ" /><span class="rule" data-r="succ" :class="{ on: line === 6 }">rw</span></div>
                <div class="concl"><var>P k</var><b>⊢</b><var>P</var> (<var>k</var> + 1)</div>
              </div>
            </div>
            <div class="bar"><i data-bar="root" /><span class="rule" data-r="root" :class="{ on: line === 3 }">induction</span></div>
            <div class="concl" data-k="root"><b>⊢</b><var>P n</var></div>
          </div>
          <p class="lp-where"><var>P n</var> &nbsp;≔&nbsp; ∑<sub><var>i</var>&lt;<var>n</var></sub> (2<var>i</var> + 1) = <var>n</var>²</p>
        </div>

        <figcaption class="lp-foot">
          <span class="lp-done"><i class="lp-sq" aria-hidden="true" /> Accepted by the kernel</span>
          <button type="button" class="lp-replay" :disabled="playing" @click="replay">Check it again ↻</button>
        </figcaption>
        <span class="lp-stamp" aria-hidden="true">Q.E.D.</span>
      </figure>
    </div>

    <ul v-if="stats.length" class="hh-stats" :style="{ '--n': stats.length }">
      <li v-for="(s, i) in stats" :key="s.topic" class="hh-in" :style="{ '--d': `${0.55 + i * 0.08}s` }">
        <a :href="s.url" class="hh-stat">
          <span class="hh-stat-k">{{ s.topic }}</span>
          <strong class="hh-stat-v">
            <NumberTicker
              :value="s.value"
              :from="s.from ?? 0"
              :decimals="s.decimals ?? 0"
              :prefix="s.prefix ?? ''"
              :suffix="s.suffix ?? ''"
              :duration="1500"
              :delay="500 + i * 120"
            />
          </strong>
          <span class="hh-stat-t">{{ s.body ?? s.label }}</span>
          <span class="hh-stat-more" aria-hidden="true">The write-up →</span>
        </a>
      </li>
    </ul>
  </header>
</template>

<style scoped>
.hoa-hero {
  position: relative;
  /* The theme already clears the nav (VPContent's padding, or the nav in the flow on a phone). */
  padding: clamp(32px, 6vw, 80px) var(--k-pad) 0;
  max-width: var(--k-max);
  margin: 0 auto;
}

/* Squared paper behind the hero, cut off with a hard edge rather than faded. */
.hoa-hero::before {
  content: '';
  position: absolute;
  inset: 0 calc(50% - 50vw) auto;
  height: min(100%, 860px);
  z-index: 0;
  background-image:
    linear-gradient(to right, var(--k-rule) 1px, transparent 1px),
    linear-gradient(to bottom, var(--k-rule) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
}

.hh-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.02fr);
  gap: clamp(32px, 5vw, 72px);
  align-items: center;
}

.hh-title {
  display: flex;
  flex-direction: column;
  margin: 18px 0 0;
  padding: 0;
  border: 0;
  line-height: 1;
}

.hh-mark {
  font-size: clamp(96px, 15vw, 212px);
  font-weight: 850;
  line-height: 0.8;
  letter-spacing: -0.075em;
  margin-left: -0.04em;
  color: var(--k-ink);
}

.hh-sub {
  margin-top: 18px;
  font-family: var(--k-serif);
  font-style: italic;
  font-size: clamp(22px, 2.4vw, 32px);
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--k-ink);
}

.hh-lead {
  margin: 26px 0 0;
  max-width: 520px;
  font-size: clamp(17px, 1.5vw, 19.5px);
  line-height: 1.55;
  color: var(--k-ink-2);
  text-wrap: pretty;
}

.hh-rule {
  margin: 18px 0 0;
  max-width: 520px;
  padding-left: 14px;
  border-left: 3px solid var(--k-red);
  font-size: 15px;
  font-weight: 650;
  line-height: 1.5;
  color: var(--k-ink);
}

.hh-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 12px;
  margin: 30px 0 0;
  padding: 0;
  list-style: none;
}

.hh-links a {
  display: inline-block;
  padding: 9px 14px;
  border: 1px solid var(--k-ink);
  background: var(--k-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  font-weight: 650;
  color: var(--k-ink);
  text-decoration: none;
  box-shadow: 3px 3px 0 var(--k-ink);
  transition: box-shadow 0.2s, transform 0.2s, color 0.2s;
}
.hh-links li:first-child a {
  background: var(--k-ink);
  color: var(--k-bg);
}
.hh-links a:hover {
  color: var(--k-accent);
  box-shadow: 3px 3px 0 var(--k-red);
  transform: translate(-1px, -1px);
}
.hh-links li:first-child a:hover {
  color: var(--k-bg);
}

/* ---- The editor plate ------------------------------------------------------------------ */

.lp {
  position: relative;
  margin: 0;
  color: var(--k-plate-ink);
  background: var(--k-plate);
  border: 1px solid var(--k-plate-line);
  box-shadow: 10px 10px 0 var(--k-red);
}

.lp-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--k-plate-line);
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  color: var(--k-plate-3);
}
.lp-dots {
  display: flex;
  gap: 6px;
}
.lp-dots i {
  width: 9px;
  height: 9px;
  border: 1px solid var(--k-plate-3);
}
.lp-file {
  color: var(--k-plate-2);
}
.lp-goals {
  margin-left: auto;
  min-width: 9ch;
  text-align: right;
  font-weight: 650;
  color: var(--k-plate-ink);
  font-variant-numeric: tabular-nums;
}
.lp-goals b {
  color: var(--k-plate-red);
}

.lp-src {
  display: block;
  margin: 0;
  padding: 14px 0;
  font-family: var(--vp-font-family-mono);
  font-size: clamp(11px, 1vw, 13px);
  line-height: 1.75;
  overflow-x: auto;
  color: var(--k-plate-2);
  background: transparent;
}
.lp-line {
  display: block;
  padding: 0 16px 0 0;
  border-left: 3px solid transparent;
  transition: background-color 0.25s, border-color 0.25s;
  white-space: pre;
}
.lp-line.on {
  background: color-mix(in srgb, var(--k-plate-red) 14%, transparent);
  border-left-color: var(--k-plate-red);
}
.lp-no {
  display: inline-block;
  width: 3.2ch;
  margin-right: 1.4ch;
  text-align: right;
  color: color-mix(in srgb, var(--k-plate-3) 70%, transparent);
  user-select: none;
}
.lp-src .kw {
  color: var(--k-plate-ink);
  font-weight: 700;
}
.lp-src .tac {
  color: var(--k-plate-red);
  font-weight: 650;
}
.lp-src .id {
  color: var(--k-plate-ink);
}
.lp-src .op {
  color: var(--k-plate-3);
}

/* The proof tree, in natural deduction: premises over a rule, the conclusion under it. */
.lp-tree {
  padding: 22px 16px 14px;
  border-top: 1px dashed var(--k-plate-line);
  font-family: var(--k-math);
  font-size: clamp(13px, 1.25vw, 16px);
  overflow-x: auto;
}
.lp-tree > .inf {
  margin: 0 auto;
  display: flex;
  width: max-content;
  padding-right: 64px;
  padding-left: 12px;
}
.inf {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}
.prem {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  /* Room for the rule name that hangs off the right of the premise on the left. */
  gap: 4.2em;
  min-height: 1.2em;
}
.bar {
  position: relative;
  align-self: stretch;
  height: 1.5px;
  margin: 5px -6px;
}
.bar > i {
  position: absolute;
  inset: 0;
  background: var(--k-plate-ink);
}
.rule {
  position: absolute;
  left: calc(100% + 7px);
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--vp-font-family-mono);
  font-size: max(11px, 0.68em);
  font-weight: 650;
  color: var(--k-plate-3);
  white-space: nowrap;
  transition: color 0.25s;
}
.rule.on {
  color: var(--k-plate-red);
}
.concl {
  white-space: nowrap;
  padding: 0 2px;
  color: var(--k-plate-ink);
}
.concl var,
.lp-where var {
  font-style: italic;
}
.concl b {
  margin: 0 0.4em;
  font-weight: 400;
}
.concl b:first-child {
  margin-left: 0;
}
.lp-leaf {
  display: block;
  width: 0.7em;
  height: 0.7em;
  margin-bottom: 1px;
  background: var(--k-plate-red);
}
.lp-where sub {
  font-size: max(11px, 0.7em);
}
.lp-where {
  margin: 18px 0 0;
  text-align: center;
  font-size: 0.86em;
  color: var(--k-plate-3);
}

.lp-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-top: 1px solid var(--k-plate-line);
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
}
.lp-done {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 650;
  color: var(--k-plate-ink);
}
.lp-sq {
  width: 10px;
  height: 10px;
  background: var(--k-plate-red);
}
.lp-replay {
  font: inherit;
  color: var(--k-plate-3);
  transition: color 0.2s, opacity 0.2s;
}
.lp-replay:hover {
  color: var(--k-plate-ink);
}
.lp-replay:disabled {
  opacity: 0.35;
  cursor: default;
}

/* The stamp: the red seal a checked proof earns, set at an angle off the plate's corner. */
.lp-stamp {
  position: absolute;
  right: -16px;
  bottom: 64px;
  padding: 8px 12px;
  background: var(--k-red);
  color: #fff;
  font-family: var(--k-serif);
  font-style: italic;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.04em;
  transform: rotate(-8deg);
  box-shadow: 3px 3px 0 var(--k-ink);
}

/* ---- The headline strip ------------------------------------------------------------- */

.hh-stats {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
  margin: clamp(48px, 7vw, 88px) 0 0;
  padding: 0;
  list-style: none;
  border-top: 2px solid var(--k-ink);
  border-bottom: 1px solid var(--k-line);
  background: var(--k-bg);
}
.hh-stats li {
  margin: 0;
}
.hh-stats li + li {
  border-left: 1px solid var(--k-line);
}
.hh-stat {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  padding: 18px 20px 20px;
  color: inherit !important;
  text-decoration: none !important;
  transition: background-color 0.25s;
}
.hh-stat:hover {
  background: var(--k-bg-alt);
}
.hh-stat-k {
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--k-ink-3);
}
.hh-stat-v {
  font-size: clamp(36px, 4vw, 56px);
  font-weight: 850;
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--k-ink);
}
.hh-stats li:first-child .hh-stat-v {
  color: var(--k-accent);
}
.hh-stat-t {
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--k-ink-2);
}
.hh-stat-more {
  margin-top: auto;
  padding-top: 4px;
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  font-weight: 650;
  color: var(--k-accent);
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.25s, transform 0.25s;
}
.hh-stat:hover .hh-stat-more,
.hh-stat:focus-visible .hh-stat-more {
  opacity: 1;
  transform: none;
}

/* The load-in: CSS, so it runs before hydration and needs no script to undo. */
.hh-in {
  animation: hh-rise 0.9s var(--d, 0s) var(--k-ease) both;
}
@keyframes hh-rise {
  from {
    opacity: 0;
    transform: translate3d(0, 24px, 0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .hh-in {
    animation: none;
  }
}

@media (max-width: 1000px) {
  .hh-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .lp {
    margin-right: 10px;
  }
  .hh-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .hh-stats li + li {
    border-left: 0;
  }
  .hh-stats li:nth-child(even) {
    border-left: 1px solid var(--k-line);
  }
  .hh-stats li:nth-child(n + 3) {
    border-top: 1px solid var(--k-line);
  }
}

@media (max-width: 520px) {
  .lp-stamp {
    right: -6px;
    font-size: 15px;
  }
  .lp-tree > .inf {
    padding-right: 52px;
    padding-left: 0;
  }
  .hh-stat {
    padding: 14px 14px 16px;
  }
  .hh-stat-more {
    opacity: 1;
    transform: none;
  }
}
</style>
