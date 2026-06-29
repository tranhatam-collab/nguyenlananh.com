(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const localeCode = document.documentElement.lang === "en-US" ? "en" : "vi";
  const isEnglish = localeCode === "en";
  const registryRoot = window.NLA_CONTENT_REGISTRY || {};
  const localeRegistry = registryRoot[localeCode] || {};
  const brandCopy = localeRegistry.brand || {};
  const chromeCopy = localeRegistry.chrome || {};
  const ctaCopy = localeRegistry.cta || {};
  const navCopy = chromeCopy.nav || {};
  const footerLegalCopy = chromeCopy.footerLegal || {};

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  function normalizePath(value) {
    let next = String(value || "/").trim() || "/";
    if (!next.startsWith("/")) next = `/${next}`;
    if (next !== "/" && !next.endsWith("/") && !/\.[a-z0-9]+$/i.test(next)) next = `${next}/`;
    return next;
  }

  function stripLocalePrefix(pathname) {
    const normalized = normalizePath(pathname);
    if (normalized === "/en/" || normalized.startsWith("/en/")) {
      return normalizePath(normalized.slice(3));
    }
    return normalized;
  }

  function routeFromHref(href) {
    if (!href || !href.startsWith("/")) return null;
    if (
      href.startsWith("/assets/") ||
      href.startsWith("/cdn-cgi/") ||
      href.startsWith("/api/") ||
      href.startsWith("/_")
    ) {
      return null;
    }
    return stripLocalePrefix(href.split(/[?#]/, 1)[0]);
  }

  function isLocalePlaceholder(text) {
    return ["VI", "EN", "EN-US", "ENGLISH"].includes(String(text || "").trim().toUpperCase());
  }

  function localizeSharedLinks(root = document) {
    $$("a[href]", root).forEach((anchor) => {
      // Brand anchors carry their own logo + wordmark + tagline structure;
      // never overwrite their textContent or inner SVG.
      if (anchor.classList.contains("brand") || anchor.closest(".brand")) return;

      const originalText = String(anchor.textContent || "").trim();
      if (isLocalePlaceholder(originalText)) {
        anchor.remove();
        return;
      }

      const route = routeFromHref(anchor.getAttribute("href"));
      if (!route) return;

      const label = navCopy[route] || footerLegalCopy[route];
      if (label) {
        anchor.textContent = label;
      }
    });
  }

  function localizeSharedChrome() {
    const skip = $(".skip");
    if (skip && chromeCopy.skipToContent) {
      skip.textContent = chromeCopy.skipToContent;
    }

    const brandName = $(".brand .name strong");
    if (brandName && brandCopy.name) brandName.textContent = brandCopy.name;

    const brandTagline = $(".brand .name span");
    if (brandTagline && brandCopy.tagline) brandTagline.textContent = brandCopy.tagline;

    const nav = $(".navlinks");
    if (nav && chromeCopy.primaryNavAria) {
      nav.setAttribute("aria-label", chromeCopy.primaryNavAria);
    }

    const drawer = $("#drawer");
    if (drawer && chromeCopy.menuTitle) {
      const title = $(".dhead > div > div:first-child", drawer);
      const hint = $(".dhead .hint", drawer);
      const foot = $(".foot", drawer);
      const mobileNav = $("nav", drawer);
      if (title) title.textContent = chromeCopy.menuTitle;
      if (hint && chromeCopy.menuHint) hint.textContent = chromeCopy.menuHint;
      if (foot && chromeCopy.menuFoot) foot.textContent = chromeCopy.menuFoot;
      if (mobileNav && chromeCopy.mobileNavAria) {
        mobileNav.setAttribute("aria-label", chromeCopy.mobileNavAria);
      }
      if (chromeCopy.menuTitle) {
        drawer.setAttribute("aria-label", chromeCopy.menuTitle);
      }
    }

    const closeButton = $("#closeDrawer");
    if (closeButton && chromeCopy.menuClose) {
      closeButton.textContent = chromeCopy.menuClose;
      closeButton.setAttribute("aria-label", chromeCopy.menuClose);
    }

    const langWrap = $(".lang");
    if (langWrap && chromeCopy.languageSwitchAria) {
      langWrap.setAttribute("aria-label", chromeCopy.languageSwitchAria);
    }

    localizeSharedLinks(document);
  }

  const drawer = $("#drawer");
  const hamburger = $("#hamburger");
  const closeDrawer = $("#closeDrawer");

  if (drawer && hamburger) {
    let lastFocused = null;

    // Clone language selector into drawer for mobile access (hidden inline on <=480px)
    const langWrap = $(".lang");
    if (langWrap && !$(".drawerLang", drawer)) {
      const langClone = langWrap.cloneNode(true);
      langClone.classList.add("drawerLang");
      langClone.style.cssText = "padding:10px 14px; border-bottom:1px solid var(--line);";
      const dhead = $(".dhead", drawer);
      if (dhead && dhead.nextSibling) {
        drawer.insertBefore(langClone, dhead.nextSibling);
      } else {
        drawer.appendChild(langClone);
      }
    }

    function getFocusable() {
      return $$('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])', drawer)
        .filter((el) => el.offsetParent !== null || el === closeDrawer);
    }

    function openDrawer() {
      lastFocused = document.activeElement;
      drawer.classList.add("open");
      hamburger.setAttribute("aria-expanded", "true");
      hamburger.setAttribute("aria-label", chromeCopy.menuClose || "Close menu");
      document.body.style.overflow = "hidden";
      const focusable = getFocusable();
      if (focusable.length) focusable[0].focus();
    }

    function shutDrawer() {
      drawer.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.setAttribute("aria-label", chromeCopy.menuOpen || "Open menu");
      document.body.style.overflow = "";
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    hamburger.addEventListener("click", () => {
      if (drawer.classList.contains("open")) shutDrawer();
      else openDrawer();
    });

    closeDrawer?.addEventListener("click", shutDrawer);
    $$("[data-close]", drawer).forEach((a) => a.addEventListener("click", shutDrawer));

    document.addEventListener("keydown", (e) => {
      if (!drawer.classList.contains("open")) return;
      if (e.key === "Escape") { shutDrawer(); return; }
      if (e.key === "Tab") {
        const focusable = getFocusable();
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });

    document.addEventListener("click", (e) => {
      if (!drawer.classList.contains("open")) return;
      const insideDrawer = drawer.contains(e.target);
      const insideBtn = hamburger.contains(e.target);
      if (!insideDrawer && !insideBtn) shutDrawer();
    });

    hamburger.setAttribute("aria-label", chromeCopy.menuOpen || "Open menu");
  }

  const joinHref = isEnglish ? "/en/join/" : "/join/";
  const productHref = "/sanpham/";
  const docsHref = "https://docs.nguyenlananh.com/";
  const membersHref = isEnglish ? "/en/members/" : "/members/";
  const membersDashboardHref = isEnglish ? "/en/members/dashboard/" : "/members/dashboard/";
  const joinNavLabel = ctaCopy.joinNav || (isEnglish ? "Join membership" : "Đăng ký thành viên");
  const joinCtaLabel = ctaCopy.joinPrimary || (isEnglish ? "Free companionship" : "Đồng hành miễn phí");
  const memberWorkspaceLabel = isEnglish ? "Member workspace" : "Không gian thành viên";
  const productNavLabel = navCopy[productHref] || (isEnglish ? "Products" : "Sản phẩm");
  const docsNavLabel = isEnglish ? "Docs" : "Tài liệu";

  $$(`a[href="${joinHref}"]`).forEach((anchor) => {
    const inTopbar = Boolean(anchor.closest(".topbar"));
    const isBtn = anchor.classList.contains("btn");
    const isPrimary = anchor.classList.contains("cta");

    if (inTopbar || isBtn) {
      anchor.textContent = joinNavLabel;
      return;
    }

    if (isPrimary) {
      anchor.textContent = joinCtaLabel;
    }
  });

  function createNavAnchor(href, label, classes = "") {
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.textContent = label;
    if (classes) anchor.className = classes;
    if (href.startsWith("http")) {
      anchor.target = "_blank";
      anchor.rel = "noopener";
    }
    return anchor;
  }

  function ensurePublicMenuLinks() {
    const topbarNav = document.querySelector(".topbar .navlinks");
    const drawerNav = document.querySelector(".drawer nav");
    const footerWrap = document.querySelector("footer .fwrap div:last-child");

    // Only apply to public chrome (has journey/system links).
    const isPublicChrome = !!(topbarNav && topbarNav.querySelector('a[href="/hanh-trinh/"]'));
    if (!isPublicChrome) return;

    if (topbarNav && !topbarNav.querySelector(`a[href="${productHref}"]`)) {
      const baiViet = topbarNav.querySelector('a[href="/bai-viet/"]');
      const productLink = createNavAnchor(productHref, productNavLabel);
      if (baiViet && baiViet.nextSibling) topbarNav.insertBefore(productLink, baiViet.nextSibling);
      else topbarNav.appendChild(productLink);
    }
    if (topbarNav && !topbarNav.querySelector(`a[href="${docsHref}"]`)) {
      topbarNav.appendChild(createNavAnchor(docsHref, docsNavLabel));
    }

    if (drawerNav && !drawerNav.querySelector(`a[href="${productHref}"]`)) {
      const baiViet = drawerNav.querySelector('a[href="/bai-viet/"]');
      const productLink = createNavAnchor(productHref, productNavLabel);
      if (baiViet && baiViet.nextSibling) drawerNav.insertBefore(productLink, baiViet.nextSibling);
      else drawerNav.appendChild(productLink);
    }
    if (drawerNav && !drawerNav.querySelector(`a[href="${docsHref}"]`)) {
      const docsLink = createNavAnchor(docsHref, docsNavLabel);
      docsLink.setAttribute("data-close", "");
      drawerNav.appendChild(docsLink);
    }

    if (footerWrap && !footerWrap.querySelector(`a[href="${productHref}"]`)) {
      footerWrap.appendChild(createNavAnchor(productHref, productNavLabel));
    }
    if (footerWrap && !footerWrap.querySelector(`a[href="${docsHref}"]`)) {
      footerWrap.appendChild(createNavAnchor(docsHref, docsNavLabel));
    }
  }

  function injectSocialLinks() {
    const footer = document.querySelector("footer .container");
    if (!footer || footer.querySelector(".socialRow")) return;
    const socialRow = document.createElement("div");
    socialRow.className = "socialRow";
    const isEn = isEnglish;
    socialRow.innerHTML =
      '<span class="socialLabel">' + (isEn ? 'Follow' : 'Theo dõi') + '</span>' +
      '<div class="socialIcons">' +
        '<a href="https://www.facebook.com/share/1FZStsZxUj/" target="_blank" rel="noopener" aria-label="Facebook">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' +
        '</a>' +
        '<a href="https://www.youtube.com/@Tr%C3%ADTu%E1%BB%87B%E1%BA%A3nTh%E1%BB%83" target="_blank" rel="noopener" aria-label="YouTube">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>' +
        '</a>' +
        '<a href="https://www.tiktok.com/@lan.anh03979" target="_blank" rel="noopener" aria-label="TikTok">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>' +
        '</a>' +
      '</div>';
    footer.appendChild(socialRow);
  }

  function injectShareButtons() {
    const path = location.pathname;
    const isArticle = /^\/(?:en\/)?bai-viet\//.test(path);
    if (!isArticle) return;
    const main = document.querySelector("#main");
    if (!main || main.querySelector(".shareSection")) return;
    const url = encodeURIComponent(location.href);
    const title = encodeURIComponent(document.title);
    const shareData = { title: document.title, url: location.href };
    const isEn = isEnglish;
    const shareSection = document.createElement("div");
    shareSection.className = "shareSection";
    shareSection.innerHTML =
      '<div class="shareInner">' +
        '<span class="shareLabel">' + (isEn ? 'Share' : 'Chia sẻ') + '</span>' +
        '<div class="shareButtons">' +
          '<button class="shareBtn" data-share="facebook" aria-label="Facebook">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' +
            '<span>Facebook</span>' +
          '</button>' +
          '<button class="shareBtn" data-share="twitter" aria-label="Twitter / X">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' +
            '<span>X</span>' +
          '</button>' +
          '<button class="shareBtn" data-share="linkedin" aria-label="LinkedIn">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>' +
            '<span>LinkedIn</span>' +
          '</button>' +
          '<button class="shareBtn" data-share="telegram" aria-label="Telegram">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>' +
            '<span>Telegram</span>' +
          '</button>' +
          '<button class="shareBtn shareBtnCopy" data-share="copy" aria-label="' + (isEn ? 'Copy link' : 'Sao chép liên kết') + '">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>' +
            '<span>' + (isEn ? 'Copy' : 'Sao chép') + '</span>' +
          '</button>' +
        '</div>' +
      '</div>';
    main.appendChild(shareSection);
    shareSection.querySelectorAll(".shareBtn").forEach(function(btn) {
      btn.addEventListener("click", function(e) {
        var platform = btn.getAttribute("data-share");
        if (platform === "copy") {
          navigator.clipboard.writeText(location.href).then(function() {
            var span = btn.querySelector("span");
            if (span) {
              var orig = span.textContent;
              span.textContent = isEn ? "Copied!" : "Đã sao chép!";
              setTimeout(function() { span.textContent = orig; }, 1500);
            }
          }).catch(function() {});
          return;
        }
        if (platform === "facebook") {
          window.open("https://www.facebook.com/sharer/sharer.php?u=" + url, "_blank", "width=600,height=400");
        } else if (platform === "twitter") {
          window.open("https://x.com/intent/tweet?text=" + title + "&url=" + url, "_blank", "width=600,height=400");
        } else if (platform === "linkedin") {
          window.open("https://www.linkedin.com/sharing/share-offsite/?url=" + url, "_blank", "width=600,height=400");
        } else if (platform === "telegram") {
          window.open("https://t.me/share/url?url=" + url + "&text=" + title, "_blank", "width=600,height=400");
        }
      });
    });
  }

  function authRouteFromHref(href) {
    if (!href || !href.startsWith("/")) return null;
    return routeFromHref(href.split(/[?#]/, 1)[0]);
  }

  function shouldRelabelToWorkspace(anchor) {
    if (!anchor) return false;
    if (anchor.classList.contains("btn") || anchor.classList.contains("drawerCta")) return true;
    const text = String(anchor.textContent || "").toLowerCase();
    return /đăng ký|đăng nhập|join|sign in|free|miễn phí/.test(text);
  }

  async function fetchMemberSession() {
    try {
      const response = await fetch("/api/auth/session", { method: "GET", headers: { Accept: "application/json" } });
      if (!response.ok) return null;
      const body = await response.json().catch(() => null);
      if (body && body.ok && body.session && body.session.email) return body.session;
    } catch (_err) {
      return null;
    }
    return null;
  }

  function rewriteNavigationForLoggedInMember() {
    $$("a[href]").forEach((anchor) => {
      const route = authRouteFromHref(anchor.getAttribute("href"));
      if (route === "/members/" || route === "/join/") {
        anchor.setAttribute("href", membersDashboardHref);
        if (shouldRelabelToWorkspace(anchor)) {
          anchor.textContent = memberWorkspaceLabel;
        }
      }
    });
  }

  function redirectPublicAuthPagesToWorkspace() {
    const current = normalizePath(window.location.pathname);
    if (current === joinHref || current === membersHref) {
      window.location.replace(membersDashboardHref);
      return true;
    }
    return false;
  }

  localizeSharedChrome();
  ensurePublicMenuLinks();
  injectSocialLinks();
  injectShareButtons();

  void (async () => {
    const session = await fetchMemberSession();
    if (!session) return;
    rewriteNavigationForLoggedInMember();
    redirectPublicAuthPagesToWorkspace();
  })();

  const articleImageLibrary = {
    "bon-truc-thay-doi": "/assets/images/articles/di-vao-ben-trong-hero.svg",
    "gan-duc-khoi-trong": "/assets/images/articles/gan-duc-khoi-trong-hero.svg",
    "neu-minh-sai-thi-sao": "/assets/images/articles/neu-minh-sai-thi-sao-hero.svg",
    "khi-moi-truong-khong-con-phu-hop": "/assets/images/articles/khi-moi-truong-khong-con-phu-hop-hero.svg",
    "im-lang-noi-ban-van-dang-ne": "/assets/images/articles/article-hero-default.svg",
    "he-gia-dinh-noi-phan-xa-duoc-hoc": "/assets/images/articles/gia-dinh-khong-chi-la-noi-ta-lon-len-hero.svg",
    "co-don-khong-phai-vi-thieu-nguoi": "/assets/images/articles/article-hero-default.svg",
    "moi-truong-la-nguoi-thay-vo-hinh": "/assets/images/articles/khi-moi-truong-khong-con-phu-hop-hero.svg",
    "nuoi-day-tre-khong-lam-gay-tu-nhien": "/assets/images/articles/dieu-tre-em-can-khong-chi-la-day-dung-hero.svg",
    "lao-dong-sang-tao-khong-phai-dau-ra-ma-la-cach-song": "/assets/images/articles/lao-dong-sang-tao-hero.svg",
    "dau-tu-ban-than-khong-ao-tuong-doi-doi": "/assets/images/articles/dau-tu-ban-than-hero.svg",
    "cong-dong-song-moi": "/assets/images/articles/cong-dong-song-moi-hero.svg",
    "ngoi-nha-thu-2": "/assets/images/articles/ngoi-nha-thu-2-hero.svg",
    "ngoi-nha-thu-hai-noi-ban-dang-song-moi-ngay": "/assets/images/articles/ngoi-nha-thu-hai-hero.svg",
    "vu-tru-vat-chat": "/assets/images/articles/vu-tru-vat-chat-hero.svg",
    "song-theo-dong-chay": "/assets/images/articles/song-theo-dong-chay-hero.svg",
    "nhat-ky-37-ngay-lam-chu-ngay-1": "/assets/images/articles/nhat-ky-37-ngay-lam-chu-ngay-1-hero.svg",
  };
  const articleDefaultImage = "/assets/images/articles/article-hero-default.svg";

  const articleImageGroups = [
    {
      label: "inner",
      pattern: /(di-vao-ben-trong|hieu-cuoc-doi-minh|dieu-dang|thieu-su-that|nhung-vong-lap|song-sai-nhip|chua-tung-co-huong|co-nguoi-can-dung-lai|chi-can-dung|sai-moi-truong)/,
      captionVi: "Một khoảng lặng nhẹ để nhìn lại chính mình.",
      captionEn: "A calm frame for looking inward."
    },
    {
      label: "growth",
      pattern: /(dau-tu-ban-than|tu-55-trieu-den-tu-do|dau-tu-hien-tai-tu-do-tuong-lai|dau-tu|khoi-tu-tam|nhat-ky-37-ngay-lam-chu-ngay-1|du-an-37-ngay|du-an-buoc|du-an-nhat-ky|cong-dong-song-moi|khoi-tu-tam)/,
      captionVi: "Góc nhìn sâu giúp bạn thấy bước tiếp theo rõ hơn.",
      captionEn: "A grounded visual to help choose the next step."
    },
    {
      label: "home",
      pattern: /(gia-dinh|dieu-tre-em|thoi-gian|ngoi-nha|khong-gay|vo-nghe|song-theo-dong-chay|am-thanh)/,
      captionVi: "Không gian sống, mối quan hệ và một nhịp sống chậm hơn.",
      captionEn: "Home life, relationships, and a steadier rhythm."
    },
    {
      label: "creation",
      pattern: /(mon-hoc-don-dep|lao-dong-sang-tao|am-thanh|cai-choi|truong-thanh-thong-qua-mon-hoc|vu-tru)/,
      captionVi: "Không gian tĩnh để bạn trở về cách làm việc trọn vẹn.",
      captionEn: "A calm workspace to return to meaningful work."
    },
    {
      label: "journal",
      pattern: /(di-vao-ben-trong-giai-ma|nhat-ky|ket-noi|trang|project|du-an)/,
      captionVi: "Ghi chép, quan sát, rồi đi tiếp.",
      captionEn: "Journal notes, reflection, and next steps."
    },
    {
      label: "default",
      pattern: /.*/,
      captionVi: "Một hình ảnh nhẹ để mở đầu cho phần đọc sâu.",
      captionEn: "A soft image to support deeper reading."
    }
  ];

  function getArticleVisualConfig(slug) {
    const normalized = (slug || "").toLowerCase();
    const direct = articleImageLibrary[normalized];
    const matched = articleImageGroups.find((group) => group.pattern.test(normalized));
    const caption = isEnglish ? matched?.captionEn || "" : matched?.captionVi || "";
    return {
      localImage: direct || `/assets/images/articles/${normalized}-hero.svg`,
      fallbackImage: articleDefaultImage,
      caption
    };
  }

  function ensureArticleHero() {
    const match = location.pathname.match(/^\/(?:en\/)?bai-viet\/([a-z0-9-]+)\//i);
    if (!match) return;

    const slug = match[1];
    if (slug === "[slug]") return;
    if (document.querySelector(".articleHero")) return;

    const pageHead = $(".pageHead");
    if (!pageHead) return;
    const h1 = pageHead.querySelector("h1");
    const heroTitle = h1 ? h1.textContent.trim() : "Bài viết";
    const titleText = heroTitle || slug;
    const config = getArticleVisualConfig(slug);
    const safeImage = config.localImage || config.fallbackImage;
    const captionText = config.caption;
    const altText = `${titleText} - ${isEnglish ? "visual" : "hình minh họa"}`;

    const figure = document.createElement("figure");
    figure.className = "articleHero";
    figure.innerHTML = `
      <div class="articleHero__media">
        <img
          src="${safeImage}"
          alt="${altText.replace(/"/g, "&quot;")}"
          loading="eager"
          decoding="async"
          width="1400"
          height="788"
        />
      </div>
      <figcaption>${captionText}</figcaption>
    `;

    const img = figure.querySelector("img");
    img?.addEventListener("error", () => {
      if (img.getAttribute("data-switched") === "1") return;
      img.setAttribute("data-switched", "1");
      img.src = config.fallbackImage;
      figure.classList.remove("is-loading");
    });

    img?.addEventListener("load", () => {
      figure.classList.add("is-loaded");
      figure.classList.remove("is-loading");
    });

    figure.classList.add("is-loading");
    pageHead.insertAdjacentElement("afterend", figure);
    requestAnimationFrame(() => figure.classList.add("is-visible"));

    return figure;
  }

  ensureArticleHero();

  const loadedScripts = new Set();
  function loadScript(src) {
    if (loadedScripts.has(src)) return;
    loadedScripts.add(src);
    if (document.querySelector('script[src="' + src + '"]')) return;
    const s = document.createElement("script");
    s.src = src;
    s.defer = true;
    document.body.appendChild(s);
  }
  loadScript("/assets/lazy-load.js");
  loadScript("/assets/cta-modules.js");

  // Analytics tracking
  const sessionId = localStorage.getItem("nla_session_id") || ("s_" + Math.random().toString(36).slice(2) + Date.now().toString(36));
  localStorage.setItem("nla_session_id", sessionId);

  function trackEvent(type, metadata) {
    const payload = {
      type: type,
      path: location.pathname,
      referrer: document.referrer,
      locale: localeCode,
      session_id: sessionId,
      metadata: metadata || {}
    };
    try {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    } catch (e) {}
  }

  // Track page view
  trackEvent("page_view", { title: document.title });

  // Track CTA clicks on product and article pages
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("a[data-track]");
    if (!btn) return;
    trackEvent("cta_click", {
      action: btn.dataset.track,
      href: btn.getAttribute("href"),
      text: btn.textContent.trim().slice(0, 60)
    });
  });

  // Expose globally for manual tracking
  window.nlaTrack = trackEvent;
})();
