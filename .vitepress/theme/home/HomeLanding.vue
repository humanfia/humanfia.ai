<script setup lang="ts">
// The home page. It is one argument told in order -- what we build, how it is put together,
// what came back, where to start -- and nothing on it is pinned. The page moves at the speed of
// the hand; the pictures are driven by where their section happens to be on screen (the hero
// comes apart as it leaves, the manifesto lights as it is read, the stack turns to whichever
// paragraph is in the middle of the window, the applications stack up like cards), or play
// once when they arrive. The numbers are the blog's numbers, and every one of them links to
// the post that says how to check it.
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { data as posts } from '../posts.data.mts'
import { HeroScene, StackField, fitScene } from './fields'
import {
  clamp,
  easeOut,
  onFirstSight,
  onScrollFrame,
  prefersReducedMotion,
  span,
  useScrollProgress,
  vReveal,
} from './motion'

const { isDark } = useData()
const motion = ref(false)

const GITHUB = 'https://github.com/humanfia'
const REPO = 'https://github.com/humanfia/humanize'
const DOCS = 'https://docs.humanfia.ai/humanize/'

// ------------------------------------------------------------------------------------ hero

const heroEl = ref<HTMLElement | null>(null)
const heroSvg = ref<SVGSVGElement | null>(null)
const heroArt = ref<HTMLElement | null>(null)
// How far the hero has scrolled off the top, 0..1: one screen of ordinary scrolling, not a pin.
const heroP = useScrollProgress(heroEl, (box) => clamp(-box.top / box.height))
let hero: HeroScene | null = null

const heroCopy = computed(() => {
  if (!motion.value) return {}
  const out = span(heroP.value, 0.05, 0.6)
  return { opacity: 1 - out, transform: `translate3d(0, ${-out * 60}px, 0)` }
})
const cueOpacity = computed(() => 1 - span(heroP.value, 0, 0.06))

/** Where the H stands at rest, read off the layout every frame: the copy decides how much room
 *  the art column has, and the whole construction -- not just the H -- is fitted into it. */
function heroAnchor() {
  const art = heroArt.value!.getBoundingClientRect()
  const stage = heroSvg.value!.getBoundingClientRect()
  const left = art.left - stage.left
  // Beside the copy, the art may use the page's right margin too, up to a gutter from the edge:
  // the construction is the loudest thing on the page and should not be boxed in by the grid.
  const wide = stage.width > 900
  const width = wide ? stage.width - left - 24 : art.width
  return fitScene({ left, top: art.top - stage.top, width, height: art.height })
}

// ------------------------------------------------------------------------------- manifesto

const MANIFESTO =
  'Models get better every few months. The flow around them is what turns a model into a result: ' +
  'which agent goes next, what it is asked, who checks the work, and when it stops. ' +
  'That part was nobody’s job. So we build it, in the open, and point it at work where somebody else keeps the score.'
const STRONG = new Set(['flow', 'result:', 'open,', 'score.'])
const words = MANIFESTO.split(' ').map((w) => ({ w, strong: STRONG.has(w) }))
const manifestoEl = ref<HTMLElement | null>(null)
// The words light as the paragraph is read: from when its top rises past the lower fifth of the
// window to when its bottom reaches the middle, which is the stretch the eye is actually on it.
const manifestoP = useScrollProgress(manifestoEl, (box, vh) =>
  clamp((vh * 0.8 - box.top) / (box.height + vh * 0.3)),
)
const lit = (i: number) => {
  if (!motion.value) return 1
  return 0.16 + 0.84 * clamp(manifestoP.value * (words.length + 4) - i)
}

// ----------------------------------------------------------------------------------- stack

