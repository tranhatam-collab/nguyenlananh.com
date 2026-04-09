# MANUAL_DEPLOY_RUNBOOK.md

Version: 1.0  
Status: READY FOR TEAM USE  
Purpose: runbook ngắn để publish production cho `nguyenlananh.com` bằng 1 lệnh an toàn từ root repo.

---

## 1. Mục tiêu

Tài liệu này chuẩn hóa cách publish production để team không phải nhớ nhiều bước rời rạc.

Sau khi code/content đã được commit sạch trên `main`, lệnh chuẩn là:

```bash
./scripts/publish_prod.sh
```

---

## 2. Điều kiện trước khi chạy

Bắt buộc:

- đang đứng ở root repo
- branch hiện tại là `main`
- working tree sạch
- đã đăng nhập `wrangler`
- có `CLOUDFLARE_ACCOUNT_ID`

Khuyến nghị:

- kiểm tra nhanh route mới trên local/filesystem
- chắc rằng không còn file nháp kiểu `* 2.*` trong scope publish

---

## 3. Hai script chuẩn

### 3.1. Deploy thẳng lên Cloudflare Pages

```bash
./scripts/deploy_cloudflare.sh
```

Dùng khi:
- `main` đã được push
- chỉ cần bắn production thủ công

### 3.2. Publish một lệnh

```bash
./scripts/publish_prod.sh
```

Script này sẽ:

1. kiểm tra bạn đang ở `main`
2. kiểm tra working tree sạch
3. chạy `node scripts/sync-i18n.mjs`
4. nếu script sync làm thay đổi file, nó sẽ dừng để bạn commit trước
5. push `main`
6. gọi `./scripts/deploy_cloudflare.sh`

---

## 4. Env chuẩn

Biến môi trường bắt buộc:

```bash
export CLOUDFLARE_ACCOUNT_ID=your_account_id
```

Tùy chọn:

```bash
export CLOUDFLARE_PAGES_PROJECT=nguyenlananh-com
export BUILD_DIR=.
```

Mặc định hiện tại:

- project: `nguyenlananh-com`
- build dir: `.`

---

## 5. Cách dùng đề xuất

### Trường hợp bình thường

```bash
git checkout main
git pull --rebase
./scripts/publish_prod.sh
```

### Trường hợp đã push xong, chỉ cần deploy lại

```bash
./scripts/deploy_cloudflare.sh
```

---

## 6. Vì sao không auto-commit trong script publish

Runbook này cố tình không auto-commit.

Lý do:

- tránh cuốn cả file nháp ngoài scope vào production
- tránh tạo commit khó kiểm soát
- buộc người publish nhìn lại diff trước khi live

Nếu sau này cần một flow `auto-commit + deploy`, nên làm như script riêng và có exclude rules rõ.

---

## 7. Smoke test sau publish

Kiểm tra tối thiểu:

```bash
curl -I https://www.nguyenlananh.com/
curl -I https://www.nguyenlananh.com/bai-viet/
curl -I https://www.nguyenlananh.com/join/
```

Khi có route mới, kiểm tra thêm route mới ngay sau deploy.

---

## 8. Lưu ý hiện trạng repo

Trong repo hiện có một số file nháp cũ chưa commit, ví dụ dạng `* 2.*`.

Không để các file đó đi vào flow publish ngẫu nhiên.

Vì vậy:

- luôn commit có chủ đích
- chỉ publish khi `git status` sạch

---

## 9. Kết luận

Từ bây giờ, lệnh chuẩn để publish production là:

```bash
./scripts/publish_prod.sh
```

Nếu chỉ cần bắn lại deploy thủ công:

```bash
./scripts/deploy_cloudflare.sh
```
