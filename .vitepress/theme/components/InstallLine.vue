<script setup lang="ts">
// The only instruction on this site, and deliberately not an introduction to anything. What
// Humanize 2 is, what it does and how to drive it is documented at hmz.humanfia.ai, which is a
// site of its own; a second, staler account of it here would be a promise nobody would keep.
import { onUnmounted, ref } from 'vue'

const LINE = 'pip install git+https://github.com/humanfia/humanize2.git'

const copied = ref(false)
let clearing: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(LINE)
  } catch {
    return
  }
  copied.value = true
  clearTimeout(clearing)
  clearing = setTimeout(() => (copied.value = false), 1600)
}

onUnmounted(() => clearTimeout(clearing))
</script>

<template>
  <div class="install">
    <button class="line" type="button" :aria-label="`Copy: ${LINE}`" @click="copy">
      <span class="prompt">$</span>
      <code>{{ LINE }}</code>
      <span class="copy" :class="{ done: copied }">{{ copied ? 'copied' : 'copy' }}</span>
    </button>
    <p class="under">
      Humanize 2, the runtime all of this runs on.
      <a href="https://hmz.humanfia.ai/">hmz.humanfia.ai</a>
    </p>
  </div>
</template>

<style scoped>
.install {
  max-width: 1152px;
  margin: -12px auto 0;
  padding: 0 24px;
  text-align: center;
}

.line {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  max-width: 100%;
  padding: 13px 14px 13px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
}

.line:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 4px var(--vp-c-brand-soft);
  transform: translateY(-1px);
}

.prompt {
  flex: none;
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

code {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy {
  flex: none;
  padding: 4px 9px;
  border-radius: 7px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.copy.done {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.under {
  margin: 14px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.under a {
  margin-left: 10px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

@media (max-width: 720px) {
  .line {
    padding-left: 12px;
    font-size: 11.5px;
  }
}
</style>
