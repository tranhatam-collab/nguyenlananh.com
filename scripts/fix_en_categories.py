import os, glob

ui_map = {
    "Đi vào bên trong": "Inner Work",
    "Đầu tư bản thân": "Self-Investment",
    "Dự án nhật ký": "Project Journal",
    "Giá trị nội tại": "Inner Value",
    "Lao động sáng tạo": "Labor and Creation",
    "Môn học dọn dẹp": "Decluttering Practice",
    "Chuyên mục | Nguyenlananh.com": "Articles | Nguyenlananh.com",
    "Bỏ qua điều hướng": "Skip navigation",
    "Điều hướng chính": "Primary navigation",
    "Mở menu": "Open menu",
    "Điều hướng": "Navigation",
    "Chọn một mục để đi tới.": "Choose a section to continue.",
    "Đóng menu": "Close menu",
    "Điều hướng di động": "Mobile navigation",
    "Đăng ký": "Join",
    "Đi chậm để đi sâu. Đi thật để đi xa.": "Move slowly to go deep. Move truthfully to go far.",
    "Nguyễn Lan Anh": "Lan Anh Nguyen",
    "Không phải để trở thành ai đó. Mà để trở về đúng là mình.": "Not to become someone else. To return to who you truly are.",
    "Đi vào bên trong để tái thiết cuộc đời": "Rebuild your life from within",
    "Các bài viết": "Articles",
    "Nâng cao": "Advanced",
    "Khám phá thêm": "Explore more",
    "Tất cả bài viết": "All articles",
    "Đồng hành miễn phí": "Free companionship",
    "Bài viết trong chuyên mục": "Articles in this category",
    "Trang chủ": "Home",
    "Bài viết": "Articles",
    "Hệ thống": "System",
    "Thành viên": "Members",
    "Cửa ngõ của kỷ luật và sáng tạo.": "The gateway to discipline and creation.",
    "Không phải đầu ra, mà là cách sống.": "Not output, but a way of living.",
    "Sáng tạo như hơi thở.": "Creativity like breathing.",
    "Đầu tư thật cho chính mình.": "Invest for real in yourself.",
}

for path in glob.glob("en/bai-viet/chuyen-muc/*/index.html"):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    for old, new in ui_map.items():
        content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed", path)
