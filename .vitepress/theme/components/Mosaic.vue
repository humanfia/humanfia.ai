<script setup lang="ts" generic="T extends { url: string }">
// The mosaic: a wall of tiles of unequal width and height, packed dense so the seams do not line
// up. It is the blog's style, and anything tiled in it -- the posts (PostMosaic.vue), the flows
// (flow/FlowCatalogue.vue) -- gets the same grid, the same sizes and the same sheets; what goes
// on a tile is the slot's, and the slot is told how big its tile is.
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

export type Size = 'sm' | 'md' | 'lg' | 'xl'
/** `[columns, rows, how much fits]` for one tile; see PATTERN. */
export type Span = readonly [number, number, Size]

const props = withDefaults(
  defineProps<{
    items: T[]
    empty?: string
    /** A tile's span, for a wall whose sizes mean something; PATTERN's otherwise. */
    layout?: (item: T, i: number) => Span
  }>(),
  { empty: 'Nothing published yet.', layout: undefined },
)

/** A tile was pointed at or focused, and then left: for a tile with something to play. */
const emit = defineEmits<{ enter: [item: T]; leave: [item: T] }>()

defineSlots<{ default(props: { item: T; size: Size; big: boolean }): unknown }>()

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
const PATTERN: readonly Span[] = [
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
]

const tiles = computed(() =>
  props.items.map((item, i) => {
    const [cols, rows, size] = props.layout?.(item, i) ?? PATTERN[i % PATTERN.length]
    return { item, cols, rows, size, big: size === 'xl' || size === 'lg', wash: i % 5 === 0 }
  }),
)
</script>

<template>
  <div class="mosaic">
    <p v-if="!tiles.length" class="mosaic-empty">{{ empty }}</p>
    <a
      v-for="tile in tiles"
      :key="tile.item.url"
      class="tile"
      :class="[tile.size, { wash: tile.wash }]"
      :href="tile.item.url"
      :style="{ '--c': tile.cols, '--r': tile.rows }"
      @pointerenter="emit('enter', tile.item)"
      @pointerleave="emit('leave', tile.item)"
      @focus="emit('enter', tile.item)"
      @blur="emit('leave', tile.item)"
    >
      <slot :item="tile.item" :size="tile.size" :big="tile.big" />
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

/* What a tile holds is its slot's, so the parts every tile has are reached with `:slotted`:
   a line of small print over the title, the title, a blurb under it, and a foot. */
.tile > :slotted(*) {
  position: relative;
}

.tile :slotted(.tile-meta) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
  margin: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}

.tile :slotted(.tile-tag) {
  padding: 2px 8px;
  background: var(--vp-c-text-1);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-bg);
}

.tile :slotted(h3) {
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

.tile:hover :slotted(h3) {
  color: var(--vp-c-brand-1);
}

.tile.sm :slotted(h3) {
  font-size: 15.5px;
}

.tile.md :slotted(h3) {
  font-size: 19px;
}

.tile.lg :slotted(h3) {
  font-size: clamp(20px, 2vw, 25px);
  letter-spacing: -0.026em;
}

.tile.xl :slotted(h3) {
  font-size: clamp(23px, 2.5vw, 31px);
  line-height: 1.2;
  letter-spacing: -0.03em;
  font-weight: 750;
}

.tile :slotted(.tile-blurb) {
  margin: 10px 0 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--vp-c-text-2);

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tile.lg :slotted(.tile-blurb) {
  margin-top: 14px;
  font-size: 15px;
  line-height: 1.66;
}

.tile.xl :slotted(.tile-blurb) {
  margin-top: 14px;
  font-size: 15px;
  line-height: 1.66;
  -webkit-line-clamp: 4;
}

/* Pinned to the bottom of the tile, whatever the tile's height turned out to be -- which is
   what makes a wall of different sizes still read as a wall. */
.tile :slotted(.tile-foot) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px 14px;
  margin: auto 0 0;
  padding-top: 14px;
}

.tile :slotted(.tile-more) {
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
    /* A floor here too, never a ceiling: a flow's tile carries its picture, and a fixed row
       would cut the words under it off. */
    grid-auto-rows: minmax(54px, auto);
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

  .tile :slotted(h3) {
    font-size: 18px;
  }
}
</style>
