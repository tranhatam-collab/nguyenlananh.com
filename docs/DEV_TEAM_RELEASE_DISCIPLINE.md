# Dev team release discipline — nguyenlananh.com

This document is the formal version of the corrections that had to be
nudged in by the product owner during the brand v3 + content compliance
release. Every rule below maps to a specific defect that shipped through.
The list is ordered by severity. **Blocker** rules are deploy-stopping;
**High** rules must be fixed inside the same release window; **Medium**
rules go into the next sprint; **Low** rules go onto the polish queue.

The discipline applies to dev, content, design, marketing, and any tool
or script that mutates HTML at scale.

---

## 1. Page existence (Blocker)

1.1. **No empty HTML.** Every public route must serve a non-zero
`index.html`. A 0-byte file that returns `200` is a release blocker.
Local smoke that only checks HTTP status will not catch this — audit
must read file size on disk.

1.2. **Exactly one `<h1>` per page.** Pages with zero or multiple `<h1>`
elements ship as a Blocker.

1.3. **Every internal link must resolve to a real file or registered
route.** Audit every `<a href="/…">`, `<img src=…>`, `<script src=…>`,
`<link rel="stylesheet" href=…>` against the filesystem before push.
The previous release shipped a broken admin manifest link; the audit
must catch this every time.

1.4. **Sitemap hygiene.** No `docs/`, `.next/`, `.vercel/`, `dist/`,
`out/`, backup files, paths with whitespace, or submodule artifacts in
`sitemap.xml`. Every `<loc>` must point to a real public file. Sitemap
URLs are canonical production URLs, not relative paths.

---

## 2. Localization (Blocker)

2.1. **EN pages must be native English.** No Vietnamese body copy, no
Vietnamese meta, no Vietnamese JSON-LD `headline` / `description`, no
Vietnamese CTAs on `/en/…`. The only allowed Vietnamese on an EN page
is the brand person name (`Lan Anh Nguyen`) and the language switch
label (`🇻🇳 Tiếng Việt`).

2.2. **VI pages must use full diacritics.** Slug-style ASCII
(`di vao ben trong`) on a VI surface is a defect. Diacritics in body,
in headings, in meta, in alt text.

2.3. **Cross-locale parity.** A VI page with hreflang to `/en/<path>`
must have a real EN page at `/en/<path>` with native English content.
A stub or placeholder is not parity.

2.4. **Decorative assets are language-agnostic.** Hero illustrations,
brand mark, OG fallback art must not embed localized text. Title
embedded inside an SVG leaks across locales the moment the same SVG
is referenced from `/en/`. Either author the SVG with no `<text>`
nodes, or ship per-locale assets.

2.5. **JSON-LD `inLanguage` must match `<html lang>`.** And
`mainEntityOfPage` URL must match the locale.

---

## 3. Public copy voice (Blocker)

These strings must never appear on a user-facing page. They are internal
operations vocabulary and break trust the moment a real reader sees them:

- `TODO`, `TBD`, `FIXME`, `[slug]`, `Lorem ipsum`, `placeholder`
- `coming soon`, `Phase 1`, `Phase 2`, `gated PDFs`, `publish phase`,
  `live phase`, `Top blockers`
- `khoá voice`, `khóa voice`, `voice-locked`, `Loạt pillar mới`,
  `locked reading order`, `internal sequence`, `go live as`
- `debug`, `dummy`, `test user`

Form placeholders are allowed only when they are user-facing examples
(`ban@domain.com`), not implementation notes.

The audit grep list lives in `scripts/content-audit.mjs`; new internal
phrases get added there the day they are coined.

---

## 4. Header & navigation (High)

4.1. **The brand link IS the home link.** Never put "Home / Trang chủ"
in the primary nav — it duplicates the brand link. The brand block
(`<a class="brand">`) carries the logo + wordmark + tagline and points
to `/` (or `/en/`). The primary nav lists content sections only.

