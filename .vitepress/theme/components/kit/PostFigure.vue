<script setup lang="ts">
// A figure: an image (or anything in the slot) with its caption, numbered in reading order.
//
// `width` takes it out of the text column: `text` stays in it, `wide` (the default) fills the
// column and its margin, `full` runs edge to edge of the post. An image opens at full size on a
// click, in a new tab -- a figure is often the thing a reader wants to look at longest.
//
//   <PostFigure src="/blog/x/plot.png" alt="..." caption="..." />
//   <PostFigure caption="..."><SomeDiagram /></PostFigure>
withDefaults(
  defineProps<{
    src?: string
    alt?: string
    caption?: string
    width?: 'text' | 'wide' | 'full'
  }>(),
  { alt: '', width: 'wide' },
)
</script>

<template>
  <figure class="pf" :class="`pf-${width}`">
    <a v-if="src" :href="src" target="_blank" rel="noreferrer" class="pf-img">
      <img :src="src" :alt="alt" loading="lazy" decoding="async" />
    </a>
    <slot />
    <figcaption v-if="caption || $slots.caption">
      <span class="pf-num" aria-hidden="true" />
      <slot name="caption">{{ caption }}</slot>
    </figcaption>
  </figure>
</template>
