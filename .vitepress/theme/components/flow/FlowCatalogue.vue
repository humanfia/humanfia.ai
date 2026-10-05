<script setup lang="ts">
// The catalogue on /flows/, and the chooser on top of it: pick what you want done, and the
// cards narrow to the flows that do it, with a line saying which to start with.
//
// The cards are sorted by how the agents in a flow work together (KINDS in `theme/flows.ts`,
// which the nav and the sidebar are built from too), and each draws its flow's own scene -- the
// one its page plays -- in the same grammar, small and without words. A card plays while it is
// hovered or focused. Under the cards written here come the flows the flowverse releases that
// nobody here has written up yet (`flowverse.data.mts`): the catalogue is the flowverse's, and
// this site only adds the pictures.
import { withBase } from 'vitepress'
import { computed, ref } from 'vue'

import { data } from '../../flowverse.data.mts'
import { FLOWS, JOBS, KINDS, type Job } from '../../flows'
import FlowThumb from './FlowThumb.vue'

const job = ref<Job | 'all'>('all')
const shown = computed(() =>
  KINDS.map((kind, n) => ({
    kind,
    n: n + 1,
    flows: FLOWS.filter((one) => one.kind === kind.id && (job.value === 'all' || one.jobs.includes(job.value))),
  })).filter((group) => group.flows.length),
)

const written = new Set(FLOWS.map((one) => one.module).filter(Boolean))
const others = computed(() => (job.value === 'all' ? data.modules.filter((one) => !written.has(one.name)) : []))
const versionOf = (module?: string) => data.modules.find((one) => one.name === module)?.versions[0]

/** The advice for the picked job, cut at its backticks so the names can be set as code. */
const hint = computed(() => {
  const said = JOBS.find((one) => one.id === job.value)?.hint ?? ''
  return said.split('`').map((text, n) => ({ text, code: n % 2 === 1 }))
})

const thumbs = ref<Record<string, InstanceType<typeof FlowThumb> | null>>({})
</script>

<template>
  <div class="flows flow-ui">
    <div class="ask" role="group" aria-label="What do you want to do?">
      <span class="q">What do you want to do?</span>
      <button type="button" :class="{ on: job === 'all' }" :aria-pressed="job === 'all'" @click="job = 'all'">
        show every flow
      </button>
      <button
        v-for="one in JOBS"
        :key="one.id"
        type="button"
        :class="{ on: job === one.id }"
        :aria-pressed="job === one.id"
        @click="job = one.id"
      >
        {{ one.said }}
      </button>
    </div>

    <p v-show="job !== 'all'" class="hint" aria-live="polite">
      <template v-for="(part, n) in hint" :key="n">
        <code v-if="part.code">{{ part.text }}</code>
        <template v-else>{{ part.text }}</template>
      </template>
    </p>

    <section v-for="group in shown" :key="group.kind.id" class="kind">
      <h3 :id="`kind-${group.kind.id}`">
        <span class="num ignore-header">{{ String(group.n).padStart(2, '0') }}</span>{{ group.kind.said }}
      </h3>
      <p class="how">{{ group.kind.how }}</p>
      <div class="grid">
        <a
          v-for="flow in group.flows"
          :key="flow.name"
          class="card"
          :class="`k-${flow.kind}`"
          :href="withBase(flow.link)"
          @pointerenter="thumbs[flow.name]?.play()"
          @pointerleave="thumbs[flow.name]?.stop()"
          @focus="thumbs[flow.name]?.play()"
          @blur="thumbs[flow.name]?.stop()"
        >
          <div class="pic">
            <FlowThumb :ref="(el) => (thumbs[flow.name] = el as InstanceType<typeof FlowThumb> | null)" :scene="flow.scene" />
          </div>
          <div class="head">
            <code>{{ flow.phases ? `${flow.name}:<phase>` : flow.name }}</code>
            <span v-if="flow.phases" class="runs">{{ flow.phases.join(' · ') }}</span>
            <span class="from">{{ flow.module ? `flowverse · v${versionOf(flow.module) ?? '?'}` : 'ships with humanize' }}</span>
          </div>
          <p class="said">{{ flow.said }}</p>
          <dl>
            <div><dt>-a</dt><dd>{{ flow.roles }}</dd></div>
            <div><dt>ends</dt><dd>{{ flow.ends }}</dd></div>
            <div><dt>--resume</dt><dd>{{ flow.keeps || 'starts afresh' }}</dd></div>
          </dl>
        </a>
      </div>
    </section>

    <section v-if="others.length" class="kind">
      <h3 id="kind-flowverse"><span class="num ignore-header">{{ String(KINDS.length + 1).padStart(2, '0') }}</span>Also in the flowverse</h3>
      <p class="how">Released, and not yet drawn here: each page is the flow's own README.</p>
      <div class="grid">
        <a v-for="module in others" :key="module.name" class="card plain" :href="withBase(`/flows/${module.slug}`)">
          <div class="head">
            <code>{{ module.name }}</code>
            <span class="from">flowverse · v{{ module.versions[0] }}</span>
          </div>
          <p class="said">{{ module.latest.description || module.summary }}</p>
          <dl>
            <div><dt>repo</dt><dd>{{ module.latest.repo }}</dd></div>
          </dl>
        </a>
      </div>
    </section>

    <p class="foot">
      Every run also stops when its budget is spent. Only <code>chat</code> may run without one.
    </p>
  </div>
