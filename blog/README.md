# Writing blog posts

This is the source folder for `/blog`. Markdown files here become articles automatically. This README and files or folders starting with `_` or `.` are ignored.

Create either `blog/my-first-post.md` or `blog/my-first-post/index.md`:

```markdown
---
title: 'My first post'
date: '2026-10-18'
description: 'A short description for the blog listing and search engines.'
tags:
  - Data Engineering
draft: true
---

Write your article here using Markdown.
```

- `title` and `date` are required. Quote dates and use `YYYY-MM-DD`.
- `description` is optional; otherwise an excerpt is generated.
- `tags` is an optional list.
- `draft: true` previews the post in `npm start` but excludes it from production pages, the index, and the sitemap. Use the boolean `true`, without quotes.
- Set `draft: false` to publish. Omitting `draft` also publishes the post.
- The filename becomes the URL: `my-first-post.md` → `/blog/my-first-post/`. A folder containing `index.md` uses the folder name instead.
- Optionally set `slug: a-custom-url` to keep the URL independent of the filename. Slugs must be unique.

## Images and code

Put images next to the article and reference them relatively:

```markdown
![A useful description](./diagram.png)
```

For several images, use a post folder containing `index.md` and the images. Local images get responsive versions automatically.

Fenced code blocks support language highlighting, optional file titles (`python:title=example.py`), and the existing `// highlight-line` and `// highlight-range{1-3}` helpers. Tables, task lists, blockquotes, inline HTML, and footnotes are supported.

Link to another article using its website URL, such as `[Another post](/blog/another-post/)`.

## Preview and publish

1. Run `npm start` and open http://localhost:8000/blog/.
2. Edit or add Markdown, then refresh the blog page. Development reads content on each page request; no manual route registration is needed.
3. Set `draft: false`, run `npm run build` to validate the article, and commit your changes.
4. Push to the branch connected to your Vercel deployment, or merge through your normal workflow. Production needs a new deployment after content changes.

`hello-world.md` is an editable starter article. `drafts/my-next-post.md` demonstrates a local-only draft. Replace either with your own writing.
