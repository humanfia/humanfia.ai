// The flowverse, read at build time: which flows are released, at which versions, from which
// repositories, and what each repository says about itself.
//
// The catalogue under /flows/ is two things put together. What a flow *is* -- its roles, what
// ends it, the scene its page plays -- is written by hand in `theme/flows.ts`, because that is
// prose and a diagram, and nothing upstream says it. What a flow *ships as* -- its versions, the
// commit each one pins, its licence, what it depends on, its README -- is read from
// https://github.com/humanfia/flowverse and from each repository it lists, here, on every build.
// So a release is on the site the next time the site is built, without anybody writing it down,
// and a flow released by somebody who never opened this repository still gets a page of its own
// (`flows/[slug].paths.mts`), made from its README.
//
// The network is not trusted to be there. A build with no network, or one that the GitHub API
// has rate-limited, uses `flowverse.snapshot.json` instead -- the last reading that was
// committed -- and says so, rather than failing a deploy over somebody else's outage. It is all
// or nothing: half a fresh reading spliced into half a stale one would be a catalogue that never
// existed. `pnpm flowverse` refreshes the snapshot:
//
//   pnpm flowverse            read the flowverse, and write what it says to the snapshot
//   FLOWVERSE=offline pnpm build      build from the snapshot alone, as a build with no network
//
// It imports nothing but Node and a YAML parser, and is written in the part of TypeScript Node
// runs as is, so the same file is the build's loader and the refresh script.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { parse } from 'yaml'

export const FLOWVERSE = 'humanfia/flowverse'
const BRANCH = 'main'
const SNAPSHOT = fileURLToPath(new URL('./flowverse.snapshot.json', import.meta.url))

/** One released version of a flow module, as its `flow.yaml` says it. */
export interface Release {
  version: string
  description: string
  repo: string
  ref: string
  commit: string
  subdir: string
  license: string
  dependencies: Record<string, string>
}

/** A flow module: one directory under `flows/` in the flowverse, and every version of it. */
export interface Module {
  /** What hmz calls it: `aot`, or `alice/kernel` for somebody else's. */
  name: string
  /** Whose it is: null for Humanfia's own, listed by name alone. */
  owner: string | null
  /** Newest first, by SemVer. */
  versions: string[]
  latest: Release
  /** What GitHub says about the repository the newest version is released from. */
  repo: { url: string; description: string; stars: number; pushed: string }
  /** The newest version's README, at the commit it pins: its opening paragraph, and the whole. */
  readme: { summary: string; markdown: string }
}

export interface Flowverse {
  source: string
  /** When it was read. A snapshot keeps the time it was taken. */
  read: string
  /** Where this build got it from. */
  from: 'network' | 'snapshot'
  modules: Module[]
}

/* ------------------------------------------------------------------------------------------
   Reading it.
   ------------------------------------------------------------------------------------------ */

const TIMEOUT = 10_000

async function get(url: string, api = false): Promise<Response> {
  const headers: Record<string, string> = { 'user-agent': 'humanfia.ai-build' }
  // CI passes its own token, so the build spends the repository's rate limit rather than the
  // runner's shared, unauthenticated one -- which other jobs on the same address use up.
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN
  if (api) {
    headers.accept = 'application/vnd.github+json'
    if (token) headers.authorization = `Bearer ${token}`
  }
  const answer = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT) })
  if (!answer.ok) throw new Error(`${url} answered ${answer.status}`)
  return answer
}

/** A `flow.yaml`: flat scalars, and `dependencies`, a map from module to version range. */
export function manifest(text: string): Release {
  const out = (parse(text) ?? {}) as Record<string, unknown>
  const field = (key: string) => (out[key] == null ? '' : String(out[key]))
  for (const key of ['name', 'version', 'repo', 'commit']) {
    if (!field(key)) throw new Error(`a manifest without ${key}`)
  }
  const needs = (out.dependencies ?? {}) as Record<string, unknown>
  return {
    version: field('version'),
    description: field('description'),
    repo: field('repo'),
    ref: field('ref'),
    commit: field('commit'),
    subdir: field('subdir'),
    license: field('license'),
    dependencies: Object.fromEntries(Object.entries(needs).map(([name, range]) => [name, String(range)])),
  }
}

/** SemVer order, newest first. Pre-releases sort under their release, as SemVer says. */
export function bySemver(a: string, b: string): number {
  const parse = (v: string) => {
    const [core, pre = ''] = v.split('-', 2)
    return { nums: core.split('.').map(Number), pre }
  }
  const x = parse(a)
  const y = parse(b)
  for (let i = 0; i < 3; i++) if (x.nums[i] !== y.nums[i]) return (y.nums[i] ?? 0) - (x.nums[i] ?? 0)
  if (x.pre === y.pre) return 0
  if (!x.pre) return -1
  if (!y.pre) return 1
  return y.pre.localeCompare(x.pre, 'en', { numeric: true })
}

