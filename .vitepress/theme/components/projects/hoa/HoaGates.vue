<script setup lang="ts">
// What counts as solved, as a machine the reader can feed. Five gates stand between a Lean file
// and the count, in the order PutnamBench runs them, each kept by something other than the
// worker. Pick a file and it goes through: each gate checks, passes or refuses, and a refused
// file stops where it was refused. Only a file that passes all five is counted.
//
// The server renders the honest proof, through and counted. With motion allowed, the figure
// plays that proof the first time it is on screen, and every file the reader picks after.
import { onBeforeUnmount, ref } from 'vue'
import { onFirstSight, prefersReducedMotion } from '../../../home/motion'

const GATES = [
  { name: 'Statement', rule: 'Byte-identical to the pinned benchmark statement.' },
  { name: 'No sorry', rule: 'No sorry, admit, axiom or native_decide anywhere in the file.' },
  { name: 'Compiles', rule: 'Against the pinned Lean 4.27.0 and Mathlib.' },
  { name: 'Comparator', rule: 'Checks the statement and replays the proof through the Lean kernel.' },
  { name: 'AXLE review', rule: 'A reviewer that cannot edit the file gets okay: true from AXLE.' },
]

/** `stop` is the gate that refuses the file, or 5 for none. */
const FILES = [
  { file: 'honest.lean', what: 'An honest proof', stop: 5 },
  { file: 'restated.lean', what: 'The theorem, reworded', stop: 0 },
  { file: 'sorry.lean', what: 'A sorry for one step', stop: 1 },
  { file: 'drift.lean', what: 'Builds only on another Lean', stop: 2 },
  { file: 'replay.lean', what: 'Fails the kernel replay', stop: 3 },
  { file: 'refused.lean', what: 'AXLE does not say okay', stop: 4 },
]

type State = 'idle' | 'check' | 'pass' | 'fail'
const picked = ref(0)
/** The finished state of the honest proof, which is what the server renders. */
const states = ref<State[]>(GATES.map(() => 'pass'))
const counted = ref(true)
const running = ref(false)

const STEP = 520
let timers: number[] = []
const clear = () => {
  timers.forEach(clearTimeout)
  timers = []
}

function run(k: number) {
  picked.value = k
  clear()
  const stop = FILES[k].stop
  const still = prefersReducedMotion()
  const final = GATES.map((_, g): State => (g < stop ? 'pass' : g === stop ? 'fail' : 'idle'))
  if (still) {
    states.value = final
    counted.value = stop === 5
    return
  }
  states.value = GATES.map(() => 'idle')
  counted.value = false
  running.value = true
  const last = Math.min(stop, GATES.length - 1)
  for (let g = 0; g <= last; g++) {
    timers.push(window.setTimeout(() => (states.value[g] = 'check'), g * STEP))
    timers.push(window.setTimeout(() => (states.value[g] = final[g]), g * STEP + STEP * 0.7))
  }
  timers.push(
    window.setTimeout(() => {
      counted.value = stop === 5
      running.value = false
    }, last * STEP + STEP),
  )
}

const root = ref<HTMLElement | null>(null)
/** Set by the reader's first pick, after which the figure no longer plays anything by itself. */
let touched = false
const pick = (k: number) => {
  touched = true
  run(k)
}
onFirstSight(root, () => {
  if (!touched && !prefersReducedMotion()) run(0)
})
onBeforeUnmount(clear)

const verdict = () => {
  const stop = FILES[picked.value].stop
  if (running.value) return 'Checking…'
  return stop === 5 ? 'Counted. Nothing else is.' : `Refused at gate ${stop + 1}: ${GATES[stop].name.toLowerCase()}.`
}
</script>

<template>
  <div ref="root" class="hg">
    <div class="hg-files" role="group" aria-label="Send a file through the gates">
      <button
        v-for="(f, k) in FILES"
        :key="f.file"
        type="button"
        :aria-pressed="picked === k"
        :class="{ ok: f.stop === 5 }"
        @click="pick(k)"
      >
        <span class="hg-fname">{{ f.file }}</span>
        <span class="hg-fwhat">{{ f.what }}</span>
      </button>
    </div>

    <ol class="hg-line" :class="{ done: counted }">
      <li v-for="(g, i) in GATES" :key="g.name" :class="states[i]">
        <span class="hg-n">{{ i + 1 }}</span>
        <span class="hg-mark" aria-hidden="true" />
        <strong class="hg-name">{{ g.name }}</strong>
        <span class="hg-rule">{{ g.rule }}</span>
      </li>
      <li class="hg-end" :class="{ on: counted }">
        <span class="hg-n"><i class="qed" aria-hidden="true" /></span>
        <strong class="hg-name">Counted</strong>
        <span class="hg-rule">Only now does the problem count as solved.</span>
      </li>
    </ol>

    <p class="hg-verdict" :class="{ ok: counted }" aria-live="polite">
      <span class="hg-file">{{ FILES[picked].file }}</span> {{ verdict() }}
    </p>

    <div class="hg-two">
      <div class="hg-card">
        <p class="hoa-kicker">Proof review</p>
        <p class="hg-q">Does Lean accept it?</p>
        <p>The five gates. A perfectly checked proof can still be a proof of the wrong theorem.</p>
      </div>
      <div class="hg-card">
        <p class="hoa-kicker">Semantic review</p>
        <p class="hg-q">Does the theorem say what the problem said?</p>
        <p>Counted and reported separately, so one cannot stand in for the other.</p>
      </div>
      <div class="hg-card hg-fine">
        <p class="hoa-kicker">And around the gates</p>
        <p>
          The worker's shell has no network access, and no existing PutnamBench solution is ever
          mounted into either model's workspace. The gates are the
          <a href="https://github.com/humanfia/hoa-qed#verification-method" target="_blank" rel="noreferrer">solver's verification method</a>,
          with <a href="https://github.com/leanprover/comparator" target="_blank" rel="noreferrer">Comparator</a>
          and <a href="https://axle.axiommath.ai/" target="_blank" rel="noreferrer">AXLE</a>.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hg-files {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
}
.hg-files button {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  text-align: left;
  border: 1px solid var(--k-line);
  background: var(--k-card);
  transition: border-color 0.2s, background-color 0.2s, transform 0.2s;
}
.hg-files button:hover {
  border-color: var(--k-ink);
  transform: translateY(-2px);
}
.hg-files button[aria-pressed='true'] {
  border-color: var(--k-ink);
  background: var(--k-ink);
  color: var(--k-bg);
}
.hg-fname {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 700;
}
.hg-fwhat {
  font-size: 12px;
  line-height: 1.35;
  opacity: 0.75;
}

