# Writing a post

Every file in `news/` and `blog/` (except the two `index.md`) is drawn by the post layout,
`.vitepress/theme/components/PostLayout.vue`. You do not ask for it: `config.mts` sets
`layout: post` for those files. This guide covers what a post gets for free, and the kit of
figures it can use. The kit lives in `.vitepress/theme/components/kit/`, and its components are
registered globally, so a post writes `<BarChart … />` straight into its markdown.

The bar is [KDA²](blog/2026-09-27-kda-for-kda.md), which uses almost every component below. Read
its source next to the rendered page.

## What every post gets

- **The hero** (`PostMeta.vue`) is built from the frontmatter. It shows the tag, the section,
  the date, the reading time, the title, the `description` as the standfirst, and the
  `authors` with their GitHub faces (`theme/people.ts` maps names to accounts). A title with a
  colon in its first 28 characters is set as a display line and a subtitle.
- **An optional headline figure** sits to the right of the hero copy. Add it with a `hero:`
  block. Without one, the hero shows the tag in outline on the diagonal.

  ```yaml
  hero:
    kicker: KDA → KDA · B300 forward
    value: 2.96          # counts up from `from`
    from: 1
    decimals: 2
    suffix: ×
    label: geomean speedup over FlashKDA
    board:               # optional: a small leaderboard under the number
      - { name: KDA + TIRx, score: 2.96, us: true }
      - { name: FlashKDA, score: 1 }
  ```

- **Sections.** Each `##` is numbered automatically (01, 02, …). On screens 1360px and wider,
  the sections are listed in a sticky contents column on the left.
- **A reading-progress rule** under the nav, **"Read next"** (three related posts, chosen by
  tag first), and an edit link.
- **Typography for the markdown you already write.** A `>` blockquote becomes a pull-quote. A
  markdown table, a fenced code block, and a `---` rule are each styled to match. To make a
  definitions strip, wrap a list in `<div class="defs">` (leave a blank line inside the div).

## Layout and widths

Text sits in a 680px column. Kit figures may step out into the right margin (980px in all).
On a phone everything is one column, and plots that are too wide scroll sideways rather than
shrink their labels. Text is never smaller than 11px. The charts lay themselves out in real
pixels, so that holds at any width.

## Data

Every component takes its data as props. Short data goes inline. Long series go in the
frontmatter and are referenced with `$frontmatter`:

```md
---
speedup:
  - { label: H96 fixed, values: { ours: 3.11, base: 2.76 } }
---

<BarChart :rows="$frontmatter.speedup" … />
```

In props, `:prop` binds an expression (numbers, arrays, `$frontmatter`), and a plain `prop` is
a string. Kebab-case works (`min-width`, `before-label`).

## Colours

Series take a `tone`: `red` (ours, the thing to look at), `ink` (the comparison), `grey` (the
baseline), or `pale` (context). Every tone is a CSS variable, so light and dark mode flip
live. Never write a hex value in a post. Give a baseline `hatched: true` or `dashed: true`
too, so it is not told apart by colour alone. Add `invert` to a figure to draw it the other
way round from the page, for the one or two figures that carry the headline.

## The kit

Every chart has a **Data** button that swaps in its numbers as a sortable table. Every chart
also takes `kicker` (the mono label), `title`, `caption`, and `label`, which is the
one-sentence description a screen reader announces. Always write `label`.

### BarChart

Shows speedups, grouped comparisons and ablations. A reader can hover or focus a row to read
it (arrow keys walk the rows), switch series on and off from the legend, switch datasets, and
switch the baseline.

```md
<BarChart
  kicker="Speedup vs. FlashKDA"
  label="…"
  :series="[{ key: 'cute', label: 'CuTe', tone: 'ink' }, { key: 'tirx', label: 'TIRx', tone: 'red' }]"
  :rows="[{ label: 'H96 fixed', detail: '1 × 8192', values: { cute: 2.76, tirx: 3.11 } },
          { label: 'Geomean', values: { cute: 2.85, tirx: 2.96 }, total: true }]"
  :reference="{ value: 1, label: 'FlashKDA 1.00×' }"
  :baselines="['cute']"
  suffix="×" :decimals="2" :max="4"
/>
```

- `orientation="vertical"` draws columns.
- `datasets` is `[{ key, label, rows, max? }]` and replaces `rows` with a toggle.
- `baselines` lists the series a reader may compare against. With `compare="ratio"` (the
  default), the bars rescale to "× the baseline". With `compare="delta"`, each bar is labelled
  with its gain. `baseline` picks the starting choice.

### LineChart

Shows curves and timelines. The plot is a scrubber: pointer, touch, or arrow keys (Shift for ten
steps, Home and End to jump). It sweeps once when it first comes on screen.

```md
<LineChart
  kicker="…" label="…"
  :series="[{ key: 'ours', label: 'Ours', tone: 'red', data: $frontmatter.ours, step: true, dots: true }]"
  :x="{ min: 0, max: 16, suffix: 'h', decimals: 1, tickDecimals: 0, label: 'Hour' }"
  :y="{ min: 0.4, max: 2, suffix: '×', decimals: 2, tickDecimals: 1 }"
  :reference="{ y: 1, label: 'Baseline = 1.0×' }"
/>
```

- A series takes `data: [[x, y], …]`, plus optional `step`, `dashed`, `dots` and `area`.
- `x.categories` turns x into named steps, and a point's x is then its index.
- `x.divide` and `x.suffix` format ticks (8192 → "8k"). `x.unit` formats the readout
  (" tokens").
- `annotations: [{ x, y, label, detail, tone }]` rings points and adds a numbered key below.
- `min-width` is the narrowest the plot may be drawn. Below that it scrolls sideways.

