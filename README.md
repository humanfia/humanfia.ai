# humanfia.ai

The Humanfia website: [humanfia.ai](https://humanfia.ai/).

A [VitePress](https://vitepress.dev/) site, built the same way as
[humanize's documentation](https://hmz.humanfia.ai/) so that the two read as one thing and
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
├── stack/              how the projects fit together
├── projects/           humanize, flowverse, flowbench, oh-my-humanize
├── applications/       KDA, HOA
├── flows/              the loops themselves
├── results/            what has shipped, and how to check it
├── about/              who we are
├── blog/               one Markdown file per post
├── public/             CNAME, the logo and favicon, og.png, demo/ recordings, robots.txt
├── scripts/            og.py and posters.py, which draw the images that are not photographs
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

## The home page

It is components, not prose: `InstallLine`, `Numbers`, `SystemMap`, `DeepTech` and `Gallery`,
in `.vitepress/theme/components/`. Everything about *using* humanize lives in
[its own documentation](https://hmz.humanfia.ai/) — the home page has one install line and
links out, so there is no second copy of the instructions to keep current.

The gallery plays recordings from `public/demo/`, which are made in the humanize repository and
copied here. Each one needs a still to show before it is hovered:

```sh
uv run --with pillow scripts/posters.py
```

That walks every frame of every GIF and keeps the fullest one from the back half of the
recording, which is the frame that shows the command actually having done something.

## Writing a post

One file in `blog/`, named `YYYY-MM-DD-slug.md`, with frontmatter:

```yaml
---
title: Four layers and a referee
description: One sentence, used on the index page and in the RSS feed.
date: 2026-08-17
author: Humanfia
tag: Architecture
---
```

The index page and `blog/feed.rss` are both generated from that — there is no list to update.

## Deployment

Every push to `main` builds and deploys to GitHub Pages via
`.github/workflows/deploy.yml`; pull requests build without deploying, so a dead link fails
before it is published. The custom domain is set by `public/CNAME`.
