<script setup lang="ts">
// The real screens, recorded from the real program.
//
// Everything else on this page is drawn: a diagram is easier to keep honest than a screenshot,
// and it survives a redesign of the thing it draws. This is the one place that is the opposite
// -- what `hmz` actually looks like, recorded against a stand-in coding agent CLI in a
// container of its own, so no account, machine or credential is ever in frame.
//
// The recordings are asciicasts served from the documentation site rather than copied here, and
// played in the reader's browser by asciinema-player: real text, sharp at any zoom, a few KB
// each. They are made from the `.tape` scripts that live beside them in humanfia/humanize, and
// a second copy in this repository would go stale the first time a screen changes. (They were
// GIFs until the documentation moved to casts, which is when every one of these went 404.)
import 'asciinema-player/dist/bundle/asciinema-player.css'

import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const DOCS = 'https://docs.humanfia.ai/humanize'

interface Shot {
  said: string
  what: string
  cast: string
  guide: string
}

const SHOTS: Shot[] = [
  {
    said: 'hmz',
    what: 'The interface: / for the commands, and a flow picked from the sheet.',
    cast: 'tui.cast',
    guide: '/reference/tui',
  },
  {
    said: 'ls ~/.humanize/epics/…',
    what: 'What one run leaves behind: what happened, what it ran, and a link to every conversation it opened.',
    cast: 'run.cast',
    guide: '/user/tracing',
  },
  {
    said: '/epics',
    what: 'Every run this directory has had, and which of them can be picked up where they stopped.',
    cast: 'epics.cast',
    guide: '/user/resuming',
  },
  {
    said: '/flowverses',
    what: 'Where flows come from, and what one of those places holds.',
    cast: 'flowverses.cast',
    guide: '/weaver/flowverses',
  },
  {
    said: '/providers',
    what: 'Every account there is, what there is to do with one, and where a CLI of your own goes.',
    cast: 'accounts.cast',
    guide: '/user/settings#accounts',
  },
]

const at = ref(0)
const shown = computed(() => SHOTS[at.value])
const stage = ref<HTMLElement | null>(null)

type Player = import('asciinema-player').Player
let player: Player | undefined
let playing = false
let visible = false
let still = false
let seen: IntersectionObserver | undefined

/** One player at a time: picking another screen throws the old one away and loads the next, so
 *  only the recordings somebody actually asked for are ever fetched. Under reduced motion it
 *  shows the recording's last frame and waits for a click. */
async function mount() {
  const { create } = await import('asciinema-player')
  player?.dispose()
  stage.value!.replaceChildren()
  player = create(`${DOCS}/demo/${shown.value.cast}`, stage.value!, {
    fit: 'both',
    controls: false,
    autoPlay: visible && !still,
    loop: !still,
    preload: true,
    idleTimeLimit: 2,
    poster: 'npt:9999',
    terminalFontFamily: 'var(--vp-font-family-mono)',
    terminalLineHeight: 1.25,
  })
  playing = false
  player.addEventListener('playing', () => (playing = true))
  player.addEventListener('pause', () => (playing = false))
  player.addEventListener('ended', () => (playing = false))
}

function show(i: number) {
  at.value = i
}

/** A click on the screen pauses it or plays it, which is the only control it has. */
function toggle() {
  if (playing) player?.pause()
  else player?.play()
}

watch(at, () => player && mount())

onMounted(() => {
  still = matchMedia('(prefers-reduced-motion: reduce)').matches
  seen = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting
      if (!visible) return player?.pause()
      if (!player) return mount()
      if (!still) player.play()
    },
    { threshold: 0.3 },
  )
  seen.observe(stage.value!)
})

onBeforeUnmount(() => {
  seen?.disconnect()
  player?.dispose()
})
</script>

<template>
  <div class="reel">
    <div ref="stage" class="stage" :aria-label="shown.what" role="img" @click="toggle" />

    <div class="picks" role="group" aria-label="which screen">
      <button
        v-for="(shot, i) in SHOTS"
        :key="shot.cast"
        type="button"
        :class="{ on: i === at }"
        @click="show(i)"
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
  background: #16171d;
  cursor: pointer;
}

/* The player fits the whole terminal inside the stage, in the documentation's own colours. */
.stage :deep(.ap-wrapper) {
  position: absolute;
  inset: 0;
}

.stage :deep(.ap-player) {
  --term-color-foreground: #e2e4ea;
  --term-color-background: #16171d;
  border-radius: 0;
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
