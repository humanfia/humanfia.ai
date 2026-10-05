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
    <div class="picks" role="tablist" aria-label="Which screen">
      <button
        v-for="(shot, i) in SHOTS"
        :key="shot.cast"
        type="button"
        role="tab"
        :aria-selected="i === at"
        :class="{ on: i === at }"
        @click="show(i)"
      >
        <code>{{ shot.said }}</code>
        <span>{{ shot.what }}</span>
      </button>
      <a class="guide" :href="`${DOCS}${shown.guide}`">Read the guide ↗</a>
    </div>

    <div class="screen">
      <div class="bar" aria-hidden="true"><i /><code>{{ shown.said }}</code><span>recorded · click to pause</span></div>
      <div ref="stage" class="stage" :aria-label="shown.what" role="img" @click="toggle" />
    </div>
  </div>
</template>

<style scoped>
.reel {
  display: grid;
  grid-template-columns: minmax(220px, 0.42fr) minmax(0, 1fr);
  gap: 0;
  margin: 0;
  border: 2px solid var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}

/* ---- the screens, as a list ------------------------------------------------------------ */

.picks {
  display: flex;
  flex-direction: column;
  border-right: 2px solid var(--vp-c-text-1);
}

.picks button {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 18px;
  border: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
}

.picks button:hover {
  background: color-mix(in srgb, var(--vp-c-text-1) 5%, transparent);
}

.picks code {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  background: none;
  padding: 0;
}

.picks span {
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--vp-c-text-3);
}

.picks button.on {
  background: var(--vp-c-text-1);
  box-shadow: inset 6px 0 0 var(--hf-red);
}

.picks button.on code {
  color: var(--vp-c-bg);
}

.picks button.on span {
  color: color-mix(in srgb, var(--vp-c-bg) 75%, transparent);
}

.guide {
  margin-top: auto;
  padding: 14px 18px;
  font-size: 13px;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.guide:hover {
  text-decoration: underline;
}

/* ---- the screen ------------------------------------------------------------------------ */

.screen {
  min-width: 0;
  background: #16171d;
}

.bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid #2a2b33;
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  color: #8c8679;
}

.bar i {
  width: 10px;
  height: 10px;
  background: #ff5a43;
}

.bar code {
  font-size: 12px;
  color: #e2e4ea;
  background: none;
}

.bar span {
  margin-left: auto;
}

.stage {
  position: relative;
  aspect-ratio: 25 / 14;
  overflow: hidden;
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

@media (max-width: 860px) {
  .reel {
    grid-template-columns: minmax(0, 1fr);
  }

  .picks {
    flex-direction: row;
    flex-wrap: wrap;
    border-right: 0;
    border-bottom: 2px solid var(--vp-c-text-1);
  }

  .picks button {
    border-bottom: 0;
    padding: 10px 12px;
  }

  .picks span {
    display: none;
  }

  .guide {
    margin: 0 0 0 auto;
    padding: 10px 12px;
  }

  .bar span {
    display: none;
  }
}
</style>
