<script setup lang="ts">
// Seventeen layers, and a test that holds them.
//
// The package as a stack, from the ways in down to what is remembered. Hovering a layer shows
// what it is and the module it is, and shades the layers above and below it. It does not
// draw the edges: which layer may import which is a table in a test, and the caption says so.
//
// The layers and their descriptions are the ones in Humanize's own architecture page, which
// draws them from tests/integration/layering/test_layering.py: sixteen in the table, and
// `cli`, which joins them.
import { computed, ref } from 'vue'

const DOCS = 'https://docs.humanfia.ai/humanize'

interface Layer {
  name: string
  is: string
  module: string
  note?: string
}

const LAYERS: Layer[] = [
  {
    name: 'cli/',
    is: 'The command line: a new command, and how a command writes its output.',
    module: 'hmz.cli',
    note: 'Not in the table. It joins the layers, so it may import any of them, inside the command that needs it.',
  },
  {
    name: 'tui/',
    is: 'The terminal interface: slash commands, keys, menus, and what they draw.',
    module: 'hmz.tui',
    note: 'Reaches the runtime’s front door only through daemon, as one frontend of the runs a host holds.',
  },
  {
    name: 'sdk/',
    is: 'The Python API a tool outside Humanize calls.',
    module: 'hmz.sdk',
    note: 'Nothing imports it: it is the way in from outside.',
  },
  {
    name: 'daemon/',
    is: 'A workspace’s runs held apart from the terminal, and the socket every frontend reaches them over.',
    module: 'hmz.daemon',
  },
  {
    name: 'runtime/',
    is: 'The front door: hands Hmz, Run and Refused through from doing and runner.',
    module: 'hmz.runtime',
  },
  {
    name: 'doing/',
    is: 'Humanize as one object. Anything cli, tui and daemon would each write goes here once.',
    module: 'hmz.runtime.doing',
  },
  {
    name: 'runner/',
    is: 'The hmz exec line: reading it, finding the flow, checking it, refusing it, running it.',
    module: 'hmz.runtime.runner',
  },
  {
    name: 'flowing/',
    is: 'Everything done to a flow: the engine, budgets, resuming, the agent and environment drivers, finding flows and flowverses.',
    module: 'hmz.runtime.flowing',
  },
  {
    name: 'flows/',
    is: 'The flow API: the types a flow imports. Each is a promise to somebody else’s repository.',
    module: 'hmz.flows',
    note: 'The one pair: it hands a flow to flowing inside the call, never at import.',
  },
  {
    name: 'exporting/',
    is: 'One whole run packaged up to send somewhere.',
    module: 'hmz.runtime.exporting',
  },
  {
    name: 'epic/',
    is: 'One run of one flow, written down as it happens.',
    module: 'hmz.runtime.epic',
  },
  {
    name: 'tracing/',
    is: 'The backends’ own logs read back as one trace: a reader per backend.',
    module: 'hmz.runtime.tracing',
  },
  {
    name: 'coganchor/',
    is: 'Driving a coding agent CLI: backends, drivers, accounts, models, fallbacks, prices, machines, and the anchor.',
    module: 'hmz.coganchor',
  },
  {
    name: 'serve/',
    is: 'The half of the anchor that ships to the target machine.',
    module: 'hmz.coganchor.serve',
    note: 'The target may be any architecture, so it may name the wire protocol and the fence, and nothing else.',
  },
  {
    name: 'telemetry/',
    is: 'What Humanize reports about itself, and whether it does.',
    module: 'hmz.runtime.telemetry',
  },
  {
    name: 'settings/',
    is: 'What each workspace was set up to run.',
    module: 'hmz.runtime.settings',
  },
  {
    name: 'kept/',
    is: 'An agent written down, in the CLI/MODEL:EFFORT shape -a takes.',
    module: 'hmz.runtime.kept',
  },
]

const at = ref(0)
const held = ref(false)
const current = computed(() => LAYERS[at.value])

const pick = (i: number) => {
  at.value = i
  held.value = true
}

function onKey(event: KeyboardEvent, i: number) {
  const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
  if (!step) return
  event.preventDefault()
  const next = Math.min(LAYERS.length - 1, Math.max(0, i + step))
  pick(next)
}

const where = (i: number) => (i < at.value ? 'above' : i > at.value ? 'below' : 'on')
</script>

