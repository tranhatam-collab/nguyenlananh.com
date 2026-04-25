# NGUYENLANANH_HOMEPAGE_BRAND_MEMBERS_MASTERPLAN_2026-04.md

Version: 1.0
Status: READY FOR REVIEW -> DEV HANDOFF AFTER APPROVAL
Purpose: khóa lại brand, homepage, menu, sitemap phát triển và hệ members onboarding để toàn bộ `nguyenlananh.com` đi cùng một hướng ở giai đoạn tiếp theo.

---

## 1. Mục tiêu file

File này dùng khi cần nâng website từ mức:

- đã lên được
- đã có content nền
- đã có membership MVP

lên mức:

- có tầm thương hiệu rõ
- homepage đủ mạnh để giữ người dùng 30 giây đầu
- đủ cuốn để kéo họ ở lại 3 phút tiếp theo
- có đường đi rõ từ public -> join -> onboarding -> journey -> deep
- có logic song ngữ và định danh thương hiệu nhất quán

File này là bản cập nhật chiến lược ở tầng cao hơn các spec cũ.

Không phủ định nền cũ.
Nó dùng để nâng cấp hướng triển khai cho đúng giai đoạn phát triển mới.

---

## 2. Chẩn đoán hiện trạng cần sửa

### 2.1. Homepage hiện tại

Homepage hiện đã có nhiều section đúng tinh thần, nhưng còn 5 vấn đề:

- visual direction còn phân tán, chưa đủ tĩnh, sâu, trưởng thành
- CTA và menu chưa thật sự kéo người dùng về một quyết định rõ trong 30 giây
- public homepage đang nói nhiều lớp cùng lúc, nhưng chưa tổ chức thành luồng đọc có chủ ý
- EN homepage còn lẫn nhiều text tiếng Việt, chưa đạt chuẩn international-facing
- bridge từ bài public sang membership vẫn có nhưng chưa thành hệ rõ ràng ở cấp toàn site

### 2.2. Brand hiện tại

Brand đang xuất hiện dưới nhiều biến thể:

- `Nguyễn Lan Anh`
- `Nguyenlananh.com`
- `Join`
- các nhãn EN/VI còn lẫn logic

Điều này làm site chưa có cảm giác “một thương hiệu trưởng thành đã khóa hệ”.

### 2.3. Members hiện tại

Membership MVP đã có dashboard, journey, practice, deep.

Nhưng vẫn còn thiếu lớp cực quan trọng:

- `/members/start/` để người mới hiểu mình vừa bước vào cái gì
- journey theo day-route rõ ràng
- logic giữ người dùng 7 ngày đầu
- sự nối giữa homepage hứa điều gì và members thực sự làm gì

---

## 3. Brand Lock Mới

### 3.1. Tên thương hiệu theo ngôn ngữ

Khóa chính thức:

- VI display name: `Nguyễn Lan Anh`
- EN display name: `Lan Anh Nguyen`
- Domain/system name: `Nguyenlananh.com`

### 3.2. Quy tắc dùng tên

Trên layer tiếng Việt:

- header
- footer
- schema person
- meta author
- contact block

dùng `Nguyễn Lan Anh`

Trên layer tiếng Anh:

- hero signature
- header brand line
- footer brand line
- about/contact/membership references

dùng `Lan Anh Nguyen`

Trên toàn hệ technical:

- site name vẫn là `Nguyenlananh.com`
- organization có thể giữ `Nguyenlananh.com`
- không dùng `Lan Anh Nguyen` trong URL slug

### 3.3. Quy tắc không được lẫn

- Không để nút `Join` xen giữa menu tiếng Việt
- Không để heading tiếng Việt xuất hiện nguyên khối trên homepage EN
- Không để một page EN dùng `Nguyễn Lan Anh` ở UI-facing title nếu đó là phần brand display
- Không để một page VI dùng `Lan Anh Nguyen` ở nơi người đọc nhìn thấy đầu tiên

---

## 4. Tinh thần giao diện mới

### 4.1. Hướng tổng thể

Homepage phải cho cảm giác:

- bình tĩnh
- tin cậy
- trưởng thành
- sâu nhưng không nặng nề
- ít màu, nhiều chủ đích

### 4.2. Visual lock

Ưu tiên:

- nền sáng ngà hoặc be sáng
- typography nghiêm túc, bớt cảm giác startup/generic
- nhấn bằng màu đất, xanh xám, than, be
- hạn chế gradient rực và màu tím nổi
- ảnh/shape ít nhưng có chiều sâu

Tránh:

