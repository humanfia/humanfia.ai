import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createContentLoader, defineConfig, type SiteConfig } from 'vitepress'

// humanfia.ai, served from the repository root: the CNAME in public/ is the custom domain,
// so no base is prepended and every internal link is written from `/`. The documentation for
// humanize itself is a site of its own at hmz.humanfia.ai, built the same way from
// humanfia/humanize2 -- so everything here links out to it rather than restating it.
const HOSTNAME = 'https://humanfia.ai'

export default defineConfig({
  title: 'Humanfia',
  titleTemplate: ':title · Humanfia',
  description:
    'Humanfia is a research team working on long-horizon agent systems: the runtime, the flows and the benchmark, pointed at work where being right is checkable.',
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
        description: 'A research team working on long-horizon agent systems.',
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

    nav: [
      { text: 'Results', link: '/results/', activeMatch: '/results/' },
      {
        text: 'Applications',
        activeMatch: '/applications/',
        items: [
          { text: 'HOA — Humanize Olympic Agents', link: '/applications/hoa' },
          { text: 'KDA — Kernel Design Agents', link: '/applications/kda' },
          { text: 'AgentKaggle', link: '/applications/agentkaggle' },
        ],
      },
      {
        text: 'Projects',
        activeMatch: '/projects/',
        items: [
          { text: 'FlowBench — the referee', link: '/projects/flowbench' },
          { text: 'oh-my-humanize', link: '/projects/oh-my-humanize' },
          // Humanize 2 is documented on its own site and nowhere else. This is a way out of
          // here, not an entry in a list of pages we maintain.
          { text: 'Humanize 2 ↗', link: 'https://hmz.humanfia.ai/' },
        ],
      },
      { text: 'Blog', link: '/blog/', activeMatch: '/blog/' },
      { text: 'About', link: '/about/', activeMatch: '/about/' },
    ],

    sidebar: {
      '/projects/': [
        {
          text: 'Projects',
          items: [
            { text: 'All of them', link: '/projects/' },
            { text: 'FlowBench — the referee', link: '/projects/flowbench' },
            { text: 'oh-my-humanize', link: '/projects/oh-my-humanize' },
          ],
        },
        {
          text: 'Applications',
          items: [
            { text: 'HOA — Humanize Olympic Agents', link: '/applications/hoa' },
            { text: 'KDA — Kernel Design Agents', link: '/applications/kda' },
            { text: 'AgentKaggle', link: '/applications/agentkaggle' },
          ],
        },
      ],

      '/applications/': [
        {
          text: 'Applications',
          items: [
            { text: 'Where the flows are pointed', link: '/applications/' },
            { text: 'HOA — Humanize Olympic Agents', link: '/applications/hoa' },
            { text: 'KDA — Kernel Design Agents', link: '/applications/kda' },
            { text: 'AgentKaggle', link: '/applications/agentkaggle' },
          ],
        },
        {
          text: 'Projects',
          items: [
            { text: 'FlowBench — the referee', link: '/projects/flowbench' },
            { text: 'oh-my-humanize', link: '/projects/oh-my-humanize' },
          ],
        },
      ],

      '/results/': [
        {
          text: 'Results',
          items: [
            { text: 'What we have shipped', link: '/results/' },
            { text: 'How to check it yourself', link: '/results/#check-it-yourself' },
          ],
        },
      ],

      '/about/': [
        {
          text: 'About',
          items: [
            { text: 'Who we are', link: '/about/' },
            { text: 'How we work', link: '/about/#how-we-work' },
            { text: 'Get in touch', link: '/about/#get-in-touch' },
          ],
        },
      ],
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
        return [
          '    <item>',
          `      <title>${escapeXml(page.frontmatter.title ?? page.url)}</title>`,
          `      <link>${link}</link>`,
          `      <guid isPermaLink="true">${link}</guid>`,
          `      <pubDate>${new Date(page.frontmatter.date).toUTCString()}</pubDate>`,
          `      <description>${escapeXml(page.frontmatter.description ?? '')}</description>`,
          '    </item>',
        ].join('\n')
      })

    const feed = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
      '  <channel>',
      '    <title>Humanfia</title>',
      `    <link>${HOSTNAME}/blog/</link>`,
      '    <description>Notes from building agent flows that finish the work.</description>',
      '    <language>en-us</language>',
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
