<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { authorsOf, avatarOf, initialsOf, personOf, profileOf } from '../people'

// A post's whole header, on the blog and in the news alike: the kicker, the title, the standfirst and -- the point of it --
// the people who did the work, named directly under the title where nobody can miss them.
//
// The title is rendered here rather than as an `#` in the markdown, because that is the only
// way the byline can sit *under* it: `doc-before` is the last slot before the content, so
// anything the markdown starts with would come first. Posts therefore have no H1 of their
// own; `title` in the frontmatter is the H1, and it is already what the tab and the feed use.
//
// Every other page renders nothing from this component: a `date` in the frontmatter is what
// makes a page a post, and no other page has one.
const { frontmatter, page } = useData()

const isPost = computed(() => Boolean(frontmatter.value.date))

/** Which section the post is in, so "back" goes to the index it was reached from. */
const section = computed(() =>
  page.value.relativePath.startsWith('news/')
    ? { href: '/news/', label: 'All news' }
    : { href: '/blog/', label: 'All posts' },
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

/** Each author with their account when we know it -- see people.ts for who is, and why. */
const authors = computed(() =>
  authorsOf(frontmatter.value).map((name) => {
    const person = personOf(name)
    return {
      name,
      initials: initialsOf(name),
      avatar: person && avatarOf(person, 28),
      href: person && profileOf(person),
    }
  }),
)

/** An imported post names where it was first published, and the page says so under the byline. */
const canonical = computed<string | undefined>(() => frontmatter.value.canonical)
const source = computed(() => (canonical.value ? new URL(canonical.value).host : ''))
</script>

<template>
  <header v-if="isPost" class="post-head">
    <a class="post-back" :href="section.href">← {{ section.label }}</a>

    <p class="post-kicker">
      <span v-if="frontmatter.tag" class="post-tag">{{ frontmatter.tag }}</span>
      <time :datetime="iso">{{ date }}</time>
    </p>

    <h1>{{ frontmatter.title }}</h1>

    <p v-if="frontmatter.description" class="post-standfirst">{{ frontmatter.description }}</p>

    <div class="post-authors">
      <span class="post-authors-label">{{ authors.length > 1 ? 'Authors' : 'Author' }}</span>
      <ul>
        <li v-for="author in authors" :key="author.name">
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
              <img v-if="author.avatar" :src="author.avatar" alt="" width="28" height="28" loading="lazy" decoding="async" />
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
   for it -- so the names get a face, the full width of the column and their own rule. The
   face is the person's GitHub avatar and links to their profile, which is where the commits
   behind the result are. */

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

.post-author {
  display: flex;
  align-items: center;
  gap: 9px;
  color: inherit;
  text-decoration: none;
}

a.post-author:hover .post-avatar img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-author-name {
  color: var(--vp-c-brand-1);
}

a.post-author:hover .post-avatar {
  border-color: var(--vp-c-brand-1);
}

.post-avatar {
  position: relative;
  overflow: hidden;
  flex: none;
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

.post-avatar img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-author-name {
  font-size: 15px;
  font-weight: 650;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
}

.post-source {
  margin: 12px 0 0;
  font-size: 13.5px;
  color: var(--vp-c-text-3);
}

.post-source a {
  color: var(--vp-c-brand-1);
}

@media (max-width: 640px) {
  .post-authors {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
