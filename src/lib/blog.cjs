const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const kebabCase = require('lodash/kebabCase');

const blogDirectory = path.join(process.cwd(), 'blog');

function markdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) return [];
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(filename);
    return entry.isFile() && /\.md$/i.test(entry.name) && !/^readme\.md$/i.test(entry.name)
      ? [filename]
      : [];
  });
}

function readEntries({ directory = blogDirectory, includeDrafts = false } = {}) {
  const slugs = new Set();
  return markdownFiles(directory)
    .map(filename => {
      const { data, content } = matter.read(filename);
      const fail = message => {
        throw new Error(`${path.relative(process.cwd(), filename)}: ${message}`);
      };
      if (typeof data.title !== 'string' || !data.title.trim()) fail('A title is required.');
      const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date;
      if (
        typeof date !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(Date.parse(date)) ||
        new Date(date).toISOString().slice(0, 10) !== date
      ) {
        fail('Use a valid date in YYYY-MM-DD format.');
      }
      if (data.draft !== undefined && typeof data.draft !== 'boolean') {
        fail('draft must be true or false, without quotes.');
      }
      if (
        data.tags !== undefined &&
        (!Array.isArray(data.tags) || data.tags.some(tag => typeof tag !== 'string' || !tag.trim()))
      ) {
        fail('tags must be a list of non-empty strings.');
      }
      if (data.description !== undefined && typeof data.description !== 'string') {
        fail('description must be text.');
      }
      const basename = path.basename(filename, path.extname(filename));
      const inferredSlug = basename === 'index' ? path.basename(path.dirname(filename)) : basename;
      const slug = kebabCase(data.slug || inferredSlug);
      if (!slug || (data.slug !== undefined && data.slug !== slug)) {
        fail('Use a slug such as my-first-post, with words separated by hyphens.');
      }
      if (slugs.has(slug)) fail(`Duplicate blog slug "${slug}". Give each post a unique slug.`);
      slugs.add(slug);
      const plainText = content
        .replace(/```[\s\S]*?```/g, '')
        .replace(/<[^>]*>/g, '')
        .replace(/[#*_`[\]]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      return {
        slug,
        url: `/blog/${slug}/`,
        title: data.title.trim(),
        date,
        description: data.description?.trim() || plainText.slice(0, 180),
        tags: [...new Set((data.tags || []).map(tag => tag.trim()))],
        draft: data.draft === true,
        readingTime: Math.max(1, Math.ceil((content.match(/\S+/g) || []).length / 220)),
        filename,
        content,
      };
    })
    .filter(post => includeDrafts || !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

function getBlogPosts(options) {
  return readEntries(options).map(entry => {
    const post = { ...entry };
    delete post.filename;
    delete post.content;
    return post;
  });
}

async function getBlogPost(slug, options) {
  const entry = readEntries(options).find(post => post.slug === slug);
  if (!entry) return null;
  const { renderMarkdown } = require('./content.cjs');
  const { filename, content, ...post } = entry;
  return { ...post, html: await renderMarkdown(content, filename) };
}

module.exports = { getBlogPosts, getBlogPost };
