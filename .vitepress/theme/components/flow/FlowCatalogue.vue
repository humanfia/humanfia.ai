<script setup lang="ts">
// The gallery on /flows/: one picture per flow, its name, and a line at most -- the page is
// for looking, and each flow's own page is where it is explained and played in full.
//
// Every tile is the same size, so the wall reads as a gallery rather than a ranking: the
// featured flows come first, then the rest in the order of how the agents in a flow work
// together (KINDS in `theme/flows.ts`). `chat` is a conversation, not a loop, and is left off.
// Each picture is its flow's own scene -- the one its page plays -- in the same grammar, small and
// without words; it plays while its tile is hovered or focused. After the flows written here
// come the ones the flowverse releases that nobody here has drawn yet (`flowverse.data.mts`):
// the catalogue is the flowverse's, and this site only adds the pictures, so those tiles keep
// an empty frame where a picture will go.
//
// This is not the blog's mosaic (../Mosaic.vue): a mosaic's sizes say which tile matters most,
// and a gallery of pictures wants them even, so the grid is its own.
import { withBase } from 'vitepress'
import { ref } from 'vue'

import { data } from '../../flowverse.data.mts'
import { FLOWS, KINDS } from '../../flows'
import FlowThumb from './FlowThumb.vue'

const written = new Set(FLOWS.map((one) => one.module).filter(Boolean))
const kindOf = (id: string) => KINDS.findIndex((kind) => kind.id === id)

/** Every tile, the flows drawn here first and the flowverse's others after. */
const tiles = [
  ...FLOWS.filter((one) => !one.unlisted)
    .sort((a, b) => (a.featured ?? Infinity) - (b.featured ?? Infinity) || kindOf(a.kind) - kindOf(b.kind))
    .map((one) => ({
      url: withBase(one.link),
      name: one.phases ? `${one.name}:<phase>` : one.name,
      said: one.said,
      scene: one.scene as string | undefined,
    })),
  ...data.modules
    .filter((one) => !written.has(one.name))
    .map((one) => ({
      url: withBase(`/flows/${one.slug}`),
      name: one.name,
      said: one.latest.description || one.summary,
      scene: undefined,
    })),
]

const thumbs = ref<Record<string, InstanceType<typeof FlowThumb> | null>>({})
</script>

<template>
  <!-- A list in a div: a flow page keeps its top-level lists at a reading measure (grammar.css),
       and this one is a grid that wants the page's full width. -->
  <div class="flow-ui">
    <ul class="gallery">
      <li v-for="tile in tiles" :key="tile.url">
        <a
          class="tile"
          :href="tile.url"
          @pointerenter="thumbs[tile.url]?.play()"
          @pointerleave="thumbs[tile.url]?.stop()"
          @focus="thumbs[tile.url]?.play()"
          @blur="thumbs[tile.url]?.stop()"
        >
          <div class="pic" :class="{ blank: !tile.scene }">
            <FlowThumb
              v-if="tile.scene"
              :ref="(el) => (thumbs[tile.url] = el as InstanceType<typeof FlowThumb> | null)"
              :scene="tile.scene"
            />
          </div>
          <!-- A line may break after each colon, so `flame_chasoid:parallel_git_pr` wraps at its parts. -->
          <h3><template v-for="(part, n) in tile.name.split(':')" :key="n"><template v-if="n">:<wbr /></template>{{ part }}</template></h3>
          <p v-if="tile.said">{{ tile.said }}</p>
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* As many even columns as fit at about 300px each, down to one on a phone. */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 290px), 1fr));
  gap: 18px;
  margin: 30px 0 0;
  padding: 0;
  list-style: none;
}

.gallery li {
  margin: 0;
}

/* Square, flat sheets with an ink rule across the top, the same as the rest of the site's. */
.tile {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--vp-c-divider);
  border-top: 4px solid var(--vp-c-text-1);
  background: var(--vp-c-bg);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
}

.tile:hover,
.tile:focus-visible {
  border-color: var(--vp-c-text-1);
  border-top-color: var(--flow-mark);
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 var(--vp-c-text-1);
  outline: none;
}

/* Every picture gets the same frame, whatever shape its scene is, so the names under them line
   up across a row; the scene is fitted inside it. */
.pic {
  aspect-ratio: 2 / 1;
  overflow: hidden;
  padding: 8px 12px;
  border-bottom: 1px solid var(--flow-panel-edge);
  background: var(--flow-card);
}

.pic :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/* A flow with no scene yet: the frame, hatched, holding its place. */
.pic.blank {
  background:
    repeating-linear-gradient(-17deg, transparent 0 11px, var(--flow-panel-edge) 11px 12px),
    var(--flow-panel);
}

/* A flow's name is what `-f` and `$` take, so it is set as code, and breaks anywhere rather than
   overflowing its tile. */
.tile h3 {
  margin: 0;
  padding: 14px 16px 0;
  border: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
  overflow-wrap: anywhere;
  transition: color 0.2s;
}

.tile:hover h3 {
  color: var(--vp-c-brand-1);
}

.tile p {
  margin: 4px 0 0;
  padding: 0 16px 16px;
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tile h3:last-child {
  padding-bottom: 16px;
}
</style>
