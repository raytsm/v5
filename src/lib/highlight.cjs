const Prism = require('prismjs');
const loadLanguages = require('prismjs/components/');

const escape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const range = value =>
  value.split(',').flatMap(part => {
    const [start, end = start] = part.trim().split('-').map(Number);
    return Number.isInteger(start) && Number.isInteger(end) && end >= start
      ? Array.from({ length: end - start + 1 }, (_, index) => start + index)
      : [];
  });

// Preserve the existing Prism markup and authored line-highlighting directives.
module.exports = function highlight(node) {
  const [language = 'text', title] = (node.lang || 'text').split(':title=');
  if (!Prism.languages[language] && language !== 'text') loadLanguages([language]);
  let code = Prism.languages[language]
    ? Prism.highlight(node.value, Prism.languages[language], language)
    : escape(node.value);

  if (/highlight-(?:line|next-line|start|range)/.test(code)) {
    code = code.replace(/<span class="token ([^"]+)">[^<]*\n[^<]*<\/span>/g, (match, token) =>
      match.replace(/\n/g, `</span>\n<span class="token ${token}">`),
    );
  }
  const lines = code.split('\n').map(value => ({ code: value, highlight: false, hide: false }));
  const directive = /(highlight|hide)-(next-line|line|start|end|range)(?:\{([^}]+)\})?/;
  const flag = (feature, index) => {
    if (lines[index]) lines[index][feature] = true;
  };

  lines.forEach((line, index) => {
    const match = line.code.match(directive);
    if (!match) return;
    const [, feature, action, specification] = match;
    if (action === 'next-line') {
      flag(feature, index + 1);
      line.hide = true;
    } else if (action === 'line') {
      line[feature] = true;
      line.code = line.code
        .replace(
          /\s*<span class="token punctuation">\{<\/span>\s*<span class="token comment">\/\*\s*(?:highlight|hide)-line\s*\*\/<\/span>\s*<span class="token punctuation">\}<\/span>/,
          '',
        )
        .replace(
          /\s*(?:<span class="token comment">)?(?:#|\/\/|\/\*+|&lt;!--)\s*(?:highlight|hide)-line\s*(?:\*\/|-->)?(?:<\/span>)?/,
          '',
        );
    } else if (action === 'range') {
      line.hide = true;
      range(specification || '').forEach(offset => flag(feature, index + offset));
    } else if (action === 'start') {
      let end = lines.findIndex(
        (candidate, next) => next > index && candidate.code.includes(`${feature}-end`),
      );
      if (end === -1) end = lines.length;
      line.hide = true;
      flag('hide', end);
      for (let current = index + 1; current < end; current++) flag(feature, current);
    }
  });

  const visible = lines.filter(line => !line.hide);
  code = visible
    .map((line, index) =>
      line.highlight
        ? `<span class="gatsby-highlight-code-line">${line.code}</span>`
        : line.code + (index === visible.length - 1 ? '' : '\n'),
    )
    .join('');
  return `${
    title ? `<div class="gatsby-code-title">${escape(title)}</div>\n` : ''
  }<div class="gatsby-highlight" data-language="${language}"><pre class="language-${language}"><code class="language-${language}">${code}</code></pre></div>`;
};
