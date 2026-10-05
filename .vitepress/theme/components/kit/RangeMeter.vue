<script setup lang="ts">
// One quantity on one scale, with the places on it that matter marked -- and a handle, so the
// reader can move the quantity and watch what happens at each mark.
//
// `zones` say what is true in each stretch of the scale ("output finite", "output NaN"); the
// status line under the track reads the zone the value is in. The first time the meter is on
// screen the value runs from zero up to `value`, crossing every mark on the way; after that it is
// an ordinary range input, so a keyboard, a screen reader and a thumb all work on it unchanged.
//
//   <RangeMeter
//     kicker="Gate decay within one 64-token chunk" unit=" bits" :max="650" :value="600"
//     :markers="[{ value: 52, label: '≈52 bits', note: 'random tests' }]"
//     :zones="[{ from: 0, to: 126, label: 'test passes' }, { from: 126, to: 650, label: 'NaN', tone: 'red' }]"
//   />
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { format, prefersReducedMotion, uid, useInView, type Tone } from './shared'

interface Marker {
  value: number
  label: string
  note?: string
}

interface Zone {
  from: number
  to: number
  label: string
  tone?: Tone
}

const props = withDefaults(
  defineProps<{
    max: number
    value: number
    min?: number
    unit?: string
    decimals?: number
    markers?: Marker[]
    zones?: Zone[]
    kicker?: string
    /** What the status line is about ("Hack D on this input"). */
    status?: string
    label?: string
    caption?: string
    invert?: boolean
  }>(),
  { min: 0, unit: '', decimals: 0, markers: () => [], zones: () => [], invert: false },
)

const root = ref<HTMLElement | null>(null)
const seen = useInView(root, 0.45)
const id = uid('meter')
const at = ref(props.value)
let frame = 0

const pct = (v: number) => ((v - props.min) / (props.max - props.min)) * 100
const zone = computed(() => props.zones.find((z) => at.value >= z.from && at.value <= z.to))
const danger = computed(() => props.zones.find((z) => z.tone === 'red'))

watch(seen, (now) => {
  if (!now || prefersReducedMotion()) return
  const begin = performance.now()
  const DURATION = 3200
  const tick = (t: number) => {
    const u = Math.min(1, (t - begin) / DURATION)
    at.value = props.min + (props.value - props.min) * (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2)
    if (u < 1) frame = requestAnimationFrame(tick)
  }
  at.value = props.min
  frame = requestAnimationFrame(tick)
})
onBeforeUnmount(() => cancelAnimationFrame(frame))

function input(event: Event) {
  cancelAnimationFrame(frame)
  at.value = Number((event.target as HTMLInputElement).value)
}

const fmt = (v: number) => format(v, props.decimals, props.unit)
</script>

<template>
  <figure ref="root" class="kit kit-frame rm" :class="{ invert }" role="group" :aria-label="label ?? kicker ?? 'Meter'">
    <div class="kit-head">
      <span v-if="kicker" class="kit-kicker">{{ kicker }}</span>
      <span class="rm-live" aria-hidden="true"><i />{{ fmt(at) }}</span>
    </div>

    <div class="rm-track" :style="{ '--at': `${pct(at)}%` }">
      <div v-if="danger" class="rm-danger" :style="{ left: `${pct(danger.from)}%`, right: `${100 - pct(danger.to)}%` }" aria-hidden="true" />
      <div class="rm-fill" :class="{ hot: zone?.tone === 'red' }" aria-hidden="true" />
      <div
        v-for="(m, i) in markers"
        :key="m.value"
        class="rm-mark"
        :class="{ passed: at >= m.value }"
        :style="{ left: `${pct(m.value)}%` }"
        aria-hidden="true"
      >
        <i />
        <b>{{ i + 1 }}</b>
      </div>
      <label :for="id" class="sr-only">{{ kicker ?? label ?? 'Value' }}</label>
      <input
        :id="id"
        class="rm-input"
        type="range"
        :min="min"
        :max="max"
        :step="(max - min) / 200"
        :value="at"
        :aria-valuetext="`${fmt(at)}${zone ? `: ${zone.label}` : ''}`"
        @input="input"
      />
    </div>

    <ol v-if="markers.length" class="rm-notes">
      <li v-for="(m, i) in markers" :key="m.value" :class="{ passed: at >= m.value }">
        <b>{{ i + 1 }}</b>
        <span><strong>{{ m.label }}</strong> {{ m.note }}</span>
      </li>
    </ol>

    <div v-if="zones.length" class="rm-status" :class="zone?.tone ? `tone-${zone.tone}` : ''" aria-live="polite">
      <span v-if="status" class="kit-label">{{ status }}</span>
      <b>{{ zone?.label ?? '' }}</b>
    </div>
    <figcaption v-if="caption" class="kit-caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.rm-live {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--k-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--k-fg);
  font-variant-numeric: tabular-nums;
}

