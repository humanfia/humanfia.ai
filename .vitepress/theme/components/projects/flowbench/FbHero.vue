<script setup lang="ts">
// FlowBench's hero: the projects as tabs, the name and what it is on the left, the board on
// the right, and under both the four facts that make it a referee rather than a leaderboard.
import { computed, onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import { prefersReducedMotion } from '../../../home/motion'
import FbScoreboard from './FbScoreboard.vue'

const { theme, page } = useData()

/** The nav's projects menu, so the tabs are the menu and never a second list of it. */
const projects = computed<{ text: string; link: string }[]>(
  () => theme.value.nav?.find((item: { activeMatch?: string }) => item.activeMatch === '/projects/')?.items ?? [],
)
const here = computed(() => `/${page.value.relativePath.replace(/\.md$/, '')}`)

const FACTS = [
  { big: 'Hours', kicker: 'Task length', text: 'Each task takes hours of agent time. One turn is never enough.' },
  { big: '1', kicker: 'Variable', text: 'The flow. The model, tools, task, budget and machine stay fixed.' },
  { big: '0', kicker: 'LLM graders', text: 'Faster, compiles, passes: every score is a check that already existed.' },
  { big: '—', kicker: 'Numbers published', text: 'None yet. When there are, they go in the news.' },
]

const motion = ref(false)
onMounted(() => (motion.value = !prefersReducedMotion()))
</script>

<template>
  <header class="fb-hero" :class="{ 'fb-go': motion }">
    <div class="fb-hero-art" aria-hidden="true">
      <i class="band" />
      <i class="disc" />
    </div>
    <div class="fb-wrap fb-hero-grid">
      <div class="fb-hero-copy">
        <nav v-if="projects.length" class="fb-tabs" aria-label="Projects">
          <a
            v-for="p in projects"
            :key="p.link"
            :href="p.link"
            :class="{ on: p.link === here }"
            :aria-current="p.link === here ? 'page' : undefined"
          >{{ p.text }}</a>
        </nav>
        <p class="fb-status"><span>Project</span>In development · not released</p>
        <h1 class="fb-title">
          FlowBench
          <span class="fb-title-sub">The referee.</span>
        </h1>
        <p class="fb-stand">
          A benchmark that scores <em>flows</em>, not models. It holds the model fixed, makes the
          loop around it the variable, and lets a check that already existed call the result.
        </p>
        <div class="fb-actions">
          <a class="fb-btn primary" href="/flows/">The flows it scores <span aria-hidden="true">→</span></a>
          <a class="fb-btn" href="https://github.com/humanfia/flowverse" target="_blank" rel="noreferrer">humanfia/flowverse <span aria-hidden="true">↗</span></a>
          <a class="fb-btn" href="/projects/humanize">The runtime <span aria-hidden="true">→</span></a>
        </div>
      </div>
      <FbScoreboard />
    </div>
    <dl class="fb-wrap fb-facts">
      <div v-for="(f, i) in FACTS" :key="f.kicker" class="fb-fact" :style="{ '--i': i }">
        <dt>{{ f.kicker }}</dt>
        <dd class="big">{{ f.big }}</dd>
        <dd>{{ f.text }}</dd>
      </div>
    </dl>
  </header>
</template>
