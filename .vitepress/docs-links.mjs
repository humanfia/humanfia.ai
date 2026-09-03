// Every link this site makes to Humanize's documentation, fetched against the documentation.
//
// The documentation is a site of its own, built from humanfia/humanize2, and it moves pages
// without this repository hearing about it. When it does, it leaves a stub behind: a page whose
// only content is a `<meta http-equiv="refresh">` to wherever the page went. So a link written
// against last quarter's layout answers 200, sends the reader through a blank page, and is
// invisible to every other check here -- `pnpm build` only looks at internal links, and the
// browser only shows a flicker. That is how this site came to have ten links to a `guide/`
// directory that no longer exists.
//
// This resolves each one and fails on three things: a page that is gone, a page that moved and
// is being reached through its stub, and a redirect the URL could have skipped by being written
// with the trailing slash the documentation serves it on.
//
//   pnpm check:docs
//
// It is the one check here that needs the network, so it is not part of `pnpm build`.

import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const ROOT = new URL('../', import.meta.url).pathname
const SKIP = new Set(['node_modules', 'dist', 'public', '.git', '.github'])
const DOCS = 'https://docs.humanfia.ai/humanize2'

/** The top-level directories the documentation is made of, `guide/` and `tutorials/` included:
 *  both are retired, both still answer through a stub, and a link that goes back to either is
 *  the regression this check exists for. */
const SECTIONS = [
  'contributing',
  'demo',
  'features',
  'flows',
  'guide',
  'reference',
  'tutorials',
  'user',
  'weaver',
]

async function walk(at) {
  const found = []
  for (const entry of await readdir(at, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP.has(entry.name)) continue
      found.push(...(await walk(join(at, entry.name))))
    } else if (/\.(md|vue|mts|mjs)$/.test(entry.name) && entry.name !== 'docs-links.mjs') {
      found.push(join(at, entry.name))
    }
  }
  return found
}

/** Where each URL is written, so a failure names a file rather than an address. */
const said = new Map()
const note = (url, where) => said.set(url, (said.get(url) ?? new Set()).add(where))

for (const file of await walk(ROOT)) {
  const where = relative(ROOT, file)
  const text = await readFile(file, 'utf8')

  // Written out in full, which is every link in the Markdown. The bare base is the constant
  // a component holds, not a link -- the front page of the documentation is that plus a slash.
  for (const [, url] of text.matchAll(/(https:\/\/docs\.humanfia\.ai\/[^\s"'`)<>]+)/g)) {
    const link = url.replace(/[.,)·]+$/, '')
    if (link !== DOCS) note(link, where)
  }

  // A component holds the base in a `DOCS` constant and writes the rest three ways: joined to
  // it in a template literal, kept in a table of links as a bare path, or -- for the recorded
  // screens -- as a filename under `demo/`. All three are only a URL once the page renders,
  // and all three are checked here.
  if (!text.includes(`const DOCS = '${DOCS}'`)) continue

  // The whole path has to be written out to be checkable: `${DOCS}/demo/${shot.gif}` says
  // nothing about which file, so it is left to the rule for filenames below.
  const whole = /\$\{DOCS\}(\/[^\s"'`$]*)(?=[`'"\s)]|$)/g
  for (const [, path] of text.matchAll(whole)) note(DOCS + path, where)

  const sections = SECTIONS.join('|')
  for (const [, path] of text.matchAll(new RegExp(`'(/(?:${sections})/[^']*)'`, 'g'))) {
    note(DOCS + path, where)
  }

  for (const [, gif] of text.matchAll(/'([\w-]+\.gif)'/g)) note(`${DOCS}/demo/${gif}`, where)
}

const urls = [...said.keys()].sort()
if (!urls.length) {
  console.error('no links to the documentation found at all, which cannot be right')
  process.exit(1)
}

/** A stub page and a real one both answer 200. This is what tells them apart. */
const movedTo = (html) =>
  /http-equiv="refresh"/.test(html)
    ? /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1] ?? 'somewhere it does not say'
    : undefined

const problems = []

// Six at a time: enough to keep the whole check under a few seconds, few enough that a static
// host never sees this as something to throttle.
const queue = [...urls]
await Promise.all(
  Array.from({ length: 6 }, async () => {
    for (let url = queue.shift(); url; url = queue.shift()) {
      const where = [...said.get(url)].sort().join(', ')
      let answer
      try {
        answer = await fetch(url, { redirect: 'manual' })
      } catch (cause) {
        problems.push(`${url} -- could not be reached (${cause.message}) [${where}]`)
        continue
      }

      if (answer.status >= 300 && answer.status < 400) {
        const to = answer.headers.get('location')
        problems.push(`${url} -- redirects to ${to}; write that [${where}]`)
        continue
      }

      if (!answer.ok) {
        problems.push(`${url} -- ${answer.status} [${where}]`)
        continue
      }

      // Only a page can be a stub. A GIF is either there or it is not.
      if (!/\.(gif|png|svg|jpg)$/.test(new URL(url).pathname)) {
        const to = movedTo(await answer.text())
        if (to) problems.push(`${url} -- moved to ${to} [${where}]`)
      }
    }
  }),
)

if (problems.length) {
  for (const problem of problems.sort()) console.error(problem)
  console.error(`\n${problems.length} of ${urls.length} links to the documentation is wrong.`)
  process.exit(1)
}
console.log(`${urls.length} links to the documentation, every one of them where it says`)
