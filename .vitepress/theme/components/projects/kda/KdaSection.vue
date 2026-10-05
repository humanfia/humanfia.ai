<script setup lang="ts">
// One band of the KDA page: a numbered head (index, title, lede), then whatever the section is.
// The title carries the section's anchor, so the page's old `#fragment`s still land on it.
//
// `split` sets the slot's prose beside the `figure` slot on a wide screen; otherwise the prose,
// if any, sits under the head and the figure runs the full width below it.
import { vReveal } from '../../../home/motion'
import { useMotion } from './motion'
import './kda.css'

withDefaults(
  defineProps<{
    id: string
    n: string
    kicker: string
    title: string
    lede?: string
    tone?: 'paper' | 'alt' | 'ink'
    split?: boolean
  }>(),
  { tone: 'paper', split: false },
)

const motion = useMotion()
</script>

<template>
  <section class="kd-band" :class="[`kd-${tone}`, { 'kd-motion': motion }]" :aria-labelledby="id">
    <div class="kd-wrap">
      <header v-reveal class="kd-head">
        <p class="kd-index"><b>{{ n }}</b>{{ kicker }}</p>
        <h2 :id="id" class="kd-title" tabindex="-1">
          {{ title }}<a class="kd-anchor" :href="`#${id}`" :aria-label="`Permalink to ${title}`">#</a>
        </h2>
        <p v-if="lede" class="kd-lede">{{ lede }}</p>
      </header>

      <div v-if="split" class="kd-split">
        <div v-reveal class="kd-prose"><slot /></div>
        <div v-reveal="120" class="kd-split-figure"><slot name="figure" /></div>
      </div>
      <template v-else>
        <div v-if="$slots.default" v-reveal class="kd-prose kd-prose-top"><slot /></div>
        <slot name="figure" />
      </template>
    </div>
  </section>
</template>

<style scoped>
.kd-anchor {
  margin-left: 0.25em;
  font-size: 0.5em;
  font-weight: 500;
  vertical-align: middle;
  color: var(--kd-fg-3);
  text-decoration: none;
  opacity: 0;
  transition: opacity 0.2s;
}

.kd-title:hover .kd-anchor,
.kd-anchor:focus-visible {
  opacity: 1;
}

.kd-split {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: clamp(40px, 6vw, 96px);
  align-items: start;
}

.kd-prose-top {
  margin-bottom: clamp(36px, 5vw, 56px);
}

@media (max-width: 960px) {
  .kd-split {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
