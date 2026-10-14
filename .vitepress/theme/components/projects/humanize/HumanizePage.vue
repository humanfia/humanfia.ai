<script setup lang="ts">
// The Humanize page: projects/humanize.md is this component and nothing else.
//
// One argument, in order: what it is (the hero, running), what it is worth (the ablation), how
// it thinks (four words, then the loop and the flows that ship), what it drives (every
// harness), what it does, what it looks like for real, the machinery under it by codename (Deep
// Tech, which used to be a page of its own), how it holds together, what it is not, what it has
// done, and how to start.
//
// Sections keep the ids the page's markdown headings used to have, so every link into it still
// lands; the Deep Tech page's own anchors (#phobos, #exomyth, #coganchor) are here too.
//
// Motion is switched on by one class, after mount, and only when the reader allows it: the
// server-rendered page, and a reader who asked for less motion, see every section at rest.
import { onMounted, ref } from 'vue'
import NumberTicker from '../../kit/NumberTicker.vue'
import ProjectTimeline from '../../kit/ProjectTimeline.vue'
import Install from '../../Install.vue'
import { prefersReducedMotion, vReveal } from '../../../home/motion'
import DemoVideo from './DemoVideo.vue'
import HzAblation from './HzAblation.vue'
import HzDeepTech from './HzDeepTech.vue'
import HzFlows from './HzFlows.vue'
import HzHarnesses from './HzHarnesses.vue'
import HzHero from './HzHero.vue'
import HzModel from './HzModel.vue'
import LayerStack from './LayerStack.vue'
import TerminalReel from './TerminalReel.vue'
import { FEATURES, REPO, STATS } from './data'
import './humanize.css'

// Declared here, not imported: `pnpm check:docs` follows ${DOCS} only in a file that names it.
const DOCS = 'https://docs.humanfia.ai/humanize'

const motion = ref(false)
onMounted(() => (motion.value = !prefersReducedMotion()))

const NOT = [
  {
    title: 'A model',
    body: 'We do not train, serve or resell models.',
  },
  {
    title: 'A wrapper around one vendor',
    body: 'It drives your CLI under your own subscription, holds a credential only if you give it one, and bills each turn to the account you named.',
  },
  {
    title: 'A coding agent',
    body: 'It takes turns on claude, codex and others; a new coding agent becomes another backend.',
  },
]

const TIMELINE = [
  { url: '/news/2026-03-01-gem5-scons-to-cmake', metric: '567 files' },
  { url: '/blog/2026-07-08-model-tool-flow', metric: '2 → 50' },
  { url: '/news/2026-07-31-qcode-discovery', metric: '17,520 defs' },
  { url: '/news/2026-08-11-programbench', metric: '3.5%' },
  { url: '/blog/2026-08-17-four-layers-and-a-referee', metric: '4 layers' },
  { url: '/blog/2026-08-17-the-review-is-the-next-prompt', metric: 'RLAR' },
  { url: '/blog/2026-09-27-kda-for-kda', metric: '4 → 47' },
]

const NEXT = [
  { kicker: 'Docs', title: 'The documentation', body: 'Install, quickstart and every feature.', href: `${DOCS}/` },
  { kicker: 'Reference', title: 'The CLI reference', body: 'Every command, key, flag and Python call.', href: `${DOCS}/reference/cli` },
  { kicker: 'Source', title: 'humanfia/humanize', body: 'Apache-2.0. Issues and pull requests reach us fastest.', href: REPO },
]
</script>

