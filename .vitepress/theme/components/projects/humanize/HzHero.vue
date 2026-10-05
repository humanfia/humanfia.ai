<script setup lang="ts">
// The first screen: what Humanize is in one line, the one command that installs it, and the
// run it makes, running (HzRun). Behind it, the run's clock ruled across the whole page and one
// red plane on the poster's diagonal; as the hero scrolls away the plane slides and the copy
// lifts, driven by where the hero is rather than by a timer.
import { computed, onBeforeUnmount, ref } from 'vue'
import { clamp, useScrollProgress } from '../../../home/motion'
import { REPO } from './data'
import HzRun from './HzRun.vue'

const props = defineProps<{ motion: boolean }>()

// Declared here, not imported: `pnpm check:docs` follows ${DOCS} only in a file that names it.
const DOCS = 'https://docs.humanfia.ai/humanize'

const WAYS = [
  { key: 'uv', line: `uv tool install git+${REPO}.git` },
  { key: 'pip', line: `pip install git+${REPO}.git` },
]
const at = ref(0)
const copied = ref(false)
let clear: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(WAYS[at.value].line)
    copied.value = true
    clearTimeout(clear)
    clear = setTimeout(() => (copied.value = false), 1800)
  } catch {
    // No clipboard (plain http, or no gesture the browser recognises): the line is selectable.
  }
}
onBeforeUnmount(() => clearTimeout(clear))

const el = ref<HTMLElement | null>(null)
const p = useScrollProgress(el, (box) => clamp(-box.top / Math.max(1, box.height)))
const plane = computed(() => (props.motion ? { transform: `translate3d(${p.value * 30}%, ${p.value * -40}%, 0) rotate(-24deg)` } : {}))
const copyLift = computed(() =>
  props.motion ? { transform: `translate3d(0, ${p.value * -60}px, 0)`, opacity: 1 - clamp((p.value - 0.15) * 1.6) } : {},
)
</script>

<template>
  <section ref="el" class="hero" aria-labelledby="hz-title">
    <div class="hero-rule" aria-hidden="true">
      <i v-for="n in 12" :key="n" />
    </div>

    <div class="hz-wrap hero-grid">
      <div class="hero-copy" :style="copyLift">
        <p class="hz-kicker hz-load" style="--d: 0.05s">Humanize · the agent flow system</p>
        <h1 id="hz-title" class="hero-title hz-load" style="--d: 0.15s">
          One flow.<br />Every agent.<br />One <span>trace.</span>
        </h1>
        <p class="hz-lead hz-load" style="--d: 0.3s">
          Humanize drives the coding-agent CLI you already log into, in the order a flow asks for,
          and writes the whole run down as it happens. Every other project on this site stands on
          it.
        </p>

        <div class="hero-install hz-load" style="--d: 0.45s">
          <div class="hero-ways" role="tablist" aria-label="Install with">
            <button
              v-for="(way, i) in WAYS"
              :key="way.key"
              type="button"
              role="tab"
              :aria-selected="at === i"
              :class="{ on: at === i }"
              @click="(at = i), (copied = false)"
            >
              {{ way.key }}
            </button>
          </div>
          <div class="hero-line">
            <code><span aria-hidden="true">$</span>{{ WAYS[at].line }}</code>
            <button type="button" class="hero-copy-btn" :class="{ done: copied }" @click="copy">
              {{ copied ? 'copied' : 'copy' }}
            </button>
          </div>
        </div>

        <div class="hz-actions hz-load" style="--d: 0.58s">
          <a class="hz-btn primary" href="#get-started">Run your first flow</a>
          <a class="hz-btn ghost" :href="`${DOCS}/`" target="_blank" rel="noreferrer">Documentation <span aria-hidden="true">↗</span></a>
        </div>
        <p class="hero-meta hz-load" style="--d: 0.7s">
          Open source · Apache-2.0 · Python ≥ 3.12 ·
          <a :href="REPO" target="_blank" rel="noreferrer">humanfia/humanize ↗</a>
        </p>
      </div>

      <div class="hero-art hz-load" style="--d: 0.35s">
        <div class="hero-plane" aria-hidden="true" :style="plane" />
        <HzRun class="hero-run" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: calc(100svh - var(--vp-nav-height));
  display: flex;
  align-items: center;
  padding: clamp(48px, 7vh, 96px) 0 clamp(64px, 9vh, 120px);
  overflow: hidden;
}

/* The run's clock, ruled across the page: twelve hours, faint. */
.hero-rule {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  pointer-events: none;
}
.hero-rule i {
  border-left: 1px solid var(--hz-line-2);
}
/* One red plane on the poster's diagonal, behind the run. */
.hero-plane {
  position: absolute;
  left: -12%;
  right: -60%;
  top: 46%;
  height: 132px;
  background: var(--hz-red);
  opacity: 0.12;
  transform: rotate(-24deg);
  pointer-events: none;
}

.hero-grid {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  align-items: center;
  gap: clamp(32px, 5vw, 80px);
  width: 100%;
}

.hero-title {
  margin: 0;
  font-size: clamp(48px, 6.6vw, 104px);
  line-height: 0.94;
  letter-spacing: -0.05em;
  font-weight: 800;
  color: var(--hz-ink);
}
.hero-title span {
  color: var(--hz-red);
}
.hero-copy .hz-lead {
  margin-top: 26px;
  max-width: 540px;
}

/* ---- the install line ------------------------------------------------------------------ */

.hero-install {
  margin-top: 32px;
  max-width: 560px;
}
.hero-ways {
  display: flex;
  gap: 2px;
}
.hero-ways button {
  padding: 6px 14px;
  font: 700 11.5px/1 var(--hz-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--hz-ink-3);
  background: transparent;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
}
.hero-ways button:hover {
  color: var(--hz-ink);
}
.hero-ways button.on {
  color: var(--hz-on-ink);
  background: var(--hz-ink);
}
.hero-line {
  display: flex;
  align-items: stretch;
  border: 2px solid var(--hz-ink);
  background: var(--hz-card);
}
.hero-line code {
  flex: 1;
  min-width: 0;
  padding: 13px 14px;
  overflow-x: auto;
  white-space: nowrap;
  font-size: 13px;
  color: var(--hz-ink);
  background: none;
  scrollbar-width: none;
}
.hero-line code span {
  margin-right: 10px;
  color: var(--hz-red);
  user-select: none;
}
.hero-copy-btn {
  flex: none;
  width: 84px;
  font: 700 11.5px/1 var(--hz-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--hz-on-ink);
  background: var(--hz-ink);
  cursor: pointer;
  transition: background-color 0.2s;
}
.hero-copy-btn:hover,
.hero-copy-btn.done {
  background: var(--hz-red);
  color: #fff;
}

.hero-copy .hz-actions {
  margin-top: 24px;
}
.hero-meta {
  margin: 22px 0 0;
  font: 12px/1.6 var(--hz-mono);
  color: var(--hz-ink-3);
}
.hero-meta a {
  color: var(--hz-ink-2);
}
.hero-meta a:hover {
  color: var(--hz-accent);
}

.hero-art {
  position: relative;
  min-width: 0;
  padding-right: 14px;
}
.hero-run {
  position: relative;
}

@media (max-width: 1080px) {
  .hero-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .hero {
    min-height: 0;
  }
  .hero-art {
    max-width: 720px;
  }
  .hero-rule {
    grid-template-columns: repeat(6, 1fr);
  }
  .hero-rule i:nth-child(n + 7) {
    display: none;
  }
}
</style>
