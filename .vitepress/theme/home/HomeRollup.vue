<script setup lang="ts">
// Everything the three applications did, on one sheet: HOA, KDA and HMA, one line per result,
// linked to the post that says how to check it. Results with no independent check -- our own
// measurements in a blog post, or claims we have only made in talks -- are marked
// "Humanfia-reported" with their date; the switch at the top takes them off.
import { computed, ref } from 'vue'

interface Item {
  n: string
  what: string
  href?: string
  /** Set for a claim with no public write-up yet: the date it was reported. */
  reported?: string
}
interface Column {
  id: string
  name: string
  full: string
  href: string
  items: Item[]
}

const COLUMNS: Column[] = [
  {
    id: 'hoa',
    name: 'HOA',
    full: 'Humanfia Olympiad Agents',
    href: '/projects/hoa',
    items: [
      { n: '672/672', what: 'PutnamBench, every statement proved in Lean', href: '/news/2026-10-05-putnambench-672' },
      { n: '6/6', what: 'IMO 2026, Lean-checked', href: '/news/2026-07-22-imo-2026' },
      { n: '6/6', what: 'IOI 2026, every problem at 100%', href: '/news/2026-10-05-olympiads' },
      { n: '23/23', what: 'IPhO 2026 theory subproblems, 30/30 points', href: '/news/2026-10-05-olympiads' },
      { n: '68/68', what: 'IChO 2026 theory subquestions formalized in Lean', href: '/news/2026-10-05-olympiads' },
      { n: '100/100', what: 'IBO 2024 theory tasks against the official key', href: '/news/2026-10-05-olympiads' },
      { n: '#1', what: 'Lean-Eval v1 by first solves (30), second on total by one', href: '/news/2026-10-05-lean-eval-v1' },
      { n: '36/36', what: 'quantum algorithms, proved in Lean', href: '/news/2026-07-29-physics-and-quantum' },
      { n: '40/40', what: 'quantum information theory, proved in Lean', href: '/news/2026-10-05-olympiads' },
      { n: '80%', what: 'Physics Cup (40/50), one model inside a flow', href: '/blog/2026-07-08-model-tool-flow', reported: '2026-07-08' },
      { n: '63%', what: 'an HLE subset, the same comparison', href: '/blog/2026-07-08-model-tool-flow', reported: '2026-07-08' },
      { n: '62.4%', what: 'SuperChem, the same comparison', href: '/blog/2026-07-08-model-tool-flow', reported: '2026-07-08' },
    ],
  },
  {
    id: 'kda',
    name: 'KDA',
    full: 'Kernel Design Agents',
    href: '/projects/kda',
    items: [
      { n: '1.69×', what: 'past the best human entry on MLSys 2026 GDN prefill; 1.41× on DSA, 1.17× on MoE (public KDA 0.5 kernels, B200)', href: '/news/2026-10-05-kda-upstream' },
      { n: '#1', what: 'SOL-ExecBench L1, 0.7639 on the v1.0 board', href: '/news/2026-07-02-solexec-l1' },
      { n: '71', what: 'per-kernel first places on SOL-ExecBench, of 235', href: '/news/2026-06-22-sol-bench-batch' },
      { n: '40+', what: 'operators merged upstream into SGLang', href: '/news/2026-06-05-kda-sglang' },
      { n: '6.5×', what: 'MSA prefill indexer, geomean; up to 14× on chunk tails', href: '/news/2026-08-14-msa-indexer', reported: '2026-08-14' },
      { n: '20%+', what: 'SGLang-Omni on our LTX 2.3 baseline, lossless', href: '/blog/2026-07-02-sglang-omni-numerics' },
      { n: '2.7×', what: 'VAE decoding, at best (1.41× is merged in SGLang)', reported: '2026-10-05' },
      { n: '1', what: 'hidden overflow bug found and fixed in cuDNN', reported: '2026-10-05' },
    ],
  },
  {
    id: 'hma',
    name: 'HMA',
    full: 'Humanize MLE Agents',
    href: '/projects/hma',
    items: [
      { n: '78.2%', what: 'any-medal on 75 MLE-bench tasks in six hours, self-reported', href: '/news/2026-10-05-hma-mle-bench' },
      { n: '53.8%', what: 'gold on the same 75 tasks', href: '/news/2026-10-05-hma-mle-bench' },
      { n: '3', what: 'authenticated final Kaggle finishes in the top 5%', href: '/news/2026-10-05-kaggle-biohub-final' },
      { n: '16/39', what: 'tracked Kaggle competitions in the top 5%, late estimates included', href: '/news/2026-10-05-kaggle-biohub-final' },
      { n: '#1', what: 'Predicting Soil Grain Size on Kaggle', reported: '2026-10-05' },
      { n: '1 + 2', what: 'silver and bronze medal-zone finishes on Kaggle', reported: '2026-10-05' },
    ],
  },
]