/* The gates: five posts on one line, the counted block at the end of it. */
.hg-line {
  position: relative;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin: 26px 0 0;
  padding: 0;
  list-style: none;
  border-top: 3px solid var(--k-ink);
}
.hg-line li {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 16px 14px 18px;
  border-right: 1px solid var(--k-line);
  background: var(--k-card);
  transition: background-color 0.3s, color 0.3s;
}
.hg-n {
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--k-ink-3);
}
.hg-name {
  font-size: 16px;
  font-weight: 750;
  letter-spacing: -0.01em;
}
.hg-rule {
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--k-ink-2);
}

/* The gate's own light: a square that is hollow, scanning, red-filled or struck through. */
.hg-mark {
  position: absolute;
  top: 16px;
  right: 14px;
  width: 14px;
  height: 14px;
  border: 1.5px solid var(--k-ink-3);
  transition: background-color 0.2s, border-color 0.2s, transform 0.3s var(--k-ease);
}
.check .hg-mark {
  border-color: var(--k-ink);
  animation: hg-scan 0.45s ease-in-out infinite alternate;
}
.pass .hg-mark {
  border-color: var(--k-red);
  background: var(--k-red);
}
.fail {
  background: color-mix(in srgb, var(--k-ink) 92%, transparent) !important;
  color: var(--k-bg);
}
.fail .hg-rule,
.fail .hg-n {
  color: inherit;
  opacity: 0.8;
}
.fail .hg-mark {
  border-color: var(--k-bg);
  transform: rotate(45deg);
}
.fail .hg-mark::before,
.fail .hg-mark::after {
  content: '';
  position: absolute;
  left: 50%;
  top: -4px;
  bottom: -4px;
  width: 1.5px;
  margin-left: -0.75px;
  background: var(--k-bg);
}
.fail .hg-mark::after {
  transform: rotate(90deg);
}
.idle {
  color: var(--k-ink-3);
}
.idle .hg-rule {
  color: var(--k-ink-3);
}
@keyframes hg-scan {
  to {
    transform: scale(0.6);
  }
}

/* The progress rule along the top, one gate at a time. */
.hg-line li:not(.hg-end)::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -3px;
  height: 3px;
  background: var(--k-red);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s var(--k-ease);
}
.hg-line li.pass::before {
  transform: none;
}

.hg-end {
  border-right: 0 !important;
  transition: background-color 0.4s, color 0.4s !important;
}
.hg-end .qed {
  margin: 0;
  font-size: 18px;
}
.hg-end.on .qed {
  background: #fff;
}
.hg-end.on {
  background: var(--k-red) !important;
  color: #fff;
}
.hg-end.on .hg-n,
.hg-end.on .hg-rule {
  color: inherit;
}

.hg-verdict {
  margin: 14px 0 0;
  font-size: 16px;
  font-weight: 700;
}
.hg-verdict.ok {
  color: var(--k-accent);
}
.hg-file {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  font-weight: 650;
  color: var(--k-ink-3);
}

.hg-two {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(16px, 2.4vw, 28px);
  margin-top: clamp(28px, 4vw, 44px);
}
.hg-card {
  padding-top: 14px;
  border-top: 2px solid var(--k-ink);
}
.hg-card p {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--k-ink-2);
}
.hg-card .hoa-kicker {
  margin: 0;
  font-size: 11px;
}
.hg-q {
  font-family: var(--k-serif);
  font-style: italic;
  font-size: 21px !important;
  line-height: 1.3 !important;
  color: var(--k-ink) !important;
}
.hg-fine p:not(.hoa-kicker) {
  font-size: 13px;
}

@media (max-width: 1100px) {
  .hg-files {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 860px) {
  .hg-line {
    grid-template-columns: minmax(0, 1fr);
    border-top: 0;
    border-left: 3px solid var(--k-ink);
  }
  .hg-line li {
    display: grid;
    grid-template-columns: 1.6em minmax(0, 1fr);
    gap: 2px 10px;
    padding: 12px 40px 12px 12px;
    border-right: 0;
    border-bottom: 1px solid var(--k-line);
  }
  .hg-n {
    grid-row: span 2;
    padding-top: 3px;
  }
  .hg-line li:not(.hg-end)::before {
    left: -3px;
    right: auto;
    top: 0;
    bottom: 0;
    width: 3px;
    height: auto;
    transform: scaleY(0);
    transform-origin: top;
  }
  .hg-line li.pass::before {
    transform: none;
  }
  .hg-mark {
    top: 50%;
    margin-top: -7px;
  }
  .hg-two {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 520px) {
  .hg-files {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
