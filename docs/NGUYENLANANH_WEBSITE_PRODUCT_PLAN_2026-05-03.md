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
- A hidden member reflection-handoff route gives `avoiding` and `human_reflection` a concrete next step without turning it into a public community feature.
- Journey Day 1, Day 2, and Day 7 explain micro-pass criteria.
- Hidden noindex member pilot route prepares the 14-day quiet group without public navigation.
- Hidden noindex member circle route prepares the 8-20 person quiet practice group without public navigation.
- Hidden noindex member reflection pages prepare the human handoff layer without exposing a public support promise.
- Hidden member reflection pages now let a member save a browser-local 3-line handoff packet that can be read back by admin reflection ops in the same browser session.
- The member reflection handoff packet is now portable across machines: admin reflection can import a pasted member packet directly, without waiting for shared browser-local state.
- Hidden member dashboard pages now expose a browser-local ops snapshot so the member can see profile readiness, honest check-in status, saved handoff status, and reminder-pause state in one place.
- The member dashboard snapshot is now portable across machines: admin home can import a pasted member snapshot packet directly for quick ops review before opening reflection or pilot modules.
- Admin home now keeps a browser-local intake queue of imported member snapshot packets so operations can review multiple handoffs without losing them on the next paste.
- Each saved member snapshot in admin home can now hand off directly into reflection ops or pilot ops, with the destination module preloaded from the queue packet.
- The intake queue now records a recommended route and last handoff state for each imported member snapshot, so operations can send each packet into reflection ops or pilot ops with less guesswork.
- Admin home can now export or merge the full intake queue as one portable packet, so multiple imported member snapshots can move between ops machines without one-by-one copy work.
- Admin reflection and admin pilot can now import that full intake queue packet directly, so operations can open a module on another machine and load the relevant subset without revisiting admin home first.
- Admin home can now open a module on the same machine with the full intake queue preloaded, so batch triage does not require a manual paste step.
- When reflection ops or pilot ops load an intake queue packet, the module now shows how many relevant entries were filtered out of the total queue, so the operator can see the import scope immediately.
- Admin home now shows queue route counts for reflection, pilot, and already-routed items, so the operator can see queue shape before opening any module.
- Admin home now sorts the intake queue by real ops priority and labels each item, so reflection-now cases surface first, pilot-ready cases stay visible, and already-routed items fall to the end.
- Admin home now filters the intake queue by route and handoff state, so operations can isolate reflection-only, pilot-only, or not-yet-routed work without scanning the full list.
- Admin home batch handoff now respects the current filters, so reflection ops or pilot ops can open with only the visible subset instead of always carrying the full queue.
- Reflection ops and pilot ops now show the imported filter scope from a batch handoff packet, so operators can tell whether they are reviewing all routes or just a filtered subset after opening the destination module.
- Admin home batch handoff buttons now show the exact filtered item count and disable themselves when the current filter is empty, so operations can see the handoff size before clicking and avoid sending an empty subset.
- Admin home now shows a short batch handoff preview line under the buttons, so the operator can verify both filter scope and visible item count before sending the subset into reflection ops or pilot ops.
- Member practice pages now show whether a saved reflection handoff already exists for the current point, so the daily check-in loop can continue without guessing whether the handoff step is still pending.
- Hidden noindex admin reflection route gives operations a quiet triage module before any D1 or API-backed queue is introduced.
- Hidden noindex admin pilot route gives operations a readiness layer for Day 1, Day 3, Day 7, and reminder consent before any live pilot opens.
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
- Hidden pilot pages exist at `/members/pilot/` and `/en/members/pilot/`, are noindex, and are not added to public navigation.
- Hidden member pilot pages show a browser-local readiness snapshot so each member can see whether profile, honest check-in, reminder pause, and reflection state are ready before pilot review opens.
- The member pilot readiness packet is now portable across machines: admin pilot can import a pasted member readiness packet directly, without waiting for shared browser-local state.
- Hidden circle pages exist at `/members/circle/` and `/en/members/circle/`, are noindex, and are not added to public navigation.
- Hidden reflection pages exist at `/members/reflection/` and `/en/members/reflection/`, are noindex, and are not added to public navigation.
- Hidden admin reflection pages exist at `/admin/reflection/` and `/en/admin/reflection/`, are noindex, and stay outside public navigation.
- Hidden admin reflection pages include a browser-local evidence packet with copy, export, import, and reset actions for quiet internal handoff before persistence exists.
- Hidden admin pilot pages exist at `/admin/pilot/` and `/en/admin/pilot/`, are noindex, and stay outside public navigation.
- Admin dashboard, reflection ops, and pilot ops now share the same browser-local counts for saved handoffs, matched handoffs, and ready profiles with honest check-ins so operations does not switch language between modules.
- Existing public content gates pass.
- Payment rails endpoint remains live and unchanged in contract.
- Changes are committed, pushed, deployed, and smoke-tested.
