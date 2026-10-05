<script setup lang="ts">
// Bars: a speedup chart, a grouped comparison, an ablation.
//
// Horizontal by default (a category per row, which is what a long label wants) or vertical
// (a group of columns per category, which is what three levels of one thing want). Drawn in HTML
// rather than SVG, so the labels are text that wraps and reflows like text, at any width.
//
// What a reader can do with it:
//   - hover or focus a category to read every value in it, with its difference from the baseline;
//     arrow keys walk the categories, and each one announces itself to a screen reader;
//   - switch the series on and off from the legend;
//   - switch datasets (`datasets`), e.g. one benchmark and then another, with the bars morphing;
//   - switch the baseline (`baselines`): what every value is compared with. In `ratio` mode the
//     bars are re-scaled to "times the baseline"; in `delta` mode they keep their values and each
//     carries its gain over the baseline;
//   - open the numbers as a sortable table.
//
//   <BarChart
//     kicker="Speedup vs. FlashKDA"
//     :series="[{ key: 'ours', label: 'Ours', tone: 'red' }]"
//     :rows="[{ label: 'H96 fixed', values: { ours: 3.11 } }]"
//     :reference="{ value: 1, label: 'FlashKDA 1.00×' }"
//     suffix="×" :decimals="2"
//   />
import { computed, ref, watch } from 'vue'
import ChartFrame from './ChartFrame.vue'
import { format, niceTicks, signed, toneOf, useInView, type Tone } from './shared'

interface Series {
  key: string
  label: string
  tone?: Tone
  /** Hatched rather than solid: for a baseline, so it is told apart by more than its colour. */
  hatched?: boolean
}

interface Row {
  label: string
  detail?: string
  values: Record<string, number>
  /** A summary row (a geomean, a total): set off by a rule and set in the red. */
  total?: boolean
}

interface Dataset {
  key: string
  label: string
  rows: Row[]
  max?: number
}

const props = withDefaults(
  defineProps<{
    series: Series[]
    rows?: Row[]
    datasets?: Dataset[]
    orientation?: 'horizontal' | 'vertical'
    kicker?: string
    title?: string
    caption?: string
    /** For a screen reader: the figure in a sentence. Defaults to the kicker or title. */
    label?: string
    decimals?: number
    suffix?: string
    /** The top of the scale. Defaults to a round number above the largest value. */
    max?: number
    /** A fixed line drawn across the bars, e.g. the baseline every speedup is measured against. */
    reference?: { value: number; label: string }
    /** Series that can be chosen as the baseline everything else is compared with. */
    baselines?: string[]
    /** The baseline chosen at first; defaults to the reference (if there is one) or the first. */
    baseline?: string
    compare?: 'ratio' | 'delta'
    invert?: boolean
  }>(),
  { orientation: 'horizontal', decimals: 0, suffix: '', compare: 'ratio', invert: false },
)

const root = ref<HTMLElement | null>(null)
const seen = useInView(root, 0.3)

const datasetKey = ref(props.datasets?.[0]?.key)
const dataset = computed(() => props.datasets?.find((d) => d.key === datasetKey.value))
const rows = computed<Row[]>(() => dataset.value?.rows ?? props.rows ?? [])

const visible = ref<Record<string, boolean>>(Object.fromEntries(props.series.map((s) => [s.key, true])))
const shownSeries = computed(() =>
  props.series.map((s, i) => ({ ...s, tone: toneOf(s.tone, i) })).filter((s) => visible.value[s.key]),
)
function toggleSeries(key: string) {
  // Never all off: a chart with nothing in it is a broken chart, not a choice.
  const on = props.series.filter((s) => visible.value[s.key])
  if (on.length === 1 && on[0].key === key) return
  visible.value = { ...visible.value, [key]: !visible.value[key] }
}