- coach style
- startup SaaS style
- landing page chốt sale gấp
- quá nhiều card giống nhau
- quá nhiều màu nhấn cạnh tranh nhau

### 4.3. Quy tắc chuyển động

- motion nhẹ
- reveal theo nhịp cuộn
- không rung, không bật nhảy nhiều
- CTA cần rõ nhưng không gắt

---

## 5. Mục tiêu homepage mới

Homepage phải làm được 2 việc khác nhau:

### 5.1. Trong 30 giây đầu

Người dùng phải hiểu ngay:

- đây là web về điều gì
- nó khác gì với blog/phát triển bản thân thông thường
- mình nên bắt đầu ở đâu
- nếu mình đã chạm, mình có thể bước vào hệ ngay

### 5.2. Trong 3 phút tiếp theo

Người dùng phải bị kéo tiếp bởi:

- vấn đề được gọi tên đúng
- phương pháp đủ khác biệt
- hệ nội dung đủ sâu
- có lựa chọn rõ giữa đọc thêm và đăng ký đồng hành

---

## 6. Homepage Architecture Mới

### 6.1. Thứ tự section đề xuất

Thứ tự này dùng thay cho homepage hiện tại ở phase nâng cấp.

1. Hero quyết định
2. Chọn đường vào hệ
3. Vấn đề thật của người đang mắc kẹt
4. Vì sao phải quay vào bên trong
5. Phương pháp 4 bước
6. Môn học dọn dẹp
7. Cái chổi
8. Âm thanh tự thân
9. Môi trường sống như một thân thể thứ hai
10. Kỷ luật nhẹ và nhịp sống mới
11. Lao động, vật thể và sự trưởng thành
12. Bản đồ public -> members -> deep
13. Bài viết nổi bật theo cụm
14. Hệ thành viên và hành trình bắt đầu
15. Dự án BƯỚC / đồng hành sâu
16. FAQ ngắn
17. Lời mời cuối

### 6.2. Giải thích logic

Phần 1 -> 5:
- tạo quyết định
- gọi đúng vấn đề
- làm rõ phương pháp

Phần 6 -> 11:
- thể hiện signature worldview của web
- biến website từ chỗ “nói hay” thành “có hệ nhận thức riêng”

Phần 12 -> 17:
- kéo người dùng sang hành động
- tránh việc đọc xong rồi rơi khỏi luồng

---

## 7. Hero Mới

### 7.1. Vai trò

Hero không chỉ để đẹp.
Hero là nơi chốt:

- định vị
- khác biệt
- CTA
- hướng vào membership

### 7.2. Cấu trúc hero

Hero nên có 3 lớp:

1. Headline lớn
2. Đoạn giải thích ngắn
3. 3 nút theo 3 mức cam kết

### 7.3. CTA hero khóa mới

Primary:
- `Bắt đầu từ đây`

Secondary:
- `Mở hệ thành viên từ 3 USD`

Tertiary:
- `Đọc 3 bài nên bắt đầu`

### 7.4. 3 đường vào hệ

Ngay dưới hero nên có block chọn đường:

- Tôi đang mắc kẹt -> vào `Hành trình`
- Tôi muốn bắt đầu thật -> vào `Join`
- Tôi cần đọc trước -> vào `3 bài public nền`

Block này cực quan trọng vì giảm ma sát quyết định.

---

## 8. Menu Mới

### 8.1. Menu public desktop đề xuất

Supersede menu public hiện tại.

Menu chính:

- `Trang chủ`
- `Hành trình`
- `Phương pháp`
- `Bài viết`
- `Dự án`
- `Thành viên`
- `Liên hệ`

CTA header:

- `Bắt đầu từ đây`

### 8.2. Menu EN desktop

- `Home`
- `Journey`
- `Method`
- `Articles`
- `Projects`
- `Membership`
- `Contact`

CTA header:

- `Start here`

### 8.3. Vì sao đổi

Menu mới tốt hơn vì:

- `Thành viên` là nhãn đúng hơn `Join`
- `Dự án` cần đứng như một trục hành động riêng
- public side nhìn trưởng thành hơn
- người dùng hiểu website là một hệ, không chỉ blog + sales page

### 8.4. Menu members đề xuất

Thay cho logic “Dashboard-first”.

Menu members phase mới:

- `Bắt đầu`
- `Hành trình`
- `Thực hành`
- `Chuyên đề sâu`
- `Trải nghiệm`
- `Nâng cấp`

EN:

- `Start`
- `Journey`
- `Practice`
- `Deep`
- `Experience`
- `Upgrade`

