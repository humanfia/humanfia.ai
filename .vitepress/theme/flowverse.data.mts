// What the flowverse says each flow module ships as, handed to the components that show it: the
// facts strip on a flow's page, and the version on its card. Read once per build by
// `.vitepress/flowverse.mts` -- from the network, or from the committed snapshot when there is
// none -- and trimmed here to what a page needs, since whatever a loader returns is shipped to
// every reader of a page that imports it. The READMEs stay behind: only the pages generated
// from them (`flows/[slug].paths.mts`) use them, and they get them at build time.
import { defineLoader } from 'vitepress'

import { type Flowverse, loadFlowverse, type Module, slugOf } from '../flowverse.mts'

export interface Shipped extends Omit<Module, 'readme'> {
  /** The README's opening paragraph. */
  summary: string
  /** Where its page is, if it has no hand-written one: /flows/<slug>. */
  slug: string
}

export interface Catalogue extends Omit<Flowverse, 'modules'> {
  modules: Shipped[]
}

declare const data: Catalogue
export { data }

export default defineLoader({
  async load(): Promise<Catalogue> {
    const read = await loadFlowverse()
    return {
      ...read,
      modules: read.modules.map(({ readme, ...module }) => ({
        ...module,
        summary: readme.summary,
        slug: slugOf(module.name),
      })),
    }
  },
})
