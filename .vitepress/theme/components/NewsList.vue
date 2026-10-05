<script setup lang="ts">
// The news, as a reader lists it.
//
// The news index used to be the mosaic the blog still uses. A wall of tiles is right for essays,
// which are picked by what catches the eye; it is wrong for a record, which is read the way a
// feed reader reads one: down a single column, newest first, a date on every line. So every
// result is one row -- when, which project, what, the sentence that says it, and who -- under
// the month it was published in.
import { computed } from 'vue'
import { data as posts } from '../posts.data.mts'
import { avatarOf, initialsOf, personOf } from '../people'

/** At most this many faces in a stack; the rest are a count, as on the mosaic's tiles. */
const STACK = 4

/** The month a row is filed under. UTC, as the dates themselves are, so the server and the
 *  browser agree on which month a post written late on the last day belongs to. */
const MONTH = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })

// posts.data.mts already sorts newest first, so a month is a run of consecutive rows.
const months = computed(() => {
  const groups: { key: string; name: string; rows: ReturnType<typeof rowOf>[] }[] = []
  for (const post of posts) {
    if (post.kind !== 'news') continue
    const key = post.iso.slice(0, 7)
    if (groups.at(-1)?.key !== key) groups.push({ key, name: MONTH.format(new Date(post.iso)), rows: [] })
    groups.at(-1)!.rows.push(rowOf(post))
  }
  return groups
})

function rowOf(post: (typeof posts)[number]) {
  const faces = post.authors.slice(0, STACK).map((name) => {
    const person = personOf(name)
    return { name, initials: initialsOf(name), avatar: person && avatarOf(person, 22) }
  })
  return { ...post, faces, more: post.authors.length - faces.length }
}
</script>

<template>
  <div class="news-list">
    <p v-if="!months.length" class="news-empty">Nothing published yet.</p>
    <section v-for="month in months" :key="month.key" class="news-month">
      <h2 class="news-month-name">{{ month.name }}</h2>
      <ol class="news-rows">
        <li v-for="row in month.rows" :key="row.url" class="news-row">
          <time class="news-date" :datetime="row.iso">{{ row.short }}</time>
          <div class="news-body">
            <h3 class="news-title">
              <span v-if="row.tag" class="news-tag">{{ row.tag }}</span>
              <!-- The title is the row's one link, stretched over the whole row by ::after, so a
                   click anywhere on it opens the post and a screen reader hears one link. -->
              <a :href="row.url">{{ row.title }}</a>
            </h3>
            <p v-if="row.description" class="news-blurb">{{ row.description }}</p>
          </div>
          <span class="news-by" :title="row.authors.join(', ')">
            <span class="news-stack" aria-hidden="true">
              <span v-for="face in row.faces" :key="face.name" class="news-face">
                {{ face.initials }}
                <img v-if="face.avatar" :src="face.avatar" alt="" width="22" height="22" loading="lazy" decoding="async" />
              </span>
              <span v-if="row.more > 0" class="news-face news-face-more">+{{ row.more }}</span>
            </span>
            <span class="sr-only">{{ row.authors.join(', ') }}</span>
          </span>
        </li>
      </ol>
    </section>
  </div>
</template>

<style scoped>
.news-list {
  margin-top: 36px;
}

.news-empty {
  color: var(--vp-c-text-3);
}

.news-month + .news-month {
  margin-top: 40px;
}

/* The month is a quiet mono label over an ink rule, not a heading the size of the page's. */
.news-month-name {
  margin: 0;
  padding: 0 0 10px;
  border: 0;
  border-bottom: 2px solid var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--vp-c-text-1);
}

.news-rows {
  margin: 0;
  padding: 0;
  list-style: none;
}

.news-row {
  position: relative;
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) auto;
  align-items: baseline;
  gap: 4px 20px;
  margin: 0;
  padding: 16px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
  transition: background-color 0.2s, box-shadow 0.2s;
}

/* The hover is a soft wash and a red edge on the left: enough to say which row the pointer is
   on, without the rows jumping about the way the mosaic's tiles lift. */
.news-row:hover,
.news-row:focus-within {
  background: var(--vp-c-bg-soft);
  box-shadow: inset 3px 0 0 var(--hf-red);
}

.news-date {
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}

.news-title {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 16.5px;
  font-weight: 650;
  line-height: 1.45;
  letter-spacing: -0.012em;
}

.news-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s;
}

.news-title a::after {
  content: '';
  position: absolute;
  inset: 0;
}

.news-row:hover .news-title a,
.news-title a:focus-visible {
  color: var(--vp-c-brand-1);
}

.news-title a:focus-visible {
  outline: none;
}

.news-row:focus-within {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: -2px;
}

.news-tag {
  display: inline-block;
  margin-right: 10px;
  padding: 1px 7px;
  vertical-align: 2px;
  background: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.6;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--vp-c-bg);
}

.news-blurb {
  margin: 4px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-by {
  align-self: center;
}

/* The stack, as on the mosaic: each face overlaps the one before, ringed in the row's colour. */
.news-stack {
  display: flex;
}

.news-face {
  position: relative;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  overflow: hidden;
  margin-left: -6px;
  box-shadow: 0 0 0 2px var(--vp-c-bg);
  background: var(--vp-c-brand-soft);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  transition: box-shadow 0.2s;
}

.news-face:first-child {
  margin-left: 0;
}

.news-row:hover .news-face,
.news-row:focus-within .news-face {
  box-shadow: 0 0 0 2px var(--vp-c-bg-soft);
}

.news-face img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-face-more {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---- Narrower -----------------------------------------------------------------------------
   The date goes above the title and the faces under the blurb: one column, nothing squeezed. */

@media (max-width: 640px) {
  .news-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
    padding: 14px 4px;
  }

  .news-blurb {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .news-by {
    margin-top: 4px;
  }
}
</style>
