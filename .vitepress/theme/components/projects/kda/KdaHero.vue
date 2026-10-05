<script setup lang="ts">
// The KDA page's hero, on the ink: the projects as tabs, the name, the standfirst and the links on
// the left; on the right the kernel race (KdaRace.vue) and the headline number it ends on. Under
// both, the hardware KDA's kernels have been measured on, read like a profiler's device list.
//
// Everything it says is the page's frontmatter: `title` (split at the colon), `description`,
// `project.status` and `project.links`, and the `race:` block.
import { computed } from 'vue'
import { useData } from 'vitepress'
import NumberTicker from '../../kit/NumberTicker.vue'
import KdaRace from './KdaRace.vue'
import { useMotion } from './motion'
import './kda.css'

const { frontmatter, page, theme } = useData()
const motion = useMotion()

const fm = computed(() => frontmatter.value)
const title = computed(() => {
  const [main, ...rest] = String(fm.value.title ?? '').split(': ')
  return { main, sub: rest.join(': ') }
})
const best = computed(() => fm.value.race.lanes.find((lane: { best?: boolean }) => lane.best))

/** The projects menu from the nav, so the tabs are the menu and never a second list of it. */
const projects = computed<{ text: string; link: string }[]>(
  () => theme.value.nav?.find((item: { activeMatch?: string }) => item.activeMatch === '/projects/')?.items ?? [],
)
const here = computed(() => `/${page.value.relativePath.replace(/\.md$/, '')}`)
const external = (href: string) => /^https?:/.test(href)
</script>

<template>
  <header class="kd-band kd-ink hero" :class="{ 'kd-motion': motion }">
    <div class="hero-grid" aria-hidden="true" />
    <div class="kd-wrap hero-wrap">
      <div class="hero-copy">
        <nav v-if="projects.length" class="hero-tabs" aria-label="Projects">
          <a
            v-for="item in projects"
            :key="item.link"
            :href="item.link"
            :class="{ on: item.link === here }"
            :aria-current="item.link === here ? 'page' : undefined"
          >{{ item.text }}</a>
        </nav>

        <p class="hero-status kd-kicker">
          <span class="hero-tag">Project</span>{{ fm.project.status }}
        </p>

        <h1 class="hero-title">
          <span class="hero-main">{{ title.main }}</span>
          <span class="hero-sub">{{ title.sub }}</span>
        </h1>

        <p class="hero-stand">{{ fm.description }}</p>

        <ul class="hero-links">
          <li v-for="link in fm.project.links" :key="link.href">
            <a
              :href="link.href"
              :target="external(link.href) ? '_blank' : undefined"
              :rel="external(link.href) ? 'noreferrer' : undefined"
            >{{ link.text }}<span aria-hidden="true">{{ external(link.href) ? ' ↗' : ' →' }}</span></a>
          </li>
        </ul>
      </div>

      <div class="hero-figure">
        <div class="hero-number">
          <p class="kd-kicker">{{ fm.race.headline }}</p>
          <p class="hero-value">
            <NumberTicker :value="best.score" :from="1" :decimals="2" suffix="×" :duration="2200" :delay="500" />
          </p>
          <p class="hero-label">{{ fm.race.label }}</p>
        </div>
        <KdaRace :lanes="fm.race.lanes" :kicker="fm.race.kicker" />
      </div>
    </div>

    <div class="kd-wrap">
      <dl class="hero-devices">
        <dt class="kd-kicker">Measured on</dt>
        <dd v-for="(device, i) in fm.race.devices" :key="device" class="kd-mono" :style="{ '--i': i }">{{ device }}</dd>
      </dl>
    </div>
  </header>
</template>

<style scoped>
.hero {
  padding: clamp(40px, 6vw, 72px) 0 clamp(36px, 5vw, 56px);
}

/* A trace viewer's ruled ground, fading out toward the copy. */
.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--kd-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--kd-grid) 1px, transparent 1px);
  background-size: 48px 48px;
  background-position: -1px -1px;
  mask-image: radial-gradient(ellipse 70% 90% at 78% 40%, #000 30%, transparent 75%);
  pointer-events: none;
}

.hero-wrap {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  gap: clamp(40px, 6vw, 96px);
  align-items: center;
}