/** The baseline options: the fixed reference first (if any), then the comparable series. */
const REF = '__reference'
const baselineOptions = computed(() => [
  ...(props.reference ? [{ key: REF, label: `vs ${props.reference.label.replace(/\s*[\d.]+\S*$/, '')}` }] : []),
  ...(props.baselines ?? []).map((key) => ({
    key,
    label: `vs ${props.series.find((s) => s.key === key)?.label ?? key}`,
  })),
])
const baselineKey = ref(props.baseline ?? baselineOptions.value[0]?.key ?? REF)
const against = computed(() => (baselineKey.value === REF ? undefined : baselineKey.value))

/** Ratio mode against a series re-scales the bars; everything else draws the values as given. */
const rescaled = computed(() => props.compare === 'ratio' && against.value !== undefined)

function shown(row: Row, key: string) {
  const value = row.values[key]
  if (!rescaled.value) return value
  const base = row.values[against.value!]
  return base ? value / base : NaN
}

function relation(row: Row, key: string) {
  const base = against.value
  if (!base || key === base) return ''
  const b = row.values[base]
  const v = row.values[key]
  if (props.compare === 'delta') return signed(v - b, props.decimals, props.suffix === '×' ? '×' : '')
  return format(v / b, 2, '×')
}

const top = computed(() => {
  if (!rescaled.value && (dataset.value?.max ?? props.max)) return (dataset.value?.max ?? props.max)!
  const values = rows.value.flatMap((row) => shownSeries.value.map((s) => shown(row, s.key))).filter(Number.isFinite)
  const peak = Math.max(rescaled.value ? 1 : (props.reference?.value ?? 0), ...values)
  const ticks = niceTicks(0, peak * 1.06, 4)
  return ticks[ticks.length - 1] < peak ? peak : ticks[ticks.length - 1]
})
const ticks = computed(() => niceTicks(0, top.value, 4).filter((t) => t <= top.value + 1e-9))
const refAt = computed(() => (rescaled.value ? 1 : props.reference?.value))
const refLabel = computed(() =>
  rescaled.value ? `${props.series.find((s) => s.key === against.value)?.label} = 1×` : props.reference?.label,
)

const pct = (v: number) => (Number.isFinite(v) ? Math.max(0, Math.min(1, v / top.value)) : 0)

const active = ref<number | null>(null)
const rowEls = ref<HTMLElement[]>([])
function move(index: number, by: number) {
  const next = (index + by + rows.value.length) % rows.value.length
  rowEls.value[next]?.focus()
}

function summary(row: Row) {
  const parts = shownSeries.value.map((s) => {
    const rel = relation(row, s.key)
    return `${s.label} ${format(shown(row, s.key), rescaled.value ? 2 : props.decimals, rescaled.value ? '×' : props.suffix)}${rel ? ` (${rel})` : ''}`
  })
  return `${row.label}${row.detail ? `, ${row.detail}` : ''}: ${parts.join('; ')}`
}

const ariaLabel = computed(() => props.label ?? props.title ?? props.kicker ?? 'Bar chart')

const columns = computed(() => [
  { key: 'label', label: 'Category' },
  ...props.series.map((s) => ({ key: s.key, label: s.label, decimals: props.decimals, suffix: props.suffix, bar: true })),
])
const tableRows = computed(() => rows.value.map((row) => ({ label: row.label, ...row.values, highlight: Boolean(row.total) })))

const fmt = (v: number) => format(v, rescaled.value ? 2 : props.decimals, rescaled.value ? '×' : props.suffix)

// A new dataset or baseline re-runs the bars from where they are, which the CSS transition does
// on its own; the readout is cleared so it never shows numbers from the previous one.
watch([datasetKey, baselineKey], () => (active.value = null))
</script>

