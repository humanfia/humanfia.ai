// The blog's feed, checked against the site that was just built.
//
// Two things about the feed fail silently, and both of them have. The file is written by
// `buildEnd`, so nothing else in the build looks at it: a feed with a dead link in it, or with
// an element no reader accepts, builds green. And VitePress's router answers a click on any
// same-origin link whose extension it does not recognise in-app, as a page -- its list has
// `xml` on it and not `rss`, so every link to the feed on this site was answered with a 404
// while the file itself was served correctly to anyone who typed the URL. `.env` fixes that by
// adding `rss` to the list; this is what notices if it ever stops taking effect.
//
//   pnpm build && pnpm check:feed

import { readdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const DIST = new URL('./dist/', import.meta.url).pathname
const FEED = join(DIST, 'blog/feed.rss')
const HOSTNAME = 'https://humanfia.ai'

const problems = []
const fail = (said) => problems.push(said)

/* ------------------------------------------------------------------ the feed itself */

if (!existsSync(FEED)) {
  console.error('blog/feed.rss was not written -- see buildEnd in .vitepress/config.mts')
  process.exit(1)
}

const feed = await readFile(FEED, 'utf8')

if (!/^<\?xml version="1\.0" encoding="UTF-8"\?>\n<rss\b/.test(feed)) fail('feed: not an RSS document')
if (!feed.trimEnd().endsWith('</rss>')) fail('feed: no closing </rss>')

// Every `&` has to open an entity or the document is not well-formed, and a title with an
// ampersand in it is the way that happens.
for (const [stray] of feed.matchAll(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)[^\s]{0,12}/g)) {
  fail(`feed: unescaped ampersand near \`${stray}\``)
}

// `<author>` is defined as an email address and nothing else, so a name in it is an error every
// validator reports. Names go in `dc:creator`, which has to be declared to be used.
if (/<author>/.test(feed)) fail('feed: <author> must be an email address -- use <dc:creator>')
if (/<dc:creator>/.test(feed) && !/xmlns:dc="http:\/\/purl\.org\/dc\/elements\/1\.1\/"/.test(feed)) {
  fail('feed: <dc:creator> used without the dc namespace declared on <rss>')
}
if (!/<atom:link[^>]+rel="self"/.test(feed)) fail('feed: no rel="self" link')

const items = [...feed.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1])
if (!items.length) fail('feed: no items')

for (const item of items) {
  const title = /<title>([\s\S]*?)<\/title>/.exec(item)?.[1] ?? '(untitled)'
  const link = /<link>([\s\S]*?)<\/link>/.exec(item)?.[1]
  if (!link) { fail(`feed: "${title}" has no <link>`); continue }
  if (!/<pubDate>/.test(item)) fail(`feed: "${title}" has no <pubDate>`)
  if (!link.startsWith(`${HOSTNAME}/`)) { fail(`feed: "${title}" links off-site -- ${link}`); continue }
  // cleanUrls, so /blog/a-post is built as blog/a-post.html.
  const page = join(DIST, link.slice(HOSTNAME.length + 1) + '.html')
  if (!existsSync(page)) fail(`feed: "${title}" points at ${link}, which the build did not write`)
}

// One item per dated post, so a post that stops appearing in the feed is not a quiet change.
const dated = (await readdir(new URL('../blog/', import.meta.url).pathname))
  .filter((name) => name.endsWith('.md') && name !== 'index.md').length
if (items.length !== dated) fail(`feed: ${items.length} items for ${dated} posts`)

/* ------------------------------- the router, and whether it will let the links through */

const chunks = []
for (const dir of ['assets', 'assets/chunks']) {
  const at = join(DIST, dir)
  if (!existsSync(at)) continue
  for (const name of await readdir(at)) if (name.endsWith('.js')) chunks.push(join(at, name))
}

// The list VitePress refuses to route to, as it was built into the client.
const LIST = '3g2,3gp,aac'
let checked = false
for (const path of chunks) {
  const js = await readFile(path, 'utf8')
  const at = js.indexOf(LIST)
  if (at < 0) continue
  checked = true
  const list = js.slice(at, js.indexOf('"', at))
  const before = js.slice(Math.max(0, at - 400), at)
  if (!/(^|,)rss(,|$)/.test(list) && !/["']rss["']/.test(before)) {
    fail(
      'router: the client was built without `rss` among the extensions it will not route to, ' +
        'so every link to the feed lands on the 404 page -- check VITE_EXTRA_EXTENSIONS in .env',
    )
  }
  break
}
if (!checked) fail('router: could not find the extension list in the built client -- check this script against the VitePress version')

/* ------------------------------------ every link to the feed, in the pages that ship */

const pages = []
const walk = async (at) => {
  for (const entry of await readdir(at, { withFileTypes: true })) {
    if (entry.isDirectory()) await walk(join(at, entry.name))
    else if (entry.name.endsWith('.html')) pages.push(join(at, entry.name))
  }
}
await walk(DIST)

let links = 0
for (const page of pages) {
  const html = await readFile(page, 'utf8')
  for (const [, href] of html.matchAll(/(?:href|content)="([^"]*\.rss)"/g)) {
    links += 1
    const path = href.startsWith(HOSTNAME) ? href.slice(HOSTNAME.length) : href
    if (!path.startsWith('/')) { fail(`${page}: relative feed link ${href}`); continue }
    if (!existsSync(join(DIST, path))) fail(`${page}: links to ${href}, which does not exist`)
  }
}
if (!links) fail('no page links to the feed at all')

if (problems.length) {
  for (const said of problems) console.error(said)
  console.error(`\n${problems.length} problem(s) with the feed.`)
  process.exit(1)
}
console.log(`the feed is ${items.length} items, every link resolves, and the router will let ${links} link(s) to it through`)
