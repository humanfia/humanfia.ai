<script setup lang="ts">
// The catalogue on /flows/, and the chooser on top of it: pick what you want done, and the
// tiles narrow to the flows that do it, with a line saying which to start with.
//
// The tiles are the blog's mosaic (../Mosaic.vue): one wall, every flow on it, in the order of
// how the agents in a flow work together (KINDS in `theme/flows.ts`), each labelled with its
// kind. Each draws its flow's own scene -- the one its page plays -- in the same grammar, small
// and without words, and as big as its tile; a tile plays while it is hovered or focused. After
// the flows written here come the ones the flowverse releases that nobody here has written up
// yet (`flowverse.data.mts`): the catalogue is the flowverse's, and this site only adds the
// pictures.
import { withBase } from 'vitepress'
import { computed, ref } from 'vue'

import { data } from '../../flowverse.data.mts'
import { FLOWS, JOBS, KINDS, type Job } from '../../flows'
import Mosaic from '../Mosaic.vue'
import FlowThumb from './FlowThumb.vue'

const job = ref<Job | 'all'>('all')

const written = new Set(FLOWS.map((one) => one.module).filter(Boolean))
const versionOf = (module?: string) => data.modules.find((one) => one.name === module)?.versions[0]
const kindOf = (id: string) => KINDS.findIndex((kind) => kind.id === id)

/** Every tile, the flows drawn here first and the flowverse's others after. A picked job
 *  leaves only the flows that do it; the others say no job, so they go. */
const tiles = computed(() => [
  ...FLOWS.filter((one) => job.value === 'all' || one.jobs.includes(job.value))
    .sort((a, b) => kindOf(a.kind) - kindOf(b.kind))
    .map((one) => ({
      url: withBase(one.link),
      name: one.phases ? `${one.name}:<phase>` : one.name,
      runs: one.phases?.join(' · '),
      kind: KINDS[kindOf(one.kind)].said,
      from: one.module ? `flowverse · v${versionOf(one.module) ?? '?'}` : 'ships with humanize',
      said: one.said,
      roles: one.roles,
      ends: one.ends,
      keeps: one.keeps,
      scene: one.scene,
    })),
  ...(job.value === 'all' ? data.modules.filter((one) => !written.has(one.name)) : []).map((one) => ({
    url: withBase(`/flows/${one.slug}`),
    name: one.name,
    runs: undefined,
    kind: 'Not yet drawn',
    from: `flowverse · v${one.versions[0]}`,
    said: one.latest.description || one.summary,
    roles: undefined,
    ends: undefined,
    keeps: undefined,
    scene: undefined,
  })),
])

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

    <Mosaic
      v-slot="{ item: tile }"
      :items="tiles"
      @enter="(tile) => thumbs[tile.url]?.play()"
      @leave="(tile) => thumbs[tile.url]?.stop()"
    >
      <div v-if="tile.scene" class="pic">
        <FlowThumb :ref="(el) => (thumbs[tile.url] = el as InstanceType<typeof FlowThumb> | null)" :scene="tile.scene" />
      </div>

      <p class="tile-meta">
        <span class="tile-tag">{{ tile.kind }}</span>
        <span>{{ tile.from }}</span>
      </p>

      <h3>{{ tile.name }}</h3>
      <p v-if="tile.runs" class="runs">{{ tile.runs }}</p>

      <p class="tile-blurb">{{ tile.said }}</p>

      <div class="tile-foot">
        <dl v-if="tile.roles">
          <div><dt>-a</dt><dd>{{ tile.roles }}</dd></div>
          <div><dt>ends</dt><dd>{{ tile.ends }}</dd></div>
          <div><dt>--resume</dt><dd>{{ tile.keeps || 'starts afresh' }}</dd></div>
        </dl>
        <span class="tile-more">Open it <span aria-hidden="true">→</span></span>
      </div>
    </Mosaic>

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

/* The scene runs edge to edge across the top of its tile, under the ink rule, so a wider tile
   is a bigger picture -- and a taller one too: whatever height the tile's rows give it beyond
   what its words need goes to the picture, not to air above the foot. */
.pic {
  flex: 1 0 auto;
  margin: -18px -20px 16px;
  aspect-ratio: 300 / 130;
  border-bottom: 1px solid var(--flow-panel-edge);
  background: var(--flow-card);
}

.pic :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/* A flow's name is what `-f` and `$` take, so it is set as code: `parallel_flame_chase:git_pr`
   is wider than a small tile, and breaks anywhere rather than overflowing it. */
h3 {
  font-family: var(--vp-font-family-mono);
  overflow-wrap: anywhere;
}

.runs {
  margin: 4px 0 0;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  color: var(--vp-c-text-3);
}

/* What `-a` fills, what ends it and what `--resume` keeps: the three things to know before
   starting one, over the way to its page. */
dl {
  flex-basis: 100%;
  margin: 0;
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
</style>
