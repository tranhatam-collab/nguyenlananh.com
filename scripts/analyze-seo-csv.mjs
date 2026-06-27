import { readFileSync } from 'fs';

const lines = readFileSync('docs/reports/NGUYENLANANH_SEO_AUDIT.csv', 'utf8').trim().split('\n');
const rows = lines.slice(1).map(line => {
  const parts = line.split(',');
  return {
    file: parts[0].replace(/"/g, ''),
    title: parts[1].replace(/"/g, ''),
    desc_len: parts[2].replace(/"/g, ''),
    canonical: parts[3].replace(/"/g, ''),
    hreflang: parts[4].replace(/"/g, ''),
    og: parts[5].replace(/"/g, ''),
    schema: parts[6].replace(/"/g, ''),
    h1_count: parts[7].replace(/"/g, ''),
    issues: parts[8].replace(/"/g, '')
  };
});

const counts = {};
const publicMissingHreflang = [];
const publicMissingDescription = [];
const publicMissingCanonical = [];
const publicMissingOg = [];

for (const r of rows) {
  if (r.issues === 'ok') continue;
  for (const issue of r.issues.split(';').map(s => s.trim())) {
    if (issue) counts[issue] = (counts[issue] || 0) + 1;
  }
  const isPublic = !r.file.startsWith('admin/') && !r.file.includes('assets/pdf/') && !r.file.includes('[slug]') && r.file !== '404.html';
  if (isPublic) {
    if (r.hreflang === 'no') publicMissingHreflang.push(r.file);
    if (r.issues.includes('missing description')) publicMissingDescription.push(r.file);
    if (r.issues.includes('missing canonical')) publicMissingCanonical.push(r.file);
    if (r.issues.includes('missing og')) publicMissingOg.push(r.file);
  }
}

console.log('Issue counts:', counts);
console.log('\nPublic pages missing hreflang:', publicMissingHreflang.length);
publicMissingHreflang.slice(0, 30).forEach(f => console.log(' -', f));
console.log('\nPublic pages missing description:', publicMissingDescription.length);
publicMissingDescription.slice(0, 20).forEach(f => console.log(' -', f));
console.log('\nPublic pages missing canonical:', publicMissingCanonical.length);
console.log('\nPublic pages missing og:', publicMissingOg.length);
