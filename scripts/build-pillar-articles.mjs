import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DOMAIN = 'https://www.nguyenlananh.com';
const OG_IMAGE = `${DOMAIN}/assets/og/og-di-vao-ben-trong.svg`;
const PUBLISH_DATE = '2026-04-29';

const PILLAR_DOCS = [
  'docs/PILLAR_ARTICLES_BATCH_2026-04-29.md',
  'docs/PILLAR_02_CAI_CHOI.md',
  'docs/PILLAR_03_VONG_LAP.md',
  'docs/PILLAR_04_IM_LANG.md',
  'docs/PILLAR_05_HE_GIA_DINH.md',
  'docs/PILLAR_06_CO_DON.md',
  'docs/PILLAR_07_MOI_TRUONG.md',
  'docs/PILLAR_08_TRE_EM.md',
  'docs/PILLAR_09_LAO_DONG_SANG_TAO.md',
  'docs/PILLAR_10_DAU_TU_BAN_THAN.md'
];

const CATEGORY_LABELS = {
  'phuong-phap': { vi: 'Phương pháp', en: 'Method' },
  'hanh-trinh': { vi: 'Hành trình', en: 'Journey' },
  'lao-dong-sang-tao': { vi: 'Lao động sáng tạo', en: 'Creative Labor' },
  'gia-dinh': { vi: 'Gia đình và gốc rễ', en: 'Family and Roots' },
  'tre-em': { vi: 'Trẻ em', en: 'Children' },
  'dau-tu-ban-than': { vi: 'Đầu tư bản thân', en: 'Self-Investment' },
  'mon-hoc': { vi: 'Môn học dọn dẹp', en: 'Cleaning as Practice' },
  'hanh-dong': { vi: 'Hành động', en: 'Action' }
};

const CATEGORY_ROUTES = {
  'phuong-phap': '/phuong-phap/',
  'hanh-trinh': '/hanh-trinh/',
  'lao-dong-sang-tao': '/bai-viet/lao-dong-sang-tao/',
  'gia-dinh': '/bai-viet/',
  'tre-em': '/bai-viet/',
  'dau-tu-ban-than': '/bai-viet/dau-tu-ban-than/',
  'mon-hoc': '/bai-viet/',
  'hanh-dong': '/bai-viet/'
};

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function tidy(value = '') {
  return String(value).replace(/\r/g, '').trim();
}

function slugFromRoute(route) {
  return String(route || '').replace(/^\/+|\/+$/g, '');
}

