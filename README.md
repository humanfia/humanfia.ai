# humanfia.ai

The Humanfia website: [humanfia.ai](https://humanfia.ai/).

A [VitePress](https://vitepress.dev/) site, built the same way as
[Humanize's documentation](https://docs.humanfia.ai/humanize2/) so that the two read as one thing and
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
- `pnpm check:docs` — every link to Humanize's documentation reaches the page it names. That
  site moves pages and leaves a `<meta refresh>` stub behind, so a link written against an
  older layout answers 200 and is invisible to the other two. This one reads the stub. It is
  the only check that needs the network, and it does not need the build.

## Layout

```
.
├── .env                VITE_EXTRA_EXTENSIONS=rss, so the router leaves feed links alone
├── index.md            the home page
├── projects/           one list: Humanize, the RLCR Loop, FlowBench, HOA, KDA, AgentKaggle
├── team/               who does what, by project
├── about/              what we believe, and how to reach us
├── blog/               one Markdown file per post, and one post per result
├── public/             CNAME, the logo and favicon, og.png, robots.txt,
│                       and the redirects for the pages this layout replaced
├── scripts/            og.py, which draws the social card
└── .vitepress/
    ├── config.mts      nav, sidebar, and the RSS feed
    ├── anchors.mjs     the #fragment check
    ├── feed.mjs        the RSS feed check
    ├── docs-links.mjs  the check on every link out to Humanize's documentation
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

Humanfia is the team. This site carries the team, its projects and its results; Humanize
itself is documented at
[docs.humanfia.ai/humanize2](https://docs.humanfia.ai/humanize2/), which is a site of its own,
and nothing here restates it. The install block lives on the Humanize project page rather than
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

The runtime is called **Humanize**, and the URLs of its documentation still say `humanize2`
because that is where the site is served from. Its documentation moved `guide/` to `user/` and
`weaver/` and serves redirect stubs from the old paths, so a link that still says `guide/`
works and is still wrong — `pnpm check:docs` is what says so.

The Claude Code plugin it grew out of — the first Humanize — is
[the RLCR Loop](projects/rlcr-loop.md), and it is a project of its own here.

There is no results section. A result is a blog post, dated, with the people who produced it
named under the title; the project pages carry a table of what has been done and link to the
post for each row, rather than holding a second copy of the numbers that can drift out of step.

The home page is components, not prose, in `.vitepress/theme/components/`:

- `PostMosaic` — every post, tiled at unequal sizes, read off the same build-time list the RSS
  feed reads. The blog index renders the same component with `:limit="0"`.
- `SystemMap` — the interactive architecture diagram, and `ArchStack` for the widths it cannot
  be read at. `fit` sizes it to end where the screen does.
- `TeamRoster` — the team page: who proposed Humanize, who built the team, and each project's
  people with the lead first. Faces are GitHub avatars addressed by numeric account id.
- `Install` — Humanize, three ways, with the commands the documentation actually gives.

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
