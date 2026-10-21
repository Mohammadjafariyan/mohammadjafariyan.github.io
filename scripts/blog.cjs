// Static blog + sitemap generator. Runs after the React build (see build.cjs) or on its own: `npm run blog`.
// Posts: content/blog/<lang>/<slug>.md with front matter. Output: build/blog/... and build/<lang>/blog/...
const fs = require('fs');
const path = require('path');

const SITE = 'https://mohammadjafariyan.github.io';
const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content', 'blog');
const ASSETS = path.join(__dirname, 'blog-assets');

// Add a language here, then create content/blog/<code>/. The default language lives at /blog/.
const LANGUAGES = {
  en: { name: 'English', dir: 'ltr', locale: 'en-US', blog: 'Blog', home: 'Home', contact: 'Contact', all: 'All posts', read: 'min read', empty: 'No posts yet.', intro: 'Notes on building software: backend, product, infrastructure, and applied AI.', also: 'Also available in' },
  fa: { name: 'فارسی', dir: 'rtl', locale: 'fa-IR', blog: 'وبلاگ', home: 'خانه', contact: 'تماس', all: 'همه نوشته‌ها', read: 'دقیقه مطالعه', empty: 'هنوز نوشته‌ای منتشر نشده است.', intro: 'یادداشت‌هایی درباره ساخت نرم‌افزار: بک‌اند، محصول، زیرساخت و هوش مصنوعی کاربردی.', also: 'این نوشته به زبان‌های دیگر', font: 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600&display=swap' },
  ar: { name: 'العربية', dir: 'rtl', locale: 'ar', blog: 'المدونة', home: 'الرئيسية', contact: 'تواصل', all: 'كل المقالات', read: 'دقائق قراءة', empty: 'لا توجد مقالات بعد.', intro: 'ملاحظات حول بناء البرمجيات: الخلفية، المنتج، البنية التحتية، والذكاء الاصطناعي التطبيقي.', also: 'متاح أيضاً بلغة', font: 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600&display=swap' },
  tr: { name: 'Türkçe', dir: 'ltr', locale: 'tr-TR', blog: 'Blog', home: 'Ana sayfa', contact: 'İletişim', all: 'Tüm yazılar', read: 'dk okuma', empty: 'Henüz yazı yok.', intro: 'Yazılım geliştirme üzerine notlar: backend, ürün, altyapı ve uygulamalı yapay zekâ.', also: 'Diğer dillerde' }
};
const DEFAULT_LANG = 'en';

const CONTACT = {
  email: 'Mohammad.jafariyan7@gmail.com',
  phone: '+989148980692',
  phoneLabel: '+98 914 898 0692',
  whatsapp: 'https://wa.me/989148980692',
  telegram: 'https://t.me/MohammadJafariyan7',
  github: 'https://github.com/Mohammadjafariyan',
  linkedin: 'https://www.linkedin.com/in/mohammad-jafariyan7'
};

let ACTIVE = [DEFAULT_LANG]; // languages with at least one post, set in generate()
const blogPath = lang => (lang === DEFAULT_LANG ? '/blog/' : `/${lang}/blog/`);
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- front matter ----------
function parseFrontMatter(src, file) {
  const m = src.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter (--- ... ---)`);
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map(x => unquote(x.trim())).filter(Boolean);
    else if (v === 'true' || v === 'false') v = v === 'true';
    else v = unquote(v);
    data[kv[1]] = v;
  }
  return { data, body: m[2] };
}
const unquote = s => s.replace(/^(['"])(.*)\1$/, '$2');

// ---------- markdown (headings, lists, quotes, code, images, links, emphasis, tables are not supported) ----------
function inline(text) {
  const codes = [];
  let s = esc(text).replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`);
  s = s
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;(.*?)&quot;)?\)/g, (_, alt, src, t) => `<img src="${src}" alt="${alt}" loading="lazy"${t ? ` title="${t}"` : ''}>`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => `<a href="${href}"${/^https?:/.test(href) && !href.startsWith(SITE) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(/(^|[^_\w])_([^_\s][^_]*)_/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
}

function markdown(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  const isBlockStart = l => /^(#{1,6}\s|```|>|\s*[-*]\s|\s*\d+[.)]\s|---\s*$)/.test(l);
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m;
    if ((m = line.match(/^```\s*([\w-]*)/))) {
      const buf = [];
      for (i++; i < lines.length && !lines[i].startsWith('```'); i++) buf.push(lines[i]);
      i++;
      out.push(`<pre><code${m[1] ? ` class="language-${m[1]}"` : ''}>${esc(buf.join('\n'))}</code></pre>`);
    } else if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
      const level = Math.max(2, m[1].length); // the page title is the only h1
      out.push(`<h${level}>${inline(m[2])}</h${level}>`);
      i++;
    } else if (/^---\s*$/.test(line)) {
      out.push('<hr>');
      i++;
    } else if (line.startsWith('>')) {
      const buf = [];
      for (; i < lines.length && lines[i].startsWith('>'); i++) buf.push(lines[i].replace(/^>\s?/, ''));
      out.push(`<blockquote>${markdown(buf.join('\n'))}</blockquote>`);
    } else if (/^\s*([-*]|\d+[.)])\s/.test(line)) {
      const ordered = /^\s*\d/.test(line);
      const items = [];
      for (; i < lines.length && /^\s*([-*]|\d+[.)])\s/.test(lines[i]); i++) items.push(lines[i].replace(/^\s*([-*]|\d+[.)])\s+/, ''));
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map(x => `<li>${inline(x)}</li>`).join('')}</${tag}>`);
    } else {
      const buf = [];
      for (; i < lines.length && lines[i].trim() && !isBlockStart(lines[i]); i++) buf.push(lines[i].trim());
      out.push(`<p>${inline(buf.join(' '))}</p>`);
    }
  }
  return out.join('\n');
}

// ---------- content ----------
function loadPosts() {
  const posts = [];
  for (const lang of Object.keys(LANGUAGES)) {
    const dir = path.join(CONTENT, lang);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
      const full = path.join(dir, file);
      const { data, body } = parseFrontMatter(fs.readFileSync(full, 'utf8'), full);
      if (data.draft) continue;
      for (const key of ['title', 'description', 'date']) if (!data[key]) throw new Error(`${full}: front matter needs "${key}"`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) throw new Error(`${full}: date must be YYYY-MM-DD`);
      const slug = data.slug || file.replace(/\.md$/, '');
      if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`${full}: slug "${slug}" must use a-z, 0-9 and - (set "slug:" in front matter for non-Latin file names)`);
      const words = body.split(/\s+/).filter(Boolean).length;
      posts.push({ ...data, lang, slug, key: data.translationKey || slug, tags: [].concat(data.tags || []), html: markdown(body), minutes: Math.max(1, Math.round(words / 220)), url: `${blogPath(lang)}${slug}/` });
    }
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

const formatDate = (date, lang) => new Intl.DateTimeFormat(LANGUAGES[lang].locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));

// ---------- templates ----------
function page({ lang, title, description, url, alternates = [], type = 'website', jsonLd, body, published }) {
  const L = LANGUAGES[lang];
  const altLinks = alternates.map(a => `<link rel="alternate" hreflang="${a.lang}" href="${SITE}${a.url}">`);
  const def = alternates.find(a => a.lang === DEFAULT_LANG);
  if (def) altLinks.push(`<link rel="alternate" hreflang="x-default" href="${SITE}${def.url}">`);
  const switcher = ACTIVE.filter(l => l !== lang).map(l => {
    const target = alternates.find(a => a.lang === l);
    return `<a href="${target ? target.url : blogPath(l)}" hreflang="${l}" lang="${l}">${LANGUAGES[l].name}</a>`;
  }).join('');
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${L.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0d1b2a">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}${url}">
${altLinks.join('\n')}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="${type}">
<meta property="og:url" content="${SITE}${url}">
<meta property="og:locale" content="${L.locale.replace('-', '_')}">
${published ? `<meta property="article:published_time" content="${published}">\n` : ''}<meta name="twitter:card" content="summary">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="MJ — ${esc(L.blog)}" href="${blogPath(lang)}feed.xml">
${L.font ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${L.font}">\n` : ''}<link rel="stylesheet" href="/assets/blog.css">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : ''}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="navigation"><a class="brand" href="/" aria-label="Mohammad Jafariyan, home" dir="ltr">MJ<span>.</span></a>
<nav aria-label="Main navigation"><a href="/">${esc(L.home)}</a><a href="${blogPath(lang)}" aria-current="${url === blogPath(lang) ? 'page' : 'false'}">${esc(L.blog)}</a>${switcher}<a class="nav-contact" href="/#contact">${esc(L.contact)}</a></nav></header>
<main id="main" class="wrap">
${body}
</main>
<footer class="wrap"><div class="contact-links" dir="ltr"><a href="mailto:${CONTACT.email}">Email</a><a href="tel:${CONTACT.phone}">${CONTACT.phoneLabel}</a><a href="${CONTACT.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="${CONTACT.telegram}" target="_blank" rel="noopener noreferrer">Telegram</a><a href="${CONTACT.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="${CONTACT.github}" target="_blank" rel="noopener noreferrer">GitHub</a></div><p>© ${new Date().getUTCFullYear()} Mohammad Jafariyan</p></footer>
</body>
</html>
`;
}

const tagList = tags => (tags.length ? `<ul class="tags">${tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '');

function indexPage(lang, posts) {
  const L = LANGUAGES[lang];
  const list = posts.length
    ? `<ol class="post-list">${posts.map(p => `<li><article><p class="meta"><time datetime="${p.date}">${formatDate(p.date, lang)}</time> · ${p.minutes} ${esc(L.read)}</p><h2><a href="${p.url}">${esc(p.title)}</a></h2><p>${esc(p.description)}</p>${tagList(p.tags)}</article></li>`).join('')}</ol>`
    : `<p class="empty">${esc(L.empty)}</p>`;
  const url = blogPath(lang);
  return page({
    lang, url,
    title: `${L.blog} | Mohammad Jafariyan`,
    description: L.intro,
    alternates: ACTIVE.map(l => ({ lang: l, url: blogPath(l) })),
    jsonLd: { '@context': 'https://schema.org', '@type': 'Blog', name: `MJ — ${L.blog}`, url: SITE + url, inLanguage: lang, author: { '@type': 'Person', name: 'Mohammad Jafariyan', url: SITE + '/' } },
    body: `<section class="blog-head"><p class="eyebrow">MJ / ${esc(L.blog.toUpperCase())}</p><h1>${esc(L.blog)}</h1><p class="intro">${esc(L.intro)}</p></section>\n${list}`
  });
}

function postPage(post, translations) {
  const L = LANGUAGES[post.lang];
  const alternates = [post, ...translations].map(p => ({ lang: p.lang, url: p.url }));
  const others = translations.length
    ? `<p class="translations">${esc(L.also)}: ${translations.map(t => `<a href="${t.url}" hreflang="${t.lang}" lang="${t.lang}">${LANGUAGES[t.lang].name}</a>`).join(' · ')}</p>`
    : '';
  return page({
    lang: post.lang, url: post.url, type: 'article', alternates,
    title: `${post.title} | MJ`,
    description: post.description,
    published: post.date,
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.description,
      datePublished: post.date, dateModified: post.updated || post.date, inLanguage: post.lang, keywords: post.tags.join(', '),
      mainEntityOfPage: SITE + post.url, author: { '@type': 'Person', name: 'Mohammad Jafariyan', url: SITE + '/' }
    },
    body: `<article class="post"><header><p class="meta"><a href="${blogPath(post.lang)}">${esc(L.all)}</a> · <time datetime="${post.date}">${formatDate(post.date, post.lang)}</time> · ${post.minutes} ${esc(L.read)}</p><h1>${esc(post.title)}</h1><p class="intro">${esc(post.description)}</p>${tagList(post.tags)}${others}</header>
<div class="prose">
${post.html}
</div></article>`
  });
}

