const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const remark = require('remark');
const gfm = require('remark-gfm');
const footnotes = require('remark-footnotes');
const visit = require('unist-util-visit');
const toHast = require('mdast-util-to-hast');
const raw = require('hast-util-raw');
const toHtml = require('hast-util-to-html');
const highlight = require('./highlight.cjs');
const kebabCase = require('lodash/kebabCase');
const { getImage, markdownImage } = require('./images.cjs');

const root = process.cwd();
const escape = value =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(file) : /\.md$/.test(file) ? [file] : [];
  });
}

async function renderMarkdown(source, filename) {
  const tree = remark().use(gfm).use(footnotes).parse(source);
  const images = [];
  visit(tree, node => {
    if (node.type === 'code') {
      node.value = highlight(node);
      node.type = 'html';
    } else if (node.type === 'inlineCode') {
      node.type = 'html';
      node.value = `<code class="language-text">${escape(node.value)}</code>`;
    } else if (node.type === 'link' && /^https?:\/\//.test(node.url)) {
      node.data = {
        hProperties: { target: '_blank', rel: ['nofollow', 'noopener', 'noreferrer'] },
      };
    } else if (node.type === 'image' && !/^(https?:|data:|\/)/.test(node.url)) {
      const relative = path.relative(root, path.resolve(path.dirname(filename), node.url));
      images.push(
        markdownImage(relative, node.alt, node.title).then(html => {
          node.type = 'html';
          node.value = html;
        }),
      );
    }
  });
  await Promise.all(images);
  return toHtml(raw(toHast(tree, { allowDangerousHtml: true })), { allowDangerousHtml: true });
}

async function getCollection(name, { order = 'desc', publishedOnly = false } = {}) {
  const directory = path.join(root, 'content', name);
  const nodes = await Promise.all(
    filesIn(directory).map(async filename => {
      const { data, content } = matter.read(filename);
      const frontmatter = JSON.parse(JSON.stringify(data));
      if (frontmatter.cover) {
        frontmatter.cover = await getImage(
          path.relative(root, path.resolve(path.dirname(filename), frontmatter.cover)),
        );
      }
      frontmatter.cta = frontmatter.cta || null;
      return { frontmatter, html: await renderMarkdown(content, filename) };
    }),
  );
  // Preserve the original lexical ordering, including featured order numbers.
  const sorted = nodes.sort((a, b) => {
    const left = String(a.frontmatter.date || '');
    const right = String(b.frontmatter.date || '');
    const dateOrder = (left < right ? -1 : left > right ? 1 : 0) * (order === 'asc' ? 1 : -1);
    if (!dateOrder && name === 'posts') {
      return String(b.frontmatter.slug).localeCompare(String(a.frontmatter.slug));
    }
    return dateOrder;
  });
  return publishedOnly ? sorted.filter(node => node.frontmatter.draft !== true) : sorted;
}

const edges = nodes => ({ edges: nodes.map(node => ({ node })) });

async function getHomeData() {
  const [jobs, featured, projects, headshot] = await Promise.all([
    getCollection('jobs'),
    getCollection('featured', { order: 'asc' }),
    getCollection('projects'),
    getImage('src/images/me.jpeg', { width: 500, quality: 95 }),
  ]);
  return {
    jobs: edges(jobs),
    featured: edges(featured),
    projects: edges(projects.filter(node => node.frontmatter.showInProjects !== false)),
    headshot,
  };
}

async function getTagGroups({ includeDrafts = false } = {}) {
  const posts = await getCollection('posts', { publishedOnly: !includeDrafts });
  const counts = new Map();
  posts.forEach(node =>
    (node.frontmatter.tags || []).forEach(tag => counts.set(tag, (counts.get(tag) || 0) + 1)),
  );
  return [...counts]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fieldValue, totalCount]) => ({ fieldValue, totalCount, slug: kebabCase(fieldValue) }));
}

module.exports = { renderMarkdown, getCollection, getHomeData, getTagGroups, edges };
