import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DOMAIN = 'https://www.nguyenlananh.com';
const OG_IMAGE = `${DOMAIN}/assets/og/og-di-vao-ben-trong.svg`;
const SOURCE_DOC = path.join(ROOT, 'docs', 'NGUYENLANANH_LAUNCH_CONTENT_PACK_2026-04-17.md');
const MANIFEST_OUT = path.join(ROOT, 'admin', 'content', 'articles-launch-collection.json');

const EN_OVERRIDES = {
  'ban-khong-thieu-kien-thuc': {
    titleEn: 'You Do Not Lack Knowledge, You Lack Clarity',
    sublineEn: 'You know many things. But you do not know which ones truly belong to the life you are living.',
    metaDescriptionEn:
      'You do not lack information. You lack clarity about how you live and which truths actually matter in your daily decisions.'
  },
  'song-theo-thoi-quen': {
    titleEn: 'You Are Living by Habit, Not Choice',
    sublineEn: 'Much of your day unfolds before you notice that you are repeating what has already been repeated.',
    metaDescriptionEn:
      'Most daily decisions come from habit, not conscious choice. Real direction begins when repetition becomes visible.'
  },
  'sai-moi-truong': {
    titleEn: 'You Are Not Less Capable, You Are in the Wrong Place',
    sublineEn: 'Sometimes the problem is not that you are not good enough.',
    metaDescriptionEn:
      'The problem is not always you. Sometimes the environment around you cannot support the way you are meant to grow.'
  },
  'song-sai-nhip': {
    titleEn: 'You Are Not Tired from Doing Too Much, You Are Out of Rhythm',
    sublineEn: 'Some exhaustion does not come from excess. It comes from living against your own natural pace.',
    metaDescriptionEn:
      'Exhaustion does not always come from workload. It can come from living against a rhythm that does not fit you.'
  },
  'hieu-cuoc-doi-minh': {
    titleEn: 'You Do Not Need to Change Your Life, You Need to Understand It',
    sublineEn: 'The first answer is not always a new life. Sometimes it is a truer way of seeing the one you already have.',
    metaDescriptionEn:
      'The urgent need is not always a new life. Often it is a truer understanding of the life you are already living.'
  },
  'dieu-ban-dang-tranh': {
    titleEn: 'What You Avoid Is Exactly What You Need to See',
    sublineEn: 'What you avoid does not leave your life. It simply moves into the dark and keeps working from there.',
    metaDescriptionEn:
      'What you avoid does not disappear. It returns in other forms and keeps shaping your life from the shadows.'
  },
  'chua-tung-co-huong': {
    titleEn: 'You Have Not Lost Direction, You Never Truly Had One',
    sublineEn: 'Perhaps you have not lost anything. You are only seeing that you have walked too long in a borrowed direction.',
    metaDescriptionEn:
      'Feeling lost may simply mean you have been following a borrowed direction for too long.'
  },
  'thieu-su-that': {
    titleEn: 'You Do Not Lack Motivation, You Lack Truth',
    sublineEn: 'What holds you still is not always low energy. Sometimes it is the refusal to face what you already know.',
    metaDescriptionEn:
      'Motivation fades quickly when it is asked to fight a truth you already know but do not want to face.'
  },
  'co-nguoi-can-dung-lai': {
    titleEn: 'Not Everyone Needs Growth, Some People Need to Pause',
    sublineEn: 'There are seasons when continuing to grow in the usual way only takes you further from what you actually need.',
    metaDescriptionEn:
      'Some seasons do not ask for more growth. They ask for rest, quiet, and a return to your own voice.'
  },
  'chi-can-dung': {
    titleEn: 'Your Life Does Not Need Optimization, Only Alignment',
    sublineEn: 'Optimization can make life run more smoothly. But a true life needs more than efficiency.',
    metaDescriptionEn:
      'A well-optimized life may run smoothly, but it may still be far from what is true for you.'
  }
};

