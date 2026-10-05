<script setup lang="ts">
// A results table a reader can work with: sort by any column, pin a row to keep it lit while
// reading across, and see each number as a bar as well as a figure.
//
// It is also every chart's "data" view (ChartFrame shows one under a chart on request), so the
// numbers behind a picture are always one click away in a form a screen reader can walk.
//
//   <ResultsTable
//     :columns="[{ key: 'entry', label: 'Entry' }, { key: 'score', label: 'Solved', bar: true }]"
//     :rows="[{ entry: 'Humanfia', score: 672, highlight: true }, { entry: 'Other', score: 658 }]"
//   />
import { computed, ref } from 'vue'
import { format, type Column } from './shared'


type Cell = string | number | boolean | null | undefined
type Row = Record<string, Cell>

const props = withDefaults(
  defineProps<{
    columns: Column[]
    rows: Row[]
    caption?: string
    /** The field that marks a row as ours; those rows are drawn in the red. */
    highlight?: string
    /** Initial sort: a column key, or none to keep the rows in the order given. */
    sort?: string
    /** Inside a chart frame: no outer margin, smaller type. */
    compact?: boolean
  }>(),
  { highlight: 'highlight', compact: false },
)

const sortKey = ref<string | undefined>(props.sort)
const descending = ref(true)
const pinned = ref<number | null>(null)

const isNumeric = (key: string) => props.rows.some((row) => typeof row[key] === 'number')

/** Each column's largest absolute value, for its bars. */
const maxOf = computed(() =>
  Object.fromEntries(
    props.columns.map((col) => [
      col.key,
      Math.max(0, ...props.rows.map((row) => (typeof row[col.key] === 'number' ? Math.abs(row[col.key] as number) : 0))),
    ]),
  ),
)

const sorted = computed(() => {
  const indexed = props.rows.map((row, index) => ({ row, index }))
  const key = sortKey.value
  if (!key) return indexed
  const col = props.columns.find((c) => c.key === key)
  const sign = (descending.value ? -1 : 1) * (col?.lowerIsBetter ? -1 : 1)
  return [...indexed].sort((a, b) => {
    const x = a.row[key]
    const y = b.row[key]
    if (typeof x === 'number' && typeof y === 'number') return sign * (x - y) || a.index - b.index
    return sign * String(x ?? '').localeCompare(String(y ?? '')) || a.index - b.index
  })
})

function sortBy(key: string) {
  if (sortKey.value === key) descending.value = !descending.value
  else {
    sortKey.value = key
    descending.value = isNumeric(key)
  }
}

const ariaSort = (key: string) =>
  sortKey.value !== key ? 'none' : (descending.value ? 'descending' : 'ascending')

function cell(col: Column, value: Cell) {
  if (typeof value === 'number') return format(value, col.decimals ?? 0, col.suffix ?? '', col.prefix ?? '')
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return value ?? '—'
}

const alignOf = (col: Column) => col.align ?? (isNumeric(col.key) ? 'right' : 'left')

const togglePin = (index: number) => {
  pinned.value = pinned.value === index ? null : index
}
</script>

