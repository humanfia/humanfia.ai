<script setup lang="ts">
// The scaffold for a diagram that builds itself: write the SVG, mark what appears when, and the
// component turns it into a GSAP timeline a reader can play, pause and step through.
//
// Mark elements inside the SVG with data attributes:
//
//   data-step="2"         appears in step 2 (steps count from 1; unmarked elements are always there)
//   data-draw             a stroke that draws itself on, rather than fading in
//   data-pop              scales up from its own centre, rather than fading in
//   data-travel="#path"   rides along the path with that id (MotionPathPlugin)
//   data-stop="0.6"       ... and stops 60% of the way along, where it is refused (it turns red)
//   data-loop             after the build, keeps doing what it does, forever, while on screen
//
// `steps` captions each step; the caption under the diagram follows the timeline and is read out
// to a screen reader, and the step buttons walk it by hand. A reader who asked for less motion
// gets the finished diagram, every step shown, nothing looping.
//
// The SVG scales to its column, so its type does too: set `min-width` to the narrowest the
// diagram can be drawn with its smallest text still at 11px (smallest font size in viewBox units
// x viewBox width / 11), and under that it scrolls sideways instead of shrinking.
//
// Every colour comes from the kit's variables: give shapes the classes `ink`, `red`, `grey`,
// `paper`, `line`, or use `var(--k-fg)` and friends in your own styles.
import { gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { prefersReducedMotion, useInView, useWidth } from './shared'

const props = withDefaults(
  defineProps<{
    viewBox: string
    label: string
    kicker?: string
    caption?: string
    steps?: string[]
    minWidth?: number
    invert?: boolean
    /** Seconds each step holds before the next one starts, when it plays on its own. */
    hold?: number
  }>(),
  { steps: () => [], minWidth: 0, invert: false, hold: 1.1 },
)

const root = ref<HTMLElement | null>(null)
const svg = ref<SVGSVGElement | null>(null)
const box = ref<HTMLElement | null>(null)
const seen = useInView(root, 0.35)
const boxWidth = useWidth(box, 720)
const overflows = computed(() => props.minWidth > 0 && boxWidth.value < props.minWidth)

const step = ref(0)
const playing = ref(false)
const count = ref(0)

let tl: gsap.core.Timeline | undefined
const loops: gsap.core.Animation[] = []
let visibility: IntersectionObserver | undefined

const at = (el: Element, name: string) => el.getAttribute(name)

function build() {
  if (!svg.value) return
  gsap.registerPlugin(MotionPathPlugin)
  const marked = [...svg.value.querySelectorAll<SVGGraphicsElement>('[data-step]')]
  count.value = Math.max(props.steps.length, ...marked.map((el) => Number(at(el, 'data-step')) || 1))
  tl = gsap.timeline({ paused: true, onUpdate: syncStep })

  for (let n = 1; n <= count.value; n++) {
    tl.addLabel(`s${n}`)
    tl.call(() => (step.value = n))
    const here = marked.filter((el) => Number(at(el, 'data-step')) === n)
    here.forEach((el, i) => {
      const offset = i * 0.08
      if (el.hasAttribute('data-draw') && 'getTotalLength' in el) {
        const length = (el as unknown as SVGGeometryElement).getTotalLength()
        gsap.set(el, { strokeDasharray: length, strokeDashoffset: length })
        tl!.to(el, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, `s${n}+=${offset}`)
        // A dashed stroke draws on solid, then gets its dashes back from its class.
        tl!.set(el, { strokeDasharray: '', strokeDashoffset: '' }, `s${n}+=${offset + 0.9}`)
      } else if (el.hasAttribute('data-travel')) {
        const path = svg.value!.querySelector(at(el, 'data-travel')!)
        const end = Number(at(el, 'data-stop') ?? 1)
        gsap.set(el, { opacity: 0 })
        const ride = gsap.timeline()
        ride.set(el, { opacity: 1 })
        ride.to(el, {
          duration: 1.4 * end,
          ease: end < 1 ? 'power1.in' : 'power1.inOut',
          motionPath: { path: path as SVGPathElement, align: path as SVGPathElement, alignOrigin: [0.5, 0.5], end },
        })
        if (end < 1) ride.to(el, { fill: 'var(--k-red)', scale: 1.6, transformOrigin: '50% 50%', duration: 0.15, yoyo: true, repeat: 1 })
        tl!.add(ride, `s${n}+=${offset}`)
        if (el.hasAttribute('data-loop')) loops.push(gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.4 }).add(cloneRide(el, path as SVGPathElement, end)))
      } else if (el.hasAttribute('data-pop')) {
        gsap.set(el, { scale: 0, transformOrigin: '50% 50%' })
        tl!.to(el, { scale: 1, duration: 0.55, ease: 'back.out(2)' }, `s${n}+=${offset}`)
      } else {
        gsap.set(el, { opacity: 0, y: 8 })
        tl!.to(el, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, `s${n}+=${offset}`)
      }
    })
    tl.to({}, { duration: props.hold })
  }
  tl.eventCallback('onComplete', () => {
    playing.value = false
    startLoops()
  })
}

