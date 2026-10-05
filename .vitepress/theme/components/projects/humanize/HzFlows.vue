<script setup lang="ts">
// The loop shapes that ship, each drawn in the flow grammar by its own scene (FlowThumb), the
// same picture its page under /flows/ opens with. At rest a card is the whole run; pointed at
// or focused, it plays.
import { ref } from 'vue'
import FlowThumb from '../../flow/FlowThumb.vue'
import { vReveal } from '../../../home/motion'
import { FLOWS } from './data'

const thumbs = ref<(InstanceType<typeof FlowThumb> | null)[]>([])
</script>

<template>
  <ul class="fl">
    <li v-for="(f, i) in FLOWS" :key="f.scene" v-reveal="i * 70">
      <a
        :href="f.href"
        class="fl-card"
        @mouseenter="thumbs[i]?.play()"
        @mouseleave="thumbs[i]?.stop()"
        @focus="thumbs[i]?.play()"
        @blur="thumbs[i]?.stop()"
      >
        <div class="fl-pic">
          <FlowThumb :ref="(el) => (thumbs[i] = el as InstanceType<typeof FlowThumb> | null)" :scene="f.scene" />
        </div>
        <p class="fl-kicker">{{ f.kicker }}</p>
        <h3>{{ f.title }}</h3>
        <p class="fl-body">{{ f.body }}</p>
        <span class="fl-go">Read the flow <span aria-hidden="true">→</span></span>
      </a>
    </li>
    <li v-reveal="FLOWS.length * 70">
      <a href="/flows/" class="fl-card fl-all">
        <p class="fl-kicker">The catalogue</p>
        <h3>Every flow, with its loop drawn</h3>
        <p class="fl-body">
          A page each: the <code>hmz exec</code> line, what it takes, what ends it, and what a run
          picked up a week later carries in.
        </p>
        <span class="fl-go">All the flows <span aria-hidden="true">→</span></span>
      </a>
    </li>
  </ul>
</template>

<style scoped>
.fl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.fl li {
  margin: 0;
}
.fl-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 18px 20px 20px;
  border: 1px solid var(--hz-line);
  background: var(--hz-card);
  color: inherit;
  transition:
    transform 0.45s var(--hz-ease),
    box-shadow 0.45s var(--hz-ease),
    border-color 0.3s;
}
.fl-card:hover,
.fl-card:focus-visible {
  transform: translate(-4px, -4px);
  border-color: var(--hz-ink);
  box-shadow: 8px 8px 0 0 var(--hz-red);
  outline: none;
}
.fl-pic {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 168px;
  margin: -18px -20px 16px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--hz-line);
  background: var(--hz-bg);
}
.fl-pic :deep(svg) {
  display: block;
  width: 100%;
  max-height: 100%;
}
.fl-kicker {
  margin: 0 0 8px;
  font: 700 11px/1.3 var(--hz-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--hz-accent);
}
.fl-card h3 {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  letter-spacing: -0.025em;
  font-weight: 800;
  color: var(--hz-ink);
}
.fl-body {
  margin: 10px 0 18px;
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--hz-ink-2);
}
.fl-body code {
  font-size: 0.9em;
}
.fl-go {
  margin-top: auto;
  font: 700 12px/1 var(--hz-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--hz-ink);
}
.fl-card:hover .fl-go {
  color: var(--hz-accent);
}
.fl-all {
  justify-content: flex-end;
  color: var(--hz-on-ink);
  background: var(--hz-ink);
  border-color: var(--hz-ink);
}
.fl-all h3 {
  font-size: clamp(24px, 2.4vw, 32px);
  color: var(--hz-on-ink);
}
.fl-all .fl-body {
  color: color-mix(in srgb, var(--hz-on-ink) 75%, transparent);
}
.fl-all .fl-kicker,
.fl-all .fl-go,
.fl-all:hover .fl-go {
  color: #ff5a43;
}
.fl-all .fl-go {
  margin-top: 0;
}

@media (max-width: 1024px) {
  .fl {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .fl {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