<template>
  <div class="kit rt" :class="{ compact }">
    <div class="rt-scroll" role="region" :aria-label="caption ?? 'Results table'" tabindex="0">
      <table>
        <caption v-if="caption">{{ caption }}</caption>
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              scope="col"
              :aria-sort="col.sortable === false ? undefined : ariaSort(col.key)"
              :class="`al-${alignOf(col)}`"
            >
              <button v-if="col.sortable !== false" type="button" class="rt-sort" @click="sortBy(col.key)">
                {{ col.label }}
                <span class="rt-arrow" aria-hidden="true">{{
                  sortKey === col.key ? (descending ? '↓' : '↑') : '↕'
                }}</span>
              </button>
              <template v-else>{{ col.label }}</template>
            </th>
          </tr>
        </thead>
        <TransitionGroup tag="tbody" name="rt">
          <tr
            v-for="{ row, index } in sorted"
            :key="index"
            tabindex="0"
            :class="{ us: Boolean(row[highlight]), pinned: pinned === index }"
            :aria-selected="pinned === index"
            @click="togglePin(index)"
            @keydown.enter.prevent="togglePin(index)"
            @keydown.space.prevent="togglePin(index)"
          >
            <component
              :is="i === 0 ? 'th' : 'td'"
              v-for="(col, i) in columns"
              :key="col.key"
              :scope="i === 0 ? 'row' : undefined"
              :class="`al-${alignOf(col)}`"
            >
              <span
                v-if="col.bar && typeof row[col.key] === 'number' && maxOf[col.key] > 0"
                class="rt-bar"
                :style="{ '--w': Math.abs(row[col.key] as number) / maxOf[col.key] }"
                aria-hidden="true"
              />
              <span class="rt-val">{{ cell(col, row[col.key]) }}</span>
            </component>
          </tr>
        </TransitionGroup>
      </table>
    </div>
  </div>
</template>

<style scoped>
.rt {
  margin: 28px 0;
}

.rt.compact {
  margin: 0;
}

.rt-scroll {
  overflow-x: auto;
  border-top: 2px solid var(--k-fg);
  border-bottom: 1px solid var(--k-line);
}

.rt table {
  display: table;
  width: 100%;
  margin: 0;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

.rt caption {
  padding: 0 0 8px;
  text-align: left;
  font-family: var(--k-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--k-fg-3);
}

.rt th,
.rt td {
  position: relative;
  padding: 9px 12px;
  border: 0;
  border-bottom: 1px solid var(--k-grid);
  background: none;
  font-size: 14px;
  line-height: 1.4;
  color: var(--k-fg-2);
  white-space: nowrap;
}

.rt.compact th,
.rt.compact td {
  padding: 7px 10px;
  font-size: 13px;
}

.rt thead th {
  padding-top: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--k-line);
  font-family: var(--k-mono);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--k-fg-3);
}

.rt tbody th {
  font-weight: 650;
  color: var(--k-fg);
  text-align: left;
}

.rt .al-right {
  text-align: right;
}

.rt .al-left {
  text-align: left;
}

.rt-sort {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 28px;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  color: inherit;
  cursor: pointer;
}

.rt-sort:hover,
.rt th[aria-sort='ascending'] .rt-sort,
.rt th[aria-sort='descending'] .rt-sort {
  color: var(--k-fg);
}

.rt-arrow {
  font-size: 11px;
  color: var(--k-red-text);
}

.rt tbody tr {
  cursor: pointer;
  transition: background-color 0.15s;
}

.rt tbody tr:hover,
.rt tbody tr:focus-visible {
  background: color-mix(in srgb, var(--k-fg) 5%, transparent);
  outline: none;
}

.rt tbody tr.pinned {
  background: color-mix(in srgb, var(--k-red) 12%, transparent);
  box-shadow: inset 4px 0 0 var(--k-red);
}

.rt tbody tr.us th,
.rt tbody tr.us td {
  color: var(--k-fg);
  font-weight: 700;
}

.rt tbody tr.us th::before {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 8px;
  vertical-align: 1px;
  background: var(--k-red);
}

/* The bar sits behind the number, growing from the cell's right edge for a right-aligned
.rt number -- the same edge the digits line up on. */
.rt-bar {
  position: absolute;
  top: 50%;
  right: 8px;
  height: 18px;
  width: calc((100% - 16px) * var(--w));
  transform: translateY(-50%);
  background: color-mix(in srgb, var(--k-fg) 9%, transparent);
}

.rt tr.us .rt-bar {
  background: color-mix(in srgb, var(--k-red) 22%, transparent);
}

.rt .al-left .rt-bar {
  right: auto;
  left: 8px;
}

.rt-val {
  position: relative;
}

.rt-move {
  transition: transform 0.35s var(--k-ease);
}
</style>
