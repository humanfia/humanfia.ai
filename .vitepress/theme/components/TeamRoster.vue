<script setup lang="ts">
// The team, by project.
//
// Two lists rather than one alphabetical grid of faces: the same person shows up under three
// projects because they worked on three projects, and which project someone leads is the fact
// a reader actually came here for. Within a project the lead is first and the rest are in
// order of what they contributed to it.
//
// Faces use the person's public profile image. GitHub avatars are addressed by numeric id --
// the one handle that survives someone renaming themselves -- while people without a public
// GitHub account can provide a profile and avatar directly.

interface Person {
  /** GitHub login, when that is their public profile. */
  gh?: string
  /** The numeric account id, which is what the avatar CDN is addressed with. */
  id?: number
  name: string
  /** Where they are, when they have said so publicly. Left out rather than guessed. */
  at?: string
  href?: string
  profileLabel?: string
  avatarUrl?: string
}

const PEOPLE: Record<string, Person> = {
  SihaoLiu: { gh: 'SihaoLiu', id: 40861817, name: 'Sihao Liu', at: 'NVIDIA Research' },
  Lyken17: { gh: 'Lyken17', id: 7783214, name: 'Ligeng Zhu', at: 'NVIDIA Research' },
  futrime: { gh: 'futrime', id: 35801754, name: 'Zijian Zhang', at: 'Tsinghua · NVIDIA Research' },
  DongyunZou: { gh: 'DongyunZou', id: 122959524, name: 'Dongyun Zou', at: 'Tsinghua University' },
  ubospica: { gh: 'ubospica', id: 32952380, name: 'Yixin Dong', at: 'Carnegie Mellon University' },
  antoinegg1: { gh: 'antoinegg1', id: 78747324, name: 'Changye Li', at: 'Tsinghua University' },
  ZhengyangZhang06: { gh: 'ZhengyangZhang06', id: 165369232, name: 'Zhengyang Zhang', at: 'Tsinghua University' },
  BBuf: { gh: 'BBuf', id: 35585791, name: 'Xiaoyu Zhang', at: 'RadixArk' },
  smoothsmooth: { gh: 'smoothsmooth', id: 18200776, name: 'Yahui Cui', at: 'NVIDIA' },
  hongzhoulin89: { gh: 'hongzhoulin89', id: 29802555, name: 'Hongzhou Lin', at: 'Amazon AGI' },
  JuiHuiChung: { gh: 'unixtomato', id: 72721270, name: 'Jui-Hui Chung', at: 'Princeton University' },
  menik1126: { gh: 'menik1126', id: 49935767, name: 'Jing Xiong' },
  dongz9: { gh: 'dongz9', id: 627593, name: 'Dong Zhou', at: 'Carnegie Mellon University' },
  crmsndu: { gh: 'crmsndu', id: 74142908, name: 'Zheng Du', at: 'Georgia Tech' },
  JerryGJX: { gh: 'JerryGJX', id: 92502485, name: 'Junxian Guo', at: 'MIT · NVIDIA Research' },
  Waterpine: { gh: 'Waterpine', id: 29000790, name: 'Song Bian', at: 'NVIDIA Research' },
  shinan6: { gh: 'shinan6', id: 24783784, name: 'Shinan Liu', at: 'University of Chicago' },
  zgdllt: { gh: 'zgdllt', id: 118046841, name: 'Menghan Li', at: 'Tsinghua University' },
  apostle715: { gh: 'apostle715', id: 232143882, name: 'Yitong Liu', at: 'Tsinghua University' },
}

/**
 * The two the whole thing starts with, and they are two different acts.
 *
 * Ligeng Zhu is here and nowhere else. He worked on every project below, and a name repeated
 * under all six of them reads as somebody who helped out on each rather than as the person who
 * assembled the group -- which is the fact this section exists to state.
 */
