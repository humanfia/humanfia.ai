<script setup lang="ts">
// How it works: the four rules as four numbers, what crosses a handoff and what does not, and the
// two effects the repository credits, the first of them drawn.
//
// The curve is a schematic and is labelled as one: one long session flattening, against the same
// hours cut into fresh sessions, each restarting from where the workspace was left. It draws
// itself the first time it is on screen; the toggle swaps which line is in front.
import { ref } from 'vue'
import { vReveal } from '../../../home/motion'

const RULES = [
  {
    big: '≤ 5',
    unit: 'accepted',
    title: 'A turn has a cap',
    body: 'The first agent works in its own native harness, with its own tools and loop, until five accepted submissions, or until it stops by itself.',
  },
  {
    big: 'New',
    unit: 'session',
    title: 'Every turn starts fresh',
    body: 'The other agent opens a fresh session in the same workspace. The code, models, results and candidates carry over. The context does not.',
  },
  {
    big: '6',
    unit: 'hours',
    title: 'One budget, shared',
    body: 'The two keep alternating inside one six-hour budget per task, the same budget each of them gets alone.',
  },
  {
    big: '15',
    unit: 'minutes',
    title: 'A review picks',
    body: 'The last fifteen minutes pick one candidate that was already accepted. Neither agent ever sees a private test score.',
  },
]

const KEPT = ['Code', 'Models', 'Evaluated results', 'Candidates']
const DROPPED = ["The last agent's context", 'Any private test score']

// The schematic: one long concave climb, and five shorter ones, each steep again at its start.
const W = 600
const H = 220
function long() {
  const pts: string[] = []
  for (let i = 0; i <= 60; i++) {
    const u = i / 60
    pts.push(`${(u * W).toFixed(1)},${(H - 18 - (1 - Math.exp(-u * 3.2)) * 120).toFixed(1)}`)
  }
  return `M${pts.join(' L')}`
}
function relay() {
  const cuts = [0, 0.22, 0.43, 0.6, 0.79, 1]
  let base = 0
  const segs: { d: string; agent: number }[] = []
  for (let s = 0; s < cuts.length - 1; s++) {
    const pts: string[] = []
    const a = cuts[s]
    const b = cuts[s + 1]
    const gainHere = 52 - s * 6
    for (let i = 0; i <= 16; i++) {
      const u = i / 16
      const y = base + (1 - Math.exp(-u * 3)) * gainHere
      pts.push(`${((a + (b - a) * u) * W).toFixed(1)},${(H - 18 - y).toFixed(1)}`)
    }
    base += (1 - Math.exp(-3)) * gainHere
    segs.push({ d: `M${pts.join(' L')}`, agent: s % 2 })
  }
  return { segs, cuts }
}
const LONG = long()
const RELAY = relay()
const front = ref<'relay' | 'long'>('relay')
</script>

<template>
  <section id="how-it-works" class="hma-section" aria-labelledby="how-it-works-h">
    <div class="hma-wrap">
      <div class="hma-section-head" v-reveal>
        <p class="hma-kicker"><span class="hma-num">01</span> The method</p>
        <h2 id="how-it-works-h" class="hma-h2">How it works</h2>
        <p class="hma-lead">
          A long-running agent improves more and more slowly, and the harness built round one model
          matters less as the model gets better. So HMA adds no new harness. It coordinates two
          agents across sessions.
        </p>
      </div>

      <ol class="hma-rules">
        <li v-for="(rule, i) in RULES" :key="rule.title" v-reveal="i * 90" class="hma-rule">
          <span class="hma-rule-n">{{ String(i + 1).padStart(2, '0') }}</span>
          <p class="hma-rule-big">{{ rule.big }}<small>{{ rule.unit }}</small></p>
          <h3>{{ rule.title }}</h3>
          <p>{{ rule.body }}</p>
        </li>
      </ol>

      <div class="hma-handoff" v-reveal>
        <div class="hma-handoff-side kept">
          <p class="hma-mini">Crosses the handoff</p>
          <ul><li v-for="k in KEPT" :key="k"><i />{{ k }}</li></ul>
        </div>
        <div class="hma-handoff-gate" aria-hidden="true"><span>handoff</span></div>
        <div class="hma-handoff-side dropped">
          <p class="hma-mini">Does not</p>
          <ul><li v-for="k in DROPPED" :key="k"><i />{{ k }}</li></ul>
        </div>
      </div>

      <div class="hma-effects">
        <div class="hma-effects-copy" v-reveal>
          <h3 class="hma-h3">Two effects, credited by the repository</h3>
          <dl>
            <div>
              <dt>Context renewal</dt>
              <dd>A fresh session restarts the improvement curve that a long session flattens.</dd>
            </div>
            <div>
              <dt>Complementary capabilities</dt>
              <dd>The second model searches differently from the first.</dd>
            </div>
          </dl>
          <p class="hma-fine">
            No task-specific prior knowledge is added. The paper models the process as a
            context-reset semi-Markov process.
          </p>
        </div>

        <figure class="hma-curve flow-ui" :class="`front-${front}`" v-reveal="120">
          <div class="hma-curve-top">
            <span class="hma-mini">Schematic, not data</span>
            <div class="hma-seg" role="group" aria-label="Line in front">
              <button type="button" :aria-pressed="front === 'relay'" @click="front = 'relay'">Fresh sessions</button>
              <button type="button" :aria-pressed="front === 'long'" @click="front = 'long'">One long session</button>
            </div>
          </div>
          <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" role="img" aria-label="Schematic. One long session climbs fast and then flattens. The same hours split into fresh sessions climb steeply again at the start of each one, from wherever the workspace was left, and end higher.">
            <line v-for="c in RELAY.cuts.slice(1, -1)" :key="c" class="cut" :x1="c * W" :x2="c * W" y1="10" :y2="H - 18" />
            <line class="axis" x1="0" :x2="W" :y1="H - 18" :y2="H - 18" />
            <path class="long" :d="LONG" pathLength="1" />
            <path v-for="(s, i) in RELAY.segs" :key="i" class="seg" :class="`a${s.agent}`" :d="s.d" pathLength="1" :style="{ '--i': i }" />
          </svg>
          <figcaption>
            <span><i class="sw a0" />agent A turn</span>
            <span><i class="sw a1" />agent B turn</span>
            <span><i class="sw long" />one agent, one session</span>
            <span class="time">time →</span>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>
