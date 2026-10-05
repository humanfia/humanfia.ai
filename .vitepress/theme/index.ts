import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'

import AnchorSplit from './components/AnchorSplit.vue'
import ArchStack from './components/ArchStack.vue'
import Install from './components/Install.vue'
import LayerStack from './components/LayerStack.vue'
import NewsList from './components/NewsList.vue'
import PostLayout from './components/PostLayout.vue'
import PostMosaic from './components/PostMosaic.vue'
import TeamRoster from './components/TeamRoster.vue'
import TerminalReel from './components/TerminalReel.vue'
import TraceReel from './components/TraceReel.vue'
import { registerFlows } from './components/flow'
import { registerKit } from './components/kit'
import Wordmark from './components/Wordmark.vue'
import HomeLanding from './home/HomeLanding.vue'
import './style.css'
import './home/home.css'
import './post.css'

// The default theme, plus the components the pages use. A post -- anything in blog/ or news/ --
// is drawn by `post`, a layout of its own (components/PostLayout.vue): config.mts selects it,
// and the post kit (components/kit/) is every figure a post can put in its markdown.
//
// `nav-bar-title-after` is the brand: the config sets no logo and no site title, so the link the
// theme draws round them holds only the animated wordmark (the footer's is SiteFooter.vue).
export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'nav-bar-title-after': () => h(Wordmark),
    }),
  enhanceApp({ app }) {
    app.component('AnchorSplit', AnchorSplit)
    app.component('ArchStack', ArchStack)
    app.component('Install', Install)
    app.component('LayerStack', LayerStack)
    app.component('NewsList', NewsList)
    app.component('PostMosaic', PostMosaic)
    app.component('post', PostLayout)
    app.component('TeamRoster', TeamRoster)
    app.component('TerminalReel', TerminalReel)
    app.component('TraceReel', TraceReel)
    app.component('HomeLanding', HomeLanding)
    registerFlows(app)
    registerKit(app)
  },
} satisfies Theme
