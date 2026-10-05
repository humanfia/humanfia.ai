<script setup lang="ts">
// The posts, tiled.
//
// This replaces the reel that used to be here. A carousel shows one result at a time and
// decides for the reader which one -- which is exactly backwards for a page whose whole claim
// is "here is everything we ran, go and check it". So: every post on the page at once, in the
// mosaic (Mosaic.vue), which decides how big each tile is. What a post's tile shows is decided
// here, by that size, so a small one is a date and a headline instead of a paragraph clipped
// mid-sentence.
import { computed } from 'vue'
import { data as posts, type Kind } from '../posts.data.mts'
import { avatarOf, initialsOf, personOf } from '../people'
import Mosaic from './Mosaic.vue'

/** `kind` picks the section -- the blog's index shows the blog, the news index the news -- and
 *  leaving it off tiles both, which is what a page about everything wants. */
const props = withDefaults(defineProps<{ limit?: number; kind?: Kind }>(), { limit: 12 })

/** At most this many faces in a stack; the rest are a count, so a thirteen-author post does
 *  not push the "Read it" off a small tile. */
const STACK = 4

const tiles = computed(() => {
  const shown = props.kind ? posts.filter((post) => post.kind === props.kind) : posts
  return (props.limit > 0 ? shown.slice(0, props.limit) : shown).map((post) => {
    const faces = post.authors.slice(0, STACK).map((name) => {
      const person = personOf(name)
      return { name, initials: initialsOf(name), avatar: person && avatarOf(person, 24) }
    })
    return { ...post, faces, more: post.authors.length - faces.length }
  })
})
</script>

<template>
  <Mosaic v-slot="{ item: tile, size, big }" :items="tiles">
    <p class="tile-meta">
      <span v-if="tile.tag" class="tile-tag">{{ tile.tag }}</span>
      <time :datetime="tile.iso">{{ tile.date }}</time>
    </p>

    <h3>{{ tile.title }}</h3>

    <p v-if="tile.description && size !== 'sm'" class="tile-blurb">
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
        <span v-if="big" class="tile-names">{{ tile.authors.join(' · ') }}</span>
        <span v-else class="sr-only">{{ tile.authors.join(', ') }}</span>
      </span>
      <span class="tile-more">Read it <span aria-hidden="true">→</span></span>
    </p>
  </Mosaic>
</template>

<style scoped>
/* The grid, the sheets and the parts every tile has are the mosaic's (Mosaic.vue). These are
   what only a post's tile has: who wrote it. */

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
</style>
