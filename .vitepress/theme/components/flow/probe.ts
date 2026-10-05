// How a script driving a browser gets hold of a flow player.
//
// Played on a clock, a scene is wherever the clock has got it to when a screenshot is taken,
// and a busy machine takes it later: the same script would catch a different moment every run.
// So it does not play a scene. It holds it still at one moment of its timeline after another,
// the same moments every run. Every player lists itself here for that, and only in a browser
// driven by automation: a reader's browser never has `window.__hmzScenes`. The name and shape
// are the ones humanize's documentation uses, so one script reads both sites.

export interface Probe {
  /** The scene's outermost element, `.hmz-flow-player`. */
  root: () => Element | null
  /** Seconds in one pass of its timeline. */
  duration: () => number
  /** The moments, in seconds, where it comes to rest for a reader: where a chapter ends, a
   *  step lands, or the scene holds still. A word too small there is too small, however
   *  briefly it is drawn. */
  settled: () => number[]
  /** Pause it `t` seconds into a pass, drawn as it is there. Resolves once the page shows it. */
  seek: (t: number) => Promise<void>
}

declare global {
  interface Window {
    __hmzScenes?: Probe[]
  }
}

/** List a scene for the check, if a check is driving this browser. Returns how to unlist it. */
export function probe(scene: Probe): () => void {
  if (typeof window === 'undefined' || !navigator.webdriver) return () => {}
  const all = (window.__hmzScenes ??= [])
  all.push(scene)
  return () => {
    const at = all.indexOf(scene)
    if (at >= 0) all.splice(at, 1)
  }
}
