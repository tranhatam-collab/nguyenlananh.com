import fs from "fs";
import path from "path";

const base = "/Users/tranhatam/Documents/Devnewproject/nguyenlananh.com";

const categories = [
  {
    slug: "di-vao-ben-trong",
    title: "Đi vào bên trong",
    desc: "Nhìn thẳng vào mắc kẹt, bế tắc, vô định, khủng hoảng, các vòng lặp nội tâm để làm chủ lại đời mình.",
    articles: [
      {slug:"dieu-dang-tiec-nhat-khi-ket-thuc-mot-kiep-song", title:"Điều đáng tiếc nhất khi kết thúc một kiếp sống", excerpt:"Bài nền tảng mở hành trình."},
      {slug:"hanh-trinh-di-vao-ben-trong", title:"Hành trình đi vào bên trong", excerpt:"Từ bế tắc đến khả năng chọn lại."},
      {slug:"di-vao-ben-trong", title:"Đi vào bên trong", excerpt:"Bắt đầu từ sự thật."},
      {slug:"di-vao-ben-trong-giai-ma-nhung-gi-dang-van-hanh-ban", title:"Đi vào bên trong – giải mã những gì đang vận hành bạn", excerpt:"Nhận ra các lực chi phối ẩn."},
      {slug:"im-lang-noi-ban-van-dang-ne", title:"Im lặng nơi bạn vẫn đang né", excerpt:"Điểm né tránh chính là điểm cần nhìn."},
      {slug:"dieu-ban-dang-tranh", title:"Điều bạn đang tránh chính là điều bạn cần nhìn", excerpt:"Sự thật đứng sau vòng lặp."},
      {slug:"nhung-vong-lap-ban-chua-goi-ten", title:"Những vòng lặp bạn chưa gọi tên", excerpt:"Gọi đúng tên để gỡ mắc kẹt."},
      {slug:"co-don-khong-phai-vi-thieu-nguoi", title:"Cô đơn không phải vì thiếu người", excerpt:"Cô đơn là chưa gặp lại chính mình."},
      {slug:"chua-tung-co-huong", title:"Bạn không mất phương hướng, bạn chưa từng có hướng", excerpt:"Hướng đi xuất phát từ bên trong."},
      {slug:"thieu-su-that", title:"Bạn không thiếu động lực, bạn thiếu sự thật", excerpt:"Sự thật là nhiên liệu của thay đổi."}
    ]
  },
  {
    slug: "mon-hoc-don-dep",
    title: "Môn học dọn dẹp",
    desc: "Học qua đời sống thật — dọn dẹp, quét lá, sống cùng đồ vật, môi trường, và các tình huống thường ngày.",
    articles: [
      {slug:"mon-hoc-don-dep", title:"Môn học dọn dẹp", excerpt:"Cửa ngõ của kỷ luật và sáng tạo."},
      {slug:"mon-hoc-don-dep-tong-quan", title:"Môn học dọn dẹp tổng quan", excerpt:"Toàn cảnh môn học qua đời sống thật."},
      {slug:"truong-thanh-thong-qua-mon-hoc-don-dep", title:"Trưởng thành thông qua môn học dọn dẹp", excerpt:"Dọn dẹp là trưởng thành."},
      {slug:"quet-la-va-viec-hoc", title:"Quét lá và việc học", excerpt:"Từ việc nhỏ đến học lớn."},
      {slug:"cai-choi", title:"Cái chổi", excerpt:"Việc nhỏ làm đời sống rõ lại."},
      {slug:"gan-duc-khoi-trong", title:"Gạn đục khơi trong", excerpt:"Làm sạch để thấy rõ."},
      {slug:"moi-truong-la-nguoi-thay-vo-hinh", title:"Môi trường là người thầy vô hình", excerpt:"Không gian sống định hình nội tâm."},
      {slug:"khi-moi-truong-khong-con-phu-hop", title:"Khi môi trường không còn phù hợp", excerpt:"Nhận ra điểm cần thay đổi không gian."},
      {slug:"song-sai-nhip", title:"Bạn không mệt vì làm nhiều, bạn mệt vì sống sai nhịp", excerpt:"Nhịp sống đúng là năng lượng."},
      {slug:"song-theo-thoi-quen", title:"Bạn đang sống theo thói quen, không phải lựa chọn", excerpt:"Thức tỉnh để chọn lại."}
    ]
  },
  {
    slug: "lao-dong-sang-tao",
    title: "Lao động sáng tạo",
    desc: "Sáng tạo trong đời sống thường ngày — lao động, dòng chảy, kết nối linh hồn và vật thể.",
    articles: [
      {slug:"lao-dong-sang-tao", title:"Lao động sáng tạo", excerpt:"Không phải đầu ra, mà là cách sống."},
      {slug:"lao-dong-sang-tao-khong-phai-dau-ra-ma-la-cach-song", title:"Lao động sáng tạo — không phải đầu ra, mà là cách sống", excerpt:"Sáng tạo như hơi thở."},
      {slug:"ket-noi-sang-tao", title:"Kết nối sáng tạo", excerpt:"Liên kết các mảnh sáng tạo."},
      {slug:"hoi-sinh-su-song-tu-su-sang-tao-nguyen-so", title:"Hồi sinh sự sống từ sự sáng tạo nguyên sơ", excerpt:"Sáng tạo gốc rễ của sự sống."},
      {slug:"dong-chay-sang-tao-dong-chay-su-song", title:"Dòng chảy sáng tạo – dòng chảy sự sống", excerpt:"Khi sáng tạo và sống là một."},
      {slug:"ket-noi-linh-hon-vat-the", title:"Kết nối linh hồn vật thể", excerpt:"Đồ vật là ngôn ngữ của nội tâm."},
      {slug:"song-theo-dong-chay", title:"Sống theo dòng chảy", excerpt:"Buông để đi cùng dòng."},
      {slug:"vu-tru-vat-chat", title:"Vũ trụ vật chất", excerpt:"Quan hệ với đồ vật xung quanh."}
    ]
  },
  {
    slug: "gia-tri-noi-tai",
    title: "Giá trị nội tại",
    desc: "Giá trị bền vững không nằm ở tài sản bề mặt mà ở phẩm chất, trí tuệ bên trong, năng lực đứng vững giữa biến động.",
    articles: [
      {slug:"gia-tri-noi-tai", title:"Giá trị nội tại", excerpt:"Tài sản thật bên trong."},
      {slug:"gia-tri-cuoc-doi-ban-dang-gia-bao-nhieu", title:"Giá trị cuộc đời bạn đáng giá bao nhiêu", excerpt:"Định giá đúng đời mình."},
      {slug:"gia-tri-nao-la-vinh-cuu-truoc-song-gio", title:"Giá trị nào là vĩnh cửu trước sóng gió", excerpt:"Tìm giá trị không bị phá hủy."},
      {slug:"khoi-tu-tam", title:"Khởi từ tâm", excerpt:"Điểm khởi sinh của vòng lặp."},
      {slug:"hieu-cuoc-doi-minh", title:"Hiểu cuộc đời mình", excerpt:"Không cần thay đổi, cần hiểu."},
      {slug:"ban-khong-thieu-kien-thuc", title:"Bạn không thiếu kiến thức, bạn thiếu sự rõ ràng", excerpt:"Rõ ràng hơn kiến thức."},
      {slug:"chi-can-dung", title:"Cuộc đời bạn không cần tối ưu, chỉ cần đúng", excerpt:"Đúng là đủ."},
      {slug:"co-nguoi-can-dung-lai", title:"Không phải ai cũng cần phát triển, có người cần dừng lại", excerpt:"Dừng lại cũng là hành trình."}
    ]
  },
  {
    slug: "dau-tu-ban-than",
    title: "Đầu tư bản thân",
    desc: "Đầu tư cho chính mình — học tập, nhận thức, tự do tài chính, và kiến tạo một đời sống ý nghĩa hơn.",
    articles: [
      {slug:"dau-tu-ban-than", title:"Đầu tư bản thân", excerpt:"Đầu tư thật cho chính mình."},
      {slug:"dau-tu-ban-than-hoc-tap-nhan-thuc-cao-hon", title:"Đầu tư bản thân – học tập nhận thức cao hơn", excerpt:"Học để nhìn sâu hơn."},
      {slug:"dau-tu-ban-than-khong-ao-tuong-doi-doi", title:"Đầu tư bản thân – không ảo tưởng đổi đời", excerpt:"Thực tế trong đầu tư."},
      {slug:"dau-tu-hien-tai-tu-do-tuong-lai", title:"Đầu tư hiện tại – tự do tương lai", excerpt:"Tự do bắt đầu từ hiện tại."},
      {slug:"tu-55-trieu-den-tu-do", title:"Từ 55 triệu đến tự do", excerpt:"Con số và câu chuyện thật."},
      {slug:"kien-tao-mot-doi-song-y-nghia", title:"Kiến tạo một đời sống ý nghĩa", excerpt:"Xây đời sống có ý nghĩa."},
      {slug:"minh-dang-di-con-duong-gi", title:"Mình đang đi con đường gì", excerpt:"Nhìn lại hướng đi."},
      {slug:"bon-truc-thay-doi", title:"Bốn trục thay đổi", excerpt:"Quan sát, cảm nhận, hành động, chuyển hóa."}
    ]
  },
  {
    slug: "du-an-nhat-ky",
    title: "Dự án nhật ký",
    desc: "Các dự án thực hành — Bước, 37 ngày, và những hành trình ghi lại đời sống thật qua từng ngày.",
    articles: [
      {slug:"du-an-nhat-ky", title:"Dự án nhật ký", excerpt:"Ghi lại đời sống qua từng ngày."},
      {slug:"du-an-buoc", title:"Dự án BƯỚC", excerpt:"Mỗi bước là một lựa chọn."},
      {slug:"du-an-37-ngay", title:"Dự án 37 ngày", excerpt:"Hành trình 37 ngày thực hành."},
      {slug:"nhat-ky-37-ngay-lam-chu-ngay-1", title:"Nhật ký 37 ngày – làm chủ ngày 1", excerpt:"Bắt đầu từ ngày đầu tiên."},
      {slug:"ngoi-nha-thu-2", title:"Ngôi nhà thứ 2", excerpt:"Không gian sống thứ hai."},
      {slug:"ngoi-nha-thu-hai-noi-ban-dang-song-moi-ngay", title:"Ngôi nhà thứ hai – nơi bạn đang sống mỗi ngày", excerpt:"Nơi bạn sống thật sự."}
    ]
  }
];

