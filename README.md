# Personal Website V4 — Next.js

The original portfolio design, styled-components styles, fonts, content, and animations, running on Next.js 16 with the Pages Router.

## Run locally

Use Node.js 24 LTS (`nvm use`), then:

```sh
npm install
npm start
```

Open http://localhost:8000. `npm run dev` and `npm run develop` also start the development server.

## Production

```sh
npm run build
npm run serve
```

The site uses static generation for the homepage, archive, posts, and tag pages. Deploy with any host supporting Next.js. Run `npm run lint` to check JavaScript and `npm test` to check content loading and Markdown rendering.

With the site running, `npm run test:browser` checks experience tabs, project expansion, desktop and mobile navigation, post and tag links, downloads, 404 responses, and browser errors in both motion modes. The test uses locally installed Google Chrome and a US time zone to catch hydration problems. Set `TEST_BASE_URL` to test another local port.

## Edit content

- Social links, email, navigation: `src/config.js`
- Hero, about, contact copy: `src/components/sections/`
- Experience: `content/jobs/<company>/index.md`
- Featured projects: `content/featured/<project>/index.md`
- Other projects and archive: `content/projects/*.md`
- Blog posts: `content/posts/<post>/index.md`
- SEO defaults: `src/lib/site.js`
- Resume, social preview, downloads: `assets/static/`

Markdown frontmatter still controls titles, dates, ordering, links, technologies, and images. Featured projects sort by `date` ascending; experience and other projects sort descending, as before. `cta` is optional. Posts marked `draft: true` stay out of the blog index; existing direct post and tag URLs are preserved.

`src/lib/content.cjs` loads Markdown directly at build time and on development page requests. There is no GraphQL schema or Gatsby dependency. Restart development after changing server configuration; rebuild production after changing content.

## Assets and visual parity

`src/styles/` retains the original design. The `gatsby-*` CSS class names on images and highlighted code are compatibility hooks for that existing CSS; they do not require Gatsby.

`assets/optimized/` retains the original responsive image bytes so existing photos, screenshots, and illustrations render identically. `src/lib/image-cache.json` maps those files to the SHA-256 hashes of their originals. When an original image changes or a new image is added, the content loader generates responsive AVIF, WebP, and fallback images using Sharp. `ResponsiveImage` preserves the existing image wrapper dimensions.

The predev and prebuild scripts copy static files, original fonts, and retained optimized images into `public/`. Treat `public/` and `.next/` as generated output; edit `assets/static/`, `src/fonts/`, or the original content image instead.

Stop the development server before running `npm run clean` or a production build. `npm run clean` removes only generated output.

Production builds include a sitemap, robots.txt, web manifest, and an offline worker. The worker replaces the previous Gatsby worker; development unregisters it so cached production pages cannot interfere with local edits.

## Attribution

Original design and implementation by [Brittany Chiang](https://github.com/bchiang7/v4). The original MIT license and attribution are retained.

React 18 is retained for compatibility with the original transition animations. Next.js 16 supports this combination through the Pages Router.
