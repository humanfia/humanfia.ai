<script setup lang="ts">
// The post's contents. On a wide screen it is pinned in the left margin: one line per section,
// numbered the way the sections are, the one being read marked in red, and a hairline down the
// side that fills as the post is read. Narrower than that (`inline`), it is a "Contents" fold at
// the top of the post, closed until asked for.
//
// Read off the rendered headings rather than the markdown, so it lists exactly the sections the
// page has, with the ids the page gave them -- collected whenever the content renders, which is
// also every hot reload while a post is being written. On the server it is empty, which is fine
// for a thing that only helps someone already reading. Which section is current is worked out
// when the layout's progress moves, so there is no second scroll listener.
import { onMounted, ref, watch } from 'vue'
import { onContentUpdated } from 'vitepress'

const props = withDefaults(
  defineProps<{
    /** How far through the post the reader is, 0..1, from PostLayout. */
    progress: number
    inline?: boolean
  }>(),
  { inline: false },
)

const items = ref<{ id: string; text: string }[]>([])
const active = ref<string | null>(null)
let headings: HTMLElement[] = []

function collect() {
  headings = [...document.querySelectorAll<HTMLElement>('.post-body h2[id]')]
  items.value = headings.map((h) => ({
    id: h.id,
    // The heading's own text, without the "#" anchor VitePress appends.
    text: [...h.childNodes]
      .filter((n) => !(n instanceof HTMLElement && n.classList.contains('header-anchor')))
      .map((n) => n.textContent)
      .join('')
      .trim(),
  }))
  spy()
}

function spy() {
  const line = window.innerHeight * 0.3
  let current: string | null = null
  for (const h of headings) if (h.getBoundingClientRect().top < line) current = h.id
  active.value = current
}

onMounted(collect)
onContentUpdated(collect)
watch(() => props.progress, spy)

const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <details v-if="inline && items.length" class="post-toc-inline">
    <summary>Contents <span>{{ items.length }} sections</span></summary>
    <ol>
      <li v-for="(item, i) in items" :key="item.id">
        <a :href="`#${item.id}`"><span class="post-toc-num">{{ pad(i + 1) }}</span>{{ item.text }}</a>
      </li>
    </ol>
  </details>
  <nav v-else-if="!inline && items.length" class="post-toc" aria-label="Contents">
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
