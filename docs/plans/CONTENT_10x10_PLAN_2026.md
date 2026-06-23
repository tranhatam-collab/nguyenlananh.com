# CONTENT 10×10 PLAN — 10 Bài Viết Free + 10 Bài Học Premium

> Single source of truth cho team dev/content. Ngày: 2026-06-22 · Base HEAD: `414f4e9`
> Nguyên tắc: **ít bài hơn, sâu hơn**. Free ≥1800 từ · Premium ≥2000 từ + test + thực hành + chứng nhận.

---

## 0. AUDIT CONTENT HIỆN TẠI (số thật)

| Chỉ số | Giá trị |
|---|---|
| Bài VI / EN | 76 / 76 (EN parity đầy đủ) |
| Chuyên mục | 6: dau-tu-ban-than, di-vao-ben-trong, du-an-nhat-ky, gia-tri-noi-tai, lao-dong-sang-tao, mon-hoc-don-dep |
| Độ sâu ≥1800 từ | **9 bài (12%)** |
| 1000–1799 từ | 17 bài |
| 500–999 từ | 13 bài |
| **<500 từ (mỏng)** | **37 bài (49%)** |
| Sản phẩm | 5 micro page + 5 deep-track placeholder (`/members/deep/*`, chưa nội dung) |

**Kết luận:** nền tảng rộng nhưng mỏng (49% bài <500 từ). 9 bài sâu gần đây là chuẩn đúng. Hướng mới: pillar sâu + sản phẩm học.

> ⛔ **GATE BÁN:** Founder Audit — Gate 1 (giao dịch thật end-to-end) + Gate 2 (email) CHƯA đóng. Build + wire được ngay; **bật bán** chỉ sau khi 2 gate xanh.

---

## 1. TRACK A — 10 BÀI FREE (≥1800 từ, public, SEO + phễu)

Mỗi bài = 1 pillar cho 1 chuyên mục + CTA tới 1 sản phẩm Track B. Team dedupe slug với 9 bài sâu hiện có.

| # | Tiêu đề (VI) | Chuyên mục | Từ khóa | CTA → |
|---|---|---|---|---|
| A1 | Vòng Lặp Tài Chính Nội Tâm: Vì Sao Tiền Không Chữa Nỗi Sợ Thiếu | gia-tri-noi-tai | tự do tài chính nội tâm | L9 |
| A2 | Khi Mọi Thứ Sụp Đổ, Giá Trị Nào Còn Lại | gia-tri-noi-tai | giá trị bền vững | L2 |
| A3 | Học Cách Học: Siêu Năng Lực Bị Lãng Quên | dau-tu-ban-than | học cách học | L8 |
| A4 | Dọn Dẹp Như Một Thực Hành, Không Phải Việc Nhà | mon-hoc-don-dep | dọn dẹp chữa lành | L4 |
| A5 | Dòng Chảy Sáng Tạo: Khi Làm Việc Trở Thành Thiền | lao-dong-sang-tao | flow sáng tạo | L5 |
| A6 | Vì Sao 37 Ngày Chứ Không Phải 30 | du-an-nhat-ky | thử thách 37 ngày | L6 |
| A7 | Cơ Thể Nhớ Điều Tâm Trí Quên | di-vao-ben-trong | lắng nghe cơ thể | L7 |
| A8 | Thời Gian: Tài Sản Duy Nhất Không Mua Lại Được | dau-tu-ban-than | quản lý thời gian nội tâm | L2 |
| A9 | Kỷ Luật Không Phải Ý Chí Mà Là Thiết Kế Môi Trường | dau-tu-ban-than | thiết kế thói quen | L8 |
| A10 | Cô Đơn và Kết Nối Thật Trong Thời Đại Ồn Ào | di-vao-ben-trong | kết nối thật | L10 |

**Spec mỗi bài A:** ≥1800 từ · H1 + 5–7 H2 + H3 · 1 hero illustration · ≥2 internal link · 1 CTA box → Track B · JSON-LD Article+FAQ · meta title/desc · **bản EN** `/en/bai-viet/<slug>/` · thêm vào `bai-viet/index.html` + chuyên mục + `sitemap.xml` · `index,follow`.

---

## 2. TRACK B — 10 BÀI HỌC PREMIUM (≥2000 từ, member-gated, bán được)

Mỗi bài học = Bài giảng sâu + Test + Thực hành + Nộp bằng chứng + Chứng nhận. Đặt `/members/deep/<slug>/`.

