<script setup lang="ts">
// The agent runs here. Its syscalls land there.
//
// The anchor, drawn: a seccomp-filtered ptrace supervisor sits between the coding agent and
// the kernel and decides every call one at a time -- replay it on the target, or answer it on
// this machine. The calls below walk in a loop so the two answers are something you watch
// rather than read about, and the side the call lands on lights up with it.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const DOCS = 'https://docs.humanfia.ai/humanize2'

interface Call {
  call: string
  by: string
  to: 'target' | 'here'
}

/** The six the documentation shows, in its order. */
const CALLS: Call[] = [
  { call: 'openat("kernel.cu")', by: 'the agent', to: 'target' },
  { call: 'write("kernel.cu")', by: 'the agent', to: 'target' },
  { call: 'execve("pytest")', by: 'the agent', to: 'target' },
  { call: 'connect("pypi.org")', by: 'pytest', to: 'target' },
  { call: 'connect(the model provider)', by: 'the agent', to: 'here' },
  { call: 'openat("~/.claude/…")', by: 'the agent', to: 'here' },
]

const at = ref(-1)
const motion = ref(false)
const held = ref(false)
const onScreen = ref(true)
const root = ref<HTMLElement | null>(null)

const live = computed(() => (at.value < 0 ? null : CALLS[at.value]))

let timer: ReturnType<typeof setInterval> | undefined
let watcher: IntersectionObserver | undefined

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  motion.value = true
  at.value = 0

  if (root.value && 'IntersectionObserver' in window) {
    watcher = new IntersectionObserver(
      (entries) => (onScreen.value = entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.2 },
    )
    watcher.observe(root.value)
  }

  timer = setInterval(() => {
    if (!held.value && onScreen.value) at.value = (at.value + 1) % CALLS.length
  }, 1900)
})

onBeforeUnmount(() => {
  clearInterval(timer)
  watcher?.disconnect()
})

const hold = (i: number) => {
  held.value = true
  at.value = i
}
</script>

<template>
  <figure ref="root" class="anchor" :class="{ still: !motion }" @mouseleave="held = false">
    <div class="ends">
      <!-- What the agent thinks it is running on. -->
      <section class="end" :class="{ lit: live?.to === 'here' }">
        <p class="eyebrow">this machine</p>
        <h4>The agent, and what it is not told</h4>
        <p class="line">claude · codex · dsh · … unchanged, and told none of this</p>
        <ul>
          <li>credentials</li>
          <li>state</li>
          <li>the model provider</li>
        </ul>
        <p class="foot">answered here</p>
      </section>

      <!-- The supervisor, and the six calls going through it. -->
      <section class="middle">
        <p class="eyebrow mid">syscalls</p>
        <div class="sup">
          <strong>supervisor</strong>
          <span>seccomp filter · ptrace</span>
          <span>every call decided one at a time</span>
        </div>

        <ol class="calls">
          <li
            v-for="(item, i) in CALLS"
            :key="item.call"
            :class="[item.to, { on: at === i }]"
            @mouseenter="hold(i)"
          >
            <span class="arrow" aria-hidden="true">{{ item.to === 'here' ? '←' : '→' }}</span>
            <code>{{ item.call }}</code>
            <span class="by">{{ item.by }}</span>
          </li>
        </ol>
      </section>

      <!-- Where the work actually lands. -->
      <section class="end" :class="{ lit: live?.to === 'target' }">
        <p class="eyebrow">the target</p>
        <h4>ssh · docker · tcp · a pipe</h4>
        <p class="line"><code>hmz anchor serve</code></p>
        <ul>
          <li><b>files</b> contents, renames, modes — the target's own errors</li>
          <li><b>processes</b> everything the agent spawns, in the target's cwd</li>
          <li><b>the network</b> whatever those commands reach</li>
        </ul>
        <p class="foot">replayed there</p>
      </section>
    </div>

    <figcaption>
      No plugin, no configuration, no cooperation — the agent is told none of it, because it is
      not asked. Reads come out of a local mirror at local speed, and the mirror and the target
      are kept in step. <a :href="`${DOCS}/features/anchor`">How it works, syscall by syscall ↗</a>
    </figcaption>
  </figure>
</template>

<style scoped>
.anchor {
  margin: 28px 0;
  /* Three columns need the width of a home page section; in a documentation column they are
     three ellipsised syscalls. Measured against the space given, not against the window. */
  container-type: inline-size;
}

.ends {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr) minmax(0, 1fr);
  gap: 14px;
  align-items: stretch;
}

/* ---- The two ends ------------------------------------------------------------------------ */

.end {
  padding: 16px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  transition: border-color 0.35s, background-color 0.35s;
}

.end.lit {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.eyebrow {
  margin: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
}

.end h4 {
  margin: 7px 0 0;
  font-size: 15px;
  line-height: 1.35;
  letter-spacing: -0.015em;
  color: var(--vp-c-text-1);
}

.line {
  margin: 8px 0 0;
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--vp-c-text-3);
}

.line code {
  font-family: inherit;
  font-size: inherit;
  background: none;
  padding: 0;
  color: var(--vp-c-text-2);
}

.end ul {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.end li {
  padding: 5px 0;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.end li b {
  display: block;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.foot {
  margin: 12px 0 0;
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  transition: color 0.35s;
}

.end.lit .foot {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

/* ---- The middle --------------------------------------------------------------------------- */

.middle {
  display: flex;
  flex-direction: column;
  padding: 16px 18px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.eyebrow.mid {
  color: var(--vp-c-text-3);
}

.sup {
  margin-top: 8px;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-brand-2);
  border-radius: 9px;
  background: var(--vp-c-brand-soft);
  text-align: center;
}

.sup strong {
  display: block;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  color: var(--vp-c-brand-1);
}

.sup span {
  display: block;
  margin-top: 3px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--vp-c-text-3);
}

.calls {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.calls li {
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 7px;
  transition: background-color 0.3s, opacity 0.3s;
  opacity: 0.55;
}

.calls li.on {
  opacity: 1;
  background: var(--vp-c-bg-soft);
}

.arrow {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--vp-c-text-3);
  transition: color 0.3s, transform 0.3s;
}

.calls li.on .arrow {
  color: var(--vp-c-brand-1);
}

.calls li.on.target .arrow {
  transform: translateX(2px);
}

.calls li.on.here .arrow {
  transform: translateX(-2px);
}

.calls code {
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  color: var(--vp-c-text-1);
  background: none;
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.by {
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  color: var(--vp-c-text-3);
}

/* Standing still every call is legible at once, which is the right still frame for a list. */
.anchor.still .calls li {
  opacity: 1;
}

figcaption {
  margin-top: 14px;
  font-size: 13px;
  line-height: 1.65;
  color: var(--vp-c-text-3);
}

figcaption a {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

@container (max-width: 820px) {
  .ends {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .ends {
    grid-template-columns: 1fr;
  }
}
</style>
