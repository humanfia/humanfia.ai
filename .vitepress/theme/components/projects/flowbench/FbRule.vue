<script setup lang="ts">
// One rule of the referee's rulebook: its number, large, and the rule in a line, then the why.
defineProps<{ n: string; title: string }>()
</script>

<template>
  <article class="fb-rule">
    <span class="fb-rule-n" aria-hidden="true">{{ n }}</span>
    <h3 class="fb-rule-t"><span class="fb-sr">Rule {{ n }}: </span>{{ title }}</h3>
    <div class="fb-rule-b"><slot /></div>
  </article>
</template>
