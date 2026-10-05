<script setup lang="ts">
// The page every post is: news and blog alike. `layout: post` selects it, and config.mts sets
// that for every file in blog/ and news/ except the two indexes, so a post never has to ask.
//
// From the top: a reading-progress rule pinned under the nav, the hero (PostMeta.vue), then the
// post itself in a column sized for reading, with its contents pinned in the left margin on a
// wide screen and its sidenotes in the right; figures from the kit step out of the text column
// into the margin. At the bottom, where the post came from, a way to suggest an edit, and three
// posts to read next.
//
// It replaces the theme's doc layout for posts only, so a post has no sidebar and no outline
// aside -- the contents and the related posts are this page's own way round -- but it keeps the
// nav, the footer, search and everything else the theme draws around the content.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import PostMeta from './PostMeta.vue'
import PostRelated from './PostRelated.vue'
import PostToc from './PostToc.vue'

const { page, theme } = useData()
const main = ref<HTMLElement | null>(null)
const progress = ref(0)
let queued = false

/** How far through the post itself the reader is: 0 at its first line, 1 when its last line
 *  reaches the bottom of the window. The hero and the related posts do not count. */
function measure() {
  queued = false
  if (!main.value) return
  const rect = main.value.getBoundingClientRect()
  const total = rect.height - window.innerHeight * 0.6
  progress.value = Math.min(1, Math.max(0, (window.innerHeight * 0.4 - rect.top) / Math.max(1, total)))
}
const onScroll = () => {
  if (!queued) {
    queued = true
    requestAnimationFrame(measure)
  }
}
onMounted(() => {
  measure()
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', onScroll)
})
onBeforeUnmount(() => {
  removeEventListener('scroll', onScroll)
  removeEventListener('resize', onScroll)
})

/** The theme's own edit link, so the repository is named in one place (config.mts). */
const editUrl = computed(() => {
  const pattern = theme.value.editLink?.pattern
  return typeof pattern === 'function' ? pattern(page.value) : pattern?.replace(':path', page.value.relativePath)
})
</script>

<template>
  <div class="post-page">
    <div
      class="post-progress"
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="Math.round(progress * 100)"
    >
      <i :style="{ transform: `scaleX(${progress})` }" />
    </div>

    <PostMeta />

    <div class="post-wrap">
      <aside class="post-aside">
        <PostToc :progress="progress" />
      </aside>
      <main ref="main" class="post-main">
        <PostToc :progress="progress" inline />
        <Content class="vp-doc post-body" />
        <footer v-if="editUrl" class="post-end">
          <a :href="editUrl" target="_blank" rel="noreferrer">Suggest an edit to this post ↗</a>
        </footer>
      </main>
    </div>

    <PostRelated />
  </div>
</template>
