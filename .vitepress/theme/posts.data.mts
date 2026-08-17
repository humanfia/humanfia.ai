import { createContentLoader } from 'vitepress'

// Every post under blog/, newest first, read at build time. The index page renders this; the
// RSS feed in config.mts loads the same glob for itself, so adding a post is adding a file.
export interface Post {
  title: string
  url: string
  date: string
  iso: string
  description: string
  author: string
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
          iso: date.toISOString(),
          description: page.frontmatter.description ?? '',
          author: page.frontmatter.author ?? 'Humanfia',
          tag: page.frontmatter.tag ?? '',
        }
      })
      .sort((a, b) => b.iso.localeCompare(a.iso))
  },
})
