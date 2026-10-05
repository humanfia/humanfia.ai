<script setup lang="ts">
// The way back from a flow's page to the catalogue. The flows have no sidebar -- the catalogue
// at /flows/ is their index -- so every page under it but the catalogue itself starts with this,
// over its title. Put there by the theme's `doc-before` slot (theme/index.ts).
import { useData, withBase } from 'vitepress'
import { computed } from 'vue'

const { page } = useData()
const shown = computed(() => /^flows\/(?!index\.md$)/.test(page.value.relativePath))
</script>

<template>
  <a v-if="shown" class="flows-back" :href="withBase('/flows/')"><span aria-hidden="true">←</span> All flows</a>
</template>

<style scoped>
.flows-back {
  display: inline-block;
  margin-bottom: 18px;
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.25s;
}

.flows-back:hover {
  color: var(--vp-c-brand-1);
}
</style>
