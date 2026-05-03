# NGUYENLANANH.COM WEBSITE PRODUCT PLAN 2026-05-03

Status: internal source of truth after psychology-behavior update
Audience: dev, content, product, ops, legal, Team Pay, Team 2
Visibility: hidden from public release surface; `docs/` is not deployed as public content

## 1. Old Plan Versus New Direction

### What Stays From The Old Plan

- The website remains a personal transformation and education platform.
- The four-step core stays fixed: Quan sat, Cam nhan, Hanh dong, Chuyen hoa.
- Membership, payment rails, email, admin, members area, check-in, progress, and unlock remain the operating foundation.
- VietQR remains the Vietnam/VND rail.
- PayPal remains the first international/USD rail.
- Stripe is temporarily deferred for the current phase, not removed from code, roadmap, or environment contract.
- Public trust, bilingual SEO, accessibility, and release gates remain mandatory.

### What Changes In The New Direction

- The website is no longer treated as a content-first site with reminders added later.
- It becomes a practice field and readiness filter: people read, choose a track, take one small real action, name avoidance, and keep rhythm with consent-based reminders.
- Avoidance is not treated as failure. Naming avoidance is a valid check-in outcome.
- Reminders must be chosen by the member, must include a pause option, and must never use guilt or pressure.
- Community is not a large feed. The first human layer is a quiet 14-day pilot with 10-20 people and weekly review.

## 2. Locked Positioning

Vietnamese:

> Nguyenlananh.com la mot truong thuc hanh cho nguoi san sang nhin vao goc re, nhan ra diem ne, va lam mot buoc that voi nhip nhe, su that va nguoi that di cung.

English:

> Nguyenlananh.com is a practice field for people ready to face the root, notice avoidance, and take one real step with gentle rhythm, truth, and human companionship.

## 3. Product Guardrails

- Do not promise automatic transformation.
- Do not position the site as a habit hack, mass-market course, or self-help blog.
- Do not use reminders as pressure.
- Do not make the only valid check-in state "I completed everything".
- Do not build public feed, likes, leaderboard, certification, or mentor marketplace before pilot proof.
- Do not block Team Pay or Team 2 payment work with this product update.

## 4. Immediate Dev Scope

This release implements the first safe layer inside the members area:

- Member start profile stores the chosen practice track.
- Member start profile stores reminder intensity and a 7-day pause choice.
- Daily practice check-in accepts four valid states:
  - `done`
  - `smaller_step`
  - `avoiding`
  - `human_reflection`
- Daily practice stores one honest line with the check-in.
- Journey Day 1, Day 2, and Day 7 explain micro-pass criteria.
- A readiness audit script verifies the practice-field contract stays present.

This release does not change homepage positioning, public navigation, payment functions, payment secrets, or provider readiness rules.

## 5. Member Data Contract

Profile fields stored in browser member profile storage:

- `fullName`
- `currentState`
- `desiredShift`
- `companionRhythm`
- `practiceTrack`: `gentle` or `deep`
- `reminderIntensity`: `none`, `gentle`, or `rhythm`
- `reminderPausedUntil`: ISO timestamp or empty string
- `updatedAt`

Daily practice fields stored in browser progress storage:

- `observe`: boolean
- `clean`: boolean
- `write`: boolean
- `act`: boolean
- `practiceState`: `done`, `smaller_step`, `avoiding`, or `human_reflection`
- `oneLine`: string
- `needsHumanReflection`: boolean
- `updatedAt`

These fields are intentionally local/member-runtime first. D1 persistence can be added after payment proof and pilot readiness.

## 6. Payment Boundary

Payment remains critical path:

- VN identity must use VND/VietQR.
- INTL identity must use USD/PayPal for this phase.
- Stripe stays in the international rail as setup-required/deferred, not deleted.
- Practice-field work may only touch member profile, practice UI, docs, and non-payment audit scripts.

Files that this update must not modify:

- `functions/_lib/payments.js`
- `functions/api/payments/*`
- `scripts/provision-payment-live-secrets.sh`
- `scripts/payment-rails-independent-gate.sh`
- `scripts/team2-live-gate.sh`

## 7. Pilot Plan After Payment Proof

Pilot size:

- 10-20 people.
- Two tracks: Gentle Rhythm and Deep Facing.
- 14 days.
- One small practice per day.
- One check-in per day.
- One 30-minute review per week.

Primary metrics:

- Day 7 return rate.
- Day 14 completion rate.
- Percentage of members naming an avoidance point.
- Human reflection requests.
- Voluntary continuation after the pilot.

Decision gate:

- If Day 7 return is below 50%, reduce practice size before adding features.
- If Day 14 completion is below 30%, shorten prompts and improve human touchpoints.
- If avoidance naming is below 40%, rewrite prompts to feel safer and more concrete.

## 8. Definition Of Done For This Dev Pass

- Product plan exists in `docs/` and is hidden from public deploy surface.
- Practice-field readiness audit passes.
- Members start page includes track choice and reminder consent in VI and EN.
- Members practice page includes avoidance-aware check-in in VI and EN.
- Journey Day 1, Day 2, and Day 7 include micro-pass guidance in VI and EN.
- Existing public content gates pass.
- Payment rails endpoint remains live and unchanged in contract.
- Changes are committed, pushed, deployed, and smoke-tested.