function feed(lang, posts) {
  const L = LANGUAGES[lang];
  const items = posts.slice(0, 30).map(p => `<item><title>${esc(p.title)}</title><link>${SITE}${p.url}</link><guid>${SITE}${p.url}</guid><pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate><description>${esc(p.description)}</description></item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>MJ — ${esc(L.blog)}</title><link>${SITE}${blogPath(lang)}</link><description>${esc(L.intro)}</description><language>${lang}</language>
${items}
</channel></rss>
`;
}

function sitemap(posts) {
  const langs = ACTIVE;
  const entries = [{ url: '/', alternates: [] }, { url: '/for-businesses.html', alternates: [] }];
  langs.forEach(l => entries.push({ url: blogPath(l), lastmod: (posts.find(p => p.lang === l) || {}).date, alternates: langs.map(x => ({ lang: x, url: blogPath(x) })) }));
  posts.forEach(p => {
    const group = posts.filter(o => o.key === p.key);
    entries.push({ url: p.url, lastmod: p.updated || p.date, alternates: group.length > 1 ? group.map(o => ({ lang: o.lang, url: o.url })) : [] });
  });
  const xml = entries.map(e => `  <url>\n    <loc>${SITE}${e.url}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ''}${e.alternates.map(a => `\n    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${SITE}${a.url}"/>`).join('')}\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${xml}
</urlset>
`;
}

// ---------- write ----------
function write(outDir, rel, content) {
  const file = path.join(outDir, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function generate(outDir = path.join(ROOT, 'build')) {
  const posts = loadPosts();
  const seen = new Set();
  posts.forEach(p => { if (seen.has(p.url)) throw new Error(`Duplicate post URL ${p.url}`); seen.add(p.url); });
  ACTIVE = Object.keys(LANGUAGES).filter(l => l === DEFAULT_LANG || posts.some(p => p.lang === l));
  for (const lang of ACTIVE) {
    const own = posts.filter(p => p.lang === lang);
    write(outDir, `${blogPath(lang)}index.html`, indexPage(lang, own));
    write(outDir, `${blogPath(lang)}feed.xml`, feed(lang, own));
    own.forEach(p => write(outDir, `${p.url}index.html`, postPage(p, posts.filter(o => o.key === p.key && o !== p))));
  }
  write(outDir, 'sitemap.xml', sitemap(posts));
  write(outDir, 'assets/blog.css', fs.readFileSync(path.join(ASSETS, 'blog.css')));
  console.log(`Blog: ${posts.length} post(s) in ${ACTIVE.join(', ')}; sitemap.xml written.`);
}

module.exports = { generate, markdown, parseFrontMatter };
if (require.main === module) generate(process.argv[2] ? path.resolve(process.argv[2]) : undefined);
