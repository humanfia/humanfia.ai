# humanfia.ai

The Humanfia website: [humanfia.ai](https://humanfia.ai/).

A [VitePress](https://vitepress.dev/) site, built the same way as
[Humanize 2's documentation](https://docs.humanfia.ai/humanize2/) so that the two read as one thing and
neither has a build system of its own to learn.

## Local preview

Needs Node.js 22+ and [pnpm](https://pnpm.io/).

```sh
pnpm install
pnpm dev
```

Then `pnpm build` to build it, and three checks, all of which CI also runs:

- `pnpm check:anchors` — every `#fragment` in the Markdown resolves to a heading the site
  really built. VitePress checks that a link's *page* exists and stops there.
- `pnpm check:feed` — `blog/feed.rss` holds every post, every link in it was built, and the
  router will let a click on a link to it through. That last one is why `.env` exists: the
  router answers a click on any extension it does not recognise in-app, its list has `xml` on
  it and not `rss`, and every link to the feed used to land on the 404 page.
- `pnpm check:docs` — every link to Humanize 2's documentation reaches the page it names. That
  site moves pages and leaves a `<meta refresh>` stub behind, so a link written against an
  older layout answers 200 and is invisible to the other two. This one reads the stub. It is
  the only check that needs the network, and it does not need the build.

## Layout

```
.
├── .env                VITE_EXTRA_EXTENSIONS=rss, so the router leaves feed links alone
├── index.md            the home page
├── projects/           six pages, no index: Humanize 2, Humanize 1, FlowBench, HOA, KDA,
│                       AgentKaggle. The nav's Projects menu is the list.
├── team/               who does what, by project
├── about/              what we believe, and how to reach us
├── blog/               one Markdown file per post, and one post per result
├── public/             CNAME, the logo and favicon, og.png, robots.txt,
│                       and the redirects for the pages this layout replaced
├── scripts/            og.py, which draws the social card
└── .vitepress/
    ├── config.mts      nav (Projects is a menu), sidebar, and the RSS feed
    ├── anchors.mjs     the #fragment check
    ├── feed.mjs        the RSS feed check
    ├── docs-links.mjs  the check on every link out to Humanize 2's documentation
    └── theme/          the default theme, plus this site's palette and components
```

## The palette

One hue. `.vitepress/theme/style.css` holds every colour the site uses as an `--hf-*` token;
components read those and name none of their own. The logo is the same slate on paper
(`public/logo.svg`) and a matte, faintly blue white in the dark (`public/logo-dark.svg`) —
two files rather than one, because the nav logo is an `<img>` and cannot inherit `currentColor`.

The social card is generated from the same two sources rather than drawn by hand:

```sh
uv run --with cairosvg scripts/og.py
```

## What is and is not on this site

Humanfia is the team. This site carries the team, its projects and its results; Humanize 2
itself is documented at
[docs.humanfia.ai/humanize2](https://docs.humanfia.ai/humanize2/), which is a site of its own,
and nothing here restates it. The install block lives on the Humanize 2 project page rather than
the home page, and it links out for anything past the first command.

**How this site links to that one.** The way to the documentation is the page of the project it
documents, so every link out to it is on `/projects/humanize` — the top of it is a plate that
goes to the front page of the documentation, and that plate is the loudest link on the page.
Everywhere else, including every blog post, the runtime links to `/projects/humanize` instead.
The deep links that remain are counted rather than sprinkled: the features index, the flow
catalogue, security, the CLI reference, and one contextual link under each figure or recorded
screen that is about a particular page. Adding another is a decision, not a reflex — a card
that describes what the runtime does does not need to be a link to a page that describes the
same thing, and a link that appears twice on one page is one link.

The runtime is **Humanize 2: Agent Flow System**, and its documentation is served from
`humanize2`, so the name and the URL say the same number. That documentation moved `guide/` to
`user/` and `weaver/` and serves redirect stubs from the old paths, so a link that still says
`guide/` works and is still wrong — `pnpm check:docs` is what says so.

The Claude Code plugin it grew out of is [Humanize 1: RLCR Loop](projects/rlcr-loop.md), and it
is a project of its own here. RLCR is **Ralph Loop with Codex Review**.

**How the two are named.** They are one lineage, numbered: Humanize 1 is the plugin, Humanize 2
is the runtime. The full name — `Humanize 2: Agent Flow System`, `Humanize 1: RLCR Loop` — is
used where the product is being *labelled*: a page's H1 and description, a nav or sidebar entry,
a card heading, a roster entry. Running prose uses the short form, `Humanize 2` and
`Humanize 1`, from the first sentence on. A subtitle repeated mid-paragraph is the same mistake
as a person's affiliation repeated under every project they touched.

Three things keep the old word and are not the products: **HOA** is *Humanize Olympic Agents*,
the URLs and repositories are `humanize2` and `PolyArch/humanize`, and `entry: 'Humanize'` in
`LayerStack.vue` is a symbol in the runtime's own source.

There is no projects index. A page whose whole job was to list six links cost a page load to
say what the nav's Projects menu says without one, and each of those six opens with the
sentence the index was paraphrasing. `/projects/` is a redirect now.

There is no results section. A result is a blog post, dated, with the people who produced it
named under the title; the project pages carry a table of what has been done and link to the
post for each row, rather than holding a second copy of the numbers that can drift out of step.

The home page is components, not prose, in `.vitepress/theme/components/`:

- `PostMosaic` — every post, tiled at unequal sizes, read off the same build-time list the RSS
  feed reads. The blog index renders the same component with `:limit="0"`.
- `SystemMap` — the interactive architecture diagram, and `ArchStack` for the widths it cannot
  be read at. `fit` sizes it to end where the screen does.
- `TeamRoster` — the team page: who proposed Humanize 1, who built the team, and each project's
  people with the lead first. Faces are GitHub avatars addressed by numeric account id.
- `Install` — Humanize 2, three ways, with the commands the documentation actually gives.

The home page is three screens: the hero, about two screens of posts, and the ecosystem
diagram. The hero and the diagram each take a window (`.hf-screen` in `theme/style.css`), so
neither ends half-way up the next one.

## Writing a post

One file in `blog/`, named `YYYY-MM-DD-slug.md`, with frontmatter:

```yaml
---
title: Four layers and a referee
description: One sentence, used on the index page and in the RSS feed.
date: 2026-08-17
authors:
  - Zhengyang Zhang
  - Hongzhou Lin
tag: Architecture
---
```

Do **not** write an `#` heading at the top of a post: `title` is the H1, rendered by
`PostMeta.vue` so that the author list can sit underneath it. `authors` is a list even when it
has one name in it.

The index page, the blog sidebar, the mosaic on the home page and `blog/feed.rss` are all
generated from that — there is no list to update.

## Deployment

Every push to `main` builds and deploys to GitHub Pages via
`.github/workflows/deploy.yml`; pull requests build without deploying, so a dead link fails
before it is published. The custom domain is set by `public/CNAME`.
