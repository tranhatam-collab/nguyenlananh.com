# User Email Onboarding Guide

This document describes every email a user receives after interacting with the site.

## 1. Payment flow emails

### 1.1 Payment pending (VietQR bank transfer)

**When:** User creates a VietQR order and the system is waiting for the bank transfer.
**Template:** `T96_PAYMENT_PENDING`
**Content:**
- Order ID
- Amount and currency
- Transfer note / content of the bank transfer
- Note that access will be granted after confirmation

### 1.2 Payment confirmed

**When:** Admin confirms the VietQR bank transfer.
**Template:** `T97_PAYMENT_CONFIRMED`
**Content:**
- Order ID
- Amount and currency
- Link to member dashboard

### 1.3 Receipt

**When:** Any successful payment (VietQR, PayPal, Stripe).
**Template:** `T03_PAYMENT_RECEIPT`
**Content:**
- Plan name
- Amount and currency
- Order ID and capture ID
- Dashboard link

### 1.4 Payment failed

**When:** Payment could not be completed.
**Template:** `T04_PAYMENT_FAILED`
**Content:**
- Order ID
- Retry link

### 1.5 Refund notice

**When:** A refund is recorded.
**Template:** `T11_REFUND_NOTICE`
**Content:**
- Order ID
- Refund policy

## 2. Account emails

### 2.1 Welcome / membership active

**When:** First successful purchase or membership activation.
**Template:** `T01_WELCOME_MAGIC_LINK`
**Content:**
- Plan name
- Login link (Google OAuth join URL, expires in 60 minutes)
- Dashboard link

### 2.2 Resend login link

**When:** User requests a new login link.
**Template:** `T02_MAGIC_LINK_RESEND`
**Content:**
- New login link
- Expiration time

## 3. Product welcome emails

Each product has a dedicated welcome email with:
- Link to the product deep track / program
- Link to the base article
- First action step
- Support email

### 3.1 Micro products

- `T70_LIFE_RESET_WELCOME` — Life Reset Mini
- `T71_INNER_LISTENING_WELCOME` — Inner Listening Kit
- `T72_ONE_CORNER_WELCOME` — One Corner Reset
- `T73_7DAY_RHYTHM_WELCOME` — 7-Day True Rhythm
- `T74_COMPANION_WELCOME` — Companion Circle

### 3.2 Core programs

- `T20_LOOP_WELCOME` — Loop Map Kit
- `T30_SPACE_WELCOME` — Space Rebuild
- `T40_CAPITAL_WELCOME` — Inner Capital
- `T50_CREATIVE_WELCOME` — Creative Workshop
- `T60_FAMILY_WELCOME` — Family & Roots

### 3.3 Premium products

- `T80_AVOIDANCE_WELCOME` — Avoidance Map assessment
- `T81_RHYTHM_LAB_WELCOME` — Rhythm Design Lab
- `T82_EMO_BLOCK_WELCOME` — Emotional Block Mapping
- `T83_BOUNDARY_WELCOME` — Boundary Foundation Certification
- `T84_FAMILY_PATTERN_WELCOME` — Family Pattern Mapping
- `T85_SPACE_PRACTITIONER_WELCOME` — Space Reset Practitioner
- `T86_CREATIVE_STUDIO_WELCOME` — Creative Practice Studio
- `T87_CAPITAL_DIAGNOSTIC_WELCOME` — Inner Capital Diagnostic
- `T88_COMPANION_L1_WELCOME` — Certified Practice Companion L1
- `T89_METHOD_DESIGNER_WELCOME` — Practice Method Designer

### 3.4 Pilot programs

- `T90_SELF_TRUST_WELCOME` — Self-Trust Practice Lab
- `T91_OPEN_LOOP_WELCOME` — Open Loop Closure Sprint
- `T92_AFTER_ACTION_WELCOME` — After-Action Review System

## 4. Creator emails

- `T93_CREATOR_ONBOARDING` — Application received
- `T94_CREATOR_APPROVED` — Application approved
- `T95_CREATOR_REJECTED` — Application rejected

## 5. Contact form

- `T15_CONTACT_FORM` — Internal notification sent to support when someone submits the contact form.

## 6. Email provider

Currently configured to use `api.mail.iai.one`. If that service is down, switch to Resend temporarily following `docs/RESEND_SETUP_GUIDE.md`.