<template>
  <div class="hz-root" :class="{ 'hz-motion': motion }">
    <HzHero :motion="motion" />

    <!-- The numbers --------------------------------------------------------------------- -->
    <section class="hz-stats" aria-label="Humanize in four numbers">
      <div class="hz-wrap">
        <ul>
          <li v-for="(s, i) in STATS" :key="s.kicker" v-reveal="i * 80">
            <component :is="s.href ? 'a' : 'div'" :href="s.href" class="hz-stat">
              <b v-if="s.value !== undefined"><NumberTicker :value="s.value" /></b>
              <b v-else class="word">{{ s.display }}</b>
              <span class="k">{{ s.kicker }}</span>
              <span class="t">{{ s.text }}</span>
            </component>
          </li>
        </ul>
      </div>
    </section>

    <!-- 01 Same model, with and without a flow ------------------------------------------ -->
    <section id="what-the-loop-is-worth" class="hz-band hz-ink">
      <div class="hz-wrap">
        <div class="hz-proof">
          <div class="hz-proof-num" v-reveal>
            <p class="hz-num"><b>01</b> Same model, with and without a flow</p>
            <p class="hz-big"><NumberTicker :value="47" :from="1" :duration="1800" /><small>/50</small></p>
            <p class="hz-lead">
              PutnamBench problems Kimi-K3 solved inside a Humanize flow, against <b>4</b> through
              its own coding CLI and <b>1</b> through the raw API.
            </p>
          </div>
          <div class="hz-proof-chart" v-reveal="120">
            <HzAblation />
          </div>
        </div>
      </div>
    </section>

    <!-- 02 Agent, session, turn, env ---------------------------------------------------- -->
    <section id="agent-session-turn-env" class="hz-band">
      <span id="one-flow-many-agents-one-trace" class="hz-alias" aria-hidden="true" />
      <div class="hz-wrap">
        <header class="hz-head" v-reveal>
          <p class="hz-num"><b>02</b> The model</p>
          <h2 class="hz-h2">Four concepts: <span class="hz-accent">agent, session, turn and env.</span></h2>
          <p class="hz-lead">
            A flow is Python that sets which agents run, what each is asked, in what order, and when
            to stop.
          </p>
        </header>
        <div v-reveal="80"><HzModel /></div>
        <p class="hz-copy hz-aside" v-reveal>
          <b>Unsupported requests fail explicitly.</b> A <code>litellm</code> turn given an env,
          or a harness asked to change machines when it cannot, raises an error.
        </p>
      </div>
    </section>

    <!-- 03 The flow loop ---------------------------------------------------------------- -->
    <section id="the-flow-loop" class="hz-band alt">
      <div class="hz-wrap">
        <header class="hz-head" v-reveal>
          <p class="hz-num"><b>03</b> The flow loop</p>
          <h2 class="hz-h2">A flow is a Python loop; the runtime adds <span class="hz-accent">a budget, a trace and a journal.</span></h2>
          <p class="hz-lead">
            Below, the RLAR flow runs turn by turn.
          </p>
        </header>
        <div class="hz-player" v-reveal="80">
          <FlowPlayer flow="rlar" />
        </div>
      </div>
    </section>

    <!-- 04 The flows it runs ------------------------------------------------------------ -->
    <section id="the-flows-it-runs" class="hz-band alt tight">
      <div class="hz-wrap">
        <header class="hz-head" v-reveal>
          <p class="hz-num"><b>04</b> The flows it runs</p>
          <h2 class="hz-h2">Five loop shapes ship with the runtime; <span class="hz-accent">the rest come from the flowverse.</span></h2>
        </header>
        <HzFlows />
        <div class="hz-verse" v-reveal>
          <p class="hz-copy">
            More flows are listed in a <b>flowverse</b>, a git index that pins each flow version to
            a commit. <a href="/projects/flowbench">FlowBench</a> compares them; we drop our own when
            another scores better.
          </p>
          <a class="hz-link" href="https://github.com/humanfia/flowverse" target="_blank" rel="noreferrer">humanfia/flowverse ↗</a>
        </div>
      </div>
    </section>

    <!-- 05 Every harness ---------------------------------------------------------------- -->
    <section id="every-harness" class="hz-band">
      <div class="hz-wrap">
        <header class="hz-head" v-reveal>
          <p class="hz-num"><b>05</b> Every harness</p>
          <h2 class="hz-h2">Humanize drives twelve coding-agent CLIs, <span class="hz-accent">any ACP agent and models through LiteLLM.</span></h2>
          <p class="hz-lead">
            <code>-a</code> names the harness. Each CLI is driven through its own print mode, app
            server, RPC mode, daemon or SDK.
          </p>
        </header>
        <div v-reveal="80"><HzHarnesses /></div>
        <p class="hz-copy hz-aside" v-reveal>
          <code>litellm</code> takes a <a href="https://github.com/BerriAI/litellm" target="_blank" rel="noreferrer">LiteLLM</a>
          model string, such as <code>-a writer=litellm@acct/openai/gpt-5</code>, signs in with a
          vendor key, a compatible gateway, Bedrock, Vertex or Azure, and is priced and traced with
          the rest of the run. Install the extra <code>hmz[litellm]</code>.
        </p>
      </div>
    </section>

    <!-- 06 What it does ----------------------------------------------------------------- -->
    <section id="what-it-does" class="hz-band alt">
      <div class="hz-wrap">
        <header class="hz-head" v-reveal>
          <p class="hz-num"><b>06</b> What it does</p>
          <h2 class="hz-h2">Eleven things the runtime handles <span class="hz-accent">so a flow does not have to.</span></h2>
          <p class="hz-lead">
            <a class="hz-link" :href="`${DOCS}/features/`">Every feature, one picture each ↗</a>
          </p>
        </header>
        <ol class="hz-feats">
          <li v-for="(f, i) in FEATURES" :key="f.title" v-reveal="(i % 4) * 60">
            <component :is="f.href ? 'a' : 'div'" :href="f.href" class="hz-feat" :class="{ lead: i === 0 }">
              <span class="n">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="k">{{ f.kicker }}</span>
              <h3>{{ f.title }}</h3>
              <p v-if="f.body">{{ f.body }}</p>
              <span v-if="f.href" class="go" aria-hidden="true">→</span>
            </component>
          </li>
        </ol>
      </div>
    </section>

    <!-- 07 Demos ---------------------------------------------------------------------------- -->
    <section id="the-real-thing-recorded" class="hz-band">
      <div class="hz-wrap">
        <header class="hz-head" v-reveal>
          <p class="hz-num"><b>07</b> Demos</p>
          <h2 class="hz-h2">Screen recordings of <code>hmz</code> <span class="hz-accent">and a Ralph loop.</span></h2>
          <p class="hz-lead">
            <code>hmz</code> with a stand-in coding agent, then a Ralph loop run from the command
            line and from inside <code>hmz</code>.
          </p>
        </header>
        <div v-reveal="80"><TerminalReel /></div>
        <div class="hz-videos">
          <div v-reveal>
            <DemoVideo
              src="/media/ralph-loop-cli.mp4"
              poster="/media/ralph-loop-cli.webp"
              title="A Ralph loop started with hmz exec: two fresh rounds, each picking up from the repository"
              caption="hmz exec -f ralph_loop: round 1 adds dark-mode tokens; round 2 starts fresh and finishes TASK.md."
            />
          </div>
          <div v-reveal="120">
            <DemoVideo
              src="/media/ralph-loop-tui.mp4"
              poster="/media/ralph-loop-tui.webp"
              title="The same Ralph loop from inside hmz: /flow, choose ralph_loop, set up the agent, save, then the task"
              caption="The same loop from inside hmz with /flow. Each round is a fresh session."
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 08 Deep tech -------------------------------------------------------------------- -->
    <section id="deep-tech" class="hz-band hz-ink">
      <div class="hz-wrap">
        <header class="hz-head" v-reveal>
          <p class="hz-num"><b>08</b> Deep tech</p>
          <h2 class="hz-h2">Three subsystems: a flow compiler, a run tracer <span class="hz-accent">and remote execution.</span></h2>
        </header>
        <HzDeepTech />
      </div>
    </section>

    <!-- 09 Seventeen layers ------------------------------------------------------------- -->
    <section id="seventeen-layers-and-a-test-that-holds-them" class="hz-band">
      <div class="hz-wrap">
        <header class="hz-head" v-reveal>
          <p class="hz-num"><b>09</b> Architecture</p>
          <h2 class="hz-h2">A test enforces which of the <span class="hz-accent">seventeen layers may import which.</span></h2>
          <p class="hz-lead">
            Point at a layer to see what it holds.
          </p>
        </header>
        <div v-reveal="80"><LayerStack /></div>
      </div>
    </section>

    <!-- 10 What it is not --------------------------------------------------------------- -->
    <section id="what-it-is-not" class="hz-band alt">
      <div class="hz-wrap">
        <header class="hz-head solo" v-reveal>
          <p class="hz-num"><b>10</b> What it is not</p>
        </header>
        <ul class="hz-not">
          <li v-for="(n, i) in NOT" :key="n.title" v-reveal="i * 90">
            <h3><span>{{ n.title }}</span></h3>
            <p>{{ n.body }}</p>
          </li>
        </ul>
        <aside class="hz-warn" v-reveal>
          <b>Permissions</b>
          <p>
            Humanize runs every agent with approvals bypassed, limited only by what the flow
            declares for each role. Read
            <a :href="`${DOCS}/user/security`">Security ↗</a> before using it on a repository you
            care about.
          </p>
        </aside>
      </div>
    </section>

    <!-- 11 Results ---------------------------------------------------------------------- -->
    <section id="results-as-they-came-in" class="hz-band">
      <div class="hz-wrap">
        <header class="hz-head solo" v-reveal>
          <p class="hz-num"><b>11</b> Results, as they came in</p>
        </header>
        <div class="hz-timeline" v-reveal="80">
          <ProjectTimeline
            kicker="Humanize · write-ups"
            label="Humanize write-ups from March to September 2026: the gem5 build port, the model, tool and flow comparison, QCode Discovery, ProgramBench, from a review loop to four layers and a referee, the review is the next prompt, and the KDA² ablation."
            :entries="TIMELINE"
          />
        </div>
      </div>
    </section>

    <!-- 12 Get started ------------------------------------------------------------------ -->
    <section id="get-started" class="hz-band hz-ink hz-start">
      <span id="where-to-go-next" class="hz-alias" aria-hidden="true" />
      <div class="hz-wrap">
        <header class="hz-head" v-reveal>
          <p class="hz-num"><b>12</b> Get started</p>
          <h2 class="hz-h2">Install with one command and run a flow <span class="hz-accent">on the CLI you already use.</span></h2>
        </header>
        <div v-reveal="80"><Install /></div>
        <ul class="hz-next">
          <li v-for="(n, i) in NEXT" :key="n.title" v-reveal="i * 80">
            <a :href="n.href" target="_blank" rel="noreferrer">
              <span class="k">{{ n.kicker }}</span>
              <b>{{ n.title }}</b>
              <span class="t">{{ n.body }}</span>
              <span class="go" aria-hidden="true">↗</span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ---- the numbers ----------------------------------------------------------------------- */

