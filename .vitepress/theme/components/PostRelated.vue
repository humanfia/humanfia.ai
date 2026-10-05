<script setup lang="ts">
// Where to go next: three posts, chosen by what this one is about. Same project first (the tag),
// newest first; then the rest of the same section; never the post itself. The titles are never
// cut mid-line -- a card is as tall as its title needs.
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as posts } from '../posts.data.mts'

const { frontmatter, page } = useData()

const url = computed(() => `/${page.value.relativePath.replace(/(?:index)?\.md$/, '')}`)
const kind = computed(() => (page.value.relativePath.startsWith('news/') ? 'news' : 'blog'))

const related = computed(() => {
  const others = posts.filter((post) => post.url !== url.value)
  const tag = frontmatter.value.tag
  const sameTag = tag ? others.filter((post) => post.tag === tag) : []
  const sameKind = others.filter((post) => post.kind === kind.value && !sameTag.includes(post))
  return [...sameTag, ...sameKind, ...others].filter((post, i, all) => all.indexOf(post) === i).slice(0, 3)
})
</script>

<template>
  <section v-if="related.length" class="post-related" aria-labelledby="post-related-title">
    <div class="post-related-inner">
      <p id="post-related-title" class="post-related-title">Read next</p>
      <div class="post-related-grid">
        <a v-for="post in related" :key="post.url" class="post-related-card" :href="post.url">
          <span class="post-related-meta">
            <span v-if="post.tag" class="post-tag">{{ post.tag }}</span>
            <span>{{ post.kind === 'news' ? 'News' : 'Blog' }}</span>
            <time :datetime="post.iso">{{ post.date }}</time>
          </span>
          <strong>{{ post.title }}</strong>
          <span class="post-related-desc">{{ post.description }}</span>
          <span class="post-related-more">Read it <span aria-hidden="true">→</span></span>
        </a>
      </div>
    </div>
  </section>
</template>
