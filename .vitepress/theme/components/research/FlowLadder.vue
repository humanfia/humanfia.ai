<script setup lang="ts">
// Engineering or science: three planes on the rising diagonal, each one reaching further than
// the one below it. They slide in along the diagonal when the figure comes on screen.
import { ref } from 'vue'
import { useSeen } from './chart'

const root = ref<HTMLElement | null>(null)
const seen = useSeen(root, 0.25)

const RUNGS = [
  {
    name: 'XXX engineering',
    scope: 'one prompt, context, skill or loop · one task',
    body: 'Prompt, context, skill and loop engineering: each fix is tuned to the task in front of it, and the dirty work does not carry over to the next one.',
  },
  {
    name: 'Flow engineering',
    scope: 'one flow · one task',
    body: 'A whole method written as a flow and pointed at one kind of work: HOA at Lean, KDA at kernels, HMA at MLE-bench. It works, and it is still one flow per job.',
  },
  {
    name: 'Flow science',
    scope: 'one flow family · every task that reduces to one problem',
    body: 'A family — the Ralph loop, the Flame Chase, the progressive goal — generalises to every task that reduces to the same problem class, and can be ablated and analysed like any other object of study.',
  },
]
</script>

<template>
  <ol ref="root" class="fl" :class="{ seen }" aria-label="From engineering to science">
    <li v-for="(r, i) in RUNGS" :key="r.name" :style="{ '--i': i }" :class="{ top: i === 2 }">
      <span class="fl-bar" aria-hidden="true" />
      <div class="fl-copy">
        <b>{{ r.name }}</b>
        <em>{{ r.scope }}</em>
        <p>{{ r.body }}</p>
      </div>
    </li>
  </ol>
</template>

<style scoped>
.fl {
  display: grid;
  gap: 14px;
  margin: 28px 0 !important;
  padding: 0 !important;
  list-style: none;
}
.fl li {
  position: relative;
  margin: 0 !important;
  padding-left: calc(var(--i) * 9%);
  opacity: 1;
  transform: none;
}
.fl:not(.seen) li {
  opacity: 0;
  transform: translate(-40px, 22px);
}
.fl.seen li {
  transition: opacity 0.7s ease calc(var(--i) * 0.18s), transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) calc(var(--i) * 0.18s);
}
.fl-bar {
  position: absolute;
  left: calc(var(--i) * 9%);
  right: 0;
  top: 0;
  height: 6px;
  background: var(--vp-c-text-1);
  transform-origin: left;
  transform: skewX(-18deg);
}
.fl li.top .fl-bar {
  background: var(--hf-red);
  height: 10px;
}
.fl-copy {
  padding: 18px 16px 4px;
  border-left: 2px solid var(--vp-c-text-1);
  margin-top: 6px;
}
.fl li.top .fl-copy {
  border-left-color: var(--hf-red);
}
.fl-copy b {
  display: block;
  font-size: 20px;
  letter-spacing: -0.02em;
}
.fl-copy em {
  display: block;
  margin-top: 2px;
  font: normal 12px/1.4 var(--vp-font-family-mono);
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.fl-copy p {
  margin: 8px 0 0 !important;
  font-size: 14.5px;
  line-height: 1.55;
}
@media (max-width: 560px) {
  .fl li,
  .fl-bar {
    padding-left: calc(var(--i) * 5%);
  }
  .fl-bar {
    left: calc(var(--i) * 5%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .fl li {
    transition: none !important;
  }
}
</style>
