<script setup lang="ts">
// The four numbers, counted up once when they come into view. The count is decoration -- the
// final value is in the DOM from the first render, so a reader with JavaScript off, a crawler,
// or anybody who has asked for reduced motion sees the number and not an animation of zero.
import { onMounted, onUnmounted, ref } from 'vue'

interface Stat {
  /** What the number counts up to. `null` means it is not a number and is simply shown. */
  to: number | null
  text: string
  decimals?: number
  prefix?: string
  suffix?: string
  what: string
  who: string
  href: string
}

const STATS: Stat[] = [
  {
    to: 6,
    text: '6 / 6',
    suffix: ' / 6',
    what: 'IMO 2026 problems solved, every proof machine-checked in Lean 4',
    who: 'HOA',
    href: '/applications/hoa',
  },
  {
    to: 99.7,
    text: '99.7%',
    decimals: 1,
    suffix: '%',
    what: 'PutnamBench: 670 of 672 formal statements, first on the official leaderboard',
    who: 'HOA',
    href: '/applications/hoa',
  },
  {
    to: null,
    text: '#1–#3',
    what: 'Track placements at the MLSys 2026 FlashInfer kernel contest, with MIT HAN Lab',
    who: 'KDA',
    href: '/applications/kda',
  },
  {
    to: 13,
    text: '13',
    what: 'Kaggle competitions entered and audited in public, official finishes kept apart from estimates',
    who: 'AgentKaggle',
    href: '/applications/agentkaggle',
  },
]

const shown = ref(STATS.map((stat) => stat.text))
const root = ref<HTMLElement | null>(null)

let frame = 0
let observer: IntersectionObserver | undefined

function run() {
  const started = performance.now()
  const DURATION = 1100

  const step = (now: number) => {
    // Ease out, so the numbers arrive rather than stop.
    const t = Math.min((now - started) / DURATION, 1)
    const eased = 1 - (1 - t) ** 3

    shown.value = STATS.map((stat) => {
      if (stat.to === null) return stat.text
      const at = (stat.to * eased).toFixed(stat.decimals ?? 0)
      return `${stat.prefix ?? ''}${at}${stat.suffix ?? ''}`
    })

    if (t < 1) frame = requestAnimationFrame(step)
  }

  frame = requestAnimationFrame(step)
}

onMounted(() => {
  if (!root.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!('IntersectionObserver' in window)) return

  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      observer?.disconnect()
      run()
    },
    { threshold: 0.4 },
  )
  observer.observe(root.value)
})

onUnmounted(() => {
  observer?.disconnect()
  cancelAnimationFrame(frame)
})
</script>

<template>
  <div ref="root" class="numbers">
    <a v-for="(stat, i) in STATS" :key="stat.who + stat.what" class="stat" :href="stat.href">
      <b>{{ shown[i] }}</b>
      <span>{{ stat.what }}</span>
      <em>{{ stat.who }}</em>
    </a>
  </div>
</template>

<style scoped>
.numbers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin: 0;
}

.stat {
  position: relative;
  padding: 20px 20px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
  color: inherit;
  text-decoration: none;
  overflow: hidden;
  transition: border-color 0.25s, transform 0.25s, background-color 0.25s;
}

/* A thin bar of the accent that fills in on hover, along the top edge. */
.stat::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 2px;
  background: var(--vp-c-brand-2);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s;
}

.stat:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-alt);
  transform: translateY(-2px);
}

.stat:hover::before {
  transform: scaleX(1);
}

b {
  display: block;
  font-size: 34px;
  line-height: 1.1;
  letter-spacing: -0.035em;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
  color: var(--vp-c-text-1);
}

span {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-3);
}

em {
  display: block;
  margin-top: 10px;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-style: normal;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
}

@media (prefers-reduced-motion: reduce) {
  .stat,
  .stat::before {
    transition: none;
  }
}
</style>
