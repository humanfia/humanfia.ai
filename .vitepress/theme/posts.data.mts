import { createContentLoader } from 'vitepress'
import { authorsOf } from './people'

// Every post, from both sections, newest first, read at build time.
//
// There are two kinds of post and they live in two directories. `news/` is the record: one
// result per post, a number with its caveats and a date on it. `blog/` is what we think: the
// essays, the design arguments, the write-ups that are about a way of working rather than a
// score. Both indexes, the home page and the RSS feeds in config.mts read the same two globs,
// so adding a post is still adding a file -- and which directory it is in is the whole of
// deciding what kind it is.
export type Kind = 'blog' | 'news'

export interface Post {
  kind: Kind
  title: string
  url: string
  date: string
  short: string
  iso: string
  description: string
  authors: string[]
  tag: string
  /** Minutes to read, at 230 words a minute, never under one. */
  minutes: number
}

declare const data: Post[]
export { data }

const FORMAT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

/** For the reel's rail, where the year is already obvious from the one above it. */
const SHORT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

/** Words a reader will actually read: the body, without frontmatter, markup or code. */
function wordsIn(src = '') {
  const body = src
    .replace(/^---[\s\S]*?---/, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\]\([^)]*\)/g, ']')
  return body.split(/\s+/).filter((word) => /[A-Za-z0-9]/.test(word)).length
}

export default createContentLoader(['blog/*.md', 'news/*.md'], {
  excerpt: false,
  // The source is read for the reading time and then dropped: the transform returns only the
  // fields below, so none of it reaches the page's payload.
  includeSrc: true,
  transform(raw): Post[] {
    return raw
      .filter((page) => page.frontmatter.date && !page.url.endsWith('/'))
      .map((page) => {
        const date = new Date(page.frontmatter.date)
        return {
          kind: (page.url.startsWith('/news/') ? 'news' : 'blog') as Kind,
          title: page.frontmatter.title ?? page.url,
          url: page.url,
          date: FORMAT.format(date),
          short: SHORT.format(date),
          iso: date.toISOString(),
          description: page.frontmatter.description ?? '',
          authors: authorsOf(page.frontmatter),
          tag: page.frontmatter.tag ?? '',
          minutes: Math.max(1, Math.round(wordsIn(page.src) / 230)),
        }
      })
      // Newest first. Two posts on one day are ordered by url, so the list is the same on
      // every machine that builds it rather than however the glob happened to come back.
      .sort((a, b) => b.iso.localeCompare(a.iso) || b.url.localeCompare(a.url))
  },
})
