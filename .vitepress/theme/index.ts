import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'

import AnchorSplit from './components/AnchorSplit.vue'
import ArchStack from './components/ArchStack.vue'
import Install from './components/Install.vue'
import LayerStack from './components/LayerStack.vue'
import PostMeta from './components/PostMeta.vue'
import PostMosaic from './components/PostMosaic.vue'
import TeamRoster from './components/TeamRoster.vue'
import TerminalReel from './components/TerminalReel.vue'
import TraceReel from './components/TraceReel.vue'
import { registerFlows } from './components/flow'
import Wordmark from './components/Wordmark.vue'
import HomeLanding from './home/HomeLanding.vue'
import './style.css'
import './home/home.css'

// The default theme, plus the components the pages use. `doc-before` is where a blog post's
// whole header goes -- title, standfirst and the people who did the work: the component
// decides for itself whether the page is one, so every other page pays nothing for it.
//
// `nav-bar-title-after` is the brand: the config sets no logo and no site title, so the link the
// theme draws round them holds only the animated wordmark (the footer's is SiteFooter.vue).
export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'doc-before': () => h(PostMeta),
      'nav-bar-title-after': () => h(Wordmark),
    }),
  enhanceApp({ app }) {
    app.component('AnchorSplit', AnchorSplit)
    app.component('ArchStack', ArchStack)
    app.component('Install', Install)
    app.component('LayerStack', LayerStack)
    app.component('PostMosaic', PostMosaic)
    app.component('TeamRoster', TeamRoster)
    app.component('TerminalReel', TerminalReel)
    app.component('TraceReel', TraceReel)
    app.component('HomeLanding', HomeLanding)
    registerFlows(app)
  },
} satisfies Theme