<template>
  <ChartFrame
    :kicker="kicker"
    :title="title"
    :caption="caption"
    :label="ariaLabel"
    :invert="invert"
    :columns="columns"
    :rows="tableRows"
  >
    <template v-if="(datasets && datasets.length > 1) || baselineOptions.length > 1" #controls>
      <div class="bc-controls">
        <div v-if="datasets && datasets.length > 1" class="kit-toggle" role="group" aria-label="Dataset">
          <button
            v-for="d in datasets"
            :key="d.key"
            type="button"
            :aria-pressed="datasetKey === d.key"
            @click="datasetKey = d.key"
          >
            {{ d.label }}
          </button>
        </div>
        <div v-if="baselineOptions.length > 1" class="kit-toggle" role="group" aria-label="Compare against">
          <button
            v-for="b in baselineOptions"
            :key="b.key"
            type="button"
            :aria-pressed="baselineKey === b.key"
            @click="baselineKey = b.key"
          >
            {{ b.label }}
          </button>
        </div>
      </div>
    </template>

    <div
      ref="root"
      class="bc"
      :class="[orientation, { seen }]"
      :style="{ '--n': rows.length, '--k': shownSeries.length }"
    >
      <!-- ---------------------------------------------------------------- horizontal -->
      <template v-if="orientation === 'horizontal'">
        <div class="bc-axis" aria-hidden="true">
          <span v-for="t in ticks" :key="t" :style="{ left: `${pct(t) * 100}%` }">{{ format(t, t % 1 ? 1 : 0, rescaled ? '×' : suffix) }}</span>
        </div>
        <div
          v-for="(row, r) in rows"
          :key="row.label"
          ref="rowEls"
          class="bc-row"
          :class="{ total: row.total, on: active === r, dim: active !== null && active !== r }"
          tabindex="0"
          :aria-label="summary(row)"
          @pointerenter="active = r"
          @pointerleave="active = null"
          @focus="active = r"
          @blur="active = null"
          @keydown.down.prevent="move(r, 1)"
          @keydown.right.prevent="move(r, 1)"
          @keydown.up.prevent="move(r, -1)"
          @keydown.left.prevent="move(r, -1)"
        >
          <div class="bc-label">
            <strong>{{ row.label }}</strong>
            <span v-if="row.detail">{{ row.detail }}</span>
          </div>
          <div class="bc-bars" :style="refAt !== undefined ? { '--ref': pct(refAt) } : undefined" :class="{ 'has-ref': refAt !== undefined }">
            <div
              v-for="(s, i) in shownSeries"
              :key="s.key"
              class="bc-bar"
              :class="[`tone-${s.tone}`, { hatched: s.hatched }]"
              :style="{ '--w': seen ? pct(shown(row, s.key)) : 0, '--i': r * shownSeries.length + i }"
            >
              <i />
              <span class="bc-val">{{ fmt(shown(row, s.key)) }}</span>
            </div>
          </div>
          <div v-if="active === r" class="kit-tip bc-tip" aria-hidden="true">
            <strong>{{ row.label }}<template v-if="row.detail"> · {{ row.detail }}</template></strong>
            <div v-for="s in shownSeries" :key="s.key" class="kit-tip-row" :class="`tone-${s.tone}`">
              <i class="kit-swatch" :class="{ hatched: s.hatched }" />{{ s.label }}
              <b>{{ fmt(shown(row, s.key)) }}</b>
              <em v-if="relation(row, s.key)">{{ relation(row, s.key) }}</em>
            </div>
          </div>
        </div>
        <div v-if="refAt !== undefined" class="bc-reflabel" :style="{ '--ref': pct(refAt) }" aria-hidden="true">
          <span>{{ refLabel }}</span>
        </div>
      </template>

      <!-- ------------------------------------------------------------------ vertical -->
      <template v-else>
        <div class="bc-cols">
          <div class="bc-grid" aria-hidden="true">
            <span v-for="t in ticks" :key="t" :style="{ bottom: `${pct(t) * 100}%` }"><b>{{ format(t, t % 1 ? 1 : 0, rescaled ? '×' : suffix) }}</b></span>
          </div>
          <div
            v-for="(row, r) in rows"
            :key="row.label"
            ref="rowEls"
            class="bc-group"
            :class="{ on: active === r, dim: active !== null && active !== r }"
            tabindex="0"
            :aria-label="summary(row)"
            @pointerenter="active = r"
            @pointerleave="active = null"
            @focus="active = r"
            @blur="active = null"
            @keydown.right.prevent="move(r, 1)"
            @keydown.down.prevent="move(r, 1)"
            @keydown.left.prevent="move(r, -1)"
            @keydown.up.prevent="move(r, -1)"
          >
            <div class="bc-stack">
              <div
                v-for="(s, i) in shownSeries"
                :key="s.key"
                class="bc-col"
                :class="[`tone-${s.tone}`, { hatched: s.hatched }]"
                :style="{ '--h': seen ? pct(shown(row, s.key)) : 0, '--i': r * shownSeries.length + i }"
              >
                <span class="bc-top">
                  <b>{{ fmt(shown(row, s.key)) }}</b>
                  <small v-if="relation(row, s.key)">{{ relation(row, s.key) }}</small>
                </span>
                <i />
              </div>
            </div>
            <strong class="bc-name">{{ row.label }}</strong>
            <div v-if="active === r" class="kit-tip bc-tip" aria-hidden="true">
              <strong>{{ row.label }}</strong>
              <div v-for="s in shownSeries" :key="s.key" class="kit-tip-row" :class="`tone-${s.tone}`">
                <i class="kit-swatch" :class="{ hatched: s.hatched }" />{{ s.label }}
                <b>{{ fmt(shown(row, s.key)) }}</b>
                <em v-if="relation(row, s.key)">{{ relation(row, s.key) }}</em>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <template #legend>
      <ul class="kit-legend" aria-label="Series">
        <li v-for="(s, i) in series" :key="s.key" :class="`tone-${toneOf(s.tone, i)}`">
          <button
            v-if="series.length > 1"
            type="button"
            class="kit-key"
            :aria-pressed="visible[s.key]"
            @click="toggleSeries(s.key)"
          >
            <i class="kit-swatch" :class="{ hatched: s.hatched }" />{{ s.label }}
          </button>
          <span v-else class="kit-key"><i class="kit-swatch" />{{ s.label }}</span>
        </li>
      </ul>
    </template>
  </ChartFrame>
