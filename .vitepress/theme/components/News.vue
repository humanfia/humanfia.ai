<script setup lang="ts">
// The news reel: the most recent posts, one at a time, advancing on their own.
//
// It reads the same build-time list the blog index and the RSS feed read, so a result is
// published by writing one file and this follows. Everything that moves is gated on `motion`,
// which the browser turns on after mount unless the reader has asked for reduced motion -- in
// which case the reel still works, it just waits to be clicked.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { data as posts } from '../posts.data.mts'

/** How many of them are in the reel, and how long each one holds the stage. */
const SHOWN = 5
const DWELL = 6500

const reel = computed(() => posts.slice(0, SHOWN))

const at = ref(0)
const motion = ref(false)
const held = ref(false)
const onScreen = ref(true)
const root = ref<HTMLElement | null>(null)

const current = computed(() => reel.value[at.value])
const running = computed(() => motion.value && !held.value && onScreen.value)

let timer: ReturnType<typeof setInterval> | undefined
let watcher: IntersectionObserver | undefined

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  motion.value = true

  // Nothing advances while the section is scrolled away, which keeps a page left open in a
  // background tab from repainting a headline every six seconds for nobody.
  if (root.value && 'IntersectionObserver' in window) {
    watcher = new IntersectionObserver(
      (entries) => (onScreen.value = entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.2 },
    )
    watcher.observe(root.value)
  }

  timer = setInterval(() => {
    if (running.value) at.value = (at.value + 1) % reel.value.length
  }, DWELL)
})

onBeforeUnmount(() => {
  clearInterval(timer)
  watcher?.disconnect()
})

const pick = (i: number) => {
  at.value = i
}

/** Left and right walk the rail, which is what a reader expects of a set of tabs. */
function onKey(event: KeyboardEvent, i: number) {
  const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1
    : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1
    : 0
  if (!step) return
  event.preventDefault()
  const next = (i + step + reel.value.length) % reel.value.length
  pick(next)
  root.value?.querySelectorAll<HTMLButtonElement>('.news-pick')[next]?.focus()
}
</script>

<template>
  <div
    v-if="reel.length"
    ref="root"
    class="news"
    :class="{ still: !motion }"
    @mouseenter="held = true"
    @mouseleave="held = false"
    @focusin="held = true"
    @focusout="held = false"
  >
    <div
      class="news-stage"
      role="tabpanel"
      :id="`news-panel-${at}`"
      :aria-labelledby="`news-tab-${at}`"
    >
      <!-- Keyed on the index, so the whole card is thrown away and rebuilt on every change and
           the entrance animation runs again rather than only once. -->
      <article :key="at" class="news-card">
        <p class="news-kicker">
          <span class="news-live" aria-hidden="true"><i /></span>
          <span v-if="current.tag" class="news-tag">{{ current.tag }}</span>
          <time :datetime="current.iso">{{ current.date }}</time>
        </p>

        <h3><a :href="current.url">{{ current.title }}</a></h3>

        <p v-if="current.description" class="news-blurb">{{ current.description }}</p>

        <p class="news-by">{{ current.authors.join(' · ') }}</p>

        <a class="news-more" :href="current.url">Read it <span aria-hidden="true">→</span></a>
      </article>

      <!-- The dwell, drawn. Keyed too, so it restarts with the card. -->
      <div class="news-bar" aria-hidden="true">
        <span
          :key="at"
          :style="{ '--dwell': `${DWELL}ms`, animationPlayState: running ? 'running' : 'paused' }"
        />
      </div>
    </div>

    <ol class="news-rail" role="tablist" aria-label="Latest posts">
      <li v-for="(post, i) in reel" :key="post.url">
        <button
          class="news-pick"
          :class="{ on: at === i }"
          :id="`news-tab-${i}`"
          type="button"
          role="tab"
          :aria-selected="at === i"
          :aria-controls="`news-panel-${i}`"
          :tabindex="at === i ? 0 : -1"
          @click="pick(i)"
          @mouseenter="pick(i)"
          @focus="pick(i)"
          @keydown="onKey($event, i)"
        >
          <span class="news-when">{{ post.short }}</span>
          <span class="news-what">{{ post.title }}</span>
        </button>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.news {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(268px, 1fr);
  gap: 20px;
  margin: 28px 0 0;
}

/* ---- The stage ------------------------------------------------------------------------- */

.news-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 286px;
  padding: 30px 32px 34px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

/* One wash of the accent in the corner the eye starts in, so the card is not a flat panel. */
.news-stage::before {
  content: '';
  position: absolute;
  inset: -40% 40% 30% -30%;
  pointer-events: none;
  background: radial-gradient(
    50% 50% at 50% 50%,
    color-mix(in srgb, var(--vp-c-brand-1) 16%, transparent),
    transparent 70%
  );
}

.news-card {
  position: relative;
  animation: news-arrive 0.55s cubic-bezier(0.2, 0.8, 0.3, 1) both;
}

@keyframes news-arrive {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
}

.news-kicker {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.news-live {
  display: inline-flex;
  width: 8px;
  height: 8px;
}

.news-live i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  animation: news-pulse 2.2s ease-in-out infinite;
}

@keyframes news-pulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--vp-c-brand-1) 55%, transparent);
  }
  70% {
    opacity: 0.65;
    box-shadow: 0 0 0 7px transparent;
  }
}

.news-tag {
  padding: 2px 9px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  font-size: 11px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
}

.news-card h3 {
  margin: 16px 0 0;
  font-size: clamp(23px, 2.6vw, 31px);
  line-height: 1.22;
  letter-spacing: -0.028em;
  font-weight: 750;
}

.news-card h3 a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s;
}

.news-card h3 a:hover {
  color: var(--vp-c-brand-1);
}

.news-blurb {
  margin: 14px 0 0;
  max-width: 42rem;
  font-size: 15px;
  line-height: 1.65;
  color: var(--vp-c-text-2);
}

.news-by {
  margin: 16px 0 0;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.news-more {
  display: inline-block;
  margin-top: 18px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.news-more:hover {
  text-decoration: underline;
}

.news-bar {
  position: absolute;
  inset: auto 0 0 0;
  height: 3px;
  background: var(--vp-c-divider);
}

.news-bar span {
  display: block;
  height: 100%;
  width: 0;
  background: var(--vp-c-brand-1);
  animation: news-fill var(--dwell, 6500ms) linear both;
}

@keyframes news-fill {
  to {
    width: 100%;
  }
}

/* ---- The rail --------------------------------------------------------------------------- */

.news-rail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.news-pick {
  display: flex;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: none;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.25s, border-color 0.25s;
}

.news-pick:hover,
.news-pick.on {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.news-when {
  flex: none;
  width: 52px;
  padding-top: 2px;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  color: var(--vp-c-text-3);
  transition: color 0.25s;
}

.news-pick.on .news-when {
  color: var(--vp-c-brand-1);
}

.news-what {
  font-size: 14px;
  line-height: 1.45;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-2);
  transition: color 0.25s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-pick.on .news-what {
  font-weight: 650;
  color: var(--vp-c-text-1);
}

/* ---- Reduced motion, and the server's first render -------------------------------------- */

.news.still .news-card,
.news.still .news-bar span,
.news.still .news-live i {
  animation: none;
}

.news.still .news-bar {
  display: none;
}

/* ---- Narrow ------------------------------------------------------------------------------ */

@media (max-width: 899px) {
  .news {
    grid-template-columns: 1fr;
  }

  .news-stage {
    min-height: 0;
    padding: 24px 22px 28px;
  }
}
</style>