Ghi chú:
- `Dashboard` có thể vẫn tồn tại về route
- nhưng label user-facing nên ưu tiên hành trình, không ưu tiên control panel

---

## 9. Sitemap Phát Triển Mới

### 9.1. Public layer

```txt
/
/gioi-thieu/
/hanh-trinh/
/phuong-phap/
/chuong-trinh/
/bai-viet/
/bai-viet/[slug]/
/bai-viet/di-vao-ben-trong/
/bai-viet/gia-tri-noi-tai/
/bai-viet/mon-hoc-don-dep/
/bai-viet/lao-dong-sang-tao/
/bai-viet/dau-tu-ban-than/
/bai-viet/du-an-nhat-ky/
/du-an/
/du-an/du-an-buoc/
/du-an/du-an-37-ngay/
/join/
/faq/
/lien-he/
/chinh-sach-bao-mat/
/dieu-khoan/
/mien-tru-trach-nhiem/
```

### 9.2. Members layer phase mới

```txt
/members/
/members/start/
/members/journey/
/members/journey/day-1/
/members/journey/day-2/
/members/journey/day-7/
/members/practice/
/members/deep/
/members/deep/ban-do-vong-lap/
/members/deep/am-thanh-tu-than/
/members/deep/gia-dinh-va-goc-re/
/members/deep/tre-em-va-khong-gian-lon-len/
/members/deep/moi-truong-song-nhu-mot-than-the-thu-hai/
/members/deep/ky-luat-nhe-va-nhip-song-moi/
/members/deep/lao-dong-vat-the-va-su-truong-thanh/
/members/experience/
/members/pro/
```

### 9.3. Route note

Nếu team muốn giữ kỹ thuật đơn giản:

- `/members/` vẫn là home
- `/members/start/` là route onboarding đầu tiên
- sau login luôn redirect về `/members/start/` thay vì `/members/dashboard/`

---

## 10. Logic Public -> Join -> Deep

### 10.1. Luồng chuẩn mới

```txt
Homepage
-> 3 bài công khai quan trọng
-> Join
-> /members/start/
-> /members/journey/day-1/
-> /members/practice/
-> /members/deep/
-> /du-an/du-an-buoc/
```

### 10.2. Mỗi bài public phải làm gì

Mỗi bài public không chỉ kết ở:

- bài liên quan
- liên hệ

Mà phải có thêm:

- một cầu nối sang membership
- một câu “đọc tiếp hoặc bắt đầu thật”
- một deep topic tương ứng

### 10.3. Mapping public -> deep

Khóa mapping:

- `Những vòng lặp bạn chưa gọi tên` -> `/members/deep/ban-do-vong-lap/`
- `Âm thanh tự thân: khi một tiếng hát trở thành cách trở về` -> `/members/deep/am-thanh-tu-than/`
- `Gia đình không chỉ là nơi ta lớn lên` -> `/members/deep/gia-dinh-va-goc-re/`
- `Điều trẻ em cần không chỉ là dạy đúng` -> `/members/deep/tre-em-va-khong-gian-lon-len/`
- `Môi trường sống phản chiếu điều gì` -> `/members/deep/moi-truong-song-nhu-mot-than-the-thu-hai/`
- `Kỷ luật nhẹ nhàng nhưng đều đặn` -> `/members/deep/ky-luat-nhe-va-nhip-song-moi/`
- `Lao động như một bài học hiện diện` -> `/members/deep/lao-dong-vat-the-va-su-truong-thanh/`

---

## 11. Homepage Content Blocks Mới Cần Bổ Sung

### 11.1. Block `Chọn đường vào hệ`

Phải có ngay dưới hero.

Mục tiêu:

- giảm việc đọc lang thang
- tăng tỷ lệ click đúng intent

### 11.2. Block `Hệ thành viên bắt đầu như thế nào`

Nội dung phải nói rất rõ:

- đăng ký xong không đi vào thư viện bài viết
- người dùng đi vào một hành trình
- bắt đầu bằng onboarding
- mỗi ngày chỉ cần một bước thật

### 11.3. Block `Chuỗi sâu`

Trên homepage cần hiển thị rõ 3 tầng:

- Public articles
- Membership journey
- Deep topics

Để người dùng thấy đây là hệ có chiều sâu tăng dần.

---

## 12. Module 0–2 Cho Members

Phần này khóa để team dev/content dựng route và CMS đúng tinh thần.

---

## 12.1. MODULE 0

