<script setup lang="ts">
// Before HMA: the live-Kaggle work it grew out of, told as the history it is.
//
// Three pictures carry it. Two kinds of result, a finish and a late estimate, drawn as a mark on
// a board and a ghost beside a frozen one. The two tallies, August's and October's, one square a
// competition, with a switch between counting every top-5% result and counting only finishes,
// because that switch is the whole argument of the October post. And Biohub, the one rank that
// moved in public: eighth on the public board in August, 188th on the private one at the close.
import { computed, ref } from 'vue'
import Leaderboard from '../../kit/Leaderboard.vue'
import { vReveal } from '../../../home/motion'
import { BIOHUB, FINISHES, KAGGLE_TALLY } from './data'

const DIFFS = [
  {
    what: 'Method',
    kaggle: 'About ten different agent workflows, run from about twenty tracked accounts.',
    hma: 'One method: a fixed alternation between two agents.',
  },
  {
    what: 'Setting',
    kaggle: "Live competitions, on Kaggle's own leaderboards.",
    hma: "Offline, on MLE-bench's copies of 75 Kaggle competitions, with a hidden grader.",
  },
  {
    what: 'Evidence',
    kaggle: 'The audit below. The HMA repository never cites these results.',
    hma: 'It took infrastructure, not results: its data preparation came from the private agentkaggle/KaggleBench.',
  },
]

type Kind = 'final' | 'snapshot' | 'late' | 'out'
const finishesOnly = ref(false)

const TALLIES = [
  {
    date: '15 August',
    href: '/news/2026-08-15-kaggle-nineteen-competitions',
    of: 19,
    parts: { final: 2, snapshot: 0, late: 12 },
    note: 'Completed competitions. Of the 14 in the top 5%, two were official finishes; the rest counted late estimates.',
  },
  {
    date: '5 October',
    href: '/news/2026-10-05-kaggle-biohub-final',
    of: KAGGLE_TALLY.tracked,
    parts: { final: KAGGLE_TALLY.final, snapshot: KAGGLE_TALLY.snapshot, late: KAGGLE_TALLY.late },
    note: 'Tracked completed competitions, best result in each: 3 final private ranks, 1 public rank at the snapshot, 12 late estimates.',
  },
]

const tallies = computed(() =>
  TALLIES.map((t) => {
    const cells: Kind[] = [
      ...Array(t.parts.final).fill('final'),
      ...Array(t.parts.snapshot).fill('snapshot'),
      ...Array(t.parts.late).fill('late'),
    ]
    while (cells.length < t.of) cells.push('out')
    const top5 = t.parts.final + t.parts.snapshot + t.parts.late
    return { ...t, cells, count: finishesOnly.value ? t.parts.final : top5 }
  }),
)

/** The Biohub drop on a top-% axis, 0 to 6%: lower is better, so further left is better. */
const AXIS = 6
const at = (top: number) => `${(top / AXIS) * 100}%`
</script>

