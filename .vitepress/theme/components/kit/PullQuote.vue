<script setup lang="ts">
// A pull-quote: one sentence from the post, set large, so a reader skimming the page catches
// the argument. A markdown blockquote (`> ...`) inside a post is drawn the same way; this is the
// component for when the quote needs a `cite` under it.
//
//   <PullQuote cite="Dongyun Zou">KDAgent optimizes the score, not the kernel.</PullQuote>
defineProps<{ cite?: string }>()
</script>

<template>
  <figure class="pq">
    <blockquote><slot /></blockquote>
    <figcaption v-if="cite">— {{ cite }}</figcaption>
  </figure>
</template>
