import type { App } from 'vue'

import AnimatedDiagram from './AnimatedDiagram.vue'
import BarChart from './BarChart.vue'
import Leaderboard from './Leaderboard.vue'
import LineChart from './LineChart.vue'
import LoopCompare from './LoopCompare.vue'
import NumberTicker from './NumberTicker.vue'
import PostCard from './PostCard.vue'
import PostCards from './PostCards.vue'
import PostFigure from './PostFigure.vue'
import PullQuote from './PullQuote.vue'
import RangeMeter from './RangeMeter.vue'
import ResultsTable from './ResultsTable.vue'
import ScatterChart from './ScatterChart.vue'
import Sidenote from './Sidenote.vue'
import StatGrid from './StatGrid.vue'
import SwipeCompare from './SwipeCompare.vue'
import './kit.css'

// The post kit: every figure a news or blog post can use, registered globally so a post writes
// `<BarChart ... />` in its markdown and nothing else. CONTRIBUTING.md is the guide to each one.
const KIT = {
  AnimatedDiagram,
  BarChart,
  Leaderboard,
  LineChart,
  LoopCompare,
  NumberTicker,
  PostCard,
  PostCards,
  PostFigure,
  PullQuote,
  RangeMeter,
  ResultsTable,
  ScatterChart,
  Sidenote,
  StatGrid,
  SwipeCompare,
}

export function registerKit(app: App) {
  for (const [name, component] of Object.entries(KIT)) app.component(name, component)
}
