<script setup lang="ts">
// Twelve layers, one direction.
//
// The package as a stack, in the order the imports are allowed to run: everything points
// downward, nothing points both ways. Hovering a layer shows what it is and what it is entered
// through, and shades the two halves around it -- what it is allowed to reach, and what
// reaches it.
//
// The descriptions and entry points are the ones in Humanize's own architecture page. What
// this drawing deliberately does not claim is that a layer names *everything* below it: the
// exact table is a test in the repository, and the caption says so.
import { computed, ref } from 'vue'

const DOCS = 'https://docs.humanfia.ai/humanize2'

interface Layer {
  name: string
  is: string
  entry: string
  note?: string
}

const LAYERS: Layer[] = [
  { name: 'tui/', is: 'The terminal interface.', entry: 'Humanize' },
  {
    name: 'cli/',
    is: 'The one command line, over layers that have none of their own.',
    entry: 'main, COMMANDS',
    note: 'The one exemption: it may name anything. It is what joins them.',
  },
  {
    name: 'runner.py',
    is: 'Handing a flow the agents it declared, naming them, and running it under a cycle. Also reads the hmz exec line.',
    entry: 'Runner, flow_and_agents, read_agent, set_up_from',
  },
  {
    name: 'cycle.py',
    is: 'One run of one flow as a directory: the journal, the links to each session’s log, and what a flow that can be picked up left behind.',
    entry: 'Cycle, cycles, read, opened, state, resumed',
  },
  {
    name: 'flows/',
    is: 'What a flow is: the interface it drives, the mark, what it says it drives, the skills it brings, and where flowverses are fetched to.',
    entry: 'Agent, Session, Person, flow, calls, drives, wanted, found, fork, flowverses',
  },
  {
    name: 'tracing/',
    is: 'Reading the backends’ logs back — and, for a profiled run, the programs its agents start — and rendering both as one Chrome trace.',
    entry: 'collect, profile.Profiler',
    note: 'Names backends and nothing else. It does not know how to drive anything.',
  },
  {
    name: 'agents/',
    is: 'The drivers: one per backend, plus the vocabulary a turn is described in — Event, Question, Moment.',
    entry: 'everything in __init__',
    note: 'Deliberately does not name cycle. A run is written out of the agents it drove, so that would be a circle.',
  },
  {
    name: 'models.py',
    is: 'What each backend runs, asked of that backend the way it offers being asked, and kept per account.',
    entry: 'ask, offered, asked, where',
  },
  {
    name: 'machines/',
    is: 'The setting that says which machine, and the machine it brings up.',
    entry: 'MachineConfig, MachineBase, AnchoredConfig, DockerConfig',
  },
  {
    name: 'providers/',
    is: 'Which account an agent runs as, kept apart from which CLI it is.',
    entry: 'the provider store, and the turn run under it',
  },
  {
    name: 'coganchor/',
    is: 'Syscall interposition: a seccomp-filtered ptrace supervisor here, a replaying server there, a wire protocol between.',
    entry: 'AnchorConfig, connect, check',
  },
  {
    name: 'backends.py',
    is: 'Names, aliases, efforts, home directories, log globs, credential paths, ways in and skill directories for all ten backends. Facts, not code.',
    entry: 'PROFILES, named(), profiles(), read(), remember()',
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
      >
        <button
          type="button"
          @mouseenter="pick(i)"
          @focus="pick(i)"
          @keydown="onKey($event, i)"
        >
          <code>{{ layer.name }}</code>
          <span class="rel">{{ where(i) === 'on' ? '' : where(i) === 'above' ? 'names it' : 'below it' }}</span>
        </button>
      </li>
    </ol>

    <aside>
      <p class="eyebrow">{{ at === 0 ? 'the top' : at === LAYERS.length - 1 ? 'the bottom' : 'layer' }}</p>
      <code class="name">{{ current.name }}</code>
      <p class="is">{{ current.is }}</p>
      <p v-if="current.note" class="note">{{ current.note }}</p>
      <p class="entry"><span>Entry points</span>{{ current.entry }}</p>
    </aside>

    <figcaption>
      Everything points downward and nothing points both ways. A layer may name only what is
      under it — and not all of that: the table of exactly what each one may reach is
      <code>tests/test_layering.py</code>, which fails a build that bends it.
      <a :href="`${DOCS}/contributing/architecture`">The whole tree, and the exemptions ↗</a>
    </figcaption>
  </figure>
</template>

<style scoped>
.stack {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 1.05fr);
  gap: 18px;
  margin: 28px 0;
}

/* ---- The tower --------------------------------------------------------------------------- */

.tower {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tower button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 9px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s, background-color 0.2s, opacity 0.2s;
}

.tower code {
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  color: var(--vp-c-text-1);
  background: none;
  padding: 0;
}

.rel {
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  opacity: 0;
  transition: opacity 0.2s;
}

.held .rel {
  opacity: 1;
}

/* The one under the pointer. */
.on button {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.on code {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

/* What names it, and what it may name. Only drawn once something is held, so the still
   diagram is twelve equal layers rather than a state nobody asked for. */
.held.above button {
  opacity: 0.55;
}

.held.below button {
  border-color: var(--vp-c-brand-2);
}

/* ---- The panel --------------------------------------------------------------------------- */

aside {
  align-self: start;
  position: sticky;
  top: calc(var(--vp-nav-height) + 24px);
  padding: 18px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
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

.name {
  display: block;
  margin-top: 8px;
  font-family: var(--vp-font-family-mono);
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
  background: none;
  padding: 0;
}

.is {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.note {
  margin: 12px 0 0;
  padding-left: 12px;
  border-left: 2px solid var(--vp-c-brand-2);
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-3);
}

.entry {
  margin: 14px 0 0;
  padding-top: 12px;
  border-top: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  line-height: 1.7;
  color: var(--vp-c-text-3);
  overflow-wrap: anywhere;
}

.entry span {
  display: block;
  margin-bottom: 4px;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

figcaption {
  grid-column: 1 / -1;
  font-size: 13px;
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

@media (max-width: 720px) {
  .stack {
    grid-template-columns: 1fr;
  }

  aside {
    position: static;
  }
}
</style>
