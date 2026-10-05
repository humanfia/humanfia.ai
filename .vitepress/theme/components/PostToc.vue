<script setup lang="ts">
// The post's contents, in the left margin on a wide screen: one line per section, numbered the
// way the sections are, the one being read marked in red, and a hairline down the side that
// fills as the post is read.
//
// Read off the rendered headings rather than the markdown, so it lists exactly the sections the
// page has, with the ids the page gave them. The list is built after the page mounts and rebuilt
// on every route change; on the server it is empty, which is fine for a thing that only helps
// someone already scrolling.
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

/** How far through the post the reader is, 0..1, for the rail. */
defineProps<{ progress: number }>()

const route = useRoute()
const items = ref<{ id: string; text: string }[]>([])
const active = ref<string | null>(null)
let headings: HTMLElement[] = []
let queued = false

function collect() {
  headings = [...document.querySelectorAll<HTMLElement>('.post-body h2[id]')]
  items.value = headings.map((h) => ({
    id: h.id,
    // The heading's own text, without the "#" anchor VitePress appends.
    text: [...h.childNodes].filter((n) => !(n instanceof HTMLElement && n.classList.contains('header-anchor'))).map((n) => n.textContent).join('').trim(),
  }))
  spy()
}

function spy() {
  queued = false
  const line = window.innerHeight * 0.3
  let current: string | null = null
  for (const h of headings) if (h.getBoundingClientRect().top < line) current = h.id
  active.value = current
}

const onScroll = () => {
  if (!queued) {
    queued = true
    requestAnimationFrame(spy)
  }
}

onMounted(() => {
  collect()
  addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => removeEventListener('scroll', onScroll))
watch(
  () => route.path,
  () => nextTick(collect),
)

const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <nav v-if="items.length" class="post-toc" aria-label="Contents">
    <p class="post-toc-title">Contents</p>
    <div class="post-toc-rail" aria-hidden="true"><i :style="{ transform: `scaleY(${progress})` }" /></div>
    <ol>
      <li v-for="(item, i) in items" :key="item.id" :class="{ on: active === item.id }">
        <a :href="`#${item.id}`" :aria-current="active === item.id ? 'location' : undefined">
          <span class="post-toc-num">{{ pad(i + 1) }}</span>
          <span>{{ item.text }}</span>
        </a>
      </li>
    </ol>
    <a class="post-toc-top" href="#">↑ Back to the top</a>
  </nav>
</template>