function buildPage(cat) {
  const articlesHtml = cat.articles.map(a =>
    `<article class="panel" style="margin-bottom:10px;"><h3><a href="/bai-viet/${a.slug}/">${a.title}</a></h3><p>${a.excerpt}</p></article>`
  ).join("\n    ");

  return `<!doctype html>
<html lang="vi" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>${cat.title} | Chuyên mục | Nguyenlananh.com</title>
  <meta name="description" content="${cat.desc}" />
  <link rel="canonical" href="https://www.nguyenlananh.com/bai-viet/chuyen-muc/${cat.slug}/" />
  <link rel="alternate" hreflang="vi" href="https://www.nguyenlananh.com/bai-viet/chuyen-muc/${cat.slug}/" />
  <link rel="alternate" hreflang="en-US" href="https://www.nguyenlananh.com/en/bai-viet/chuyen-muc/${cat.slug}/" />
  <link rel="alternate" hreflang="en" href="https://www.nguyenlananh.com/en/bai-viet/chuyen-muc/${cat.slug}/" />
  <link rel="alternate" hreflang="x-default" href="https://www.nguyenlananh.com/bai-viet/chuyen-muc/${cat.slug}/" />
  <meta name="robots" content="index,follow" />
  <link rel="stylesheet" href="/assets/site.css" />
  <meta property="og:title" content="${cat.title} | Chuyên mục | Nguyenlananh.com" />
  <meta property="og:description" content="${cat.desc}" />
  <meta property="og:url" content="https://www.nguyenlananh.com/bai-viet/chuyen-muc/${cat.slug}/" />
  <meta property="og:image" content="https://www.nguyenlananh.com/assets/og/og-homepage.svg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="https://www.nguyenlananh.com/assets/og/og-homepage.svg" />
  <script type="application/ld+json">{
    "@context":"https://schema.org",
    "@type":"CollectionPage",
    "name":"${cat.title}",
    "url":"https://www.nguyenlananh.com/bai-viet/chuyen-muc/${cat.slug}/",
    "description":"${cat.desc}",
    "isPartOf":{"@type":"WebSite","name":"Nguyenlananh.com","url":"https://www.nguyenlananh.com/"}
  }</script>
</head>
<body>
  <a class="skip" href="#main">Bỏ qua điều hướng</a>
  <header class="topbar" role="banner"><div class="container"><div class="navwrap"><a class="brand" href="/" aria-label="Nguyễn Lan Anh — về trang chủ"><span class="mark" aria-hidden="true"><img class="markIcon" src="/assets/brand/logo-mark.svg" alt="" width="40" height="40" loading="eager" decoding="async" aria-hidden="true" role="presentation"/></span><span class="name"><strong>Nguyễn Lan Anh</strong><span class="tagline">Đi vào bên trong để tái thiết cuộc đời</span></span></a><nav class="navlinks" aria-label="Điều hướng chính"><a href="/hanh-trinh/">Hành trình</a><a href="/phuong-phap/">Hệ thống</a><a href="/bai-viet/">Bài viết</a><a href="/members/">Thành viên</a></nav><div class="actions"><a class="btn" href="/join/">Đăng ký thành viên</a><button class="hamburger" type="button" id="hamburger" aria-label="Mở menu" aria-controls="drawer" aria-expanded="false"><span aria-hidden="true"></span></button></div></div></div>
  <div class="drawer" id="drawer" role="dialog" aria-modal="false" aria-label="Điều hướng"><div class="dhead"><div><div style="font-weight:700; font-size:13px;">Điều hướng</div><div class="hint">Chọn một mục để đi tới.</div></div><button class="btn" type="button" id="closeDrawer" aria-label="Đóng menu">Đóng</button></div><nav aria-label="Điều hướng di động"><a href="/hanh-trinh/" data-close>Hành trình</a><a href="/phuong-phap/" data-close>Hệ thống</a><a href="/bai-viet/" data-close>Bài viết</a><a href="/members/" data-close>Thành viên</a><a href="/join/" data-close class="drawerCta">Đăng ký</a></nav><div class="foot">Đi chậm để đi sâu. Đi thật để đi xa.</div></div>
</header>

  <main id="main" class="container" role="main">
    <nav aria-label="Breadcrumb" style="font-size:13px; color:rgba(42,24,16,.6); margin-bottom:10px;"><a href="/">Trang chủ</a> › <a href="/bai-viet/">Bài viết</a> › <span aria-current="page">${cat.title}</span></nav>
    <section class="pageHead">
      <h1>${cat.title}</h1>
      <p class="sub">${cat.desc}</p>
    </section>

    <section aria-label="Bài viết trong chuyên mục">
      <h2 style="font-size:16px; margin-bottom:12px;">Các bài viết</h2>
      ${articlesHtml}
    </section>

    <section class="panel" style="margin-top:18px;">
      <h3>Khám phá thêm</h3>
      <div class="actionsRow" style="flex-wrap:wrap; gap:8px;">
        <a class="ghost" href="/bai-viet/">← Tất cả bài viết</a>
        <a class="ghost" href="/hanh-trinh/">Hành trình</a>
        <a class="cta" href="/join/">Đồng hành miễn phí</a>
      </div>
    </section>
  </main>

  <footer role="contentinfo"><div class="container"><div class="fwrap"><div><div style="font-weight:700; color:rgba(42,24,16,.8);">Nguyễn Lan Anh</div><div>© <span id="year"></span> · Không phải để trở thành ai đó. Mà để trở về đúng là mình.</div></div><div style="display:flex; gap:6px; flex-wrap:wrap;"><a href="/gioi-thieu/">Giới thiệu</a><a href="/hanh-trinh/">Hành trình</a><a href="/phuong-phap/">Hệ thống</a><a href="/chuong-trinh/">Chương trình</a><a href="/bai-viet/">Bài viết</a><a href="/lien-he/">Liên hệ</a></div></div><div class="legal" style="margin-top:10px; color:rgba(42,24,16,.6);"><a href="/chinh-sach-bao-mat/">Chính sách bảo mật</a><a href="/dieu-khoan/">Điều khoản sử dụng</a><a href="/mien-tru-trach-nhiem/">Miễn trừ trách nhiệm</a></div></div></footer>

  <script src="/assets/site.js"></script>
  <script src="/assets/lang-routing.js"></script>
</body>
</html>`;
}

for (const cat of categories) {
  const dir = path.join(base, "bai-viet", "chuyen-muc", cat.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), buildPage(cat));
  console.log("Created: bai-viet/chuyen-muc/" + cat.slug + "/index.html");
}

console.log("All category pages created.");
