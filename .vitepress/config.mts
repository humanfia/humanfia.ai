import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createContentLoader, defineConfig, type SiteConfig } from 'vitepress'

// humanfia.ai, served from the repository root: the CNAME in public/ is the custom domain,
// so no base is prepended and every internal link is written from `/`. The documentation for
// Humanize itself is a site of its own, built the same way from humanfia/humanize2 -- so
// everything here links out to it rather than restating it.
const HOSTNAME = 'https://humanfia.ai'

/** The projects, in the order they are worth reading: the runtime, the loop it grew out of,
 *  the referee, the three applications. Names only -- a sidebar is a list of places, and the
 *  sentence explaining each one is already the first thing on the page it goes to. */
const PROJECTS = [
  {
    // A heading, not an entry: the overview is reached from the nav, and a group title that
    // is also a link reads as a page sitting above the pages.
    text: 'Projects',
    items: [
      { text: 'Humanize', link: '/projects/humanize' },
      { text: 'RLCR Loop', link: '/projects/rlcr-loop' },
      { text: 'FlowBench', link: '/projects/flowbench' },
      { text: 'HOA', link: '/projects/hoa' },
      { text: 'KDA', link: '/projects/kda' },
      { text: 'AgentKaggle', link: '/projects/agentkaggle' },
    ],
  },
]

/**
 * The blog's sidebar, read off the directory at config time so publishing a post is still
 * writing one file. Ten most recent, newest first; the rest are one click away on the index.
 *
 * Deliberately its own list rather than the site-wide one: a reader inside a post is reading
 * the blog, and a sidebar that also offers them every project page is a table of contents for
 * a book they did not open.
 */
