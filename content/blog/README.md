# Blog content

One Markdown file per post, in a folder per language:

```
content/blog/en/<slug>.md   →  /blog/<slug>/
content/blog/fa/<slug>.md   →  /fa/blog/<slug>/
```

Front matter:

```
---
title: Post title
description: One or two sentences, used in listings, search results and social previews.
date: 2026-10-21
updated: 2026-11-02          # optional
tags: [.NET, Architecture]   # optional
translationKey: welcome      # same value on every translation of a post (defaults to the slug)
slug: welcome                # optional; needed when the file name isn't a-z/0-9/-
draft: true                  # optional; drafts are not published
---
```

Translations are linked automatically (language switcher, `hreflang` tags, sitemap) when posts share a `translationKey`.

Supported Markdown: headings, paragraphs, **bold**, *italic*, `code`, fenced code blocks, links, images, lists, blockquotes, `---`. Put images in `public/images/blog/` and reference them as `/images/blog/name.jpg`.

Languages: `en`, `fa`, `ar`, `tr`. A language is published (blog index, feed, sitemap, switcher) once its folder has at least one non-draft post. To add another, add an entry to `LANGUAGES` in `scripts/blog.cjs`.

`npm run build` builds the site, blog, RSS feeds (`/blog/feed.xml`, `/<lang>/blog/feed.xml`) and `sitemap.xml`. After a build, `npm run blog` regenerates only the blog.
