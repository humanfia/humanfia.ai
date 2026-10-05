<script setup lang="ts">
// Results: every row of the main table as one medal ladder.
//
// Each workflow is one bar out of 100, with its three rates nested inside it, because they nest:
// a gold is a medal, and a medal is above the human median. The mean percentile is a tick on the
// same scale. Pick a metric and the rows re-rank by it, that layer comes forward, and the two
// single-agent baselines are drawn down the whole ladder as dashed rules to read a gain against.
// A row a source does not report a metric for drops to the bottom and says so.
import { computed, ref } from 'vue'
import { vReveal } from '../../../home/motion'
import { AVERAGE_GAIN, BEST_PCT_GAIN, METRICS, PAIRINGS_EVALUATED, WORKFLOWS, byId, gainOverBaselines, type Metric, type Workflow } from './data'

const metric = ref<Metric>('medal')
const active = ref<string | null>(null)

const ranked = computed(() => {
  const m = metric.value
  const order = WORKFLOWS.map((w, i) => ({ w, i })).sort((a, b) => {
    const va = a.w.values[m]
    const vb = b.w.values[m]
    if (va === undefined || vb === undefined) return (va === undefined ? 1 : 0) - (vb === undefined ? 1 : 0) || a.i - b.i
    return vb - va || a.i - b.i
  })
  return WORKFLOWS.map((w) => ({ w, rank: order.findIndex((o) => o.w === w) }))
})

const baseline = (id: string) => byId(id).values[metric.value]
const name = (w: Workflow) => (w.hma ? w.agents.join(' → ') : w.agents[0])
const fmt = (v: number | undefined) => (v === undefined ? '—' : v.toFixed(1))
const signedPts = (v: number | undefined) => (v === undefined ? '—' : `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}`)

const best = byId('hma')
const reverse = byId('hma-rev')
const orderGap = best.values.medal! - reverse.values.medal!
const shown = computed(() => byId(active.value ?? 'hma'))
const TICKS = [0, 25, 50, 75, 100]
</script>