</template>

<style scoped>
.bc-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.bc {
  position: relative;
}

/* ---- horizontal ---- */

.bc.horizontal {
  --label: clamp(110px, 24%, 190px);
  padding-top: 22px;
}

.bc-axis {
  position: absolute;
  top: 0;
  left: calc(var(--label) + 12px);
  right: 64px;
  height: 18px;
  font-family: var(--k-mono);
  font-size: 11px;
  color: var(--k-fg-3);
}

.bc-axis span {
  position: absolute;
  transform: translateX(-50%);
}

.bc-row {
  position: relative;
  display: grid;
  grid-template-columns: var(--label) minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 9px 0;
  border-top: 1px solid var(--k-grid);
  outline: none;
  transition: opacity 0.2s;
}

.bc-row.total {
  margin-top: 6px;
  border-top: 1px solid var(--k-fg);
}

.bc-row.dim {
  opacity: 0.45;
}

.bc-row:focus-visible {
  box-shadow: inset 3px 0 0 var(--k-red);
}

.bc-label strong {
  display: block;
  font-size: 14px;
  line-height: 1.3;
  font-weight: 700;
  color: var(--k-fg);
}

.bc-row.total .bc-label strong {
  color: var(--k-red-text);
}

.bc-label span {
  display: block;
  font-family: var(--k-mono);
  font-size: 11px;
  color: var(--k-fg-3);
}

.bc-bars {
  position: relative;
  display: grid;
  gap: 4px;
  padding-right: 64px;
}

/* The reference, drawn through every row so it reads as one line down the chart. */
.bc-bars.has-ref::before {
  content: '';
  position: absolute;
  top: -10px;
  bottom: -10px;
  left: calc((100% - 64px) * var(--ref));
  border-left: 1px dashed var(--k-fg-2);
  z-index: 1;
}

.bc-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 14px;
}

.bc-row.total .bc-bar {
  height: 18px;
}

.bc-bar i {
  display: block;
  height: 100%;
  width: calc(100% * var(--w));
  background: var(--s);
  transition: width 0.9s var(--k-ease) calc(var(--i) * 45ms);
}

