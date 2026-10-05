<script setup lang="ts">
// One section of the HOA page: its number in the margin, a kicker, the heading, a lead that
// ends in a tombstone, and the figure the section is really about. The id is the heading's,
// and it is the id the page's sections had when they were markdown, so old links still land
// (the one old section with no section now, the olympiads, is an id on the board).
import { vReveal } from '../../../home/motion'

defineProps<{ id: string; n: string; kicker: string; title: string }>()
</script>

<template>
  <section class="hoa-sec" :aria-labelledby="id">
    <header class="hoa-sec-head">
      <p v-reveal class="hoa-sec-n" aria-hidden="true">{{ n }}</p>
      <div class="hoa-sec-copy">
        <p v-reveal class="hoa-kicker">{{ kicker }}</p>
        <h2 :id="id" v-reveal="60" class="hoa-h2">
          {{ title }}<a class="hoa-anchor" :href="`#${id}`" :aria-label="`Permalink to ${title}`">#</a>
        </h2>
        <p v-reveal="120" class="hoa-lead"><slot /><span class="qed" aria-hidden="true" /></p>
      </div>
    </header>
    <div class="hoa-sec-fig">
      <slot name="figure" />
    </div>
  </section>
</template>