.hz-stats ul {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 2px solid var(--hz-ink);
  border-bottom: 1px solid var(--hz-line);
}
.hz-stats li {
  margin: 0;
}
.hz-stats li + li {
  border-left: 1px solid var(--hz-line);
}
.hz-stat {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 28px 24px 30px;
  color: inherit;
  transition: background-color 0.3s;
}
a.hz-stat:hover {
  background: var(--hz-line-2);
}
.hz-stat b {
  font-size: clamp(48px, 5.4vw, 80px);
  line-height: 0.95;
  letter-spacing: -0.05em;
  font-weight: 800;
  color: var(--hz-ink);
  font-variant-numeric: tabular-nums;
}
.hz-stat b.word {
  font-family: var(--hz-mono);
  font-size: clamp(34px, 3.6vw, 54px);
  letter-spacing: -0.04em;
  color: var(--hf-cyan-deep);
  line-height: 1.32;
}
.hz-stat .k {
  margin-top: 16px;
  font: 700 11.5px/1.3 var(--hz-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--hz-ink);
}
.hz-stat .t {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--hz-ink-3);
}

/* ---- 01 the proof ---------------------------------------------------------------------- */

.hz-proof {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: clamp(32px, 6vw, 96px);
  align-items: center;
}
.hz-proof .hz-num {
  margin-bottom: 28px;
}
.hz-big {
  display: flex;
  align-items: baseline;
  margin: 0 0 24px;
  font-size: clamp(120px, 17vw, 260px);
  line-height: 0.8;
  letter-spacing: -0.07em;
  font-weight: 800;
  color: var(--hf-cyan-deep);
  font-variant-numeric: tabular-nums;
}
.hz-big small {
  margin-left: 0.06em;
  font-size: 0.3em;
  letter-spacing: -0.04em;
  color: var(--hz-ink-3);
}
.hz-proof .hz-lead b {
  color: var(--hz-ink);
}

