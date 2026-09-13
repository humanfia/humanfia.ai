# humanfia.ai

The Humanfia website: the team, its projects and its results, built with VitePress.

## Usage

Needs Node.js 22+ and [pnpm](https://pnpm.io/).

```sh
pnpm install
pnpm dev      # local preview
pnpm build    # build into .vitepress/dist
```

Pages are Markdown: `index.md`, `projects/`, `team/`, `about/`, and one file per post in
`blog/`, named `YYYY-MM-DD-slug.md`. A post's `title`, `description`, `date`, `authors` and
`tag` come from its frontmatter, and the blog index, the sidebar, the home page and
`blog/feed.rss` are all generated from that — there is no list to update.

## Contributing

Issues and pull requests are welcome. Every pull request runs the build and three checks, and
all four have to pass:

```sh
pnpm build          # every internal link resolves
pnpm check:anchors  # every #fragment resolves to a heading the site built
pnpm check:feed     # the feed holds every post, and a click on it is not a 404
pnpm check:docs     # every link out to the documentation reaches the page it names
```

A push to `main` deploys to GitHub Pages.

## License

[Apache-2.0](https://spdx.org/licenses/Apache-2.0.html) © Humanfia
