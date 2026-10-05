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
import { DOCS, FEATURES, REPO, STATS } from './data'
import './humanize.css'

const motion = ref(false)
onMounted(() => (motion.value = !prefersReducedMotion()))

const NOT = [
  {
    title: 'Not a model.',
    body: 'We do not train one, serve one or resell one.',
  },
  {
    title: 'Not a wrapper around one vendor.',
    body: 'Humanize drives the CLI you already log into, under your own subscription. It holds a credential only when you hand it one, and every turn is billed to the account you named. The frontier moves every few weeks; a wrapper around one vendor is the least durable thing we could build.',
  },
  {
    title: 'Not a coding agent.',
    body: 'It does not replace claude or codex — it takes turns on them. If a better one ships next month, it is a name in a list.',
  },
]

const TIMELINE = [
  { url: '/news/2026-03-01-gem5-scons-to-cmake', metric: '567 files' },
  { url: '/blog/2026-07-08-model-tool-flow', metric: '2 → 50' },
  { url: '/blog/2026-07-20-humanfia-launch', metric: 'Launch' },
  { url: '/news/2026-07-31-qcode-discovery', metric: '17,520 defs' },
  { url: '/news/2026-08-11-programbench', metric: '3.5%' },
  { url: '/blog/2026-08-17-four-layers-and-a-referee', metric: '4 layers' },
  { url: '/blog/2026-08-17-the-review-is-the-next-prompt', metric: 'RLAR' },
  { url: '/blog/2026-09-27-kda-for-kda', metric: '4 → 47' },
]

