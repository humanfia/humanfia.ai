import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createContentLoader, defineConfig, type ContentData, type SiteConfig } from 'vitepress'

import { loadFlowverse, slugOf } from './flowverse.mts'
import { FLOWS, KINDS } from './theme/flows'

// humanfia.ai, served from the repository root: the CNAME in public/ is the custom domain,
// so no base is prepended and every internal link is written from `/`. The documentation for
// Humanize itself is a site of its own, built the same way from humanfia/humanize -- so
// everything here links out to it rather than restating it.
const HOSTNAME = 'https://humanfia.ai'

/** The projects, in the order they are worth reading: the runtime, the referee, the three
 *  applications. Names only -- a list is a list of places, and the sentence explaining each
 *  one is already the first thing on the page it goes to.
 *
 *  Humanize is labelled the way its own README names it. Humanize 1, the Claude Code plugin
 *  it grew out of, is not a project here: it lives on as the humanize1 flow, under Flows, and
 *  /projects/rlcr-loop redirects there.
 *
 *  One list, used twice: it is the nav's dropdown and it is the projects sidebar. There is no
 *  longer a page above them for it to be a table of contents for. */
const PROJECT_LINKS = [
  { text: 'Humanize', link: '/projects/humanize' },
  { text: 'FlowBench', link: '/projects/flowbench' },
  { text: 'HOA', link: '/projects/hoa' },
  { text: 'KDA', link: '/projects/kda' },
  { text: 'HKA', link: '/projects/hka' },
]

const PROJECTS = [
  {
    // A heading, not an entry. It used to say the overview was reached from the nav; there is
    // no overview now, so it is only ever a label over the five.
    text: 'Projects',
    items: PROJECT_LINKS,
  },
]

/**
 * The flows, as a menu: the catalogue first, then every flow under how its agents work together
 * -- the same grouping as the catalogue page, from the same list (`theme/flows.ts`) -- and last
 * whatever the flowverse releases that nobody here has written up yet, which is read at build
 * time (`flowverse.mts`) so a release is in the menu the next time the site is built.
 *
 * One list, used twice, as the projects' is: it is the nav's dropdown and the /flows/ sidebar.
 */
const flowverse = await loadFlowverse()
const written = new Set(FLOWS.map((one) => one.module).filter(Boolean))
const FLOW_GROUPS = [
  ...KINDS.map((kind) => ({
    text: kind.said,
    items: FLOWS.filter((one) => one.kind === kind.id).map((one) => ({ text: one.name, link: one.link })),
  })).filter((group) => group.items.length),
  ...(flowverse.modules.some((one) => !written.has(one.name))
    ? [
        {
          text: 'Also in the flowverse',
          items: flowverse.modules
            .filter((one) => !written.has(one.name))
            .map((one) => ({ text: one.name, link: `/flows/${slugOf(one.name)}` })),
        },
      ]
    : []),
]
const FLOW_LINKS = [{ text: 'Every flow', items: [{ text: 'The catalogue', link: '/flows/' }] }, ...FLOW_GROUPS]

/**
 * The two sections a post can be in, and what each one is called where it is named.
 *
 * News is the record -- one result per post, a number, its caveats and a date. The blog is what
 * we think -- essays, design arguments, the write-ups that are about a way of working rather
 * than a score. Each has its own directory, its own index, its own sidebar and its own feed, so
 * a reader who wants only the numbers subscribes to only the numbers.
 */
const SECTIONS = {
  blog: { name: 'Blog', feed: 'Humanfia blog', about: 'Essays and arguments from the people building Humanfia.' },
  news: { name: 'News', feed: 'Humanfia news', about: 'What the flows did, one result per post.' },
} as const
type Section = keyof typeof SECTIONS

/**
 * A section's sidebar, read off its directory at config time so publishing a post is still
 * writing one file. Ten most recent, newest first; the rest are one click away on the index.
 *
 * Deliberately its own list rather than the site-wide one: a reader inside a post is reading
 * that section, and a sidebar that also offers them every project page is a table of contents
 * for a book they did not open.
 */