4.2. **The CTA appears in exactly one place.** "Đăng ký / Join /
Register" lives inside `.actions`, never inside `.navlinks` as a
fifth/sixth nav item. Duplicating the CTA between nav and button
shipped in the same release.

4.3. **Section-aware navigation.** Public surfaces use the public 4-item
nav (Hành trình · Hệ thống · Bài viết · Thành viên; EN: Journey ·
System · Writings · Members). Member
surfaces (`data-page="members-…"`, post-auth) use member nav
(Bảng điều khiển · Hành trình · Thực hành · Chuyên sâu · Trải nghiệm
· Pro). Admin surfaces use admin nav. A bulk normaliser must skip
sections it does not own.

4.4. **Every page must be navigable on mobile.** Below 920px the
desktop `.navlinks` is hidden by CSS. Every page therefore needs a
hamburger button (inside `.actions`) and a drawer (immediately before
`</header>`). The earlier release shipped 295 of 307 pages without a
hamburger, locking phone users out of nav from any non-homepage page.

4.5. **Drawer mirrors desktop nav, plus a CTA item.** Section-aware
again: members drawer ends with "Về trang chủ"; public drawer ends
with "Đăng ký".

---

## 5. Mobile layout (High)

5.1. **Test every layout at 375px before declaring done.** The release
flow shipped a topbar that overflowed on iPhone because brand + CTA +
hamburger together exceeded the viewport. Mobile is not a polish step;
it is a gate.

5.2. **CTA collapses into the drawer on mobile.** Below 920px, only
the hamburger remains in `.actions`. The CTA is still reachable via
the drawer's `drawerCta` item, so no affordance is lost.

5.3. **Beware `min-width` traps.** `.brand { min-width: 220px }`
forced overflow on phones. Desktop-era min-widths must be wrapped in
`@media (min-width: 920px)`.

5.4. **Source order matters in CSS.** Two unscoped rules at the same
specificity: the later one wins. When adding a `@media (max-width: …)`
override for an existing class, place it AFTER the base rule, not
before — otherwise the desktop rule overrides the override.

---

## 6. Brand & visual identity (High)

6.1. **Single source of truth per locale.**
   - VI wordmark `Nguyễn Lan Anh`, tagline `Đi vào bên trong để tái
     thiết cuộc đời`, footer `Không phải để trở thành ai đó. Mà để
     trở về đúng là mình.`
   - EN wordmark `Lan Anh Nguyen`, tagline `Rebuild your life from
     within`, footer `Not to become someone else. To return to who
     you truly are.`
   No alternate phrasings ship without updating the canonical entry
   first.

6.2. **One logo asset.** `/assets/brand/logo-mark.svg` is the only
brand mark. The brand `<img>` references it; never inline alternative
SVG art that drifts from the canonical asset.

6.3. **Brand `<img>` is decorative.** It carries the wordmark next to
it, so the image itself adds no information. Mark with three signals
so every audit treats it as decorative:
   - `alt=""`
   - `aria-hidden="true"`
   - `role="presentation"`

6.4. **All UI colors trace back to declared brand tokens.** No orphan
hex codes. Slate `#0f172a`, purple `#7c3aed`, emerald `#22c55e`, cyan
`#06b6d4`, amber `#f97316`, gold `#eab308`, pink `#ec4899` are
forbidden — they were the placeholders before the warm palette was
declared. Use only `--c-sand` / `--c-brick` / `--c-rust` / `--c-orange`
/ `--c-marigold` / `--c-saffron` / `--c-cream` / `--c-clay` /
`--c-earth` and the semantic tokens that map to them.

6.5. **Asset palettes derive from brand palette.** Hero SVG gradient
stops, illustration colors, OG art — every stop must be one of the
declared brand colors. Sage greens, sky blues, neutral greys imported
from a stock template fail review.

6.6. **Topic badges use warm-brand shades, not random rainbow.** Six
sections → six warm shades from the brand palette, not six unrelated
hues.

---

## 7. Typography & links (High)

