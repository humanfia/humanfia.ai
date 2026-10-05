# humanfia.ai

The Humanfia website: the team, its projects and its results, built with VitePress. It is
served at [humanfia.ai](https://humanfia.ai/).

## Usage

Needs Node.js 22+ and [pnpm](https://pnpm.io/).

```sh
pnpm install
pnpm dev      # local preview
pnpm build    # build into .vitepress/dist
```

Pages are Markdown: `index.md`, `projects/`, `flows/`, `research/`, `about/`, and one file per
post in `news/` or `blog/`. Files in `public/` are published as they are. The Humanize page,
Deep Tech included, is one component: `.vitepress/theme/components/projects/humanize/`.

The figures on the research pages are drawn by `.vitepress/theme/components/research/`: a line
chart with log and hand-spaced axes the post kit does not have yet, and the data it plots, read
off the charts in our talk slides (`deck-data.json`, described in `figures.ts`).

The HMA page (`projects/hma.md`) is one full-width component,
`.vitepress/theme/components/projects/hma/`; its numbers live in `data.ts` there, each with its
source.

The KDA page (`projects/kda.md`) is drawn by its own components,
`.vitepress/theme/components/projects/kda/`; its numbers live in the page's frontmatter, each
block naming the write-up it comes from.

### Adding a post

A post is one file, named `YYYY-MM-DD-slug.md`. Put results in `news/`: one result per post.
Put essays and arguments in `blog/`. Start the file with this frontmatter:

```yaml
---
title: "What was done, in one line"
description: One or two sentences for the standfirst, the card, the feed and search engines.
date: 2026-10-05
authors:
  - Your Name
tag: HOA
---
```

`tag` is the project the post belongs to. A news post credits more than its `authors`: its
byline, everywhere it is shown and in the feed, adds the leads and co-leads of every project
the tagged project is built on, transitively. An HOA result therefore also names the Humanize
lead, and a post about Humanize itself adds nobody. Projects, their tags, leads and
dependencies live in one registry, `.vitepress/theme/projects.ts`, which the team roster reads
too; a news tag it does not list fails the build. Everything else is generated from the frontmatter:
the post's page (its hero, contents, related posts and a Cite button that exports the
post in BibTeX, BibLaTeX, APA, MLA, Chicago, IEEE, RIS and CSL-JSON), the section index (a list for news,
a mosaic for the blog), the blog's sidebar, the home page, and the section's feed (`news/feed.rss`, `blog/feed.rss`). There is no list to
update. A news post that adds an `achievement:` block also gets a tile in the home page's
Achievements, one per topic, from the newest post. Figures come from the post kit: interactive charts, tables, diagrams and callouts
that you write straight into the markdown. [CONTRIBUTING.md](CONTRIBUTING.md) is the guide to
the post layout and every component in the kit.

### Deploying

A push to `main` builds the site and deploys it to GitHub Pages
(`.github/workflows/deploy.yml`). Pull requests run the same build without deploying. The org
profile in [humanfia/.github](https://github.com/humanfia/.github) is generated from the deployed
site and notices a deploy on its own, so nothing here needs a token for it.

## Contributing

Issues and pull requests are welcome; see the
[contributing guide](https://github.com/humanfia/.github/blob/main/CONTRIBUTING.md). Every pull
request runs the build and three checks, and all four have to pass:

```sh
pnpm build          # every internal link resolves
pnpm check:anchors  # every #fragment resolves to a heading the site built
pnpm check:feed     # the feed holds every post, and a click on it is not a 404
pnpm check:docs     # every link out to the documentation reaches the page it names
```

## License

The site's code — `.vitepress/` (configuration, theme, components and checks), `scripts/`,
the workflows and the build configuration — is licensed under [Apache-2.0](LICENSE).

The content — the pages in `index.md`, `blog/`, `projects/`, `research/`, `team/` and `about/`, and the
images under `public/` — is licensed under
[CC-BY-4.0](LICENSE-CC-BY-4.0): reuse it with attribution to Humanfia and a link to the page.

The citation styles in `.vitepress/theme/csl/` are copied unchanged from
[citation-style-language/styles](https://github.com/citation-style-language/styles) and are
licensed under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/), as each file
says.

Material quoted or linked from others (problem statements, benchmark results, third-party
repositories and papers) keeps its owners' terms. The Humanfia name and logo identify the
organisation; the licences above do not grant any trademark rights.