<template>
  <section id="results" class="hma-section hma-band" aria-labelledby="results-h">
    <div class="hma-wrap">
      <div class="hma-section-head" v-reveal>
        <p class="hma-kicker"><span class="hma-num">02</span> MLE-bench · 75 tasks</p>
        <h2 id="results-h" class="hma-h2">Results</h2>
        <p class="hma-lead">
          The same two models, alone and taking turns, against two external harnesses with longer
          budgets. Every number is a percentage over the same 75 tasks.
        </p>
      </div>

      <aside class="hma-caveat" v-reveal>
        <b>Self-reported.</b> These come from the
        <a href="https://github.com/humanfia/hma#main-results" target="_blank" rel="noreferrer">repository's results table</a>.
        The paper is not out yet, and the
        <a href="https://github.com/openai/mle-bench#leaderboard" target="_blank" rel="noreferrer">official MLE-bench leaderboard</a>
        has not reviewed these runs.
      </aside>

      <div class="hma-ladder" v-reveal>
        <div class="hma-ladder-top">
          <div class="hma-seg" role="group" aria-label="Rank by">
            <button
              v-for="m in METRICS"
              :key="m.key"
              type="button"
              :aria-pressed="metric === m.key"
              @click="metric = m.key"
            >{{ m.label }}</button>
          </div>
          <p class="hma-ladder-said">{{ METRICS.find((m) => m.key === metric)!.said }}</p>
        </div>

        <div class="hma-ladder-axis" aria-hidden="true">
          <div><span v-for="t in TICKS" :key="t" :style="{ left: `${t}%` }">{{ t }}</span></div>
        </div>

        <div class="hma-ladder-body">
          <div class="hma-ladder-over" aria-hidden="true">
            <i
              v-for="id in ['opus', 'gpt']"
              :key="id"
              class="hma-ladder-base"
              :class="id"
              :style="{ left: `${baseline(id)}%` }"
            ><span>{{ byId(id).agents[0] }} alone</span></i>
          </div>
          <ol class="hma-ladder-rows" :class="`m-${metric}`" :style="{ '--rows': WORKFLOWS.length }">
            <li
              v-for="{ w, rank } in ranked"
              :key="w.id"
              class="hma-ladder-row"
              :class="{ us: w.hma, on: active === w.id, missing: w.values[metric] === undefined }"
              :style="{ transform: `translateY(${rank * 100}%)` }"
              tabindex="0"
              @mouseenter="active = w.id"
              @mouseleave="active = null"
              @focus="active = w.id"
              @blur="active = null"
            >
              <span class="rk">{{ w.values[metric] === undefined ? '–' : rank + 1 }}</span>
              <span class="nm">
                <b>{{ name(w) }}</b>
                <em>{{ w.hma ? 'HMA' : w.harness ?? 'external' }} · {{ w.hours }} h</em>
              </span>
              <span class="tr" aria-hidden="true">
                <i class="median" :style="{ width: `${w.values.median ?? 0}%` }" />
                <i class="medal" :style="{ width: `${w.values.medal ?? 0}%` }" />
                <i class="gold" :style="{ width: `${w.values.gold ?? 0}%` }" />
                <i v-if="w.values.pct !== undefined" class="pct" :style="{ left: `${w.values.pct}%` }" />
              </span>
              <span class="sc">{{ fmt(w.values[metric]) }}</span>
            </li>
          </ol>
        </div>

        <div class="hma-ladder-legend" aria-hidden="true">
          <span><i class="gold" />Gold</span>
          <span><i class="medal" />Any medal</span>
          <span><i class="median" />Median+</span>
          <span><i class="pct" />Mean percentile</span>
          <span><i class="base" />Single-agent baselines</span>
        </div>

        <p class="hma-ladder-read">
          <b>{{ name(shown) }}</b>
          <template v-for="m in METRICS" :key="m.key">
            <span>{{ m.short }} <b>{{ fmt(shown.values[m.key]) }}</b></span>
          </template>
          <span v-if="gainOverBaselines(shown) !== undefined">
            any medal vs the two alone <b class="hma-red">{{ signedPts(gainOverBaselines(shown)) }}</b>
          </span>
        </p>
      </div>

      <div class="hma-callouts">
        <div class="hma-callout" v-reveal="0">
          <p class="big">+{{ gainOverBaselines(best)!.toFixed(1) }}<small>pts</small></p>
          <p>
            Any-medal rate of the best pairing over the mean of its two single-agent runs
            (+{{ BEST_PCT_GAIN.toFixed(1) }} on mean percentile).
          </p>
        </div>
        <div class="hma-callout primary" v-reveal="90">
          <p class="big">+{{ AVERAGE_GAIN.toFixed(1) }}<small>pts</small></p>
          <p>
            The average gain across all {{ PAIRINGS_EVALUATED }} pairings evaluated.
            <b>Use this one when comparing.</b>
          </p>
        </div>
        <div class="hma-callout" v-reveal="180">
          <p class="big">{{ orderGap.toFixed(1) }}<small>pts</small></p>
          <p>
            What going first is worth: {{ best.values.medal }}% with Opus 5 first,
            {{ reverse.values.medal }}% with GPT-5.6-sol first. Picking the better order afterwards
            flatters the headline.
          </p>
        </div>
      </div>

      <details class="hma-table">
        <summary>The full table</summary>
        <div class="hma-table-scroll">
          <table>
            <thead>
              <tr><th>Workflow</th><th>Budget</th><th v-for="m in METRICS" :key="m.key">{{ m.label }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="w in WORKFLOWS" :key="w.id" :class="{ us: w.hma }">
                <td>{{ w.hma ? `HMA: ${w.agents.join(' ↔ ')}` : `${w.agents[0]}${w.harness ? `, ${w.harness}` : ''}` }}</td>
                <td>{{ w.hours }} h</td>
                <td v-for="m in METRICS" :key="m.key">{{ fmt(w.values[m.key]) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
    </div>
  </section>
</template>
