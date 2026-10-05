<script setup lang="ts">
// How the loop works, told as the reader scrolls: the diagram holds still beside (or above, on a
// phone) four short steps, and whichever step is at the middle of the window lights its part of
// the loop -- the research, the contract, the write-validate-bench-profile ring with a candidate
// going round it, and the record under all of it. Lit parts stay lit, so by the last step the
// whole loop is on.
//
// The steps are the `loop:` frontmatter: a title, a sentence or two (`code` in backticks), and
// the `stage` of the diagram it lights: research, contract, ring or record.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useMotion } from './motion'

interface Step {
  title: string
  text: string
  stage: 'research' | 'contract' | 'ring' | 'record'
}

const props = defineProps<{ steps: Step[] }>()

const motion = useMotion()
const active = ref(-1)
const cards = ref<HTMLElement[]>([])
let io: IntersectionObserver | null = null

onMounted(() => {
  io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const at = cards.value.indexOf(entry.target as HTMLElement)
        if (at >= 0) active.value = at
      }
    },
    { rootMargin: '-48% 0px -48% 0px' },
  )
  cards.value.forEach((card) => io!.observe(card))
})
onBeforeUnmount(() => io?.disconnect())

const STAGES = ['research', 'contract', 'ring', 'record'] as const
/** Every stage up to the active step's is lit; before the first step, nothing is dimmed. */
const lit = computed(() => {
  if (active.value < 0) return new Set<string>(STAGES)
  const upto = STAGES.indexOf(props.steps[active.value].stage)
  return new Set<string>(STAGES.slice(0, upto + 1))
})
const now = computed(() => (active.value < 0 ? null : props.steps[active.value].stage))

/** `code` in backticks, as code; everything else as text. */
const parts = (text: string) => text.split('`').map((t, i) => ({ t, code: i % 2 === 1 }))
</script>

<template>
  <div class="loop">
    <div class="loop-stick">
      <div
        class="loop-fig"
        :class="[...lit].map((s) => `lit-${s}`).concat(now ? [`now-${now}`] : [], motion ? ['moving'] : [])"
        role="img"
        aria-label="The KDA loop: research, then a contract written before any code, then a ring of write, validate, benchmark and profile. A candidate that is faster but wrong is refused at validation; one that clears the bar is promoted. Every step is written to a record."
      >
        <svg class="loop-wires" viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden="true">
          <path class="w w-research" d="M50 50 V150" />
          <path class="w w-contract" d="M50 150 H150" />
          <path class="w w-ring" d="M150 150 H250 V250 H150 Z" />
          <path class="w w-refuse" d="M250 150 V50" />
          <path class="w w-promote" d="M150 250 H50" />
        </svg>

        <div class="node n-research" style="grid-area: 1 / 1"><span class="kd-mono">01</span>Research</div>
        <div class="node n-contract" style="grid-area: 2 / 1"><span class="kd-mono">02</span>Contract</div>
        <div class="node n-ring" style="grid-area: 2 / 2"><span class="kd-mono">03</span>Write</div>
        <div class="node n-ring" style="grid-area: 2 / 3"><span class="kd-mono">04</span>Validate</div>
        <div class="node n-ring" style="grid-area: 3 / 3"><span class="kd-mono">05</span>Bench</div>
        <div class="node n-ring" style="grid-area: 3 / 2"><span class="kd-mono">06</span>Profile</div>
        <div class="stamp s-refuse" style="grid-area: 1 / 3"><span>faster, and wrong:</span><b>Refused</b></div>
        <div class="stamp s-promote" style="grid-area: 3 / 1"><b>Promoted</b><span>cleared the bar</span></div>

        <i class="token" aria-hidden="true" />
        <i class="token reject" aria-hidden="true" />
      </div>
      <div class="ledger" :class="{ on: lit.has('record') && active >= 0, now: now === 'record' }" aria-hidden="true">
        <span class="kd-mono">record</span>
        <i v-for="k in ['candidates', 'benchmarks', 'profiles', 'decisions']" :key="k" class="kd-mono">{{ k }}</i>
      </div>
    </div>

    <ol class="loop-steps">
      <li
        v-for="(step, i) in steps"
        :key="step.title"
        ref="cards"
        class="step"
        :class="{ on: i === active }"
      >
        <span class="step-n kd-mono">{{ String(i + 1).padStart(2, '0') }} / {{ String(steps.length).padStart(2, '0') }}</span>
        <h3>{{ step.title }}</h3>
        <p>
          <template v-for="(p, pi) in parts(step.text)" :key="pi"><code v-if="p.code">{{ p.t }}</code><template v-else>{{ p.t }}</template></template>
        </p>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.loop {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: clamp(40px, 6vw, 96px);
  align-items: start;
}

.loop-stick {
  position: sticky;
  top: calc(var(--vp-nav-height) + 48px);
  z-index: 2;
  background: var(--kd-bg);
}

.loop-fig {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(0, 1fr));
  aspect-ratio: 1.25;
  gap: 0;
}

.loop-wires {
  position: absolute;
  /* half a cell in from every side is the cell centres: the wires run centre to centre */
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.w {
  fill: none;
  stroke: var(--kd-line);
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
  transition: stroke 0.5s var(--kd-ease);
}

.lit-research .w-research,
.lit-contract .w-contract,
.lit-ring .w-ring {
  stroke: var(--kd-fg);
}

.lit-ring .w-refuse {
  stroke: var(--kd-fg-3);
  stroke-dasharray: 5 5;
}

.lit-record .w-promote {
  stroke: var(--kd-red);
}

.node,
.stamp {
  position: relative;
  z-index: 1;
  place-self: center;
  width: 78%;
  padding: 12px 10px;
  text-align: center;
  font-size: clamp(13px, 1.25vw, 16px);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--kd-fg-3);
  background: var(--kd-bg);
  border: 1.5px solid var(--kd-line);
  transition:
    color 0.4s var(--kd-ease),
    background 0.4s var(--kd-ease),
    border-color 0.4s var(--kd-ease),
    transform 0.5s var(--kd-ease);
}