/* ---- 03 the player --------------------------------------------------------------------- */

.hz-player {
  box-shadow: 12px 12px 0 0 var(--hz-ink);
}
.hz-player :deep(figure) {
  margin: 0;
}

/* ---- 04 the flowverse ------------------------------------------------------------------ */

.hz-verse {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 16px 48px;
  margin-top: clamp(36px, 4vw, 56px);
  padding-top: 28px;
  border-top: 1px solid var(--hz-line);
}
.hz-verse .hz-copy {
  max-width: 820px;
}
.hz-root .hz-copy a {
  color: var(--hz-accent);
  font-weight: 600;
}
.hz-root .hz-copy a:hover,
.hz-warn a:hover {
  text-decoration: underline;
}

/* ---- 02 and 05: one short note under a figure ----------------------------------------- */

.hz-aside {
  max-width: 880px;
  margin-top: 28px !important;
}

/* ---- 06 the features ------------------------------------------------------------------- */

.hz-feats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  padding: 1px;
  list-style: none;
  background: var(--hz-line);
}
.hz-feats li {
  margin: 0;
}
.hz-feats li:first-child {
  grid-column: span 2;
}
.hz-feat {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 220px;
  padding: 22px 22px 24px;
  color: inherit;
  background: var(--hz-bg-alt);
  transition: background-color 0.3s;
}
.hz-feat::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 4px;
  background: var(--hz-mark);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s var(--hz-ease);
}
.hz-feat:hover {
  background: var(--hz-card);
}
.hz-feat:hover::before {
  transform: scaleX(1);
}
.hz-feat .n {
  font: 700 11px/1 var(--hz-mono);
  color: var(--hz-ink-3);
}
.hz-feat .k {
  margin-top: 26px;
  font: 700 11px/1.3 var(--hz-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--hz-accent);
}
.hz-feat h3 {
  margin: 8px 0 0;
  font-size: 20px;
  line-height: 1.18;
  letter-spacing: -0.025em;
  font-weight: 800;
  color: var(--hz-ink);
}
.hz-feat p {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--hz-ink-2);
}
.hz-feat .go {
  position: absolute;
  top: 18px;
  right: 20px;
  font-size: 18px;
  color: var(--hz-ink-3);
  transition: transform 0.35s var(--hz-ease), color 0.3s;
}
.hz-feat:hover .go {
  transform: translateX(4px);
  color: var(--hf-cyan-deep);
}
.hz-feat.lead {
  color: var(--hz-on-ink);
  background: var(--hz-ink);
}
.hz-feat.lead h3 {
  max-width: 460px;
  font-size: clamp(26px, 2.6vw, 36px);
  line-height: 1.05;
  letter-spacing: -0.035em;
  color: var(--hz-on-ink);
}
.hz-feat.lead p {
  max-width: 520px;
  font-size: 15px;
  color: color-mix(in srgb, var(--hz-on-ink) 75%, transparent);
}
.hz-feat.lead .k,
.hz-feat.lead .go {
  color: #76b900;
}
.hz-feat.lead:hover {
  background: var(--hz-ink);
}

