<script setup lang="ts">
// The hero: what HMA is in one line, the board it tops, and the relay that put it there.
//
// The board is the any-medal column of the main results table, with HMA's best pairing counting
// up into its place: as its number passes each of the others it overtakes that row, so the climb
// is the ranking being read, not a curve over time. The server renders the finished board, and a
// reader who asked for less motion sees only that.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { easeInOut, prefersReducedMotion } from '../../../home/motion'
import { byId, gainOverBaselines } from './data'
import RelayScene from './RelayScene.vue'

const FROM = 60
const BOARD = ['hma', 'opus', 'scienceflow', 'gpt', 'mlevolve'].map(byId)
const hma = BOARD[0]
const TARGET = hma.values.medal!
const gain = gainOverBaselines(hma)!

const live = ref(TARGET)
const climbing = ref(false)
let raf = 0
let timer = 0

onMounted(() => {
  if (prefersReducedMotion()) return
  live.value = FROM
  climbing.value = true
  timer = window.setTimeout(() => {
    const began = performance.now()
    const tick = (now: number) => {
      const u = Math.min(1, (now - began) / 2800)
      live.value = FROM + (TARGET - FROM) * easeInOut(u)
      if (u < 1) raf = requestAnimationFrame(tick)
      else climbing.value = false
    }
    raf = requestAnimationFrame(tick)
  }, 700)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  clearTimeout(timer)
})

const rows = computed(() => {
  const scored = BOARD.map((w) => ({ w, score: w === hma ? live.value : w.values.medal! }))
  const order = [...scored].sort((a, b) => b.score - a.score)
  return scored.map((row) => ({ ...row, rank: order.indexOf(row) }))
})
const name = (id: string) => {
  const w = byId(id)
  return w.hma ? w.agents.join(' ↔ ') : w.agents[0]
}
</script>

<template>
  <header class="hma-hero">
    <div class="hma-wrap hma-hero-grid">
      <div class="hma-hero-copy">
        <p class="hma-kicker">HMA · Humanize MLE Agents</p>
        <h1 class="hma-display">
          Two agents.<br />One workspace.<br /><span class="hma-red">Taking turns.</span>
        </h1>
        <p class="hma-lead">
          Two native coding agents alternate over one shared machine-learning workspace, each turn a
          fresh session. On 75 MLE-bench tasks in six hours, together they medal more often than
          either does alone.
        </p>
        <div class="hma-actions">
          <a class="hma-btn primary" href="https://github.com/humanfia/hma" target="_blank" rel="noreferrer">humanfia/hma ↗</a>
          <a class="hma-btn" href="/flows/fixed-interrupt-flame-chase">Run it as a flow</a>
          <a class="hma-btn" href="/news/2026-10-05-hma-mle-bench">The write-up</a>
        </div>
      </div>

      <div class="hma-board" :class="{ climbing }">
        <div class="hma-board-head">
          <span>MLE-bench · any medal · 75 tasks</span>
          <a href="https://github.com/humanfia/hma#main-results" target="_blank" rel="noreferrer">self-reported ↗</a>
        </div>
        <p class="hma-board-big">
          <span class="hma-board-num" aria-hidden="true">{{ live.toFixed(1) }}<small>%</small></span>
          <span class="hma-sr">{{ TARGET }}% any-medal rate.</span>
          <span class="hma-board-said">
            <b>#1</b> of the five on this board, with Opus 5 going first and GPT-5.6-sol second, in
            a six-hour budget.
          </span>
        </p>
        <ol class="hma-board-rows" :style="{ '--rows': rows.length }" aria-label="Any-medal rate, best first">
          <li
            v-for="row in rows"
            :key="row.w.id"
            class="hma-board-row"
            :class="{ us: row.w.hma }"
            :style="{ transform: `translateY(${row.rank * 100}%)`}"
          >
            <span class="rk">{{ row.rank + 1 }}</span>
            <span class="nm">
              {{ name(row.w.id) }}
              <em v-if="row.w.harness">{{ row.w.harness }}</em>
              <em v-if="row.w.hours !== 6" class="long">{{ row.w.hours }} h</em>
            </span>
            <span class="tr"><i :style="{ width: `${row.score}%` }" /></span>
            <span class="sc">{{ row.score.toFixed(1) }}</span>
          </li>
        </ol>
        <p class="hma-board-foot">
          <b>+{{ gain.toFixed(1) }} pts</b> over the mean of the same two models working alone.
          ScienceFlow and MLEvolve had 24 h and 12 h.
        </p>
      </div>
    </div>

    <div class="hma-wrap">
      <RelayScene />
    </div>
  </header>
</template>
