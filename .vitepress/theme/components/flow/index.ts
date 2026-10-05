// The components the pages under /flows/ write by name, registered in one call so the theme's
// own list stays a list of the site's components, and this section can be read on its own.
import type { App } from 'vue'

import FlowCatalogue from './FlowCatalogue.vue'
import FlowFacts from './FlowFacts.vue'
import FlowLegend from './FlowLegend.vue'
import FlowPlayer from './FlowPlayer.vue'
import FlowsHero from './FlowsHero.vue'
import './grammar.css'

export function registerFlows(app: App) {
  app.component('FlowCatalogue', FlowCatalogue)
  app.component('FlowFacts', FlowFacts)
  app.component('FlowLegend', FlowLegend)
  app.component('FlowPlayer', FlowPlayer)
  app.component('FlowsHero', FlowsHero)
}
