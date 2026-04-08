# NGUYENLANANH Membership System

Version: 1.0
Status: Day-1 build complete (MVP)

## 1. Positioning Lock

- Not a paywall
- Not a course store
- Not a paid blog
- This is a paid transformation journey system

Model:

- Content -> Awareness
- Membership -> Access
- Journey -> Transformation
- Community -> Retention
- Upgrade -> Revenue

## 2. Implemented Routes

Public:

- `/join/`

Locked layer:

- `/members/`
- `/members/dashboard/`
- `/members/journey/`
- `/members/practice/`
- `/members/deep/`
- `/members/experience/`

Premium layer (Phase 2 structure):

- `/members/pro/`
- `/members/pro/reset/`
- `/members/pro/inner/`
- `/members/pro/discipline/`
- `/members/pro/environment/`
- `/members/pro/creation/`
- `/members/pro/wealth/`

## 3. Day-1 Features (Implemented)

- Join page with 3 pricing levels (3, 60, 99 USD)
- PayPal link generator (simple mode)
- Magic link system (client-side MVP)
  - one-time token
  - 15-minute expiration
- Session-based lock for `/members/*`
- Members dashboard and progress tracking
- Journey stage completion (3 phases)
- Daily practice checklist persistence
- Experience journal (local persistence)

## 4. Tech Notes

Current MVP uses local storage for speed-to-launch. This is good for rapid validation, not final security.

Storage keys:

- `nla_member_session`
- `nla_member_progress`
- `nla_member_magic_pending`

Core script:

- `/assets/members.js`

## 5. Required Upgrade for Production-grade Backend

- Move magic token issuance/validation to server
- Add real user table + payment webhook processing
- Replace manual "I paid" button with payment verification
- Add signed session cookie / JWT with server validation
- Add email sender (welcome, day 1, day 3)

## 6. Conversion Copy Lock (Applied)

- "Mở khóa toàn bộ hành trình"
- "Bắt đầu từ 3 USD"
- "Không đọc thêm. Bắt đầu."

## 7. SEO / Indexing Policy

- `/join/` indexable
- `/members/*` set to `noindex,follow`
- locked routes not included in sitemap

## 8. Next Build Blocks

1. Server webhook + database write on successful PayPal payment
2. True magic-email delivery (no manual copy)
3. Retention emails (welcome / day 1 / day 3 / weekly)
4. Upgrade triggers tied to behavior events
