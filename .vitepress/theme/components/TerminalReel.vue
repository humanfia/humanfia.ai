<script setup lang="ts">
// The real screens, recorded from the real program.
//
// Everything else on this page is drawn: a diagram is easier to keep honest than a screenshot,
// and it survives a redesign of the thing it draws. This is the one place that is the opposite
// -- what `hmz` actually looks like, recorded with VHS against a stand-in coding agent CLI in a
// container of its own, so no account, machine or credential is ever in frame.
//
// The GIFs are served from the documentation site rather than copied here. They are rendered
// from the `.tape` scripts that live beside them in humanfia/humanize2, and a second copy in
// this repository would be a megabyte that goes stale the first time a screen changes.
import { computed, ref } from 'vue'

const DOCS = 'https://docs.humanfia.ai/humanize2'

interface Shot {
  said: string
  what: string
  gif: string
  guide: string
}

const SHOTS: Shot[] = [
  {
    said: 'hmz',
    what: 'The interface: / for the commands, and a flow picked from the sheet.',
    gif: 'tui.gif',
    guide: '/reference/tui',
  },
  {
    said: 'hmz trace collect',
    what: 'A whole run gathered into one Chrome trace — sessions, slices, the programs the turns ran.',
    gif: 'collect.gif',
    guide: '/guide/tracing',
  },
  {
    said: '/cycles',
    what: 'Every run this directory has had, and which of them can be picked up where they stopped.',
    gif: 'cycles.gif',
    guide: '/guide/resuming',
  },
  {
    said: '/flowverses',
    what: 'Where flows come from, and what one of those places holds.',
    gif: 'flowverses.gif',
    guide: '/guide/flowverses',
  },
  {
    said: '/providers',
    what: 'An account made, and a turn under it answered by somebody else’s endpoint.',
    gif: 'providers.gif',
    guide: '/guide/providers',
  },
]

const at = ref(0)
const shown = computed(() => SHOTS[at.value])

// A GIF starts downloading the moment it is in the document, so only the ones somebody has
// actually asked for are ever in it.
const asked = ref(new Set([0]))
function show(i: number) {
  at.value = i
  asked.value = new Set([...asked.value, i])
}
</script>

<template>
  <div class="reel">
    <div class="stage">
      <template v-for="(shot, i) in SHOTS" :key="shot.gif">
        <img
          v-if="asked.has(i)"
          v-show="i === at"
          :src="`${DOCS}/demo/${shot.gif}`"
          :alt="shot.what"
          loading="lazy"
        />
      </template>
    </div>

    <div class="picks" role="group" aria-label="which screen">
      <button
        v-for="(shot, i) in SHOTS"
        :key="shot.gif"
        type="button"
        :class="{ on: i === at }"
        @click="show(i)"
        @mouseenter="show(i)"
      >
        {{ shot.said }}
      </button>
    </div>

    <p class="under">
      {{ shown.what }}
      <a :href="`${DOCS}${shown.guide}`">read the guide ↗</a>
    </p>
  </div>
</template>

<style scoped>
.reel {
  margin: 28px 0;
  padding: 16px 18px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
}

.stage {
  position: relative;
  aspect-ratio: 25 / 14;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-alt);
}

.stage img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top left;
}

.picks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 0 0;
}

.picks button {
  padding: 5px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  background: transparent;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background-color 0.2s;
}

.picks button:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.picks button.on {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.under {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin: 12px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-3);
}

.under a {
  margin-left: auto;
  flex: none;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}
</style>
