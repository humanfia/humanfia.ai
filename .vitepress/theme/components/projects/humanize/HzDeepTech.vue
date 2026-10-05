<script setup lang="ts">
// Deep tech: the three subsystems under the runtime, by codename, each with how much of it can
// be used today. This was a page of its own under /research/; the anchors it had (#phobos,
// #exomyth, #coganchor) are kept here, so the redirect from it lands on the right one. The two
// sections of this page that were about the same machinery -- the trace and the anchor -- are
// folded into the subsystem they describe, and keep their old anchors too.
import { vReveal } from '../../../home/motion'
import AnchorSplit from './AnchorSplit.vue'
import CogAnchorDiagram from './CogAnchorDiagram.vue'
import ExomythDiagram from './ExomythDiagram.vue'
import PhobosDiagram from './PhobosDiagram.vue'

// Declared here, not imported: `pnpm check:docs` follows ${DOCS} only in a file that names it.
const DOCS = 'https://docs.humanfia.ai/humanize'

const INDEX = [
  { id: 'phobos', name: 'Phobos', is: 'the flow compiler', status: 'In development', shipped: false },
  { id: 'exomyth', name: 'Exomyth', is: 'the visualizer', status: 'Shipped', shipped: true },
  { id: 'coganchor', name: 'CogAnchor', is: 'remote execution', status: 'Shipped', shipped: true },
]
</script>

