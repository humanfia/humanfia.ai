<script setup lang="ts">
// The hero's board: three flows on one model, one task, one check -- and a score column with
// nothing in it, because FlowBench publishes no numbers until it is released. The flows are
// examples of what is compared, not entrants with results.
import FbFlap from './FbFlap.vue'

const ROWS = ['ralph_loop', 'rlar', 'flame_chase']
</script>

<template>
  <figure class="fb-board" aria-label="A scoreboard of three flows, ralph_loop, rlar and flame_chase, run on the same model against the same real check. The score column is empty: FlowBench is not released and publishes no numbers yet.">
    <div class="fb-board-head">
      <span class="fb-board-name">FlowBench · board</span>
      <span class="fb-board-live"><i aria-hidden="true" />Not released</span>
    </div>
    <div class="fb-board-held" aria-hidden="true">
      <span>Model <b>fixed</b></span><span>Tools <b>fixed</b></span><span>Task <b>hours</b></span><span>Budget <b>fixed</b></span><span>Machine <b>fixed</b></span>
    </div>
    <table class="fb-board-table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Flow</th>
          <th scope="col" class="opt">Model</th>
          <th scope="col" class="opt">Check</th>
          <th scope="col" class="num">Score</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(flow, i) in ROWS" :key="flow">
          <td class="rank">{{ i + 1 }}</td>
          <td><FbFlap :text="flow" :delay="200 + i * 160" /></td>
          <td class="opt"><FbFlap text="same" :delay="700 + i * 160" /></td>
          <td class="opt"><FbFlap text="real" :delay="900 + i * 160" /></td>
          <td class="num red"><FbFlap text="--.-" :delay="1100 + i * 160" :every="9000 + i * 400" /></td>
        </tr>
      </tbody>
    </table>
    <figcaption class="fb-board-foot">
      <span>Flows shown are examples of what is compared.</span>
      <span>No FlowBench numbers are published yet.</span>
    </figcaption>
    <div class="fb-stamp" aria-hidden="true">Unreleased</div>
  </figure>
</template>
