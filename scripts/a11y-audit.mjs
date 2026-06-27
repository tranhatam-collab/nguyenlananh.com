import { readFileSync, writeFileSync } from 'fs';
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

import { readdirSync } from 'fs';
walk(root);

const rows = [];
let totalIssues = 0;

for (const file of htmlFiles) {
  const html = readFileSync(resolve(root, file), 'utf8');
  const issues = [];

  // Skip link
  if (!html.includes('class="skip"') && !html.includes('href="#main"')) {
    issues.push('missing skip link');
  }

  // Images without alt
  const imgTags = html.match(/<img[^>]*>/gi) || [];
  let missingAlt = 0;
  for (const img of imgTags) {
    if (!/alt=/.test(img)) missingAlt++;
  }
  if (missingAlt > 0) issues.push(`${missingAlt} img without alt`);

  // Form inputs without labels or aria-label
  const inputTags = html.match(/<input[^>]*>/gi) || [];
  let unlabeledInputs = 0;
  for (const input of inputTags) {
    const hasLabel = /id=/.test(input) && html.includes(`for=${input.match(/id="([^"]+)"/)?.[1] || ''}`);
    const hasAriaLabel = /aria-label=/.test(input) || /aria-labelledby=/.test(input);
    const hasPlaceholder = /placeholder=/.test(input);
    if (!hasLabel && !hasAriaLabel && !hasPlaceholder) unlabeledInputs++;
  }
  if (unlabeledInputs > 0) issues.push(`${unlabeledInputs} input without label`);

  // Buttons without aria-label or text
  const buttonTags = html.match(/<button[^>]*>[^<]*<\/button>/gi) || [];
  let unlabeledButtons = 0;
  for (const btn of buttonTags) {
    const text = btn.replace(/<[^>]+>/g, '').trim();
    const hasAria = /aria-label=/.test(btn);
    if (!text && !hasAria) unlabeledButtons++;
  }
  if (unlabeledButtons > 0) issues.push(`${unlabeledButtons} button without text/aria-label`);

  // Missing lang attribute
  if (!html.includes('<html lang=')) issues.push('missing html lang');

  // Missing title
  if (!html.includes('<title>')) issues.push('missing title');

  // Page heading
  const h1 = html.match(/<h1[^>]*>[^<]*<\/h1>/i);
  if (!h1) issues.push('missing h1');

  totalIssues += issues.length;
  rows.push({ file, issues: issues.join('; ') || 'ok' });
}

writeFileSync(resolve(root, 'docs/reports/NGUYENLANANH_A11Y_AUDIT.csv'), [
  'file,issues',
  ...rows.map(r => `"${r.file}","${r.issues}"`)
].join('\n'));

console.log(`Accessibility audit: ${htmlFiles.length} HTML files checked.`);
console.log(`Total issues: ${totalIssues}`);
console.log(`CSV written to: docs/reports/NGUYENLANANH_A11Y_AUDIT.csv`);
