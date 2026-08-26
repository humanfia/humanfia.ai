import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'

import AnchorSplit from './components/AnchorSplit.vue'
import ArchStack from './components/ArchStack.vue'
import BlogList from './components/BlogList.vue'
import Install from './components/Install.vue'
import LayerStack from './components/LayerStack.vue'
import News from './components/News.vue'
import PostMeta from './components/PostMeta.vue'
import SystemMap from './components/SystemMap.vue'
import TerminalReel from './components/TerminalReel.vue'
import TraceReel from './components/TraceReel.vue'
import './style.css'

// The default theme, plus the components the pages use. `doc-before` is where a blog post's
// whole header goes -- title, standfirst and the people who did the work: the component
// decides for itself whether the page is one, so every other page pays nothing for it.
export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, { 'doc-before': () => h(PostMeta) }),
  enhanceApp({ app }) {
    app.component('AnchorSplit', AnchorSplit)
    app.component('ArchStack', ArchStack)
    app.component('BlogList', BlogList)
    app.component('Install', Install)
    app.component('LayerStack', LayerStack)
    app.component('News', News)
    app.component('SystemMap', SystemMap)
    app.component('TerminalReel', TerminalReel)
    app.component('TraceReel', TraceReel)
  },
} satisfies Theme