Type: `onboarding`
Slug: `/members/start/`
Order: `0`
Title: `Bạn đã bước vào một hệ khác`
Primary CTA label: `Bắt đầu ngày 1`
Primary CTA url: `/members/journey/day-1/`

### Copy

#### 1. Chào mừng

Bạn không mua một khóa học.

Bạn vừa bước vào một hệ.

Một hệ mà:

- không ai làm thay bạn
- không có đường tắt
- nhưng nếu đi đúng, bạn sẽ không quay lại con người cũ nữa

#### 2. Điều bạn cần hiểu ngay

Bạn không thiếu:

- kiến thức
- động lực
- khả năng

Bạn đang mắc kẹt vì:

- vòng lặp
- mô thức
- môi trường
- cách bạn vận hành chính mình

#### 3. Hệ này hoạt động như thế nào

Bạn sẽ không được “dạy”.

Bạn sẽ:

1. nhìn lại
2. gỡ
3. xây lại

#### 4. Luật chơi

Nếu bạn đọc cho biết, không có gì xảy ra.

Nếu bạn làm thật, mọi thứ sẽ thay đổi.

#### 5. Cách dùng hệ

Mỗi ngày chỉ cần:

- đọc 1 phần
- làm 1 việc
- ghi lại

Không cần nhanh.
Không cần hoàn hảo.
Chỉ cần thật.

#### 6. Bắt đầu

Đi tới:

`/members/journey/day-1/`

---

## 12.2. MODULE 1 - DAY 1

Type: `journey`
Slug: `/members/journey/day-1/`
Order: `1`
Title: `Bạn đang ở đâu?`
Primary CTA label: `Tiếp tục Day 2`
Primary CTA url: `/members/journey/day-2/`

### Copy

#### 1. Sự thật đầu tiên

Bạn không bị kẹt chỉ vì hoàn cảnh.

Bạn bị kẹt vì:

Bạn chưa thấy mình đủ rõ.

#### 2. Bài tập 1 - Quan sát

Ngồi xuống 10 phút.

Viết ra:

- Điều gì đang làm bạn mệt nhất?
- Điều gì bạn đang né?
- Bạn đang lặp lại điều gì?

Không chỉnh sửa.
Không cố viết hay.
Chỉ viết.

#### 3. Bài tập 2 - Môi trường

Nhìn xung quanh bạn.

Không gian bạn đang sống có:

- bừa bộn?
- ngột ngạt?
- thiếu ánh sáng?
- thiếu sức sống?

Viết ra:

`Môi trường của tôi đang phản chiếu điều gì về tôi?`

#### 4. Bài tập 3 - Vòng lặp

Hoàn thành câu:

`Tôi luôn...`

Ví dụ:

- Tôi luôn trì hoãn
- Tôi luôn bỏ dở
- Tôi luôn sợ

Viết ra 5 câu.

#### 5. Điều bạn sẽ bắt đầu thấy

- Bạn không kẹt ngẫu nhiên
- Bạn đang lặp
- Bạn chưa nhìn đủ rõ

#### 6. Lưu ý quan trọng

Đừng cố thay đổi ngay.

Hôm nay chỉ cần thấy.

#### 7. Ngày mai

Ngày mai bạn bắt đầu gỡ vòng lặp đầu tiên.

---

## 12.3. MODULE 1 - DAY 2

Type: `journey`
Slug: `/members/journey/day-2/`
Order: `2`
Title: `Gỡ vòng lặp đầu tiên`
Primary CTA label: `Tiếp tục hành trình`
Primary CTA url: `/members/practice/`

### Copy

#### 1. Sự thật

Bạn không cần làm nhiều hơn.

Bạn cần dừng lặp.

#### 2. Bài tập

Chọn 1 vòng lặp bạn đã thấy hôm qua.

Ví dụ:

- trì hoãn
- lướt điện thoại
- né việc khó

#### 3. Hành động

Hôm nay chỉ làm ngược lại 1 lần.

Ví dụ:

- thay vì né, làm 5 phút
- thay vì lướt, tắt 10 phút

#### 4. Quy tắc

Không cần hoàn hảo.

Chỉ cần phá nhịp lặp một lần thật.

#### 5. Ghi lại

- Bạn cảm thấy gì?
- Khó ở đâu?
- Điều gì xuất hiện?

---

## 12.4. MODULE 2 - DAY 7

Type: `journey`
Slug: `/members/journey/day-7/`
Order: `7`
Title: `Bạn bắt đầu xây lại`
Primary CTA label: `Tiếp tục hành trình`
Primary CTA url: `/members/deep/`

### Copy

#### 1. Sự thật