const NEXT = [
  { kicker: 'All of it', title: 'The documentation', body: 'Install, quickstart, and every feature.', href: `${DOCS}/` },
  { kicker: 'Look it up', title: 'The CLI reference', body: 'Every command, key, flag and Python call, in one place.', href: `${DOCS}/reference/cli` },
  { kicker: 'Read it', title: 'humanfia/humanize', body: 'The source, Apache-2.0. Issues and pull requests are the fastest way to reach us.', href: REPO },
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

    <!-- 01 What the loop is worth ------------------------------------------------------- -->
    <section id="what-the-loop-is-worth" class="hz-band hz-ink">
      <div class="hz-wrap">
        <div class="hz-proof">
          <div class="hz-proof-num" v-reveal>
            <p class="hz-num"><b>01</b> What the loop is worth</p>
            <p class="hz-big"><NumberTicker :value="47" :from="1" :duration="1800" /><small>/50</small></p>
            <p class="hz-lead">
              PutnamBench problems Kimi-K3 solved inside a Humanize flow — against <b>4</b> through
              its own coding CLI and <b>1</b> through the raw API. Same model, same problems.
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
          <h2 class="hz-h2">Agent, session, turn, <span class="hz-red">env.</span></h2>
          <p class="hz-lead">
            A flow is a directory of Python that says which agents it drives, what each is asked, in
            what order, and when to stop. The runtime opens the sessions, takes the turns, puts the
            work where it should land, and records it. Four words carry the whole model.
          </p>
        </header>
        <div v-reveal="80"><HzModel /></div>
        <div class="hz-notes" v-reveal>
          <p class="hz-copy">
            An <b>agent</b> is settings, not a conversation. A <b>session</b> is only history. The
            <b>env</b> belongs to the turn, not the session — so one conversation can carry on from
            one machine to the next.
          </p>
          <p class="hz-copy">
            <b>The refusals are part of the model too.</b> A harness that cannot move between
            machines says so on the turn that asks it to, rather than quietly running somewhere
            else; a <code>litellm</code> turn given an env is refused with a clear error.
          </p>
        </div>
      </div>
    </section>

    <!-- 03 The flow loop ---------------------------------------------------------------- -->
    <section id="the-flow-loop" class="hz-band alt">
      <div class="hz-wrap">
        <header class="hz-head" v-reveal>
          <p class="hz-num"><b>03</b> The flow loop</p>
          <h2 class="hz-h2">A loop is a loop. <span class="hz-red">It runs for a week.</span></h2>
          <p class="hz-lead">
            A flow is ordinary Python: a <code>while</code>, a turn, a look at what came back, and a
            decision. The runtime adds what a loop like that needs — a budget that stops it, a trace
            of every turn, and a journal it can be picked up from. This is RLAR, turn by turn.
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
          <h2 class="hz-h2">The runtime runs flows. <span class="hz-red">It does not decide what a good one is.</span></h2>
          <p class="hz-lead">
            That split is deliberate, and everything else at Humanfia is built on it. The ones that
            ship with the runtime, plus the flowverse it fetches, cover most of the loop shapes the
            field has converged on.
          </p>
        </header>
        <HzFlows />
        <div class="hz-verse" v-reveal>
          <p class="hz-copy">
            The rest are listed in a <b>flowverse</b> — an index in git that pins each version of a
            flow to a commit of the repository it lives in, which anybody can read, fork, publish to
            or beat. Comparing one method against another is a flag rather than a reimplementation.
            Which is actually better is <a href="/projects/flowbench">FlowBench</a>’s question, and
            the answer is allowed to delete ours.
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
          <h2 class="hz-h2">Twelve CLIs. One protocol. <span class="hz-red">And a model, called directly.</span></h2>
          <p class="hz-lead">
            A harness is what <code>-a</code> names. Each CLI is driven through whatever it actually
            offers — a print mode, an app server, an RPC mode, a daemon or an SDK. Point at one.
          </p>
        </header>
        <div v-reveal="80"><HzHarnesses /></div>
        <p class="hz-copy hz-aside" v-reveal>
          <code>litellm</code> takes a <a href="https://github.com/BerriAI/litellm" target="_blank" rel="noreferrer">LiteLLM</a>
          model string, as in <code>-a writer=litellm@acct/openai/gpt-5</code>, and signs in through
          Humanize’s accounts like any other harness: a vendor key, an OpenAI- or Anthropic-compatible
          gateway, or Bedrock, Vertex or Azure. Usage goes into the same tally, so a flow can mix a
          model call with coding agents and still be priced and traced as one run. It ships as an
          optional extra, <code>hmz[litellm]</code>.
        </p>
      </div>
    </section>

    <!-- 06 What it does ----------------------------------------------------------------- -->
    <section id="what-it-does" class="hz-band alt">
      <div class="hz-wrap">
        <header class="hz-head" v-reveal>
          <p class="hz-num"><b>06</b> What it does</p>
          <h2 class="hz-h2">Eleven features, <span class="hz-red">one line each.</span></h2>
          <p class="hz-lead">
            Hooks, capabilities, surfaces and the daemon are in there too.
            <a class="hz-link" :href="`${DOCS}/features/`">Every feature, one picture each ↗</a>
          </p>
        </header>
        <ol class="hz-feats">
          <li v-for="(f, i) in FEATURES" :key="f.title" v-reveal="(i % 4) * 60">
            <component :is="f.href ? 'a' : 'div'" :href="f.href" class="hz-feat" :class="{ lead: i === 0 }">
              <span class="n">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="k">{{ f.kicker }}</span>
              <h3>{{ f.title }}</h3>
              <p>{{ f.body }}</p>
              <span v-if="f.href" class="go" aria-hidden="true">→</span>
            </component>
          </li>
        </ol>
      </div>
    </section>

    <!-- 07 The real thing, recorded ----------------------------------------------------- -->
    <section id="the-real-thing-recorded" class="hz-band">
      <div class="hz-wrap">
        <header class="hz-head" v-reveal>
          <p class="hz-num"><b>07</b> The real thing, recorded</p>
          <h2 class="hz-h2">Not drawn. <span class="hz-red">Recorded.</span></h2>
          <p class="hz-lead">
            From <code>hmz</code> itself, in a container with a stand-in coding agent in it. Then two
            takes from the talk where we introduced it: the same Ralph loop from the command line,
            and from inside <code>hmz</code> with <code>/flow</code>.
          </p>
        </header>
        <div v-reveal="80"><TerminalReel /></div>
        <div class="hz-videos">
          <div v-reveal>
            <DemoVideo
              src="/media/ralph-loop-cli.mp4"
              poster="/media/ralph-loop-cli.webp"
              title="A Ralph loop started with hmz exec: two fresh rounds, each picking up from the repository"
              caption="hmz exec -f ralph_loop with a budget file and one agent: round 1 maps the palette and adds dark-mode tokens, round 2 starts fresh, wires the toggle and finishes TASK.md."
            />
          </div>
          <div v-reveal="120">
            <DemoVideo
              src="/media/ralph-loop-tui.mp4"
              poster="/media/ralph-loop-tui.webp"
              title="The same Ralph loop from inside hmz: /flow, choose ralph_loop, set up the agent, save, then the task"
              caption="Inside hmz: /flow, choose ralph_loop, set up its one agent, save, then say what to do. Each round is a fresh session with its own codename."
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
          <h2 class="hz-h2">The engine, <span class="hz-red">by codename.</span></h2>
          <p class="hz-lead">
            Three subsystems under the runtime: the machinery that lets one flow run for a day, on
            any machine, and be read afterwards. Each says how much of it you can use today.
          </p>
        </header>
        <HzDeepTech />
      </div>
    </section>

    <!-- 09 Seventeen layers ------------------------------------------------------------- -->
    <section id="seventeen-layers-and-a-test-that-holds-them" class="hz-band">
      <div class="hz-wrap">
        <header class="hz-head" v-reveal>
          <p class="hz-num"><b>09</b> Architecture</p>
          <h2 class="hz-h2">Seventeen layers, <span class="hz-red">and a test that holds them.</span></h2>
          <p class="hz-lead">
            The runtime drives twelve different CLIs without becoming twelve different products
            because the layering is a rule rather than an intention. Point at a layer.
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
            Humanize runs every agent with approvals bypassed: nothing an agent does is put to you
            first. What holds it back is what its flow declares, role by role. Read
            <a :href="`${DOCS}/user/security`">Security ↗</a> before pointing one at a repository
            you care about.
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
            label="Humanize write-ups from March to September 2026: the gem5 build port, the model, tool and flow comparison, the launch, QCode Discovery, ProgramBench, the four layers and a referee, the review is the next prompt, and the KDA² ablation."
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
          <h2 class="hz-h2">One line in. <span class="hz-red">A flow running.</span></h2>
          <p class="hz-lead">
            No account to sign up for. It drives the coding-agent CLI you already log into, under
            your own subscription; any one of twelve will do.
          </p>
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
  color: var(--hz-red);
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
  color: var(--hz-red);
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

/* ---- 02 notes -------------------------------------------------------------------------- */

.hz-notes .hz-copy {
  margin: 0;
}
.hz-notes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(20px, 4vw, 64px);
  margin-top: clamp(40px, 5vw, 64px);
  padding-top: 28px;
  border-top: 1px solid var(--hz-line);
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

/* ---- 05 litellm, said once ------------------------------------------------------------- */

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
  background: var(--hz-red);
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
  color: var(--hz-red);
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
  color: #ff5a43;
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
/* The red strike, drawn across the claim when it arrives. */
.hz-not h3 span {
  background: linear-gradient(var(--hz-red), var(--hz-red)) no-repeat 0 58% / 100% 0.12em;
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
  border-left: 8px solid var(--hz-red);
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
  color: var(--hz-red);
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
  .hz-notes,
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