/** A looping ride is its own animation, built again rather than shared with the build. */
function cloneRide(el: Element, path: SVGPathElement, end: number) {
  const ride = gsap.timeline()
  ride.fromTo(
    el,
    { opacity: 1 },
    { duration: 1.4 * end, ease: 'none', immediateRender: false, motionPath: { path, align: path, alignOrigin: [0.5, 0.5], end } },
  )
  if (end < 1) ride.to(el, { scale: 1.6, transformOrigin: '50% 50%', duration: 0.15, yoyo: true, repeat: 1 })
  return ride
}

function syncStep() {
  if (!tl) return
  let current = 0
  for (let n = 1; n <= count.value; n++) if (tl.time() >= tl.labels[`s${n}`] - 1e-6) current = n
  step.value = current
}

function startLoops() {
  if (prefersReducedMotion()) return
  loops.forEach((loop) => loop.play())
}

function stopLoops() {
  loops.forEach((loop) => loop.pause())
}

function play() {
  if (!tl) return
  stopLoops()
  if (tl.progress() >= 1) tl.restart()
  else tl.play()
  playing.value = true
}

function pause() {
  tl?.pause()
  playing.value = false
}

function goTo(n: number) {
  if (!tl) return
  stopLoops()
  pause()
  const target = Math.max(1, Math.min(count.value, n))
  // Each step shows complete: seek to just before the next step starts.
  const next = target < count.value ? tl.labels[`s${target + 1}`] - 0.001 : tl.duration()
  tl.tweenTo(next, { duration: 0.6, ease: 'power2.out' })
  step.value = target
}

onMounted(() => {
  build()
  if (prefersReducedMotion()) {
    tl?.progress(1)
    step.value = count.value
    return
  }
  if (root.value && typeof IntersectionObserver !== 'undefined') {
    visibility = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) stopLoops()
      else if (tl && tl.progress() >= 1) startLoops()
    })
    visibility.observe(root.value)
  }
})

watch(seen, (now) => {
  if (now && !prefersReducedMotion()) play()
})

onBeforeUnmount(() => {
  visibility?.disconnect()
  loops.forEach((loop) => loop.kill())
  tl?.kill()
})

const captionNow = computed(() => (step.value > 0 ? props.steps[step.value - 1] : undefined) ?? props.steps[0])
</script>

<template>
  <figure ref="root" class="kit kit-frame ad" :class="{ invert }" role="group" :aria-label="label">
    <div class="kit-head">
      <span v-if="kicker" class="kit-kicker">{{ kicker }}</span>
      <div class="ad-controls">
        <button type="button" class="kit-button" :aria-label="playing ? 'Pause' : 'Play from the start'" @click="playing ? pause() : play()">
          {{ playing ? 'Pause' : 'Replay' }}
        </button>
        <div v-if="count > 1" class="kit-toggle" role="group" aria-label="Steps">
          <button
            v-for="n in count"
            :key="n"
            type="button"
            :aria-pressed="step === n"
            :aria-label="`Step ${n}${steps[n - 1] ? `: ${steps[n - 1]}` : ''}`"
            @click="goTo(n)"
          >
            {{ n }}
          </button>
        </div>
      </div>
    </div>

    <div ref="box" class="kit-scroll" :class="{ overflows }">
      <svg
        ref="svg"
        class="ad-svg"
        :viewBox="viewBox"
        role="img"
        :aria-label="label"
        :style="minWidth ? { minWidth: `${minWidth}px` } : undefined"
      >
        <slot />
      </svg>
    </div>
    <p class="kit-hint" :class="{ show: overflows }">Swipe the diagram sideways to see all of it →</p>

    <p v-if="steps.length" class="ad-caption" aria-live="polite">
      <span class="ad-num">{{ Math.max(step, 1) }}/{{ count }}</span> {{ captionNow }}
    </p>
    <figcaption v-if="caption" class="kit-caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.ad-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ad-svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.ad-caption {
  display: flex;
  gap: 10px;
  align-items: baseline;
  min-height: 3em;
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--k-fg-2);
}

.ad-num {
  flex: none;
  font-family: var(--k-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--k-red-text);
}

</style>
