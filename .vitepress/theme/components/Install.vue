<script setup lang="ts">
// Humanize, installed. The documentation is a site of its own and this is not a copy of it:
// it is the one screen that gets somebody from nothing to a flow running, and then hands them
// over. Three ways in, because a Python tool that is only ever `pip install`ed in a README is
// a tool half its readers cannot use.
import { computed, onBeforeUnmount, ref } from 'vue'

const DOCS = 'https://docs.humanfia.ai/humanize'
const REPO = 'https://github.com/humanfia/humanize'

interface Way {
  key: string
  label: string
  note: string
  lines: string[]
}

const WAYS: Way[] = [
  {
    key: 'uv',
    label: 'uv',
    note: 'As a standalone tool on your PATH.',
    lines: ['uv tool install hmz'],
  },
  {
    key: 'pip',
    label: 'pip',
    note: 'Into your current environment.',
    lines: ['pip install hmz'],
  },
  {
    key: 'uvx',
    label: 'uvx',
    note: 'The newest release, run without installing it.',
    lines: ['uvx hmz@latest'],
  },
  {
    key: 'source',
    label: 'from source',
    note: 'A checkout you can change and send pull requests from.',
    lines: [`git clone ${REPO}.git`, 'cd humanize', 'uv sync'],
  },
]

const at = ref(0)
const way = computed(() => WAYS[at.value])
const copied = ref(false)
let clear: ReturnType<typeof setTimeout> | undefined

async function copy() {
  const text = way.value.lines.join('\n')
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // A page served over plain http, or a browser that refuses without a gesture it recognises.
    // Selecting it is still better than nothing.
    const box = document.createElement('textarea')
    box.value = text
    box.setAttribute('readonly', '')
    box.style.position = 'fixed'
    box.style.opacity = '0'
    document.body.appendChild(box)
    box.select()
    document.execCommand('copy')
    box.remove()
  }
  copied.value = true
  clearTimeout(clear)
  clear = setTimeout(() => (copied.value = false), 1800)
}

onBeforeUnmount(() => clearTimeout(clear))

const pick = (i: number) => {
  at.value = i
  copied.value = false
}

const STEPS = [
  {
    n: '01',
    title: 'Check it landed',
    body: 'No account needed.',
    lines: ['hmz --version'],
  },
  {
    n: '02',
    title: 'Log into an agent you already have',
    body: 'Any supported coding-agent CLI, under your own subscription.',
    lines: ['claude auth login', 'codex login'],
  },
  {
    n: '03',
    title: 'Run a flow',
    body: 'One agent, one question, traced.',
    lines: ['hmz exec -f chat -a assistant=claude/claude-opus-5:high "What does this repository do?"'],
  },
]
</script>

<template>
  <!-- The wrapper is the query container: this block sits both in a full-width home page
       section and in a documentation column half that wide, and it should lay itself out
       against the space it was actually given rather than against the window. -->
  <div class="install-wrap">
    <div class="install">
      <div class="install-main">
        <div class="install-head">
          <div class="install-tabs" role="tablist" aria-label="How to install Humanize">
            <button
              v-for="(item, i) in WAYS"
              :key="item.key"
              type="button"
              role="tab"
              class="install-tab"
              :class="{ on: at === i }"
              :aria-selected="at === i"
              :tabindex="at === i ? 0 : -1"
              @click="pick(i)"
            >
              {{ item.label }}
            </button>
          </div>
          <!-- Beside the tabs rather than inside the command box: the install line is nearly
               as wide as the card, and a button sharing that row costs it enough space to
               wrap. -->
          <button type="button" class="install-copy" :class="{ done: copied }" @click="copy">
            {{ copied ? 'copied' : 'copy' }}
          </button>
        </div>

        <div class="install-term">
          <code>
            <span v-for="line in way.lines" :key="line" class="install-line">
              <span class="install-prompt" aria-hidden="true">$</span>{{ line }}
            </span>
          </code>
        </div>

        <p class="install-note">{{ way.note }}</p>

        <p class="install-req">
          Python ≥ 3.12 · API key optional
        </p>

        <p class="install-links">
          <a :href="`${DOCS}/user/installation`">The installation guide ↗</a>
          <a :href="`${DOCS}/user/desktop`">Humanize Desktop for macOS ↗</a>
          <a :href="REPO">GitHub ↗</a>
        </p>
      </div>

      <ol class="install-steps">
        <li v-for="step in STEPS" :key="step.n">
          <span class="install-n">{{ step.n }}</span>
          <div>
            <strong>{{ step.title }}</strong>
            <p>{{ step.body }}</p>
            <code>
              <span v-for="line in step.lines" :key="line">{{ line }}</span>
            </code>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.install-wrap {
  container-type: inline-size;
}

.install {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 1fr);
  gap: 20px;
  margin: 28px 0 0;
}

/* ---- The command ------------------------------------------------------------------------ */

.install-main {
  display: flex;
  flex-direction: column;
  padding: 22px 24px 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
}

.install-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.install-tabs {
  display: flex;
  gap: 4px;
}

.install-tab {
  padding: 6px 13px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: none;
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  color: var(--vp-c-text-3);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background-color 0.2s;
}

.install-tab:hover {
  color: var(--vp-c-text-1);
}

.install-tab.on {
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.install-term {
  padding: 16px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.install-term code {
  display: block;
  font-family: var(--vp-font-family-mono);
  font-size: 13.5px;
  line-height: 1.85;
  color: var(--vp-c-text-1);
  background: none;
  padding: 0;
}

/* The install URL is longer than the card, and a command a reader cannot see the end of is
   worse than one that wraps. `anywhere` rather than `break-word` so the URL breaks too. */
.install-line {
  display: block;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.install-prompt {
  display: inline-block;
  width: 1.35em;
  color: var(--vp-c-brand-1);
  user-select: none;
}

.install-copy {
  flex: none;
  padding: 4px 11px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 7px;
  background: var(--vp-c-bg-soft);
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  color: var(--vp-c-text-3);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.install-copy:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.install-copy.done {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.install-note {
  margin: 14px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.install-req {
  margin: 10px 0 0;
  /* Takes up whatever height the card has spare, so the links below sit on its bottom edge
     when the two columns are the same height -- and keep their own margin when they are not. */
  margin-bottom: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  line-height: 1.7;
  color: var(--vp-c-text-3);
}

.install-links {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  margin: 24px 0 0;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 13.5px;
}

.install-links a {
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.install-links a:hover {
  text-decoration: underline;
}

/* ---- And then what ---------------------------------------------------------------------- */

.install-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.install-steps li {
  display: flex;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.install-n {
  flex: none;
  padding-top: 1px;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.install-steps strong {
  display: block;
  font-size: 14.5px;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
}

.install-steps p {
  margin: 5px 0 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--vp-c-text-3);
}

.install-steps code {
  display: block;
  margin-top: 10px;
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

.install-steps code span {
  display: block;
  white-space: pre;
  overflow-x: auto;
}

/* A flex child will not shrink below its content unless it is told it may, and a long
   `hmz exec` line is exactly the content that would otherwise push out of the card. */
.install-steps li > div {
  min-width: 0;
}

@container (max-width: 760px) {
  .install {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 899px) {
  /* `minmax(0, 1fr)` rather than `1fr`: a bare `1fr` floors the track at the widest thing in
     it, and on a 320px screen the terminal card's min-content is wider than the column, so the
     card pushed the whole page a few pixels past the right edge. This lets the track be the
     width it is given and leaves the wrapping to the card, which already handles it. */
  .install {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
