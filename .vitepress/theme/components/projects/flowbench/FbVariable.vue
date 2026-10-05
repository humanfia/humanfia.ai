<script setup lang="ts">
// What varies, and what is held still: one run's parts, read two ways. A model benchmark turns
// the model and bolts the loop down; FlowBench bolts the model down and turns the loop. The
// part that varies rolls through its values; the parts held still are locked. It flips to
// FlowBench by itself the first time it is seen, unless the reader got there first.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { onFirstSight, prefersReducedMotion } from '../../../home/motion'

type Mode = 'model' | 'flow'
interface Row {
  part: string
  /** One of the two parts the benchmarks disagree on: which of them varies. */
  axis?: boolean
  model: { said: string; rolls?: string[] }
  flow: { said: string; rolls?: string[] }
}

const ROWS: Row[] = [
  {
    part: 'Model',
    axis: true,
    model: { said: 'varies: the model is the variable', rolls: ['model A', 'model B', 'model C'] },
    flow: { said: 'held fixed' },
  },
  {
    part: 'Loop around it',
    axis: true,
    model: { said: 'one fixed harness, or one turn' },
    flow: { said: 'varies: the flow is the variable', rolls: ['ralph_loop', 'rlar', 'flame_chase'] },
  },
  { part: 'Task length', model: { said: 'minutes' }, flow: { said: 'hours' } },
  { part: 'Score', model: { said: 'often graded by a model' }, flow: { said: 'a check that already existed' } },
]

const mode = ref<Mode>('model')
const touched = ref(false)
const tick = ref(0)
const root = ref<HTMLElement | null>(null)
const still = ref(true)
let timer = 0
let flip = 0

const rows = computed(() => ROWS.map((row) => ({ part: row.part, axis: row.axis, ...row[mode.value] })))

function pick(next: Mode) {
  touched.value = true
  mode.value = next
}

onMounted(() => {
  still.value = prefersReducedMotion()
  if (!still.value) timer = window.setInterval(() => tick.value++, 1300)
})
onFirstSight(root, () => {
  flip = window.setTimeout(() => !touched.value && (mode.value = 'flow'), still.value ? 0 : 1600)
}, 0.5)
onBeforeUnmount(() => {
  clearInterval(timer)
  clearTimeout(flip)
})
</script>

<template>
  <div ref="root" class="fb-var" :class="`is-${mode}`">
    <div class="fb-var-head">
      <span class="fb-var-label" id="fb-var-label">Read the same run as</span>
      <div class="fb-switch" role="group" aria-labelledby="fb-var-label">
        <button type="button" :aria-pressed="mode === 'model'" @click="pick('model')">A model benchmark</button>
        <button type="button" :aria-pressed="mode === 'flow'" @click="pick('flow')">FlowBench</button>
        <i class="thumb" aria-hidden="true" />
      </div>
    </div>

    <ul class="fb-var-rows" aria-live="polite">
      <li v-for="row in rows" :key="row.part" :class="{ varies: row.rolls }">
        <span class="part">{{ row.part }}</span>
        <span class="slot">
          <span v-if="row.axis" class="state" aria-hidden="true">{{ row.rolls ? 'Varies' : 'Held' }}</span>
          <span class="said">{{ row.said }}</span>
          <span v-if="row.rolls" class="roll" aria-hidden="true">
            <Transition name="fb-roll" mode="out-in">
              <b :key="still ? 'all' : tick % row.rolls.length">{{ still ? row.rolls.join(' · ') : row.rolls[tick % row.rolls.length] }}</b>
            </Transition>
          </span>
          <svg v-else-if="row.axis" class="lock" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 7V5a4 4 0 0 1 8 0v2M3 7h10v8H3z" /></svg>
        </span>
        <span v-if="row.part === 'Task length'" class="len" aria-hidden="true"><i /></span>
      </li>
    </ul>

    <p class="fb-var-verdict">
      Reads as: <strong>this <Transition name="fb-roll" mode="out-in"><em :key="mode">{{ mode === 'model' ? 'vendor' : 'loop' }}</em></Transition>
      beat that {{ mode === 'model' ? 'vendor' : 'loop' }}</strong>
    </p>
  </div>
</template>