7.1. **Three-tier heading hierarchy by color + size.**
   - `h1` → `--c-earth` (deepest)
   - `h2` → `--c-brick`
   - `h3` → `--c-rust`
   The eye must scan the hierarchy without needing weight contrast.

7.2. **Body links must be visually distinct from body text.** This is
the lesson the product owner pinned: a link that looks identical to
surrounding text is broken, full stop. Inline links inside
`.articleBody`, `.panel`, `.pageHead`, `main p`, `.list` must use:
   - color: `var(--c-orange)` (or designated link color)
   - subtle underline (1px, 42% alpha, 3px offset)
   - font-weight: 500
   - hover: deepen color (e.g. brick) and thicken underline (2px)

   Exclude `.btn`, `.cta`, `.ghost`, `.brand`, `.drawerCta` from this
   rule — they have their own identity.

7.3. **Hierarchy is a visual contract.** Heading levels never skip
(no `<h1>` then `<h3>`). Heading colors never invert (h2 cannot be
lighter than h3).

---

## 8. SEO head (High)

8.1. **Title 35-65 characters.** Pages outside this band block
release. The `| Nguyenlananh.com` suffix counts toward the limit.
For naturally long titles, drop the suffix from `<title>` (keep it
in `og:title` / `twitter:title` if it still fits there).

8.2. **Meta description 70-165 characters.** Same band for og + twitter.

8.3. **Canonical, og:url, hreflang chain absolute.** No protocol-
relative or path-relative canonicals. hreflang covers vi, en-US, en,
and x-default.

8.4. **`<meta robots>` policy.**
   - Public indexable pages: `index,follow`
   - Admin / member dashboards / behind-auth: `noindex,follow` (or
     `noindex,nofollow` if links inside should not be crawled)
   - Even `noindex` pages need a clean title + description for
     internal clarity.

8.5. **No unescaped `>` `<` `"` inside attribute values.** Use Unicode
arrows (`→`) instead of ASCII art (`->`). The release shipped two
descriptions with `->` that broke the audit's meta-extraction regex.
Encode safely or pick a glyph that is already safe.

---

## 9. Accessibility (High)

9.1. **Decorative vs informational images.**
   - Decorative: `alt=""` + `aria-hidden="true"` (or `role=
     "presentation"`). Per WCAG SC 1.1.1, empty alt IS the marker.
   - Informational: `alt="<localized meaningful description>"`.

9.2. **SVG `<title>` and `<desc>` are human-readable.** Slug text
("dau-tu-ban-than") is not a title; it is a filename leaking. Either
write a real human title or strip the `<title>` element.

9.3. **Article hero illustrations either carry meaningful localized
alt OR carry `<figcaption>` that explains the visual.** A hero image
on its own with no alt and no caption fails review.

9.4. **Audit tools must respect WCAG.** When an image is correctly
authored as decorative, the auditor returns "OK", not "missing alt".
A wall of false-positive missing-alt warnings hides the real defects
underneath. Patch the audit, do not work around it.

---

## 10. JS side-effects (High)

10.1. **i18n rewriters must skip the brand link.** A function that
walks `<a href="/">` and replaces the textContent based on a route
table will collapse the brand link into the string "Home / Trang chủ"
and destroy the inline logo + wordmark. Every i18n rewriter needs an
explicit guard:

```js
if (anchor.classList.contains("brand") || anchor.closest(".brand")) return;
```

10.2. **Don't write to `.brand .name span` blindly.** The brand block
contains structured children (logo, wordmark, tagline). i18n must
target named children, not the whole block.

10.3. **Browser cache vs source of truth.** The release pipeline must
serve assets with cache-bust query strings or HTTP `Cache-Control: no-
cache` for HTML. Otherwise reviewers see stale content and disagree
with deploy logs.

---

## 11. Audit gates (Blocker — every push)

These six commands must all pass before a push:

```
node scripts/sync-i18n.mjs
node scripts/validate-bilingual-release.mjs
node scripts/audit-bilingual-site.mjs
node scripts/local-public-site-audit.mjs
node scripts/content-audit.mjs --fail
wrangler pages functions build --outfile /tmp/nla-functions-worker.js
```

