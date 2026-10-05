<script setup lang="ts">
// The HOA page, whole. It is a run of figures rather than a column of prose, read top to bottom
// as an argument: here is a proof being checked (the hero), here is everything that has been
// checked (the record), here are the three boards in detail, here is what "checked" means, here
// is why it says something about loops rather than models, and here is where to check it
// yourself.
//
// The page's own mark is the tombstone: the red square that ends a proof (∎). It closes the
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

    <HoaSection id="what-it-has-done" n="01" kicker="The record" title="Everything it has been pointed at, at the top of its scale.">
      Eight exams and boards. Each grid is the exam's own count, one cell per problem, filled in when
      it is done. The tag says who did the checking, because it is not always Lean.
      <template #figure><HoaBoard :results="fm.results" /></template>
    </HoaSection>

    <HoaSection id="putnambench-672-of-672" n="02" kicker="PutnamBench" title="672 of 672, and a four-way tie.">
      672 Putnam problems stated in Lean. In June the loop stood at 670; it has since closed the
      last two, and the PutnamBench team accepted all 672
      (<a href="https://github.com/trishullab/PutnamBench/pull/350" target="_blank" rel="noreferrer">#350</a>).
      Three other entries got there within a month. The benchmark is saturated, so what separates
      the leaders now is the price of a proof, and there we are not first.
      <template #figure><HoaPutnam :entries="fm.putnam" /></template>
    </HoaSection>

    <HoaSection id="lean-eval-the-most-first-solves" n="03" kicker="Lean-Eval" title="Research mathematics: the most first solves.">
      <a href="https://lean-lang.org/eval/" target="_blank" rel="noreferrer">Lean-Eval</a> is theorems
      from papers, stated in Lean. Its frozen v1 has 128 problems and three columns, and each column
      rewards something different. Pick one.
      <template #figure><HoaLeanEval :entries="fm.leanEval" /></template>
    </HoaSection>

    <HoaSection id="imo-2026-six-of-six-and-where-the-time-went" n="04" kicker="IMO 2026" title="Six of six, and where the time went.">
      Two workers on two backends each closed all six problems with proofs Lean accepts. Counted in
      API time, the minutes spent inside model calls, so a slow harness gets no credit for it.
      <template #figure><HoaImo :rows="fm.imo" /></template>
    </HoaSection>

    <HoaSection id="what-counts-as-solved" n="05" kicker="What counts as solved" title="Five gates. The prover keeps none of them.">
      A problem counts only when its Lean file passes every gate, and the model that wrote the proof
      never decides whether it is accepted. Send a proof through.
      <template #figure><HoaGates /></template>
    </HoaSection>

    <HoaSection id="what-this-is-really-testing" n="06" kicker="What this is really testing" title="Not a claim about models. A claim about loops.">
      The models are the ones everybody has. What differs is the arrangement around them: who works
      and who reviews, what carries between attempts, when a line of attack is dropped. A formal
      verifier measures that, because it removes every way of being approximately right.
      <template #figure><HoaLoops :ablation="fm.ablation" :icho="fm.icho" /></template>
    </HoaSection>

    <HoaSection id="where-the-code-is" n="07" kicker="Where the code is" title="One repository. Check it yourself.">
      All of HOA is
      <a href="https://github.com/humanfia/hoa-qed" target="_blank" rel="noreferrer">humanfia/hoa-qed</a>:
      one directory per competition or library, each with its own README and its history intact.
      <template #figure><HoaRepo :dirs="fm.repo" /></template>
    </HoaSection>

    <HoaSection id="results-as-they-came-in" n="08" kicker="Results, as they came in" title="Every write-up, in order.">
      June to October 2026, from 670 on PutnamBench to five olympiads at full marks.
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
