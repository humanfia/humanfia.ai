<script setup lang="ts">
// The pairings: who goes first down the side, who goes second across the top. A cell the main
// table has a run for is filled, deeper red for a higher any-medal rate; the diagonal is a model
// working alone, where the table has that; every other cell is empty and says so rather than
// guessing. Pick a cell to read it, and to see the same two models in the other order.
//
// Under it, the setup the paper ran on: the 75 tasks by complexity, one square each, and the
// machine every task got.
import { computed, ref } from 'vue'
import { vReveal } from '../../../home/motion'
import { METRICS, MODELS, PAIRINGS_EVALUATED, SETUP, TASKS, byId, gainOverBaselines, pairing, type Model, type Workflow } from './data'

const pick = ref<{ r: number; c: number }>({ r: 0, c: 1 })

function cell(r: number, c: number): Workflow | undefined {
  const first = MODELS[r]
  const second = MODELS[c]
  if (r === c) return first.alone ? byId(first.alone) : undefined
  return pairing(first.key, second.key)
}

const LO = 66
const HI = 80
const heat = (v: number) => Math.max(0.12, Math.min(1, (v - LO) / (HI - LO)))

const chosen = computed(() => {
  const { r, c } = pick.value
  const w = cell(r, c)
  const back = r === c ? undefined : cell(c, r)
  return { r, c, w, back, alone: r === c, first: MODELS[r], second: MODELS[c] }
})

const fmt = (v: number | undefined) => (v === undefined ? '—' : `${v.toFixed(1)}`)
const short = (m: Model) => m.key.replace('DeepSeek V4.1 Flash', 'DS Flash').replace('GPT-5.6-sol', 'GPT-5.6')

function move(e: KeyboardEvent) {
  const d = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] }[e.key]
  if (!d) return
  e.preventDefault()
  const n = MODELS.length
  pick.value = { r: (pick.value.r + d[0] + n) % n, c: (pick.value.c + d[1] + n) % n }
  ;(e.currentTarget as HTMLElement).querySelector<HTMLElement>(`[data-cell="${pick.value.r}-${pick.value.c}"]`)?.focus()
}

const field = [
  ...Array(TASKS.low).fill('low'),
  ...Array(TASKS.medium).fill('medium'),
  ...Array(TASKS.high).fill('high'),
]
</script>