const FOUNDING = [
  {
    who: 'SihaoLiu',
    role: 'Proposed Humanize',
    body:
      'Wrote the first Humanize at UCLA PolyArch — the RLCR loop, out of his own GAAC project — and '
      + 'with it the rule the rest of this site is built on: the agent that wrote the code is not the '
      + 'agent that says whether it is any good. Sihao Liu is now a Research Scientist in the '
      + 'Architecture Research Group at Nvidia Research, developing next-generation chip architectures '
      + 'with agentic harness systems like Humanize.',
    links: [
      { text: 'sihaoliu.github.io', href: 'https://sihaoliu.github.io/' },
    ],
  },
  {
    who: 'Lyken17',
    role: 'Built the team',
    body:
      'Assembled Humanfia. The people below are here because he went and found them, across NVIDIA, '
      + 'MIT, UCLA, Tsinghua and half a dozen other places, and pointed the loop at problems whose '
      + 'scoreboards somebody else keeps. He is on every project under this line, which is why he is '
      + 'named above it instead of six times below it.',
    links: [{ text: 'lzhu.me', href: 'https://lzhu.me' }],
  },
]

interface Group {
  id: string
  name: string
  href: string
  what: string
  members: { who: string; role: string; lead?: boolean; coLead?: boolean }[]
}

const GROUPS: Group[] = [
  {
    id: 'humanize',
    name: 'Humanize2',
    href: '/projects/humanize',
    what: 'The runtime: ten coding-agent CLIs, one flow, and the whole run written down.',
    members: [
      { who: 'futrime', role: 'Lead. The runtime itself — the anchor, the tracing, the backends and the CLI.', lead: true },
      { who: 'DongyunZou', role: 'Backends and the kernel work the runtime had to survive.' },
      { who: 'antoinegg1', role: 'Flows, the flowverse, and running the thing at Kaggle scale.' },
      { who: 'dongz9', role: 'Execution and the container path.' },
      { who: 'crmsndu', role: 'Long-horizon runs, and what breaks on them.' },
    ],
  },
  {
    id: 'rlcr-loop',
    name: 'Humanize1 - RLCR Loop',
    href: '/projects/rlcr-loop',
    what: 'The original Humanize: Claude implements, Codex reviews, the criteria end the run.',
    members: [
      { who: 'SihaoLiu', role: 'Lead. Proposed it, wrote it, and still maintains the plugin.', lead: true },
      { who: 'shinan6', role: 'The plugin, and the monitor you watch a loop through.' },
      { who: 'futrime', role: 'The port: the three commands, as flows.' },
    ],
  },
  {
    id: 'flowbench',
    name: 'FlowBench',
    href: '/projects/flowbench',
    what: 'The referee. Scores flows against each other on work that takes a day, not a minute.',
    members: [
      { who: 'futrime', role: 'Lead. The harness, the task format and the scoring.', lead: true },
      { who: 'crmsndu', role: 'Tasks, drawn from work that actually had to be finished.' },
      { who: 'JerryGJX', role: 'Kernel and systems tasks.' },
    ],
  },
  {
    id: 'hoa',
    name: 'HOA',
    href: '/projects/hoa',
    what: 'Humanize Olympic Agents. Mathematics, physics and quantum information, checked by Lean 4.',
    members: [
      { who: 'ZhengyangZhang06', role: 'Lead. PutnamBench, IMO 2026 and both Lean-Eval runs.', lead: true },
      { who: 'menik1126', role: 'Physics and quantum information, formalized end to end.' },
      { who: 'hongzhoulin89', role: 'Research-level proofs, and what a Lean proof is worth.' },
      { who: 'JuiHuiChung', role: 'Set up the PutnamBench baseline and proposed recursive lemma proving for HOA.' },
    ],
  },
  {
    id: 'kda',
    name: 'KDA',
    href: '/projects/kda',
    what: 'Kernel Design Agents. Faster on real hardware, or it does not count.',
    members: [
      { who: 'DongyunZou', role: 'Lead. The workflow, and the MLSys 2026 FlashInfer contest entries.', lead: true },
      { who: 'ubospica', role: 'Established the baseline and evaluations, and continuously improves KDA generalization.' },
      { who: 'JerryGJX', role: 'Working on the self-evolving KernelWiki.' },
      { who: 'Waterpine', role: 'Working on the self-evolving KernelWiki.' },
      { who: 'BBuf', role: 'KDA-Pilot, and the forty-plus operators merged into SGLang.' },
      { who: 'smoothsmooth', role: 'Bootstrapped CuteDSL-related primitives into KDA.' },
    ],
  },
  {
    id: 'agentkaggle',
    name: 'AgentKaggle',
    href: '/projects/agentkaggle',
    what: 'Real competitions, real leaderboards, and an audit that refuses to flatter itself.',
    members: [
      { who: 'antoinegg1', role: 'Co-lead. The workflows, the entries and the audit.', coLead: true },
      { who: 'futrime', role: 'Co-lead. The leaderboard, and the runtime underneath the runs.', coLead: true },
      { who: 'zgdllt', role: 'Submissions, across most of the nineteen.' },
      { who: 'apostle715', role: 'Submissions and reproduction.' },
    ],
  },
]