.bc-bar.hatched i {
  background: repeating-linear-gradient(-45deg, var(--s) 0 2px, transparent 2px 5px);
  box-shadow: inset 0 0 0 1px var(--s);
}

.bc-val {
  flex: none;
  font-family: var(--k-mono);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--k-fg);
  opacity: 0;
  transition: opacity 0.4s calc(0.5s + var(--i) * 45ms);
}

.bc.seen .bc-val {
  opacity: 1;
}

.bc-row.total .bc-val {
  font-size: 13px;
}

.bc-reflabel {
  position: relative;
  margin-left: calc(var(--label) + 12px);
  margin-right: 64px;
  height: 20px;
}

.bc-reflabel span {
  position: absolute;
  top: 4px;
  left: calc(100% * var(--ref));
  padding-left: 6px;
  font-family: var(--k-mono);
  font-size: 11px;
  color: var(--k-fg-2);
  white-space: nowrap;
}

.bc.horizontal .bc-tip {
  top: calc(100% - 4px);
  right: 0;
}

/* ---- vertical ---- */

.bc-cols {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
  gap: clamp(8px, 2.5vw, 28px);
  height: clamp(250px, 32vw, 320px);
  padding-left: 34px;
}

.bc-grid {
  position: absolute;
  inset: 34px 0 46px 0;
  pointer-events: none;
}

.bc-grid span {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px solid var(--k-grid);
}

.bc-grid b {
  position: absolute;
  left: 0;
  top: -8px;
  font-family: var(--k-mono);
  font-size: 11px;
  font-weight: 400;
  color: var(--k-fg-3);
}

.bc-group {
  position: relative;
  display: grid;
  grid-template-rows: minmax(0, 1fr) 46px;
  padding-top: 34px;
  outline: none;
  transition: opacity 0.2s;
}

.bc-group.dim {
  opacity: 0.45;
}

.bc-group:focus-visible .bc-name {
  color: var(--k-red-text);
  text-decoration: underline;
}

.bc-stack {
  display: grid;
  grid-template-columns: repeat(var(--k), minmax(0, 1fr));
  gap: 3px;
  align-items: end;
  border-bottom: 2px solid var(--k-fg);
}

.bc-col {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
}

.bc-col i {
  display: block;
  height: calc(100% * var(--h));
  background: var(--s);
  transition: height 0.9s var(--k-ease) calc(var(--i) * 40ms);
}

.bc-col.hatched i {
  background: repeating-linear-gradient(-45deg, var(--s) 0 2px, transparent 2px 5px);
  box-shadow: inset 0 0 0 1px var(--s);
}

.bc-top {
  display: grid;
  justify-items: center;
  margin-bottom: 4px;
  font-family: var(--k-mono);
  line-height: 1.15;
  opacity: 0;
  transition: opacity 0.4s calc(0.5s + var(--i) * 40ms);
}

.bc.seen .bc-top {
  opacity: 1;
}

.bc-top b {
  font-size: 12px;
  color: var(--k-fg);
}

.bc-top small {
  font-size: 11px;
  font-weight: 700;
  color: var(--k-red-text);
}

.bc-name {
  padding-top: 8px;
  font-size: 13.5px;
  line-height: 1.25;
  font-weight: 700;
  color: var(--k-fg);
}

.bc.vertical .bc-tip {
  bottom: 52px;
  left: 50%;
  transform: translateX(-50%);
}

@media (max-width: 640px) {
  .bc.horizontal {
    --label: 96px;
  }

  .bc-label strong {
    font-size: 12.5px;
  }

  .bc-bars,
  .bc-axis {
    padding-right: 52px;
  }

  .bc-axis {
    right: 52px;
    padding-right: 0;
  }

  .bc-bars.has-ref::before {
    left: calc((100% - 52px) * var(--ref));
  }

  .bc-reflabel {
    margin-right: 52px;
  }

  .bc-cols {
    padding-left: 28px;
  }

  .bc-top small {
    display: none;
  }

  .bc-name {
    font-size: 12px;
  }
}
</style>
