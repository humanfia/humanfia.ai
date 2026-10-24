<script setup lang="ts">
// Every harness, by the name `-a` gives it. The `-a` line at the top is live: point at a harness
// and it is the one named, with how a turn of it is run under it.
import { computed, ref } from 'vue'
import { HARNESSES } from './data'

const at = ref(0)
const one = computed(() => HARNESSES[at.value])
/** The `-a` line for a harness, in the shapes the page has always used. */
const line = computed(() => {
  const h = one.value
  if (h.name === 'litellm') return { role: 'writer', rest: 'litellm@acct/openai/gpt-5' }
  // An ACP CLI is added by hand and named by its own command, not by `acp`.
  if (h.name === 'acp') return { role: 'builder', rest: 'your-cli/MODEL:EFFORT' }
  return { role: 'builder', rest: `${h.name}/${h.model ?? 'MODEL:EFFORT'}` }
})
</script>

<template>
  <div class="hn">
    <div class="hn-line" aria-live="polite">
      <code>
        <span class="dim">-a</span> {{ line.role }}=<b>{{ line.rest }}</b>
      </code>
      <p>
        <span>{{ one.product }} · {{ one.kind }}</span>
        {{ one.driven }}
      </p>
    </div>

    <ul class="hn-grid">
      <li v-for="(h, i) in HARNESSES" :key="h.name" :class="{ on: at === i, proto: h.kind === 'Protocol' }">
        <button type="button" :aria-pressed="at === i" @mouseenter="at = i" @focus="at = i" @click="at = i">
          <code>{{ h.name }}</code>
          <span>{{ h.product }}</span>
        </button>
      </li>
    </ul>

  </div>
</template>

<style scoped>
/* ---- the live -a line ------------------------------------------------------------------ */

.hn-line {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  align-items: center;
  gap: 12px 32px;
  padding: 22px 26px;
  margin-bottom: 18px;
  color: var(--hz-on-ink);
  background: var(--hz-ink);
}
.hn-line code {
  overflow-x: auto;
  white-space: nowrap;
  font-size: clamp(16px, 1.9vw, 26px);
  letter-spacing: -0.02em;
  color: var(--hz-on-ink);
  background: none;
  scrollbar-width: none;
}
.hn-line .dim {
  color: color-mix(in srgb, var(--hz-on-ink) 55%, transparent);
}
.hn-line b {
  color: #76b900;
  font-weight: 700;
}
.hn-line p {
  margin: 0;
  font-size: 14.5px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--hz-on-ink) 80%, transparent);
}
.hn-line p span {
  display: block;
  margin-bottom: 4px;
  font: 700 11px/1.3 var(--hz-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--hz-on-ink);
}

/* ---- the grid -------------------------------------------------------------------------- */

.hn-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  padding: 1px;
  list-style: none;
  background: var(--hz-line);
}
.hn-grid li {
  margin: 0;
}
.hn-grid button {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
  width: 100%;
  height: 100%;
  min-height: 108px;
  padding: 16px 14px 14px;
  text-align: left;
  background: var(--hz-bg);
  cursor: pointer;
  transition: background-color 0.25s, color 0.25s;
}
.hn-grid code {
  font-size: 15px;
  font-weight: 700;
  color: var(--hz-ink);
  background: none;
  overflow-wrap: anywhere;
}
.hn-grid span {
  font-size: 12.5px;
  line-height: 1.35;
  color: var(--hz-ink-3);
}
.hn-grid .proto button {
  background-image: repeating-linear-gradient(135deg, var(--hz-line-2) 0 1px, transparent 1px 7px);
}
.hn-grid .on button {
  background: var(--hz-ink);
}
.hn-grid .on code {
  color: var(--hz-on-ink);
}
.hn-grid .on span {
  color: color-mix(in srgb, var(--hz-on-ink) 70%, transparent);
}

@media (max-width: 1100px) {
  .hn-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .hn-line {
    grid-template-columns: minmax(0, 1fr);
  }
  .hn-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
