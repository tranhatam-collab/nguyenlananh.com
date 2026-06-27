import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';

const root = resolve(process.cwd());
const csvPath = resolve(root, 'docs/reports/NGUYENLANANH_SEO_AUDIT.csv');

const csv = readFileSync(csvPath, 'utf8');
const lines = csv.split('\n').slice(1).filter(Boolean);

function parseCsvLine(line) {
  const parts = [];
  let current = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts;
}

function toAbsoluteUrl(file) {
  return `https://www.nguyenlananh.com/${file.replace(/index\.html$/, '')}`;
}

function enVersion(file) {
  return file.replace(/^([^/]+\/)?/, 'en/');
}

function addHreflang(html, file) {
  const url = toAbsoluteUrl(file);
  const enFile = enVersion(file);
  const hasEn = existsSync(resolve(root, enFile));
  let tags = `  <link rel="alternate" hreflang="vi" href="${url}" />\n`;
  if (hasEn) {
    const enUrl = toAbsoluteUrl(enFile);
    tags += `  <link rel="alternate" hreflang="en-US" href="${enUrl}" />\n`;
    tags += `  <link rel="alternate" hreflang="en" href="${enUrl}" />\n`;
  }
  tags += `  <link rel="alternate" hreflang="x-default" href="${url}" />\n`;

  if (html.includes('hreflang=')) return html;
  const canonicalMatch = html.match(/(<link rel="canonical"[^>]*>)/);
  if (canonicalMatch) {
    return html.replace(canonicalMatch[1], `${canonicalMatch[1]}\n${tags}`);
  }
  return html;
}

function addOg(html, file) {
  if (html.includes('property="og:title"')) return html;
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  const title = titleMatch ? titleMatch[1] : 'Nguyenlananh.com';
  const descMatch = html.match(/<meta name="description" content="([^"]*)"/);
  const desc = descMatch ? descMatch[1] : '';
  const url = toAbsoluteUrl(file);
  const ogTags = [
    `  <meta property="og:title" content="${title}" />`,
    `  <meta property="og:description" content="${desc}" />`,
    `  <meta property="og:url" content="${url}" />`,
    `  <meta property="og:image" content="https://www.nguyenlananh.com/assets/og/og-homepage.svg" />`,
    `  <meta name="twitter:card" content="summary_large_image" />`,
    `  <meta name="twitter:title" content="${title}" />`,
    `  <meta name="twitter:description" content="${desc}" />`,
    `  <meta name="twitter:image" content="https://www.nguyenlananh.com/assets/og/og-homepage.svg" />`
  ].join('\n') + '\n';

  const titleTag = html.match(/(<\/title>)/);
  if (titleTag) {
    return html.replace(titleTag[1], `</title>\n${ogTags}`);
  }
  return html;
}

let fixed = 0;
for (const line of lines) {
  const parts = parseCsvLine(line);
  const file = parts[0];
  const hreflang = parts[4];
  const og = parts[5];
  const issues = parts[8] || '';

  if (file.startsWith('admin/') || file.startsWith('members/') || file.startsWith('docs/') || file.startsWith('assets/')) continue;
  if (hreflang !== 'no' && og !== 'no' && !issues.includes('missing description') && !issues.includes('missing canonical')) continue;

  const path = resolve(root, file);
  if (!existsSync(path)) continue;
  let html = readFileSync(path, 'utf8');
  let changed = false;

  if (hreflang === 'no') {
    html = addHreflang(html, file);
    changed = true;
  }
  if (og === 'no') {
    html = addOg(html, file);
    changed = true;
  }

  if (changed) {
    writeFileSync(path, html);
    fixed++;
  }
}

console.log(`Fixed ${fixed} files.`);
