# QA-AUDIT REPORT — Bỏ ép Profile sau login, vào thẳng khu thành viên

> Vai trò: Audit-QA → spec cho team dev AI thực thi. KHÔNG tự sửa code/deploy ở report này.
> Ngày 2026-06-26 · Base HEAD `69bcce9` · working tree sạch khi viết report.

## Yêu cầu sản phẩm (đã chốt với owner)
Sau Google login → đáp xuống **`/members/dashboard/`** (khu thành viên miễn phí, xem/mua sản phẩm).
Form Profile **không ép**; chỉ liên quan ở bước thanh toán/verify.

---

## A. Hiện trạng (đã audit, có bằng chứng)

| Điểm | Bằng chứng | Vấn đề |
|---|---|---|
| Sau login đáp `/members/start/` (form Profile) | `functions/_lib/auth.js:156` + `:255` default nextPath = `membersStartPath()` | Ép nhập Profile ngay |
| Free member bị đá về /start khi duyệt | `assets/members.js:1443` `redirectFreeMemberToStart()` → `window.location.replace(startPath + "?gate=paid")` | Không duyệt/mua tự do |
| `/members/start` không có lối thoát | `members/start/index.html:89-91` chỉ có nút "Lưu profile" | Ngõ cụt |
| Checkout có cần Profile không? | `functions/_lib/payments.js`: **0** ràng buộc profile | Bỏ ép Profile KHÔNG phá thanh toán |
| `/members/dashboard/` | tồn tại, `data-page="members-dashboard"` | Sẵn sàng làm trang đáp |

---

## B. SPEC SỬA (3 thay đổi)

### B1 — `functions/_lib/auth.js`: đổi nextPath mặc định → dashboard
Thêm helper cạnh `membersStartPath` (dòng 64-66):
```js
function membersHomePath(locale = "vi") {
  return getLocale(locale) === "en-US" ? "/en/members/dashboard/" : "/members/dashboard/";
}
```
- Dòng **156** và **255**: đổi `|| membersStartPath(locale)` → `|| membersHomePath(locale)`.
- Giữ nguyên `membersStartPath` (vẫn dùng nếu `next_path` chỉ định rõ /start).

### B2 — `assets/members.js:1443` `redirectFreeMemberToStart()`: vô hiệu ép Profile
Cho hàm `return false;` (không force free member về /start).
An toàn: nội dung trả phí `/members/deep/*` vẫn gated **server-side** bởi `_middleware`
(content_access/membership) — không lộ nội dung trả phí.

### B3 — `members/start/index.html:89-91`: thêm lối thoát
Thêm cạnh nút Lưu:
```html
<a class="ghost" href="/members/dashboard/">Để sau → vào khám phá</a>
```
Làm tương tự bản EN `en/members/start/` (link `/en/members/dashboard/`, chữ "Skip for now → explore").

---

## C. ACCEPTANCE (phải đạt hết)
1. Login Google (VI + EN) → đáp `/members/dashboard/` (không phải /start), không `?error=`.
2. Free member click Hành trình/Thực hành/sản phẩm → vào được, không bị đá về /start.
3. `/members/start` có nút "Để sau" → dashboard.
4. Mua sản phẩm bất kỳ → checkout chạy bình thường (không đòi profile).
5. `/members/deep/*` khi CHƯA mua vẫn 302 (gating server-side còn nguyên).
6. EN parity: làm cả bản /en/.

---

## D. VERIFY (theo §2 AI_DEV_WORKING_RULES — bắt buộc trước khi báo xong)
- `node --check` auth.js + members.js.
- Sau deploy: login Google thật (ẩn danh) → xác nhận đáp `/members/dashboard/`.
- `curl /members/deep/<x>` ẩn danh → vẫn 302 (chưa lộ paid).
- `git status` sạch; HEAD = LIVE (không deploy từ working tree bẩn).

---

## E. GUARDRAIL (chống "lỗi hoài")
- Chỉ sửa 3 file trên; KHÔNG đụng gating `_middleware`.
- Commit sạch → push → Actions deploy. CẤM deploy tay từ working tree bẩn.
- Sau deploy verify 3 lớp: HEAD = working = LIVE.

---

## F. Bối cảnh nền (đã PASS, không phải làm lại)
- Gate 10 (Google login) PASS · `error=5` (btoa Latin1 crash) đã fix `69bcce9`.
- EN `/en/api` 404 đã fix `06bd878`.
- PayPal webhook đã set (verified 401 unsigned).
- Đây là việc UX **không chặn** — site đã đăng nhập + thanh toán được.
