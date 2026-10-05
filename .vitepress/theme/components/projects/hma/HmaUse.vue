<script setup lang="ts">
// Reproduce it, or use it: the experiment code on one side, the method as a flow on the other,
// and that flow playing under them in the site's own flow player.
import FlowPlayer from '../../flow/FlowPlayer.vue'
import { vReveal } from '../../../home/motion'
</script>

<template>
  <section id="reproduce-it-or-use-it" class="hma-section hma-band" aria-labelledby="reproduce-h">
    <div class="hma-wrap">
      <div class="hma-section-head" v-reveal>
        <p class="hma-kicker"><span class="hma-num">04</span> Your turn</p>
        <h2 id="reproduce-h" class="hma-h2">Reproduce it, or use it</h2>
      </div>

      <div class="hma-two">
        <a class="hma-plate" href="https://github.com/humanfia/hma" target="_blank" rel="noreferrer" v-reveal>
          <p class="hma-mini">Reproduce · humanfia/hma ↗</p>
          <h3>The paper's experiment code</h3>
          <p>
            The native baselines, HMA, natural-termination alternation, the cap and starting-order
            ablations, and the external harness comparisons. Run one experiment on one machine or
            the whole suite on 75, then generate the tables and figures from the runs.
          </p>
        </a>
        <a class="hma-plate ink" href="/flows/fixed-interrupt-flame-chase" v-reveal="100">
          <p class="hma-mini">Use · a Humanize flow</p>
          <h3><code>fixed_interrupt_flame_chase</code></h3>
          <p>
            The same fixed-<i>k</i> alternation, as a flow for
            <span class="u">Humanize</span>: two agents, one workspace, a turn ending after <i>k</i>
            accepted experiments, and a blind review at the end.
          </p>
        </a>
      </div>
      <p class="hma-fine">
        What has and has not been checked is in the repository's
        <a href="https://github.com/humanfia/hma/blob/main/docs/verification.md" target="_blank" rel="noreferrer">validation record</a>.
        For one, the rerun setup still uses the public upstream answer keys, not the manuscript's
        corrected ones. Humanize itself is <a href="/projects/humanize">here</a>.
      </p>

      <div class="hma-player" v-reveal>
        <FlowPlayer flow="fixed_interrupt_flame_chase" />
      </div>
    </div>
  </section>
</template>