const STEPS = [
  {
    tag: 'Flows',
    title: 'The method, written as code.',
    body: 'A flow is a directory of Python: which agents take turns, what each is asked, and when it stops. RLAR, Flame Chase, the Ralph loop — all of them in the open, for anyone to read, fork or beat.',
    link: { text: 'Browse the flowverse', href: 'https://github.com/humanfia/flowverse' },
  },
  {
    tag: 'Runtime',
    title: 'Humanize runs the flows.',
    body: 'It opens and resumes sessions, keeps a budget in time, cost or tokens, puts the work in a worktree, a container or on another machine, and writes every turn down on one clock.',
    link: { text: 'Meet Humanize', href: '/projects/humanize' },
  },
  {
    tag: 'Agents',
    title: 'On the CLIs you already log into.',
    body: 'claude, codex, dsh, agy, grok, kimi, qwen, pi, opencode and mimo. We hold no API key: the runtime drives the tools you already pay for.',
    link: { text: 'Read the docs', href: DOCS },
  },
  {
    tag: 'Applications',
    title: 'Pointed where the score isn’t ours.',
    body: 'HOA answers to Lean. KDA answers to the profiler. HKA answers to Kaggle. Each was chosen because somebody else keeps the scoreboard.',
    link: { text: 'See what came back', href: '#results' },
  },
  {
    tag: 'FlowBench',
    title: 'And a referee that sends the winner back.',
    body: 'FlowBench scores the flows against each other on long-horizon work — ours included — and the winner becomes the next default. It is the one arrow that runs the other way.',
    link: { text: 'About FlowBench', href: '/projects/flowbench' },
  },
]
const stackEl = ref<HTMLElement | null>(null)
const stackCanvas = ref<HTMLCanvasElement | null>(null)
// The five paragraphs are equally tall and scroll like any others; the picture beside them is
// sticky. Progress is where the middle of the window is down the list, so layer k is the
// subject exactly when paragraph k is in the middle -- the picture follows the reading.
const stackP = useScrollProgress(stackEl, (box, vh) => clamp((vh / 2 - box.top) / box.height))
let stack: StackField | null = null
const focus = (k: number) => clamp(1 - Math.abs(stackP.value * 5 - 0.5 - k) * 1.15)
/** The paragraph being read is at full strength, the others are set back. */
const stepOn = (k: number) => !motion.value || focus(k) > 0.4

// --------------------------------------------------------------------------------- results

interface Tile {
  id: string
  to: number
  from?: number
  places?: number
  prefix?: string
  suffix?: string
  label: string
  body: string
  href: string
  size: string
  viz?: 'six' | 'versus' | 'bars' | 'ring' | 'grid' | 'dots'
}

const TILES: Tile[] = [
  {
    id: 'imo', to: 6, suffix: '/6', size: 'w7 tall', viz: 'six',
    label: 'IMO 2026',
    body: 'Every problem solved by a fully agentic run and machine-checked in Lean 4 — on two different backends.',
    href: '/news/2026-07-22-imo-2026',
  },
  {
    id: 'lean', to: 1, from: 12, prefix: '#', size: 'w5 tall',
    label: 'Lean-Eval leaderboard',
    body: '172 research-level mathematics problems, every accepted proof sorry-free and independently re-verified.',
    href: '/news/2026-08-18-lean-eval-first',
  },
  {
    id: 'kda', to: 1.39, from: 1, places: 2, suffix: '×', size: 'w4', viz: 'versus',
    label: 'Past the best human kernels',
    body: 'KDA 1.5 on every track of the MLSys 2026 FlashInfer contest.',
    href: '/news/2026-08-02-kda-15-past-human-sota',
  },
  {
    id: 'pb', to: 3.5, places: 1, suffix: '%', size: 'w4', viz: 'bars',
    label: 'ProgramBench',
    body: 'Two models that solve 0.5% and 0% alone, as a builder and a reviewer in a loop.',
    href: '/news/2026-08-11-programbench',
  },
  {
    id: 'putnam', to: 670, suffix: '/672', size: 'w4', viz: 'ring',
    label: 'PutnamBench',
    body: '99.7% of the benchmark, and every problem of Putnam 2025.',
    href: '/news/2026-06-26-putnambench',
  },
  {
    id: 'sol', to: 53, size: 'w5', viz: 'grid',
    label: 'First places on SOL Bench',
    body: 'One week of unattended kernel generation on a single 8×B200 node.',
    href: '/news/2026-06-22-sol-bench-batch',
  },
  {
    id: 'msa', to: 6.5, from: 1, places: 1, suffix: '×', size: 'w3',
    label: 'MSA indexer, in production',
    body: 'Prefill on B300, bitwise-identical output.',
    href: '/news/2026-08-14-msa-indexer',
  },
  {
    id: 'kaggle', to: 14, suffix: '/19', size: 'w4', viz: 'dots',
    label: 'Kaggle top 5%',
    body: 'Nineteen completed competitions, ten agent workflows.',
    href: '/news/2026-08-15-kaggle-nineteen-competitions',
  },
]

