// A page for every flow the flowverse releases that nobody here has written one for.
//
// The hand-written pages (`flows/*.md`, one per flow in `theme/flows.ts`) are the ones with a
// diagram and the prose that says when to reach for a flow. But the flowverse is open: anybody
// may release a flow into it, and a catalogue that only listed what this repository had heard of
// would be wrong the day after a release. So a module with no hand-written page gets one built
// from its README, at the commit its newest release pins, under the facts strip every flow page
// has. Writing a page for it by hand -- and listing it in `theme/flows.ts` -- replaces this.
import { loadFlowverse, slugOf } from '../.vitepress/flowverse.mts'
import { FLOWS } from '../.vitepress/theme/flows'

/** A README is written for GitHub, and this puts it on a page of ours: its own title goes
 *  (ours replaces it, with the flow's name as hmz calls it), as do its badges and its table of
 *  contents (the page has an outline), and every relative link and image is pointed back at
 *  the repository, since none of them exist on this site. */
export function adapt(markdown: string, repo: string, commit: string): string {
  const blob = `https://github.com/${repo}/blob/${commit}/`
  const raw = `https://raw.githubusercontent.com/${repo}/${commit}/`
  return (
    markdown
      .replace(/\r/g, '')
      .replace(/^#\s[^\n]*\n/, '')
      .replace(/^\s*\[!\[[^\n]*\n/gm, '')
      .replace(/^## Table of Contents\n[\s\S]*?(?=^## )/m, '')
      // Images first, then links: an image is a link with a `!` in front.
      .replace(/!\[([^\]]*)\]\((?!https?:|#)([^)\s]+)\)/g, (_, alt, path) => `![${alt}](${raw}${path.replace(/^\.\//, '')})`)
      .replace(/\[([^\]]+)\]\((?!https?:|#|mailto:)([^)\s]+)\)/g, (_, text, path) => `[${text}](${blob}${path.replace(/^\.\//, '')})`)
      // A fragment means GitHub's slug of a heading, which is not always VitePress's: the
      // outline beside the page is the way around it, so a link into the README becomes its
      // words.
      .replace(/\[([^\]]+)\]\(#[^)]*\)/g, '$1')
      // `{{` would be read as Vue, and a README has no reason to mean that.
      .replace(/\{\{/g, '&#123;&#123;')
  )
}

export default {
  async paths() {
    const written = new Set(FLOWS.map((one) => one.module).filter(Boolean))
    const read = await loadFlowverse()
    return read.modules
      .filter((module) => !written.has(module.name))
      .map((module) => ({
        params: { slug: slugOf(module.name), name: module.name },
        content: [
          `# ${module.name}`,
          '',
          `<FlowFacts module="${module.name}" />`,
          '',
          '::: info From its README',
          `Nobody has written this flow a page of its own yet, so this is its README, as of the release above. Its roles, params and what ends it are there; the [catalogue](/flows/) says how flows are run.`,
          ':::',
          '',
          adapt(module.readme.markdown, module.latest.repo, module.latest.commit),
        ].join('\n'),
      }))
  },
}