<template>
  <div class="dt">
    <ol class="dt-index">
      <li v-for="(c, i) in INDEX" :key="c.id" v-reveal="i * 90">
        <a :href="`#${c.id}`">
          <span class="dt-i">0{{ i + 1 }}</span>
          <b>{{ c.name }}</b>
          <span class="dt-is">{{ c.is }}</span>
          <span class="dt-status" :class="{ shipped: c.shipped }"><i />{{ c.status }}</span>
        </a>
      </li>
    </ol>

    <!-- Phobos ----------------------------------------------------------------------------- -->
    <article class="dt-ch">
      <header class="dt-ch-head" v-reveal>
        <h3 id="phobos" class="dt-name">Phobos<span>the flow compiler</span></h3>
        <p class="dt-state"><b>In development</b> — not yet in a Humanize release. Today a flow is loaded as a Python package straight from a directory, an index or a <code>git+</code> reference.</p>
      </header>
      <div class="dt-ch-body">
        <div class="dt-copy" v-reveal>
          <p class="hz-copy">
            A flow is ordinary Python: a decorator, the agents it takes and the turns it asks for.
            Phobos turns that source into an artifact that can be checked, shipped and composed —
            lowered to a flow IR (intermediate representation), verified and given a checksum,
            packed with its assets, then linked against the flows it calls.
          </p>
          <p class="hz-copy">
            A flow that calls other flows, such as <a href="/flows/aot">AOT</a> writing a flow or
            <a href="/flows/humanize1">humanize1</a> chaining gen-idea, gen-plan and RLCR, becomes
            one verified bundle with known dependencies. Without that, a flow is a directory whose
            imports are resolved at run time.
          </p>
        </div>
        <div class="dt-fig" v-reveal="120"><PhobosDiagram /></div>
      </div>
    </article>

    <!-- Exomyth ---------------------------------------------------------------------------- -->
    <article class="dt-ch">
      <span id="tracing-one-timeline" class="hz-alias" aria-hidden="true" />
      <header class="dt-ch-head" v-reveal>
        <h3 id="exomyth" class="dt-name">Exomyth<span>the visualizer</span></h3>
        <p class="dt-state shipped"><b>Shipped</b> in Humanize, as the run trace and program profiling. It began as its own repository and was merged into the runtime in April.</p>
      </header>
      <div class="dt-ch-body">
        <div class="dt-copy" v-reveal>
          <p class="hz-copy">
            Exomyth turns the logs agents leave behind into one Chrome JSON trace, which you open in
            <a href="https://ui.perfetto.dev" target="_blank" rel="noreferrer">Perfetto</a>. Each
            agent of the run is a process; its sessions and sub-agents are tracks; every turn, tool
            call, message and stretch of thinking is a slice, with the prompt and output attached.
          </p>
          <p class="hz-copy">
            Profile the run and each program an agent started joins the same clock, so a slow test
            suite shows up as a wide slice under the tool call that launched it. On an eleven-hour
            run, that is the difference between knowing what happened and believing the last
            message. The trace is built when you export a run, and nothing is uploaded.
          </p>
          <a class="hz-link" :href="`${DOCS}/user/tracing`">Tracing a run ↗</a>
        </div>
        <div class="dt-fig" v-reveal="120"><ExomythDiagram /></div>
      </div>
    </article>

    <!-- CogAnchor -------------------------------------------------------------------------- -->
    <article class="dt-ch">
      <span id="the-agent-runs-here-its-syscalls-land-there" class="hz-alias" aria-hidden="true" />
      <header class="dt-ch-head" v-reveal>
        <h3 id="coganchor" class="dt-name">CogAnchor<span>remote execution</span></h3>
        <p class="dt-state shipped"><b>Shipped</b> in Humanize, as <code>hmz.coganchor</code>. Its command line is <code>hmz internal anchor</code>.</p>
      </header>
      <p class="dt-big" v-reveal>The agent runs here. Its syscalls <span>land there.</span></p>
      <div class="dt-pair" v-reveal>
        <div class="dt-copy">
          <p class="hz-copy">
            The coding-agent CLI stays where it is installed and signed in. The files it reads and
            writes and the commands it runs — builds, tests, <code>git</code> — are on the target,
            at the target’s own paths. Point one of a flow’s environments at another machine with
            <code>-e box=ssh@[build-box]/home/me/proj</code>, and that is where the work happens.
          </p>
        </div>
        <div class="dt-copy">
          <p class="hz-copy">
            There is no plugin, no configuration and no cooperation, because the agent is never
            asked. A seccomp-filtered ptrace supervisor decides every call it makes: it opens a
            file, and gets the target’s; it runs <code>pytest</code>, and the process is the
            target’s; it reads its own credentials, and those are answered here.
          </p>
        </div>
      </div>
      <div class="dt-fig dt-wide" v-reveal="120"><AnchorSplit /></div>
      <div class="dt-ch-body">
        <div class="dt-copy" v-reveal>
          <p class="dt-sub">Three arrangements</p>
          <p class="hz-copy">
            <b>Supervised</b>, the default: the agent runs here under the supervisor, and the
            workspace is mirrored here and filled lazily. <b>Afar</b>: the agent and its supervisor
            run next to the work, and only its standard streams come back. <b>Native</b>: the
            target’s own installed CLI takes the turn.
          </p>
          <p class="hz-copy">
            The target needs nothing installed: a POSIX <code>/bin/sh</code> and Python 3.12 or
            later, with no root, no compiler and no kernel module. When two machines cannot reach
            each other, a broker introduces them and relays the connection. The fence, which limits
            what an agent’s processes may reach, is enforced on both machines.
          </p>
          <p class="dt-links">
            <a class="hz-link" :href="`${DOCS}/user/remote-execution`">Remote execution ↗</a>
            <a class="hz-link" :href="`${DOCS}/reference/remote-execution`">The reference ↗</a>
          </p>
        </div>
        <div class="dt-fig" v-reveal="120"><CogAnchorDiagram /></div>
      </div>
    </article>
  </div>
</template>

<style scoped>
/* ---- the index ------------------------------------------------------------------------- */

