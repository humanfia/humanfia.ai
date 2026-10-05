// A post as a reference: the citation the Cite button (components/Cite.vue) offers, in every
// format a reader is likely to paste it into.
//
// The formatting is Citation.js's, not ours. A post is described once, as a CSL-JSON item, and
// the library writes the BibTeX, BibLaTeX and RIS from it and runs it through citeproc with
// the official CSL style for each prose format. APA 7 ships with @citation-js/plugin-csl; MLA 9,
// Chicago author-date and IEEE are the citation-style-language/styles files in ./csl/, copied
// unchanged and licensed CC BY-SA 3.0 as each file's <rights> says.
//
// The library and the styles are a few hundred kilobytes, so nothing imports this module
// statically: the button loads it the first time somebody reaches for it, and the page itself
// stays the size it was. It is never run on the server.
//
// Two things are adjusted after the library, both in the BibTeX family. BibTeX's @misc gets the
// fields a classic style can print -- `month` as the macro, the url in `howpublished` too -- and
// BibLaTeX's @online gets `organization` rather than the publisher and booktitle it has no use
// for. And a superscript digit in a title ("KDA²") is handed over as markup, so it comes out
// as \textsuperscript{2} rather than folded to a plain "2".
import { Cite, plugins } from '@citation-js/core'
import { parse as parseName } from '@citation-js/name'
import '@citation-js/plugin-bibtex'
import '@citation-js/plugin-csl'
import '@citation-js/plugin-ris'
import chicago from './csl/chicago-author-date.csl?raw'
import ieee from './csl/ieee.csl?raw'
import mla from './csl/modern-language-association.csl?raw'

const SITE = 'https://humanfia.ai'

const styles = plugins.config.get('@csl').styles
styles.add('modern-language-association', mla)
styles.add('chicago-author-date', chicago)
styles.add('ieee', ieee)

/** What the post header knows about a post: everything a citation needs. */
export interface Citable {
  kind: 'blog' | 'news'
  title: string
  /** The byline exactly as the page shows it -- for news, with the dependency leads. */
  authors: string[]
  /** ISO date of publication. */
  date: string
  /** Site-relative, e.g. `/news/2026-10-05-putnambench-672`. */
  path: string
}

export type FormatId = 'bibtex' | 'biblatex' | 'apa' | 'mla' | 'chicago' | 'ieee' | 'ris' | 'csl'

export interface Formatted {
  /** What Copy puts on the clipboard, and what Download saves. */
  text: string
  /** The prose styles as citeproc's HTML, with the italics, for display and rich paste. */
  html?: string
}

const STYLE: Partial<Record<FormatId, string>> = {
  apa: 'apa',
  mla: 'modern-language-association',
  chicago: 'chicago-author-date',
  ieee: 'ieee',
}

/** The digits 0-9, raised and lowered, each at its own index. */
const RAISED = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const LOWERED = '₀₁₂₃₄₅₆₇₈₉'
const markup = (title: string, digits: string, tag: string) =>
  title.replace(new RegExp(`[${digits}]+`, 'g'), (run) => `<${tag}>${[...run].map((c) => digits.indexOf(c)).join('')}</${tag}>`)

/** "Jui-Hui Chung" is given and family; "Humanfia", one word, is an organisation's name. */
function author(name: string) {
  const parsed = parseName(name)
  return parsed.given ? parsed : { literal: name }
}

const parts = (date: Date) => [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()]

/** `humanfia2026putnambench672`: the organisation, the year, and the file's slug. */
export function keyOf(post: Citable) {
  const slug = post.path.split('/').pop()!.replace(/^\d{4}-\d{2}-\d{2}-/, '')
  return `humanfia${new Date(post.date).getUTCFullYear()}${slug.toLowerCase().replace(/[^a-z0-9]/g, '')}`
}