/* ---- 07 the videos --------------------------------------------------------------------- */

.hz-videos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  margin-top: 24px;
}
.hz-videos :deep(.demo) {
  margin: 0;
}

/* ---- 10 what it is not ----------------------------------------------------------------- */

.hz-not {
  margin: 0;
  padding: 0;
  list-style: none;
}
.hz-not li {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  align-items: baseline;
  gap: 12px clamp(24px, 5vw, 80px);
  padding: clamp(24px, 3vw, 40px) 0;
  border-bottom: 1px solid var(--hz-line);
}
.hz-not h3 {
  margin: 0;
  font-size: clamp(32px, 4.4vw, 64px);
  line-height: 1;
  letter-spacing: -0.045em;
  font-weight: 800;
  color: var(--hz-ink);
}
/* The accent strike, drawn across the claim when it arrives. */
.hz-not h3 span {
  background: linear-gradient(var(--hz-mark), var(--hz-mark)) no-repeat 0 58% / 100% 0.12em;
}
.hz-motion .hz-not h3 span {
  background-size: 0% 0.12em;
  transition: background-size 0.9s var(--hz-ease) 0.35s;
}
.hz-motion .hz-not li.rv-in h3 span {
  background-size: 100% 0.12em;
}
.hz-not p {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  color: var(--hz-ink-2);
}
.hz-warn {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px 28px;
  margin-top: clamp(36px, 4vw, 56px);
  padding: 22px 26px;
  border-left: 8px solid var(--hz-mark);
  background: var(--hz-card);
}
.hz-warn b {
  font: 700 12px/1.6 var(--hz-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--hz-accent);
}
.hz-warn p {
  margin: 0;
  font-size: 15.5px;
  line-height: 1.6;
  color: var(--hz-ink);
}
.hz-warn a {
  font-weight: 700;
  color: var(--hz-accent);
}

