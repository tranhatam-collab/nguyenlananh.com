# I18n Expansion Foundation - 2026-04-19

Status: ACTIVE  
Purpose: khóa nền mở rộng đa ngôn ngữ cho `nguyenlananh.com` để sau này thêm locale mới mà không phải vá lại từng file rời.

---

## 1. SSOT hiện tại

Các file nguồn chuẩn cho i18n:

- `scripts/lib/i18n-config.mjs`
- `scripts/sync-i18n.mjs`
- `assets/i18n-config.js` (generated)
- `assets/lang-routing.js`

Không thêm locale mới bằng cách sửa từng HTML trước.  
Phải sửa registry trước, sau đó mới sinh lại metadata / script / sitemap.

---

## 2. Trạng thái locale

### Live

- `vi`
- `en`

### Planned, chưa được bật public

- `fr`
- `ja`
- `ko`

Rule:

- locale `live: true` mới được xuất hiện trong:
  - language switch
  - hreflang
  - canonical counterpart
  - auto redirect
- locale `live: false` chỉ tồn tại ở registry để chuẩn bị mở rộng, chưa được public

---

## 3. Quy tắc routing

### Default locale

- default locale: `vi`
- x-default: route tiếng Việt

### Prefix rule

- `vi`: không prefix
- `en`: `/en/...`
- locale mới sau này:
  - `fr`: `/fr/...`
  - `ja`: `/ja/...`
  - `ko`: `/ko/...`

### Auto redirect rule

Auto redirect chỉ cho public discovery surface:

- `/`
- `/hanh-trinh/`
- `/phuong-phap/`
- `/bai-viet/`
- `/gioi-thieu/`
- `/du-an/`

Không auto redirect ở:

- `/join/`
- `/members/`
- legal pages
- `/lien-he/`
- `/admin/`
- `/api/`

Lý do: các route này cần ý chí người dùng rõ ràng, tránh state mơ hồ ở form, auth, payment, legal.

---

## 4. Quy tắc switch ngôn ngữ

`assets/lang-routing.js` hiện tuân theo:

1. Nếu trang đã có switch embedded bằng `[data-lang]`, không auto inject floating switch.
2. Nếu `body[data-lang-switch="off"]`, không render floating switch.
3. Floating switch chỉ là fallback cho các trang chưa có UI chuyển ngôn ngữ native.

---

## 5. Quy tắc sync

`scripts/sync-i18n.mjs` hiện chịu trách nhiệm:

1. đồng bộ `lang` attribute
2. canonical
3. hreflang
4. `og:url`
5. inject `assets/i18n-config.js`
6. inject `assets/lang-routing.js`
7. refresh `sitemap.xml`

### Lưu ý

- script này hiện vẫn vận hành theo mô hình `vi` là nguồn gốc
- locale non-default có thể:
  - giữ bản dịch native nếu file đã tồn tại
  - hoặc được clone từ `vi` nếu locale đó cho phép `autoGenerateFromDefault`

Hiện tại chỉ `en` dùng auto-generate fallback.

---

## 6. Cách bật một locale mới

Ví dụ muốn bật `fr`:

1. mở `scripts/lib/i18n-config.mjs`
2. chuyển locale `fr` sang:
   - `live: true`
   - `autoGenerateFromDefault: false` nếu muốn dịch native hoàn toàn
3. tạo các file route cần public:
   - `fr/index.html`
   - `fr/join/index.html`
   - `fr/bai-viet/index.html`
   - legal pages
4. dịch toàn bộ metadata + CTA + legal copy
5. chạy:

```bash
node scripts/sync-i18n.mjs
```

6. smoke:
   - homepage
   - article hub
   - join
   - legal
   - member guest gate
7. chỉ sau khi smoke pass mới deploy

---

## 7. Definition of Ready cho locale mới

Một locale chỉ được phép bật `live` khi đủ:

1. homepage native copy xong
2. article hub native copy xong
3. join + member guest entry xong
4. legal pages xong
5. canonical / hreflang / sitemap sạch
6. language switch đúng
7. không còn text lẫn tiếng Việt ở public live route

---

## 8. Phase tiếp theo nên làm

Để mở rộng beyond bilingual thật mượt, Team 3 nên làm tiếp:

1. generalize `scripts/build-launch-articles.mjs` theo locale registry
2. generalize smoke test theo live locale list
3. thêm locale readiness audit script để quét text lẫn ngôn ngữ
4. tách content source khỏi HTML tĩnh cho public pages quan trọng

---

## 9. Kết luận

Repo hiện đã có:

- locale registry trung tâm
- browser i18n config generated
- sync metadata từ một nguồn chuẩn
- routing rule đủ rõ để mở rộng tiếp

Điểm chưa xong: content production cho locale thứ 3 trở đi vẫn cần pipeline riêng trước khi bật public.