const person = (who: string) => PEOPLE[who]
const avatar = (who: string) => person(who).avatarUrl
  ?? `https://avatars.githubusercontent.com/u/${person(who).id}?s=160&v=4`
const profile = (who: string) => person(who).href ?? `https://github.com/${person(who).gh}`
const profileLabel = (who: string) => person(who).profileLabel ?? `@${person(who).gh}`
</script>

<template>
  <div class="roster">
    <!-- The two it starts with. -->
    <section class="founding">
      <article v-for="one in FOUNDING" :key="one.who" class="founder">
        <a class="founder-face" :href="profile(one.who)" tabindex="-1" aria-hidden="true">
          <img :src="avatar(one.who)" :alt="''" width="88" height="88" loading="lazy" />
        </a>
        <div class="founder-said">
          <p class="founder-role">{{ one.role }}</p>
          <h3>
            {{ person(one.who).name }}
            <a class="handle" :href="profile(one.who)">@{{ person(one.who).gh }}</a>
          </h3>
          <p v-if="person(one.who).at" class="founder-at">{{ person(one.who).at }}</p>
          <p class="founder-body">{{ one.body }}</p>
          <p class="founder-links">
            <a v-for="link in one.links" :key="link.href" :href="link.href">{{ link.text }}</a>
          </p>
        </div>
      </article>
    </section>

    <!-- And then everyone, under the thing they built. -->
    <section v-for="group in GROUPS" :key="group.id" :id="group.id" class="group">
      <header class="group-head">
        <h3><a :href="group.href">{{ group.name }}</a></h3>
        <p>{{ group.what }}</p>
      </header>

      <ul class="people">
        <li v-for="member in group.members" :key="member.who" class="person">
          <a class="person-face" :href="profile(member.who)" tabindex="-1" aria-hidden="true">
            <img :src="avatar(member.who)" :alt="''" width="56" height="56" loading="lazy" />
          </a>
          <div class="person-said">
            <p class="person-name">
              {{ person(member.who).name }}
              <span v-if="member.lead" class="lead">Lead</span>
              <span v-else-if="member.coLead" class="lead">Co-lead</span>
            </p>
            <p class="person-handle">
              <a :href="profile(member.who)">{{ profileLabel(member.who) }}</a>
              <span v-if="person(member.who).at" class="person-at">{{ person(member.who).at }}</span>
            </p>
            <p class="person-role">{{ member.role }}</p>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.roster {
  margin: 40px 0 0;
}

/* ---- The two it starts with -------------------------------------------------------------
   Wider than a member card and given the accent rule down the side, because these are two
   acts rather than two more names: one proposed the loop, one went and found everybody. */

