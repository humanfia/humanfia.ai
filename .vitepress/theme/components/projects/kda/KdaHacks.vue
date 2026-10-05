<script setup lang="ts">
// The problem, shown rather than told: the speedups KDA's own agents claimed on the test suite,
// and what each was worth on inputs a real model produces. The figure starts on the tests, and the
// first time it is on screen it switches itself to the real inputs, once; after that the switch is
// the reader's. Under it, the six gates a kernel now has to clear to be released.
//
// From the `hacks:` and `gates:` frontmatter. A hack with no `real` value is one whose speedup did
// not survive at all, and says how in `realText`.
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useInView } from '../../kit/shared'
import { prefersReducedMotion } from '../../../home/motion'

interface Hack {
  key: string
  name: string
  claimed: number
  real?: number
  realText: string
  note: string
  released?: boolean
}

const props = defineProps<{ hacks: Hack[]; gates: string[]; href: string }>()

const MAX = 6
const mode = ref<'tests' | 'real'>('tests')
const touched = ref(false)
const fig = ref<HTMLElement | null>(null)
const seen = useInView(fig, 0.5)
let timer = 0

watch(seen, (now) => {
  if (!now || touched.value) return
  if (prefersReducedMotion()) {
    mode.value = 'real'
    return
  }
  timer = window.setTimeout(() => {
    if (!touched.value) mode.value = 'real'
  }, 1400)
})
onBeforeUnmount(() => clearTimeout(timer))

function pick(next: 'tests' | 'real') {
  touched.value = true
  clearTimeout(timer)
  mode.value = next
}

const rows = computed(() =>
  props.hacks.map((h) => {
    const value = mode.value === 'tests' ? h.claimed : h.real ?? 0
    const failed = mode.value === 'real' && h.real === undefined
    const shrank = mode.value === 'real' && h.real !== undefined && h.real < h.claimed
    return { ...h, value, failed, shrank }
  }),
)
const ticks = [1, 2, 3, 4, 5]
</script>

<template>
  <div ref="fig" class="hacks">
    <div class="hacks-top">
      <p class="kd-kicker">KDA² candidates · speedup over FlashKDA · B300</p>
      <div class="kd-switch" role="group" aria-label="Measured on">
        <button type="button" :aria-pressed="mode === 'tests'" @click="pick('tests')">Synthetic tests</button>
        <button type="button" :aria-pressed="mode === 'real'" @click="pick('real')">Real inputs</button>
      </div>
    </div>

    <div class="hacks-plot">
      <div class="hacks-grid" aria-hidden="true">
        <i v-for="x in ticks" :key="x" :style="{ left: `${(x / MAX) * 100}%` }"><span class="kd-mono">{{ x }}×</span></i>
      </div>
      <div
        v-for="r in rows"
        :key="r.key"
        class="hack"
        :class="{ released: r.released, failed: r.failed, shrank: r.shrank }"
      >
        <div class="hack-label">
          <span class="hack-key kd-mono">{{ r.key }}</span>
          <span class="hack-name">{{ r.name }}</span>
        </div>
        <div class="hack-track">
          <i class="hack-ghost" :style="{ width: `${(r.claimed / MAX) * 100}%` }" />
          <i class="hack-bar" :style="{ transform: `scaleX(${r.value / MAX})` }" />
          <span class="hack-value kd-mono" :style="{ left: `${(r.value / MAX) * 100}%` }">
            {{ r.failed ? r.realText : `${r.value.toFixed(2)}×` }}
          </span>
        </div>
        <p class="hack-note">{{ mode === 'real' && !r.released && r.real !== undefined ? `${r.realText}. ` : '' }}{{ r.note }}</p>
      </div>
    </div>

    <p class="sr-only" aria-live="polite">
      {{ mode === 'tests' ? 'On the synthetic tests' : 'On real model inputs' }}:
      {{ rows.map((r) => `${r.name}, ${r.failed ? r.realText : r.value.toFixed(2) + '×'}`).join('; ') }}.
    </p>

    <div class="gates">
      <p class="kd-kicker">Six gates now stand between a candidate and release</p>
      <ol>
        <li v-for="(g, i) in gates" :key="g" :style="{ '--i': i }">
          <span class="kd-mono">{{ String(i + 1).padStart(2, '0') }}</span>{{ g }}
        </li>
      </ol>
      <a class="kd-link kd-mono gates-more" :href="href">How each hack worked, and how each gate stops it →</a>
    </div>
  </div>
</template>

<style scoped>
.hacks {
  padding: clamp(20px, 2.6vw, 32px);
  border: 1px solid var(--kd-line);
  background: var(--kd-card);
}

.hacks-top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-bottom: 26px;
}

.hacks-plot {
  position: relative;
  padding-top: 22px;
}

.hacks-grid {
  position: absolute;
  inset: 0 0 0 0;
  pointer-events: none;
}

.hacks-grid i {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--kd-grid);
}

.hacks-grid span {
  position: absolute;
  top: 0;
  left: 4px;
  font-size: 11px;
  color: var(--kd-fg-3);
}

.hack {
  position: relative;
  padding: 12px 0 16px;
  border-top: 1px solid var(--kd-line);
}

.hack-label {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 8px;
}

.hack-key {
  display: inline-grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  font-size: 12px;
  font-weight: 700;
  color: var(--kd-fg);
  border: 1px solid var(--kd-fg-3);
}

.released .hack-key {
  color: var(--kd-on-red);
  background: var(--kd-red);
  border-color: var(--kd-red);
}

.hack-name {
  font-size: 15px;
  font-weight: 650;
  color: var(--kd-fg);
}

.hack-track {
  position: relative;
  height: 26px;
}

/* What it claimed, left behind as an outline when the real number is smaller. */
.hack-ghost {
  position: absolute;
  inset: 0 auto 0 0;
  border: 1px dashed var(--kd-fg-3);
  opacity: 0;
  transition: opacity 0.4s var(--kd-ease);
}

.shrank .hack-ghost,
.failed .hack-ghost {
  opacity: 1;
}

.failed .hack-ghost {
  background: repeating-linear-gradient(
    -45deg,
    transparent 0 6px,
    color-mix(in srgb, var(--kd-fg-3) 30%, transparent) 6px 7px
  );
}

.hack-bar {
  position: absolute;
  inset: 0;
  background: var(--kd-fg);
  transform-origin: left;
  transition: transform 1s var(--kd-ease);
}

.released .hack-bar {
  background: var(--kd-red);
}

.hack-value {
  position: absolute;
  top: 50%;
  margin-left: 10px;
  transform: translateY(-50%);
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  color: var(--kd-fg);
  transition: left 1s var(--kd-ease);
}

.failed .hack-value {
  color: var(--kd-red-text);
}

.released .hack-value {
  color: var(--kd-red-text);
}

.hack-note {
  max-width: 60ch;
  margin: 8px 0 0;
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--kd-fg-2);
}

.gates {
  margin-top: 26px;
  padding-top: 22px;
  border-top: 2px solid var(--kd-fg);
}

.gates ol {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
  background: var(--kd-line);
  border: 1px solid var(--kd-line);
}

.gates li {
  display: flex;
  gap: 10px;
  padding: 12px;
  font-size: 13.5px;
  line-height: 1.4;
  background: var(--kd-card);
}

.gates li span {
  color: var(--kd-red-text);
  font-weight: 700;
}

.gates-more {
  display: inline-block;
  margin-top: 16px;
  font-size: 12.5px;
}

.hacks-top .kd-switch button {
  white-space: nowrap;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 640px) {
  .gates ol {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