const verifiedOnly = ref(false)
const columns = computed(() =>
  COLUMNS.map((c) => ({ ...c, items: c.items.filter((i) => !(verifiedOnly.value && i.reported)) })),
)
const reportedCount = COLUMNS.flatMap((c) => c.items).filter((i) => i.reported).length
</script>

<template>
  <section class="ru" aria-labelledby="rollup-title">
    <div class="ru-wrap">
      <header class="ru-head">
        <div>
          <p class="ru-kicker">Achievements</p>
          <h2 id="rollup-title" class="ru-title">One summer,<br />three agents.</h2>
        </div>
        <dl class="ru-span">
          <div><dt>≈2</dt><dd>months, June to August 2026</dd></div>
          <div><dt>≈10</dt><dd>people</dd></div>
        </dl>
      </header>
      <label class="ru-switch">
        <input v-model="verifiedOnly" type="checkbox" />
        <span>Hide the {{ reportedCount }} results that are only Humanfia-reported</span>
      </label>
      <div class="ru-cols">
        <article v-for="c in columns" :key="c.id" class="ru-col">
          <a class="ru-name" :href="c.href"><b>{{ c.name }}</b><span>{{ c.full }}</span></a>
          <ul>
            <li v-for="item in c.items" :key="item.n + item.what">
              <component :is="item.href ? 'a' : 'span'" :href="item.href" class="ru-item">
                <b>{{ item.n }}</b>
                <span>{{ item.what }}<em v-if="item.reported" class="ru-rep">Humanfia-reported, {{ item.reported }}</em></span>
              </component>
            </li>
          </ul>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ru {
  padding: 96px 0;
  border-top: 1px solid var(--vp-c-divider);
}
.ru-wrap {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px;
}
.ru-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
}
.ru-kicker {
  margin: 0 0 12px;
  font: 700 12px/1.3 var(--vp-font-family-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--hf-red-deep);
}
.ru-title {
  margin: 0;
  font-size: clamp(34px, 5vw, 56px);
  line-height: 1;
  letter-spacing: -0.035em;
  font-weight: 800;
}
.ru-span {
  display: flex;
  gap: 28px;
  margin: 0;
}
.ru-span div {
  border-left: 6px solid var(--hf-red);
  padding-left: 12px;
}
.ru-span dt {
  font: 800 clamp(40px, 6vw, 64px) / 1 var(--vp-font-family-base);
  letter-spacing: -0.04em;
}
.ru-span dd {
  margin: 4px 0 0;
  max-width: 16ch;
  font: 600 12px/1.35 var(--vp-font-family-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-2);
}
.ru-switch {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin: 28px 0 0;
  font-size: 13.5px;
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.ru-switch input {
  accent-color: var(--hf-red);
  width: 16px;
  height: 16px;
}
.ru-cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
}
@media (max-width: 900px) {
  .ru-cols {
    grid-template-columns: 1fr;
  }
}
.ru-col {
  border-top: 6px solid var(--vp-c-text-1);
  padding-top: 12px;
}
.ru-col:nth-child(2) {
  border-top-color: var(--hf-red);
}
.ru-name {
  display: flex;
  align-items: baseline;
  gap: 10px;
  color: inherit;
  text-decoration: none;
}
.ru-name b {
  font-size: 28px;
  letter-spacing: -0.03em;
}
.ru-name span {
  font: 12px var(--vp-font-family-mono);
  color: var(--vp-c-text-2);
}
.ru-name:hover b {
  color: var(--hf-red-deep);
}
.ru-col ul {
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}
.ru-item {
  display: grid;
  grid-template-columns: 5.2em 1fr;
  gap: 10px;
  padding: 7px 0;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: background 0.2s, padding 0.2s;
}
a.ru-item:hover {
  background: color-mix(in srgb, var(--hf-red) 8%, transparent);
  padding-left: 6px;
}
.ru-item b {
  font: 800 17px/1.3 var(--vp-font-family-base);
  letter-spacing: -0.02em;
  white-space: nowrap;
}
.ru-item span {
  font-size: 14px;
  line-height: 1.4;
}
.ru-rep {
  display: block;
  margin-top: 2px;
  font: normal 11px/1.3 var(--vp-font-family-mono);
  color: var(--hf-red-deep);
}
</style>