const INTERNAL_LINKS = {
  'ban-khong-thieu-kien-thuc': ['song-theo-thoi-quen', 'hieu-cuoc-doi-minh', 'chua-tung-co-huong'],
  'song-theo-thoi-quen': ['ban-khong-thieu-kien-thuc', 'dieu-ban-dang-tranh', 'thieu-su-that'],
  'sai-moi-truong': ['song-sai-nhip', 'chua-tung-co-huong', 'chi-can-dung'],
  'song-sai-nhip': ['hieu-cuoc-doi-minh', 'thieu-su-that', 'co-nguoi-can-dung-lai'],
  'hieu-cuoc-doi-minh': ['ban-khong-thieu-kien-thuc', 'dieu-ban-dang-tranh', 'chi-can-dung'],
  'dieu-ban-dang-tranh': ['song-theo-thoi-quen', 'hieu-cuoc-doi-minh', 'chua-tung-co-huong'],
  'chua-tung-co-huong': ['ban-khong-thieu-kien-thuc', 'sai-moi-truong', 'chi-can-dung'],
  'thieu-su-that': ['song-theo-thoi-quen', 'dieu-ban-dang-tranh', 'co-nguoi-can-dung-lai'],
  'co-nguoi-can-dung-lai': ['song-sai-nhip', 'thieu-su-that', 'chi-can-dung'],
  'chi-can-dung': ['ban-khong-thieu-kien-thuc', 'hieu-cuoc-doi-minh', 'co-nguoi-can-dung-lai']
};

const CTA_BY_SLUG = {
  'ban-khong-thieu-kien-thuc': { vi: { href: '/hanh-trinh/', label: 'Đọc hành trình' }, en: { href: '/en/hanh-trinh/', label: 'Read the journey' } },
  'song-theo-thoi-quen': { vi: { href: '/bai-viet/', label: 'Đọc bài khác' }, en: { href: '/en/bai-viet/', label: 'Read another article' } },
  'sai-moi-truong': { vi: { href: '/hanh-trinh/', label: 'Đi tiếp từ hành trình' }, en: { href: '/en/hanh-trinh/', label: 'Continue with the journey' } },
  'song-sai-nhip': { vi: { href: '/bai-viet/', label: 'Đọc tiếp trong loạt này' }, en: { href: '/en/bai-viet/', label: 'Keep reading this sequence' } },
  'hieu-cuoc-doi-minh': { vi: { href: '/phuong-phap/', label: 'Xem cách tiếp cận' }, en: { href: '/en/phuong-phap/', label: 'View the approach' } },
  'dieu-ban-dang-tranh': { vi: { href: '/lien-he/', label: 'Kết nối nếu bạn muốn đi sâu hơn' }, en: { href: '/en/lien-he/', label: 'Reach out if you want to go deeper' } },
  'chua-tung-co-huong': { vi: { href: '/hanh-trinh/', label: 'Bắt đầu lại từ hành trình' }, en: { href: '/en/hanh-trinh/', label: 'Begin again with the journey' } },
  'thieu-su-that': { vi: { href: '/phuong-phap/', label: 'Đọc cách nhìn này' }, en: { href: '/en/phuong-phap/', label: 'Read this way of seeing' } },
  'co-nguoi-can-dung-lai': { vi: { href: '/hanh-trinh/', label: 'Cho mình một khoảng dừng' }, en: { href: '/en/hanh-trinh/', label: 'Give yourself a pause' } },
  'chi-can-dung': { vi: { href: '/lien-he/', label: 'Đi tiếp theo cách thật hơn' }, en: { href: '/en/lien-he/', label: 'Continue in a truer way' } }
};

