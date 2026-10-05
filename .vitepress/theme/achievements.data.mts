import { createContentLoader } from 'vitepress'

// The home page's achievements, read off the news at build time. A news post that has an
// `achievement:` block in its frontmatter puts one tile on the home page; posts that name the
// same `topic` are one achievement told over time, so only the newest of them is shown. A topic
// is whatever the post says it is -- a benchmark, a contest, a codebase -- not a project page.
export type Viz = 'checks' | 'versus' | 'bars' | 'ring' | 'grid' | 'dots'

export interface Achievement {
  /** Free-form, and the dedupe key: compared trimmed and case-insensitively. */
  topic: string
  /** The number on the tile; it counts up from `from` (default 0) with `decimals` places. */
  value: number
  from?: number
  decimals?: number
  prefix?: string
  suffix?: string
  /** The whole that `value` is out of, for the ring, grid and dots. */
  of?: number
  label: string
  body?: string
  viz?: Viz
  /** The bars and versus pictures: the entries compared, `us` marking ours. */
  board?: { name: string; score: number; us?: boolean }[]
  url: string
  iso: string
}

declare const data: Achievement[]
export { data }

const VIZ: Viz[] = ['checks', 'versus', 'bars', 'ring', 'grid', 'dots']

export default createContentLoader('news/*.md', {
  transform(raw): Achievement[] {
    const newest = new Map<string, Achievement>()
    for (const page of raw) {
      const a = page.frontmatter.achievement
      if (!a || !page.frontmatter.date) continue
      // A malformed block fails the build here, rather than drawing an empty tile.
      const needs = a.viz === 'ring' || a.viz === 'dots' ? a.of : a.viz === 'versus' || a.viz === 'bars' ? a.board?.length : true
      if (!a.topic || typeof a.value !== 'number' || !a.label || (a.viz && !VIZ.includes(a.viz)) || !needs)
        throw new Error(
          `${page.url}: achievement needs a topic, a numeric value, a label, a known viz, ` +
            'and `of` for a ring or dots, or a `board` for versus or bars',
        )
      const topic = String(a.topic).trim()
      const item: Achievement = { ...a, topic, url: page.url, iso: new Date(page.frontmatter.date).toISOString() }
      const key = topic.toLowerCase()
      const held = newest.get(key)
      if (!held || newer(item, held)) newest.set(key, item)
    }
    return [...newest.values()].sort((a, b) => (newer(a, b) ? -1 : 1))
  },
})

/** Newest first; one day's posts by url, so every machine builds the same page. */
function newer(a: Achievement, b: Achievement) {
  return (b.iso.localeCompare(a.iso) || b.url.localeCompare(a.url)) < 0
}
