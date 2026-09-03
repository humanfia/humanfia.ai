<script setup lang="ts">
// The posts, tiled.
//
// This replaces the reel that used to be here. A carousel shows one result at a time and
// decides for the reader which one -- which is exactly backwards for a page whose whole claim
// is "here is everything we ran, go and check it". So: every post on the page at once, in
// tiles of unequal width and height, packed dense so the seams do not line up.
//
// The sizes come from a fixed pattern rather than from anything random, because the server
// renders this and the browser has to agree with it. The pattern repeats every eighteen tiles,
// which at any length anyone will scroll reads as unruly rather than as a repeat -- and what
// each tile shows is decided by how big it is, so a small one is a date and a headline instead
// of a paragraph clipped mid-sentence.
import { computed } from 'vue'
import { data as posts } from '../posts.data.mts'

const props = withDefaults(defineProps<{ limit?: number }>(), { limit: 12 })

/**
 * `[columns, rows, how much fits]`, on the six-column grid below.
 *
 * Two rules, and everything else is taste. Each run of tiles adds up to the six columns, so
 * dense packing never leaves a rectangle of nothing in the middle of the wall -- the widths
 * inside a run differ and the run's height differs from its neighbours', which is where the
 * unevenness comes from. And a row count is a floor, not a guess: a tile clips at its edges,
 * so every size gets at least the rows its clamped text needs, and any extra is air above the
 * footer, which is pinned to the bottom. Taller is always safe; shorter never is.
 */
const PATTERN = [
  [4, 6, 'xl'],
  [2, 3, 'sm'],
  [2, 3, 'sm'],
  [2, 5, 'sm'],
  [4, 5, 'lg'],
  [3, 4, 'md'],
  [3, 4, 'md'],
  [4, 6, 'lg'],
  [2, 3, 'sm'],
  [2, 3, 'sm'],
  [3, 5, 'md'],
  [3, 5, 'md'],
  [2, 4, 'sm'],
  [4, 4, 'md'],
  [3, 5, 'md'],
  [3, 5, 'md'],
  [2, 3, 'sm'],
  [4, 6, 'lg'],
] as const

const tiles = computed(() =>
  (props.limit > 0 ? posts.slice(0, props.limit) : posts).map((post, i) => {
    const [cols, rows, size] = PATTERN[i % PATTERN.length]
    return { ...post, cols, rows, size, wash: i % 5 === 0 }
  }),
)

const big = (size: string) => size === 'xl' || size === 'lg'
</script>

<template>
  <div class="mosaic">
    <p v-if="!tiles.length" class="mosaic-empty">Nothing published yet.</p>
    <a
      v-for="tile in tiles"
      :key="tile.url"
      class="tile"
      :class="[tile.size, { wash: tile.wash }]"
      :href="tile.url"
      :style="{ '--c': tile.cols, '--r': tile.rows }"
    >
      <p class="tile-meta">
        <span v-if="tile.tag" class="tile-tag">{{ tile.tag }}</span>
        <time :datetime="tile.iso">{{ tile.date }}</time>
      </p>

      <h3>{{ tile.title }}</h3>

      <p v-if="tile.description && tile.size !== 'sm'" class="tile-blurb">
        {{ tile.description }}
      </p>

      <p class="tile-foot">
        <span v-if="big(tile.size)" class="tile-by">{{ tile.authors.join(' · ') }}</span>
        <span class="tile-more">Read it <span aria-hidden="true">→</span></span>
      </p>
    </a>
  </div>
</template>

<style scoped>
.mosaic {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  grid-auto-rows: clamp(46px, 5.3vh, 68px);
  grid-auto-flow: row dense;
  gap: 14px;
  margin: 30px 0 0;
}

.mosaic-empty {
  color: var(--vp-c-text-3);
}

.tile {
  grid-column: span var(--c);
  grid-row: span var(--r);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 18px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.25s, background-color 0.25s, transform 0.25s;
}

/* Every fifth tile is the soft surface instead of the plain one, and carries one wash of the
   accent out of its top corner -- so the grid has a texture running through it rather than
   twenty identical panels. */
.tile.wash {
  background: var(--vp-c-bg-soft);
}

.tile.wash::before {
  content: '';
  position: absolute;
  inset: -60% 30% 40% -40%;
  pointer-events: none;
  background: radial-gradient(
    50% 50% at 50% 50%,
    color-mix(in srgb, var(--vp-c-brand-1) 15%, transparent),
    transparent 70%
  );
}

.tile:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
  transform: translateY(-2px);
}

.tile > * {
  position: relative;
}

.tile-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
  margin: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}

.tile-tag {
  padding: 1px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  font-size: 10.5px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
}

.tile h3 {
  margin: 12px 0 0;
  padding: 0;
  border: 0;
  font-size: 17px;
  line-height: 1.3;
  letter-spacing: -0.018em;
  font-weight: 700;
  color: var(--vp-c-text-1);
  transition: color 0.2s;

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tile:hover h3 {
  color: var(--vp-c-brand-1);
}

.tile.sm h3 {
  font-size: 15.5px;
}

.tile.md h3 {
  font-size: 19px;
}

.tile.lg h3 {
  font-size: clamp(20px, 2vw, 25px);
  letter-spacing: -0.026em;
}

.tile.xl h3 {
  font-size: clamp(23px, 2.5vw, 31px);
  line-height: 1.2;
  letter-spacing: -0.03em;
  font-weight: 750;
}

.tile-blurb {
  margin: 10px 0 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--vp-c-text-2);

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tile.lg .tile-blurb {
  margin-top: 14px;
  font-size: 15px;
  line-height: 1.66;
}

.tile.xl .tile-blurb {
  margin-top: 14px;
  font-size: 15px;
  line-height: 1.66;
  -webkit-line-clamp: 4;
}

/* Pinned to the bottom of the tile, whatever the tile's height turned out to be -- which is
   what makes a wall of different sizes still read as a wall. */
.tile-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px 14px;
  margin: auto 0 0;
  padding-top: 14px;
}

.tile-by {
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}

.tile-more {
  margin-left: auto;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

/* ---- Narrower -----------------------------------------------------------------------------
   Four columns, then two, and the row spans go with them; under that the whole thing is a
   column of cards, because a mosaic one tile wide is a list with extra rules. */

@media (max-width: 1180px) {
  .mosaic {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: 54px;
  }

  .tile {
    grid-column: span 2;
  }

  .tile.xl,
  .tile.lg {
    grid-column: span 4;
  }
}

@media (max-width: 860px) {
  .mosaic {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tile {
    grid-column: span 1;
  }

  .tile.xl,
  .tile.lg {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .mosaic {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .tile h3 {
    font-size: 18px;
  }
}
</style>
