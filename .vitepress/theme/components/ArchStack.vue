<script setup lang="ts">
// The one picture of the whole thing: four layers that sit on each other, and the benchmark
// alongside them that decides what the middle two should be. Written as boxes rather than a
// drawing so it reflows on a phone, reads in both colour schemes, and every name in it is a
// link to the page about it.
const layers = [
  {
    kicker: 'Applications',
    role: 'What we point it at',
    lede: 'Domains where the work is long, the answer is checkable, and being right is worth the compute.',
    items: [
      { text: 'KDA · Kernel Design Agents', link: '/applications/kda' },
      { text: 'HOA · Humanize Olympic Agents', link: '/applications/hoa' },
    ],
  },
  {
    kicker: 'Flows',
    role: 'The method',
    lede: 'A directory of Python that says what each agent is asked, in what order, and when to stop.',
    items: [
      { text: 'RLAR', link: '/flows/rlar' },
      { text: 'Flame Chase Loop', link: '/flows/flame-chase' },
      { text: 'Humanize 1', link: '/flows/humanize1' },
      { text: 'Ralph Loop', link: '/flows/#ralph-loop' },
      { text: 'Goal', link: '/flows/#goal' },
      { text: 'and the rest', link: '/flows/' },
    ],
  },
  {
    kicker: 'Runtime',
    role: 'The engine',
    lede: 'Orchestrate, execute and observe. One flow drives many agents; the whole run is written down as it happens.',
    items: [{ text: 'humanize · hmz', link: '/projects/humanize' }],
  },
  {
    kicker: 'Backends',
    role: 'What you already log into',
    lede: 'Ten coding-agent CLIs, driven through the interfaces they already serve. We hold no API key and talk to no model provider.',
    items: [
      { text: 'claude' },
      { text: 'codex' },
      { text: 'dsh' },
      { text: 'agy' },
      { text: 'grok' },
      { text: 'kimi' },
      { text: 'qwen' },
      { text: 'pi' },
      { text: 'opencode' },
      { text: 'mimo' },
    ],
  },
]
</script>

<template>
  <figure class="arch">
    <div class="arch-grid">
      <ol class="arch-layers">
        <li v-for="layer in layers" :key="layer.kicker" class="arch-layer">
          <div class="arch-head">
            <span class="arch-kicker">{{ layer.kicker }}</span>
            <span class="arch-role">{{ layer.role }}</span>
          </div>
          <p class="arch-lede">{{ layer.lede }}</p>
          <ul class="arch-items">
            <li v-for="item in layer.items" :key="item.text">
              <a v-if="item.link" :href="item.link" class="arch-chip arch-chip-link">{{ item.text }}</a>
              <span v-else class="arch-chip">{{ item.text }}</span>
            </li>
          </ul>
        </li>
      </ol>

      <aside class="arch-rail">
        <div class="arch-head">
          <span class="arch-kicker">flowbench</span>
          <span class="arch-role">The referee</span>
        </div>
        <p class="arch-lede">
          Every flow, every model, every effort, run on the same long-horizon tasks and scored
          the same way. It is how we know which of the loops above is actually better rather
          than newer.
        </p>
        <ol class="arch-cycle">
          <li><b>Applications</b> hand it the tasks that matter.</li>
          <li><b>flowbench</b> runs the matrix and scores it.</li>
          <li>What wins ships as a <b>flow</b> anyone can run.</li>
          <li>The <b>runtime</b> makes running it one command.</li>
        </ol>
        <p class="arch-lede">
          A flow that loses on the board does not become a default and does not stay in the
          flowverse — ours included. flowbench is in development.
        </p>
        <a class="arch-chip arch-chip-link" href="/projects/flowbench">flowbench →</a>
      </aside>
    </div>

    <figcaption>
      Four layers and a referee. The arrow that matters is the one back up: a benchmark that
      only ranks things is a scoreboard, and a benchmark whose winner becomes the next default
      is a flywheel.
    </figcaption>
  </figure>
</template>

<style scoped>
.arch {
  margin: 32px 0;
}

.arch-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 20rem);
  gap: 16px;
  align-items: stretch;
}

.arch-layers {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.arch-layer,
.arch-rail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 16px 18px;
  background: var(--vp-c-bg-soft);
  transition: border-color 0.25s;
}

.arch-layer:hover {
  border-color: var(--vp-c-brand-1);
}

.arch-rail {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--vp-c-bg-alt);
  border-style: dashed;
  border-color: var(--vp-c-brand-2);
}

.arch-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.arch-kicker {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.arch-role {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.arch-lede {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.arch-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.arch-chip {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  /* The theme underlines every link in the content; on a pill that reads as a mistake. */
  text-decoration: none;
}

.arch-chip-link {
  color: var(--vp-c-text-1);
  font-weight: 500;
  transition: color 0.2s, border-color 0.2s;
}

.arch-chip-link:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.arch-rail > .arch-chip-link {
  align-self: flex-start;
  margin-top: auto;
}

.arch-cycle {
  margin: 0;
  padding-left: 1.1rem;
  font-size: 13px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

.arch-cycle b {
  color: var(--vp-c-text-1);
}

.arch figcaption {
  margin-top: 14px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-3);
}

@media (max-width: 860px) {
  .arch-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
