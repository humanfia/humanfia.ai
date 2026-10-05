<script setup lang="ts">
// One word on the scoreboard, as split-flap tiles. The server renders the word; once mounted,
// and only when motion is allowed, each tile riffles through the alphabet and lands on its
// letter, left to right. `every` makes it riffle again now and then -- and land on the same
// word, because the board has nothing new to say until FlowBench is released.
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { prefersReducedMotion } from '../../../home/motion'

const props = withDefaults(defineProps<{ text: string; delay?: number; every?: number }>(), {
  delay: 0,
  every: 0,
})

const RIFFLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_-=#'
const shown = ref(props.text.split(''))
const flipping = ref(props.text.split('').map(() => false))
let raf = 0
let timer = 0

function riffle(delay: number) {
  cancelAnimationFrame(raf)
  const letters = props.text.split('')
  const start = performance.now() + delay
  // Each tile settles 70ms after the one on its left, after at least 260ms of riffling.
  const settle = letters.map((_, i) => 260 + i * 70)
  let last = 0
  const step = (now: number) => {
    const t = now - start
    if (t >= 0 && now - last > 48) {
      last = now
      shown.value = letters.map((c, i) =>
        t >= settle[i] || c === ' ' ? c : RIFFLE[Math.floor(Math.random() * RIFFLE.length)],
      )
      flipping.value = letters.map((c, i) => t < settle[i] && c !== ' ')
    }
    if (t < settle[settle.length - 1] + 60) raf = requestAnimationFrame(step)
    else {
      shown.value = letters
      flipping.value = letters.map(() => false)
    }
  }
  raf = requestAnimationFrame(step)
}

onMounted(() => {
  if (prefersReducedMotion()) return
  riffle(props.delay)
  if (props.every) timer = window.setInterval(() => riffle(0), props.every)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  clearInterval(timer)
})
</script>

<template>
  <span class="fb-flap">
    <span class="fb-sr">{{ text }}</span>
    <span v-for="(c, i) in shown" :key="i" class="fb-tile" :class="{ flip: flipping[i], sp: c === ' ' }" aria-hidden="true">{{ c }}</span>
  </span>
</template>
