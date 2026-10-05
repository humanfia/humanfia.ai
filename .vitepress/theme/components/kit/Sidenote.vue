<script setup lang="ts">
// A note in the margin, Tufte-style: a numbered reference in the sentence, the note itself level
// with it in the right-hand margin -- where a reader's eye can take it or leave it without losing
// the line. Where the column has no margin (a phone, a narrow window) the number becomes a
// button that opens the note in place.
//
//   The kernel keeps its state in bf16<Sidenote>FlashKDA commit 7afb9f.</Sidenote>, so error grows.
//
// Numbering is a CSS counter on the post body, so notes number themselves in reading order.
import { ref } from 'vue'
import { uid } from './shared'

const open = ref(false)
const id = uid('sn')
</script>

<template>
  <span class="sn" :class="{ open }">
    <button
      type="button"
      class="sn-ref"
      :aria-expanded="open"
      :aria-controls="id"
      aria-label="Note"
      @click="open = !open"
    />
    <span :id="id" class="sn-note" role="note"><slot /></span>
  </span>
</template>
