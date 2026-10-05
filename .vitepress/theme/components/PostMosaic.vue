<script setup lang="ts">
// The posts, tiled.
//
// This replaces the reel that used to be here. A carousel shows one result at a time and
// decides for the reader which one -- which is exactly backwards for a page whose whole claim
// is "here is everything we ran, go and check it". So: every post on the page at once, in
// tiles of unequal width and height, packed dense so the seams do not line up.
//
// Squares, not cards with round corners: the same flat, hard-edged sheets as the rest of the
// site, an ink rule across the top of each, the red band across every fifth.
//
// The sizes come from a fixed pattern rather than from anything random, because the server
// renders this and the browser has to agree with it. The pattern repeats every eighteen tiles,
// which at any length anyone will scroll reads as unruly rather than as a repeat -- and what
// each tile shows is decided by how big it is, so a small one is a date and a headline instead
// of a paragraph clipped mid-sentence.
import { computed } from 'vue'
import { data as posts, type Kind } from '../posts.data.mts'
import { avatarOf, initialsOf, personOf } from '../people'

/** `kind` picks the section -- the blog's index shows the blog, the news index the news -- and
 *  leaving it off tiles both, which is what a page about everything wants. */
const props = withDefaults(defineProps<{ limit?: number; kind?: Kind }>(), { limit: 12 })

/** At most this many faces in a stack; the rest are a count, so a thirteen-author post does
 *  not push the "Read it" off a small tile. */
const STACK = 4

/**
 * `[columns, rows, how much fits]`, on the six-column grid below. The rows are a minimum: the
 * grid's rows grow to fit whatever a tile holds (see `.mosaic`), so no title is ever clipped.
 *
 * Two rules, and everything else is taste. Each run of tiles adds up to the six columns, so
 * dense packing never leaves a rectangle of nothing in the middle of the wall -- the widths
 * inside a run differ and the run's height differs from its neighbours', which is where the
 * unevenness comes from. And a row count is a floor: it used to be the only height a tile had,
 * and a title one line longer than its tile was cut through the middle of that line. Now the row
 * grows instead, and any extra height is air above the footer, which is pinned to the bottom.
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

const tiles = computed(() => {
  const shown = props.kind ? posts.filter((post) => post.kind === props.kind) : posts
  return (props.limit > 0 ? shown.slice(0, props.limit) : shown).map((post, i) => {
    const [cols, rows, size] = PATTERN[i % PATTERN.length]
    const faces = post.authors.slice(0, STACK).map((name) => {
      const person = personOf(name)
      return { name, initials: initialsOf(name), avatar: person && avatarOf(person, 24) }
    })
    return { ...post, cols, rows, size, wash: i % 5 === 0, faces, more: post.authors.length - faces.length }
  })
})

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
        <!-- Who did it, as faces on every tile and as names too where there is room. The tile is
             one link already, so the faces are not links of their own: the post's byline is. -->
        <span class="tile-by" :title="tile.authors.join(', ')">
          <span class="tile-stack" aria-hidden="true">
            <span v-for="face in tile.faces" :key="face.name" class="tile-face">
              {{ face.initials }}
              <img v-if="face.avatar" :src="face.avatar" alt="" width="24" height="24" loading="lazy" decoding="async" />
            </span>
            <span v-if="tile.more > 0" class="tile-face tile-face-more">+{{ tile.more }}</span>
          </span>
          <span v-if="big(tile.size)" class="tile-names">{{ tile.authors.join(' · ') }}</span>
          <span v-else class="sr-only">{{ tile.authors.join(', ') }}</span>
        </span>
        <span class="tile-more">Read it <span aria-hidden="true">→</span></span>
      </p>
    </a>
  </div>
</template>

<style scoped>
.mosaic {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  /* A row is at least this tall and grows to fit: a tile's span sets its minimum, never its
     maximum, so a long title makes its tile taller instead of being cut off mid-line. */
  grid-auto-rows: minmax(clamp(46px, 5.3vh, 68px), auto);
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
  border-top: 4px solid var(--vp-c-text-1);
  border-radius: 0;
  background: var(--vp-c-bg);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.25s, background-color 0.25s, transform 0.25s, box-shadow 0.25s;
}

/* Every fifth tile is the soft surface instead of the plain one, and carries a short red band
   across its top corner on the site's diagonal -- so the grid has a texture running through it
   rather than twenty identical panels. */
.tile.wash {
  background: var(--vp-c-bg-soft);
}

.tile.wash::before {
  content: '';
  position: absolute;
  top: 26px;
  right: -40px;
  width: 150px;
  height: 14px;
  pointer-events: none;
  background: var(--hf-red);
  transform: rotate(-17deg);
}

.tile:hover {
  border-color: var(--vp-c-text-1);
  border-top-color: var(--hf-red);
  background: var(--vp-c-bg-soft);
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 var(--vp-c-text-1);
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
  padding: 2px 8px;
  background: var(--vp-c-text-1);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-bg);
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
  text-wrap: balance;
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
  align-items: center;
  justify-content: space-between;
  gap: 6px 14px;
  margin: auto 0 0;
  padding-top: 14px;
}

.tile-by {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.tile-names {
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  color: var(--vp-c-text-3);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* The stack: each face overlaps the one before it by a third, and the ring in the tile's own
   background colour is what keeps the overlap legible rather than a smear. */
.tile-stack {
  display: flex;
  flex: none;
}

.tile-face {
  position: relative;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  overflow: hidden;
  margin-left: -6px;
  box-shadow: 0 0 0 2px var(--vp-c-bg);
  background: var(--vp-c-brand-soft);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.tile-face:first-child {
  margin-left: 0;
}

.tile.wash .tile-face,
.tile:hover .tile-face {
  box-shadow: 0 0 0 2px var(--vp-c-bg-soft);
}

.tile-face img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tile-face-more {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
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