</template>

<style scoped>
.ask {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.ask .q {
  flex-basis: 100%;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--vp-c-text-1);
}

.ask button {
  padding: 5px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 2px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 12.5px;
  cursor: pointer;
  transition: color 0.3s, border-color 0.3s, background 0.3s;
}

.ask button:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-text-1);
}

.ask button.on {
  border-color: var(--flow-ink);
  background: var(--flow-ink);
  color: var(--flow-card);
  font-weight: 600;
}

.ask button:focus-visible {
  outline: 2px solid var(--flow-red);
  outline-offset: 2px;
}

.hint {
  margin: 0 0 16px;
  padding: 10px 14px;
  border-left: 4px solid var(--flow-red);
  background: var(--flow-panel);
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--vp-c-text-1);
}

.hint code {
  font-size: 12.5px;
}

.kind {
  margin-top: 30px;
}

.kind h3 {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0;
  padding: 0;
  border: none;
  font-size: 16px;
  letter-spacing: -0.01em;
}

/* The section's number, set like a poster's: big, mono, and in the red. */
.kind h3 .num {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--flow-red);
}

.kind .how {
  margin: 2px 0 12px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 14px;
}

.card {
  position: relative;
  display: block;
  padding: 0 0 16px;
  overflow: hidden;
  border: 1px solid var(--flow-panel-edge);
  border-radius: 2px;
  background: var(--flow-panel);
  color: inherit;
  text-decoration: none;
  transition: transform 0.45s cubic-bezier(0.2, 0.7, 0.2, 1), border-color 0.45s, box-shadow 0.45s;
}

/* A wedge of the role's colour slides in along the card's top edge when it is hovered: the
   flow's first maker, as a strip of colour on the diagonal. */
.card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--flow-red) 0 30%, var(--flow-ink) 30% 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.card:hover,
.card:focus-visible {
  transform: translateY(-2px);
  border-color: var(--flow-ink);
  box-shadow: 6px 6px 0 -1px color-mix(in srgb, var(--flow-ink) 12%, transparent);
  outline: none;
}

.card:hover::after,
.card:focus-visible::after {
  transform: scaleX(1);
}

.pic {
  aspect-ratio: 300 / 130;
  border-bottom: 1px solid var(--flow-panel-edge);
  background: var(--flow-card);
}

.pic :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.head,
.said,
dl {
  margin-left: 16px;
  margin-right: 16px;
}

.head {
  margin-top: 12px;
}

.card.plain .head {
  margin-top: 18px;
}

/* The name gets a line of its own: `parallel_flame_chase:git_pr` is wider than half a card. */
.head code {
  display: block;
  padding: 0;
  background: none;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--vp-c-text-1);
  overflow-wrap: anywhere;
}

.head .runs,
.head .from {
  display: block;
  margin-top: 2px;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  color: var(--vp-c-text-3);
}

.head .from {
  margin-top: 6px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.said {
  margin-top: 8px;
  margin-bottom: 0;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}

dl {
  margin-top: 12px;
  margin-bottom: 0;
  padding-top: 10px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 11.5px;
  line-height: 1.45;
}

dl div {
  display: flex;
  gap: 8px;
  padding: 2px 0;
}

dt {
  flex: none;
  width: 62px;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  color: var(--vp-c-text-3);
}

dd {
  flex: 1;
  margin: 0;
  color: var(--vp-c-text-2);
}

.foot {
  margin: 18px 0 0;
  font-size: 12.5px;
  color: var(--vp-c-text-3);
}

@media (prefers-reduced-motion: reduce) {
  .card,
  .card::after {
    transition: none;
  }
}
</style>
