<script setup lang="ts">
// The page's last band, on the ink: why KDA is one of Humanfia's projects, and how to run it --
// the clone command as a terminal line with a copy button, and the slot's links under it.
import { onBeforeUnmount, ref } from 'vue'
import { vReveal } from '../../../home/motion'
import { useMotion } from './motion'
import './kda.css'

const props = defineProps<{ command: string }>()

const motion = useMotion()
const copied = ref(false)
let timer = 0

async function copy() {
  try {
    await navigator.clipboard.writeText(props.command)
    copied.value = true
    clearTimeout(timer)
    timer = window.setTimeout(() => (copied.value = false), 1600)
  } catch {
    /* the command is on screen to select by hand */
  }
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <section class="kd-band kd-ink coda" :class="{ 'kd-motion': motion }">
    <div class="kd-wrap coda-grid">
      <div v-reveal class="coda-col">
        <p class="kd-index"><b>08</b>Why it is here</p>
        <h2 id="why-it-is-here" class="coda-title" tabindex="-1">Where our flows go to be found out.</h2>
        <div class="kd-prose"><slot name="why" /></div>
      </div>

      <div v-reveal="120" class="coda-col">
        <p class="kd-index"><b>09</b>Try it</p>
        <h2 id="try-it" class="coda-title" tabindex="-1">An early prototype. Feedback wanted.</h2>
        <div class="term">
          <div class="term-bar" aria-hidden="true"><i /><i /><i /><span class="kd-mono">sh</span></div>
          <div class="term-body">
            <code class="kd-mono"><span class="term-prompt" aria-hidden="true">$ </span>{{ command }}</code>
            <button type="button" class="term-copy kd-mono" @click="copy">{{ copied ? 'Copied' : 'Copy' }}</button>
          </div>
        </div>
        <div class="kd-prose"><slot name="try" /></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.coda-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(48px, 7vw, 120px);
}

.coda-title {
  margin: 18px 0 24px;
  font-size: clamp(30px, 3.4vw, 48px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.04em;
  text-wrap: balance;
  scroll-margin-top: calc(var(--vp-nav-height) + 24px);
}

.term {
  margin-bottom: 26px;
  border: 1px solid var(--kd-line);
  background: var(--hf-night-2);
  box-shadow: 10px 10px 0 var(--kd-red);
}

.term-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 12px;
  border-bottom: 1px solid var(--kd-line);
}

.term-bar i {
  width: 9px;
  height: 9px;
  background: var(--kd-fg-3);
  opacity: 0.6;
}

.term-bar i:first-child {
  background: var(--kd-red);
  opacity: 1;
}

.term-bar span {
  margin-left: auto;
  font-size: 11px;
  color: var(--kd-fg-3);
}

.term-body {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 16px;
}

.term-body code {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--hf-paper);
  overflow-wrap: anywhere;
}

.term-prompt {
  color: var(--kd-red);
  user-select: none;
}

.term-copy {
  flex: none;
  padding: 5px 10px;
  font-size: 12px;
  color: var(--kd-fg);
  border: 1px solid var(--kd-line);
  background: transparent;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.term-copy:hover {
  color: var(--kd-bg);
  background: var(--kd-fg);
}

@media (max-width: 860px) {
  .coda-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
