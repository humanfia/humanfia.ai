<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

// A blog post's whole header: the kicker, the title, the standfirst and -- the point of it --
// the people who did the work, named directly under the title where nobody can miss them.
//
// The title is rendered here rather than as an `#` in the markdown, because that is the only
// way the byline can sit *under* it: `doc-before` is the last slot before the content, so
// anything the markdown starts with would come first. Posts therefore have no H1 of their
// own; `title` in the frontmatter is the H1, and it is already what the tab and the feed use.
//
// Every other page renders nothing from this component: a `date` in the frontmatter is what
// makes a page a post, and no other page has one.
const { frontmatter } = useData()

const isPost = computed(() => Boolean(frontmatter.value.date))

const date = computed(() =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(frontmatter.value.date)),
)

const iso = computed(() => new Date(frontmatter.value.date).toISOString())

const authors = computed<string[]>(() => {
  const front = frontmatter.value
  if (Array.isArray(front.authors)) return front.authors
  if (typeof front.author === 'string') return [front.author]
  return ['Humanfia']
})

/** First letter of the first and last word, which is right for both "Jin Pan" and "Humanfia". */
function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean)
  if (!words.length) return '?'
  const first = words[0][0]
  const last = words.length > 1 ? words[words.length - 1][0] : ''
  return (first + last).toUpperCase()
}
</script>

<template>
  <header v-if="isPost" class="post-head">
    <a class="post-back" href="/blog/">← All posts</a>

    <p class="post-kicker">
      <span v-if="frontmatter.tag" class="post-tag">{{ frontmatter.tag }}</span>
      <time :datetime="iso">{{ date }}</time>
    </p>

    <h1>{{ frontmatter.title }}</h1>

    <p v-if="frontmatter.description" class="post-standfirst">{{ frontmatter.description }}</p>

    <div class="post-authors">
      <span class="post-authors-label">{{ authors.length > 1 ? 'Authors' : 'Author' }}</span>
      <ul>
        <li v-for="name in authors" :key="name">
          <span class="post-avatar" aria-hidden="true">{{ initials(name) }}</span>
          <span class="post-author-name">{{ name }}</span>
        </li>
      </ul>
    </div>
  </header>
</template>

<style scoped>
.post-head {
  padding-bottom: 26px;
  margin-bottom: 30px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.post-back {
  display: inline-block;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
}

.post-kicker {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 18px 0 0;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.post-tag {
  padding: 2px 9px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  font-size: 11px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
}

/* The theme styles headings inside .vp-doc, and this header sits just outside it, so the
   title carries its own type. It is the same scale the section headings on the home page use. */
.post-head h1 {
  margin: 14px 0 0;
  font-size: clamp(30px, 4.4vw, 42px);
  line-height: 1.15;
  letter-spacing: -0.03em;
  font-weight: 750;
  color: var(--vp-c-text-1);
}

.post-standfirst {
  margin: 14px 0 0;
  max-width: 44rem;
  font-size: 17px;
  line-height: 1.66;
  color: var(--vp-c-text-2);
}

/* ---- The byline ------------------------------------------------------------------------
   The reason this component exists. Long-horizon work is done by people, and a result page
   that reports a number without saying whose it is has left out the part that is accountable
   for it -- so the names get an avatar, the full width of the column and their own rule. */

.post-authors {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 18px;
  margin-top: 24px;
  padding: 14px 16px;
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid var(--vp-c-brand-1);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}

.post-authors-label {
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

.post-authors ul {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.post-authors li {
  display: flex;
  align-items: center;
  gap: 9px;
}

.post-avatar {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--vp-c-brand-soft);
  border: 1px solid var(--vp-c-brand-2);
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--vp-c-brand-1);
}

.post-author-name {
  font-size: 15px;
  font-weight: 650;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
}

@media (max-width: 640px) {
  .post-authors {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
