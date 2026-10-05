<script setup lang="ts">
// The theme's footer, with the wordmark over it. Swapped in for VPFooter.vue by the alias in
// config.mts -- the theme's documented way to replace one of its own parts -- because the footer
// has no slot and its two lines are HTML strings, which cannot hold a component. Everything else
// is the theme's: the same two lines from themeConfig.footer, the same rule that a page with a
// sidebar has no footer, the same frontmatter switch to turn it off.
import { useData } from 'vitepress'
import { useSidebar } from 'vitepress/theme'
import Wordmark from './Wordmark.vue'

const { theme, frontmatter } = useData()
const { hasSidebar } = useSidebar()
</script>

<template>
  <footer v-if="theme.footer && frontmatter.footer !== false" class="VPFooter" :class="{ 'has-sidebar': hasSidebar }">
    <div class="container">
      <a class="brand" href="/"><Wordmark /></a>
      <p v-if="theme.footer.message" class="message" v-html="theme.footer.message"></p>
      <p v-if="theme.footer.copyright" class="copyright" v-html="theme.footer.copyright"></p>
    </div>
  </footer>
</template>

<style scoped>
.VPFooter {
  position: relative;
  z-index: var(--vp-z-index-footer);
  border-top: 1px solid var(--vp-c-gutter);
  padding: 40px 24px 32px;
  background-color: var(--vp-c-bg);
}

.VPFooter.has-sidebar {
  display: none;
}

.VPFooter :deep(a) {
  text-decoration-line: underline;
  text-underline-offset: 2px;
  transition: color 0.25s;
}

.VPFooter :deep(a:hover) {
  color: var(--vp-c-text-1);
}

@media (min-width: 768px) {
  .VPFooter {
    padding: 48px 32px 32px;
  }
}

.container {
  margin: 0 auto;
  max-width: var(--vp-layout-max-width);
  text-align: center;
}

/* The wordmark is the way home, the same as the one in the nav. Room above it for the arc. */
.brand {
  display: inline-block;
  margin: 8px 0 20px;
  --hf-wordmark-height: 28px;
}

.VPFooter .brand,
.VPFooter .brand:hover {
  text-decoration: none;
}

.message,
.copyright {
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}
</style>
