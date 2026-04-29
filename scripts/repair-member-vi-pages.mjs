import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DOMAIN = "https://www.nguyenlananh.com";

const deepPages = [
  {
    slug: "ban-do-vong-lap",
    title: "Bản đồ vòng lặp và những điểm ma sát ẩn",
    description:
      "Chuyên đề thành viên để gọi tên vòng lặp đang quay lại, điểm kích hoạt, phản ứng bảo vệ và một hành động nhỏ trước khi vòng khép lại.",
    eyebrow: "Chuyên sâu thành viên",
    intro:
      "Một vòng lặp không bắt đầu ở lúc bạn mất bình tĩnh. Nó thường bắt đầu sớm hơn, ở một điểm rất nhỏ mà bạn chưa kịp nhìn thấy.",
    lessons: [
      "Nhìn vòng trước khi sửa vòng",
      "Điểm kích hoạt không phải nguyên nhân duy nhất",
      "Phản ứng bảo vệ và cái giá đang trả",
      "Niềm tin đứng sau vòng lặp",
      "Một hành động trước điểm khép"
    ],
    practice:
      "Trong bảy ngày, ghi lại ba vòng lặp thật: chuyện gì xảy ra, cơ thể phản ứng ra sao, bạn làm gì, và cái giá sau đó là gì.",
    worksheet: "Bản đồ vòng lặp",
    next: [
      ["/members/deep/am-thanh-tu-than/", "Âm thanh tự thân và tiếng nói bên trong"],
      ["/members/deep/gia-dinh-va-goc-re/", "Gia đình và những điều đang truyền qua nhau"]
    ]
  },
  {
    slug: "am-thanh-tu-than",
    title: "Âm thanh tự thân và tiếng nói bên trong",
    description:
      "Chuyên đề thành viên về giọng hát, hơi thở, cảm nhận và việc mở lại tiếng nói bên trong như một thực hành tự thân.",
    eyebrow: "Chuyên sâu thành viên",
    intro:
      "Đây không phải một lớp dạy hát. Đây là một không gian để bạn làm việc với hơi thở, giọng nói và những nơi trong mình đang nín lại.",
    lessons: [
      "Tôi rời khỏi mình bằng cách nào",
      "Vai trò xã hội và cảm giác trống",
      "Nói thật với mình trước",
      "Ở cùng người khác mà không bỏ mình",
      "Tạo nhịp gặp lại chính mình"
    ],
    practice:
      "Chọn một buổi tối không lấp bằng điện thoại, tiếng ồn hay việc phụ. Ngồi yên vài phút, ngân một âm rất nhẹ, rồi viết lại điều xuất hiện đầu tiên.",
    worksheet: "Bản đồ kết nối lại với mình",
    next: [
      ["/members/deep/ban-do-vong-lap/", "Bản đồ vòng lặp"],
      ["/members/deep/gia-dinh-va-goc-re/", "Gia đình và gốc rễ"]
    ]
  },
  {
    slug: "doi-thoai-chua-lanh-trong-nha",
    title: "Đối thoại chưa lành trong nhà",
    description:
      "Chuyên đề thành viên về cách nhìn một cuộc trò chuyện trong gia đình chậm hơn, thật hơn, và ít rơi lại vào vai cũ hơn.",
    eyebrow: "Chuyên sâu thành viên",
    intro:
      "Có những cuộc nói chuyện trong nhà chưa bắt đầu đã mệt, vì mỗi người bước vào bằng một vai cũ. Chuyên đề này giúp bạn quan sát lại trước khi cố sửa người khác.",
    lessons: [
      "Cuộc nói chuyện đang mang vai nào",
      "Khi im lặng không còn là bình yên",
      "Câu nói thật không cần làm đau",
      "Nghe mà không lập tức phòng thủ",
      "Một nhịp đối thoại đủ nhỏ để bắt đầu lại"
    ],
    practice:
      "Chọn một cuộc trò chuyện nhỏ trong tuần. Trước khi nói, viết ra điều mình thật sự muốn được hiểu và điều mình sợ sẽ xảy ra.",
    worksheet: "Ghi chú đối thoại trong nhà",
    next: [
      ["/members/deep/gia-dinh-va-goc-re/", "Gia đình và gốc rễ"],
      ["/members/deep/tre-em-va-khong-gian-lon-len/", "Trẻ em và không gian lớn lên"]
    ]
  },
  {
    slug: "gia-dinh-va-goc-re",
    title: "Gia đình và những điều đang truyền qua nhau",
    description:
      "Chuyên đề thành viên về vai trò cũ, lòng trung thành vô thức, phản ứng học từ nhà và cách không truyền tiếp điều đã làm mình mệt.",
    eyebrow: "Chuyên sâu thành viên",
    intro:
      "Gia đình không chỉ nằm ở quá khứ. Nó đi cùng ta trong cách phản ứng, cách yêu thương, cách sợ, cách im lặng và cách cố làm người tốt.",
    lessons: [
      "Vai trò cũ",
      "Lòng trung thành vô thức",
      "Phản ứng học từ nhà",
      "Gần gia đình mà không bị nuốt lại",
      "Không truyền tiếp"
    ],
    practice:
      "Quan sát một bữa cơm, một cuộc gọi hoặc một tin nhắn gia đình. Ghi lại vai mình thường nhận, phản xạ đi kèm, và một điều mình chọn không lặp lại.",
    worksheet: "Bản đồ vai trò gia đình",
    next: [
      ["/members/deep/ranh-gioi-mem-trong-gia-dinh/", "Ranh giới mềm trong gia đình"],
      ["/members/deep/doi-thoai-chua-lanh-trong-nha/", "Đối thoại chưa lành trong nhà"]
    ]
  },
  {
    slug: "ky-luat-nhe-va-nhip-song-moi",
    title: "Kỷ luật nhẹ và nhịp sống mới",
    description:
      "Chuyên đề thành viên về kỷ luật bền, việc nhỏ, nhịp lặp, ngày rơi khỏi nhịp và cách tạo bằng chứng thật trong đời sống.",
    eyebrow: "Chuyên sâu thành viên",
    intro:
      "Kỷ luật không nhất thiết bắt đầu bằng ép mình. Nhiều khi nó bắt đầu bằng một việc nhỏ đủ thật, đủ lặp lại, và đủ gần với đời sống hiện tại.",
    lessons: [
      "Kỷ luật không phải ép mình",
      "Việc nhỏ và nhịp lặp",
      "Ngày rơi khỏi nhịp",
      "Nhịp có chỗ nghỉ",
      "Tạo bằng chứng bền"
    ],
    practice:
      "Chọn một việc nhỏ cố định trong bảy ngày. Không chọn việc để chứng minh mình giỏi. Chọn việc đủ nhỏ để dù một ngày mệt, bạn vẫn có thể quay lại.",
    worksheet: "Bảng theo dõi kỷ luật nhẹ",
    next: [
      ["/members/deep/lao-dong-vat-the-va-su-truong-thanh/", "Lao động, vật thể và sự trưởng thành"],
      ["/members/pro/discipline/", "Tầng Pro về kỷ luật"]
    ]
  }
];