function parseMetadata(raw, file) {
  const match = raw.match(/```yaml\n([\s\S]*?)\n```/);
  if (!match) throw new Error(`Missing yaml metadata in ${file}`);
  const metadata = {};
  for (const line of match[1].split('\n')) {
    if (/^\s/.test(line)) continue;
    const pair = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!pair) continue;
    metadata[pair[1]] = pair[2].trim().replace(/^['"]|['"]$/g, '');
  }
  if (!metadata.title_vi || !metadata.title_en || !metadata.slug) {
    throw new Error(`Missing required metadata in ${file}`);
  }
  return metadata;
}

function extractBetween(raw, startMarker, endMarker, file) {
  const start = raw.indexOf(startMarker);
  if (start === -1) throw new Error(`Missing ${startMarker} in ${file}`);
  const afterStart = raw.slice(start + startMarker.length);
  const end = endMarker ? afterStart.indexOf(endMarker) : -1;
  return tidy(end === -1 ? afterStart : afterStart.slice(0, end));
}

function extractField(raw, marker) {
  const start = raw.indexOf(marker);
  if (start === -1) return '';
  const afterStart = raw.slice(start + marker.length);
  // Terminator: any heading (## ), separator (---), END_OF_PILLAR marker, or another field key.
  // Without the heading/separator/marker terminators, cta_block_(vi|en) is greedy to EOF
  // and will absorb "## Pipeline note" sections — which leaks VN build text into EN pages.
  const next = afterStart.search(/\n(?:##\s|---\s*$|<!--\s*END_OF_PILLAR|(?:[a-z_]+_(?:vi|en)|reflection_prompts_(?:vi|en)|internal_links|cta_block_(?:vi|en)):)/m);
  return tidy(next === -1 ? afterStart : afterStart.slice(0, next));
}

function extractList(raw, marker) {
  const block = extractField(raw, marker);
  return block
    .split('\n')
    .map((line) => line.replace(/^\s*\d+\.\s*/, '').trim())
    .filter(Boolean);
}

function markdownInline(value) {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function renderMarkdown(block) {
  const chunks = tidy(block)
    .split(/\n\s*\n/)
    .map((part) => tidy(part))
    .filter(Boolean);

  return chunks
    .map((chunk) => {
      if (chunk.startsWith('# ')) return '';
      if (chunk.startsWith('## ')) return `      <h2>${markdownInline(chunk.slice(3))}</h2>`;

      const lines = chunk.split('\n').map((line) => line.trim()).filter(Boolean);
      if (lines.every((line) => /^\d+\.\s+/.test(line))) {
        return [
          '      <ol>',
          ...lines.map((line) => `        <li>${markdownInline(line.replace(/^\d+\.\s+/, ''))}</li>`),
          '      </ol>'
        ].join('\n');
      }
      if (lines.every((line) => /^-\s+/.test(line))) {
        return [
          '      <ul>',
          ...lines.map((line) => `        <li>${markdownInline(line.replace(/^-\s+/, ''))}</li>`),
          '      </ul>'
        ].join('\n');
      }

      return `      <p>${markdownInline(lines.join(' '))}</p>`;
    })
    .filter(Boolean)
    .join('\n');
}

function localizeStableRoute(route, locale) {
  const clean = route.trim();
  if (locale === 'vi') return clean;
  if (!clean.startsWith('/')) return clean;
  if (clean.startsWith('/en/')) return clean;
  return `/en${clean}`;
}

function parseArticle(file) {
  const fullPath = path.join(ROOT, file);
  const raw = fs.readFileSync(fullPath, 'utf8').replace(/\r/g, '');
  const metadata = parseMetadata(raw, file);
  const viRaw = extractBetween(raw, '## content_vi', '## content_en', file);
  const enRaw = extractBetween(raw, '## content_en', null, file);
  const slug = slugFromRoute(metadata.slug);
  const internalLinks = extractList(viRaw, 'internal_links:');
  return {
    file,
    metadata,
    slug,
    category: metadata.category || 'hanh-trinh',
    title: { vi: metadata.title_vi, en: metadata.title_en },
    seoTitle: {
      vi: metadata.seo_title_vi || `${metadata.title_vi} | Nguyenlananh.com`,
      en: metadata.seo_title_en || `${metadata.title_en} | Nguyenlananh.com`
    },
    description: {
      vi: metadata.seo_description_vi || metadata.excerpt_vi || metadata.title_vi,
      en: metadata.seo_description_en || metadata.excerpt_en || metadata.title_en
    },
    excerpt: {
      vi: metadata.excerpt_vi || metadata.seo_description_vi || '',
      en: metadata.excerpt_en || metadata.seo_description_en || ''
    },
    body: {
      vi: viRaw.split('\nclosing_vi:')[0].trim(),
      en: enRaw.split('\nclosing_en:')[0].trim()
    },
    closing: {
      vi: extractField(viRaw, 'closing_vi:'),
      en: extractField(enRaw, 'closing_en:')
    },
    prompts: {
      vi: extractList(viRaw, 'reflection_prompts_vi:'),
      en: extractList(enRaw, 'reflection_prompts_en:')
    },
    cta: {
      vi: extractField(viRaw, 'cta_block_vi:').replace(/\n?→\s*\/join\/?\s*$/m, '').trim(),
      en: extractField(enRaw, 'cta_block_en:').replace(/\n?→\s*\/join\/?\s*$/m, '').trim()
    },
    internalLinks
  };
}

function navCopy(locale) {
  if (locale === 'en') {
    return {
      lang: 'en-US',
      prefix: '/en',
      home: '/en/',
      brand: 'Lan Anh Nguyen',
      brandSub: 'Rebuild your life from within',
      nav: [
        ['Home', '/en/'],
        ['Journey', '/en/hanh-trinh/'],
        ['Method', '/en/phuong-phap/'],
        ['Writings', '/en/bai-viet/'],
        ['Members', '/en/members/'],
        ['Join', '/en/join/']
      ],
      articles: '/en/bai-viet/',
      join: '/en/join/',
      articleLabel: 'Writings',
      reflectionTitle: 'Reflection',
      ctaLabel: 'Enter the journey',
      internalTitle: 'Stable routes',
      footerLine: 'Not to become someone else. To see clearly who you are now.',
      copyrightName: 'Lan Anh Nguyen'
    };
  }
  return {
    lang: 'vi',
    prefix: '',
    home: '/',
    brand: 'Nguyễn Lan Anh',
    brandSub: 'Đi vào bên trong để tái thiết cuộc đời',
    nav: [
      ['Trang chủ', '/'],
      ['Hành trình', '/hanh-trinh/'],
      ['Hệ thống', '/phuong-phap/'],
      ['Bài viết', '/bai-viet/'],
      ['Thành viên', '/members/'],
      ['Đăng ký', '/join/']
    ],
    articles: '/bai-viet/',
    join: '/join/',
    articleLabel: 'Bài viết',
    reflectionTitle: 'Câu hỏi soi chiếu',
    ctaLabel: 'Bước vào hành trình',
    internalTitle: 'Liên kết ổn định',
    footerLine: 'Không phải để trở thành ai khác. Mà để nhìn rõ mình đang là ai.',
    copyrightName: 'Nguyễn Lan Anh'
  };
}

function renderArticlePage(article, locale) {
  const copy = navCopy(locale);
  const isVi = locale === 'vi';
  const title = article.title[locale];
  const description = article.description[locale];
  const canonical = `${DOMAIN}${copy.prefix}/bai-viet/${article.slug}/`;
  const alternateVi = `${DOMAIN}/bai-viet/${article.slug}/`;
  const alternateEn = `${DOMAIN}/en/bai-viet/${article.slug}/`;
  const category = CATEGORY_LABELS[article.category] || CATEGORY_LABELS['hanh-trinh'];
  const categoryLabel = category[locale];
  const categoryRoute = localizeStableRoute(CATEGORY_ROUTES[article.category] || '/bai-viet/', locale);
  const body = renderMarkdown(article.body[locale]);
  const closing = article.closing[locale];
  const ctaText = article.cta[locale];
  const prompts = article.prompts[locale]
    .map((prompt) => `        <li>${markdownInline(prompt)}</li>`)
    .join('\n');
  const stableLinks = article.internalLinks
    .map((route) => `        <li><a href="${localizeStableRoute(route, locale)}">${escapeHtml(localizeStableRoute(route, locale))}</a></li>`)
    .join('\n');
  const navLinks = copy.nav.map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished: PUBLISH_DATE,
    dateModified: PUBLISH_DATE,
    inLanguage: copy.lang,
    mainEntityOfPage: canonical,
    articleSection: categoryLabel,
    image: OG_IMAGE,
    author: { '@type': 'Person', name: copy.copyrightName },
    publisher: { '@type': 'Organization', name: 'Nguyenlananh.com', url: DOMAIN }
  };

  return `<!doctype html>
<html lang="${copy.lang}" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>${escapeHtml(article.seoTitle[locale])}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="alternate" hreflang="vi" href="${alternateVi}" />
  <link rel="alternate" hreflang="en-US" href="${alternateEn}" />
  <link rel="alternate" hreflang="en" href="${alternateEn}" />
  <link rel="alternate" hreflang="x-default" href="${alternateVi}" />
  <meta name="robots" content="index,follow" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />
  <link rel="stylesheet" href="/assets/site.css" />
  <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
  </script>
</head>
<body>
  <header class="topbar" role="banner"><div class="container"><div class="navwrap"><a class="brand" href="${copy.home}"><div class="mark" aria-hidden="true"></div><div class="name"><strong>${copy.brand}</strong><span>${copy.brandSub}</span></div></a><nav class="navlinks" aria-label="${isVi ? 'Điều hướng chính' : 'Primary navigation'}">${navLinks}</nav><div class="actions"><a class="btn" href="${copy.join}">${isVi ? 'Đăng ký thành viên' : 'Join membership'}</a></div></div></div></header>

  <main class="container" role="main">
    <section class="pageHead">
      <p style="margin:0; font-size:13px; color:rgba(15,23,42,.6);"><a href="${copy.articles}">${copy.articleLabel}</a> / <a href="${categoryRoute}">${escapeHtml(categoryLabel)}</a></p>
      <h1>${escapeHtml(title)}</h1>
      <p class="sub">${escapeHtml(article.excerpt[locale])}</p>
    </section>

    <article class="panel articleBody">
${body}
      <p style="margin-top:18px; font-weight:600;">${markdownInline(closing)}</p>
    </article>

    <section class="grid2" style="margin-top:12px;">
      <article class="panel">
        <h3>${copy.reflectionTitle}</h3>
        <ol class="list">
${prompts}
        </ol>
      </article>
      <article class="panel">
        <h3>${copy.internalTitle}</h3>
        <ul class="list">
${stableLinks}
        </ul>
        <p>${markdownInline(ctaText)}</p>
        <div class="actionsRow">
          <a class="cta" href="${copy.join}">${copy.ctaLabel}</a>
          <a class="ghost" href="${copy.articles}">${copy.articleLabel}</a>
        </div>
      </article>
    </section>
  </main>

  <footer role="contentinfo"><div class="container"><div class="fwrap"><div><div style="font-weight:700; color:rgba(15,23,42,.8);">${copy.copyrightName}</div><div>© <span id="year"></span> · ${copy.footerLine}</div></div><div style="display:flex; gap:6px; flex-wrap:wrap;">${navLinks}</div></div></div></footer>

  <script src="/assets/content-registry.js"></script>
  <script src="/assets/site.js"></script>
  <script src="/assets/i18n-config.js"></script>
  <script src="/assets/lang-routing.js"></script>
</body>
</html>
`;
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function buildManifest(articles) {
  return {
    collection: 'pillar_articles',
    generated_at: new Date().toISOString(),
    published_at: PUBLISH_DATE,
    source_docs: PILLAR_DOCS,
    routes: articles.map((article, index) => ({
      order: index + 1,
      slug: article.slug,
      path_vi: `/bai-viet/${article.slug}/`,
      path_en: `/en/bai-viet/${article.slug}/`,
      title_vi: article.title.vi,
      title_en: article.title.en,
      category: article.category
    }))
  };
}

function main() {
  const articles = PILLAR_DOCS.map(parseArticle);
  for (const article of articles) {
    writeFile(path.join(ROOT, 'bai-viet', article.slug, 'index.html'), renderArticlePage(article, 'vi'));
    writeFile(path.join(ROOT, 'en', 'bai-viet', article.slug, 'index.html'), renderArticlePage(article, 'en'));
  }
  writeFile(path.join(ROOT, 'admin', 'content', 'pillar-articles-collection.json'), `${JSON.stringify(buildManifest(articles), null, 2)}\n`);
  console.log(`Built ${articles.length} pillar articles.`);
}

main();
