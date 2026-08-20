import { createContentLoader } from 'vitepress'

// Every post under blog/, newest first, read at build time. The index page renders this, the
// news reel on the home page reads the first few of it, and the RSS feed in config.mts loads
// the same glob for itself -- so adding a post is adding a file.
export interface Post {
  title: string
  url: string
  date: string
  short: string
  iso: string
  description: string
  authors: string[]
  tag: string
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

/** `authors` is the list; `author` is what the first three posts were written with. */
const authorsOf = (front: Record<string, unknown>): string[] => {
  if (Array.isArray(front.authors)) return front.authors as string[]
  if (typeof front.author === 'string') return [front.author]
  return ['Humanfia']
}

export default createContentLoader('blog/*.md', {
  excerpt: false,
  transform(raw): Post[] {
    return raw
      .filter((page) => page.url !== '/blog/' && page.frontmatter.date)
      .map((page) => {
        const date = new Date(page.frontmatter.date)
        return {
          title: page.frontmatter.title ?? page.url,
          url: page.url,
          date: FORMAT.format(date),
          short: SHORT.format(date),
          iso: date.toISOString(),
          description: page.frontmatter.description ?? '',
          authors: authorsOf(page.frontmatter),
          tag: page.frontmatter.tag ?? '',
        }
      })
      // Newest first. Two posts on one day are ordered by url, so the list is the same on
      // every machine that builds it rather than however the glob happened to come back.
      .sort((a, b) => b.iso.localeCompare(a.iso) || b.url.localeCompare(a.url))
  },
})
