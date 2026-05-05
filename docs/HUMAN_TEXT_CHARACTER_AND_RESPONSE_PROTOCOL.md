# Human text character and response protocol

Verdict:
APPROVED AS WEB TEXT, SEO, QA, AND REPORTING GATE
NOT A BACKEND OR PAYMENT CHANGE PROTOCOL

True state:
PROTOCOL_APPLIES_TO_WEB_COPY_SEO_QA_REPORTING
PROTOCOL_DOES_NOT_AUTHORIZE_BACKEND_PAYMENT_AUTH_DB_OR_LEGAL_CHANGES

This protocol is mandatory for `nguyenlananh.com` web text, SEO metadata,
public page QA, release evidence, report files, and team handoff commands.
It exists to make the text layer part of product infrastructure, not a
decorative afterthought.

It applies to:

- Public copy.
- UI copy and button text.
- Form labels, helper text, empty states, and error text.
- SEO title, description, Open Graph, Twitter metadata, and alt text.
- Public HTML text.
- Content source and CMS exports.
- QA reports, release notes, evidence packets, and team commands.

It does not apply as permission to change:

- Backend logic.
- Payment logic.
- Invoice routing.
- Legal entity mapping.
- Authentication.
- Database schema.
- User data.
- Production deployment strategy.

If a text issue requires code change, create a separate technical work order.

---

## 1. Human text standard

Every visible page must read like a real person wrote it for a real person.

Pass:

- The page role is clear within the H1.
- The text states only what is true.
- The user knows what to do next.
- The copy is specific, calm, and grounded.
- Vietnamese uses full diacritics.
- English reads naturally, not as literal Vietnamese translated word by word.

Fail:

- Text looks like AI filler.
- Text promises more than the product can prove.
- Text uses fake urgency, hype, or over-marketing.
- Text says "done", "ready", or "live" without evidence.
- Text exists only to fill a layout.

---

## 2. H standard

Every page must have a valid heading contract.

Required:

- One H1 only.
- H1 states the page role.
- H2 groups major sections.
- H3 only supports an H2 section or a repeated component group.
- No empty heading.
- No heading used only for visual size.

Gate meaning:

- Missing H1 is a blocker.
- Multiple H1 is a blocker.
- Empty heading is a blocker.
- H3 component headings without a preceding H2 are a migration warning unless
  the component pattern is already established and the page passes all other
  release gates.

---

## 3. Plain character rule

Final web text must avoid decorative or report-style symbols that make the page
look automated, inflated, or unserious.

Blocked in final public copy and reports:

- Status emojis such as check marks, cross marks, warning icons, party icons,
  alarm icons, and information icons.
- Decorative stars, diamonds, blocks, ornaments, and attention arrows.
- ASCII art separators used as decoration.
- Symbol-heavy status language instead of plain words.

Approved exceptions:

- Vietnamese diacritics.
- Standard punctuation required by the language.
- Approved language switch labels: `🇻🇳 Tiếng Việt` and `🇺🇸 English`.
- Technical tokens listed in section 12.

Migration note:

Existing editorial punctuation is audited. New copy should prefer simple ASCII
hyphenation where possible, but the gate must not blindly rewrite article
titles, quotes, technical standards, or source references without editorial
review.

---

## 4. Hyphen and dash rule

For new text, prefer plain ASCII hyphen when separating phrases.

Use:

- `A - B`
- `read - practice - check in`

Avoid in new final copy:

- em dash
- en dash
- decorative arrows
- ornamental separators

Do not rewrite technical tokens blindly.

---

## 5. SEO text gate

Every indexable page must have:

- Human-readable title.
- Human-readable description.
- Canonical URL.
- Open Graph title.
- Open Graph description.
- Open Graph image.
- Twitter title and description when available.
- H1 that matches the page role.
- Language that matches the route.

No SEO field may exist only as a placeholder.

---

## 6. Character hygiene gate

Before a page is called web-ready, SEO-ready, publication-ready, or
release-ready, the team must run character hygiene.

Gate result must include:

- Character hygiene result.
- H standard result.
- SEO metadata result.
- Rendered page or local HTML evidence.
- Language check.
- True state.
- Release evidence if release-ready is claimed.

---

## 7. Response protocol

Team reports must not sound finished unless the evidence proves it.

Required report shape:

- Verdict:
- Evidence checked:
- Pass:
- Fail:
- Blocked by Founder:
- Blocked by external asset:
- True state:
- Team command:
- Hard stop:

Do not use:

- "looks good"
- "gần xong"
- "ổn rồi"
- "ready tạm"
- "đã ok"

Use explicit states instead:

- WEB_COPY_DRAFT
- WEB_COPY_PASS
- CHARACTER_HYGIENE_FAIL
- H_STANDARD_FAIL
- SEO_METADATA_INCOMPLETE
- SEO_READY_PENDING_QA
- A11Y_READY_PENDING_QA
- RELEASE_READY_PENDING_EVIDENCE
- WEB_READY

---

## 8. Team command rule

Team commands must say exactly what is allowed and what is forbidden.

Minimum shape:

- Action.
- Allowed files.
- Forbidden actions.
- Required evidence.
- Stop condition.
- Next report required.

Commands that touch public text must not silently authorize backend, payment,
auth, legal, database, or deployment changes.

---

## 9. Web implementation boundary

This protocol applies to visible text, SEO metadata, public HTML text, content
source, CMS exports, QA reports, release notes, and team commands.

It does not authorize changes to backend logic, payment logic, invoice routing,
legal entity mapping, authentication, database schema, user data, or production
deployment.

If a text issue requires code change, create a separate technical work order.

---

## 10. Technical token exception

Technical identifiers may keep required characters when they are part of:

- A standard.
- A route.
- An API field.
- A schema property.
- A protocol.
- A file name.
- A package name.
- A CSS variable.
- A JSON key.
- A legal source reference.
- Third-party output.

Examples:

- `JSON-LD`
- `EIP-712`
- `ERC-721`
- `SHA-256`
- `og:image`
- `hreflang`
- `x-default`
- `font-display`
- `tokenURI`
- `application/ld+json`

Do not rewrite technical tokens for character hygiene.
Do review public explanation around those tokens.

---

## 11. Release gate for this repo

`nguyenlananh.com` uses:

- `node scripts/human-text-gate.mjs --fail`
- `node scripts/content-audit.mjs --fail`
- `node scripts/validate-bilingual-release.mjs`
- `node scripts/local-public-site-audit.mjs`
- `wrangler pages functions build`

A release is not web-ready unless these gates pass or the remaining items are
explicitly downgraded with owner, reason, and next action.

Hard stop:

Do not call a page ready if it has forbidden decorative characters in final
text, broken H1, missing title, missing description, missing canonical, missing
Open Graph image, missing important alt text, wrong language, or unclear true
state.