If any gate fails, the push does not happen. Audit reports are
committed alongside the change so they are reviewable.

---

## 12. Git & push safety (Blocker)

12.1. **Always `--force-with-lease=<branch>:<expected-sha>`. Never
`--force` bare.** The lease anchors the push at the SHA the dev
believes is on origin. If origin moved, the push fails safely.

12.2. **If `--force-with-lease` rejects, STOP.** Do not pull-rebase
without the product owner seeing what is on origin first. The new
commit may be a real change from another collaborator. The correct
move is to fetch, inspect the unknown SHA, and decide consciously.

12.3. **Never skip hooks (`--no-verify`) or signing
(`--no-gpg-sign`).** If a hook fails, the failure is the message —
fix the issue, not the hook.

12.4. **Branch protection.** Force-push to `main` should be available
only to release operators, not to every dev. CI should refuse a push
that does not pass the audit gates above.

---

## 13. Pre-deploy review checklist

Before `wrangler pages deploy`, the operator clicks through:

- Homepage VI + EN: hero, language switch, primary CTA, footer legal
  links.
- Article index VI + EN: cards, hero images, titles, summaries.
- At least 5 article pages in each locale, including any new launch /
  pillar pages.
- Members landing, start, dashboard, journey, deep, pro, experience.
- Admin entry, dashboard, content, members, payments, creators,
  settings.
- `404.html`, sitemap, robots, legal pages.
- Payment / member pages in both locales.
- All of the above at **375x812** mobile viewport, hamburger clicked,
  drawer scrolled.

The reviewer signs off only after this checklist is green.

---

## 14. Severity reference

- **Blocker** — deploy stops. Empty page, wrong language on EN page,
  missing title/meta/canonical on public pages, broken internal link,
  public internal wording, sitemap pollution, checkout/auth runtime
  failure, mobile-unreachable nav, force push without lease.
- **High** — fix in current release window. Missing or misleading
  alt on meaningful images, duplicate cross-locale SEO copy,
  malformed JSON-LD, h1 count not equal to 1, non-brand color in UI,
  body link visually identical to body text.
- **Medium** — fix within sprint. Title/meta length outside range,
  weak CTA wording, minor copy awkwardness, non-human SVG title.
- **Low** — polish queue. Formatting, spacing, non-critical visual
  refinements.

---

## 15. Ownership

- **Dev** — gates, routing, metadata wiring, accessibility attributes,
  build/deploy scripts, mobile responsive layout, JS side-effect
  guards.
- **Content** — final wording, article titles, summaries, captions,
  language quality, native localization (no machine mirror).
- **Marketing** — SEO intent, title/description differentiation,
  public CTA clarity, brand voice consistency.
- **Design** — palette discipline (every color traces to a brand
  token), asset palette compliance (hero SVGs, OG images), typography
  hierarchy, link visibility.
- **Legal** — disclaimers, policy links, claims boundaries.

---

## 16. Lessons archive

Every defect that ships through this discipline gets added to the
**forbidden vocabulary list** in `scripts/content-audit.mjs` and to
the **rule index** above the same week. The discipline is a living
document — silence here means we have not yet been bitten in that
shape.

---

## 17. Verification hygiene

17.1. **Audit the commit you claim, not the working tree you happen to
have.** Before verifying a report, run:

```
git fetch origin
git status --short
git rev-parse HEAD
git rev-parse origin/main
```

If the report names a specific SHA, check out or reset to that SHA
before grepping files. A stale local tree can create false-positive
review findings and waste a release window.

17.2. **Separate source verification from live verification.** Source
claims are checked against the exact git SHA. Live claims are checked
with `curl` against the custom domain and, when assets are involved,
a cache-busted URL. Do not mix evidence from different layers in one
claim.

17.3. **When a finding is retracted, record why.** The retraction should
name the stale SHA/tree, the corrected SHA, and the command that proved
the corrected state. This keeps future reviewers from repeating the
same audit mistake.
