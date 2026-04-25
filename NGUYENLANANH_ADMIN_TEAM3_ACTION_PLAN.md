# ADMIN TEAM ACTION PLAN — LIVE ADMIN CONTENT FLOW

Mục tiêu: hoàn tất xác nhận phần quản trị tài khoản nội dung (`content_manage` + `content_image`) sau khi deploy xong.

Version: 2026-04-19
Environment: `https://590cf00d.nguyenlananh-com.pages.dev`

---

## 1) Team Content/QA

Nhiệm vụ: kiểm tra luồng tạo / sửa / xóa tài khoản nội dung trong `/admin/settings`.

### Cách chạy nhanh (UI smoke)

1. Mở: `/admin/settings/`
2. Đăng nhập bằng tài khoản có quyền `settings` (thường `super.admin` hoặc tài khoản ops).
3. Kiểm tra phần **Quản trị tài khoản nội dung** hiển thị đủ:
   - `#admin-account-username`
   - `#admin-account-display`
   - `#admin-account-new-password`
   - `#admin-account-role`
   - `#admin-account-permissions`
   - `#admin-account-save`
   - `#admin-account-reset`
   - `#admin-account-list`

### Kịch bản kiểm thử

- **Create**: tạo tài khoản test:
  - username: `qa.content.test`
  - display: `QA Content`
  - role: `content_editor`
  - permissions: tích `content_manage`, `content_image`
  - password: `QA_CHANGE_ME_1`
  - kỳ vọng: xuất hiện trong danh sách với badge `Sẵn sàng`.

- **Edit**: nhấn **Sửa**, đổi display/permissions, để trống mật khẩu.
  - kỳ vọng: danh sách cập nhật, mật khẩu cũ vẫn giữ.

- **Delete**: nhấn **Xóa**.
  - kỳ vọng: tài khoản biến mất khỏi danh sách.

- **Guard check**:
  - tạo/đăng nhập bằng `content.editor` (nếu có) hoặc một tài khoản chỉ có `content + dashboard`
  - kỳ vọng: không thấy admin account manager nếu không có quyền settings.

---

## 2) Team DevOps/Admin

Nhiệm vụ: verify deployment + route + quyền session account-based.

- Chạy script smoke:

```bash
ADMIN_SMOKE_BASE=https://590cf00d.nguyenlananh-com.pages.dev \
  bash scripts/smoke-admin-content-accounts.sh
```

- Kiểm tra thêm:
  - `admin-enter` + `admin-account` + `admin-password` vẫn hoạt động ở cả `/admin/` và `/en/admin/`.
  - role-switch qua URL/session vẫn điều tiết hiển thị đúng modules.

---

## 3) Team Product

Nhiệm vụ: đóng checklist phân quyền nội bộ.

- Quy tắc chốt:
  - role cần quyền content operations theo chuẩn là có cả hai nhánh:
    - `content_manage`
    - `content_image`
  - mọi tài khoản tạo mới trong nội bộ khi gắn nội dung cần được bật đầy đủ 2 quyền này.

- Cập nhật policy cho các tài khoản nội bộ mới:
  - `Role`: ưu tiên `content_editor`
  - `Permissions`: `dashboard`, `content`, `content_manage`, `content_image`

---

## 4) Trạng thái cần xác nhận để đóng vòng

- Team Content/QA: PASS 1 create + 1 edit + 1 delete.
- Team DevOps/Admin: script smoke PASS và role-session hoạt động.
- Team Product: checklist quyền được cập nhật và chốt trong policy.

---

## 5) File liên quan đã chỉnh gần nhất

- [admin/settings/index.html](/Users/tranhatam/Documents/Devnewproject/nguyenlananh.com/admin/settings/index.html)
- [en/admin/settings/index.html](/Users/tranhatam/Documents/Devnewproject/nguyenlananh.com/en/admin/settings/index.html)
- [assets/admin-console.js](/Users/tranhatam/Documents/Devnewproject/nguyenlananh.com/assets/admin-console.js)