const creatorPages = [
  {
    slug: "guidelines",
    title: "Hướng dẫn creator",
    description: "Tiêu chuẩn biên tập và chất lượng cho nội dung cộng tác nội bộ.",
    intro: "Trang này giữ giọng viết, tiêu chuẩn nội dung và ranh giới chất lượng trước khi một bài được đưa vào hệ thống.",
    panels: [
      ["Nội dung được nhận", ["Có trải nghiệm thật hoặc quan sát thật.", "Có cấu trúc: bối cảnh, hành động, kết quả, bài học.", "Ngôn ngữ cụ thể, bình tĩnh, không diễn."]],
      ["Nội dung bị từ chối", ["Viết để gây sốc hoặc kéo tương tác.", "Lộ thông tin riêng tư của người khác.", "Hứa hẹn chữa lành, đổi đời hoặc kết quả không có căn cứ."]]
    ],
    actions: [
      ["/members/creator/submit/", "Gửi nội dung"],
      ["/members/creator/", "Về tầng creator"]
    ]
  },
  {
    slug: "library",
    title: "Thư viện creator",
    description: "Kho nội dung nội bộ cho creator, gồm mẫu bài, rubric, gói nộp bài và trạng thái duyệt.",
    intro: "Thư viện này giúp cộng tác viên viết đúng nhịp hệ thống trước khi tạo thêm nội dung mới.",
    panels: [
      ["Mẫu cần đọc", ["Voice lock của NguyenLanAnh.", "Biến public pillar thành paid practice.", "Case thật không xâm phạm riêng tư."]],
      ["Trạng thái nội dung", ["Draft: đang viết.", "Review: chờ biên tập.", "Approved: đã được duyệt để đưa vào hệ thống."]]
    ],
    actions: [
      ["/members/creator/guidelines/", "Đọc guideline"],
      ["/members/creator/submit/", "Gửi bản nháp"]
    ]
  },
  {
    slug: "revenue-share",
    title: "Vận hành creator",
    description: "Nguyên tắc vận hành nội bộ cho cộng tác viên, ghi nhận đóng góp, duyệt nội dung và chia sẻ doanh thu khi đủ điều kiện.",
    intro: "Vận hành creator chỉ được mở khi nội dung, quyền truy cập, review và ghi nhận đóng góp đã rõ.",
    panels: [
      ["Nguyên tắc", ["Không hứa doanh thu trước khi có điều kiện rõ.", "Không dùng nội dung chưa duyệt để bán.", "Mọi đóng góp phải có log và người duyệt."]],
      ["Luồng vận hành", ["Nộp nội dung.", "Review theo rubric.", "Duyệt hoặc yêu cầu sửa.", "Ghi nhận đóng góp sau khi được dùng chính thức."]]
    ],
    actions: [
      ["/members/creator/library/", "Xem thư viện"],
      ["/admin/creators/", "Về admin creator"]
    ]
  },
  {
    slug: "submit",
    title: "Gửi nội dung creator",
    description: "Mẫu nộp nội dung để admin review nhanh, đúng chuẩn và không làm lệch giọng hệ thống.",
    intro: "Mỗi submission cần đủ bối cảnh, mục đích, nội dung chính, route dự kiến, nguồn tham chiếu và ghi chú rủi ro.",
    panels: [
      ["Gói nộp chuẩn", ["Tiêu đề và route đề xuất.", "Người đọc mục tiêu.", "Nội dung chính hoặc outline.", "Internal links ổn định.", "Rủi ro riêng tư hoặc claim cần tránh."]],
      ["Trước khi gửi", ["Đọc lại guideline.", "Không dùng placeholder.", "Không đưa claim chữa lành, tài chính hoặc kết quả chắc chắn."]]
    ],
    actions: [
      ["/members/creator/guidelines/", "Xem guideline"],
      ["/members/creator/", "Về tầng creator"]
    ]
  }
];