/** The post as one CSL-JSON item, the record every format is written from. */
export function itemOf(post: Citable, accessed = new Date()) {
  const blog = post.kind === 'blog'
  const key = keyOf(post)
  return {
    id: key,
    'citation-key': key,
    type: blog ? 'post-weblog' : 'webpage',
    title: post.title,
    author: post.authors.map(author),
    issued: { 'date-parts': [parts(new Date(post.date))] },
    // The reader's own today, which is what "accessed" means.
    accessed: { 'date-parts': [[accessed.getFullYear(), accessed.getMonth() + 1, accessed.getDate()]] },
    URL: SITE + post.path,
    // The site is the container and says who publishes it; a `publisher` as well would have
    // APA and Chicago name Humanfia twice. APA marks a blog post as one, and a news page as
    // nothing.
    'container-title': blog ? 'Humanfia Blog' : 'Humanfia News',
    ...(blog && { genre: 'Blog post' }),
    note: blog ? 'Humanfia blog post' : 'Humanfia news post',
    language: 'en',
  }
}

/** Citation.js braces every capitalised word of a title so BibTeX keeps its case, except the
 *  first word of each part either side of a colon. A sentence-case style keeps that word's
 *  first letter anyway, but would print "KDA" as "Kda", so a word capitalised past its first
 *  letter is braced too. */
const protectLeading = (title: string) =>
  title
    .split(/(:\s*)/)
    .map((part, i) => (i % 2 ? part : part.replace(/^[A-Za-z0-9]*[A-Z][A-Za-z0-9]*/, (w) => (/[A-Z]/.test(w.slice(1)) ? `{${w}}` : w))))
    .join('')

type Entry = { type: string; label: string; properties: Record<string, string> }

/** One entry, a field a line. A field whose value is null is a bare macro (`month = sep`). */
function bib(type: string, label: string, fields: Record<string, string | undefined | null>, macros: string[] = []) {
  const lines = Object.entries(fields)
    .filter(([, value]) => value !== undefined)
    .map(([field, value]) => `  ${field} = ${macros.includes(field) ? value : `{${value}}`},`)
  return `@${type}{${label},\n${lines.join('\n')}\n}\n`
}

/** Every format for one post. */
export function formatAll(post: Citable, accessed = new Date()): Record<FormatId, Formatted> {
  const item = itemOf(post, accessed)
  const cite = new Cite(item)
  // The same item with superscript and subscript digits as markup, for the TeX formats only.
  const tex = new Cite({
    ...item,
    title: markup(markup(item.title, RAISED, 'sup'), LOWERED, 'sub'),
  })
  const [bt] = tex.format('bibtex', { format: 'object' }) as Entry[]
  const [bl] = tex.format('biblatex', { format: 'object' }) as Entry[]
  const [year, month] = item.issued['date-parts'][0]
  const urldate = bl.properties.urldate

  const out = {
    bibtex: {
      text: bib(
        'misc',
        bt.label,
        {
          title: protectLeading(bt.properties.title),
          author: bt.properties.author,
          year: String(year),
          month: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][month - 1],
          howpublished: `\\url{${item.URL}}`,
          url: item.URL,
          urldate,
          publisher: 'Humanfia',
          note: item.note,
        },
        ['month'],
      ),
    },
    biblatex: {
      text: bib('online', bl.label, {
        title: protectLeading(bl.properties.title),
        author: bl.properties.author,
        date: bl.properties.date,
        url: item.URL,
        urldate,
        organization: 'Humanfia',
        note: item.note,
        langid: 'english',
      }),
    },
    ris: { text: ris(cite) },
    csl: { text: JSON.stringify([item], null, 2) + '\n' },
  } as Record<FormatId, Formatted>

  for (const [id, template] of Object.entries(STYLE) as [FormatId, string][]) {
    const options = { template, lang: 'en-US' }
    out[id] = {
      text: String(cite.format('bibliography', { ...options, format: 'text' })).trim(),
      html: String(cite.format('bibliography', { ...options, format: 'html' })).trim(),
    }
  }
  return out
}

/** RIS from the library's own mapping, written one tag a line: its text output folds long
 *  values at 70 characters, which not every reference manager reads back. */
function ris(cite: InstanceType<typeof Cite>) {
  const [entry] = cite.format('ris', { format: 'object' }) as Record<string, string | string[]>[]
  const lines = [`TY  - ${entry.TY}`]
  for (const [tag, value] of Object.entries(entry)) {
    if (tag !== 'TY') for (const one of [value].flat()) lines.push(`${tag}  - ${one}`)
  }
  return `${lines.join('\n')}\nER  - \n`
}