Bạn không xây cuộc đời bằng ý tưởng.

Bạn xây bằng hành vi.

#### 2. Bài tập - Không gian

Chọn 1 góc:

- bàn làm việc
- phòng
- góc nhỏ

Dọn lại hoàn toàn.

#### 3. Quy tắc

- không làm nhanh
- không làm cho xong
- làm có ý thức

#### 4. Khi bạn dọn

Bạn sẽ thấy:

- bạn vội thế nào
- bạn bừa thế nào
- bạn né thế nào

#### 5. Điều đang xảy ra

Bạn không chỉ dọn.

Bạn đang xây lại chính mình.

#### 6. Lặp lại

Mỗi ngày:

1 góc nhỏ.

---

## 12.5. PRACTICE

Type: `practice`
Slug: `/members/practice/`
Title: `Hệ thực hành mỗi ngày`
Primary CTA label: `Tiếp tục hành trình sâu hơn`
Primary CTA url: `/members/deep/`

### Copy

#### DAILY

1. Quan sát 5 phút
2. Dọn 10-20 phút
3. Viết 5 phút
4. Hành động 1 việc

#### WEEKLY

- nhìn lại
- điều chỉnh
- bỏ bớt

#### RULE

Không hoàn hảo.
Không cố.
Không diễn.

Chỉ làm thật.

---

## 12.6. DEEP ENTRY

Type: `deep`
Slug: `/members/deep/`
Title: `Khi bạn đã bắt đầu thấy`
Primary CTA label: `Xem Dự án BƯỚC`
Primary CTA url: `/du-an/du-an-buoc/`

### Copy định vị

Bạn sẽ bắt đầu thấy:

- mình không phải nạn nhân
- mình đang lặp
- mình có thể đổi

Nhưng bạn cũng sẽ gặp:

- sợ
- lười
- muốn quay lại

Đây là lúc bạn cần:

- môi trường
- hệ
- đồng hành

---

## 13. UI Lock Cho Members Module 0-2

- nền trắng hoặc be sáng
- chữ đen/xám đậm
- khoảng thở lớn
- 1 cột đọc chính
- CTA cuối mỗi module rõ nhưng mềm
- mobile là ưu tiên số 1

Không làm:

- dashboard kiểu productivity app
- sidebar dày đặc
- quá nhiều badge/metrics
- cảm giác “bị quản trị”

Mục tiêu là:

- người dùng thấy đang được dẫn đường
- không thấy mình vừa vào một hệ thống phức tạp

---

## 14. Checklist Cho Team Dev

### 14.1. Brand

- thay toàn bộ EN display brand từ `Nguyễn Lan Anh` sang `Lan Anh Nguyen`
- bỏ `Join` khỏi menu tiếng Việt, thay bằng `Thành viên`
- rà toàn bộ homepage EN, bỏ text tiếng Việt ở UI-facing content

### 14.2. Homepage

- dựng lại thứ tự section theo file này
- thêm block `Chọn đường vào hệ`
- thêm block `Hệ thành viên bắt đầu như thế nào`
- thêm block `Public -> Members -> Deep`

### 14.3. Members

- tạo route `/members/start/`
- tạo route `/members/journey/day-1/`
- tạo route `/members/journey/day-2/`
- tạo route `/members/journey/day-7/`
- sau login redirect về `/members/start/`
- mọi module mới phải noindex,follow

### 14.4. Content bridges

- mỗi bài public mới phải có CTA sang `join`
- mỗi bài public phải map rõ sang 1 deep topic
- deep index phải hiện đúng thứ tự roadmap

---

## 15. Definition Of Done

Chỉ coi phase này là xong khi đủ:

- brand VI/EN nhất quán
- homepage khiến người mới hiểu site trong 30 giây
- người đọc có thể bị giữ ở lại ít nhất 3 phút bằng flow section hợp lý
- menu public và menu members không còn gây nhầm lẫn
- `/members/start/` và day-route đầu tiên đã có
- public -> join -> members -> deep đã thành một hệ
- team dev chỉ cần bám file này là dựng được đúng logic

---

## 16. Kết luận

Nguyenlananh.com ở phase mới không nên được nhìn như:

- một website nội dung đẹp hơn
- một homepage có thêm vài section
- một members area có thêm vài route

Nó phải được nâng thành:

- một thương hiệu có trật tự rõ
- một homepage ra quyết định nhanh
- một hệ hành trình sau đăng ký đủ giữ người dùng
- một cấu trúc đủ lớn để tiếp tục mở sâu trong 6-12 tháng tới