const englishArticles = [
  {
    slug: "dieu-ban-dang-tranh",
    title: "What You Avoid Is What Needs to Be Seen",
    description:
      "What you keep avoiding rarely disappears. It returns in other forms and keeps shaping the way you live.",
    section: "Going inward",
    image: "/assets/og/og-di-vao-ben-trong.svg",
    published: "2026-04-17",
    intro: "What you avoid does not leave your life. It steps into the background and keeps operating from there.",
    paragraphs: [
      "You avoid a conversation. You avoid a feeling. You avoid a decision that you already know will need to be faced.",
      "At first, avoidance gives relief. At least for the moment.",
      "But what is avoided usually does not disappear. It follows you in other forms: irritation, exhaustion, delay, impatience, or a heaviness you cannot quite name.",
      "Some things become stronger precisely because they are never looked at directly.",
      "You may think you are avoiding pain. Very often, what you are really avoiding is clarity.",
      "Because once something has been seen, it becomes harder to keep living as if you do not know.",
      "Looking at what you avoid does not mean solving everything immediately. It means no longer letting it govern you from the dark.",
      "Sometimes what needs to be seen is not dramatic. It may be a small truth that has been delayed for too long: I am tired, I no longer want this, I am afraid, I am not being honest.",
      "From the moment the avoided thing is named, it begins to lose some of its power.",
      "What you avoid is not blocking the doorway. It may be the doorway."
    ],
    links: [
      ["/en/bai-viet/song-theo-thoi-quen/", "You are living by habit, not choice"],
      ["/en/bai-viet/hieu-cuoc-doi-minh/", "You do not need to change your life. You need to understand it"],
      ["/en/bai-viet/chua-tung-co-huong/", "You are not lost. You never had a real direction"]
    ],
    cta: ["/en/lien-he/", "Reach out if you want to go deeper"]
  },
  {
    slug: "gia-dinh-khong-chi-la-noi-ta-lon-len",
    title: "Family Is Not Only Where You Grew Up",
    description:
      "A short reflection on how family shapes present-day reactions, and how to look back clearly without collapsing into blame.",
    section: "Going inward",
    image: "/assets/og/og-gia-dinh-goc-re.svg",
    published: "2026-04-09",
    intro:
      "Some things did not begin as your own thoughts. You lived inside them for so long that they started to feel like you.",
    paragraphs: [
      "Many people enter adulthood believing that everything from now on is their own choice.",
      "That is partly true.",
      "But there is another layer that is harder to see: the way you react, fear, stay silent, endure, or work to be recognized was often shaped very early.",
      "Not because you are weak. Because family is the first environment where we learn how to live.",
      "We learn through words. We learn through silence. We learn through how adults look at each other, look at us, and look at themselves.",
      "Some people grow up with the message that they must be excellent to be loved.",
      "Some grow up with the message that staying quiet keeps the peace.",
      "Some grow up with the message that sacrifice is the only way to be good.",
      "Later, we may call these things personality.",
      "But very often, they are roles that once helped us survive inside an old system.",
      "The hard part of looking back at family is that people often fall into two extremes: blaming everything on the family, or denying the influence completely and forcing themselves to move on.",
      "Neither extreme creates real freedom.",
      "A more mature path is to see the influence clearly, without blame and without escaping responsibility in the present.",
      "You can begin with a small practice: write down three sentences you heard often in your family, mark which one you still live by today, and choose one old reaction you do not want to pass on.",
      "When you name what has been passed through, you begin to choose what stops with you and what opens through you."
    ],
    links: [
      ["/en/bai-viet/hanh-trinh-di-vao-ben-trong/", "The journey inward"],
      ["/en/bai-viet/neu-minh-sai-thi-sao/", "What if I am wrong?"],
      ["/en/members/deep/gia-dinh-va-goc-re/", "Open the member deep topic on family roots"]
    ],
    cta: ["/en/join/", "Start the member path"]
  }
];

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function list(items) {
  return `<ul class="list">${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function deepHtml(page) {
  const route = `/members/deep/${page.slug}/`;
  const enRoute = `/en${route}`;
  return `<!doctype html>
<html lang="vi-VN" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>Chuyên sâu thành viên | ${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}" />
  <meta name="robots" content="noindex,follow" />
  <link rel="canonical" href="${DOMAIN}${route}" />
  <link rel="alternate" hreflang="vi" href="${DOMAIN}${route}" />
  <link rel="alternate" hreflang="en-US" href="${DOMAIN}${enRoute}" />
  <link rel="alternate" hreflang="en" href="${DOMAIN}${enRoute}" />
  <link rel="alternate" hreflang="x-default" href="${DOMAIN}${route}" />
  <link rel="stylesheet" href="/assets/site.css" />
  <meta property="og:title" content="Chuyên sâu thành viên | ${esc(page.title)}" />
  <meta property="og:description" content="${esc(page.description)}" />
  <meta property="og:url" content="${DOMAIN}${route}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Chuyên sâu thành viên | ${esc(page.title)}" />
  <meta name="twitter:description" content="${esc(page.description)}" />
</head>
<body data-page="members-deep-topic">
  <header class="topbar" role="banner"><div class="container"><div class="navwrap"><a class="brand" href="/members/deep/"><div class="mark" aria-hidden="true"></div><div class="name"><strong>Chuyên sâu</strong><span>Tầng thực hành thành viên</span></div></a><nav class="navlinks" aria-label="Điều hướng thành viên"><a href="/members/dashboard/">Bảng điều khiển</a><a href="/members/journey/">Hành trình</a><a href="/members/practice/">Thực hành</a><a href="/members/deep/">Chuyên sâu</a><a href="/members/experience/">Trải nghiệm</a><a href="/members/pro/">Tầng Pro</a></nav><div class="actions"><button id="logoutBtn" class="btn" type="button">Đăng xuất</button></div></div></div></header>
  <main class="container" role="main">
    <section class="pageHead"><p style="margin:0; font-size:13px; color:rgba(15,23,42,.6);"><a href="/members/deep/">Tầng chuyên sâu</a> / ${esc(page.eyebrow)}</p><h1>${esc(page.title)}</h1><p class="sub">${esc(page.description)}</p><div class="actionsRow"><a class="cta" href="/members/practice/">Mở thực hành hôm nay</a><a class="ghost" href="/members/deep/">Về tầng chuyên sâu</a></div></section>
    <section class="panel"><p>${esc(page.intro)}</p><p>Điểm chính của chuyên đề này là đi chậm hơn phản xạ cũ, nhìn đúng điều đang vận hành, rồi chọn một hành động đủ nhỏ để đời sống có bằng chứng mới.</p></section>
    <section class="grid2" style="margin-top:12px;">
      <article class="panel"><h3>Bài học trong chuyên đề</h3>${list(page.lessons)}</article>
      <article class="panel"><h3>Thực hành tuần này</h3><p>${esc(page.practice)}</p><p><strong>Worksheet:</strong> ${esc(page.worksheet)}</p></article>
    </section>
    <section class="panel" style="margin-top:12px;"><h3>Đi tiếp từ đây</h3>${list(page.next.map(([, label]) => label))}<div class="actionsRow">${page.next.map(([href, label]) => `<a class="ghost" href="${href}">${esc(label)}</a>`).join("")}</div></section>
  </main>
  <script src="/assets/content-registry.js"></script>
  <script src="/assets/site.js"></script>
  <script src="/assets/i18n-config.js"></script>
  <script src="/assets/lang-routing.js"></script>
</body>
</html>
`;
}

function creatorHtml(page) {
  const route = `/members/creator/${page.slug}/`;
  const enRoute = `/en${route}`;
  return `<!doctype html>
<html lang="vi-VN" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>${esc(page.title)} | Nguyenlananh.com</title>
  <meta name="description" content="${esc(page.description)}" />
  <meta name="robots" content="noindex,follow" />
  <link rel="canonical" href="${DOMAIN}${route}" />
  <link rel="alternate" hreflang="vi" href="${DOMAIN}${route}" />
  <link rel="alternate" hreflang="en-US" href="${DOMAIN}${enRoute}" />
  <link rel="alternate" hreflang="en" href="${DOMAIN}${enRoute}" />
  <link rel="alternate" hreflang="x-default" href="${DOMAIN}${route}" />
  <link rel="stylesheet" href="/assets/site.css" />
  <meta property="og:title" content="${esc(page.title)} | Nguyenlananh.com" />
  <meta property="og:description" content="${esc(page.description)}" />
  <meta property="og:url" content="${DOMAIN}${route}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(page.title)} | Nguyenlananh.com" />
  <meta name="twitter:description" content="${esc(page.description)}" />
</head>
<body data-page="members-creator-${page.slug}">
  <header class="topbar" role="banner"><div class="container"><div class="navwrap"><a class="brand" href="/members/creator/"><div class="mark" aria-hidden="true"></div><div class="name"><strong>Tầng creator</strong><span>Nội bộ thành viên</span></div></a><nav class="navlinks" aria-label="Điều hướng creator"><a href="/members/creator/">Tổng quan</a><a href="/members/creator/guidelines/">Hướng dẫn</a><a href="/members/creator/submit/">Gửi nội dung</a><a href="/members/creator/library/">Thư viện</a><a href="/members/creator/revenue-share/">Vận hành</a></nav><div class="actions"><button id="logoutBtn" class="btn" type="button">Đăng xuất</button></div></div></div></header>
  <main class="container" role="main">
    <section class="pageHead"><h1>${esc(page.title)}</h1><p class="sub">${esc(page.intro)}</p><div class="actionsRow">${page.actions.map(([href, label]) => `<a class="ghost" href="${href}">${esc(label)}</a>`).join("")}</div></section>
    <section class="grid2">${page.panels.map(([heading, items]) => `<article class="panel"><h3>${esc(heading)}</h3>${list(items)}</article>`).join("")}</section>
  </main>
  <script src="/assets/content-registry.js"></script>
  <script src="/assets/site.js"></script>
  <script src="/assets/i18n-config.js"></script>
  <script src="/assets/lang-routing.js"></script>
</body>
</html>
`;
}

function articleHtml(article) {
  const route = `/en/bai-viet/${article.slug}/`;
  const viRoute = `/bai-viet/${article.slug}/`;
  const title = `${article.title} | Nguyenlananh.com`;
  return `<!doctype html>
<html lang="en-US" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(article.description)}" />
  <link rel="canonical" href="${DOMAIN}${route}" />
  <link rel="alternate" hreflang="vi" href="${DOMAIN}${viRoute}" />
  <link rel="alternate" hreflang="en-US" href="${DOMAIN}${route}" />
  <link rel="alternate" hreflang="en" href="${DOMAIN}${route}" />
  <link rel="alternate" hreflang="x-default" href="${DOMAIN}${viRoute}" />
  <meta name="robots" content="index,follow" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(article.description)}" />
  <meta property="og:url" content="${DOMAIN}${route}" />
  <meta property="og:image" content="${DOMAIN}${article.image}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(article.description)}" />
  <meta name="twitter:image" content="${DOMAIN}${article.image}" />
  <link rel="stylesheet" href="/assets/site.css" />
  <script type="application/ld+json">
${JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.description,
      datePublished: article.published,
      dateModified: "2026-04-29",
      inLanguage: "en-US",
      mainEntityOfPage: `${DOMAIN}${route}`,
      articleSection: article.section,
      image: `${DOMAIN}${article.image}`,
      author: { "@type": "Person", name: "Nguyen Lan Anh" },
      publisher: { "@type": "Organization", name: "Nguyenlananh.com", url: DOMAIN }
    },
    null,
    2
  )}
  </script>
</head>
<body>
  <header class="topbar" role="banner"><div class="container"><div class="navwrap"><a class="brand" href="/en/"><div class="mark" aria-hidden="true"></div><div class="name"><strong>Nguyen Lan Anh</strong><span>Go inward to take your life back</span></div></a><nav class="navlinks" aria-label="Main navigation"><a href="/en/">Home</a><a href="/en/hanh-trinh/">Journey</a><a href="/en/phuong-phap/">System</a><a href="/en/bai-viet/">Writings</a><a href="/en/members/">Members</a><a href="/en/join/">Start</a></nav><div class="actions"><a class="btn" href="/en/join/">Join membership</a></div></div></div></header>
  <main class="container" role="main">
    <section class="pageHead"><p style="margin:0; font-size:13px; color:rgba(15,23,42,.6);"><a href="/en/bai-viet/">Writings</a> / ${esc(article.section)}</p><h1>${esc(article.title)}</h1><p class="sub">${esc(article.intro)}</p></section>
    <article class="panel articleBody">${article.paragraphs.map((paragraph, index) => `<p${index === article.paragraphs.length - 1 ? ' style="margin-top:18px; font-weight:600;"' : ""}>${esc(paragraph)}</p>`).join("")}</article>
    <section class="panel" style="margin-top:12px;"><h3>Continue from here</h3>${list(article.links.map(([, label]) => label))}<div class="actionsRow">${article.links.map(([href, label]) => `<a class="ghost" href="${href}">${esc(label)}</a>`).join("")}<a class="cta" href="${article.cta[0]}">${esc(article.cta[1])}</a></div></section>
  </main>
  <footer role="contentinfo"><div class="container"><div class="fwrap"><div><div style="font-weight:700; color:rgba(15,23,42,.8);">Nguyen Lan Anh</div><div>© <span id="year"></span> · Not to become someone else, but to return to what is true.</div></div><div style="display:flex; gap:6px; flex-wrap:wrap;"><a href="/en/gioi-thieu/">Story</a><a href="/en/hanh-trinh/">Journey</a><a href="/en/phuong-phap/">System</a><a href="/en/chuong-trinh/">Programs</a><a href="/en/bai-viet/">Writings</a><a href="/en/lien-he/">Contact</a></div></div><div class="legal" style="margin-top:10px; color:rgba(15,23,42,.6);"><a href="/en/chinh-sach-bao-mat/">Privacy Policy</a><a href="/en/dieu-khoan/">Terms of Use</a><a href="/en/mien-tru-trach-nhiem/">Disclaimer</a></div></div></footer>
  <script src="/assets/content-registry.js"></script>
  <script src="/assets/site.js"></script>
  <script src="/assets/i18n-config.js"></script>
  <script src="/assets/lang-routing.js"></script>
</body>
</html>
`;
}

function write(file, html) {
  const abs = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, html, "utf8");
  console.log(`repaired ${file}`);
}

for (const page of deepPages) {
  write(`members/deep/${page.slug}/index.html`, deepHtml(page));
}

for (const page of creatorPages) {
  write(`members/creator/${page.slug}/index.html`, creatorHtml(page));
}

for (const article of englishArticles) {
  write(`en/bai-viet/${article.slug}/index.html`, articleHtml(article));
}
