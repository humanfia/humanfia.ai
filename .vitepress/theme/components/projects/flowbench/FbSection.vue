<script setup lang="ts">
// A section of the page: its number and kicker on a rule, then whatever the markdown puts in
// it. `band` lays it on the paper's second tone. Each block of text in it rises into place the
// first time it is on screen (vReveal, home/motion.ts) -- only once mounted with motion allowed,
// so the server's page and a reader who asked for less motion see everything at once. The
// figures are left to make their own entrances: their roots carry reactive classes, which would
// overwrite the reveal's.
import { onBeforeUnmount, onMounted, ref, type DirectiveBinding } from 'vue'
import { prefersReducedMotion, vReveal } from '../../../home/motion'

defineProps<{ n: string; kicker: string; band?: boolean }>()

const body = ref<HTMLElement | null>(null)
const motion = ref(false)
let blocks: HTMLElement[] = []

const bind = (value: number) => ({ value }) as DirectiveBinding<number | undefined>

onMounted(() => {
  if (prefersReducedMotion() || !body.value) return
  motion.value = true
  blocks = [...body.value.querySelectorAll<HTMLElement>(':scope > :is(h2, p, .fb-rules, .fb-tiles)')]
  blocks.forEach((el, i) => vReveal.mounted!(el, bind(Math.min(i, 3) * 70), null!, null))
})
onBeforeUnmount(() => blocks.forEach((el) => vReveal.unmounted!(el, bind(0), null!, null)))
</script>

<template>
  <section class="fb-sec" :class="{ band, 'hf-motion': motion }">
    <div class="fb-wrap">
      <p class="fb-sec-tag"><span class="n">{{ n }}</span><span class="k">{{ kicker }}</span></p>
      <div ref="body" class="fb-sec-body">
        <slot />
      </div>
    </div>
  </section>
</template>
