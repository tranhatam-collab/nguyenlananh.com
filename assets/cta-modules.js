(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const rawLang = document.documentElement.lang || "";
  const localeCode = rawLang.startsWith("en") ? "en" : "vi";
  const isEnglish = localeCode === "en";

  const relatedArticles = {
    "di-vao-ben-trong": {
      vi: [
        { url: "/bai-viet/dieu-dang-tiec-nhat-khi-ket-thuc-mot-kiep-song/", title: "Điều đáng tiếc nhất khi kết thúc một kiếp sống" },
        { url: "/bai-viet/hanh-trinh-di-vao-ben-trong/", title: "Hành trình đi vào bên trong" },
        { url: "/bai-viet/di-vao-ben-trong-giai-ma-nhung-gi-dang-van-hanh-ban/", title: "Đi vào bên trong – giải mã những gì đang vận hành bạn" }
      ],
      en: [
        { url: "/en/bai-viet/dieu-dang-tiec-nhat-khi-ket-thuc-mot-kiep-song/", title: "The biggest regret at the end of a lifetime" },
        { url: "/en/bai-viet/hanh-trinh-di-vao-ben-trong/", title: "The journey inward" },
        { url: "/en/bai-viet/di-vao-ben-trong-giai-ma-nhung-gi-dang-van-hanh-ban/", title: "Inward – decoding what drives you" }
      ]
    },
    "phuong-phap": {
      vi: [
        { url: "/phuong-phap/", title: "Phương pháp" },
        { url: "/bai-viet/bon-truc-thay-doi-cuoc-doi/", title: "Bốn trục thay đổi cuộc đời" },
        { url: "/chuong-trinh/", title: "Chương trình đồng hành" }
      ],
      en: [
        { url: "/en/phuong-phap/", title: "The Method" },
        { url: "/en/bai-viet/bon-truc-thay-doi-cuoc-doi/", title: "Four axes that change your life" },
        { url: "/en/chuong-trinh/", title: "Guided Programs" }
      ]
    },
    "hanh-trinh": {
      vi: [
        { url: "/bai-viet/dieu-dang-tiec-nhat-khi-ket-thuc-mot-kiep-song/", title: "Điều đáng tiếc nhất" },
        { url: "/phuong-phap/", title: "Phương pháp thực hành" },
        { url: "/join/", title: "Đăng ký đồng hành" }
      ],
      en: [
        { url: "/en/bai-viet/dieu-dang-tiec-nhat-khi-ket-thuc-mot-kiep-song/", title: "The biggest regret" },
        { url: "/en/phuong-phap/", title: "The practice method" },
        { url: "/en/join/", title: "Join the journey" }
      ]
    }
  };

  const defaultRelated = {
    vi: [
      { url: "/hanh-trinh/", title: "Hành trình" },
      { url: "/phuong-phap/", title: "Phương pháp" },
      { url: "/join/", title: "Đăng ký đồng hành" }
    ],
    en: [
      { url: "/en/hanh-trinh/", title: "Journey" },
      { url: "/en/phuong-phap/", title: "Method" },
      { url: "/en/join/", title: "Join" }
    ]
  };

  function detectContext() {
    const path = location.pathname;
    if (path.includes("/bai-viet/")) return "di-vao-ben-trong";
    if (path.includes("/phuong-phap/")) return "phuong-phap";
    if (path.includes("/hanh-trinh/")) return "hanh-trinh";
    return null;
  }

  function getRelated(context) {
    const set = relatedArticles[context];
    const list = set ? (set[localeCode] || set.vi) : (defaultRelated[localeCode] || defaultRelated.vi);
    const currentPath = location.pathname;
    return list.filter((item) => item.url !== currentPath);
  }

  function injectRelatedPanel() {
    const main = $("main");
    if (!main) return;
    if (main.querySelector(".relatedPanel")) return;

    const context = detectContext();
    const items = getRelated(context);
    const title = isEnglish ? "Continue reading" : "Đọc tiếp";
    const ctaText = isEnglish ? "Join the journey →" : "Đăng ký đồng hành →";
    const ctaUrl = isEnglish ? "/en/join/" : "/join/";

    const panel = document.createElement("section");
    panel.className = "relatedPanel";
    panel.style.marginTop = "18px";
    panel.innerHTML = `
      <div class="panel">
        <h3 style="margin:0 0 12px; font-size:16px;">${title}</h3>
        <ul class="list" style="margin:0;">
          ${items.map((item) => `<li><a href="${item.url}">${item.title}</a></li>`).join("")}
        </ul>
        <div class="actionsRow" style="margin-top:14px;">
          <a class="cta" href="${ctaUrl}">${ctaText}</a>
        </div>
      </div>
    `;

    main.appendChild(panel);
  }

  function injectFeaturedSeries() {
    const main = $("main");
    if (!main) return;
    if (main.querySelector(".featuredSeries")) return;

    const path = location.pathname;
    if (!path.includes("/bai-viet/")) return;

    const isArticlePage = /\/bai-viet\/[^/]+\/$/.test(path);
    if (!isArticlePage) return;

    const title = isEnglish ? "From the same series" : "Cùng chuyên mục";
    const series = isEnglish ? "Inside Journey" : "Đi vào bên trong";
    const seriesUrl = isEnglish ? "/en/bai-viet/chuyen-muc/di-vao-ben-trong/" : "/bai-viet/chuyen-muc/di-vao-ben-trong/";

    const panel = document.createElement("section");
    panel.className = "featuredSeries";
    panel.style.marginTop = "18px";
    panel.innerHTML = `
      <div class="panel">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px;">
          <h3 style="margin:0; font-size:16px;">${title}</h3>
          <a href="${seriesUrl}" style="font-size:12px; color:var(--c-orange);">${series} →</a>
        </div>
        <p style="font-size:13px; color:rgba(42,24,16,.72); margin:0;">
          ${isEnglish
            ? "These articles are part of a sequence. Reading in order helps the pieces connect."
            : "Các bài viết này là một chuỗi. Đọc theo thứ tự sẽ giúp các mảng kết nối với nhau."
          }
        </p>
      </div>
    `;

    main.appendChild(panel);
  }

  function run() {
    injectRelatedPanel();
    injectFeaturedSeries();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
