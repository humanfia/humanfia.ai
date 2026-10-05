<script setup lang="ts">
// A grid of cards, for a list whose items each deserve a panel: what is new in a release, the
// layers of a defence, the cases in a catalogue. The cards are PostCard children, and each one's
// body is ordinary markdown, so the words stay in the post where they can be edited.
//
//   <PostCards>
//   <PostCard kicker="A / Input distribution" metric="3.74×" metric-label="claimed" title="Overfitting">
//
//   The synthesized kernel replaced ...
//
//   </PostCard>
//   </PostCards>
//
// `numbered` stamps 01, 02, ... on the cards in order. `columns` fixes how many cards share a row
// on a wide screen (one per row on a phone); without it, as many as fit at 260px each.
withDefaults(defineProps<{ numbered?: boolean; columns?: number }>(), { numbered: false })
</script>

<template>
  <div class="pcs" :class="{ numbered, fixed: columns }" :style="columns ? { '--cols': columns } : undefined">
    <slot />
  </div>
</template>
