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
  description: 'Agent flows that finish the work — the runtime, the flows, the benchmark, and what we point them at.',
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
    ['meta', { name: 'theme-color', content: '#3157d8' }],
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
        description: 'Agent flows that finish the work.',
        sameAs: [
          'https://github.com/humanfia',
          'https://github.com/humanfia/humanize2',
          'https://github.com/PolyArch/humanize',
        ],
      }),
    ],
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Humanfia',

    nav: [
      { text: 'Stack', link: '/stack/', activeMatch: '/stack/' },
      {
        text: 'Projects',
        activeMatch: '/projects/|/applications/',
        items: [
          {
            text: 'Platform',
            items: [
              { text: 'humanize — the runtime', link: '/projects/humanize' },
              { text: 'flowverse — the flows', link: '/projects/flowverse' },
              { text: 'flowbench — the benchmark', link: '/projects/flowbench' },
              { text: 'oh-my-humanize', link: '/projects/oh-my-humanize' },
            ],
          },
          {
            text: 'Applications',
            items: [
              { text: 'KDA — Kernel Design Agents', link: '/applications/kda' },
              { text: 'HOA — Humanize Olympic Agents', link: '/applications/hoa' },
            ],
          },
        ],
      },
      { text: 'Flows', link: '/flows/', activeMatch: '/flows/' },
      { text: 'Results', link: '/results/', activeMatch: '/results/' },
      { text: 'Blog', link: '/blog/', activeMatch: '/blog/' },
      { text: 'About', link: '/about/', activeMatch: '/about/' },
    ],

    sidebar: {
      '/stack/': [
        {
          text: 'The stack',
          items: [
            { text: 'How it fits together', link: '/stack/' },
            { text: 'The loop', link: '/stack/loop' },
          ],
        },
        {
          text: 'Go deeper',
          items: [
            { text: 'Projects', link: '/projects/' },
            { text: 'Flows', link: '/flows/' },
            { text: 'Results', link: '/results/' },
          ],
        },
      ],

      '/projects/': [
        {
          text: 'Projects',
          items: [{ text: 'All of them', link: '/projects/' }],
        },
        {
          text: 'Platform',
          items: [
            { text: 'humanize — the runtime', link: '/projects/humanize' },
            { text: 'flowverse — the flows', link: '/projects/flowverse' },
            { text: 'flowbench — the benchmark', link: '/projects/flowbench' },
            { text: 'oh-my-humanize', link: '/projects/oh-my-humanize' },
          ],
        },
        {
          text: 'Applications',
          items: [
            { text: 'KDA — Kernel Design Agents', link: '/applications/kda' },
            { text: 'HOA — Humanize Olympic Agents', link: '/applications/hoa' },
          ],
        },
      ],

      '/applications/': [
        {
          text: 'Applications',
          items: [
            { text: 'Where the flows are pointed', link: '/applications/' },
            { text: 'KDA — Kernel Design Agents', link: '/applications/kda' },
            { text: 'HOA — Humanize Olympic Agents', link: '/applications/hoa' },
          ],
        },
        {
          text: 'Platform',
          items: [
            { text: 'humanize — the runtime', link: '/projects/humanize' },
            { text: 'flowverse — the flows', link: '/projects/flowverse' },
            { text: 'flowbench — the benchmark', link: '/projects/flowbench' },
          ],
        },
      ],

      '/flows/': [
        {
          text: 'Flows',
          items: [{ text: 'What a flow is', link: '/flows/' }],
        },
        {
          text: 'Ours',
          collapsed: false,
          items: [
            { text: 'RLAR', link: '/flows/rlar' },
            { text: 'Flame Chase Loop', link: '/flows/flame-chase' },
            { text: 'Humanize 1', link: '/flows/humanize1' },
          ],
        },
        {
          text: 'The common ones',
          collapsed: false,
          items: [
            { text: 'Ralph Loop, Goal and the rest', link: '/flows/#the-common-ones' },
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
