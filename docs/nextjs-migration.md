# Next.js migration

The Gatsby application has been replaced by Next.js 16.4.2 using the Pages Router and React 18.3.1. React 18 retains compatibility with the original transition library; Next.js 16 warns that this support is deprecated for the next major release.

## Preserved appearance and behavior

All 60 existing styled template literals were compared against the original source and are unchanged. The original local fonts, responsive image bytes, content, layout breakpoints, scroll reveals, loader, experience tabs, project expansion, mobile menu, and footer attribution are retained. Framework-specific image wrapper and code highlight class names remain as CSS compatibility hooks.

The homepage, archive, blog index, published posts, tag index, individual tags, draft post direct URL, and custom 404 route are preserved. Calendar dates and archive years are formatted in UTC so server rendering and hydration agree in other time zones. Entries sharing the same date use deterministic ordering matching the captured original site; Gatsby's original order could vary between fresh builds.

## Data and assets

`src/lib/content.cjs` reads the existing Markdown files directly. Optional fields such as `cta` no longer require GraphQL schema declarations. Prism output retains code titles, inline code, and line/block/range directives, including the draft test post.

`assets/static/` replaces the old root `static/` directory as the source of resumes, social previews, and downloads. Build preparation copies those files into generated `public/`, together with fonts and retained optimized images. Source-image hashes invalidate the retained image cache; new or changed images are generated with native Sharp.

Next.js handles routing, pre-rendering, metadata, and stylesheet collection. Production also generates the sitemap, robots.txt, web manifest, and offline worker. The new worker replaces the legacy worker and is unregistered during development.

## Verification

- Production build generates all 18 static pages.
- Six Node tests check homepage content, optional fields, drafts and tags, archive filtering, native image generation, Markdown formatting, and highlighting directives.
- The browser suite checks desktop and mobile interactions in both normal and reduced motion, and uses a US time zone to catch hydration differences.
- All 32 final screenshot comparisons matched with zero differing pixels; the per-view results are in `docs/visual-comparison.json`. The existing image bytes were preserved. Software rendering was used for paired captures where GPU compositing produced rounding noise.
- Offline archive reload, sitemap, robots.txt, manifest, and resume delivery were verified.
- Screenshot comparisons use Chrome at 1440px, 768px, and 390px widths, with the same locale, time zone, and content. Images and fonts are allowed to settle before comparison. GitHub counts are suppressed in both captures because they are live external data. Equal-date experience ordering is normalized to the originally captured order.

Run `npm test`, then start a production preview with `npm run build` and `npm run serve` before running `npm run test:browser`. The browser suite uses installed Google Chrome. `TEST_BASE_URL` overrides the default `http://127.0.0.1:8000`.
