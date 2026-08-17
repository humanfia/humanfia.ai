<script setup lang="ts">
// The real screens, recorded off the real program. A card holds a still frame until it is asked
// for, so the page arrives without eight animations in flight; hovering plays one, and a click
// opens it full size with the arrow keys wired up.
//
// The recordings are made in humanize's own repository, where the terminal and the stand-in
// agent that drive them live; they are copied here rather than linked so this site has no
// build-time dependency on that one.
import { onMounted, onUnmounted, ref } from 'vue'

interface Shot {
  src: string
  title: string
  caption: string
  href: string
}

const SHOTS: Shot[] = [
  {
    src: '/demo/tui.gif',
    title: 'hmz',
    caption: 'The interface: / for the commands, and a flow picked from the sheet.',
    href: 'https://hmz.humanfia.ai/reference/tui',
  },
  {
    src: '/demo/run.gif',
    title: 'a flow, running',
    caption: 'Agents taking turns in the order the flow asks for, live.',
    href: '/flows/',
  },
  {
    src: '/demo/collect.gif',
    title: 'hmz trace collect',
    caption: 'A whole run gathered into one Chrome trace — sessions, slices, programs.',
    href: 'https://hmz.humanfia.ai/guide/tracing',
  },
  {
    src: '/demo/profiling.gif',
    title: 'a profiled run',
    caption: 'The programs an agent started, sampled off the process tree into the trace.',
    href: 'https://hmz.humanfia.ai/guide/tracing',
  },
  {
    src: '/demo/cycles.gif',
    title: '/cycles',
    caption: 'Every run this directory has had, and the ones that can be picked up again.',
    href: 'https://hmz.humanfia.ai/guide/resuming',
  },
  {
    src: '/demo/flowverses.gif',
    title: '/flowverses',
    caption: 'Where flows come from, and what one of them holds.',
    href: '/projects/flowverse',
  },
  {
    src: '/demo/providers.gif',
    title: '/providers',
    caption: 'An account made, and the turn under it answered by somebody else’s endpoint.',
    href: 'https://hmz.humanfia.ai/guide/providers',
  },
  {
    src: '/demo/alike.gif',
    title: 'one key, several CLIs',
    caption: 'An account copied to the backends that take the same credentials.',
    href: 'https://hmz.humanfia.ai/reference/providers',
  },
]

/** Every recording has a still beside it, written by scripts/posters.py. */
const poster = (shot: Shot) => shot.src.replace(/\.gif$/, '-poster.png')

const playing = ref<string[]>([])
const open = ref<number | null>(null)

const play = (shot: Shot) => {
  if (!playing.value.includes(shot.src)) playing.value = [...playing.value, shot.src]
}

const shown = (shot: Shot) => (playing.value.includes(shot.src) ? shot.src : poster(shot))

function show(i: number) {
  play(SHOTS[i])
  open.value = i
}

const close = () => {
  open.value = null
}

function onKey(event: KeyboardEvent) {
  if (open.value === null) return
  if (event.key === 'Escape') close()
  if (event.key === 'ArrowRight') show((open.value + 1) % SHOTS.length)
  if (event.key === 'ArrowLeft') show((open.value + SHOTS.length - 1) % SHOTS.length)
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="gallery">
    <button
      v-for="(shot, i) in SHOTS"
      :key="shot.src"
      class="shot"
      type="button"
      @mouseenter="play(shot)"
      @focusin="play(shot)"
      @click="show(i)"
    >
      <span class="frame">
        <span class="chrome">
          <i /><i /><i />
          <code>{{ shot.title }}</code>
        </span>
        <img :src="shown(shot)" :alt="shot.caption" loading="lazy" />
      </span>
      <span class="caption">{{ shot.caption }}</span>
    </button>
  </div>

  <Teleport to="body">
    <div v-if="open !== null" class="lightbox" @click="close">
      <img :src="SHOTS[open].src" :alt="SHOTS[open].caption" />
      <p>
        <code>{{ SHOTS[open].title }}</code>
        {{ SHOTS[open].caption }}
        <a :href="SHOTS[open].href" @click.stop>Read about it</a>
      </p>
      <span class="hint">← → to move · esc to close</span>
    </div>
  </Teleport>
</template>

<style scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
  margin: 28px 0 0;
}

.shot {
  display: block;
  padding: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
  color: inherit;
  text-align: left;
  cursor: zoom-in;
  overflow: hidden;
  transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
}

.shot:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-3px);
  box-shadow: 0 12px 28px -18px var(--vp-c-brand-3);
}

/* The recordings are between 1.6 and 2.0 wide, so they are fitted rather than cropped, on the
   terminal's own background -- which makes the letterboxing invisible and the card a window. */
.frame {
  display: block;
  background: #171717;
  border-bottom: 1px solid var(--vp-c-divider);
}

.chrome {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 12px;
  border-bottom: 1px solid #262626;
}

.chrome i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3a3a3a;
}

.chrome i:first-child {
  background: var(--hf-blue-mid);
}

.chrome code {
  margin-left: 6px;
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  color: #9c9c9c;
}

.shot:hover .chrome code {
  color: var(--hf-blue-pale);
}

.frame img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: contain;
}

.caption {
  display: block;
  padding: 12px 14px 14px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--vp-c-text-3);
}

@media (prefers-reduced-motion: reduce) {
  .shot {
    transition: none;
  }
}
</style>

<style>
/* Not scoped: the lightbox is teleported to <body>, where this component's attribute is not. */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 32px;
  background: color-mix(in srgb, var(--hf-ink) 82%, transparent);
  backdrop-filter: blur(6px);
  cursor: zoom-out;
}

.lightbox img {
  max-width: min(1100px, 100%);
  max-height: 72vh;
  border-radius: 12px;
  border: 1px solid var(--hf-blue-dark);
}

.lightbox p {
  max-width: 720px;
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  text-align: center;
  color: var(--hf-slate-pale);
}

.lightbox p code {
  margin-right: 8px;
  font-family: var(--vp-font-family-mono);
  color: var(--hf-blue-light);
}

.lightbox p a {
  margin-left: 10px;
  font-weight: 600;
  color: var(--hf-blue-light);
  cursor: pointer;
}

.lightbox .hint {
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--hf-blue-pale);
  opacity: 0.6;
}
</style>
