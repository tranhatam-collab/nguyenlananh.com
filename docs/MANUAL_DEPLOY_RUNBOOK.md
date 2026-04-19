# MANUAL_DEPLOY_RUNBOOK.md

Version: 2.0  
Status: READY FOR TEAM USE  
Purpose: runbook ngắn để publish production cho `nguyenlananh.com` bằng dist sạch, tránh kéo file nháp hoặc scope ngoài ý muốn vào release.

---

## 1. Mục tiêu

Tài liệu này chuẩn hóa cách publish production để team không phải nhớ nhiều bước rời rạc.

Sau khi code/content đã được commit sạch trên `main`, lệnh chuẩn vẫn là:

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

### 3.1. Chuẩn bị dist sạch

```bash
node scripts/prepare_release_dist.mjs
```

Script này:

- copy đúng allowlist path dùng để live
- bỏ file nháp dạng `* 2.*`, `* 3.*`, `* 4.*`
- trả về một thư mục `/tmp/nla-release-dist.*`
- giữ policy cache để HTML revalidate ngay sau deploy

### 3.2. Deploy thẳng lên Cloudflare Pages

```bash
./scripts/deploy_cloudflare.sh
```

Dùng khi:
- cần bắn production thủ công
- muốn deploy từ dist sạch thay vì root repo

Script này giờ sẽ:

1. tự build dist sạch bằng `scripts/prepare_release_dist.mjs` nếu `BUILD_DIR` chưa được set
2. deploy dist đó lên Cloudflare Pages

### 3.3. Publish một lệnh

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

Biến môi trường thường dùng:

```bash
export CLOUDFLARE_PAGES_PROJECT=nguyenlananh-com
```

Tùy chọn:

```bash
export BUILD_DIR=/path/to/custom/dist
```

Mặc định hiện tại:

- project: `nguyenlananh-com`
- build dir: auto-generated release dist trong `/tmp`

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

### Trường hợp cần inspect dist trước khi deploy

```bash
DIST_DIR="$(node scripts/prepare_release_dist.mjs)"
echo "$DIST_DIR"
wrangler pages deploy "$DIST_DIR" --project-name nguyenlananh-com --branch main --commit-dirty=true
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

Kỳ vọng hiện tại cho HTML:

```text
cache-control: public, max-age=0, must-revalidate
```

---

## 8. Lưu ý hiện trạng repo

Trong repo hiện có một số file nháp cũ chưa commit, ví dụ dạng `* 2.*`.

Không để các file đó đi vào flow publish ngẫu nhiên.

Vì vậy:

- `publish_prod.sh` vẫn yêu cầu `git status` sạch
- `deploy_cloudflare.sh` dùng dist sạch để giảm nguy cơ kéo file ngoài scope vào production
- với deploy khẩn cấp, vẫn phải tự chịu trách nhiệm về diff đang có trên máy local

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