.hero-tabs {
  display: inline-flex;
  flex-wrap: wrap;
  margin-bottom: clamp(28px, 4vw, 44px);
  border: 1px solid var(--kd-line);
}

.hero-tabs a {
  padding: 7px 12px;
  font-family: var(--kd-mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--kd-fg-2);
  text-decoration: none;
  transition: color 0.2s, background 0.2s;
}

.hero-tabs a + a {
  border-left: 1px solid var(--kd-line);
}

.hero-tabs a:hover {
  color: var(--kd-fg);
  background: var(--kd-grid);
}

.hero-tabs a.on {
  color: var(--kd-bg);
  background: var(--kd-fg);
}

.hero-status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  color: var(--kd-red-text);
}

.hero-tag {
  padding: 4px 8px;
  color: var(--kd-bg);
  background: var(--kd-fg);
}

.hero-title {
  margin: 18px 0 0;
  line-height: 1;
}

.hero-main {
  display: block;
  font-size: clamp(104px, 15vw, 216px);
  font-weight: 800;
  line-height: 0.82;
  letter-spacing: -0.07em;
  margin-left: -0.04em;
}

.hero-sub {
  display: block;
  margin-top: 14px;
  font-size: clamp(26px, 3vw, 40px);
  font-weight: 700;
  letter-spacing: -0.035em;
  color: var(--kd-fg-2);
}

.hero-stand {
  max-width: 54ch;
  margin: 24px 0 0;
  font-size: clamp(17px, 1.45vw, 20px);
  line-height: 1.6;
  color: var(--kd-fg-2);
}

.hero-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 30px 0 0;
  padding: 0;
  list-style: none;
}

.hero-links a {
  display: inline-block;
  padding: 10px 14px;
  font-family: var(--kd-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--kd-fg);
  text-decoration: none;
  border: 1px solid var(--kd-fg);
  transition:
    color 0.2s,
    background 0.2s,
    transform 0.25s var(--kd-ease);
}

.hero-links a:hover {
  color: var(--kd-bg);
  background: var(--kd-fg);
  transform: translateY(-2px);
}

.hero-links li:first-child a {
  color: var(--kd-on-red);
  background: var(--kd-red);
  border-color: var(--kd-red);
}

.hero-number {
  margin-bottom: 26px;
}

.hero-value {
  margin: 6px 0 0;
  font-size: clamp(76px, 9vw, 132px);
  font-weight: 800;
  line-height: 0.9;
  letter-spacing: -0.06em;
  color: var(--kd-red);
  font-variant-numeric: tabular-nums;
}

.hero-label {
  max-width: 46ch;
  margin: 12px 0 0;
  font-size: 15px;
  line-height: 1.5;
  color: var(--kd-fg-2);
}

.hero-devices {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  margin: clamp(48px, 6vw, 80px) 0 0;
  padding-top: 18px;
  border-top: 1px solid var(--kd-line);
}

.hero-devices dt {
  margin-right: 8px;
}

.hero-devices dd {
  margin: 0;
  padding: 4px 9px;
  font-size: 12px;
  color: var(--kd-fg-2);
  border: 1px solid var(--kd-line);
}

/* The entrance, in CSS so it plays from the server-rendered page without a flash: the copy
   rises in order, the devices tick on one by one. */
@media (prefers-reduced-motion: no-preference) {
  .hero-copy > *,
  .hero-figure {
    animation: kd-rise 1s var(--kd-ease) both;
  }
  .hero-copy > :nth-child(2) { animation-delay: 0.06s; }
  .hero-copy > :nth-child(3) { animation-delay: 0.12s; }
  .hero-copy > :nth-child(4) { animation-delay: 0.2s; }
  .hero-copy > :nth-child(5) { animation-delay: 0.28s; }
  .hero-figure { animation-delay: 0.2s; }
  .hero-devices dd {
    animation: kd-fade 0.5s var(--kd-ease) both;
    animation-delay: calc(0.6s + var(--i) * 0.07s);
  }
}

@keyframes kd-rise {
  from {
    opacity: 0;
    transform: translate3d(0, 28px, 0);
  }
}

@keyframes kd-fade {
  from {
    opacity: 0;
  }
}

@media (max-width: 1100px) {
  .hero-wrap {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
