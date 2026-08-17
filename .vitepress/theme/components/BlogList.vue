<script setup lang="ts">
import { data as posts } from '../posts.data.mts'
</script>

<template>
  <div class="posts">
    <p v-if="!posts.length" class="posts-empty">Nothing published yet.</p>
    <a v-for="post in posts" :key="post.url" class="post" :href="post.url">
      <div class="post-meta">
        <time :datetime="post.iso">{{ post.date }}</time>
        <span v-if="post.tag" class="post-tag">{{ post.tag }}</span>
      </div>
      <h2>{{ post.title }}</h2>
      <p v-if="post.description">{{ post.description }}</p>
      <span class="post-more">Read it <span aria-hidden="true">→</span></span>
    </a>
  </div>
</template>

<style scoped>
.posts {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 28px 0;
}

.post {
  display: block;
  padding: 20px 22px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.25s, background-color 0.25s;
}

.post:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-alt);
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.post-tag {
  padding: 1px 8px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-brand-1);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 11px;
}

.post h2 {
  margin: 8px 0 0;
  padding: 0;
  border: 0;
  font-size: 20px;
  line-height: 1.35;
  letter-spacing: -0.01em;
}

.post p {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.65;
  color: var(--vp-c-text-2);
}

.post-more {
  display: inline-block;
  margin-top: 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
}

.posts-empty {
  color: var(--vp-c-text-3);
}
</style>
