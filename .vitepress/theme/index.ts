import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'

import BlogList from './components/BlogList.vue'
import InstallLine from './components/InstallLine.vue'
import Numbers from './components/Numbers.vue'
import PostMeta from './components/PostMeta.vue'
import Results from './components/Results.vue'
import './style.css'

// The default theme, plus the components the pages use. `doc-before` is where a blog post's
// byline goes: the component decides for itself whether the page is one, so every other page
// pays nothing for it.
export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, { 'doc-before': () => h(PostMeta) }),
  enhanceApp({ app }) {
    app.component('BlogList', BlogList)
    app.component('InstallLine', InstallLine)
    app.component('Numbers', Numbers)
    app.component('Results', Results)
  },
} satisfies Theme
