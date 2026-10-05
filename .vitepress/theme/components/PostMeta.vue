<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { authorsOf, avatarOf, initialsOf, personOf, profileOf } from '../people'
import { data as posts } from '../posts.data.mts'
import Leaderboard from './kit/Leaderboard.vue'
import NumberTicker from './kit/NumberTicker.vue'

// A post's hero, on the blog and in the news alike: the tag and the date, the title, the
// standfirst and -- the point of it -- the people who did the work, with their faces, named
// directly under the title where nobody can miss them.
//
// It is drawn as a poster. One red band crosses it on the site's diagonal, a thin ink rule runs
// beside the band, and the red circle -- the dot of the H -- sits where the band leaves the frame.
// The title is the largest type on the site: a title with a colon is set as a display line and a
// second line under it ("KDA²" / "Kernel Design Agents ..."), which is the same title, read the
// way it is built.
//
// A post can add a headline figure to the right of the copy with a `hero` block in its
// frontmatter -- one number that counts up, a sentence, and optionally a small leaderboard:
//
//   hero:
//     kicker: KDA → KDA · B300 forward
//     value: 2.96
//     from: 1
//     decimals: 2
//     suffix: ×
//     label: geomean speedup over FlashKDA
//     board:
//       - { name: KDA + TIRx, score: 2.96, us: true }
//       - { name: FlashKDA, score: 1 }
//
// Without one, the right of the hero is the post's tag set huge in outline along the diagonal.
//
// Every other page renders nothing from this component: a `date` in the frontmatter is what
// makes a page a post, and no other page has one.
const { frontmatter, page } = useData()

const isPost = computed(() => Boolean(frontmatter.value.date))

/** Which section the post is in, so "back" goes to the index it was reached from. */
const section = computed(() =>
  page.value.relativePath.startsWith('news/')
    ? { href: '/news/', label: 'All news', name: 'News' }
    : { href: '/blog/', label: 'All posts', name: 'Blog' },
)

const date = computed(() =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(frontmatter.value.date)),
)

const iso = computed(() => new Date(frontmatter.value.date).toISOString())

const url = computed(() => `/${page.value.relativePath.replace(/(?:index)?\.md$/, '')}`)
const minutes = computed(() => posts.find((post) => post.url === url.value)?.minutes)

/** "KDA²: Kernel Design Agents ..." is a display line and a subtitle; a title with no colon,
 *  or whose first part would be a sentence on its own, is set whole. */
const title = computed(() => {
  const whole = String(frontmatter.value.title ?? '')
  const at = whole.indexOf(': ')
  if (at > 0 && at <= 28) return { main: whole.slice(0, at), sub: whole.slice(at + 2) }
  return { main: whole, sub: '' }
})
const size = computed(() => (title.value.main.length <= 14 ? 'xl' : title.value.main.length <= 48 ? 'lg' : 'md'))

/** Each author with their account when we know it -- see people.ts for who is, and why. */
const authors = computed(() =>
  authorsOf(frontmatter.value).map((name) => {
    const person = personOf(name)
    return {
      name,
      initials: initialsOf(name),
      avatar: person && avatarOf(person, 40),
      href: person && profileOf(person),
    }
  }),
)

/** An imported post names where it was first published, and the page says so under the byline. */
const canonical = computed<string | undefined>(() => frontmatter.value.canonical)
const source = computed(() => (canonical.value ? new URL(canonical.value).host : ''))

interface Hero {
  kicker?: string
  value: number
  from?: number
  decimals?: number
  prefix?: string
  suffix?: string
  label?: string
  board?: { name: string; score: number; us?: boolean; detail?: string }[]
  boardDecimals?: number
}
const hero = computed<Hero | undefined>(() => frontmatter.value.hero)
</script>

<template>
  <header v-if="isPost" class="post-hero" :class="{ 'has-card': hero }">
    <div class="post-hero-geo" aria-hidden="true">
      <span class="geo-band" />
      <span class="geo-rule" />
      <span class="geo-dot" />
      <span v-if="!hero && frontmatter.tag" class="geo-tag" :style="{ '--n': String(frontmatter.tag).length }">{{ frontmatter.tag }}</span>
    </div>

    <div class="post-hero-inner">
      <div class="post-hero-copy">
        <a class="post-back" :href="section.href">← {{ section.label }}</a>

        <p class="post-kicker">
          <span v-if="frontmatter.tag" class="post-tag">{{ frontmatter.tag }}</span>
          <span class="post-section">{{ section.name }}</span>
          <time :datetime="iso">{{ date }}</time>
          <span v-if="minutes">{{ minutes }} min read</span>
        </p>

        <h1 class="post-title" :class="`size-${size}`">
          <span class="post-title-main">{{ title.main }}</span>
          <span v-if="title.sub" class="post-title-sub">{{ title.sub }}</span>
        </h1>

        <p v-if="frontmatter.description" class="post-standfirst">{{ frontmatter.description }}</p>

        <div class="post-authors">
          <span class="post-authors-label">{{ authors.length > 1 ? `${authors.length} authors` : 'Author' }}</span>
          <ul>
            <li v-for="(author, i) in authors" :key="author.name" :style="{ '--i': i }">
              <component
                :is="author.href ? 'a' : 'span'"
                class="post-author"
                :href="author.href"
                :target="author.href ? '_blank' : undefined"
                :rel="author.href ? 'noreferrer' : undefined"
              >
                <!-- The initials sit under the image, so a slow or blocked avatar still shows
                     something; the image covers them the moment it arrives. -->
                <span class="post-avatar" aria-hidden="true">
                  {{ author.initials }}
                  <img v-if="author.avatar" :src="author.avatar" alt="" width="40" height="40" loading="lazy" decoding="async" />
                </span>
                <span class="post-author-name">{{ author.name }}</span>
              </component>
            </li>
          </ul>
        </div>

        <p v-if="canonical" class="post-source">
          First published at <a :href="canonical" target="_blank" rel="noreferrer">{{ source }}</a>, and
          reproduced here with its authors.
        </p>
      </div>

      <aside v-if="hero" class="kit invert post-hero-card" :aria-label="hero.label ?? 'Headline result'">
        <p v-if="hero.kicker" class="kit-kicker">{{ hero.kicker }}</p>
        <p class="post-hero-value">
          <NumberTicker
            :value="hero.value"
            :from="hero.from ?? 0"
            :decimals="hero.decimals ?? 0"
            :prefix="hero.prefix ?? ''"
            :suffix="hero.suffix ?? ''"
            :duration="1800"
            :delay="250"
          />
        </p>
        <p v-if="hero.label" class="post-hero-label">{{ hero.label }}</p>
        <Leaderboard
          v-if="hero.board"
          :entries="hero.board"
          :decimals="hero.boardDecimals ?? hero.decimals ?? 0"
          :suffix="hero.suffix ?? ''"
          bare
          invert
        />
      </aside>
    </div>
  </header>
</template>