function sectionSidebar(section: Section) {
  const dir = fileURLToPath(new URL(`../${section}`, import.meta.url))
  const posts = readdirSync(dir)
    .filter((name) => name.endsWith('.md') && name !== 'index.md')
    .map((name) => {
      const front = readFileSync(resolve(dir, name), 'utf8').split('---')[1] ?? ''
      const title = /^title:\s*(.+)$/m.exec(front)?.[1]?.trim().replace(/^["']|["']$/g, '')
      const date = /^date:\s*(.+)$/m.exec(front)?.[1]?.trim() ?? ''
      return { text: title ?? name, link: `/${section}/${name.slice(0, -3)}`, date }
    })
    // Newest first, and the filename breaks a tie so two posts dated the same day do not
    // swap places between builds.
    .sort((a, b) => b.date.localeCompare(a.date) || b.link.localeCompare(a.link))

  return [
    {
      // A heading, not an entry, for the same reason as Projects above.
      text: SECTIONS[section].name,
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

  // The feeds are written by `buildEnd` below, after the link check has run, so the check has
  // no way of knowing they are about to exist. Every other dead link is still a failed build.
  ignoreDeadLinks: [/^\/(?:blog|news)\/feed\.rss$/],

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
    // One alternate per feed, so a reader pointed at any page here is offered both.
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: SECTIONS.blog.feed, href: `${HOSTNAME}/blog/feed.rss` }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: SECTIONS.news.feed, href: `${HOSTNAME}/news/feed.rss` }],
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
          'https://github.com/humanfia/humanize',
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

    // Projects is a menu, and so is Flows, beside it: the flows run on Humanize, and the menu
    // groups them as the catalogue at /flows/ does. The rest are plain links. There is no
    // projects index any more: a page whose whole job was to list six links, when a menu lists the same six
    // without costing a page load, and every one of those pages opens with the sentence the
    // index was paraphrasing. The way in is now the project itself.
    //
    // Documentation is still not in here. It lives with the project it documents, and the way
    // to it is that project's page -- a Docs menu was a second table of contents for a site
    // this one does not own, and it went stale the moment that site moved a page.
    nav: [
      { text: 'Projects', items: PROJECT_LINKS, activeMatch: '/projects/' },
      { text: 'Flows', items: FLOW_LINKS, activeMatch: '/flows/' },
      { text: 'Blog', link: '/blog/', activeMatch: '/blog/' },
      { text: 'News', link: '/news/', activeMatch: '/news/' },
      { text: 'About', link: '/about/', activeMatch: '/about/' },
    ],

    // One sidebar per section, and a section only ever sees its own. About is a single page and
    // gets none at all: a list of one is furniture, not navigation.
    sidebar: {
      '/projects/': PROJECTS,
      '/flows/': [{ text: 'Flows', link: '/flows/' }, ...FLOW_GROUPS.map((group) => ({ ...group, collapsed: false }))],
      '/blog/': sectionSidebar('blog'),
      '/news/': sectionSidebar('news'),
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
        'Built in public. <a href="https://github.com/humanfia">github.com/humanfia</a> · RSS: <a href="/blog/feed.rss">blog</a> · <a href="/news/feed.rss">news</a>',
      copyright: 'Copyright © 2026 Humanfia',
    },
  },

  // One RSS feed per section, written straight into the built site. Hand-rolled rather than
  // pulled from a package: a feed is a dozen lines of XML, and this way the build has one
  // dependency rather than two.
  async buildEnd(config: SiteConfig) {
    for (const section of Object.keys(SECTIONS) as Section[]) {
      const posts = await createContentLoader(`${section}/*.md`, { excerpt: false }).load()
      writeFileSync(resolve(config.outDir, `${section}/feed.rss`), feedOf(section, posts))
    }
  },
})

function feedOf(section: Section, posts: ContentData[]) {
  const items = posts
    .filter((page) => page.url !== `/${section}/` && page.frontmatter.date)
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
  // section changed.
  const latest = posts.reduce(
    (newest, page) => Math.max(newest, +new Date(page.frontmatter.date ?? 0) || 0),
    0,
  )

  const { feed, about } = SECTIONS[section]
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    '  <channel>',
    `    <title>${escapeXml(feed)}</title>`,
    `    <link>${HOSTNAME}/${section}/</link>`,
    `    <description>${escapeXml(about)}</description>`,
    '    <language>en-us</language>',
    ...(latest ? [`    <lastBuildDate>${new Date(latest).toUTCString()}</lastBuildDate>`] : []),
    `    <atom:link href="${HOSTNAME}/${section}/feed.rss" rel="self" type="application/rss+xml"/>`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