<template>
  <figure class="stack" @mouseleave="held = false">
    <ol class="tower">
      <li
        v-for="(layer, i) in LAYERS"
        :key="layer.name"
        :class="[where(i), { held }]"
        :style="{ '--w': `${100 - Math.abs(i - 8) * 2.2}%` }"
      >
        <button
          type="button"
          :aria-pressed="at === i"
          @mouseenter="pick(i)"
          @focus="pick(i)"
          @click="pick(i)"
          @keydown="onKey($event, i)"
        >
          <span class="n">{{ String(i + 1).padStart(2, '0') }}</span>
          <code>{{ layer.name }}</code>
          <span class="rel">{{ where(i) === 'on' ? '' : where(i) === 'above' ? 'above it' : 'below it' }}</span>
        </button>
      </li>
    </ol>

    <aside aria-live="polite">
      <p class="eyebrow">{{ at === 0 ? 'the top' : at === LAYERS.length - 1 ? 'the bottom' : `layer ${at + 1} of ${LAYERS.length}` }}</p>
      <code class="name">{{ current.name }}</code>
      <p class="is">{{ current.is }}</p>
      <p v-if="current.note" class="note">{{ current.note }}</p>
      <p class="entry"><span>Module</span>{{ current.module }}</p>
    </aside>

    <figcaption>
      Drawn from the ways in down to what is remembered. A layer may import only what the table
      lists for it, and no two layers name each other but <code>flows</code> and
      <code>flowing</code> —
      <code>tests/integration/layering/test_layering.py</code> holds the exact table, and fails
      a build that bends it.
      <a :href="`${DOCS}/contributing/architecture`">The whole tree, and the exemptions ↗</a>
    </figcaption>
  </figure>
</template>

<style scoped>
.stack {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.9fr);
  gap: clamp(20px, 4vw, 56px);
  margin: 0;
}

/* ---- The tower: seventeen plates, stacked, the one in hand pulled out ------------------- */

.tower {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tower li {
  width: var(--w);
  margin: 0;
}

.tower button {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 7px 14px;
  border: 0;
  border-radius: 0;
  background: color-mix(in srgb, var(--vp-c-text-1) 7%, transparent);
  cursor: pointer;
  text-align: left;
  transition:
    background-color 0.25s,
    opacity 0.25s,
    transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.tower button:hover {
  background: color-mix(in srgb, var(--vp-c-text-1) 12%, transparent);
}

.n {
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
  color: var(--vp-c-text-3);
}

.tower code {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  background: none;
  padding: 0;
}

.rel {
  margin-left: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  opacity: 0;
  transition: opacity 0.2s;
}

.held .rel {
  opacity: 1;
}

/* The one in hand: ink, a red edge, pulled a step out of the stack. */
.on button {
  background: var(--vp-c-text-1);
  box-shadow: inset 6px 0 0 var(--hf-red);
  transform: translateX(10px);
}

.on code,
.on .n {
  color: var(--vp-c-bg);
}

.held.above button {
  opacity: 0.5;
}

/* ---- The panel --------------------------------------------------------------------------- */

aside {
  align-self: start;
  position: sticky;
  top: calc(var(--vp-nav-height) + 24px);
  padding: 26px 28px 24px;
  border-top: 6px solid var(--hf-red);
  background: var(--vp-c-bg-soft);
}

.eyebrow {
  margin: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
}

.name {
  display: block;
  margin-top: 12px;
  font-family: var(--vp-font-family-mono);
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--vp-c-text-1);
  background: none;
  padding: 0;
}

.is {
  margin: 14px 0 0;
  font-size: 16px;
  line-height: 1.55;
  color: var(--vp-c-text-1);
}

.note {
  margin: 14px 0 0;
  padding-left: 12px;
  border-left: 3px solid var(--hf-red);
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.entry {
  margin: 18px 0 0;
  padding-top: 14px;
  border-top: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  overflow-wrap: anywhere;
}

.entry span {
  display: block;
  margin-bottom: 4px;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

figcaption {
  grid-column: 1 / -1;
  max-width: 900px;
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--vp-c-text-3);
}

figcaption code {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
}

figcaption a {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

figcaption a:hover {
  text-decoration: underline;
}

@media (max-width: 720px) {
  .stack {
    grid-template-columns: minmax(0, 1fr);
  }

  .tower li {
    width: 100%;
  }

  .on button {
    transform: none;
  }

  aside {
    position: static;
    order: -1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tower button {
    transition: none;
  }
}
</style>
