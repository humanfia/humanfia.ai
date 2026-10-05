import { onMounted, ref } from 'vue'
import { prefersReducedMotion } from '../../../home/motion'

// The KDA page's one rule about motion: nothing moves until the page has mounted, and nothing
// moves at all for a reader who asked for less. `motion` is false on the server and on the first
// client render, so what is server-rendered is always the final, still state of every figure.
export function useMotion() {
  const motion = ref(false)
  onMounted(() => {
    motion.value = !prefersReducedMotion()
  })
  return motion
}

/** A speedup the way the page writes one. */
export const times = (v: number, decimals = 2) => `${v.toFixed(decimals)}×`
