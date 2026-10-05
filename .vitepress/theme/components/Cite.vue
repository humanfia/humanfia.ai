<script setup lang="ts">
// The post's Cite button, and the dialog it opens: the post as a reference in eight formats,
// one tab each, with Copy and Download.
//
// The formatting lives in ../cite.ts and is loaded the first time the button is pointed at,
// focused or pressed, so a reader who never cites anything never downloads it. The dialog is
// the platform's own <dialog>, opened modal: the page behind it is inert, Esc closes it, and
// focus goes back to the button. It is rendered only once it has been opened, so the server
// draws the button and nothing else.
import { computed, nextTick, ref, shallowRef } from 'vue'
import type { Citable, FormatId, Formatted } from '../cite'

const props = defineProps<{ post: Citable }>()

const TABS: { id: FormatId; label: string; ext: string; type: string }[] = [
  { id: 'bibtex', label: 'BibTeX', ext: 'bib', type: 'application/x-bibtex' },
  { id: 'biblatex', label: 'BibLaTeX', ext: 'bib', type: 'application/x-bibtex' },
  { id: 'apa', label: 'APA 7', ext: 'txt', type: 'text/plain' },
  { id: 'mla', label: 'MLA 9', ext: 'txt', type: 'text/plain' },
  { id: 'chicago', label: 'Chicago', ext: 'txt', type: 'text/plain' },
  { id: 'ieee', label: 'IEEE', ext: 'txt', type: 'text/plain' },
  { id: 'ris', label: 'RIS', ext: 'ris', type: 'application/x-research-info-systems' },
  { id: 'csl', label: 'CSL-JSON', ext: 'json', type: 'application/vnd.citationstyles.csl+json' },
]

const opened = ref(false)
const dialog = ref<HTMLDialogElement | null>(null)
const button = ref<HTMLButtonElement | null>(null)
const active = ref<FormatId>('bibtex')
const results = shallowRef<Record<FormatId, Formatted>>()
const failed = ref(false)
const copied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | undefined

const tab = computed(() => TABS.find((t) => t.id === active.value)!)
const result = computed(() => results.value?.[active.value])

let loading: Promise<typeof import('../cite')> | undefined
const load = () =>
  (loading ??= import('../cite').catch((error) => {
    loading = undefined
    throw error
  }))
/** Pointing at the button starts the download; a failure here is reported when it is pressed. */
const prefetch = () => load().catch(() => {})

async function open() {
  opened.value = true
  await nextTick()
  dialog.value?.showModal()
  focusTab()
  // Formatted afresh every time: the layout outlives a client-side move to another post, and
  // "accessed" is today.
  failed.value = false
  try {
    const { formatAll } = await load()
    results.value = formatAll(props.post)
  } catch (error) {
    console.error(error)
    failed.value = true
  }
}

function close() {
  dialog.value?.close()
}

/** A click on the backdrop -- which is the dialog itself, outside its panel -- closes it. */
function onDialogClick(event: MouseEvent) {
  if (event.target === dialog.value) close()
}

function onClosed() {
  button.value?.focus()
}

/** The tabs pattern: arrows move along the row and select, Home and End go to its ends. */
function onTabKey(event: KeyboardEvent, index: number) {
  const step = { ArrowRight: 1, ArrowLeft: -1, Home: -index, End: TABS.length - 1 - index }[event.key]
  if (step === undefined) return
  event.preventDefault()
  select((index + step + TABS.length) % TABS.length)
  focusTab()
}

const focusTab = () => document.getElementById(`cite-tab-${active.value}`)?.focus()

function select(index: number) {
  active.value = TABS[index].id
  copied.value = false
}

/** The plain text, and for a prose style the italics too, so a word processor keeps them. */
async function copy() {
  const value = result.value
  if (!value) return
  try {
    if (value.html && typeof ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([value.text], { type: 'text/plain' }),
          'text/html': new Blob([value.html], { type: 'text/html' }),
        }),
      ])
    } else {
      await navigator.clipboard.writeText(value.text)
    }
  } catch {
    // No clipboard permission (or an old browser): select the text so Ctrl-C does it.
    const output = dialog.value?.querySelector('.cite-output')
    if (output) getSelection()?.selectAllChildren(output)
    return
  }
  copied.value = true
  clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => (copied.value = false), 2000)
}

const filename = computed(() => `${props.post.path.split('/').pop()}${active.value === 'biblatex' ? '-biblatex' : ''}.${tab.value.ext}`)
const href = computed(() =>
  result.value ? `data:${tab.value.type};charset=utf-8,${encodeURIComponent(result.value.text)}` : undefined,
)
</script>

<template>
  <button
    ref="button"
    type="button"
    class="cite-button"
    aria-haspopup="dialog"
    @click="open"
    @pointerenter="prefetch"
    @focus="prefetch"
  >
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M2 9.5V13h4.5V8.5H4C4 6.6 4.9 5.4 6.5 5V3C3.7 3.4 2 5.8 2 9.5Zm7.5 0V13H14V8.5h-2.5c0-1.9.9-3.1 2.5-3.5V3c-2.8.4-4.5 2.8-4.5 6.5Z" fill="currentColor" />
    </svg>
    Cite
  </button>

  <Teleport v-if="opened" to="body">
    <dialog ref="dialog" class="cite-dialog" aria-labelledby="cite-title" @click="onDialogClick" @close="onClosed">
      <div class="cite-panel">
        <header class="cite-head">
          <div>
            <p class="cite-kicker">Cite this {{ post.kind === 'news' ? 'news post' : 'post' }}</p>
            <h2 id="cite-title" class="cite-title">{{ post.title }}</h2>
          </div>
          <button type="button" class="cite-close" aria-label="Close" @click="close">
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="M3.5 3.5l9 9m0-9l-9 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" fill="none" />
            </svg>
          </button>
        </header>

        <div class="cite-tabs" role="tablist" aria-label="Citation format">
          <button
            v-for="(t, i) in TABS"
            :id="`cite-tab-${t.id}`"
            :key="t.id"
            type="button"
            role="tab"
            class="cite-tab"
            :aria-selected="t.id === active"
            aria-controls="cite-panel"
            :tabindex="t.id === active ? 0 : -1"
            @click="select(i)"
            @keydown="onTabKey($event, i)"
          >
            {{ t.label }}
          </button>
        </div>

        <div id="cite-panel" class="cite-body" role="tabpanel" :aria-labelledby="`cite-tab-${active}`">
          <p v-if="failed" class="cite-status" role="alert">The citation formatter did not load. Check the connection and try again.</p>
          <p v-else-if="!result" class="cite-status" aria-live="polite">Formatting…</p>
          <!-- citeproc's own HTML for the prose styles: our title, escaped, with its italics. -->
          <div v-else-if="result.html" class="cite-output cite-prose" tabindex="0" v-html="result.html" />
          <pre v-else class="cite-output" tabindex="0"><code>{{ result.text }}</code></pre>
        </div>

        <footer class="cite-actions">
          <button type="button" class="cite-copy" :disabled="!result" @click="copy">
            {{ copied ? 'Copied' : 'Copy' }}
          </button>
          <a v-if="href" class="cite-download" :href="href" :download="filename">Download .{{ tab.ext }}</a>
          <span class="cite-live" aria-live="polite">{{ copied ? `${tab.label} copied to the clipboard` : '' }}</span>
        </footer>
      </div>
    </dialog>
  </Teleport>
</template>
