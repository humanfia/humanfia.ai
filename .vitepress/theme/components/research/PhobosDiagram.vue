<script setup lang="ts">
// Phobos as a pipeline in three phases, read left to right (top to bottom on a phone): compile
// and verify, assemble, link. A red pulse walks the stages in order and starts again, so the
// reader sees the order the compiler works in rather than being told it.
const PHASES = [
  {
    n: '01',
    name: 'Compile & verify',
    inputs: ['Python flow code · .py'],
    stages: [
      { name: 'Compiler', sub: 'Python → flow IR' },
      { name: 'Verifier', sub: 'validates the IR, emits a checksum' },
    ],
    output: 'Flow IR + checksum',
  },
  {
    n: '02',
    name: 'Assemble',
    inputs: ['Flow IR + checksum', 'Assets · skills, related files'],
    stages: [{ name: 'Assembler', sub: 'IR + checksum + assets' }],
    output: 'A unit flow artifact',
  },
  {
    n: '03',
    name: 'Link',
    inputs: ['Other flows’ artifacts · 1…N', 'External dynamic-link interface · runtime symbols, bindings'],
    stages: [{ name: 'Linker', sub: 'resolve · link · bundle' }],
    output: 'The linked flow, ready to run',
  },
]
let k = 0
const order = PHASES.map((p) => p.stages.map(() => k++))
const total = k
</script>

<template>
  <figure class="dt" :style="{ '--n': total }" aria-label="Phobos: compile and verify, assemble, link">
    <ol class="dt-phases">
      <li v-for="(p, i) in PHASES" :key="p.n" class="dt-phase">
        <p class="dt-n">{{ p.n }} · {{ p.name }}</p>
        <ul class="dt-in">
          <li v-for="x in p.inputs" :key="x">{{ x }}</li>
        </ul>
        <div class="dt-arrow" aria-hidden="true" />
        <div
          v-for="(s, j) in p.stages"
          :key="s.name"
          class="dt-stage"
          :style="{ '--k': order[i][j] }"
        >
          <b>{{ s.name }}</b>
          <span>{{ s.sub }}</span>
        </div>
        <div class="dt-arrow" aria-hidden="true" />
        <p class="dt-out" :class="{ last: i === PHASES.length - 1 }">{{ p.output }}</p>
      </li>
    </ol>
  </figure>
</template>

<style scoped>
.dt {
  margin: 24px 0;
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-top: 4px solid var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}
.dt-phases {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin: 0 !important;
  padding: 0 !important;
  list-style: none;
}
@media (max-width: 720px) {
  .dt-phases {
    grid-template-columns: 1fr;
  }
}
.dt-phase {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 !important;
  padding-left: 12px;
  border-left: 2px solid var(--vp-c-text-1);
}
.dt-n {
  margin: 0 !important;
  font: 700 11px/1.3 var(--vp-font-family-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
}
.dt-in {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0 !important;
  padding: 0 !important;
  list-style: none;
}
.dt-in li {
  margin: 0 !important;
  padding: 4px 8px;
  border: 1px dashed var(--vp-c-text-3);
  font: 12px/1.4 var(--vp-font-family-mono);
  color: var(--vp-c-text-2);
}
.dt-arrow {
  width: 2px;
  height: 14px;
  margin-left: 18px;
  background: var(--vp-c-text-1);
  position: relative;
}
.dt-arrow::after {
  content: '';
  position: absolute;
  left: -4px;
  bottom: -4px;
  border: 5px solid transparent;
  border-top-color: var(--vp-c-text-1);
}
.dt-stage {
  padding: 10px 12px;
  border: 2px solid var(--vp-c-text-1);
  background: var(--vp-c-bg);
  animation: dt-pulse calc(var(--n) * 1.1s) infinite;
  animation-delay: calc(var(--k) * 1.1s);
}
.dt-stage b {
  display: block;
  font-size: 16px;
}
.dt-stage span {
  font: 12px/1.4 var(--vp-font-family-mono);
  color: var(--vp-c-text-2);
}
.dt-out {
  margin: 0 !important;
  padding: 6px 10px;
  background: var(--vp-c-text-1);
  color: var(--vp-c-bg);
  font: 600 13px/1.4 var(--vp-font-family-mono);
}
.dt-out.last {
  background: var(--hf-red);
  color: #fff;
}
.dark .dt-out.last {
  background: var(--hf-red-press);
}
@keyframes dt-pulse {
  0%,
  22% {
    border-color: var(--hf-red);
    box-shadow: 5px 5px 0 var(--hf-red);
    transform: translate(-2px, -2px);
  }
  30%,
  100% {
    border-color: var(--vp-c-text-1);
    box-shadow: none;
    transform: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .dt-stage {
    animation: none;
  }
}
</style>