const fmt = (t: Tile, v: number) => `${t.prefix ?? ''}${v.toFixed(t.places ?? 0)}${t.suffix ?? ''}`
const shown = reactive<Record<string, string>>(Object.fromEntries(TILES.map((t) => [t.id, fmt(t, t.to)])))
const live = reactive<Record<string, boolean>>({})
const bentoEl = ref<HTMLElement | null>(null)
let bentoIO: IntersectionObserver | null = null

function count(t: Tile) {
  live[t.id] = true
  if (!motion.value) return
  const from = t.from ?? 0
  const t0 = performance.now()
  const tick = (now: number) => {
    const u = easeOut(clamp((now - t0) / 1500))
    shown[t.id] = fmt(t, from + (t.to - from) * u)
    if (u < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

/** The spotlight under the pointer on a tile: two custom properties, and the CSS does the rest. */
function spot(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement
  const box = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - box.left}px`)
  el.style.setProperty('--my', `${e.clientY - box.top}px`)
}

// ---------------------------------------------------------------------------- applications

// Three cards that stack as the page scrolls: each is sticky a step lower than the one before,
// so the next slides up over it, and the one underneath sinks back a little as it is covered --
// a deck being dealt, downwards, at the speed of the wheel. (The gallery used to scroll sideways
// inside a three-and-a-half-screen pin; a sideways strip driven by a vertical wheel is the one
// motion a reader cannot predict.) `covered[k]` is how far card k is under card k + 1, 0..1.
const deckEl = ref<HTMLElement | null>(null)
const covered = ref<number[]>([0, 0, 0])
onScrollFrame(() => {
  const cards = deckEl.value?.children
  if (!cards) return
  covered.value = Array.from(cards, (card, k) => {
    const next = cards[k + 1]
    if (!next) return 0
    const top = card.getBoundingClientRect().top
    const rise = next.getBoundingClientRect().top - top
    return clamp(1 - rise / card.getBoundingClientRect().height)
  })
})
const cardStyle = (k: number) => {
  if (!motion.value) return {}
  const c = covered.value[k]
  return { '--cover': c.toFixed(3), transform: `scale(${1 - 0.05 * c})` }
}

const HOA_CHECKS = [
  ['IMO 2026', '6 / 6'],
  ['Lean-Eval', '#1 · 172 proofs'],
  ['PutnamBench', '670 / 672'],
  ['IPhO 2026 theory', '23 / 23'],
  ['Quantum algorithms', '36 / 36'],
]
const KDA_BARS = [
  { label: 'MSA prefill indexer · B300', value: 6.5 },
  { label: 'Long-context decode indexer', value: 3.3 },
  { label: 'vs. best human · FlashInfer contest', value: 1.39 },
]
const KAGGLE = Array.from({ length: 19 }, (_, i) => i < 14)

// ---------------------------------------------------------------------------------- runtime

const AGENTS = ['claude', 'codex', 'dsh', 'agy', 'grok', 'kimi', 'qwen', 'pi', 'opencode', 'mimo']
const INSTALL = `uv tool install git+${REPO}.git`
const TERMINAL = [
  { prompt: true, text: INSTALL },
  { prompt: true, text: 'hmz exec -f official/flame_chase' },
]
const termEl = ref<HTMLElement | null>(null)
const typed = ref(TERMINAL.map((l) => l.text))
const typing = ref(-1)
onFirstSight(termEl, async () => {
  if (!motion.value) return
  typed.value = TERMINAL.map(() => '')
  for (let i = 0; i < TERMINAL.length; i++) {
    typing.value = i
    const text = TERMINAL[i].text
    for (let k = 1; k <= text.length; k++) {
      typed.value[i] = text.slice(0, k)
      await new Promise((r) => setTimeout(r, k < 4 ? 70 : 18 + Math.random() * 22))
    }
    await new Promise((r) => setTimeout(r, 420))
  }
  typing.value = TERMINAL.length - 1
})

const copied = ref(false)
async function copy() {
  try {
    await navigator.clipboard.writeText(INSTALL)
    copied.value = true
    setTimeout(() => (copied.value = false), 1600)
  } catch {
    /* a browser that refuses clipboard access still shows the command to select by hand */
  }
}

const FEATURES = [
  { title: 'A budget it keeps', body: 'Stop on time, cost or tokens, so a run meant to take a night does not take a week.' },
  { title: 'One clock for every turn', body: 'Every agent, sub-agent and tool call on a single timeline, opened as a Chrome trace.' },
  { title: 'Wherever the work belongs', body: 'Locally, in a git worktree, in a container, or on another machine over SSH.' },
]

// ------------------------------------------------------------------------------------ news

// The results, not the essays: this section is "one result, one post", and the blog has its
// own index for the arguments.
const latest = posts.filter((post) => post.kind === 'news').slice(0, 8)
const railEl = ref<HTMLElement | null>(null)
function slide(dir: number) {
  const rail = railEl.value
  if (!rail) return
  rail.scrollBy({ left: dir * Math.min(rail.clientWidth * 0.8, 720), behavior: 'smooth' })
}

// --------------------------------------------------------------------------------- lifecycle

onMounted(() => {
  const still = prefersReducedMotion()
  motion.value = !still
  if (heroSvg.value) hero = new HeroScene(heroSvg.value, still, heroAnchor)
  if (stackCanvas.value) stack = new StackField(stackCanvas.value, still)
  bentoIO = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const tile = TILES.find((t) => t.id === (entry.target as HTMLElement).dataset.tile)
        if (tile) count(tile)
        bentoIO?.unobserve(entry.target)
      }
    },
    { threshold: 0.45 },
  )
  bentoEl.value?.querySelectorAll('[data-tile]').forEach((el) => bentoIO!.observe(el))
})

watch(heroP, (p) => {
  if (!hero) return
  hero.progress = p
  hero.update()
})
watch(stackP, (p) => {
  if (!stack) return
  stack.target = p
  stack.update()
})
// The hero is SVG whose fills are CSS variables, so it flips with the theme by itself; the
// stack is a canvas and has to be told to read the palette again.
watch(isDark, () => stack?.recolor())

onBeforeUnmount(() => {
  hero?.destroy()
  stack?.destroy()
  bentoIO?.disconnect()
})
</script>

<template>
  <div class="hf-home-root" :class="{ 'hf-motion': motion }">
    <!-- 1. The hero: the H is built from its pieces, and comes apart again as it leaves. -->
    <section ref="heroEl" class="h-hero" aria-labelledby="hero-title">
      <div class="h-hero-stage">
        <svg ref="heroSvg" class="h-hero-svg" aria-hidden="true" />
        <div class="h-hero-grid">
          <div class="h-hero-copy" :style="heroCopy">
            <p class="h-kicker h-load" style="--d: 0.1s">Open-source agent flows</p>
            <h1 id="hero-title" class="h-display h-load" style="--d: 0.25s">
              We build the flow around the agents.
            </h1>
            <p class="h-lead h-load" style="--d: 0.45s">
              The runtime, the flows and the referee for long-horizon agent work — measured where
              somebody else keeps the score.
            </p>
            <div class="h-actions h-load" style="--d: 0.6s">
              <a class="h-btn h-btn-primary" href="/projects/humanize">Get started</a>
              <a class="h-btn h-btn-ghost" :href="GITHUB" target="_blank" rel="noreferrer">
                View on GitHub <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <div ref="heroArt" class="h-hero-art" aria-hidden="true" />
        </div>
        <div class="h-cue" :style="{ opacity: cueOpacity }" aria-hidden="true"><span /></div>
      </div>
    </section>

    <!-- 2. The argument, one word at a time. -->
    <section class="h-manifesto" aria-label="Why Humanfia">
      <div class="h-wrap">
        <p ref="manifestoEl" class="h-manifesto-text">
          <span
            v-for="(w, i) in words"
            :key="i"
            class="h-word"
            :class="{ 'h-word-strong': w.strong }"
            :style="{ opacity: lit(i) }"
          >{{ `${w.w} ` }}</span>
        </p>
      </div>
    </section>

    <!-- 3. How it is put together: four layers and a referee. -->
    <section class="h-stack" aria-labelledby="stack-title">
      <div class="h-wrap">
        <header class="h-head" v-reveal>
          <p class="h-kicker">How it fits together</p>
          <h2 id="stack-title" class="h-h2">Four layers<br />and a referee.</h2>
        </header>
      </div>
      <div class="h-stack-grid">
        <div class="h-stack-art">
          <canvas ref="stackCanvas" class="h-stack-canvas" aria-hidden="true" />
        </div>
        <div ref="stackEl" class="h-steps">
          <article v-for="(s, k) in STEPS" :key="s.tag" class="h-step" :class="{ on: stepOn(k) }">
            <p class="h-step-tag" :class="{ warm: k === 4 }">{{ String(k + 1).padStart(2, '0') }} · {{ s.tag }}</p>
            <h3>{{ s.title }}</h3>
            <p>{{ s.body }}</p>
            <a class="h-link" :href="s.link.href">{{ s.link.text }} <span aria-hidden="true">›</span></a>
          </article>
        </div>
      </div>
    </section>

    <!-- 4. What came back. -->
    <section id="results" class="h-section h-alt" aria-labelledby="results-title">
      <div class="h-wrap">
        <header class="h-head" v-reveal>
          <p class="h-kicker">What came back</p>
          <h2 id="results-title" class="h-h2">The numbers,<br />and where to check them.</h2>
          <p class="h-lead">Every result is a post, dated, with the people who produced it named at the top.</p>
        </header>
        <div ref="bentoEl" class="h-bento">
          <a
            v-for="(t, i) in TILES"
            :key="t.id"
            :href="t.href"
            class="h-tile"
            :class="[t.size, { live: live[t.id] }]"
            :data-tile="t.id"
            v-reveal="(i % 3) * 90"
            @pointermove="spot"
          >
            <span class="h-tile-label">{{ t.label }}</span>
            <span class="h-tile-num">{{ shown[t.id] }}</span>
            <span class="h-tile-body">{{ t.body }}</span>

            <span v-if="t.viz === 'six'" class="v-six" aria-hidden="true">
              <i v-for="n in 6" :key="n" :style="{ '--i': n }">✓</i>
            </span>
            <span v-else-if="t.viz === 'versus'" class="v-versus" aria-hidden="true">
              <span><em>best human</em><i style="--w: 72%" /></span>
              <span><em>KDA 1.5</em><i class="hot" style="--w: 100%" /></span>
            </span>
            <span v-else-if="t.viz === 'bars'" class="v-bars" aria-hidden="true">
              <span><i style="--h: 4%" /><em>0%</em></span>
              <span><i style="--h: 15%" /><em>0.5%</em></span>
              <span><i class="hot" style="--h: 100%" /><em>loop</em></span>
            </span>
            <svg v-else-if="t.viz === 'ring'" class="v-ring" viewBox="0 0 44 44" aria-hidden="true">
              <circle cx="22" cy="22" r="19" />
              <circle cx="22" cy="22" r="19" class="on" pathLength="100" />
            </svg>
            <span v-else-if="t.viz === 'grid'" class="v-grid" aria-hidden="true">
              <i v-for="n in 60" :key="n" :class="{ on: n <= 53 }" :style="{ '--i': n }" />
            </span>
            <span v-else-if="t.viz === 'dots'" class="v-dots" aria-hidden="true">
              <i v-for="(top, n) in KAGGLE" :key="n" :class="{ on: top }" :style="{ '--i': n }" />
            </span>
            <span class="h-tile-more" aria-hidden="true">Read the post ›</span>
          </a>
        </div>
      </div>
    </section>

    <!-- 5. Where a flow is found out: three cards dealt one over the other as the page scrolls. -->
    <section class="h-apps" aria-labelledby="apps-title">
      <div class="h-wrap">
        <header class="h-head" v-reveal>
          <p class="h-kicker">Applications</p>
          <h2 id="apps-title" class="h-h2">Where a flow is found out.</h2>
        </header>
        <div ref="deckEl" class="h-deck">
          <article class="h-panel" :style="cardStyle(0)" v-reveal>
            <div class="h-panel-copy">
              <p class="h-step-tag">HOA · Humanfia Olympiad Agents</p>
              <h3>Lean accepts it,<br />or it does not.</h3>
              <p>Competition and research mathematics, physics and quantum information — solved by agents and machine-checked in Lean 4. No rubric, no grader, no benefit of the doubt.</p>
              <a class="h-link" href="/projects/hoa">Explore HOA <span aria-hidden="true">›</span></a>
            </div>
            <div class="h-panel-art art-lean">
              <p class="art-cmd"><span>$</span> lake build <em>0 sorry</em></p>
              <ul>
                <li v-for="([name, score], i) in HOA_CHECKS" :key="name" :style="{ '--i': i }">
                  <b>✓</b><span>{{ name }}</span><em>{{ score }}</em>
                </li>
              </ul>
            </div>
          </article>
          <article class="h-panel" :style="cardStyle(1)" v-reveal>
            <div class="h-panel-copy">
              <p class="h-step-tag">KDA · Kernel Design Agents</p>
              <h3>Faster,<br />or it is not.</h3>
              <p>An agent workflow that researches, writes, profiles and iterates on GPU kernels — built with MIT HAN Lab and shipping into production serving stacks.</p>
              <a class="h-link" href="/projects/kda">Explore KDA <span aria-hidden="true">›</span></a>
            </div>
            <div class="h-panel-art art-kda">
              <div v-for="(b, i) in KDA_BARS" :key="b.label" class="art-bar" :style="{ '--i': i, '--w': `${(b.value / 6.5) * 100}%` }">
                <span>{{ b.label }}</span>
                <i><b>{{ b.value }}×</b></i>
              </div>
              <p class="art-note">First on SOLExec Bench L1 · 0.7608</p>
            </div>
          </article>
          <article class="h-panel" :style="cardStyle(2)" v-reveal>
            <div class="h-panel-copy">
              <p class="h-step-tag">HKA · Humanize Kaggle Agent</p>
              <h3>Kaggle says so,<br />or it does not.</h3>
              <p>Agents entered in real competitions, every result audited before it is published. The gains came from disagreement between agents, not from a better model.</p>
              <a class="h-link" href="/projects/hka">Explore HKA <span aria-hidden="true">›</span></a>
            </div>
            <div class="h-panel-art art-kaggle">
              <div class="art-tiles">
                <i v-for="(top, n) in KAGGLE" :key="n" :class="{ on: top }" :style="{ '--i': n }" />
              </div>
              <p class="art-note"><b>14</b> of <b>19</b> completed competitions in the top 5%</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- 6. Where to start. -->
    <section class="h-section" aria-labelledby="start-title">
      <div class="h-wrap">
        <header class="h-head h-center" v-reveal>
          <p class="h-kicker">Humanize</p>
          <h2 id="start-title" class="h-h2">Bring the agents<br />you already pay for.</h2>
          <p class="h-lead">One runtime drives the coding-agent CLIs you already log into. It holds no API key of its own.</p>
        </header>
      </div>
      <div class="h-marquee" aria-label="Supported agents">
        <div class="h-marquee-row">
          <span v-for="n in 2" :key="n" class="h-marquee-set" :aria-hidden="n === 2">
            <b v-for="a in AGENTS" :key="a">{{ a }}</b>
          </span>
        </div>
      </div>
      <div class="h-wrap">
        <div ref="termEl" class="h-term" v-reveal>
          <div class="h-term-bar">
            <i /><i /><i />
            <span>zsh</span>
            <button class="h-copy" type="button" @click="copy">{{ copied ? 'Copied' : 'Copy install' }}</button>
          </div>
          <pre><code><template v-for="(line, i) in TERMINAL" :key="i"><template v-if="!motion || typing < 0 || i <= typing"><span class="p">$ </span>{{ typed[i] }}<span v-if="typing === i" class="h-caret" /><template v-if="i < TERMINAL.length - 1">
</template></template></template></code></pre>
        </div>
        <div class="h-features">
          <div v-for="(f, i) in FEATURES" :key="f.title" class="h-feature" v-reveal="i * 100">
            <h3>{{ f.title }}</h3>
            <p>{{ f.body }}</p>
          </div>
        </div>
        <p class="h-center h-more" v-reveal>
          <a class="h-link" :href="DOCS">Read the documentation <span aria-hidden="true">›</span></a>
        </p>
      </div>
    </section>

    <!-- 7. The latest posts. -->
    <section class="h-section h-alt" aria-labelledby="blog-title">
      <div class="h-wrap">
        <header class="h-head h-row" v-reveal>
          <div>
            <p class="h-kicker">Latest news</p>
            <h2 id="blog-title" class="h-h2">One result, one post.</h2>
          </div>
          <div class="h-rail-nav">
            <button type="button" aria-label="Previous posts" @click="slide(-1)">‹</button>
            <button type="button" aria-label="Next posts" @click="slide(1)">›</button>
          </div>
        </header>
      </div>
      <div ref="railEl" class="h-posts">
        <a v-for="(post, i) in latest" :key="post.url" :href="post.url" class="h-post" v-reveal="Math.min(i, 3) * 80">
          <span class="h-post-meta"><b>{{ post.tag }}</b>{{ post.date }}</span>
          <span class="h-post-title">{{ post.title }}</span>
          <span class="h-post-body">{{ post.description }}</span>
          <span class="h-post-more">Read ›</span>
        </a>
        <a href="/news/" class="h-post h-post-all">
          <span class="h-post-title">All news</span>
          <span class="h-post-body">Every number we have published, newest first — and an RSS feed.</span>
          <span class="h-post-more">Open the news ›</span>
        </a>
      </div>
    </section>

    <!-- 8. Built in public. -->
    <section class="h-section h-cta" aria-labelledby="cta-title">
      <div class="h-wrap h-center">
        <h2 id="cta-title" class="h-display h-gradient" v-reveal>Built in public.</h2>
        <p class="h-lead" v-reveal="100">
          Every flow is a directory of Python anyone can read, fork or beat — and every number on this page
          links to the post that says how to check it.
        </p>
        <div class="h-actions h-center" v-reveal="200">
          <a class="h-btn h-btn-primary" :href="REPO" target="_blank" rel="noreferrer">Star Humanize on GitHub</a>
          <a class="h-btn h-btn-ghost" :href="DOCS" target="_blank" rel="noreferrer">Read the docs <span aria-hidden="true">↗</span></a>
        </div>
        <p class="h-small" v-reveal="300">
          <a :href="GITHUB">github.com/humanfia</a> · <a href="https://github.com/humanfia/flowverse">flowverse</a> ·
          <a href="/news/feed.rss">RSS</a>
        </p>
      </div>
    </section>
  </div>
</template>
