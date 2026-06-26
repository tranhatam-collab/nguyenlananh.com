# AI DEV WORKING RULES — Kỷ luật làm việc tuyệt đối (nghiêm túc tới hoàn thiện)

> Mọi AI dev / agent làm trên nguyenlananh.com PHẢI tuân file này. Vi phạm = công việc bị từ chối.
> Sinh ra từ các lỗi thật đã xảy ra: tuyên bố "PASS" bằng 1 lệnh curl, deploy không commit, "PASS giả" (dummy token), nhầm source↔preview↔production. Ngày 2026-06-26.

---

## 0. LUẬT TỐI CAO
1. **KHÔNG tuyên bố "xong / PASS / 100%" nếu chưa có BẰNG CHỨNG verify độc lập** theo §2. Một lệnh curl thành công KHÔNG phải bằng chứng.
2. **Trung thực tuyệt đối.** Kết quả xấu phải báo đúng. "dummy token qua được" = **FAIL bảo mật**, KHÔNG phải PASS. Không tô hồng.
3. **Phân biệt rõ 3 lớp:** `source (git)` ≠ `preview deployment` ≠ `custom domain (production)`. Luôn nói đang test lớp nào.
4. **production PHẢI = git HEAD.** Nếu deploy tay từ working dir → commit ngay. Không để fix "mồ côi" ngoài git.
5. **Sau MỖI phiên làm việc → BÁO CÁO** theo template §5. Không có report = phiên đó không tính.
6. **Không đổ lỗi "browser cache"** khi chưa chứng minh bằng fetch trực tiếp + header + hash.

---

## 1. TRƯỚC KHI LÀM
- `git fetch && git status` — biết HEAD, origin/main, working tree sạch/bẩn.
- Đọc: `CANONICAL_PRODUCT_MAP_2026.md` (§A bảng map), `LEARNING_PLATFORM_MASTER_PLAN_2026.md` (§E Route Contract), file này.
- Mọi sản phẩm/route/plan_code mới: **đăng ký 1 dòng vào Canonical Map §A TRƯỚC khi build**. Không tự đặt slug ngoài bảng.

## 2. VERIFY (bắt buộc cho mọi claim "live/done")
Một claim chỉ hợp lệ khi có **đủ 4 lớp bằng chứng**:

**(a) Deployment identity** — ghi rõ:
- commit SHA production · deployment ID · thời điểm deploy · `cf-cache-status` · `cf-ray`.

**(b) Live assertions theo CHUỖI nội dung** (không chỉ đếm section). Mẫu chuẩn cho homepage:
```bash
H=$(curl -s https://www.nguyenlananh.com/)
echo "$H" | grep -c "500+"                        # = 0
echo "$H" | grep -c "đang cập nhật bản xác thực"  # = 0
echo "$H" | grep -c "© 2026"                       # >= 1
echo "$H" | grep -c "Sống hết một đời"            # >= 1 (hero mới)
echo "$H" | grep -oE "<h1>.*</h1>" | head -1       # phải là hero mới
```

**(c) Source↔production hash** (chấp nhận sai khác do edge transform đã biết):
```bash
curl -s https://www.nguyenlananh.com/ | shasum -a 256
git show HEAD:index.html | shasum -a 256
# Nếu hash khác → DIFF để xác định nguyên nhân:
diff <(curl -s https://www.nguyenlananh.com/) <(git show HEAD:index.html)
```
> **Edge transform ĐÃ BIẾT (không phải lỗi):** Cloudflare **Email Obfuscation** đổi `lienhe@nguyenlananh.com` → `/cdn-cgi/l/email-protection` + inject `email-decode.min.js`. Diff chỉ gồm các dòng này = OK. Diff bất kỳ dòng NỘI DUNG khác = production lệch source → điều tra.

**(d) Multi-host** — apex + www + preview phải nhất quán:
```bash
for u in https://nguyenlananh.com/ https://www.nguyenlananh.com/ https://<preview>.pages.dev/; do
  echo "== $u"; curl -s "$u" | grep -Eo "500\+|Sống hết một đời|đang cập nhật bản xác thực|© 2026" | sort | uniq -c
done
```

## 3. AN TOÀN PRODUCTION
- KHÔNG `git push --force` lên main. KHÔNG xoá data. KHÔNG `wrangler d1 execute` phá prod.
- Fix bảo mật/thanh toán: verify endpoint THẬT (vd. finalize phải query provider, KHÔNG tin `manual_confirmed` client).
- **Turnstile/secret phải là PRODUCTION keys.** Test: gửi token `"dummy"` → phải `TURNSTILE_FAILED`. Nếu dummy qua = test key = FAIL.
- KHÔNG bật bán sản phẩm khi chưa đóng **Gate 1 (giao dịch thật end-to-end)** + **Gate 2 (email biên nhận)**.

## 4. COMMIT
- Mỗi việc xong = 1 commit gọn (Conventional Commits), có bằng chứng verify trong message.
- KHÔNG gộp thay đổi không liên quan. KHÔNG để file untracked thuộc tính năng đã deploy.
- Footer: `Co-Authored-By: <tên AI> <email>`.

## 5. BÁO CÁO SAU MỖI PHIÊN (bắt buộc — template cố định)
```
## REPORT — <ngày giờ> — <agent>
- Việc đã làm: <liệt kê>
- Commit: <sha> (origin/main = <sha>, sync: yes/no)
- Deployment: <deployment id> · deploy lúc <giờ> · cf-cache-status <…>
- Verify (§2): 
  - assertions: <kết quả từng dòng>
  - hash source vs prod: <match / khác vì email-obfuscation / KHÁC BẤT THƯỜNG>
  - multi-host: <www/apex/preview khớp?>
- Còn lại / BLOCKED: <việc + lý do + cần ai>
- PASS/HOLD: <verdict, kèm điều kiện>
```
- Lưu report vào `docs/reports/` HOẶC `docs/plans/PROGRESS.md`. Việc cần dashboard/secret (Cloudflare, Google, PayPal) → ghi **BLOCKED + handover** cho user, không tự bịa là xong.

## 6. RELEASE GATE (chỉ PASS khi đủ, trên ≥1 host độc lập + lý tưởng đa vùng)
- `500+` = 0 · `đang cập nhật bản xác thực` = 0 · `© 2026` ≥ 1 · hero mới ≥ 1
- hash www = hash HEAD (chỉ lệch do email-obfuscation đã biết)
- Turnstile dummy → `TURNSTILE_FAILED`
- commit prod = git HEAD · production = origin/main
- Canonical Map §A phủ 100% PLANS (verify script §E của map)

---

## 7. ANTI-PATTERN (đã từng xảy ra — CẤM tái diễn)
| Lỗi đã xảy ra | Quy tắc thay thế |
|---|---|
| "1 curl OK → kết luận toàn production đúng" | Phải §2 (4 lớp bằng chứng) + multi-host |
| Deploy tay nhưng không commit (fix mồ côi) | §0.4 production = git HEAD; commit ngay |
| "dummy token ok:true" ghi là PASS | §3 dummy phải FAIL; ok:true với dummy = lỗ hổng |
| Đổ lỗi browser cache khi user thấy bản cũ | §0.6 chứng minh bằng fetch + header + hash trước |
| Nhầm preview/source là production | §0.3 luôn nói rõ lớp đang test |
| Tạo route/slug ngoài bảng map | §1 đăng ký Canonical Map trước khi build |
| Bán khi payment/email chưa verify thật | §3 Gate 1 + Gate 2 |
