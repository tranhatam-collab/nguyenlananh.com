# KẾ HOẠCH CẬP NHẬT TOÀN DIỆN — NGUYENLANANH.COM
**Phiên bản:** 1.0 — 2026-04-15  
**Dành cho:** Team Dev / Content / SEO  
**Repository:** https://github.com/tranhatam-collab/nguyenlananh.com  
**Live site:** https://www.nguyenlananh.com/

---

## MỤC LỤC

1. [Tổng quan lỗi & vấn đề hiện tại](#1-tổng-quan-lỗi--vấn-đề-hiện-tại)
2. [Ưu tiên thực thi](#2-ưu-tiên-thực-thi)
3. [PHẦN A — Thanh điều hướng (Navbar)](#phần-a--thanh-điều-hướng-navbar)
4. [PHẦN B — Chân trang (Footer)](#phần-b--chân-trang-footer)
5. [PHẦN C — Bộ chọn ngôn ngữ (Language Switcher)](#phần-c--bộ-chọn-ngôn-ngữ-language-switcher)
6. [PHẦN D — Responsive / Tablet / Mobile](#phần-d--responsive--tablet--mobile)
7. [PHẦN E — SEO từng trang](#phần-e--seo-từng-trang)
8. [PHẦN F — Hình ảnh minh hoạ bài viết](#phần-f--hình-ảnh-minh-hoạ-bài-viết)
9. [PHẦN G — Kiểm tra nội dung bài viết](#phần-g--kiểm-tra-nội-dung-bài-viết)
10. [PHẦN H — Kỹ thuật & hiệu năng](#phần-h--kỹ-thuật--hiệu-năng)
11. [Checklist deploy cuối](#checklist-deploy-cuối)

---

## 1. TỔNG QUAN LỖI & VẤN ĐỀ HIỆN TẠI

Sau khi rà soát toàn bộ repo, dưới đây là danh sách tất cả các vấn đề phát hiện được, chia theo mức độ nghiêm trọng.

### 🔴 NGHIÊM TRỌNG — ảnh hưởng UX trực tiếp

| # | Vấn đề | File ảnh hưởng |
|---|--------|----------------|
| 1 | **Menu điều hướng không nhất quán** — mỗi nhóm trang dùng một bộ link khác nhau | Tất cả các trang |
| 2 | **Chân trang không nhất quán** — `index.html` có footer khác với các trang con; một số trang thiếu links pháp lý | Tất cả trang con |
| 3 | **Nút hamburger bị che khuất bởi nút "Bắt đầu"** trên mobile — người dùng không tìm thấy menu | `index.html`, mobile view |
| 4 | **Nhiều trang con hoàn toàn không có hamburger menu** — mobile drawer không tồn tại | `bai-viet/index.html`, hầu hết bài viết, `hanh-trinh/index.html` thiếu drawer ở footer |
| 5 | **Language switcher tạo ra UI kép** — trang chủ vừa có chip VI/EN trong header vừa bị `lang-routing.js` inject thêm widget nổi ở góc phải dưới màn hình | `index.html` + tất cả |

### 🟠 QUAN TRỌNG — ảnh hưởng SEO và tính chuyên nghiệp

| # | Vấn đề | File ảnh hưởng |
|---|--------|----------------|
| 6 | **Trang `hanh-trinh/` thiếu OG image** | `hanh-trinh/index.html` |
| 7 | **Twitter Card dùng `summary` thay vì `summary_large_image`** trên trang chủ | `index.html` |
| 8 | **Một số bài viết thiếu JSON-LD Article schema** | Nhiều bài trong `/bai-viet/` |
| 9 | **Breakpoint navbar không đồng nhất**: homepage dùng `880px`, các trang khác dùng `920px` trong `site.css` | `index.html` vs `site.css` |
| 10 | **Không có tablet breakpoint riêng** (768px–880px) — grid nhảy thẳng từ 1 cột lên 2 cột | `site.css`, `index.html` |
| 11 | **Nhiều bài viết thiếu hình ảnh minh hoạ** hoặc dùng ảnh chung không phù hợp | Xem danh sách PHẦN F |

### 🟡 CẦN CẢI THIỆN — UX và nội dung

| # | Vấn đề | File ảnh hưởng |
|---|--------|----------------|
| 12 | **Ngôn ngữ trong nút chọn ngôn ngữ chỉ có mã** ("VI", "EN") — thiếu tên đầy đủ và cờ quốc gia | `lang-routing.js`, `index.html` |
| 13 | **Một số trang brand subtitle không nhất quán** — hanh-trinh dùng "Giữ nhịp. Dừng lại. Đi tiếp." thay vì tagline chính | `hanh-trinh/index.html` |
| 14 | **Footer thiếu link đến `/members/` và `/join/`** trên hầu hết trang con | Tất cả trang có `site.css` |
| 15 | **Slug bài viết `[slug]` tồn tại như một folder rỗng** | `/bai-viet/[slug]/` |
| 16 | **Một số link nội bộ trong bài viết trỏ đến `/chuong-trinh/`** nhưng navigation chính không có link này | Nhiều bài viết |

---

## 2. ƯU TIÊN THỰC THI

```
P0 — Làm ngay, trước khi push live
P1 — Sprint 1 (trong 1–3 ngày)
P2 — Sprint 2 (trong 1–2 tuần)
P3 — Sprint 3 / backlog
```

---

## PHẦN A — THANH ĐIỀU HƯỚNG (NAVBAR)

### A1. Chuẩn hoá menu điều hướng toàn site

**Vấn đề phát hiện:**

Hiện tại website có **3 phiên bản menu khác nhau** đang chạy song song:

- **Phiên bản 1** (trang chủ, một số trang bài viết mới):  
  `Trang chủ | Hành trình | Phương pháp | Bài viết | Thành viên | Bắt đầu`

- **Phiên bản 2** (hanh-trinh, phuong-phap, nhiều bài viết cũ):  
  `Trang chủ | Hành trình | Phương pháp | Chương trình | Bài viết | Liên hệ`  
  + có thêm link `EN` hardcode trong `<nav>` của `hanh-trinh/index.html`

- **Phiên bản 3** (bai-viet/index.html):  
  `Trang chủ | Hành trình | Phương pháp | Bài viết | Thành viên | Bắt đầu`  
  nhưng không có hamburger/drawer

**Giải pháp — Menu chuẩn duy nhất:**

```
Desktop nav links:   Trang chủ | Hành trình | Phương pháp | Bài viết | Thành viên | Bắt đầu
Mobile drawer links: Trang chủ | Hành trình | Phương pháp | Bài viết | Thành viên | Bắt đầu
Actions area:        [🌐 Ngôn ngữ dropdown] [☰ Hamburger]
```

**Danh sách tất cả file cần đồng bộ nav:**

```
index.html                                          ← đã gần đúng, chỉnh mobile priority
hanh-trinh/index.html                               ← sửa nav links + xóa EN hardcode
phuong-phap/index.html                              ← kiểm tra và sửa
bai-viet/index.html                                 ← thêm hamburger + drawer
bai-viet/[slug]/index.html (tất cả ~40 bài viết)   ← đồng bộ
members/index.html                                  ← kiểm tra
join/index.html                                     ← đã gần đúng
gioi-thieu/index.html                               ← kiểm tra
lien-he/index.html                                  ← kiểm tra
chuong-trinh/index.html                             ← kiểm tra
faq/index.html                                      ← kiểm tra
du-an/index.html và các trang con                   ← kiểm tra
en/* (toàn bộ EN pages)                             ← đồng bộ tương tự
```

### A2. Ưu tiên hiển thị Hamburger trước nút "Bắt đầu" trên mobile

**Vấn đề:** Trên màn hình nhỏ, thứ tự hiển thị trong `.actions` là:  
`[Chip VI] [Chip EN] [Bắt đầu] [☰]`  
→ Nút "Bắt đầu" chiếm diện tích và đẩy hamburger ra ngoài rìa, người dùng khó thấy menu.

**Giải pháp:**

Trên mobile (< 880px), ẩn nút "Bắt đầu" trong `.actions`, chỉ hiện hamburger:

```css
/* Trong site.css */
@media (max-width: 879px) {
  .actions .btn-start { display: none; }   /* Ẩn nút Bắt đầu */
  .hamburger { display: grid; }            /* Đảm bảo hamburger luôn hiện */
}
@media (min-width: 880px) {
  .hamburger { display: none; }
  .actions .btn-start { display: inline-flex; }
}
```

Thêm class `btn-start` vào nút "Bắt đầu" trong HTML để CSS có thể target chính xác:

```html
<a class="btn btn-start" href="/join/">Bắt đầu</a>
```

**Thứ tự hiển thị đúng trên mobile:**

```
[🌐 Ngôn ngữ] [☰ Menu]
```

**Thứ tự hiển thị trên desktop:**

```
[🌐 Ngôn ngữ] [Bắt đầu]   ← hamburger ẩn
```

### A3. Thêm hamburger/drawer cho tất cả trang hiện thiếu

**Các trang thiếu hoàn toàn mobile drawer:**
- `bai-viet/index.html`
- Hầu hết tất cả bài viết con trong `/bai-viet/*/index.html`
- `phuong-phap/index.html`
- `gioi-thieu/index.html`
- `lien-he/index.html`
- `faq/index.html`

**Giải pháp:** Tạo một snippet HTML chuẩn cho header + drawer và apply đồng bộ tất cả trang.  
`site.js` đã có logic `openDrawer/shutDrawer` hoàn chỉnh — chỉ cần đảm bảo HTML tồn tại đúng cấu trúc trên mỗi trang.

**Cấu trúc header chuẩn:**

```html
<header class="topbar" role="banner">
  <div class="container">
    <div class="navwrap">
      <!-- Brand -->
      <a class="brand" href="/" aria-label="Về trang chủ">
        <div class="mark" aria-hidden="true"></div>
        <div class="name">
          <strong>Nguyễn Lan Anh</strong>
          <span>Đi vào bên trong để làm chủ lại cuộc đời</span>
        </div>
      </a>

      <!-- Desktop nav -->
      <nav class="navlinks" aria-label="Điều hướng chính">
        <a href="/">Trang chủ</a>
        <a href="/hanh-trinh/">Hành trình</a>
        <a href="/phuong-phap/">Phương pháp</a>
        <a href="/bai-viet/">Bài viết</a>
        <a href="/members/">Thành viên</a>
        <a href="/join/">Bắt đầu</a>
      </nav>

      <!-- Actions -->
      <div class="actions">
        <!-- Language dropdown (xem PHẦN C) -->
        <div class="lang-dropdown" id="langDropdown" aria-label="Chọn ngôn ngữ">
          <button class="lang-toggle" type="button" id="langToggle" aria-expanded="false" aria-haspopup="listbox">
            <span class="lang-current">🇻🇳 Tiếng Việt</span>
            <svg><!-- chevron --></svg>
          </button>
          <ul class="lang-menu" role="listbox">
            <li role="option" data-lang="vi" aria-selected="true">🇻🇳 Tiếng Việt</li>
            <li role="option" data-lang="en" aria-selected="false">🇺🇸 English</li>
          </ul>
        </div>

        <!-- Desktop CTA -->
        <a class="btn btn-start" href="/join/">Bắt đầu</a>

        <!-- Mobile hamburger -->
        <button class="hamburger" type="button" id="hamburger"
                aria-label="Mở menu" aria-controls="drawer" aria-expanded="false">
          <span aria-hidden="true"></span>
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile drawer -->
  <div class="drawer" id="drawer" role="dialog" aria-modal="false" aria-label="Menu điều hướng">
    <div class="dhead">
      <div>
        <div style="font-weight:700;font-size:13px;">Menu</div>
        <div class="hint">Chọn một mục để đi tới.</div>
      </div>
      <button class="btn" type="button" id="closeDrawer" aria-label="Đóng menu">Đóng</button>
    </div>
    <nav aria-label="Điều hướng di động">
      <a href="/" data-close>Trang chủ</a>
      <a href="/hanh-trinh/" data-close>Hành trình</a>
      <a href="/phuong-phap/" data-close>Phương pháp</a>
      <a href="/bai-viet/" data-close>Bài viết</a>
      <a href="/members/" data-close>Thành viên</a>
      <a href="/join/" data-close>Bắt đầu</a>
    </nav>
    <div class="foot">Mọi thứ ở đây đi chậm. Vừa đủ. Để bạn không bỏ rơi chính mình.</div>
  </div>
</header>
```

---

## PHẦN B — CHÂN TRANG (FOOTER)

### B1. Vấn đề hiện tại

**Phiên bản footer A** (trang chủ `index.html`):
```
Trang chủ | Hành trình | Phương pháp | Bài viết | Thành viên | Bắt đầu
Legal: Chính sách bảo mật | Điều khoản | Miễn trừ
```

**Phiên bản footer B** (hanh-trinh, bài viết, trang con):
```
Giới thiệu | Hành trình | Phương pháp | Chương trình | Bài viết | Liên hệ
Legal: Chính sách bảo mật | Điều khoản | Miễn trừ  ← có ở một số trang
```

**Lỗi:** `hanh-trinh/index.html` thiếu hoàn toàn phần `legal` trong footer.  
**Lỗi:** Nhiều bài viết thiếu links đến `/members/` và `/join/`.

### B2. Footer chuẩn — áp dụng cho toàn site

```html
<footer role="contentinfo">
  <div class="container">
    <div class="fwrap">
      <!-- Brand & tagline -->
      <div>
        <div style="font-weight:700; color:rgba(15,23,42,.80);">Nguyễn Lan Anh</div>
        <div>© <span id="year"></span> · Đi vào bên trong để làm chủ lại cuộc đời.</div>
      </div>

      <!-- Navigation links -->
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <a href="/">Trang chủ</a>
        <a href="/hanh-trinh/">Hành trình</a>
        <a href="/phuong-phap/">Phương pháp</a>
        <a href="/bai-viet/">Bài viết</a>
        <a href="/members/">Thành viên</a>
        <a href="/join/">Bắt đầu</a>
        <a href="/lien-he/">Liên hệ</a>
      </div>
    </div>

    <!-- Legal links -->
    <div class="legal" style="margin-top:10px; color:rgba(15,23,42,.55);">
      <a href="/chinh-sach-bao-mat/">Chính sách bảo mật</a>
      <a href="/dieu-khoan/">Điều khoản sử dụng</a>
      <a href="/mien-tru-trach-nhiem/">Miễn trừ trách nhiệm</a>
    </div>
  </div>
</footer>
```

**Lưu ý:** Tagline footer chuẩn thống nhất là `"Đi vào bên trong để làm chủ lại cuộc đời."` — xoá các biến thể khác như "Không phải để trở thành ai đó..." vì không nhất quán với brand message chính.

### B3. Danh sách trang cần cập nhật footer

Cần replace footer trên TẤT CẢ các trang sau:

```
hanh-trinh/index.html           ← lỗi thiếu legal
phuong-phap/index.html
bai-viet/index.html
gioi-thieu/index.html
lien-he/index.html
chuong-trinh/index.html
faq/index.html
members/index.html
join/index.html                 ← kiểm tra lại
du-an/*.html
bai-viet/*/index.html (tất cả ~40 bài)
en/*/index.html (tất cả EN pages)
```

---

## PHẦN C — BỘ CHỌN NGÔN NGỮ (LANGUAGE SWITCHER)

### C1. Vấn đề hiện tại

1. **UI kép:** Trang chủ có sẵn `.lang { .chip[VI] .chip[EN] }` trong header. Nhưng `lang-routing.js` gọi `installSwitch()` sẽ **luôn luôn** inject thêm một widget nổi (fixed, bottom-right) trên **mọi trang** — kể cả trang chủ đã có sẵn UI. → Kết quả: trang chủ có 2 language switcher.

2. **Thiếu cờ và tên đầy đủ:** Các nút chỉ hiển thị `"VI"` và `"EN-US"` — không có cờ biểu tượng, không có tên ngôn ngữ đầy đủ. Khi mở rộng thêm ngôn ngữ (Nhật, Hàn, Pháp...) sẽ không scalable.

3. **Không đồng nhất:** Trang chủ dùng chip inline, các trang khác dùng floating widget — trải nghiệm không đồng nhất.

### C2. Giải pháp — Language Dropdown chuẩn

**Thay thế hoàn toàn cả chip buttons lẫn floating widget** bằng một dropdown đơn nhất, hiện trong header của mọi trang:

**CSS bổ sung vào `site.css`:**

```css
/* Language Dropdown */
.lang-dropdown {
  position: relative;
}
.lang-toggle {
  display: flex; align-items: center; gap: 6px;
  border: 1px solid var(--line);
  background: rgba(255,255,255,.80);
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(2,6,23,.06);
  transition: box-shadow .12s ease;
  white-space: nowrap;
}
.lang-toggle:hover { box-shadow: 0 6px 18px rgba(2,6,23,.10); }
.lang-toggle .chevron {
  width: 14px; height: 14px;
  transition: transform .15s ease;
}
.lang-dropdown.open .chevron { transform: rotate(180deg); }

.lang-menu {
  position: absolute; top: calc(100% + 6px); right: 0;
  min-width: 160px;
  background: rgba(255,255,255,.96);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: 0 14px 40px rgba(2,6,23,.12);
  backdrop-filter: blur(12px);
  padding: 6px;
  list-style: none;
  margin: 0;
  opacity: 0; pointer-events: none;
  transform: translateY(-6px);
  transition: opacity .15s ease, transform .15s ease;
  z-index: 70;
}
.lang-dropdown.open .lang-menu {
  opacity: 1; pointer-events: auto;
  transform: translateY(0);
}
.lang-menu li {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  cursor: pointer;
  color: rgba(15,23,42,.80);
  transition: background .12s ease;
}
.lang-menu li:hover { background: rgba(124,58,237,.08); }
.lang-menu li[aria-selected="true"] {
  background: rgba(124,58,237,.10);
  color: rgba(15,23,42,.95);
  font-weight: 600;
}
```

**Cập nhật `lang-routing.js`:**

```javascript
// Xoá hàm installSwitch() (floating widget)
// Thay bằng wireLangDropdown():

function wireLangDropdown() {
  const dropdown = document.getElementById('langDropdown');
  const toggle = document.getElementById('langToggle');
  const menu = document.querySelector('.lang-menu');
  const current = getCurrentLang();

  if (!dropdown || !toggle || !menu) return;

  // Set active state
  menu.querySelectorAll('[data-lang]').forEach(item => {
    const isActive = item.dataset.lang === current;
    item.setAttribute('aria-selected', isActive ? 'true' : 'false');
    if (isActive) {
      const flag = item.querySelector('.flag') || item;
      toggle.querySelector('.lang-current').textContent = item.textContent.trim();
    }
  });

  // Toggle open/close
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Select language
  menu.querySelectorAll('[data-lang]').forEach(item => {
    item.addEventListener('click', () => {
      const lang = item.dataset.lang;
      dropdown.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      goTo(lang);
    });
  });

  // Close on outside click
  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdown.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}
```

**HTML language dropdown chuẩn** (thay thế `.lang { .chip }` trên trang chủ và bổ sung vào mọi trang):

```html
<div class="lang-dropdown" id="langDropdown" aria-label="Chọn ngôn ngữ">
  <button class="lang-toggle" type="button" id="langToggle"
          aria-expanded="false" aria-haspopup="listbox">
    <span class="lang-current">🇻🇳 Tiếng Việt</span>
    <svg class="chevron" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 4.5L7 9.5L12 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  </button>
  <ul class="lang-menu" role="listbox" aria-label="Ngôn ngữ">
    <li role="option" data-lang="vi" aria-selected="true">🇻🇳 Tiếng Việt</li>
    <li role="option" data-lang="en" aria-selected="false">🇺🇸 English</li>
    <!-- Dễ dàng thêm ngôn ngữ mới ở đây: -->
    <!-- <li role="option" data-lang="ja" aria-selected="false">🇯🇵 日本語</li> -->
    <!-- <li role="option" data-lang="ko" aria-selected="false">🇰🇷 한국어</li> -->
    <!-- <li role="option" data-lang="fr" aria-selected="false">🇫🇷 Français</li> -->
  </ul>
</div>
```

**Xoá khỏi `index.html`:** Bỏ toàn bộ block `.lang { .chip[data-lang=vi] .chip[data-lang=en] }` cũ.

---

## PHẦN D — RESPONSIVE / TABLET / MOBILE

### D1. Thống nhất breakpoints

Hiện tại có sự không đồng nhất giữa các file:
- `index.html` (inline CSS): breakpoint `880px`
- `site.css`: breakpoint `920px`

**Quyết định chuẩn:** Dùng `880px` cho desktop breakpoint trên mọi file, cập nhật `site.css`.

### D2. Thêm tablet breakpoint (600px – 879px)

Hiện tại không có breakpoint tablet. Grid nhảy từ 1 cột (mobile) thẳng lên 2 cột (desktop ≥880px). Trên tablet (768px–879px), layout bị thiếu.

**Bổ sung vào `site.css`:**

```css
/* Tablet: 600px – 879px */
@media (min-width: 600px) and (max-width: 879px) {
  .grid2 { grid-template-columns: 1fr 1fr; }
  .stationGrid { grid-template-columns: 1fr 1fr; }
  .wGrid { grid-template-columns: 1fr 1fr; }
  .pricingGrid { grid-template-columns: 1fr 1fr; }
  /* Hero: trên tablet vẫn stack dọc, nhưng tăng padding */
  .heroGrid { gap: 20px; }
  /* Actions row cho tablet */
  .actions .btn-start { display: none; }
  .hamburger { display: grid; }
}

/* Desktop: ≥ 880px */
@media (min-width: 880px) {
  .navlinks { display: flex; }
  .hamburger { display: none; }
  .drawer { display: none; }
  .heroGrid { grid-template-columns: 1.35fr .65fr; }
  .grid2 { grid-template-columns: 1fr 1fr; }
  .stationGrid { grid-template-columns: 1fr 1fr; }
  .wGrid { grid-template-columns: 1fr 1fr; }
  .contactGrid { grid-template-columns: 1fr 1fr; }
  .fwrap { flex-direction: row; align-items: center; }
  .actions .btn-start { display: inline-flex; }
}
```

### D3. Cập nhật breakpoint trong `site.css` từ `920px` → `880px`

File `site.css` hiện dùng `920px`:
```css
/* CŨ — trong site.css dòng 277 */
@media (min-width: 920px) { ... }

/* MỚI — đổi thành */
@media (min-width: 880px) { ... }
```

### D4. Kiểm tra mobile (< 600px)

- Tất cả grid: 1 cột
- `.heroGrid`: 1 cột, stack dọc
- `.navlinks`: ẩn
- `.hamburger`: hiện
- `.btn-start` trong `.actions`: ẩn
- Language dropdown: hiện, collapse về icon nhỏ hơn nếu cần
- Footer `.fwrap`: flex-direction column

---

## PHẦN E — SEO TỪNG TRANG

### E1. Checklist SEO cơ bản cho mọi trang

Mỗi trang cần có đầy đủ:

```html
<!-- Title: tối đa 60 ký tự, bao gồm thương hiệu -->
<title>[Tên trang] | Nguyenlananh.com</title>

<!-- Meta description: 120–160 ký tự -->
<meta name="description" content="..." />

<!-- Canonical -->
<link rel="canonical" href="https://www.nguyenlananh.com/[path]/" />

<!-- hreflang -->
<link rel="alternate" hreflang="vi" href="https://www.nguyenlananh.com/[path]/" />
<link rel="alternate" hreflang="en" href="https://www.nguyenlananh.com/en/[path]/" />
<link rel="alternate" hreflang="x-default" href="https://www.nguyenlananh.com/" />

<!-- Open Graph -->
<meta property="og:type" content="website" /> <!-- hoặc "article" cho bài viết -->
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:url" content="https://www.nguyenlananh.com/[path]/" />
<meta property="og:image" content="https://www.nguyenlananh.com/assets/og/og-[tên].svg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="Nguyễn Lan Anh" />
<meta property="og:locale" content="vi_VN" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="..." />
```

### E2. SEO theo từng trang — vấn đề cụ thể

| Trang | Vấn đề SEO | Hành động |
|-------|-----------|-----------|
| `/` (trang chủ) | Twitter card dùng `summary` thay vì `summary_large_image` | Đổi thành `summary_large_image` |
| `/hanh-trinh/` | Thiếu OG image, OG type | Thêm `og:image` + `og:image:width/height`, thêm `og:locale` |
| `/phuong-phap/` | Kiểm tra đủ OG/Twitter | Audit toàn bộ |
| `/bai-viet/` | Thiếu OG image, `og:locale` | Thêm `og:image` |
| `/members/` | Kiểm tra `robots` (nên `noindex` nếu cần auth) | Xem xét `noindex` cho trang dashboard |
| `/join/` | Kiểm tra đủ tags | Audit |
| Tất cả `/bai-viet/*/` | Một số thiếu JSON-LD Article schema | Xem E3 |

### E3. JSON-LD Article Schema cho bài viết

Mọi bài viết con cần có JSON-LD theo mẫu sau:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Tiêu đề bài viết]",
  "description": "[Mô tả 120-160 ký tự]",
  "datePublished": "YYYY-MM-DD",
  "dateModified": "YYYY-MM-DD",
  "inLanguage": "vi",
  "mainEntityOfPage": "https://www.nguyenlananh.com/bai-viet/[slug]/",
  "articleSection": "[Chủ đề: Đi vào bên trong / Môn học dọn dẹp / Lao động sáng tạo / ...]",
  "image": "https://www.nguyenlananh.com/assets/og/og-[category].svg",
  "author": {
    "@type": "Person",
    "name": "Nguyễn Lan Anh",
    "url": "https://www.nguyenlananh.com/"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Nguyenlananh.com",
    "url": "https://www.nguyenlananh.com/"
  }
}
```

### E4. Bài viết thiếu JSON-LD — cần bổ sung

Kiểm tra và bổ sung JSON-LD cho các bài viết chưa có:

```
bai-viet/khoi-tu-tam/                         ← THIẾU JSON-LD
bai-viet/hanh-trinh-di-vao-ben-trong/         ← kiểm tra
bai-viet/nhung-vong-lap-ban-chua-goi-ten/     ← kiểm tra
bai-viet/gia-dinh-khong-chi-la-noi-ta-lon-len/ ← kiểm tra
bai-viet/khi-moi-truong-khong-con-phu-hop/    ← kiểm tra
bai-viet/neu-minh-sai-thi-sao/                ← kiểm tra
bai-viet/truong-thanh-thong-qua-mon-hoc-don-dep/ ← kiểm tra
bai-viet/vu-tru-vat-chat/                     ← kiểm tra
bai-viet/cai-choi/                            ← kiểm tra
bai-viet/am-thanh-tu-than-*/                  ← kiểm tra
bai-viet/dieu-tre-em-*/                       ← kiểm tra
```

### E5. OG Image — mapping chuẩn theo danh mục

| Danh mục | OG Image | Trang áp dụng |
|---------|---------|---------------|
| Trang chủ | `og-homepage.svg` | `/` |
| Đi vào bên trong | `og-di-vao-ben-trong.svg` | Tất cả bài thuộc danh mục này |
| Môn học dọn dẹp | `og-mon-hoc-don-dep.svg` | Tất cả bài thuộc danh mục này |
| Lao động sáng tạo | `og-lao-dong-sang-tao.svg` | Tất cả bài thuộc danh mục này |
| Giá trị nội tại | `og-gia-tri-noi-tai.svg` | Tất cả bài thuộc danh mục này |
| Đầu tư bản thân | `og-dau-tu-ban-than.svg` | Tất cả bài thuộc danh mục này |
| Dự án nhật ký | `og-du-an-nhat-ky.svg` | Tất cả bài thuộc danh mục này |
| Gia đình / gốc rễ | `og-gia-dinh-goc-re.svg` | Bài về gia đình |
| Vòng lặp chưa gọi tên | `og-vong-lap-chua-goi-ten.svg` | Bài về vòng lặp |
| Âm thanh tự thân | `og-am-thanh-tu-than.svg` | Bài về âm thanh |
| Trẻ em / không gây | `og-tre-em-khong-gay-tu-nhien.svg` | Bài về trẻ em |
| Hành trình | `og-di-vao-ben-trong.svg` | `/hanh-trinh/` |
| Phương pháp | `og-di-vao-ben-trong.svg` | `/phuong-phap/` |
| Chương trình | `og-du-an-nhat-ky.svg` | `/chuong-trinh/` |

### E6. Sitemap — kiểm tra và cập nhật

Sitemap hiện tại `sitemap.xml` đã khá đầy đủ. Cần kiểm tra:
- Đảm bảo tất cả URL trong sitemap đều tồn tại thực tế (không có 404)
- Thêm các trang còn thiếu: `/members/`, `/faq/`
- Cập nhật `<lastmod>` sau mỗi đợt update

---

## PHẦN F — HÌNH ẢNH MINH HOẠ BÀI VIẾT

### F1. Nguyên tắc chọn hình ảnh

- **Định dạng:** SVG vector — nhất quán với toàn site, nhẹ, scalable
- **Style:** Tối giản, tone màu trung tính (không sặc sỡ), gợi cảm giác thật và sâu
- **Đặt tên:** `[slug-bai-viet]-hero.svg` (ảnh đầu trang), `[slug-bai-viet]-[thematic].svg` (ảnh minh họa trong bài)
- **Kích thước render:** `max-width: 640px` cho hero, `100%` cho inline
- **Alt text:** Mô tả cụ thể, gợi cảm xúc và liên kết với nội dung bài

### F2. Danh sách ảnh đã có

```
assets/images/articles/
├── cong-dong-song-moi-circle.svg
├── cong-dong-song-moi-hero.svg
├── gan-duc-khoi-trong-clarity.svg
├── gan-duc-khoi-trong-hero.svg
├── khi-moi-truong-khong-con-phu-hop-hero.svg
├── khi-moi-truong-khong-con-phu-hop-inline.svg
├── khoi-tu-tam-depth.svg
├── khoi-tu-tam-hero.svg
├── neu-minh-sai-thi-sao-hero.svg
├── neu-minh-sai-thi-sao-question.svg
├── ngoi-nha-thu-2-hero.svg
├── ngoi-nha-thu-2-space.svg
├── ngoi-nha-thu-hai-detail.svg
├── ngoi-nha-thu-hai-hero.svg
├── nhat-ky-37-ngay-lam-chu-ngay-1-hero.svg
├── nhat-ky-37-ngay-lam-chu-ngay-1-practice.svg
├── song-theo-dong-chay-flow.svg
├── song-theo-dong-chay-hero.svg
├── vu-tru-vat-chat-energy.svg
└── vu-tru-vat-chat-hero.svg
```

### F3. Bài viết CẦN ảnh minh hoạ mới

Danh sách bài chưa có ảnh hoặc cần thêm ảnh thứ hai:

| Bài viết | Ảnh cần tạo | Gợi ý nội dung ảnh |
|---------|------------|-------------------|
| `dieu-dang-tiec-nhat-khi-ket-thuc-mot-kiep-song/` | `dieu-dang-tiec-hero.svg` | Người già ngồi trên ghế, nhìn ra cửa sổ, ánh sáng chiều, gợi chiều sâu thời gian |
| `hanh-trinh-di-vao-ben-trong/` | `hanh-trinh-hero.svg` | Con đường nhỏ đi vào rừng, ánh sáng lọc qua tán lá, cảm giác bắt đầu |
| `nhung-vong-lap-ban-chua-goi-ten/` | `vong-lap-hero.svg` | Vòng tròn lặp lại, ký hiệu đơn giản, tone xanh tím |
| `gia-dinh-khong-chi-la-noi-ta-lon-len/` | `gia-dinh-hero.svg` | Cành cây và rễ, ẩn dụ về gốc rễ và sự truyền kế |
| `khi-moi-truong-khong-con-phu-hop/` | Đã có hero, cần `inline.svg` (đã có) | — |
| `truong-thanh-thong-qua-mon-hoc-don-dep/` | `truong-thanh-hero.svg` | Bàn tay đang xếp dọn đồ vật, ánh sáng sáng, tone xanh lá |
| `am-thanh-tu-than-*/` | `am-thanh-hero.svg` | Sóng âm thanh nhẹ, hoặc hình người đứng yên trong không gian rộng |
| `dieu-tre-em-can-khong-chi-la-day-dung/` | `tre-em-hero.svg` | Bàn tay người lớn nắm lấy bàn tay trẻ nhỏ, nhẹ nhàng |
| `cai-choi/` | `cai-choi-hero.svg` | Cái chổi đơn giản dựng vào góc tường, ánh sáng mềm |
| `minh-dang-di-con-duong-gi/` | `con-duong-hero.svg` | Ngã ba đường, một người đứng trước ngã rẽ |
| `gia-tri-nao-la-vinh-cuu-truoc-song-gio/` | `gia-tri-vinh-cuu-hero.svg` | Tảng đá giữa cơn sóng |
| `dau-tu-hien-tai-tu-do-tuong-lai/` | `dau-tu-hero.svg` | Hạt giống đang nảy mầm |
| `nhat-ky-37-ngay-lam-chu-ngay-1/` | Đã có hero + practice | — |

### F4. Cách nhúng ảnh vào bài viết

```html
<!-- Hero image — ngay đầu bài, sau section pageHead -->
<figure class="articleMedia">
  <img 
    src="/assets/images/articles/[slug]-hero.svg"
    alt="[Mô tả cụ thể gợi cảm xúc]"
    loading="eager"
    decoding="async"
  />
  <figcaption>[Câu chú thích ngắn, liên kết với nội dung]</figcaption>
</figure>

<!-- Inline image — giữa bài để minh họa điểm chính -->
<figure class="articleMedia">
  <img 
    src="/assets/images/articles/[slug]-[thematic].svg"
    alt="[Mô tả cụ thể]"
    loading="lazy"
    decoding="async"
  />
  <figcaption>[Câu chú thích]</figcaption>
</figure>
```

---

## PHẦN G — KIỂM TRA NỘI DUNG BÀI VIẾT

### G1. Tiêu chí chất lượng bài viết

Mỗi bài viết cần đạt:

- [ ] **Tiêu đề** rõ ràng, khơi gợi câu hỏi hoặc nhận thức
- [ ] **Mô tả meta** 120–160 ký tự, có từ khoá tự nhiên
- [ ] **Hero image** phù hợp chủ đề, có alt text mô tả cụ thể
- [ ] **Nội dung chính:** tối thiểu 3 đoạn thực chất, không viết chung chung
- [ ] **Inline image** (nếu bài dài > 300 từ): 1 hình ảnh bổ sung giữa bài
- [ ] **"Hành động" cụ thể** ở cuối hoặc giữa bài — đây là điểm phân biệt site này
- [ ] **Liên kết nội bộ** đến ít nhất 2–3 bài liên quan
- [ ] **CTA** ở cuối: link đến `/hanh-trinh/`, `/phuong-phap/`, hoặc `/join/`
- [ ] **JSON-LD Article schema** đầy đủ
- [ ] **Breadcrumb** hiển thị đúng: Bài viết > [Danh mục] (nếu có)

### G2. Danh sách bài cần review nội dung

Các bài sau cần được kiểm tra và tinh chỉnh nội dung:

| Bài viết | Vấn đề cần xem xét |
|---------|-------------------|
| `dieu-dang-tiec-nhat-khi-ket-thuc-mot-kiep-song/` | Kiểm tra bài có đủ chiều sâu, hành động cụ thể |
| `nhung-vong-lap-ban-chua-goi-ten/` | Thêm ví dụ cụ thể về các vòng lặp phổ biến |
| `hanh-trinh-di-vao-ben-trong/` | Cần mở rộng hơn — hiện quá ngắn |
| `gia-dinh-khong-chi-la-noi-ta-lon-len/` | Kiểm tra không lên giọng phán xét |
| `khi-moi-truong-khong-con-phu-hop/` | Thêm bước hành động cụ thể |
| `dieu-tre-em-can-khong-chi-la-day-dung/` | Đảm bảo giọng điệu không lên lớp |
| `gia-tri-nao-la-vinh-cuu-truoc-song-gio/` | Thêm inline image + hành động |
| `dau-tu-hien-tai-tu-do-tuong-lai/` | Kiểm tra không giống "bán khóa học" |
| `tu-55-trieu-den-tu-do/` | Cẩn thận với tone — không để lộ hứa hẹn tài chính cụ thể không có cơ sở |
| `cong-dong-song-moi/` | Kiểm tra CTA không quá marketing |

### G3. Bài chưa có trang riêng — cần tạo

Các slug tồn tại trong sitemap nhưng cần kiểm tra nội dung:

```
bai-viet/di-vao-ben-trong/                    ← trang danh mục
bai-viet/di-vao-ben-trong-giai-ma-nhung-gi-dang-van-hanh-ban/
bai-viet/dong-chay-sang-tao-dong-chay-su-song/
bai-viet/du-an-37-ngay/
bai-viet/du-an-buoc/
bai-viet/du-an-nhat-ky/
bai-viet/gia-tri-cuoc-doi-ban-dang-gia-bao-nhieu/
bai-viet/hoc-tap-sang-tao-truong-thanh/
bai-viet/hoi-sinh-su-song-tu-su-sang-tao-nguyen-so/
bai-viet/ket-noi-linh-hon-vat-the/
bai-viet/ket-noi-sang-tao/
bai-viet/kien-tao-mot-doi-song-y-nghia/
bai-viet/lao-dong-sang-tao/                   ← trang danh mục
bai-viet/mon-hoc-don-dep-tong-quan/
bai-viet/mon-hoc-don-dep/                     ← trang danh mục
bai-viet/quet-la-va-viec-hoc/
bai-viet/tu-55-trieu-den-tu-do/
```

Cần vào từng URL để xác nhận: (a) trang tồn tại, (b) nội dung đầy đủ, (c) không 404.

---

## PHẦN H — KỸ THUẬT & HIỆU NĂNG

### H1. Xoá folder `[slug]` rỗng

```
bai-viet/[slug]/
```
Folder này không phải route thực — cần xoá hoặc đảm bảo không gây nhầm lẫn cho server.

### H2. Đảm bảo `#year` được set trên mọi trang

Trang chủ `index.html` có inline script đặt `#year`. Các trang dùng `site.css` + `site.js` đã đúng (`site.js` set year). Tuy nhiên, cần đảm bảo:

- Mọi trang đều load `<script src="/assets/site.js"></script>` trước `</body>`
- Không có trang nào đang dùng footer `#year` mà thiếu `site.js`

### H3. Kiểm tra `_redirects`

```
_redirects
```
Cần review file `_redirects` để đảm bảo:
- Redirect từ `http://` → `https://`
- Redirect từ không có `www` → `www`
- Redirect từ các URL cũ nếu có đổi slug
- Không có conflict redirect

### H4. Cập nhật `_headers`

Kiểm tra `_headers` để đảm bảo:
- `Cache-Control` đúng cho SVG, CSS, JS (immutable cho assets hash, no-cache cho HTML)
- `Content-Security-Policy` không chặn font, external resource
- `X-Frame-Options: DENY`

### H5. OG image format

Hiện tại OG images đang dùng `.svg`. Một số platform (Facebook, LinkedIn) không render SVG làm OG image — chỉ hỗ trợ JPEG/PNG.

**Khuyến nghị:** Tạo thêm bản PNG (1200×630px) song song với SVG, và dùng PNG cho `og:image`:

```html
<!-- Dùng PNG cho OG/Twitter -->
<meta property="og:image" content="https://www.nguyenlananh.com/assets/og/og-homepage.png" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

Giữ SVG làm source để dễ edit, export PNG từ SVG.

### H6. Robots.txt

Review `robots.txt`:
- Đảm bảo `/members/dashboard/`, `/admin/`, `/scripts/` bị block khỏi crawlers
- `sitemap.xml` được khai báo đúng

### H7. Accessibility (a11y) cần kiểm tra

- [ ] Tất cả ảnh có `alt` text không rỗng (trừ ảnh trang trí có `alt=""`)
- [ ] Tất cả form elements có `<label>`
- [ ] Focus outline đủ rõ (hiện tại đã có trong CSS)
- [ ] Kiểm tra color contrast ≥ 4.5:1 cho text chính
- [ ] Skip link "Bỏ qua điều hướng" đang hoạt động đúng
- [ ] `aria-expanded` được cập nhật đúng khi mở/đóng drawer và dropdown

---

## CHECKLIST DEPLOY CUỐI

### Pre-deploy

- [ ] **P0** — Đồng bộ navigation links trên tất cả trang (Trang chủ | Hành trình | Phương pháp | Bài viết | Thành viên | Bắt đầu)
- [ ] **P0** — Đồng bộ footer chuẩn (với legal links) trên tất cả trang
- [ ] **P0** — Thêm hamburger/drawer cho tất cả trang thiếu
- [ ] **P0** — Fix hamburger priority trên mobile (ẩn nút "Bắt đầu" dưới 880px)
- [ ] **P0** — Replace language UI bằng dropdown (cờ + tên) — xoá floating widget
- [ ] **P0** — Xoá link `EN` hardcode trong nav của `hanh-trinh/index.html`
- [ ] **P0** — Sửa Twitter Card trang chủ từ `summary` → `summary_large_image`
- [ ] **P0** — Thêm OG image cho `hanh-trinh/index.html`

### Sprint 1

- [ ] **P1** — Đồng bộ breakpoint về `880px` trong `site.css`
- [ ] **P1** — Thêm tablet breakpoint (600px–879px) vào `site.css`
- [ ] **P1** — Bổ sung JSON-LD Article schema cho tất cả bài viết còn thiếu
- [ ] **P1** — Tạo ảnh hero SVG cho 10 bài viết chưa có ảnh
- [ ] **P1** — Nhúng ảnh vào các bài viết còn thiếu
- [ ] **P1** — Kiểm tra tất cả URL trong sitemap (không có 404)
- [ ] **P1** — Convert OG images từ SVG sang PNG 1200×630

### Sprint 2

- [ ] **P2** — Review và tinh chỉnh nội dung tất cả bài viết theo tiêu chí G1
- [ ] **P2** — Bổ sung ảnh inline thứ hai cho bài dài
- [ ] **P2** — Audit accessibility (alt, contrast, focus)
- [ ] **P2** — Cập nhật `_redirects` và `_headers`
- [ ] **P2** — Cập nhật `robots.txt` block đúng paths
- [ ] **P2** — Kiểm tra EN pages song song với VI pages

### Sprint 3 / Backlog

- [ ] **P3** — Tạo trang danh mục đầy đủ cho từng chủ đề bài viết
- [ ] **P3** — Thêm breadcrumb schema (JSON-LD BreadcrumbList)
- [ ] **P3** — Implement reading time estimate cho bài viết
- [ ] **P3** — Thêm related articles section cuối bài dựa trên danh mục
- [ ] **P3** — Xem xét thêm ngôn ngữ 3, 4 (tiếng Nhật, tiếng Hàn) — cấu trúc đã sẵn sàng với dropdown

---

## GHI CHÚ KỸ THUẬT

### Stack

- **Frontend:** Static HTML + vanilla CSS + vanilla JS (không framework)
- **Deploy:** Netlify (dựa trên `_headers`, `_redirects`, `_headers`)
- **CDN:** Cloudflare (dựa trên `cdn-cgi` check trong `lang-routing.js`)
- **CMS:** Không có — tất cả HTML tĩnh, cập nhật thủ công

### Cách cập nhật hiệu quả nhất

Do site không có CMS hay template engine, việc cập nhật header/footer/nav trên 40+ trang là công việc thủ công nhiều lỗi tiềm tàng.

**Khuyến nghị kỹ thuật cho tương lai:**
1. Xem xét dùng một build script đơn giản (Node.js) để inject header/footer từ template vào mỗi file HTML khi build
2. Hoặc dùng Netlify Edge Functions / Cloudflare Workers để inject header/footer động
3. Điều này sẽ giải quyết vĩnh viễn vấn đề không đồng bộ

### Quy ước đặt tên file

```
assets/images/articles/[slug-bai-viet]-hero.svg     ← ảnh chính đầu bài
assets/images/articles/[slug-bai-viet]-[từ khoá].svg ← ảnh minh họa trong bài
assets/og/og-[danh-muc].svg                          ← OG image theo danh mục
assets/og/og-[danh-muc].png                          ← OG image PNG để share social
```

---

*Tài liệu này được tạo ngày 2026-04-15 sau khi rà soát toàn bộ repo `tranhatam-collab/nguyenlananh.com`.*  
*Cần cập nhật tài liệu này sau mỗi sprint hoàn thành.*
