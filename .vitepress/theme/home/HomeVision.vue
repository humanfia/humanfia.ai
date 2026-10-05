<script setup lang="ts">
// The ambition, as a poster: one flow framework at the foot of a rising diagonal, the five
// numbers it is meant to carry stepping up it, and the red circle -- the dot of the H -- climbing
// to the top corner. It plays once, when the section comes into view. With reduced motion the
// poster is simply shown finished.
import { onBeforeUnmount, onMounted, ref } from 'vue'

const SCALE = [
  { n: '100T', what: 'model' },
  { n: '1K', what: 'tokens per second' },
  { n: '1M', what: 'agents' },
  { n: '1M', what: 'environments and containers' },
  { n: '1M', what: 'minutes' },
]

const root = ref<HTMLElement | null>(null)
const on = ref(false)
let io: IntersectionObserver | null = null
onMounted(() => {
  if (!root.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    on.value = true
    return
  }
  io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        on.value = true
        io?.disconnect()
      }
    },
    { threshold: 0.3 },
  )
  io.observe(root.value)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <section ref="root" class="vis" :class="{ on }" aria-labelledby="vision-title">
    <div class="vis-plane" aria-hidden="true" />
    <div class="vis-beam" aria-hidden="true" />
    <span class="vis-dot" aria-hidden="true" />
    <div class="vis-wrap">
      <p class="vis-kicker">The ambition of Humanize</p>
      <h2 id="vision-title" class="vis-title"><span>1</span> flow framework</h2>
      <ol class="vis-scale">
        <li v-for="(s, i) in SCALE" :key="s.what" :style="{ '--i': i }">
          <b>{{ s.n }}</b><span>{{ s.what }}</span>
        </li>
      </ol>
      <p class="vis-goal">to solve one big problem.</p>
      <p class="vis-astra">Ad astra.</p>
      <p class="vis-note">A direction, not a measurement. What we can measure today is on <a href="/research/flow-science">Flow Science</a>.</p>
    </div>
  </section>
</template>

<style scoped>
.vis {
  --ink: #16161a;
  --paper: #ece6da;
  position: relative;
  overflow: hidden;
  padding: 120px 0 110px;
  background: var(--ink);
  color: var(--paper);
  isolation: isolate;
}
.dark .vis {
  --ink: #ece6da;
  --paper: #16161a;
}
.vis-plane {
  position: absolute;
  inset: -20% -10% auto auto;
  width: 70%;
  height: 160%;
  background: color-mix(in srgb, var(--paper) 6%, transparent);
  transform: rotate(-18deg) translateX(30%);
  transform-origin: top right;
  z-index: -1;
}
.vis-beam {
  position: absolute;
  left: -10%;
  bottom: 10%;
  width: 130%;
  height: 12px;
  background: var(--hf-red);
  transform: rotate(-18deg) scaleX(0);
  transform-origin: left center;
  transition: transform 1.6s cubic-bezier(0.2, 0.8, 0.2, 1);
  z-index: -1;
}
.vis.on .vis-beam {
  transform: rotate(-18deg) scaleX(1);
}
.vis-dot {
  position: absolute;
  width: clamp(56px, 9vw, 120px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--hf-red);
  left: 6%;
  bottom: 6%;
  transition: left 2.2s cubic-bezier(0.3, 0, 0.1, 1) 0.4s, bottom 2.2s cubic-bezier(0.5, 0, 0.2, 1) 0.4s;
  z-index: -1;
}
.vis.on .vis-dot {
  left: 84%;
  bottom: 74%;
}
.vis-wrap {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px;
}
.vis-kicker {
  margin: 0 0 12px;
  font: 700 12px/1.3 var(--vp-font-family-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--hf-red);
}
.vis-title {
  margin: 0;
  font-size: clamp(40px, 7vw, 88px);
  line-height: 0.95;
  letter-spacing: -0.04em;
  font-weight: 800;
  border: 0;
  padding: 0;
}
.vis-title span {
  color: var(--hf-red);
}
.vis-scale {
  display: grid;
  gap: 4px;
  margin: 40px 0 0;
  padding: 0;
  list-style: none;
}
.vis-scale li {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-left: calc(var(--i) * clamp(14px, 4vw, 64px));
  opacity: 0;
  transform: translate(-30px, 12px);
  transition: opacity 0.6s ease calc(0.3s + var(--i) * 0.16s), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) calc(0.3s + var(--i) * 0.16s);
}
.vis.on .vis-scale li {
  opacity: 1;
  transform: none;
}
.vis-scale b {
  min-width: 2.3em;
  font: 800 clamp(34px, 5.4vw, 64px) / 1 var(--vp-font-family-base);
  letter-spacing: -0.04em;
}
.vis-scale span {
  font: 600 clamp(13px, 1.6vw, 17px) / 1.3 var(--vp-font-family-mono);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: color-mix(in srgb, var(--paper) 72%, transparent);
}
.vis-goal {
  margin: 36px 0 0;
  font-size: clamp(20px, 2.6vw, 30px);
  font-weight: 600;
  letter-spacing: -0.01em;
}
.vis-astra {
  margin: 8px 0 0;
  font: italic 800 clamp(36px, 6vw, 72px) / 1 var(--vp-font-family-base);
  letter-spacing: -0.03em;
  color: var(--hf-red);
}
.vis-note {
  margin: 28px 0 0;
  max-width: 46ch;
  font-size: 13.5px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--paper) 70%, transparent);
}
.vis-note a {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: var(--hf-red);
}
@media (max-width: 640px) {
  .vis {
    padding-top: 150px;
  }
  .vis.on .vis-dot {
    left: calc(100% - 90px);
    bottom: calc(100% - 110px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .vis-beam,
  .vis-dot,
  .vis-scale li {
    transition: none !important;
  }
}
</style>
