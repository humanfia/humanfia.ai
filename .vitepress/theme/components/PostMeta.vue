<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

// Rendered above every page's content, and on a page that is not a post it renders nothing:
// a `date` in the frontmatter is what makes a page a post here, and blog/index.md has none.
const { frontmatter } = useData()

const isPost = computed(() => Boolean(frontmatter.value.date))

const date = computed(() =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(frontmatter.value.date)),
)

const iso = computed(() => new Date(frontmatter.value.date).toISOString())
</script>

<template>
  <div v-if="isPost" class="post-byline">
    <a class="back" href="/blog/">← All posts</a>
    <div>
      <time :datetime="iso">{{ date }}</time>
      <span>{{ frontmatter.author ?? 'Humanfia' }}</span>
      <span v-if="frontmatter.tag">{{ frontmatter.tag }}</span>
    </div>
  </div>
</template>

<style scoped>
.post-byline {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.post-byline > div {
  display: flex;
  gap: 14px;
}

.back {
  color: var(--vp-c-brand-1);
  font-weight: 500;
}
</style>
