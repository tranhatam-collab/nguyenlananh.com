import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const DOMAIN = 'https://www.nguyenlananh.com';

const RAW_FILES = execSync('git ls-files "*index.html"', { encoding: 'utf8' })
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean)
  .filter((p) => !p.startsWith('nguyenlananh.com/'))
  .filter((p) => !p.startsWith('.claude/'));

const VI_FILES = RAW_FILES.filter((p) => !p.startsWith('en/'));

function routeFromFile(file) {
  if (file === 'index.html') return '/';
  if (!file.endsWith('/index.html')) return '/';
  const dir = file.slice(0, -'/index.html'.length);
  return `/${dir}/`;
}

function enRouteFromVi(viRoute) {
  if (viRoute === '/') return '/en/';
  return `/en${viRoute}`;
}

function viRouteFromEn(enRoute) {
  if (enRoute === '/en/' || enRoute === '/en') return '/';
  if (!enRoute.startsWith('/en/')) return enRoute;
  return `/${enRoute.slice('/en/'.length)}`;
}

function splitSuffix(url) {
  const i = url.search(/[?#]/);
  if (i === -1) return { p: url, s: '' };
  return { p: url.slice(0, i), s: url.slice(i) };
}

function toEnHref(href) {
  const { p, s } = splitSuffix(href);
  if (p === '/') return `/en/${s}`;
  if (p.startsWith('/en/')) return `${p}${s}`;
  if (p.startsWith('/assets/') || p.startsWith('/cdn-cgi/') || p.startsWith('/_')) return `${p}${s}`;
  if (p === '/robots.txt' || p === '/sitemap.xml') return `${p}${s}`;
  if (!p.startsWith('/')) return `${p}${s}`;
  return `/en${p}${s}`;
}

function toViHref(href) {
  const { p, s } = splitSuffix(href);
  if (p === '/en/' || p === '/en') return `/${s}`;
  if (p.startsWith('/en/')) return `/${p.slice(4)}${s}`;
  return `${p}${s}`;
}

function rewriteInternalHrefs(html, mode) {
  return html.replace(/href="([^"]+)"/g, (m, href) => {
    if (!href) return m;
    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:') ||
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('//')
    ) {
      return m;
    }
    const next = mode === 'en' ? toEnHref(href) : toViHref(href);
    return `href="${next}"`;
  });
}

function upsertCanonical(html, url) {
  if (/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/i.test(html)) {
    return html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/i, `<link rel="canonical" href="${url}" />`);
  }
  return html.replace(/<meta\s+name="robots"[^>]*>/i, `<link rel="canonical" href="${url}" />\n  $&`);
}

function upsertOgUrl(html, url) {
  if (/<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/i.test(html)) {
    return html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/i, `<meta property="og:url" content="${url}" />`);
  }
  return html;
}

function stripAlternateTags(html) {
  return html.replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="[^"]*"\s*\/>\n?/gi, '\n');
}

function insertAlternateTags(html, viRoute, enRoute) {
  const block = [
    `  <link rel="alternate" hreflang="vi" href="${DOMAIN}${viRoute}" />`,
    `  <link rel="alternate" hreflang="en-US" href="${DOMAIN}${enRoute}" />`,
    `  <link rel="alternate" hreflang="en" href="${DOMAIN}${enRoute}" />`,
    `  <link rel="alternate" hreflang="x-default" href="${DOMAIN}/" />`
  ].join('\n');

  if (/<link\s+rel="canonical"/i.test(html)) {
    return html.replace(/(<link\s+rel="canonical"[^\n]*\n)/i, `$1${block}\n`);
  }

  return html.replace(/<meta\s+name="robots"/i, `${block}\n\n  <meta name="robots"`);
}

function ensureLangScript(html) {
  if (html.includes('/assets/lang-routing.js')) return html;
  return html.replace('</body>', '  <script src="/assets/lang-routing.js"></script>\n</body>');
}

function setHtmlLang(html, langCode) {
  if (/<html[^>]*lang="[^"]+"/i.test(html)) {
    return html.replace(/(<html[^>]*lang=")([^"]+)("[^>]*>)/i, `$1${langCode}$3`);
  }
  return html.replace(/<html(\s|>)/i, `<html lang="${langCode}"$1`);
}

