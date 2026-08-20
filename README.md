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

Then `pnpm build` to build it, and `pnpm check:anchors` afterwards to check that every
`#fragment` in the Markdown resolves to a heading the site really built — VitePress checks
that a link's *page* exists and stops there.

## Layout

```
.
├── index.md            the home page
├── projects/           one list: FlowBench, HOA, KDA, AgentKaggle
├── about/              who we are
├── blog/               one Markdown file per post, and one post per result
├── public/             CNAME, the logo and favicon, og.png, robots.txt,
│                       and the redirects for the pages this layout replaced
├── scripts/            og.py, which draws the social card
└── .vitepress/
    ├── config.mts      nav, sidebar, and the RSS feed
    ├── anchors.mjs     the #fragment check
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
and nothing here restates it. The home page does carry an install block for it — it is the
runtime everything else on the site runs on, and sending a first-time reader to another domain
to find one command was the wrong trade — but the block links out for anything past the first
command.

There is no results section. A result is a blog post, dated, with the people who produced it
named under the title; the project pages carry a table of what has been done and link to the
post for each row, rather than holding a second copy of the numbers that can drift out of step.

The home page is components, not prose, in `.vitepress/theme/components/`:

- `News` — the newest posts, rotating on their own, read off the same build-time list the blog
  index and the RSS feed read.
- `Install` — Humanize 2, three ways, with the commands the documentation actually gives.
- `SystemMap` — the interactive architecture diagram, and `ArchStack` for the widths it cannot
  be read at.

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

The index page, the blog sidebar, the news reel on the home page and `blog/feed.rss` are all
generated from that — there is no list to update.

## Deployment

Every push to `main` builds and deploys to GitHub Pages via
`.github/workflows/deploy.yml`; pull requests build without deploying, so a dead link fails
before it is published. The custom domain is set by `public/CNAME`.