.founding {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 20px;
  padding-bottom: 56px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.founder {
  display: flex;
  gap: 20px;
  padding-left: 22px;
  border-left: 2px solid var(--vp-c-brand-1);
}

.founder-face,
.person-face {
  flex: none;
  display: block;
  border-radius: 50%;
  overflow: hidden;
  line-height: 0;
}

.founder-face img,
.person-face img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--vp-c-bg-soft);
  /* A ring rather than a filter. These are people's own avatars and they are shown as they
     chose them -- the page is held together by the rules and the whitespace around them, not
     by draining the colour out of somebody's face. */
  box-shadow: 0 0 0 1px var(--vp-c-divider);
  transition: box-shadow 0.3s, transform 0.35s;
}

.founder-face {
  width: 88px;
  height: 88px;
}

.founder:hover .founder-face img,
.person:hover .person-face img {
  box-shadow: 0 0 0 2px var(--vp-c-brand-1);
  transform: scale(1.04);
}

.founder-role {
  margin: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
}

.founder h3 {
  margin: 8px 0 0;
  padding: 0;
  border: 0;
  font-size: 21px;
  line-height: 1.25;
  letter-spacing: -0.02em;
  font-weight: 700;
}

.handle,
.person-handle a {
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0;
  color: var(--vp-c-text-3);
  text-decoration: none;
  transition: color 0.2s;
}

.handle {
  margin-left: 8px;
}

.handle:hover,
.person-handle a:hover {
  color: var(--vp-c-brand-1);
}

.founder-at {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.founder-body {
  margin: 12px 0 0;
  font-size: 14.5px;
  line-height: 1.68;
  color: var(--vp-c-text-2);
}

.founder-links {
  margin: 12px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.founder-links a {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.founder-links a:hover {
  text-decoration: underline;
}

/* ---- One project, and the people who are it --------------------------------------------- */

.group {
  padding-top: 52px;
}

.group + .group {
  border-top: 1px solid var(--vp-c-divider);
}

.group-head {
  max-width: 640px;
}

.group-head h3 {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: clamp(24px, 3vw, 30px);
  line-height: 1.2;
  letter-spacing: -0.028em;
  font-weight: 750;
}

.group-head h3 a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s;
}

.group-head h3 a:hover {
  color: var(--vp-c-brand-1);
}

.group-head p {
  margin: 8px 0 0;
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--vp-c-text-3);
}

.people {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 4px 32px;
  margin: 26px 0 0;
  padding: 0;
  list-style: none;
}

/* `margin: 0` is load-bearing. These are list items inside a document, and the theme gives
   every `li + li` eight pixels of top margin -- which in a grid pushes every entry except the
   first one in each row eight pixels down, and a wall of faces is exactly where that shows. */
.person {
  display: flex;
  gap: 16px;
  margin: 0;
  padding: 16px 0;
  border-top: 1px solid var(--vp-c-divider);
}

.person-face {
  width: 56px;
  height: 56px;
}

.person-said {
  min-width: 0;
}

/* An explicit line-height on both, so the row a name sits on is the same height whether or
   not there is a chip beside it -- otherwise the lead's name sits six pixels off every other
   name in its row, which on a page of rules and whitespace is the only thing you can see. */
.person-name {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 15.5px;
  line-height: 1.45;
  font-weight: 650;
  letter-spacing: -0.012em;
  color: var(--vp-c-text-1);
}

.lead {
  padding: 1px 7px;
  border: 1px solid var(--vp-c-brand-2);
  border-radius: 999px;
  font-family: var(--vp-font-family-mono);
  font-size: 9.5px;
  line-height: 1.5;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
}

.person-handle {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 10px;
  margin: 3px 0 0;
}

.person-at {
  font-size: 12.5px;
  color: var(--vp-c-text-3);
}

.person-role {
  margin: 7px 0 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

@media (max-width: 640px) {
  .founder {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
