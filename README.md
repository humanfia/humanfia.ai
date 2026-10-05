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

Pages are Markdown: `index.md`, `projects/`, `flows/`, `about/`, and one file per post in
`news/` or `blog/`. Files in `public/` are published as they are.

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

`tag` is the project the post belongs to. Everything else is generated from the frontmatter:
the post's page (its hero, contents and related posts), the section index, the sidebar, the
home page, and the section's feed (`news/feed.rss`, `blog/feed.rss`). There is no list to
update. Figures come from the post kit: interactive charts, tables, diagrams and callouts
that you write straight into the markdown. [CONTRIBUTING.md](CONTRIBUTING.md) is the guide to
the post layout and every component in the kit.

### Deploying

A push to `main` builds the site and deploys it to GitHub Pages
(`.github/workflows/deploy.yml`). Pull requests run the same build without deploying.

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

The content — the pages in `index.md`, `blog/`, `projects/`, `team/` and `about/`, and the
images under `public/` — is licensed under
[CC-BY-4.0](LICENSE-CC-BY-4.0): reuse it with attribution to Humanfia and a link to the page.

Material quoted or linked from others (problem statements, benchmark results, third-party
repositories and papers) keeps its owners' terms. The Humanfia name and logo identify the
organisation; the licences above do not grant any trademark rights.