/* ---- 11 the timeline ------------------------------------------------------------------- */

.hz-timeline :deep(figure) {
  margin: 0;
}

/* ---- 12 start -------------------------------------------------------------------------- */

.hz-start :deep(.install-main),
.hz-start :deep(.install-steps li) {
  border-radius: 0;
}
.hz-start :deep(.install-term),
.hz-start :deep(.install-tab),
.hz-start :deep(.install-copy) {
  border-radius: 2px;
}
.hz-next {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin: clamp(48px, 6vw, 80px) 0 0;
  padding: 1px;
  list-style: none;
  background: var(--hz-line);
}
.hz-next li {
  margin: 0;
}
.hz-next a {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px 26px 26px;
  color: inherit;
  background: var(--hz-bg);
  transition: background-color 0.3s;
}
.hz-next a:hover {
  background: var(--hz-card);
}
.hz-next .k {
  font: 700 11px/1.3 var(--hz-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--hz-accent);
}
.hz-next b {
  margin-top: 14px;
  font-size: clamp(22px, 2vw, 28px);
  letter-spacing: -0.03em;
  font-weight: 800;
  color: var(--hz-ink);
}
.hz-next .t {
  margin-top: 8px;
  font-size: 14.5px;
  line-height: 1.55;
  color: var(--hz-ink-2);
}
.hz-next .go {
  position: absolute;
  top: 22px;
  right: 24px;
  font-size: 20px;
  color: var(--hz-ink-3);
  transition: transform 0.35s var(--hz-ease), color 0.3s;
}
.hz-next a:hover .go {
  transform: translate(3px, -3px);
  color: var(--hf-cyan-deep);
}

/* ---- narrow ---------------------------------------------------------------------------- */

@media (max-width: 1100px) {
  .hz-feats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 960px) {
  .hz-stats ul {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .hz-stats li:nth-child(3) {
    border-left: 0;
  }
  .hz-stats li:nth-child(n + 3) {
    border-top: 1px solid var(--hz-line);
  }
  .hz-proof,
  .hz-not li,
  .hz-videos {
    grid-template-columns: minmax(0, 1fr);
  }
  .hz-next {
    grid-template-columns: minmax(0, 1fr);
  }
  .hz-verse {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 600px) {
  .hz-feats {
    grid-template-columns: minmax(0, 1fr);
  }
  .hz-feats li:first-child {
    grid-column: auto;
  }
  .hz-feat {
    min-height: 0;
  }
  .hz-stat {
    padding: 22px 16px 24px;
  }
  .hz-warn {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
