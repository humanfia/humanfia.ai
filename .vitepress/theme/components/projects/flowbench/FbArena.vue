<script setup lang="ts">
// The method, as an arena: what is held fixed on the left, several flows running the same task
// in the middle -- each drawn as its own scene, in the flow grammar -- and the real check on the
// right. Its four steps light as the arena scrolls up the window, and each can be picked by
// hand -- which holds until the arena next leaves the screen. The flows are examples of what is
// compared, not a published result; the board's caption in the hero says so once for the page.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { FLOWS } from '../../../flows'
import { clamp, prefersReducedMotion, useScrollProgress } from '../../../home/motion'
import FlowThumb from '../../flow/FlowThumb.vue'

const STEPS = [
  { verb: 'Fix', said: 'The model, tools, task, budget and machine.' },
  { verb: 'Run', said: 'Each flow, unchanged, in the Humanize runtime.' },
  { verb: 'Score', said: 'Each run, with an existing benchmark, build or test suite.' },
  { verb: 'Compare', said: 'Rank the flows by score.' },
]
const HELD = ['model', 'tools', 'task', 'budget', 'machine']
const lanes = ['ralph_loop', 'rlar', 'flame_chase'].map((name) => FLOWS.find((f) => f.name === name)!)

const root = ref<HTMLElement | null>(null)
const progress = useScrollProgress(root, (box, vh) => (vh * 0.62 - box.top) / box.height)
const auto = computed(() => 1 + Math.floor(clamp(progress.value, 0, 0.999) * 4))
const step = ref(4)
const still = ref(true)
const picked = ref(false)
const onStage = computed(() => progress.value > -0.6 && progress.value < 1.4)
watch(auto, (s) => !still.value && !picked.value && (step.value = s))
watch(onStage, (seen) => !seen && (picked.value = false))

function pick(s: number) {
  picked.value = true
  step.value = s
}

const thumbs = ref<(InstanceType<typeof FlowThumb> | null)[]>([])
const sync = () => thumbs.value.forEach((t) => (step.value >= 2 && onStage.value ? t?.play() : t?.stop()))
watch([step, onStage], sync)

onMounted(() => {
  still.value = prefersReducedMotion()
  if (!still.value) step.value = auto.value
  sync()
})
onBeforeUnmount(() => thumbs.value.forEach((t) => t?.stop()))
</script>

<template>
  <div ref="root" class="fb-arena" :class="`s${step}`">
    <ol class="fb-steps">
      <li v-for="(s, i) in STEPS" :key="s.verb">
        <button type="button" :aria-pressed="step === i + 1" :class="{ lit: step >= i + 1 }" @click="pick(i + 1)">
          <span class="n">{{ i + 1 }}</span>
          <span class="verb">{{ s.verb }}</span>
          <span class="said">{{ s.said }}</span>
        </button>
      </li>
    </ol>

    <div class="fb-stage">
      <div class="fb-held">
        <span class="cap">Held fixed</span>
        <ul>
          <li v-for="h in HELD" :key="h">{{ h }}</li>
        </ul>
      </div>
      <div class="fb-lanes">
        <a v-for="(flow, i) in lanes" :key="flow.name" class="fb-lane" :href="flow.link" :style="{ '--i': i }">
          <span class="head"><b>{{ flow.name }}</b><small>{{ flow.roles }}</small></span>
          <span class="pic"><FlowThumb :ref="(el) => (thumbs[i] = el as InstanceType<typeof FlowThumb> | null)" :scene="flow.scene" /></span>
          <span class="said">{{ flow.said }}</span>
          <i class="token" aria-hidden="true" />
        </a>
      </div>
      <div class="fb-check">
        <span class="cap">Real check</span>
        <ul>
          <li>faster</li>
          <li>compiles</li>
          <li>passes</li>
        </ul>
        <span class="none">No LLM grader</span>
      </div>
    </div>

    <p class="fb-verdict">
      <span class="cap">Result</span>
      <span class="line">a ranking of <em>flows</em></span>
    </p>
  </div>
</template>
