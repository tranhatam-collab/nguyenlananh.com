# NguyenLanAnh.com Project Context Engine

Date: 2026-04-29
Status: ACTIVE

## Project

`nguyenlananh.com` is a bilingual public website plus member system for writings, free join, member journey, deep/pro programs, creator path, admin, and payment/runtime.

## Current Production Authority

- Cloudflare account id: `62d57eaa548617aeecac766e5a1cb98e`
- Cloudflare Pages project: `nguyenlananh-com`
- D1 production database id: `16dfc26d-ed33-4dc1-a349-6e216860ae05`

## Current Locked Workstreams

1. Public writings: 10 public pillar articles are locked.
2. Step 2-3 paid/member program structure: drafts and plans exist, owner review pending for publication.
3. Runtime commerce/auth/member access: live with D1; PayPal live API remains blocked by missing secrets.
4. Homepage refresh: blocked until Step 2-3 gate passes.

## Active Risk

An unapproved public expansion to Pillar 11/12/13 was committed and deployed in commit `ba16211`.

Correction policy:

- remove Pillar 11/12/13 from public build scope
- keep the material as draft-only
- redirect accidental public routes temporarily to the article index
- preserve parser bugfix that prevents cta block leakage

## Current Team Rule

Team 2 may work on runtime commerce/auth/member access and content/program structure inside `nguyenlananh.com`.

Team 2 must not:

- change other domain ownership
- alter shared trust infrastructure
- change public pricing or payment runtime without approval
- publish unreviewed content expansion
