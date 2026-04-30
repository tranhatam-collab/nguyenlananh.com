#!/usr/bin/env node
/**
 * fix-legal-join-pages.mjs
 *
 * Fixes two classes of pages:
 *
 * A) Legal pages (điều-khoản, miễn-trừ-trách-nhiệm, chính-sách-bảo-mật × 2 locales)
 *    - Had no <header class="topbar"> at all — users trapped with no nav
 *    - Had minimal footer (just a home link)
 *    - Had ~20 blank lines in <head>
 *    → Injects full topbar (brand + navlinks + actions + hamburger + drawer)
 *    → Replaces footer with canonical version
 *    → Cleans blank lines in <head>
 *
 * B) Join flow pages (cancel, success, retry × 2 locales)
 *    - Had topbar but no <nav class="navlinks"> for desktop
 *    - Had no <footer>
 *    - cancel + success had duplicate meta descriptions
 *    → Injects navlinks into existing navwrap
 *    → Adds canonical footer
 *    → Deduplicates meta descriptions
 *
 * Idempotent — safe to re-run.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

const LOGO_IMG = `<img class="markIcon" src="/assets/brand/logo-mark.svg" alt="" width="40" height="40" loading="eager" decoding="async" aria-hidden="true" role="presentation"/>`;

// ── Canonical topbar blocks ──────────────────────────────────────────────

const TOPBAR_VI = `
  <a class="skip" href="#main">Bỏ qua điều hướng</a>
  <header class="topbar" role="banner">
    <div class="container">
      <div class="navwrap">
        <a class="brand" href="/" aria-label="Nguyễn Lan Anh — về trang chủ"><span class="mark" aria-hidden="true">${LOGO_IMG}</span><span class="name"><strong>Nguyễn Lan Anh</strong><span class="tagline">Đi vào bên trong để tái thiết cuộc đời</span></span></a>
        <nav class="navlinks" aria-label="Điều hướng chính"><a href="/hanh-trinh/">Hành trình</a><a href="/phuong-phap/">Hệ thống</a><a href="/bai-viet/">Bài viết</a><a href="/members/">Thành viên</a></nav>
        <div class="actions">
          <a class="btn" href="/join/">Đăng ký</a>
          <button class="hamburger" type="button" id="hamburger" aria-label="Mở menu" aria-controls="drawer" aria-expanded="false"><span aria-hidden="true"></span></button>
        </div>
      </div>
    </div>
    <div class="drawer" id="drawer" role="dialog" aria-modal="false" aria-label="Điều hướng">
      <div class="dhead"><div><div style="font-weight:700; font-size:13px;">Điều hướng</div><div class="hint">Chọn một mục để đi tới.</div></div><button class="btn" type="button" id="closeDrawer" aria-label="Đóng menu">Đóng</button></div>
      <nav aria-label="Điều hướng di động"><a href="/hanh-trinh/" data-close>Hành trình</a><a href="/phuong-phap/" data-close>Hệ thống</a><a href="/bai-viet/" data-close>Bài viết</a><a href="/members/" data-close>Thành viên</a><a href="/join/" data-close class="drawerCta">Đăng ký</a></nav>
      <div class="foot">Đi chậm để đi sâu. Đi thật để đi xa.</div>
    </div>
  </header>`;

const TOPBAR_EN = `
  <a class="skip" href="#main">Skip navigation</a>
  <header class="topbar" role="banner">
    <div class="container">
      <div class="navwrap">
        <a class="brand" href="/en/" aria-label="Lan Anh Nguyen — back to home"><span class="mark" aria-hidden="true">${LOGO_IMG}</span><span class="name"><strong>Lan Anh Nguyen</strong><span class="tagline">Rebuild your life from within</span></span></a>
        <nav class="navlinks" aria-label="Primary navigation"><a href="/en/hanh-trinh/">Journey</a><a href="/en/phuong-phap/">System</a><a href="/en/bai-viet/">Writings</a><a href="/en/members/">Members</a></nav>
        <div class="actions">
          <a class="btn" href="/en/join/">Join</a>
          <button class="hamburger" type="button" id="hamburger" aria-label="Open menu" aria-controls="drawer" aria-expanded="false"><span aria-hidden="true"></span></button>
        </div>
      </div>
    </div>
    <div class="drawer" id="drawer" role="dialog" aria-modal="false" aria-label="Navigation menu">
      <div class="dhead"><div><div style="font-weight:700; font-size:13px;">Menu</div><div class="hint">Choose a section to continue.</div></div><button class="btn" type="button" id="closeDrawer" aria-label="Close menu">Close</button></div>
      <nav aria-label="Mobile navigation"><a href="/en/hanh-trinh/" data-close>Journey</a><a href="/en/phuong-phap/" data-close>System</a><a href="/en/bai-viet/" data-close>Writings</a><a href="/en/members/" data-close>Members</a><a href="/en/join/" data-close class="drawerCta">Join</a></nav>
      <div class="foot">Move slowly to go deep. Move truthfully to go far.</div>
    </div>
  </header>`;

// ── Canonical footer blocks ──────────────────────────────────────────────

const FOOTER_VI = `
  <footer role="contentinfo">
    <div class="container">
      <div class="fwrap">
        <div>
          <div style="font-weight:700; color:rgba(42,24,16,.8);">Nguyễn Lan Anh</div>
          <div>© <span id="year"></span> · Không phải để trở thành ai đó. Mà để trở về đúng là mình.</div>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <a href="/gioi-thieu/">Giới thiệu</a>
          <a href="/hanh-trinh/">Hành trình</a>
          <a href="/phuong-phap/">Hệ thống</a>
          <a href="/chuong-trinh/">Chương trình</a>
          <a href="/bai-viet/">Bài viết</a>
          <a href="/lien-he/">Liên hệ</a>
        </div>
      </div>
      <div class="legal" style="margin-top:10px; color:rgba(42,24,16,.6);">
        <a href="/chinh-sach-bao-mat/">Chính sách bảo mật</a>
        <a href="/dieu-khoan/">Điều khoản sử dụng</a>
        <a href="/mien-tru-trach-nhiem/">Miễn trừ trách nhiệm</a>
      </div>
    </div>
  </footer>`;

const FOOTER_EN = `
  <footer role="contentinfo">
    <div class="container">
      <div class="fwrap">
        <div>
          <div style="font-weight:700; color:rgba(42,24,16,.8);">Nguyen Lan Anh</div>
          <div>© <span id="year"></span> · Not to become someone else. To return to who you truly are.</div>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <a href="/en/gioi-thieu/">About</a>
          <a href="/en/hanh-trinh/">Journey</a>
          <a href="/en/phuong-phap/">System</a>
          <a href="/en/chuong-trinh/">Programs</a>
          <a href="/en/bai-viet/">Articles</a>
          <a href="/en/lien-he/">Contact</a>
        </div>
      </div>
      <div class="legal" style="margin-top:10px; color:rgba(42,24,16,.6);">
        <a href="/en/chinh-sach-bao-mat/">Privacy Policy</a>
        <a href="/en/dieu-khoan/">Terms of Use</a>
        <a href="/en/mien-tru-trach-nhiem/">Disclaimer</a>
      </div>
    </div>
  </footer>`;

// ── Nav block (for join pages that have topbar but missing navlinks) ─────

const NAVLINKS_VI = `<nav class="navlinks" aria-label="Điều hướng chính"><a href="/hanh-trinh/">Hành trình</a><a href="/phuong-phap/">Hệ thống</a><a href="/bai-viet/">Bài viết</a><a href="/members/">Thành viên</a></nav>`;

const NAVLINKS_EN = `<nav class="navlinks" aria-label="Primary navigation"><a href="/en/hanh-trinh/">Journey</a><a href="/en/phuong-phap/">System</a><a href="/en/bai-viet/">Writings</a><a href="/en/members/">Members</a></nav>`;

// ── Targets ──────────────────────────────────────────────────────────────

const LEGAL_PAGES = [
  "dieu-khoan/index.html",
  "mien-tru-trach-nhiem/index.html",
  "chinh-sach-bao-mat/index.html",
  "en/dieu-khoan/index.html",
  "en/mien-tru-trach-nhiem/index.html",
  "en/chinh-sach-bao-mat/index.html",
];

const JOIN_PAGES = [
  "join/cancel/index.html",
  "join/success/index.html",
  "join/retry/index.html",
  "en/join/cancel/index.html",
  "en/join/success/index.html",
  "en/join/retry/index.html",
];

const stats = { legalFixed: 0, joinNavFixed: 0, joinFooterFixed: 0, dupDescFixed: 0, blankLinesFixed: 0 };

// ── Fix legal pages ──────────────────────────────────────────────────────

for (const rel of LEGAL_PAGES) {
  const file = join(ROOT, rel);
  let html = readFileSync(file, "utf8");
  const isEN = rel.startsWith("en/");
  let changed = false;

  // 1. Clean blank lines in <head>
  const headMatch = html.match(/<head>([\s\S]*?)<\/head>/i);
  if (headMatch) {
    const cleanHead = headMatch[1].replace(/\n{3,}/g, "\n");
    if (cleanHead !== headMatch[1]) {
      html = html.replace(headMatch[1], cleanHead);
      stats.blankLinesFixed += 1;
      changed = true;
    }
  }

  // 2. Inject topbar if missing
  if (!/<header\s+class="topbar"/.test(html)) {
    const topbar = isEN ? TOPBAR_EN : TOPBAR_VI;
    html = html.replace(/<body[^>]*>/, (m) => `${m}${topbar}`);
    stats.legalFixed += 1;
    changed = true;
  }

  // 3. Replace minimal footer with canonical
  const minFooterRx = /<footer[^>]*>[\s\S]*?<\/footer>/i;
  if (minFooterRx.test(html)) {
    const existingFooter = html.match(minFooterRx)[0];
    // Only replace if it's the minimal version (no class="fwrap")
    if (!/class="fwrap"/.test(existingFooter)) {
      html = html.replace(minFooterRx, isEN ? FOOTER_EN.trim() : FOOTER_VI.trim());
      changed = true;
    }
  }

  if (changed) writeFileSync(file, html, "utf8");
}

// ── Fix join flow pages ──────────────────────────────────────────────────

for (const rel of JOIN_PAGES) {
  const file = join(ROOT, rel);
  let html = readFileSync(file, "utf8");
  const isEN = rel.startsWith("en/");
  let changed = false;

  // 1. Add navlinks if missing (inject between brand </a> and <div class="actions">)
  if (!/class="navlinks"/.test(html) && /class="brand"/.test(html)) {
    const navlinks = isEN ? NAVLINKS_EN : NAVLINKS_VI;
    // Insert navlinks before <div class="actions">
    html = html.replace(
      /(<\/a>\s*)(<div class="actions">)/i,
      `$1\n        ${navlinks}\n        $2`
    );
    stats.joinNavFixed += 1;
    changed = true;
  }

  // 2. Add skip-nav if missing
  if (!/class="skip"/.test(html)) {
    const skipLabel = isEN ? "Skip navigation" : "Bỏ qua điều hướng";
    html = html.replace(
      /(<body[^>]*>)/,
      `$1\n  <a class="skip" href="#main">${skipLabel}</a>`
    );
    changed = true;
  }

  // 3. Add canonical footer if missing
  if (!/<footer/.test(html)) {
    const footer = isEN ? FOOTER_EN : FOOTER_VI;
    // Insert before scripts at end
    html = html.replace(
      /(\s*<script\s+src="\/assets\/content-registry\.js")/,
      `\n${footer.trim()}\n$1`
    );
    stats.joinFooterFixed += 1;
    changed = true;
  }

  // 4. Fix duplicate meta descriptions
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  if (descMatch) {
    const desc = descMatch[1];
    // Check if description is duplicated (same sentence repeated)
    const half = desc.length / 2;
    const firstHalf = desc.substring(0, Math.floor(half)).trim();
    const secondHalf = desc.substring(Math.floor(half)).trim();
    if (firstHalf.length > 20 && (firstHalf === secondHalf || desc.includes(firstHalf + " " + firstHalf) || desc.includes(firstHalf + ". " + firstHalf))) {
      const dedupedDesc = firstHalf.replace(/\.\s*$/, "") + ".";
      html = html.replaceAll(desc, dedupedDesc);
      stats.dupDescFixed += 1;
      changed = true;
    }
  }

  if (changed) writeFileSync(file, html, "utf8");
}

console.log(JSON.stringify(stats, null, 2));
console.log("Legal + join page fixes complete.");
