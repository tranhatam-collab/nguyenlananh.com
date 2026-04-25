# ARTICLE VISUAL UPGRADE (2026-04-21)

## Mục tiêu
- Tự động chèn ảnh minh họa cho toàn bộ trang `/bai-viet/*` (VI + EN) để không còn trang trần.
- Duy trì tone site: nhẹ, tĩnh, cao cấp, không rườm rà.
- Ảnh lấy từ nguồn miễn phí không bản quyền + ảnh nội bộ đã có sẵn.

## Đã triển khai
- Cập nhật `assets/site.js`:
  - Nhận diện slug bài viết bằng `location.pathname`.
  - Bóc `h1` trong `.pageHead`.
  - Auto inject component:
    - `figure.articleHero`
    - `img` với source local fallback theo slug.
    - nếu không có local thì đổi sang `https://picsum.photos/seed/...` với seed theo nhóm nội dung + slug.
    - Có fallback `onerror` sang remote khi ảnh local lỗi.
    - Có loading placeholder + fade-in khi ảnh render.
- Cập nhật `assets/site.css`:
  - Style mới cho `.articleHero`, `.articleHero__media`, `figcaption`, animation shimmer, responsive.
- Sử dụng trên cả VI + EN, bao trùm hầu hết trang chi tiết bài viết có `pageHead`.

## Cách đội phát hiện/kiểm soát tiếp
1. Muốn khóa một slug với ảnh local riêng:
   - Tạo file `assets/images/articles/<slug>-hero.{svg|png|jpg}`.
   - Add vào `articleImageLibrary` trong `assets/site.js`.
2. Muốn chỉnh theme ảnh theo nhóm bài:
   - Điều chỉnh `articleImageGroups` trong `assets/site.js` (pattern + query + caption).
3. Muốn chuyển toàn bộ khỏi Picsum:
   - Chỉ cần thay thế `createRemoteImageUrl()` bằng CDN nội bộ hoặc nguồn ảnh hợp đồng.

## Checklist team handoff
- Team Content:
  - Review caption tiếng Việt/Anh cho ảnh để tone đồng nhất.
  - Ưu tiên mở rộng mapping các slug mới có ảnh local.
- Team Dev:
  - Chuẩn bị test route mẫu trên production để confirm ảnh render trên mobile + desktop.
  - Kiểm tra CSP nếu thêm nguồn ảnh mới.
- Team QA:
  - Kiểm tra tốc độ tải ảnh và ảnh bị lỗi trên các route bài viết VI/EN.
  - Kiểm tra caption không làm mất tỉ lệ bố cục, không lệch layout.
