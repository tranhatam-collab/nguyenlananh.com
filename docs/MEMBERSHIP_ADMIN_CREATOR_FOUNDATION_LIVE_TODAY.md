# MEMBERSHIP_ADMIN_CREATOR_FOUNDATION_LIVE_TODAY.md

Version: 1.0
Date: 2026-04-10
Status: LIVE FOUNDATION LOCKED
Owner lane: Team 2

---

## 1. Scope locked for live today

This document is the handoff baseline for admin + creator operations after member signup.

Locked today:

- member journey flow definition and ownership
- creator intake and review workflow
- internal revenue operations policy boundary
- admin information architecture and module ownership

Not included today:

- full admin backend implementation
- payout automation engine
- public creator recruitment and monetization copy

---

## 2. Admin IA (information architecture)

Target admin routes (skeleton-ready):

- `/admin/`
- `/admin/dashboard/`
- `/admin/content/`
- `/admin/members/`
- `/admin/creators/`
- `/admin/settings/`

Module intent:

- `dashboard`: operational status, review queues, risk alerts
- `content`: deep/journey/practice assets, publish state, owner
- `members`: member lifecycle, activation, retention checkpoints
- `creators`: submission queue, review history, creator status
- `settings`: policy, permissions, system config and audit options

---

## 3. Admin module minimum requirements

### 3.1 Dashboard

- queue counters (pending review, revision due, publish due)
- key funnel checkpoints (join -> activated -> day-1 complete)
- incident panel (broken routes, content conflicts, stale assets)

### 3.2 Content

- content entity: title, route, version, owner, status
- status states: `draft`, `in_review`, `approved`, `published`, `archived`
- mandatory change log per publish action

### 3.3 Members

- activation flags: joined, magic-link login, day-1 started, day-7 touched
- progress visibility for support intervention
- no manual overwrite without audit reason

### 3.4 Creators

- submission queue with timestamps and reviewer assignment
- decision states: `approved`, `revision_requested`, `rejected`
- evidence bundle per decision (reason + notes + owner)

### 3.5 Settings

- policy text sources
- role permissions map
- operational safeguards and internal-only visibility flags

---

## 4. Role matrix

| Role | Members | Content | Creators | Revenue Ops | Settings |
|---|---|---|---|---|---|
| Super Admin | full | full | full | full | full |
| Content Admin | read | full | review | read | none |
| Membership Ops | full | read | read | read | none |
| Creator Reviewer | read | review | full review actions | none | none |
| Finance Ops | read | read | read | payout/reconcile actions | none |

Rules:

- all non-read actions must write audit logs
- payout-sensitive actions require Finance Ops or Super Admin
- creator decisions require named reviewer ownership

---

## 5. Content workflow (internal)

1. draft created with owner and route
2. review requested (content + compliance check)
3. approved with version tag
4. published to target member route
5. post-publish validation (CTA, language, routing)
6. periodic re-review for stale content

---

## 6. Creator submission workflow (internal)

1. eligible member enters creator layer
2. member reads guidelines
3. member submits asset package
4. admin triages and assigns reviewer
5. reviewer decides: approved / revision / rejected
6. approved content enters library or program slot
7. revenue operation records contribution and payout cycle notes

Safeguards:

- no public commission disclosure
- no public payout-term disclosure
- no public creator monetization hooks

---

## 7. Operational policy for PayPal-first phase

- checkout remains PayPal-first for current phase
- membership access is operationally tied to successful payment confirmation flow
- post-payment messaging must preserve clear next-step behavior (magic link -> dashboard/start)

---

## 8. Ownership and handoff checkpoints

Before next build phase, admin implementation team must confirm:

- final data model for member progress + creator submissions
- audit log schema and retention policy
- notification events for review outcomes
- role-based access control rules in backend

This file is the baseline spec to begin real admin build immediately after today live pass.
