import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join, relative } from 'path';

const root = resolve(process.cwd());
const exclude = ['node_modules', '.wrangler', '.claude', '.git', 'assets/pdf'];
const htmlFiles = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && !exclude.includes(entry.name)) {
      walk(join(dir, entry.name));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlFiles.push(relative(root, join(dir, entry.name)));
    }
  }
}
walk(root);

const rows = [];
const titleMap = new Map();
let issues = 0;

for (const file of htmlFiles) {
  const html = readFileSync(resolve(root, file), 'utf8');
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
  const description = descMatch ? descMatch[1].trim() : '';
  const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i);
  const canonical = canonicalMatch ? canonicalMatch[1].trim() : '';
  const hasHreflang = html.includes('rel="alternate"');
  const hasOg = html.includes('property="og:title"');
  const hasSchema = html.includes('application/ld+json');
  const h1Matches = html.match(/<h1[^>]*>/gi) || [];
  const h1Count = h1Matches.length;

  const rowIssues = [];
  if (!title) rowIssues.push('missing title');
  if (!description) rowIssues.push('missing description');
  if (!canonical) rowIssues.push('missing canonical');
  if (!hasHreflang) rowIssues.push('missing hreflang');
  if (!hasOg) rowIssues.push('missing og');
  if (!hasSchema) rowIssues.push('missing schema');
  if (h1Count === 0) rowIssues.push('missing h1');
  if (h1Count > 1) rowIssues.push('multiple h1');

  if (rowIssues.length > 0) issues += rowIssues.length;

  if (title) {
    titleMap.set(title, (titleMap.get(title) || 0) + 1);
  }

  rows.push({
    file,
    title,
    description_length: description.length,
    canonical,
    hreflang: hasHreflang ? 'yes' : 'no',
    og: hasOg ? 'yes' : 'no',
    schema: hasSchema ? 'yes' : 'no',
    h1_count: h1Count,
    issues: rowIssues.join('; ') || 'ok'
  });
}

const duplicates = [];
for (const [title, count] of titleMap.entries()) {
  if (count > 1) duplicates.push({ title, count });
}

writeFileSync(resolve(root, 'docs/reports/NGUYENLANANH_SEO_AUDIT.csv'), [
  Object.keys(rows[0]).join(','),
  ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
].join('\n'));

writeFileSync(resolve(root, 'docs/reports/NGUYENLANANH_DUPLICATE_TITLES.json'), JSON.stringify(duplicates, null, 2));

console.log(`SEO audit: ${htmlFiles.length} HTML files checked.`);
console.log(`Issues found: ${issues}`);
console.log(`Duplicate titles: ${duplicates.length}`);
console.log(`CSV written to: docs/reports/NGUYENLANANH_SEO_AUDIT.csv`);