function vnTimestamp() {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}+07:00`;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function tidy(value) {
  return value.replace(/\r/g, '').trim().replace(/[ \t]{2,}/g, ' ');
}

function splitParagraphs(block) {
  return tidy(block)
    .split(/\n\s*\n/)
    .map((part) => tidy(part).replace(/\n/g, ' ').replace(/[ \t]{2,}/g, ' '))
    .filter(Boolean);
}

function extractValue(section, startMarker, endMarker) {
  const start = section.indexOf(startMarker);
  if (start === -1) return '';
  const afterStart = section.slice(start + startMarker.length);
  const end = endMarker ? afterStart.indexOf(endMarker) : -1;
  const chunk = end === -1 ? afterStart : afterStart.slice(0, end);
  return tidy(chunk);
}

function parseLaunchPack() {
  const raw = fs.readFileSync(SOURCE_DOC, 'utf8').replace(/\r/g, '');
  const sectionPattern = /## Bài (\d+)\n([\s\S]*?)(?=\n## Bài \d+\n|\n---\n\n## 5\.)/g;
  const articles = [];
  let match;

  while ((match = sectionPattern.exec(raw))) {
    const order = Number(match[1]);
    const section = match[2];
    const url = extractValue(section, '### URL\n\n`', '`');
    const slug = url.replace(/^\/|\/$/g, '');
    const metaTitleVi = extractValue(section, '### Meta Title\n\n`', '`');
    const metaDescriptionVi = extractValue(section, '### Meta Description\n\n`', '`');
    const titleVi = extractValue(section, '### H1\n\n`', '`');
    const sublineVi = extractValue(section, '### Subline\n\n', '\n\n### VI');
    const bodyVi = splitParagraphs(extractValue(section, '### VI\n\n', '\n\n### Câu kết'));
    const closingVi = extractValue(section, '### Câu kết\n\n', '\n\n### EN');
    const bodyEn = splitParagraphs(extractValue(section, '### EN\n\n', '\n\n### Closing'));
    const closingEn = extractValue(section, '### Closing\n\n', '');
    const english = EN_OVERRIDES[slug];

    if (!english) {
      throw new Error(`Missing EN overrides for slug: ${slug}`);
    }

    articles.push({
      order,
      slug,
      url,
      titleVi,
      metaTitleVi,
      metaDescriptionVi,
      sublineVi,
      bodyVi,
      closingVi,
      titleEn: english.titleEn,
      metaTitleEn: `${english.titleEn} | Nguyenlananh.com`,
      metaDescriptionEn: english.metaDescriptionEn,
      sublineEn: english.sublineEn,
      bodyEn,
      closingEn
    });
  }

  if (articles.length !== 10) {
    throw new Error(`Expected 10 launch articles, found ${articles.length}`);
  }

  return articles.sort((a, b) => a.order - b.order);
}

function buildManifest(articles) {
  return {
    collection: 'articles',
    source: '/docs/NGUYENLANANH_LAUNCH_CONTENT_PACK_2026-04-17.md',
    generatedAt: vnTimestamp(),
    status: 'published',
    localeStrategy: 'vi-first-bilingual',
    cmsFieldMap: {
      title_vi: 'title',
      title_en: 'localized.title.en',
      subline_vi: 'excerpt',
      subline_en: 'localized.excerpt.en',
      content_vi: 'content',
      content_en: 'localized.content.en',
      meta_title: 'seo_title',
      meta_description: 'seo_description',
      hero_image: 'featured_image',
      publish_date: 'published_at',
      category: 'category',
      publish_order: 'series_order'
    },
    items: articles.map((article) => ({
      collection: 'articles',
      status: 'published',
      publish_order: article.order,
      category: 'di-vao-ben-trong',
      series_name: 'launch-10-inner-clarity',
      series_order: article.order,
      slug: article.slug,
      path_vi: `/bai-viet/${article.slug}/`,
      path_en: `/en/bai-viet/${article.slug}/`,
      title_vi: article.titleVi,
      title_en: article.titleEn,
      meta_title_vi: article.metaTitleVi,
      meta_title_en: article.metaTitleEn,
      meta_description_vi: article.metaDescriptionVi,
      meta_description_en: article.metaDescriptionEn,
      subline_vi: article.sublineVi,
      subline_en: article.sublineEn,
      content_vi: article.bodyVi,
      content_en: article.bodyEn,
      closing_vi: article.closingVi,
      closing_en: article.closingEn,
      published_at: '2026-04-17',
      internal_links: INTERNAL_LINKS[article.slug].map((slug) => ({
        slug,
        path_vi: `/bai-viet/${slug}/`,
        path_en: `/en/bai-viet/${slug}/`,
        label_vi: articles.find((entry) => entry.slug === slug)?.titleVi ?? slug,
        label_en: articles.find((entry) => entry.slug === slug)?.titleEn ?? slug
      })),
      cta_vi: CTA_BY_SLUG[article.slug].vi,
      cta_en: CTA_BY_SLUG[article.slug].en
    }))
  };
}

function renderParagraphs(paragraphs) {
  return paragraphs.map((paragraph) => `      <p>${escapeHtml(paragraph)}</p>`).join('\n');
}

function renderLinks(articles, slugs, locale) {
  const prefix = locale === 'vi' ? '/bai-viet/' : '/en/bai-viet/';
  const titleKey = locale === 'vi' ? 'titleVi' : 'titleEn';
  return slugs
    .map((slug) => {
      const article = articles.find((entry) => entry.slug === slug);
      if (!article) return '';
      return `          <li><a href="${prefix}${slug}/">${escapeHtml(article[titleKey])}</a></li>`;
    })
    .filter(Boolean)
    .join('\n');
}

function renderArticlePage(article, articles, locale) {
  const isVi = locale === 'vi';
  const pagePrefix = isVi ? '' : '/en';
  const lang = isVi ? 'vi' : 'en-US';
  const title = isVi ? article.titleVi : article.titleEn;
  const metaTitle = isVi ? article.metaTitleVi : article.metaTitleEn;
  const metaDescription = isVi ? article.metaDescriptionVi : article.metaDescriptionEn;
  const subline = isVi ? article.sublineVi : article.sublineEn;
  const body = isVi ? article.bodyVi : article.bodyEn;
  const closing = isVi ? article.closingVi : article.closingEn;
  const categoryLabel = isVi ? 'Đi vào bên trong' : 'Inner Work';
  const titleSection = isVi ? 'Bài viết' : 'Articles';
  const internalLinksTitle = isVi ? 'Liên kết nội bộ' : 'Internal links';
  const listCta = isVi ? 'Xem toàn bộ bài viết' : 'View all articles';
  const finalNote =
    isVi
      ? 'Loạt 10 bài mở đầu này được khóa thứ tự để người đọc có thể đi từng lớp, không phải đọc rời rạc.'
      : 'This 10-piece launch sequence is intentionally ordered so the reader can move layer by layer rather than at random.';
  const cta = CTA_BY_SLUG[article.slug][isVi ? 'vi' : 'en'];
  const canonical = `${DOMAIN}${pagePrefix}/bai-viet/${article.slug}/`;
  const alternateVi = `${DOMAIN}/bai-viet/${article.slug}/`;
  const alternateEn = `${DOMAIN}/en/bai-viet/${article.slug}/`;
  const nav = isVi
    ? {
        home: '/',
        journey: '/hanh-trinh/',
        method: '/phuong-phap/',
        articles: '/bai-viet/',
        members: '/members/',
        start: '/join/',
        homeLabel: 'Trang chủ',
        journeyLabel: 'Hành trình',
        methodLabel: 'Hệ thống',
        articlesLabel: 'Bài viết',
        membersLabel: 'Thành viên',
        startLabel: 'Bắt đầu',
        brand: 'Nguyễn Lan Anh',
        brandSub: 'Đi vào bên trong để làm chủ lại cuộc đời',
        footerLine: 'Không phải để trở thành ai đó. Mà để trở về đúng là mình.',
        footerLinks: [
          ['Giới thiệu', '/gioi-thieu/'],
          ['Hành trình', '/hanh-trinh/'],
          ['Hệ thống', '/phuong-phap/'],
          ['Chương trình', '/chuong-trinh/'],
          ['Bài viết', '/bai-viet/'],
          ['Liên hệ', '/lien-he/']
        ],
        legalLinks: [
          ['Chính sách bảo mật', '/chinh-sach-bao-mat/'],
          ['Điều khoản sử dụng', '/dieu-khoan/'],
          ['Miễn trừ trách nhiệm', '/mien-tru-trach-nhiem/']
        ]
      }
    : {
        home: '/en/',
        journey: '/en/hanh-trinh/',
        method: '/en/phuong-phap/',
        articles: '/en/bai-viet/',
        members: '/en/members/',
        start: '/en/join/',
        homeLabel: 'Home',
        journeyLabel: 'Journey',
        methodLabel: 'System',
        articlesLabel: 'Articles',
        membersLabel: 'Membership',
        startLabel: 'Start',
        brand: 'Lan Anh Nguyen',
        brandSub: 'Go within to take back your life',
        footerLine: 'Not to become someone else, but to return to who you truly are.',
        footerLinks: [
          ['About', '/en/gioi-thieu/'],
          ['Journey', '/en/hanh-trinh/'],
          ['System', '/en/phuong-phap/'],
          ['Programs', '/en/chuong-trinh/'],
          ['Articles', '/en/bai-viet/'],
          ['Contact', '/en/lien-he/']
        ],
        legalLinks: [
          ['Privacy Policy', '/en/chinh-sach-bao-mat/'],
          ['Terms of Use', '/en/dieu-khoan/'],
          ['Disclaimer', '/en/mien-tru-trach-nhiem/']
        ]
      };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: metaDescription,
    datePublished: '2026-04-17',
    dateModified: '2026-04-17',
    inLanguage: lang,
    mainEntityOfPage: canonical,
    articleSection: categoryLabel,
    image: OG_IMAGE,
    author: { '@type': 'Person', name: isVi ? 'Nguyễn Lan Anh' : 'Lan Anh Nguyen' },
    publisher: { '@type': 'Organization', name: 'Nguyenlananh.com', url: DOMAIN }
  };

  const footerLinks = nav.footerLinks
    .map(([label, href]) => `<a href="${href}">${label}</a>`)
    .join('');
  const legalLinks = nav.legalLinks.map(([label, href]) => `<a href="${href}">${label}</a>`).join('');

  return `<!doctype html>