| # | Bài học (slug) | Chuyên môn | Plan code | Giá lẻ | Membership |
|---|---|---|---|---|---|
| L1 | Giải Mã Vòng Lặp Cá Nhân (`ban-do-vong-lap`) | nhận diện vòng lặp | `deep_loop_map` | 175k ($7) | year2/3 |
| L2 | Đầu Tư Nội Tại (`dau-tu-noi-tai`) | giá trị bền vững | `deep_inner_invest` | 225k ($9) | year2/3 |
| L3 | Gia Đình và Gốc Rễ (`gia-dinh-va-goc-re`) | hệ phản xạ gia đình | `deep_family_roots` | 225k ($9) | year2/3 |
| L4 | Tái Thiết Không Gian Sống (`tai-thiet-khong-gian`) | môi trường→tâm trí | `deep_space_reset` | 175k ($7) | year2/3 |
| L5 | Xưởng Sáng Tạo (`xuong-sang-tao`) | lao động sáng tạo | `deep_creative_lab` | 225k ($9) | year2/3 |
| L6 | 37 Ngày Làm Chủ Nhịp Sống (`37-ngay`) | hành trình nhịp sống | `deep_37day` | 490k ($19) | year2/3 |
| L7 | Lắng Nghe Cơ Thể (`lang-nghe-co-the`) | tín hiệu thân | `deep_body_listen` | 175k ($7) | year2/3 |
| L8 | Kỷ Luật Bằng Thiết Kế (`ky-luat-thiet-ke`) | thiết kế thói quen | `deep_habit_design` | 225k ($9) | year2/3 |
| L9 | Tài Chính Nội Tâm (`tai-chinh-noi-tam`) | tâm lý tiền bạc | `deep_money_mind` | 290k ($11) | year2/3 |
| L10 | Cô Đơn & Kết Nối Thật (`co-don-ket-noi`) | kết nối | `deep_connection` | 175k ($7) | year2/3 |

**Cấu trúc mỗi bài học L (≥2000 từ):**
1. Bài giảng sâu (≥2000 từ): lý thuyết + ví dụ + khung tư duy.
2. Test: 8–12 câu → chấm tự động, lưu D1.
3. Thực hành: workbook PDF + bài tập đời thực.
4. Nộp bằng chứng: form → D1, hiển thị trong member space.
5. Chứng nhận (VC): cấp khi test ≥ ngưỡng + nộp thực hành (spec: `docs/NGUYENLANANH_AUTO_EXAM_PRACTICE_VC_CERTIFICATE_SYSTEM_2026/`).
6. Gating: member có quyền (`deep_*` hoặc year2/3); chưa → preview + nút mua.

---

## 3. KỸ THUẬT (team dev)

### Backend
- `constants.js`: +10 plan `deep_*` (giá VND/USD, `durationDays:36500`) + template email `T80–T89`.
- `payments.js`: map `deep_*` → `deepUrlFor()` `/members/deep/<slug>/` + welcome + article CTA (pattern micro).
- Gating: `_middleware.js` gác `/members/deep/*` → check `content_access` (`content_id=deep_<slug>`) hoặc `membership_type ∈ {year2,year3}`; chưa quyền → 302 `/products/<slug>/`.
- Learn API: `functions/api/learn/{submit-test,submit-practice,certificate}.js`. Bảng D1: `lesson_progress`, `lesson_submissions`, `certificates`.

### Frontend
- 10 trang bán `/products/<deep-slug>/` (pattern `products-checkout.js` + `data-plan="deep_*"`).
- 10 trang học `/members/deep/<slug>/` (giảng + test + practice + cert).
- Component: `assets/lesson-test.js`, `assets/lesson-practice.js`, `assets/lesson-certificate.js`.

### Build & SEO
- Track A: tái dùng `scripts/build-pillar-articles.mjs`; `index,follow` + sitemap.
- Track B: tạo `scripts/build-deep-lessons.mjs`; gated → `noindex`, KHÔNG vào sitemap public (chỉ trang bán index).
- EN parity bắt buộc Track A; Track B EN giai đoạn 2.

### Acceptance
- A: ≥1800 từ, EN tồn tại, ≥2 internal link, CTA đúng, JSON-LD valid, có trong sitemap+chuyên mục.
- L: ≥2000 từ, gated đúng (chưa-quyền→302 trang bán), test chấm+lưu D1, practice nộp được, VC cấp khi đạt, checkout `deep_*` trả URL payOS + giá đúng.

---

## 4. SPRINT

| Sprint | Nội dung | Output |
|---|---|---|
| S1 | 10 bài Track A (≥1800w) + EN + sitemap + internal link | pillar live, SEO funnel |
| S2 | plan `deep_*`, gating `/members/deep/*`, learn API + bảng D1, component | khung học vận hành |
| S3 | 10 bài học L (≥2000w) + test + practice + 10 trang bán | 10 sản phẩm sẵn sàng |
| S4 ⛔ | Bật bán SAU khi Gate 1 + Gate 2 xanh; test mua thật → cấp access → email | bán an toàn |

Phụ thuộc: S3 cần S2. **S4 chặn bởi Founder Audit Gate 1 + Gate 2.**

---

## 5. Mẫu chuẩn
Bài mẫu hoàn chỉnh ≥1800 từ: xem `docs/plans/SAMPLE_ARTICLE_A3.md` (bài A3 "Học Cách Học") — team nhân bản cấu trúc cho A1–A10.
