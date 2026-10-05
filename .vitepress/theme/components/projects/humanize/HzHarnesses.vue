<script setup lang="ts">
// Every harness, by the name `-a` gives it. The `-a` line at the top is live: point at a harness
// and it is the one named, with how a turn of it is run under it. litellm is the new one, and
// not a CLI at all; it has a picture of its own beside a coding agent's turn.
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
      <li v-for="(h, i) in HARNESSES" :key="h.name" :class="{ on: at === i, hi: h.highlight, proto: h.kind === 'Protocol' }">
        <button type="button" :aria-pressed="at === i" @mouseenter="at = i" @focus="at = i" @click="at = i">
          <code>{{ h.name }}</code>
          <span>{{ h.product }}</span>
          <em v-if="h.highlight">new</em>
        </button>
      </li>
    </ul>

    <div class="hn-two">
      <div class="hn-turn">
        <p class="hn-tag">A coding-agent turn</p>
        <div class="hn-flow">
          <span class="box ink">turn · claude</span>
          <span class="wire"><i /></span>
          <span class="box frame">tools · files</span>
          <span class="wire"><i /></span>
          <span class="box grey">env</span>
        </div>
        <p class="hz-copy">The CLI works with its tools, in the env the turn names.</p>
      </div>
      <div class="hn-turn">
        <p class="hn-tag red">A litellm turn</p>
        <div class="hn-flow">
          <span class="box red">turn · litellm</span>
          <span class="wire long"><i class="red" /><small>history + prompt → one completion</small></span>
          <span class="box frame">model</span>
        </div>
        <p class="hz-copy"><b>env=None, always.</b> The history and the prompt go to the model, and an answer comes back.</p>
      </div>
    </div>
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
  color: #ff5a43;
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
.hn-grid em {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 3px 6px;
  font: 700 11px/1 var(--hz-mono);
  font-style: normal;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #fff;
  background: var(--hz-red);
}
.hn-grid .hi button {
  box-shadow: inset 0 0 0 2px var(--hz-red);
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

/* ---- two kinds of turn ----------------------------------------------------------------- */

.hn-two {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 18px;
}
.hn-turn {
  padding: 22px 24px;
  border: 1px solid var(--hz-line);
  background: var(--hz-card);
}
.hn-tag {
  margin: 0 0 18px;
  font: 700 11px/1 var(--hz-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--hz-ink-2);
}
.hn-tag.red {
  color: var(--hz-accent);
}
.hn-flow {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.box {
  flex: none;
  padding: 10px 12px;
  font: 600 12px/1 var(--hz-mono);
  white-space: nowrap;
}
.box.ink {
  color: var(--hz-on-ink);
  background: var(--hz-ink);
}
.box.red {
  color: #fff;
  background: var(--hz-red);
}
.box.grey {
  color: var(--hz-on-ink);
  background: var(--hz-ink-3);
}
.box.frame {
  color: var(--hz-ink);
  box-shadow: inset 0 0 0 2px var(--hz-ink);
}
.wire {
  position: relative;
  flex: 1;
  min-width: 18px;
  height: 2px;
  background: repeating-linear-gradient(90deg, var(--hz-ink) 0 5px, transparent 5px 9px);
}
.wire i {
  position: absolute;
  top: -4px;
  left: 0;
  width: 10px;
  height: 10px;
  background: var(--hz-ink);
  animation: hn-run 2.4s var(--hz-ease) infinite;
}
.wire i.red {
  background: var(--hz-red);
}
.wire small {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  text-align: center;
  font: 11px/1.2 var(--hz-mono);
  color: var(--hz-ink-3);
}
@keyframes hn-run {
  from {
    left: 0;
  }
  to {
    left: calc(100% - 10px);
  }
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
  .hn-two {
    grid-template-columns: minmax(0, 1fr);
  }
  .wire small {
    display: none;
  }
  .box {
    padding: 8px;
    font-size: 11px;
  }
  .hn-turn {
    padding: 18px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .wire i {
    animation: none;
    left: calc(100% - 10px);
  }
}
</style>
