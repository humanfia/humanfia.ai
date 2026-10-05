// The projects, who leads each, and what each is built on: the one place that says so.
//
// The team roster reads its Lead and Co-lead chips from here, and every news post is credited
// from here. The rule is the organisation's: a result is also the work of the projects it was
// built on, so a news post's byline names the post's own authors and then the leads and
// co-leads of every project its project depends on, transitively. An HOA result is credited to
// whoever wrote it and to the lead of Humanize, which HOA runs on; a post about Humanize itself
// gains nobody. Blog posts are essays, signed by whoever wrote them, and are left alone.
//
// `dependsOn` is what the project's own repository depends on, not what its page mentions:
//
//   - FlowBench lists `hmz` as a dependency (humanfia/flowbench-internal, pyproject.toml).
//   - HOA runs its solvers as Humanize flows (humanfia/hoa, humanfia/hoa-qed READMEs).
//   - KDA leaves flow orchestration to Humanize (humanfia/KDA-internal README).
//   - HMA vendors `src/hmz` and ships as a Humanize flow (humanfia/hma).
//
// "RLCR Flow" is not Humanize. It is PolyArch/humanize, the Claude Code plugin Humanize grew
// out of, written and led by Sihao Liu; the Humanize lead never committed to it. Its posts are
// credited to it and to nothing it does not depend on, which is nothing in this organisation.
//
// Leads are GitHub logins, the roster's key; people.ts turns them into the names a byline uses.
import { PEOPLE } from './people'

export interface Project {
  name: string
  /** The news `tag` values that mean this project. */
  tags: string[]
  leads: string[]
  coLeads: string[]
  /** The ids of the projects in here it is built on. */
  dependsOn: string[]
}

export const PROJECTS: Record<string, Project> = {
  humanize: { name: 'Humanize', tags: ['Humanize'], leads: ['futrime'], coLeads: [], dependsOn: [] },
  humanize1: { name: 'RLCR Flow', tags: ['RLCR Flow'], leads: ['SihaoLiu'], coLeads: [], dependsOn: [] },
  flowbench: { name: 'FlowBench', tags: ['FlowBench'], leads: ['futrime'], coLeads: [], dependsOn: ['humanize'] },
  hoa: { name: 'HOA', tags: ['HOA'], leads: ['ZhengyangZhang06'], coLeads: [], dependsOn: ['humanize'] },
  kda: { name: 'KDA', tags: ['KDA'], leads: ['DongyunZou'], coLeads: [], dependsOn: ['humanize'] },
  hma: { name: 'HMA', tags: ['HMA'], leads: [], coLeads: ['antoinegg1', 'futrime'], dependsOn: ['humanize'] },
}

/** The byline name of a GitHub login; a lead people.ts does not know is a mistake in here. */
function nameOf(handle: string) {
  const name = Object.keys(PEOPLE).find((name) => PEOPLE[name].handle === handle)
  if (!name) throw new Error(`projects.ts: @${handle} is a lead but not in people.ts`)
  return name
}

/** The project a news `tag` names. A tag nobody claims is a tag missing from PROJECTS. */
export function projectOf(tag: string) {
  const id = Object.keys(PROJECTS).find((id) => PROJECTS[id].tags.includes(tag))
  if (!id) throw new Error(`projects.ts: no project has the news tag "${tag}"`)
  return id
}

/** Leads and co-leads of every project `id` is built on, nearest first, by byline name. */
export function dependencyLeads(id: string): string[] {
  const seen = new Set([id])
  const queue = [...PROJECTS[id].dependsOn]
  const names: string[] = []
  for (let at = 0; at < queue.length; at++) {
    const dep = queue[at]
    if (seen.has(dep)) continue
    seen.add(dep)
    const project = PROJECTS[dep]
    if (!project) throw new Error(`projects.ts: ${id} depends on unknown project "${dep}"`)
    names.push(...[...project.leads, ...project.coLeads].map(nameOf))
    queue.push(...project.dependsOn)
  }
  return names
}

/** A news post's byline: its own authors, then the leads it was built on, each name once. */
export const authorsWithDeps = (authors: string[], tag: string) => [
  ...new Set([...authors, ...dependencyLeads(projectOf(tag))]),
]
