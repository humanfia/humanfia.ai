<script setup lang="ts">
// The same architecture as <SystemMap>, in a shape that survives a phone: four layers stacked
// in the direction the work runs, and the referee down the side with the one arrow that goes
// back up. Nothing here moves -- the map is the version that runs, and this is the version
// that fits.
const DOCS = 'https://docs.humanfia.ai/humanize2'

const LAYERS = [
  {
    key: 'applications',
    kicker: 'Applications',
    title: 'Where a flow is found out',
    body: 'HOA, KDA and AgentKaggle. Chosen because somebody else keeps the scoreboard.',
    links: [
      { text: 'HOA', href: '/projects/hoa' },
      { text: 'KDA', href: '/projects/kda' },
      { text: 'AgentKaggle', href: '/projects/agentkaggle' },
    ],
  },
  {
    key: 'flows',
    kicker: 'Flows',
    title: 'The method, as code',
    body: 'RLAR, Flame Chase, Humanize 1, the Ralph loop — directories of Python anyone can read, fork or beat.',
    links: [
      { text: 'The flowverse ↗', href: `${DOCS}/guide/flowverses` },
      { text: 'humanfia/flowverse ↗', href: 'https://github.com/humanfia/flowverse' },
    ],
  },
  {
    key: 'runtime',
    kicker: 'Runtime',
    title: 'Humanize 2',
    body: 'Opens and resumes sessions, takes the turns a flow asks for, puts work in a container or on another machine, and writes the run down as a timeline.',
    links: [{ text: 'Documentation ↗', href: `${DOCS}/` }],
    lit: true,
  },
  {
    key: 'backends',
    kicker: 'Backends',
    title: 'The agents you already log into',
    body: 'claude · codex · dsh · agy · grok · kimi · qwen · pi · opencode · mimo. We hold no API key.',
    links: [{ text: 'Backends ↗', href: `${DOCS}/features/backends` }],
  },
]
</script>

<template>
  <figure class="stack">
    <div class="stack-flow">
      <div v-for="layer in LAYERS" :key="layer.key" class="stack-layer" :class="{ lit: layer.lit }">
        <span class="stack-kicker">{{ layer.kicker }}</span>
        <strong>{{ layer.title }}</strong>
        <p>{{ layer.body }}</p>
        <p class="stack-links">
          <a v-for="link in layer.links" :key="link.href" :href="link.href">{{ link.text }}</a>
        </p>
      </div>
    </div>

    <div class="stack-ref">
      <span class="stack-kicker">The referee</span>
      <strong>FlowBench</strong>
      <p>Scores the flows against each other on long-horizon work, and the winner becomes the next default. Ours included.</p>
      <p class="stack-links"><a href="/projects/flowbench">FlowBench →</a></p>
      <p class="stack-back"><span aria-hidden="true">↑</span> measures · selects · ships it back into the flows</p>
    </div>

    <figcaption>
      Everything points downward: a flow asks for turns, the runtime takes them on a CLI you
      already pay for, and an application is where the result stops being our opinion. The one
      arrow that runs the other way is the benchmark's.
    </figcaption>
  </figure>
</template>

<style scoped>
.stack {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(230px, 1fr);
  gap: 16px;
  margin: 28px 0;
}

.stack-flow {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* The chevron between two layers, which is the whole reason this is a stack and not a list. */
.stack-layer + .stack-layer::before {
  content: '↓';
  position: absolute;
  top: -19px;
  left: 20px;
  font-size: 12px;
  line-height: 1;
  color: var(--vp-c-text-3);
}

.stack-layer {
  position: relative;
  padding: 15px 18px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.stack-layer.lit {
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-brand-soft);
}

.stack-kicker {
  display: block;
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
}

.stack strong {
  display: block;
  margin-top: 5px;
  font-size: 16px;
  letter-spacing: -0.015em;
  color: var(--vp-c-text-1);
}

.stack p {
  margin: 6px 0 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.stack-links {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  margin-top: 9px !important;
  font-size: 13px;
}

.stack-links a {
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.stack-links a:hover {
  text-decoration: underline;
}

.stack-ref {
  align-self: start;
  padding: 15px 18px 16px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.stack-back {
  margin-top: 12px !important;
  padding-top: 10px;
  border-top: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono);
  font-size: 11px !important;
  line-height: 1.6;
  color: var(--hf-amber);
}

:global(.dark) .stack-back {
  color: var(--hf-amber-light);
}

figcaption {
  grid-column: 1 / -1;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-3);
}

@media (max-width: 720px) {
  .stack {
    grid-template-columns: 1fr;
  }
}
</style>