<html lang="${lang}" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>${escapeHtml(metaTitle)}</title>
  <meta name="description" content="${escapeAttr(metaDescription)}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="alternate" hreflang="vi" href="${alternateVi}" />
  <link rel="alternate" hreflang="en-US" href="${alternateEn}" />
  <link rel="alternate" hreflang="en" href="${alternateEn}" />
  <link rel="alternate" hreflang="x-default" href="${DOMAIN}/" />
  <meta name="robots" content="index,follow" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeAttr(title)}" />
  <meta property="og:description" content="${escapeAttr(metaDescription)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeAttr(title)}" />
  <meta name="twitter:description" content="${escapeAttr(metaDescription)}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />
  <link rel="stylesheet" href="/assets/site.css" />
  <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
  </script>
</head>
<body>
  <header class="topbar" role="banner"><div class="container"><div class="navwrap"><a class="brand" href="${nav.home}"><div class="mark" aria-hidden="true"></div><div class="name"><strong>${nav.brand}</strong><span>${nav.brandSub}</span></div></a><nav class="navlinks" aria-label="${isVi ? 'Điều hướng chính' : 'Primary navigation'}"><a href="${nav.home}">${nav.homeLabel}</a><a href="${nav.journey}">${nav.journeyLabel}</a><a href="${nav.method}">${nav.methodLabel}</a><a href="${nav.articles}">${nav.articlesLabel}</a><a href="${nav.members}">${nav.membersLabel}</a><a href="${nav.start}">${nav.startLabel}</a></nav><div class="actions"><a class="btn" href="${nav.start}">${isVi ? 'Đăng ký thành viên' : 'Register membership'}</a></div></div></div></header>

  <main class="container" role="main">
    <section class="pageHead">
      <p style="margin:0; font-size:13px; color:rgba(15,23,42,.6);"><a href="${nav.articles}">${titleSection}</a> / <a href="${pagePrefix}/bai-viet/di-vao-ben-trong/">${categoryLabel}</a></p>
      <h1>${escapeHtml(title)}</h1>
      <p class="sub">${escapeHtml(subline)}</p>
    </section>

    <article class="panel articleBody">