/** The first paragraph of prose in a README: under its title, past badges, a table of
 *  contents and anything else that is not a sentence. */
export function summary(markdown: string): string {
  const blocks = markdown
    .replace(/\r/g, '')
    .split(/\n{2,}/)
    .map((b) => b.trim())
  for (const block of blocks) {
    if (!block || /^(#|\[!\[|!\[|<|```|\||-\s|\*\s|>)/.test(block)) continue
    return block.replace(/\s*\n\s*/g, ' ')
  }
  return ''
}

async function readNetwork(): Promise<Flowverse> {
  const tree = (await (
    await get(`https://api.github.com/repos/${FLOWVERSE}/git/trees/${BRANCH}?recursive=1`, true)
  ).json()) as { tree: { path: string }[]; truncated: boolean }
  if (tree.truncated) throw new Error('the flowverse is too big to list in one call')

  // flows/<name>/<version>/flow.yaml, or flows/<owner>/<name>/<version>/flow.yaml.
  const found = new Map<string, { owner: string | null; files: string[] }>()
  for (const { path } of tree.tree) {
    const m = /^flows\/(?:([^/]+)\/)?([^/]+)\/([^/]+)\/flow\.yaml$/.exec(path)
    if (!m) continue
    const name = m[1] ? `${m[1]}/${m[2]}` : m[2]
    const entry = found.get(name) ?? { owner: m[1] ?? null, files: [] }
    entry.files.push(path)
    found.set(name, entry)
  }
  if (!found.size) throw new Error('the flowverse lists no flows, which cannot be right')

  const raw = (repo: string, ref: string, path: string) =>
    get(`https://raw.githubusercontent.com/${repo}/${ref}/${path}`).then((r) => r.text())

  const modules = await Promise.all(
    [...found].map(async ([name, { owner, files }]): Promise<Module> => {
      const releases = await Promise.all(files.map(async (path) => manifest(await raw(FLOWVERSE, BRANCH, path))))
      releases.sort((a, b) => bySemver(a.version, b.version))
      const latest = releases[0]
      const [meta, readme] = await Promise.all([
        get(`https://api.github.com/repos/${latest.repo}`, true).then(
          (r) => r.json() as Promise<{ html_url: string; description: string | null; stargazers_count: number; pushed_at: string }>,
        ),
        // At the commit the newest release pins: the README of the code hmz installs, not of
        // whatever is on main this afternoon.
        raw(latest.repo, latest.commit, 'README.md').catch(() => ''),
      ])
      return {
        name,
        owner,
        versions: releases.map((r) => r.version),
        latest,
        repo: {
          url: meta.html_url,
          description: meta.description ?? '',
          stars: meta.stargazers_count,
          pushed: meta.pushed_at,
        },
        readme: { summary: summary(readme.replace(/^#[^\n]*\n/, '')), markdown: readme },
      }
    }),
  )
  modules.sort((a, b) => a.name.localeCompare(b.name))
  return { source: `https://github.com/${FLOWVERSE}`, read: new Date().toISOString(), from: 'network', modules }
}

function readSnapshot(): Flowverse {
  const saved = JSON.parse(readFileSync(SNAPSHOT, 'utf8')) as Flowverse
  return { ...saved, from: 'snapshot' }
}

/**
 * The flowverse, read once per build however many places ask: the dynamic route (for the pages
 * nobody wrote) and the data loader (for the tiles) are bundled apart, but run in one process,
 * and share this through `globalThis`.
 */
export function loadFlowverse(): Promise<Flowverse> {
  const shared = globalThis as { __flowverse?: Promise<Flowverse> }
  shared.__flowverse ??= (async () => {
    if (process.env.FLOWVERSE === 'offline') return readSnapshot()
    try {
      return await readNetwork()
    } catch (cause) {
      console.warn(`flowverse: ${(cause as Error).message}; building from the committed snapshot instead`)
      return readSnapshot()
    }
  })()
  return shared.__flowverse
}

/** The slug a module's generated page lives at: `aot`, or `alice-kernel`. */
export const slugOf = (name: string) => name.replace(/[/_:]+/g, '-').toLowerCase()

// `node .vitepress/flowverse.mts`: read it from the network, and keep what it said.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const read = await readNetwork()
  const { from: _, ...kept } = read
  writeFileSync(SNAPSHOT, `${JSON.stringify(kept, null, 2)}\n`)
  console.log(`flowverse: ${read.modules.length} flow modules written to ${SNAPSHOT}`)
}