.node span {
  display: block;
  margin-bottom: 2px;
  font-size: 11px;
  font-weight: 600;
  opacity: 0.7;
}

.lit-research .n-research,
.lit-contract .n-contract,
.lit-ring .n-ring {
  color: var(--kd-bg);
  background: var(--kd-fg);
  border-color: var(--kd-fg);
}

.now-research .n-research,
.now-contract .n-contract {
  transform: scale(1.06);
  box-shadow: 6px 6px 0 var(--kd-red);
}

.stamp {
  display: grid;
  gap: 2px;
  font-family: var(--kd-mono);
  font-size: 11px;
  font-weight: 500;
  border-style: dashed;
}

.stamp b {
  font-family: var(--vp-font-family-base);
  font-size: clamp(13px, 1.25vw, 16px);
  font-weight: 700;
}

.lit-ring .s-refuse {
  color: var(--kd-red-text);
  border-color: var(--kd-red);
  transform: rotate(-4deg);
}

.lit-record .s-promote {
  color: var(--kd-on-red);
  background: var(--kd-red);
  border: 1.5px solid var(--kd-red);
  transform: rotate(-4deg);
}

/* A candidate, going round the ring (the passing one) or stopping at Validate (the cheat). */
.token {
  position: absolute;
  z-index: 3;
  left: 50%;
  top: 50%;
  width: 14px;
  height: 14px;
  margin: -7px 0 0 -7px;
  background: var(--kd-red);
  opacity: 0;
  pointer-events: none;
}

.token.reject {
  background: var(--kd-fg-3);
}

.moving.now-ring .token,
.moving.now-record .token {
  opacity: 1;
  animation: kd-ring 4.8s linear infinite;
}

.moving.now-ring .token.reject {
  animation: kd-reject 4.8s var(--kd-ease) infinite;
}

.moving.now-record .token.reject {
  display: none;
}

@keyframes kd-ring {
  0% { left: 50%; top: 50%; }
  25% { left: 83.33%; top: 50%; }
  50% { left: 83.33%; top: 83.33%; }
  75% { left: 50%; top: 83.33%; }
  100% { left: 50%; top: 50%; }
}

@keyframes kd-reject {
  0% { left: 50%; top: 50%; opacity: 0; }
  8% { opacity: 1; }
  30% { left: 83.33%; top: 50%; }
  55% { left: 83.33%; top: 16.67%; opacity: 1; }
  70%, 100% { left: 83.33%; top: 16.67%; opacity: 0; }
}

.ledger {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
  padding: 10px 12px;
  border: 1.5px solid var(--kd-line);
  transition:
    border-color 0.4s var(--kd-ease),
    background 0.4s var(--kd-ease);
}

.ledger span {
  margin-right: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--kd-fg-3);
}

.ledger i {
  padding: 3px 8px;
  font-size: 11.5px;
  font-style: normal;
  color: var(--kd-fg-3);
  border: 1px solid var(--kd-line);
}

.ledger.on {
  border-color: var(--kd-fg);
}

.ledger.on span,
.ledger.on i {
  color: var(--kd-fg);
}

.ledger.now {
  box-shadow: 6px 6px 0 var(--kd-red);
}

.loop-steps {
  margin: 0;
  padding: 0;
  list-style: none;
}

.step {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 52vh;
  padding: 24px 0;
  opacity: 0.35;
  transition: opacity 0.5s var(--kd-ease);
}

.step:first-child {
  min-height: 36vh;
  justify-content: flex-start;
}

.step.on {
  opacity: 1;
}

.step-n {
  font-size: 12px;
  font-weight: 600;
  color: var(--kd-red-text);
}

.step h3 {
  margin: 10px 0 12px;
  font-size: clamp(26px, 2.6vw, 36px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.035em;
  color: var(--kd-fg);
}

.step p {
  max-width: 46ch;
  margin: 0;
  font-size: 17px;
  line-height: 1.65;
  color: var(--kd-fg-2);
}

.step code {
  font-family: var(--kd-mono);
  font-size: 0.88em;
  padding: 1px 5px;
  background: var(--kd-grid);
}

/* Without motion, or on the server, every step reads at full strength. */
.loop:not(:has(.moving)) .step {
  opacity: 1;
}

@media (max-width: 960px) {
  .loop {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
  }
  .loop-stick {
    /* under the theme's local nav, which is what is pinned at the top of a phone */
    top: 48px;
    padding: 12px 0;
    margin: 0 calc(-1 * var(--kd-pad));
    padding-left: var(--kd-pad);
    padding-right: var(--kd-pad);
    border-bottom: 1px solid var(--kd-line);
  }
  .loop-fig {
    aspect-ratio: 1.6;
    max-width: 520px;
    margin: 0 auto;
  }
  .node,
  .stamp {
    width: 88%;
    padding: 7px 4px;
    font-size: 12px;
  }
  .stamp span {
    display: none;
  }
  .stamp b {
    font-size: 12px;
  }
  .lit-ring .s-refuse,
  .lit-record .s-promote {
    transform: rotate(-3deg);
  }
  .node span {
    display: none;
  }
  .ledger {
    max-width: 520px;
    margin: 10px auto 0;
    padding: 6px 8px;
  }
  .ledger i {
    font-size: 11px;
    padding: 2px 5px;
  }
  .step {
    min-height: 44vh;
  }
  .step:first-child {
    min-height: 0;
  }
}
</style>
