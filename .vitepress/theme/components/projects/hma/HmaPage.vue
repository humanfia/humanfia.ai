<script setup lang="ts">
// The HMA project page, whole: projects/hma.md is only its frontmatter and this.
//
// It is a scoreboard more than a document -- a hero with the board HMA tops and the relay that put
// it there, then one section per question a reader brings (how, how well, with whom, how do I run
// it, and what came before) -- so it is drawn full width in components rather than in a column
// of markdown. The look is the site's: ink, paper and one red, square corners, mono for anything
// the site says about itself. What is HMA's own is the scoreboard: tabular figures, ranks, rules
// between rows, and the flow grammar's blue and teal for the two agents taking turns.
//
// A strip of section links rides under the nav and marks the section being read. Reveals use the
// home page's `v-reveal`, armed only once mounted with motion allowed (`hf-motion`), so the
// server-rendered page and a reader who asked for less motion see everything in place.
import { onMounted, ref } from 'vue'
import ProjectTimeline from '../../kit/ProjectTimeline.vue'
import { onScrollFrame, prefersReducedMotion, vReveal } from '../../../home/motion'
import HmaHero from './HmaHero.vue'
import HmaHow from './HmaHow.vue'
import HmaKaggle from './HmaKaggle.vue'
import HmaPairings from './HmaPairings.vue'
import HmaResults from './HmaResults.vue'
import HmaUse from './HmaUse.vue'
import './hma.css'

const motion = ref(false)
onMounted(() => (motion.value = !prefersReducedMotion()))

const CHAPTERS = [
  { id: 'how-it-works', text: 'How it works' },
  { id: 'results', text: 'Results' },
  { id: 'the-pairings', text: 'Pairings' },
  { id: 'reproduce-it-or-use-it', text: 'Use it' },
  { id: 'before-hma-live-kaggle', text: 'Kaggle' },
  { id: 'results-as-they-came-in', text: 'Timeline' },
]
const current = ref('')
onScrollFrame(() => {
  let now = ''
  for (const c of CHAPTERS) {
    const el = document.getElementById(c.id)
    if (el && el.getBoundingClientRect().top < innerHeight * 0.35) now = c.id
  }
  current.value = now
})
</script>

<template>
  <div class="hma-root flow-ui" :class="{ 'hf-motion': motion }">
    <HmaHero />

    <nav class="hma-chapters" aria-label="On this page">
      <div class="hma-wrap">
        <a
          v-for="(c, i) in CHAPTERS"
          :key="c.id"
          :href="`#${c.id}`"
          :class="{ on: current === c.id }"
          :aria-current="current === c.id ? 'location' : undefined"
        ><span>{{ String(i + 1).padStart(2, '0') }}</span>{{ c.text }}</a>
      </div>
    </nav>

    <HmaHow />
    <HmaResults />
    <HmaPairings />
    <HmaUse />
    <HmaKaggle />

    <section id="results-as-they-came-in" class="hma-section hma-band" aria-labelledby="timeline-h">
      <div class="hma-wrap">
        <div class="hma-section-head" v-reveal>
          <p class="hma-kicker"><span class="hma-num">06</span> On the record</p>
          <h2 id="timeline-h" class="hma-h2">Results, as they came in</h2>
        </div>
        <ProjectTimeline
          kicker="HMA and the Kaggle work before it"
          label="HMA and Kaggle write-ups: fourteen of nineteen Kaggle competitions in the top 5% counting late estimates in August; in October, HMA's 78.2% medal rate on MLE-bench and Biohub's final rank of 188th of 3,947."
          :entries="[
            { url: '/news/2026-08-15-kaggle-nineteen-competitions', metric: '14 of 19' },
            { url: '/news/2026-10-05-hma-mle-bench', metric: '78.2%' },
            { url: '/news/2026-10-05-kaggle-biohub-final', metric: '188 / 3,947' },
            { title: 'The HMA paper', pending: true, metric: 'Pending', note: 'The manuscript behind these numbers. Until it is out, every HMA number here is self-reported.' },
          ]"
        />
      </div>
    </section>
  </div>
</template>