<template>
  <section id="before-hma-live-kaggle" class="hma-section hma-kaggle" aria-labelledby="kaggle-h">
    <!-- The old HKA page's section ids, so a /projects/hka#... link still lands in this section. -->
    <span id="why-kaggle" />
    <div class="hma-wrap">
      <div class="hma-section-head" v-reveal>
        <p class="hma-kicker"><span class="hma-num">05</span> Where it came from</p>
        <h2 id="kaggle-h" class="hma-h2">Before HMA: live Kaggle</h2>
        <p class="hma-lead">
          HMA grew out of our earlier work on live Kaggle competitions, run as AgentKaggle. That
          work is history here, not an HMA track. The same people did both.
        </p>
      </div>

      <div class="hma-diffs" role="table" aria-label="How the Kaggle work and HMA differ" v-reveal>
        <div role="row" class="hma-diffs-head">
          <span role="columnheader" />
          <span role="columnheader">Kaggle, before</span>
          <span role="columnheader">HMA</span>
        </div>
        <div v-for="d in DIFFS" :key="d.what" role="row" class="hma-diffs-row">
          <span role="rowheader">{{ d.what }}</span>
          <span role="cell">{{ d.kaggle }}</span>
          <span role="cell">{{ d.hma }}</span>
        </div>
      </div>
      <p class="hma-fine">
        HMA's <a href="https://github.com/humanfia/hma/blob/main/docs/provenance.md" target="_blank" rel="noreferrer">provenance</a>
        records what it took from that work.
      </p>

      <!-- What the two words mean -->
      <h3 id="what-the-two-words-mean" class="hma-h3 hma-sub">What the two words mean</h3>
      <p class="hma-sublead">On Kaggle we report two kinds of result, and never as one.</p>
      <div class="hma-words">
        <div class="hma-word" v-reveal>
          <div class="hma-word-art official" aria-hidden="true">
            <i /><i /><i class="us"><span>#188</span></i><i /><i />
          </div>
          <h4>Official</h4>
          <p>
            Entered before the deadline, and holding an exact final position on the Kaggle
            leaderboard. A finish.
          </p>
        </div>
        <div class="hma-word" v-reveal="100">
          <div class="hma-word-art late" aria-hidden="true">
            <i /><i /><i /><i /><i />
            <b><span>≈ est.</span></b>
          </div>
          <h4>Late</h4>
          <p>
            Submitted after the close and scored by Kaggle, then placed against the frozen final
            board. Only the score is real: an estimate of strength, not a rank, a medal, or
            evidence of having competed, and labelled as one everywhere it appears. Reporting it as
            a finish is exactly the failure our <a href="/about/#how-we-work">flows are built to catch</a>.
          </p>
        </div>
      </div>

      <!-- Where it ended -->
      <h3 id="where-things-stand" class="hma-h3 hma-sub">Where it ended</h3>
      <div class="hma-tally-top">
        <p class="hma-sublead">Top-5% results, one square per completed competition.</p>
        <div class="hma-seg" role="group" aria-label="What counts">
          <button type="button" :aria-pressed="!finishesOnly" @click="finishesOnly = false">Every top-5% result</button>
          <button type="button" :aria-pressed="finishesOnly" @click="finishesOnly = true">Finishes only</button>
        </div>
      </div>
      <div class="hma-tallies" :class="{ strict: finishesOnly }">
        <a v-for="(t, n) in tallies" :key="t.date" class="hma-tally" :href="t.href" v-reveal="n * 120">
          <p class="hma-mini">{{ t.date }}</p>
          <p class="hma-tally-big">
            {{ t.count }}<small> / {{ t.of }}</small>
          </p>
          <div class="hma-dots" aria-hidden="true">
            <i v-for="(k, i) in t.cells" :key="i" :class="k" :style="{ '--i': i }" />
          </div>
          <p class="hma-tally-note">{{ t.note }}</p>
        </a>
      </div>
      <p class="hma-dots-legend" aria-hidden="true">
        <span><i class="final" />official finish, final private rank</span>
        <span><i class="snapshot" />public rank at snapshot</span>
        <span><i class="late" />late estimate</span>
        <span><i class="out" />outside the top 5%</span>
      </p>

      <div class="hma-ended">
        <figure class="hma-biohub" v-reveal>
          <p class="hma-mini">Biohub · Cell Tracking · top % of the board</p>
          <div class="hma-biohub-axis">
            <i class="line5" :style="{ left: at(5) }"><span>top 5%</span></i>
            <i class="arrow" :style="{ left: at(BIOHUB.public.top), width: `calc(${at(BIOHUB.final.top)} - ${at(BIOHUB.public.top)})` }" />
            <b class="mark ghost" :style="{ left: at(BIOHUB.public.top) }" />
            <b class="mark" :style="{ left: at(BIOHUB.final.top) }" />
          </div>
          <div class="hma-biohub-labels">
            <p>
              <span class="hma-mini">{{ BIOHUB.public.when }}</span>
              <b>#{{ BIOHUB.public.rank }}</b> of {{ BIOHUB.public.of.toLocaleString('en-US') }} · top {{ BIOHUB.public.top }}%
            </p>
            <p class="end">
              <span class="hma-mini">{{ BIOHUB.final.when }}</span>
              <b>#{{ BIOHUB.final.rank }}</b> of {{ BIOHUB.final.of.toLocaleString('en-US') }} · top {{ BIOHUB.final.top }}%
            </p>
          </div>
          <figcaption>
            A real top-5% finish on a closed board, and a smaller one. A public rank in the middle of a
            competition is a weather report.
          </figcaption>
        </figure>

        <div class="hma-finishes" v-reveal="100">
          <Leaderboard
            kicker="Authenticated final private ranks in the top 5%"
            label="Kaggle finishes with an authenticated final private rank in the top 5%: Predicting Student Health Risk top 2.00%, ROGII Wellbore Geology top 2.24%, Biohub Cell Tracking top 4.76%, 188th of 3,947."
            caption="Top percent of the final private board, lower is better. Late estimates and public snapshot ranks are not finishes and are not here."
            :entries="FINISHES"
            :decimals="2"
            prefix="top "
            suffix="%"
            lower-is-better
          />
        </div>
      </div>

      <!-- The audit -->
      <div class="hma-audit" v-reveal>
        <h3 id="the-audit" class="hma-h3">The audit</h3>
        <p>
          <span id="what-is-public-and-what-is-not" />The numbers come from
          <a href="https://github.com/agentkaggle/kaggle-results-audit" target="_blank" rel="noreferrer">agentkaggle/kaggle-results-audit</a>.
          It marks each result as official or late, maps it to the session or evidence behind it,
          and reports coverage and failures. The
          <a href="https://agentkaggle.github.io/leaderboard/" target="_blank" rel="noreferrer">Team Radar leaderboard</a>
          is regenerated from the Kaggle API and is not audited. The per-entrant repositories stay
          private, because they hold competition data and account credentials.
        </p>
      </div>
    </div>
  </section>
</template>
