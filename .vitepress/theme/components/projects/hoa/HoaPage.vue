<script setup lang="ts">
// The HOA page, whole. It is a run of figures rather than a column of prose, read top to bottom
// as an argument: here is a proof being checked (the hero), here is everything that has been
// checked (the record), here are the three boards in detail, here is what "checked" means, here
// is why it says something about loops rather than models, and here is where to check it
// yourself.
//
// The page's own mark is the tombstone: the accent square that ends a proof (∎). It closes the
// proof in the hero, it is every solved cell on the record, and it ends each section's lead.
//
// Motion follows the home page's rules (home/motion.ts): the server renders the last frame, and
// `.hf-motion` -- set once mounted, and only when the reader has not asked for less motion -- is
// what hides anything that is about to arrive.
import { onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import ProjectTimeline from '../../kit/ProjectTimeline.vue'
import { prefersReducedMotion, vReveal } from '../../../home/motion'
import HoaBoard from './HoaBoard.vue'
import HoaGates from './HoaGates.vue'
import HoaHero from './HoaHero.vue'
import HoaImo from './HoaImo.vue'
import HoaLeanEval from './HoaLeanEval.vue'
import HoaLoops from './HoaLoops.vue'
import HoaPutnam from './HoaPutnam.vue'
import HoaRepo from './HoaRepo.vue'
import HoaSection from './HoaSection.vue'
import './hoa.css'

const { frontmatter: fm } = useData()
const motion = ref(false)
onMounted(() => (motion.value = !prefersReducedMotion()))
</script>

<template>
  <div class="hoa-root" :class="{ 'hf-motion': motion }">
    <HoaHero :links="fm.links" />

    <HoaSection id="what-it-has-done" n="01" kicker="The record" title="Full marks on seven exams and the most first solves on Lean-Eval.">
      One tile per exam or board, one cell per item, filled when done. The tag says who checked it; it
      is not always Lean.
      <template #figure><HoaBoard :results="fm.results" /></template>
    </HoaSection>

    <HoaSection id="putnambench-672-of-672" n="02" kicker="PutnamBench" title="Every PutnamBench problem proved, level with three other entries.">
      672 Putnam problems stated in Lean. We had 670 in June; the PutnamBench team accepted all 672
      (<a href="https://github.com/trishullab/PutnamBench/pull/350" target="_blank" rel="noreferrer">#350</a>).
      Three other entries reached 672 within a month. On cost per problem we are not first.
      <template #figure><HoaPutnam :entries="fm.putnam" /></template>
    </HoaSection>

    <HoaSection id="lean-eval-the-most-first-solves" n="03" kicker="Lean-Eval" title="Research mathematics: the most first solves.">
      <a href="https://lean-lang.org/eval/" target="_blank" rel="noreferrer">Lean-Eval</a> is theorems
      from research papers, stated in Lean. Its frozen v1 has 128 problems and ranks entries three
      ways.
      <template #figure><HoaLeanEval :entries="fm.leanEval" /></template>
    </HoaSection>

    <HoaSection id="imo-2026-six-of-six-and-where-the-time-went" n="04" kicker="IMO 2026" title="All six IMO 2026 problems proved in Lean, on each of two backends.">
      Two workers on two backends each proved all six in Lean. Times are API minutes, the time spent
      inside model calls.
      <template #figure><HoaImo :rows="fm.imo" /></template>
    </HoaSection>

    <HoaSection id="what-counts-as-solved" n="05" kicker="What counts as solved" title="A proof counts only after five checks the prover does not control.">
      A problem counts only when its Lean file passes all five gates, none of them run by the model
      that wrote the proof. Pick a file to see where it stops.
      <template #figure><HoaGates /></template>
    </HoaSection>

    <HoaSection id="what-this-is-really-testing" n="06" kicker="With and without a flow" title="The same model proves 3 of 50 Putnam problems through the API and 50 inside a flow.">
      The models are publicly available. The flow decides who works, who reviews and what carries
      over between attempts.
      <template #figure><HoaLoops :ablation="fm.ablation" :icho="fm.icho" /></template>
    </HoaSection>

    <HoaSection id="where-the-code-is" n="07" kicker="Where the code is" title="Every proof, flow and README is in one public repository.">
      All of HOA is
      <a href="https://github.com/humanfia/hoa-qed" target="_blank" rel="noreferrer">humanfia/hoa-qed</a>:
      one directory per competition or library, each with a README.
      <template #figure><HoaRepo :dirs="fm.repo" /></template>
    </HoaSection>

    <HoaSection id="results-as-they-came-in" n="08" kicker="Results, as they came in" title="Results by date, June to October 2026.">
      Each card links to its write-up.
      <template #figure>
        <div v-reveal class="hoa-timeline">
          <ProjectTimeline
            kicker="HOA · every write-up"
            label="HOA results from June to October 2026: 670 of 672 on PutnamBench, the model, tool and flow comparison, six of six at IMO 2026, second and then first on Lean-Eval, IPhO and quantum formalized, 672 of 672 on PutnamBench, the most first solves on LeanEval v1, and five olympiads at full marks."
            :entries="fm.timeline"
          />
        </div>
      </template>
    </HoaSection>
  </div>
</template>