.dt-index {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin: 0 0 clamp(64px, 8vw, 112px);
  padding: 1px;
  list-style: none;
  background: var(--hz-line);
}
.dt-index li {
  margin: 0;
}
.dt-index a {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 22px 24px 20px;
  color: var(--hz-ink);
  background: var(--hz-bg);
  overflow: hidden;
  transition: background-color 0.3s;
}
.dt-index a::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 6px;
  background: var(--hz-red);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s var(--hz-ease);
}
.dt-index a:hover::after,
.dt-index a:focus-visible::after {
  transform: scaleX(1);
}
.dt-index a:hover {
  background: var(--hz-card);
}
.dt-i {
  font: 700 11px/1 var(--hz-mono);
  letter-spacing: 0.1em;
  color: var(--hz-red);
}
.dt-index b {
  margin-top: 26px;
  font-size: clamp(30px, 3.4vw, 48px);
  line-height: 1;
  letter-spacing: -0.045em;
  font-weight: 800;
}
.dt-is {
  margin-top: 8px;
  font-size: 15px;
  color: var(--hz-ink-2);
}
.dt-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 22px;
  font: 700 11px/1 var(--hz-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--hz-ink-3);
}
.dt-status i {
  width: 9px;
  height: 9px;
  border: 2px solid currentColor;
}
.dt-status.shipped {
  color: var(--hz-ink);
}
.dt-status.shipped i {
  border-color: var(--hz-red);
  background: var(--hz-red);
}

/* ---- a chapter ------------------------------------------------------------------------- */

.dt-ch {
  position: relative;
  padding-top: clamp(40px, 5vw, 64px);
  border-top: 2px solid var(--hz-ink);
}
.dt-ch + .dt-ch {
  margin-top: clamp(72px, 9vw, 128px);
}
.dt-ch-head {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  align-items: end;
  gap: 16px clamp(24px, 5vw, 80px);
  margin-bottom: clamp(28px, 4vw, 48px);
}
.dt-name {
  margin: 0;
  font-size: clamp(52px, 7.4vw, 112px);
  line-height: 0.86;
  letter-spacing: -0.06em;
  font-weight: 800;
  color: var(--hz-ink);
}
.dt-name span {
  display: block;
  margin-top: 16px;
  font: 700 clamp(12px, 1vw, 14px) / 1 var(--hz-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--hz-red);
}
.dt-state {
  margin: 0;
  padding: 14px 16px;
  border-left: 6px solid var(--hz-ink-3);
  font-size: 14.5px;
  line-height: 1.55;
  color: var(--hz-ink-2);
  background: var(--hz-line-2);
}
.dt-state.shipped {
  border-left-color: var(--hz-red);
}
.dt-state b {
  color: var(--hz-ink);
}
.dt-state code,
.dt-copy code {
  font-size: 0.88em;
  padding: 1px 5px;
  background: var(--hz-line-2);
  color: var(--hz-ink);
}
.dt-big {
  margin: 0 0 clamp(28px, 4vw, 48px);
  max-width: 980px;
  font-size: clamp(30px, 4vw, 56px);
  line-height: 1.02;
  letter-spacing: -0.04em;
  font-weight: 800;
  color: var(--hz-ink);
}
.dt-big span {
  color: var(--hz-red);
}
.dt-ch-body {
  display: grid;
  grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.28fr);
  gap: clamp(24px, 4vw, 64px);
  align-items: start;
}
.dt-ch-body + .dt-ch-body,
.dt-wide + .dt-ch-body {
  margin-top: clamp(40px, 5vw, 72px);
}
.dt-pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(20px, 4vw, 64px);
  margin-bottom: clamp(28px, 4vw, 48px);
}
.dt-copy a:not(.hz-link) {
  color: var(--hz-accent);
  font-weight: 600;
}
.dt-copy a:not(.hz-link):hover {
  text-decoration: underline;
}
.dt-copy .hz-link {
  margin-top: 18px;
}
.dt-sub {
  margin: 0 0 12px;
  font: 700 12px/1 var(--hz-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--hz-red);
}
.dt-links {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 22px;
  margin: 0;
}
.dt-fig {
  min-width: 0;
}
/* The diagrams were drawn for a column of text; on the ink they keep their own margins off. */
.dt-fig :deep(figure) {
  margin: 0;
}

@media (max-width: 960px) {
  .dt-index {
    grid-template-columns: minmax(0, 1fr);
  }
  .dt-index b {
    margin-top: 12px;
  }
  .dt-ch-head,
  .dt-ch-body,
  .dt-pair {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