function translateCommonUI(enHtml) {
  const pairs = [
    ['>Trang chủ<', '>Home<'],
    ['>Hành trình<', '>Journey<'],
    ['>Phương pháp<', '>Method<'],
    ['>Chương trình<', '>Programs<'],
    ['>Bài viết<', '>Articles<'],
    ['>Liên hệ<', '>Contact<'],
    ['>Giới thiệu<', '>About<'],
    ['>Điều khoản sử dụng<', '>Terms of Use<'],
    ['>Chính sách bảo mật<', '>Privacy Policy<'],
    ['>Miễn trừ trách nhiệm<', '>Disclaimer<'],
    ['>Đóng<', '>Close<'],
    ['>Mở menu<', '>Open menu<'],
    ['>Đăng xuất<', '>Sign out<'],
    ['>Bắt đầu từ 3 USD<', '>Start from $3<'],
    ['>Mở khóa toàn bộ hành trình<', '>Unlock full journey<'],
    ['>Không đọc thêm. Bắt đầu.<', '>Stop reading. Start now.<'],
    ['>Liên hệ đồng hành<', '>Contact for guidance<'],
    ['>Đi tiếp từ đây<', '>Continue from here<'],
    ['>Về trang bài viết<', '>Back to articles<']
  ];

  let out = enHtml;
  for (const [a, b] of pairs) out = out.split(a).join(b);
  return out;
}

function writeFile(file, content) {
  fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, file), content, 'utf8');
}

for (const viFile of VI_FILES) {
  const viRoute = routeFromFile(viFile);
  const enRoute = enRouteFromVi(viRoute);

  let viHtml = fs.readFileSync(path.join(ROOT, viFile), 'utf8');
  viHtml = setHtmlLang(viHtml, 'vi');
  viHtml = upsertCanonical(viHtml, `${DOMAIN}${viRoute}`);
  viHtml = upsertOgUrl(viHtml, `${DOMAIN}${viRoute}`);
  viHtml = stripAlternateTags(viHtml);
  viHtml = insertAlternateTags(viHtml, viRoute, enRoute);
  viHtml = viHtml.replace(/href="\/en\/"/g, `href="${enRoute}"`);
  viHtml = ensureLangScript(viHtml);
  writeFile(viFile, viHtml);

  const enFile = viFile === 'index.html' ? 'en/index.html' : `en/${viFile}`;
  const enPath = path.join(ROOT, enFile);
  const hasExistingEn = fs.existsSync(enPath);

  // Preserve manually curated English copy when present.
  let enHtml = hasExistingEn ? fs.readFileSync(enPath, 'utf8') : viHtml;
  enHtml = setHtmlLang(enHtml, 'en-US');
  enHtml = upsertCanonical(enHtml, `${DOMAIN}${enRoute}`);
  enHtml = upsertOgUrl(enHtml, `${DOMAIN}${enRoute}`);
  enHtml = stripAlternateTags(enHtml);
  enHtml = insertAlternateTags(enHtml, viRoute, enRoute);
  enHtml = rewriteInternalHrefs(enHtml, 'en');
  if (!hasExistingEn) {
    enHtml = translateCommonUI(enHtml);
  }
  enHtml = ensureLangScript(enHtml);

  writeFile(enFile, enHtml);
}

function getAllIndexFiles() {
  const files = execSync('find . -name "index.html"', { encoding: 'utf8' })
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/^\.\//, ''))
    .filter((p) => !p.startsWith('.git/'))
    .filter((p) => !p.startsWith('.claude/'))
    .filter((p) => !p.startsWith('nguyenlananh.com/'));
  return files;
}

function shouldIndex(file) {
  if (file.includes('/[slug]/')) return false;
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const robots = html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i);
  if (!robots) return true;
  return !robots[1].toLowerCase().includes('noindex');
}

function routeFromAny(file) {
  if (file === 'index.html') return '/';
  if (file.endsWith('/index.html')) return `/${file.slice(0, -'/index.html'.length)}/`;
  return '/';
}

const allIndex = getAllIndexFiles().filter(shouldIndex);
const uniqRoutes = [...new Set(allIndex.map(routeFromAny))].sort();

const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
for (const r of uniqRoutes) {
  let pr = '0.8';
  let cf = 'weekly';
  if (r === '/') { pr = '1.0'; cf = 'daily'; }
  else if (r === '/en/') { pr = '0.9'; cf = 'daily'; }
  else if (r === '/bai-viet/' || r === '/en/bai-viet/') { pr = '0.95'; cf = 'daily'; }
  else if (r.startsWith('/bai-viet/') || r.startsWith('/en/bai-viet/')) { pr = '0.74'; cf = 'monthly'; }
  lines.push(`  <url><loc>${DOMAIN}${r}</loc><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`);
}
lines.push('</urlset>');
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `${lines.join('\n')}\n`, 'utf8');

console.log(`Processed VI pages: ${VI_FILES.length}`);
console.log(`Indexed routes in sitemap: ${uniqRoutes.length}`);
