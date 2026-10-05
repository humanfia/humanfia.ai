<script setup lang="ts">
// Before and after, on top of each other, with a divider to drag between them.
//
// The two states are slots, so either can be anything: a picture, a table, a chart, a block of
// code. They share one grid cell, so the frame is as tall as the taller of the two and nothing
// jumps as the divider moves. Drag anywhere on the figure (or focus the handle and use the arrow
// keys, Home and End) to move the divider. The first time it is on screen the divider wipes across
// once, so a reader knows it moves; a reader who asked for less motion finds it resting at `start`.
//
//   <SwipeCompare before-label="Random tests" after-label="Real Kimi-Linear">
//     <template #before> ... </template>
//     <template #after> ... </template>
//   </SwipeCompare>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { prefersReducedMotion, useInView } from './shared'

const props = withDefaults(
  defineProps<{
    beforeLabel?: string
    afterLabel?: string
    kicker?: string
    caption?: string
    label?: string
    /** Where the divider rests, as a percentage from the left. */
    start?: number
    invert?: boolean
  }>(),
  { beforeLabel: 'Before', afterLabel: 'After', start: 50, invert: false },
)

const root = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const seen = useInView(root, 0.45)
const at = ref(props.start)
let frame = 0
let dragging = false

const clamp = (v: number) => Math.min(100, Math.max(0, v))

function fromPointer(event: PointerEvent) {
  const rect = stage.value!.getBoundingClientRect()
  at.value = clamp(((event.clientX - rect.left) / rect.width) * 100)
}

function down(event: PointerEvent) {
  cancelAnimationFrame(frame)
  dragging = true
  ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
  fromPointer(event)
}

function moveTo(event: PointerEvent) {
  if (dragging) fromPointer(event)
}

function up() {
  dragging = false
}

function key(event: KeyboardEvent) {
  const by = event.shiftKey ? 20 : 5
  const next =
    event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? at.value - by
    : event.key === 'ArrowRight' || event.key === 'ArrowUp' ? at.value + by
    : event.key === 'Home' ? 0
    : event.key === 'End' ? 100
    : undefined
  if (next === undefined) return
  event.preventDefault()
  cancelAnimationFrame(frame)
  at.value = clamp(next)
}

/** The demonstration wipe: right, then left, then home, on one eased curve. */
function wipe() {
  if (prefersReducedMotion()) return
  const keys = [props.start, 82, 18, props.start]
  const DURATION = 2400
  const begin = performance.now()
  const tick = (now: number) => {
    const t = Math.min(1, (now - begin) / DURATION)
    const seg = Math.min(keys.length - 2, Math.floor(t * (keys.length - 1)))
    const u = t * (keys.length - 1) - seg
    const e = u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2
    at.value = keys[seg] + (keys[seg + 1] - keys[seg]) * e
    if (t < 1) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
}

watch(seen, (now) => now && wipe())
onBeforeUnmount(() => cancelAnimationFrame(frame))

const valueText = computed(
  () => `${Math.round(at.value)}% — ${props.beforeLabel} on the left, ${props.afterLabel} on the right`,
)
</script>

<template>
  <figure ref="root" class="kit kit-frame sw" :class="{ invert }" role="group" :aria-label="label ?? `${beforeLabel} compared with ${afterLabel}`">
    <div v-if="kicker" class="kit-head">
      <span class="kit-kicker">{{ kicker }}</span>
      <span class="kit-label">Drag to compare</span>
    </div>

    <div
      ref="stage"
      class="sw-stage"
      :style="{ '--at': `${at}%` }"
      @pointerdown="down"
      @pointermove="moveTo"
      @pointerup="up"
      @pointercancel="up"
    >
      <div class="sw-pane sw-before">
        <span class="sw-tag">{{ beforeLabel }}</span>
        <slot name="before" />
      </div>
      <div class="sw-pane sw-after" aria-hidden="false">
        <span class="sw-tag right">{{ afterLabel }}</span>
        <slot name="after" />
      </div>
      <div class="sw-rule" aria-hidden="true" />
      <button
        type="button"
        class="sw-handle"
        role="slider"
        :aria-label="`Divider between ${beforeLabel} and ${afterLabel}`"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="Math.round(at)"
        :aria-valuetext="valueText"
        @keydown="key"
      >
        <span aria-hidden="true">◀ ▶</span>
      </button>
    </div>

    <figcaption v-if="caption || $slots.caption" class="kit-caption">
      <slot name="caption">{{ caption }}</slot>
    </figcaption>
  </figure>
</template>

<style scoped>
.sw-stage {
  position: relative;
  display: grid;
  user-select: none;
  touch-action: pan-y;
  cursor: ew-resize;
  border: 1px solid var(--k-line);
}

/* Both panes in the one cell. The after pane is cut from the left at the divider, so the
   before is what shows left of it and the after what shows right. */
.sw-pane {
  grid-area: 1 / 1;
  position: relative;
  min-width: 0;
  padding: 44px 18px 18px;
  background: var(--k-bg-2);
}

.sw-after {
  clip-path: inset(0 0 0 var(--at));
  background: var(--k-bg);
  box-shadow: inset 0 4px 0 var(--k-red);
}

.sw-tag {
  position: absolute;
  top: 12px;
  left: 14px;
  padding: 3px 8px;
  background: var(--k-fg);
  font-family: var(--k-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--k-bg);
}

.sw-tag.right {
  left: auto;
  right: 14px;
  background: var(--k-red);
  color: var(--hf-paper);
}

.sw-rule {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--at);
  width: 3px;
  margin-left: -1.5px;
  background: var(--k-red);
  pointer-events: none;
}

.sw-handle {
  position: absolute;
  top: 50%;
  left: var(--at);
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin: -22px 0 0 -22px;
  padding: 0;
  border: 3px solid var(--k-red);
  background: var(--k-bg);
  font-size: 11px;
  letter-spacing: -0.1em;
  color: var(--k-red-text);
  cursor: ew-resize;
  transform: rotate(-17deg);
}

.sw-handle span {
  transform: rotate(17deg);
}

.sw-handle:focus-visible {
  outline: 3px solid var(--k-fg);
  outline-offset: 2px;
}
</style>
