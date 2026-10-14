<script setup lang="ts">
// One of the benchmark's rules: its number, large, and the rule in a line, then a sentence on
// why when the page gives one. A rule whose title says it all has no body, so none is drawn.
defineProps<{ n: string; title: string }>()
</script>

<template>
  <article class="fb-rule">
    <span class="fb-rule-n" aria-hidden="true">{{ n }}</span>
    <h3 class="fb-rule-t"><span class="fb-sr">Rule {{ n }}: </span>{{ title }}</h3>
    <div v-if="$slots.default" class="fb-rule-b"><slot /></div>
  </article>
</template>