function blogSidebar() {
  const dir = fileURLToPath(new URL('../blog', import.meta.url))
  const posts = readdirSync(dir)
    .filter((name) => name.endsWith('.md') && name !== 'index.md')
    .map((name) => {
      const front = readFileSync(resolve(dir, name), 'utf8').split('---')[1] ?? ''
      const title = /^title:\s*(.+)$/m.exec(front)?.[1]?.trim().replace(/^["']|["']$/g, '')
      const date = /^date:\s*(.+)$/m.exec(front)?.[1]?.trim() ?? ''
      return { text: title ?? name, link: `/blog/${name.slice(0, -3)}`, date }
    })
    // Newest first, and the filename breaks a tie so two posts dated the same day do not
    // swap places between builds.
    .sort((a, b) => b.date.localeCompare(a.date) || b.link.localeCompare(a.link))

  return [
    {
      // A heading, not an entry, for the same reason as Projects above.
      text: 'Blog',
      items: posts.slice(0, 10),
    },
  ]
}

export default defineConfig({
  title: 'Humanfia',
  titleTemplate: ':title · Humanfia',
  description:
    'Humanfia builds the flow around the agent: the runtime, the flows and the benchmark, pointed at work where being right is checkable.',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: ['README.md'],

  sitemap: { hostname: HOSTNAME },

  // The feed is written by `buildEnd` below, after the link check has run, so the check has
  // no way of knowing it is about to exist. Every other dead link is still a failed build.
  ignoreDeadLinks: [/^\/blog\/feed\.rss$/],

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    // A home screen cannot use the SVG: it wants a raster of a known size and composites it
    // onto its own background, so these are drawn on slate by scripts/icons.py.
    ['link', { rel: 'apple-touch-icon', href: '/icon-180.png', sizes: '180x180' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    // The mark's own slate, not the accent: this tints the browser chrome around the page, and
    // a saturated blue bar over a white page reads as a different site's.
    ['meta', { name: 'theme-color', content: '#1e293b' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Humanfia' }],
    ['meta', { property: 'og:image', content: `${HOSTNAME}/og.png` }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: 'Humanfia blog', href: `${HOSTNAME}/blog/feed.rss` }],
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Humanfia',
        url: `${HOSTNAME}/`,
        description: 'We build the flow around the agent.',
        sameAs: [
          'https://github.com/humanfia',
          'https://github.com/humanfia/humanize2',
          'https://github.com/PolyArch/humanize',
        ],
      }),
    ],
  ],

  themeConfig: {
    // Two files rather than one with currentColor: the nav logo is an <img>, so the SVG cannot
    // inherit the page's colour. The dark one is a matte, slightly blue white; the light one is
    // the same slate the mark was drawn in.
    logo: { light: '/logo.svg', dark: '/logo-dark.svg', alt: 'Humanfia' },
    siteTitle: 'Humanfia',

    // Four plain links, no dropdown. Documentation lives with the project it documents, and
    // the way to it is that project's page -- a Docs menu here was a second table of contents
    // for a site this one does not own, and it went stale the moment that site moved a page.
    nav: [
      { text: 'Projects', link: '/projects/', activeMatch: '/projects/' },
      { text: 'Blog', link: '/blog/', activeMatch: '/blog/' },
      { text: 'Team', link: '/team/', activeMatch: '/team/' },
      { text: 'About', link: '/about/', activeMatch: '/about/' },
    ],

    // One sidebar per section, and a section only ever sees its own. Team and About are single
    // pages and get none at all: a list of one is furniture, not navigation.
    sidebar: {
      '/projects/': PROJECTS,
      '/blog/': blogSidebar(),
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/humanfia' }],

    editLink: {
      pattern: 'https://github.com/humanfia/humanfia.ai/edit/main/:path',
      text: 'Suggest an edit to this page',
    },

    search: { provider: 'local' },

    outline: { level: [2, 3] },

    footer: {
      message:
        'Built in public. <a href="https://github.com/humanfia">github.com/humanfia</a> · <a href="/blog/feed.rss">RSS</a>',
      copyright: 'Copyright © 2026 Humanfia',
    },
  },

  // The blog's RSS feed, written straight into the built site. Hand-rolled rather than
  // pulled from a package: a feed is a dozen lines of XML, and this way the build has one
  // dependency rather than two.
  async buildEnd(config: SiteConfig) {
    const posts = await createContentLoader('blog/*.md', { excerpt: false }).load()

    const items = posts
      .filter((page) => page.url !== '/blog/' && page.frontmatter.date)
      .sort((a, b) => +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date))
      .map((page) => {
        const link = `${HOSTNAME}${page.url}`
        const authors: string[] = page.frontmatter.authors ??
          (page.frontmatter.author ? [page.frontmatter.author] : [])
        return [
          '    <item>',
          `      <title>${escapeXml(page.frontmatter.title ?? page.url)}</title>`,
          `      <link>${link}</link>`,
          `      <guid isPermaLink="true">${link}</guid>`,
          `      <pubDate>${new Date(page.frontmatter.date).toUTCString()}</pubDate>`,
          // `dc:creator`, not RSS's own `<author>`: that element is defined as an email address
          // and nothing else, so a name in it is an error every feed validator reports and some
          // readers drop the whole item over. We publish names and no addresses.
          ...(authors.length ? [`      <dc:creator>${escapeXml(authors.join(', '))}</dc:creator>`] : []),
          `      <description>${escapeXml(page.frontmatter.description ?? '')}</description>`,
          '    </item>',
        ].join('\n')
      })

    // The newest post's date rather than the clock: two builds of the same commit should
    // produce the same bytes, and a reader polling us should see a changed feed only when the
    // blog changed.
    const latest = posts.reduce(
      (newest, page) => Math.max(newest, +new Date(page.frontmatter.date ?? 0) || 0),
      0,
    )

    const feed = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
      '  <channel>',
      '    <title>Humanfia</title>',
      `    <link>${HOSTNAME}/blog/</link>`,
      '    <description>What the flows did, one result per post.</description>',
      '    <language>en-us</language>',
      ...(latest ? [`    <lastBuildDate>${new Date(latest).toUTCString()}</lastBuildDate>`] : []),
      `    <atom:link href="${HOSTNAME}/blog/feed.rss" rel="self" type="application/rss+xml"/>`,
      ...items,
      '  </channel>',
      '</rss>',
      '',
    ].join('\n')

    writeFileSync(resolve(config.outDir, 'blog/feed.rss'), feed)
  },
})

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