### ScatterChart

```md
<ScatterChart
  label="…"
  :groups="[{ key: 'us', label: 'Humanfia', tone: 'red' }, { key: 'them', label: 'Others', tone: 'grey' }]"
  :points="[{ x: 44.5, y: 672, group: 'us', label: 'Humanfia', highlight: true }, …]"
  :x="{ label: 'Cost per problem', prefix: '$', log: true }" :y="{ label: 'Solved' }"
/>
```

Hovering picks out the nearest point, and the arrow keys walk the points. `highlight` labels a
point permanently, `diagonal` draws y = x, and `log` sets a log axis.

### SwipeCompare

A before/after pair with a divider to drag. The reader can drag anywhere on the figure, or
focus the handle and use the arrow keys. Each slot can hold anything. Keep the markup inside it
unindented and with no blank lines, or markdown will treat it as code.

```md
<SwipeCompare kicker="…" before-label="Random tests" after-label="Real inputs">
<template #before>
<table>…</table>
</template>
<template #after>
<table>…</table>
</template>
</SwipeCompare>
```

### ResultsTable

A table that sorts by any column, pins a row on click (or Enter), and draws numbers as bars.
The row whose `highlight` field is true is ours and is drawn in red.

```md
<ResultsTable
  caption="PutnamBench · Lean"
  :columns="[{ key: 'entry', label: 'Entry' }, { key: 'cost', label: 'Cost', prefix: '$', decimals: 2, bar: true, lowerIsBetter: true }]"
  :rows="[{ entry: 'Humanfia', cost: 44.5, highlight: true }, { entry: 'Other', cost: 74 }]"
  sort="cost"
/>
```

### Leaderboard

Shows a ranking. Give entries a `from` (their previous rank), and the board opens in the old
order and re-sorts itself into the new one. `lowerIsBetter` ranks by the smallest score.

```md
<Leaderboard kicker="Lean-Eval" :entries="[{ name: 'Humanfia', score: 172, us: true, from: 2 }, { name: 'Other', score: 160, from: 1 }]" />
```

### NumberTicker and StatGrid

`<NumberTicker :value="2.96" :from="1" :decimals="2" suffix="×" />` counts up inline, and a
screen reader reads the final value. `StatGrid` is a row of big stat callouts; `lead` inverts
the first.

```md
<StatGrid lead :items="[{ value: 2.96, from: 2.54, decimals: 2, suffix: '×', kicker: 'TIRx', text: '…' }]" />
```

### RangeMeter

Shows one quantity on a scale with marks and zones. The value runs up when the meter is first
seen, then becomes a range input, and the status line names the zone it is in.

```md
<RangeMeter kicker="…" unit=" bits" :max="650" :value="600" status="Hack D on this input"
  :markers="[{ value: 126, label: '126 bits', note: 'underflows to 0' }]"
  :zones="[{ from: 0, to: 126, label: 'test passes' }, { from: 126, to: 650, label: 'NaN', tone: 'red' }]" />
```

### LoopCompare

Shows feedback loops side by side. Each ring turns at its real period.

```md
<LoopCompare unit="min / test" :loops="[{ title: 'One shape', period: 0.9, stats: [{ value: 248, label: 'tests' }] }, …]" />
```

### AnimatedDiagram

A GSAP scaffold for an SVG diagram that builds itself in steps, with Replay and step buttons
and a caption per step. Write the SVG inside it and mark its elements:

| attribute | effect |
| --- | --- |
| `data-step="2"` | the element appears in step 2; unmarked elements are always shown |
| `data-draw` | a stroke draws itself on |
| `data-pop` | the element scales up from its own centre |
| `data-travel="#path"` | the element rides along that path |
| `data-stop="0.6"` | the ride stops 60% of the way along and the element flashes, refused |
| `data-loop` | after the build, the ride repeats while the diagram is on screen |

Paint shapes with the classes `ink`, `red`, `grey`, `paper`, `frame`, and `line` (plus `dash`).
Text takes `ink`, `red`, `on-ink` or `on-red`, and a size class: 13px by default, `t-lg` 17px,
`t-xl` 22px. Type is sized in screen pixels at any width, so leave room for it in the shapes.

```md
<AnimatedDiagram view-box="0 0 600 250" :min-width="300" label="…" :steps="['One', 'Two']">
  <path id="p" class="line dash" d="M150 85 C 220 25, 380 25, 450 85" data-step="2" data-draw />
  <rect class="ink" x="20" y="85" width="200" height="80" data-step="1" data-pop />
  <rect class="red" x="-7" y="-7" width="14" height="14" data-step="2" data-travel="#p" data-loop />
</AnimatedDiagram>
```

### Prose pieces

- `<Sidenote>…</Sidenote>`, inline in a sentence, puts a numbered note in the right margin. On a
  phone it becomes a button that opens the note in place.
- `<PullQuote cite="…">…</PullQuote>` is a pull-quote with attribution. A plain `>` blockquote
  is styled the same way.
- `<PostFigure src="…" alt="…" caption="…" width="wide" />` is an image (or slot content)
  with a numbered caption. `width` is `text`, `wide` or `full`.
- `<PostCards numbered>` wraps `<PostCard kicker title metric metric-label badge invert>`
  cards. Each card's body is markdown, with blank lines around it.

## Motion and accessibility

Every animation plays once, when the figure first comes on screen. A reader who asked for
reduced motion gets the finished state straight away, with nothing looping. Every control is a
real button, slider or input with a label, and every chart announces its readout politely.
Keep both true when you add a component. Before you open a pull request, check your post in
light and dark, at 1440px and at 375px.
