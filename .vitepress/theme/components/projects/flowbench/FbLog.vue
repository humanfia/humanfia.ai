<script setup lang="ts">
// How FlowBench got here, as a match log: one entry per post that led to it, its date and the
// line it is remembered by, and at the end the fixture that has not been played -- the release.
// A post is named by its url and read from posts.data, so a title is never written twice.
import { computed, ref } from 'vue'
import { data as posts } from '../../../posts.data.mts'
import { onFirstSight } from '../../../home/motion'

interface Entry {
  url?: string
  title?: string
  metric: string
  note?: string
}

const props = defineProps<{ entries: Entry[] }>()

const rows = computed(() =>
  props.entries.map((e) => {
    const post = e.url ? posts.find((p) => p.url === e.url) : undefined
    if (e.url && !post) throw new Error(`FbLog: no post at ${e.url}`)
    return { ...e, title: post?.title ?? e.title ?? '', date: post?.date ?? '', kind: post?.kind ?? 'next', pending: !post }
  }),
)

const root = ref<HTMLElement | null>(null)
const drawn = ref(false)
onFirstSight(root, () => (drawn.value = true), 0.2)
</script>

<template>
  <ol ref="root" class="fb-log" :class="{ drawn }">
    <li v-for="(r, i) in rows" :key="r.title" :class="{ pending: r.pending }" :style="{ '--i': i }">
      <span class="pin" aria-hidden="true" />
      <span class="when">{{ r.pending ? 'Next' : r.date }}<small>{{ r.pending ? '' : r.kind }}</small></span>
      <span class="metric">{{ r.metric }}</span>
      <a v-if="r.url" class="title" :href="r.url">{{ r.title }}</a>
      <span v-else class="title">{{ r.title }}</span>
      <span v-if="r.note" class="note">{{ r.note }}</span>
    </li>
  </ol>
</template>
