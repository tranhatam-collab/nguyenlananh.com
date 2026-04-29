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
    function openDrawer() {
      drawer.classList.add("open");
      hamburger.setAttribute("aria-expanded", "true");
      hamburger.setAttribute("aria-label", chromeCopy.menuClose || "Close menu");
    }

    function shutDrawer() {
      drawer.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.setAttribute("aria-label", chromeCopy.menuOpen || "Open menu");
    }

    hamburger.addEventListener("click", () => {
      if (drawer.classList.contains("open")) shutDrawer();
      else openDrawer();
    });

    closeDrawer?.addEventListener("click", shutDrawer);
    $$("[data-close]", drawer).forEach((a) => a.addEventListener("click", shutDrawer));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") shutDrawer();
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
  const joinNavLabel = ctaCopy.joinNav || (isEnglish ? "Join membership" : "Đăng ký thành viên");
  const joinCtaLabel = ctaCopy.joinPrimary || (isEnglish ? "Free companionship" : "Đồng hành miễn phí");

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

  localizeSharedChrome();

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
          loading="lazy"
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
})();