.rm-live i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--k-red);
}

.rm-track {
  position: relative;
  height: 30px;
  margin: 8px 0 40px;
  background: var(--k-grid);
}

.rm-danger {
  position: absolute;
  top: 0;
  bottom: 0;
  background: repeating-linear-gradient(-45deg, color-mix(in srgb, var(--k-red) 35%, transparent) 0 2px, transparent 2px 8px);
}

.rm-fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--at);
  background: var(--k-fg);
}

.rm-fill.hot {
  background: linear-gradient(90deg, var(--k-fg) 0 40%, var(--k-red));
}

/* A mark: a tick through the track and its number under it; what the number means is in the
   list below, where a long note has room to wrap. */
.rm-mark {
  position: absolute;
  top: -6px;
  width: 0;
}

.rm-mark i {
  position: absolute;
  left: -1px;
  width: 2px;
  height: 42px;
  background: var(--k-fg-3);
}

.rm-mark b,
.rm-notes b {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--k-bg-2);
  border: 1.5px solid var(--k-fg-3);
  font-family: var(--k-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--k-fg-3);
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}

.rm-mark b {
  position: absolute;
  top: 44px;
  left: -11px;
}

.rm-mark.passed i {
  background: var(--k-fg);
}

.rm-mark.passed b,
.rm-notes li.passed b {
  border-color: var(--k-fg);
  background: var(--k-fg);
  color: var(--k-bg);
}

.rm-notes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
  gap: 10px 20px;
  margin: 28px 0 16px;
  padding: 0;
  list-style: none;
}

.rm-notes li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin: 0;
  font-family: var(--k-mono);
  font-size: 12px;
  line-height: 1.5;
  color: var(--k-fg-3);
  transition: color 0.3s;
}

.rm-notes li b {
  flex: none;
}

.rm-notes li.passed {
  color: var(--k-fg-2);
}

.rm-notes strong {
  display: block;
  font-size: 15px;
  color: var(--k-fg);
}

.rm-input {
  position: absolute;
  inset: -6px 0;
  width: 100%;
  height: 42px;
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
}

/* The thumb is drawn, not the input's own: a red square tilted onto the diagonal. */
.rm-track::after {
  content: '';
  position: absolute;
  top: 50%;
  left: var(--at);
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  background: var(--k-red);
  border: 2px solid var(--k-bg);
  transform: rotate(-17deg);
  pointer-events: none;
}

.rm-track:has(.rm-input:focus-visible)::after {
  outline: 2px solid var(--k-fg);
  outline-offset: 2px;
}

.rm-status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  padding: 11px 14px;
  border: 1px solid var(--k-line);
  background: var(--k-bg-2);
  font-family: var(--k-mono);
  font-size: 12.5px;
}

.rm-status b {
  color: var(--k-fg);
}

.rm-status.tone-red {
  border-color: var(--k-red);
}

.rm-status.tone-red b {
  color: var(--k-red-text);
}

</style>
