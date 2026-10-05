<script setup lang="ts">
// CogAnchor, as the three arrangements its reference names: where the agent's own process runs,
// where the work lands, and what crosses between them. A packet runs the link -- a trapped call
// out to the target, its answer back -- so the reader watches one file operation make the trip.
import { computed, ref } from 'vue'

const MODES = [
  {
    id: 'supervised',
    name: 'Supervised',
    here: ['agent CLI · signed in', 'supervisor · seccomp + ptrace', 'mirror of the workspace'],
    there: ['anchor serve', 'files at the host’s own paths', 'every command: builds, tests, git'],
    out: 'open("/home/me/proj/calc.py")',
    back: '412 bytes',
    crosses: 'one request per trapped syscall, file contents, command I/O',
  },
  {
    id: 'afar',
    name: 'Afar',
    here: ['hmz internal anchor', 'three streams: stdin, stdout, stderr'],
    there: ['agent CLI + supervisor, beside the work', 'mirror kept between turns', 'anchor serve: files, commands'],
    out: 'stdin: the next prompt',
    back: 'stdout: the turn',
    crosses: 'the agent’s stdin, stdout and stderr; the files never leave the target',
  },
  {
    id: 'native',
    name: 'Native',
    here: ['hmz internal anchor --native', 'three streams, signals, exit status'],
    there: ['the target’s own installed CLI', 'its files, commands and network'],
    out: 'argv + stdin',
    back: 'exit 0',
    crosses: 'the CLI’s stdin, stdout, stderr, signals and exit status',
  },
]
const at = ref(0)
const mode = computed(() => MODES[at.value])
</script>

<template>
  <figure class="ca">
    <div class="ca-tabs" role="tablist" aria-label="Arrangement">
      <button
        v-for="(m, i) in MODES"
        :key="m.id"
        type="button"
        role="tab"
        :aria-selected="i === at"
        :class="{ on: i === at }"
        @click="at = i"
      >{{ m.name }}</button>
    </div>
    <div class="ca-stage" :key="mode.id">
      <div class="ca-side">
        <p class="ca-where">this machine</p>
        <ul>
          <li v-for="x in mode.here" :key="x">{{ x }}</li>
        </ul>
      </div>
      <div class="ca-link" aria-hidden="true">
        <span class="ca-wire" />
        <span class="ca-pkt out">{{ mode.out }}</span>
        <span class="ca-pkt back">{{ mode.back }}</span>
        <em>ssh · docker · broker</em>
      </div>
      <div class="ca-side there">
        <p class="ca-where">the target</p>
        <ul>
          <li v-for="x in mode.there" :key="x">{{ x }}</li>
        </ul>
      </div>
    </div>
    <figcaption><b>What crosses:</b> {{ mode.crosses }}.</figcaption>
  </figure>
</template>

<style scoped>
.ca {
  margin: 24px 0;
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-top: 4px solid var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}
.ca-tabs {
  display: flex;
  border-bottom: 1px solid var(--vp-c-text-1);
  margin-bottom: 16px;
}
.ca-tabs button {
  padding: 6px 14px;
  margin-bottom: -1px;
  border: 1px solid transparent;
  font: 600 13px/1.3 var(--vp-font-family-base);
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.ca-tabs button.on {
  border-color: var(--vp-c-text-1) var(--vp-c-text-1) var(--vp-c-bg-soft);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}
.ca-stage {
  display: grid;
  grid-template-columns: 1fr minmax(120px, 1.1fr) 1fr;
  gap: 0;
  align-items: stretch;
}
.ca-side {
  padding: 12px;
  border: 2px solid var(--vp-c-text-1);
  background: var(--vp-c-bg);
}
.ca-side.there {
  border-color: var(--hf-red);
  box-shadow: 5px 5px 0 var(--hf-red);
}
.ca-where {
  margin: 0 0 6px !important;
  font: 700 11px/1.3 var(--vp-font-family-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
}
.ca-side.there .ca-where {
  color: var(--hf-red-deep);
}
.ca-side ul {
  margin: 0 !important;
  padding: 0 !important;
  list-style: none;
}
.ca-side li {
  margin: 0 0 4px !important;
  font: 12.5px/1.4 var(--vp-font-family-mono);
}
.ca-link {
  position: relative;
  min-height: 110px;
  overflow: hidden;
}
.ca-wire {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  background: repeating-linear-gradient(90deg, var(--vp-c-text-1) 0 6px, transparent 6px 10px);
}
.ca-link em {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 4px;
  text-align: center;
  font: italic 11px var(--vp-font-family-mono);
  color: var(--vp-c-text-3);
}
.ca-pkt {
  position: absolute;
  max-width: 92%;
  padding: 2px 6px;
  font: 11px/1.4 var(--vp-font-family-mono);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  animation: ca-out 3.6s cubic-bezier(0.5, 0, 0.3, 1) infinite;
}
.ca-pkt.out {
  top: calc(50% - 26px);
  background: var(--vp-c-text-1);
  color: var(--vp-c-bg);
}
.ca-pkt.back {
  top: calc(50% + 8px);
  background: var(--hf-red);
  color: #fff;
  animation-name: ca-back;
}
@keyframes ca-out {
  0% { left: 0; transform: translateX(-100%); opacity: 0; }
  10% { opacity: 1; }
  45% { left: 100%; transform: translateX(0); opacity: 1; }
  50%, 100% { left: 100%; transform: translateX(0); opacity: 0; }
}
@keyframes ca-back {
  0%, 50% { left: 100%; transform: translateX(0); opacity: 0; }
  58% { opacity: 1; }
  92% { left: 0; transform: translateX(-100%); opacity: 1; }
  100% { left: 0; transform: translateX(-100%); opacity: 0; }
}
figcaption {
  margin-top: 14px;
  font-size: 13.5px;
  line-height: 1.5;
}
@media (max-width: 640px) {
  .ca-stage {
    grid-template-columns: 1fr;
  }
  .ca-link {
    min-height: 90px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .ca-pkt {
    animation: none;
    left: 4%;
  }
}
</style>