<template>
  <section id="the-pairings" class="hma-section" aria-labelledby="the-pairings-h">
    <div class="hma-wrap">
      <div class="hma-section-head" v-reveal>
        <p class="hma-kicker"><span class="hma-num">03</span> Who goes first</p>
        <h2 id="the-pairings-h" class="hma-h2">The pairings</h2>
        <p class="hma-lead">
          Every agent runs in its own native harness at <code>max</code> reasoning effort. HMA starts
          with the first model of a pairing, and the order matters.
        </p>
      </div>

      <div class="hma-pairs" v-reveal>
        <div class="hma-matrix-wrap">
          <div class="hma-matrix-axis top" aria-hidden="true">second →</div>
          <div class="hma-matrix-axis side" aria-hidden="true">first ↓</div>
          <div
            class="hma-matrix"
            role="grid"
            aria-label="Pairings: the row goes first, the column second. Arrow keys move between cells."
            @keydown="move"
          >
            <div role="row" class="hma-matrix-row head">
              <span role="columnheader" class="corner" />
              <span v-for="m in MODELS" :key="m.key" role="columnheader" class="ch">
                <b>{{ short(m) }}</b><em>{{ m.harness }}</em>
              </span>
            </div>
            <div v-for="(row, r) in MODELS" :key="row.key" role="row" class="hma-matrix-row">
              <span role="rowheader" class="rh"><b>{{ short(row) }}</b><em>{{ row.harness }}</em></span>
              <button
                v-for="(col, c) in MODELS"
                :key="col.key"
                type="button"
                role="gridcell"
                class="hma-cell"
                :data-cell="`${r}-${c}`"
                :class="{
                  diag: r === c,
                  has: !!cell(r, c),
                  on: pick.r === r && pick.c === c,
                  mirror: pick.r === c && pick.c === r && r !== c,
                }"
                :style="cell(r, c) && r !== c ? { '--heat': heat(cell(r, c)!.values.medal!) } : undefined"
                :tabindex="pick.r === r && pick.c === c ? 0 : -1"
                :aria-label="
                  r === c
                    ? `${row.name} alone: ${cell(r, c) ? cell(r, c)!.values.medal + '% any medal' : 'not in the main table'}`
                    : `${row.name} then ${col.name}: ${cell(r, c) ? cell(r, c)!.values.medal + '% any medal' : 'not in the main table'}`
                "
                :aria-selected="pick.r === r && pick.c === c"
                @click="pick = { r, c }"
                @mouseenter="pick = { r, c }"
              >
                <span v-if="cell(r, c)">{{ cell(r, c)!.values.medal!.toFixed(1) }}</span>
                <span v-else class="none">·</span>
                <small v-if="r === c && cell(r, c)">alone</small>
              </button>
            </div>
          </div>
        </div>

        <div class="hma-pair-card">
          <p class="hma-mini">{{ chosen.alone ? 'Alone · native /goal' : 'HMA pairing' }}</p>
          <p class="hma-pair-who">
            <span class="a">{{ chosen.first.name }}</span>
            <template v-if="!chosen.alone">
              <span class="arrow">then</span>
              <span class="b">{{ chosen.second.name }}</span>
            </template>
          </p>
          <p class="hma-pair-harness">
            {{ chosen.first.harness }}<template v-if="!chosen.alone"> → {{ chosen.second.harness }}</template>
          </p>
          <template v-if="chosen.w">
            <p class="hma-pair-big">{{ chosen.w.values.medal!.toFixed(1) }}<small>% any medal</small></p>
            <ul class="hma-pair-bars">
              <li v-for="m in METRICS" :key="m.key">
                <span>{{ m.label }}</span>
                <i><b :style="{ width: `${chosen.w.values[m.key] ?? 0}%` }" /></i>
                <em>{{ fmt(chosen.w.values[m.key]) }}</em>
              </li>
            </ul>
            <p v-if="!chosen.alone && gainOverBaselines(chosen.w) !== undefined" class="hma-pair-note">
              <b>{{ gainOverBaselines(chosen.w)! >= 0 ? '+' : '−' }}{{ Math.abs(gainOverBaselines(chosen.w)!).toFixed(1) }} pts</b>
              over the mean of the two working alone.
            </p>
            <p v-if="chosen.back" class="hma-pair-note">
              The other order:
              <button type="button" class="hma-link" @click="pick = { r: chosen.c, c: chosen.r }">
                {{ chosen.back.values.medal!.toFixed(1) }}%
              </button>,
              {{ Math.abs(chosen.w.values.medal! - chosen.back.values.medal!).toFixed(1) }} pts
              {{ chosen.w.values.medal! > chosen.back.values.medal! ? 'lower' : 'higher' }}.
            </p>
          </template>
          <p v-else class="hma-pair-empty">
            {{ chosen.alone ? 'No single-agent run for this model in the main table.' : 'Not in the main table.' }}
            {{ PAIRINGS_EVALUATED }} pairings were evaluated; the table carries four of them.
          </p>
        </div>
      </div>

      <div class="hma-setup">
        <div class="hma-field-wrap" v-reveal>
          <p class="hma-mini">The 75 tasks, by complexity</p>
          <div class="hma-field" role="img" :aria-label="`${TASKS.low} low-, ${TASKS.medium} medium- and ${TASKS.high} high-complexity MLE-bench tasks`">
            <i v-for="(k, i) in field" :key="i" :class="k" :style="{ '--i': i }" />
          </div>
          <p class="hma-field-legend" aria-hidden="true">
            <span><i class="low" />{{ TASKS.low }} low</span>
            <span><i class="medium" />{{ TASKS.medium }} medium</span>
            <span><i class="high" />{{ TASKS.high }} high</span>
          </p>
        </div>
        <dl class="hma-specs">
          <div v-for="(s, i) in SETUP" :key="s.said" v-reveal="i * 60">
            <dt>{{ s.value }}</dt>
            <dd>{{ s.said }}</dd>
          </div>
        </dl>
      </div>
      <p class="hma-fine">
        The external harnesses, ML-Master 2.0, MLEvolve and ScienceFlow, are compared on a fixed
        16-task subset.
      </p>
    </div>
  </section>
</template>