${renderParagraphs(body)}
      <p style="margin-top:18px; font-weight:600;">${escapeHtml(closing)}</p>
    </article>

    <section class="panel" style="margin-top:12px;">
      <h3>${internalLinksTitle}</h3>
      <ul class="list">
${renderLinks(articles, INTERNAL_LINKS[article.slug], locale)}
      </ul>
      <div class="actionsRow">
        <a class="cta" href="${cta.href}">${cta.label}</a>
        <a class="ghost" href="${nav.articles}">${listCta}</a>
      </div>
      <p style="margin-top:10px;">${escapeHtml(finalNote)}</p>
    </section>
  </main>

  <footer role="contentinfo"><div class="container"><div class="fwrap"><div><div style="font-weight:700; color:rgba(15,23,42,.8);">${nav.brand}</div><div>© <span id="year"></span> · ${nav.footerLine}</div></div><div style="display:flex; gap:6px; flex-wrap:wrap;">${footerLinks}</div></div><div class="legal" style="margin-top:10px; color:rgba(15,23,42,.6);">${legalLinks}</div></div></footer>

  <script src="/assets/content-registry.js"></script>
  <script src="/assets/site.js"></script>
  <script src="/assets/lang-routing.js"></script>
</body>
</html>
`;
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function main() {
  const articles = parseLaunchPack();
  const manifest = buildManifest(articles);

  writeFile(MANIFEST_OUT, `${JSON.stringify(manifest, null, 2)}\n`);

  for (const article of articles) {
    writeFile(
      path.join(ROOT, 'bai-viet', article.slug, 'index.html'),
      renderArticlePage(article, articles, 'vi')
    );
    writeFile(
      path.join(ROOT, 'en', 'bai-viet', article.slug, 'index.html'),
      renderArticlePage(article, articles, 'en')
    );
  }

  console.log(`Built ${articles.length} launch articles and manifest.`);
}

main();
