# NguyenLanAnh Step 2-3 Paid Member, Program, Commerce, Creator Master Plan

Date: 2026-04-29  
Status: STRATEGY LOCK - ready for content/dev execution  
Scope: Sau public 10 pillar articles, thiết kế toàn bộ hệ trả phí, chương trình chuyên sâu, chủ đề bán, cộng tác viên/creator, admin/CMS và lần cập nhật homepage sau cùng.

---

## 1. Kết luận nghiên cứu hiện trạng

Repo hiện đã có nền tốt, nhưng các mảnh đang nằm rời nhau:

- Public content: 10 pillar articles đã có docs canon + HTML public.
- Join: `/join/` đang đi theo hướng đúng: đăng ký miễn phí trước, magic link, không ép mua ngoài public.
- Member core: `/members/dashboard/`, `/members/start/`, `/members/journey/day-1/`, `/members/journey/day-2/`, `/members/journey/day-7/`, `/members/practice/`, `/members/experience/`.
- Deep layer: `/members/deep/` đã có 10 topic route thực tế, gồm loop, âm thanh tự thân, gia đình, trẻ em, môi trường, kỷ luật, lao động vật thể, ranh giới, đối thoại, nhịp sống số.
- Pro layer: `/members/pro/` đang có 6 gói: reset, inner, discipline, environment, creation, wealth.
- Creator layer: `/members/creator/` đã có guideline, submit, library, revenue-share.
- Payment/runtime: plans hiện tại trong `functions/_lib/constants.js`: `year1`, `year2`, `year3`; D1 có users, orders, magic links, email jobs, VietQR orders.
- Admin: skeleton admin/content/members/creators/settings đã có, nhưng chưa có content/product/package workflow thật.

Khoảng thiếu chiến lược:

1. Chưa có cây nội dung trả phí nối trực tiếp từ 10 public pillars sang member/deep/pro.
2. Pro layer thiếu hai trục quan trọng nếu muốn "không thiếu trụ cột": family/relationship và children/education.
3. Các gói trả phí chưa được mô tả theo outcome, readiness, content unlock, và upsell logic.
4. Creator/cộng tác viên mới có workflow skeleton, chưa có curriculum để đào tạo họ làm web/content đúng chuẩn NguyenLanAnh.
5. CMS/admin chưa có mô hình dữ liệu cho chương trình, module, lesson, worksheet, offer, entitlement, creator submission.
6. Homepage chưa nên sửa ngay; cần đợi khi sản phẩm trả phí và creator layer có cấu trúc thật để homepage không hứa quá sớm.

---

## 2. Tầm nhìn sản phẩm lõi

NguyenLanAnh.com không nên phát triển thành "blog có paywall". Hệ đúng là:

```text
Public Pillars
  -> Free Join
  -> Core Member Journey
  -> Paid Deep Programs
  -> Pro Tracks
  -> Creator/Collaborator Layer
  -> Admin/CMS/Commerce Operations
  -> Homepage Refresh
```

Nguyên tắc:

- Public articles tạo trust, không bán mạnh.
- Free join tạo quan hệ đồng hành nhẹ, không dùng giá làm hook ngoài public.
- Paid core mở khi người dùng đã thấy mình cần đi theo một lộ trình.
- Deep programs biến bài viết thành thực hành có cấu trúc.
- Pro tracks là gói có outcome rõ, không phải bài đọc thêm.
- Creator layer chỉ mở cho người đủ điều kiện, không public hóa payout/commission.
- Homepage chỉ cập nhật sau khi hệ có đủ sản phẩm, route, nội dung, entitlement và admin vận hành.

---

## 3. Mô hình access và gói trả phí

### 3.1. Free Member

Route:

- `/join/`
- `/members/start/`
- `/members/dashboard/`

Mục tiêu:

- xác nhận email
- hoàn thiện profile
- nhìn thấy bản đồ hệ
- làm bài tự định vị ngắn
- hiểu mình nên bắt đầu từ đâu

Nội dung mở:

- Orientation
- Day 1 preview
- Practice checklist nhẹ
- Program chooser
- CTA mở `Core Access`

Không mở:

- full deep modules
- full pro lessons
- creator layer
- revenue/payout docs

### 3.2. Core Access - Year 1

Plan code hiện tại: `year1`  
Vai trò: vào hệ thật, không chỉ đọc.

Nội dung mở:

- Day 1 -> Day 7 foundation
- 30 ngày core practice
- 10 pillar companion lessons
- worksheets cơ bản
- progress tracking
- Deep topic preview từng trục

Outcome:

- thành viên gọi tên được vòng lặp chính
- có nhịp thực hành hằng ngày
- biết mình nên đi vào deep topic nào
- không còn đọc public articles như nội dung rời rạc

### 3.3. Deep Continuity - Year 2

Plan code hiện tại: `year2`  
Vai trò: mở toàn bộ deep layer và lộ trình 90 ngày.

Nội dung mở:

- 10 deep topic tracks theo 10 pillar articles
- existing deep extension topics
- weekly reflection templates
- printable worksheets
- case library nội bộ
- monthly review prompts

Outcome:

- thành viên làm việc được với cá nhân, gia đình, môi trường, trẻ em, lao động sáng tạo, đầu tư bản thân
- có bằng chứng thực hành qua nhật ký/tracker
- đủ nền để chọn Pro track đúng

### 3.4. Mastery / Pro - Year 3+

Plan code hiện tại: `year3`  
Vai trò: mở Pro tracks và hướng creator/cộng tác viên nếu đủ điều kiện.

Nội dung mở:

- 8 Pro tracks khuyến nghị
- program-specific workbook
- implementation plan 30/60/90 ngày
- submission path vào creator layer
- review checklist nội bộ

Existing 6 Pro tracks:

- Reset Life
- Inner
- Discipline
- Environment
- Creation
- Wealth

Hai Pro tracks cần thêm để không thiếu trụ cột:

- Family & Relationship Systems
- Children & Education Environment

Nếu chưa muốn thêm route ngay, có thể Phase 1 đặt hai trục này trong Deep, nhưng roadmap phải ghi rõ đây là gap cần đóng.

---

## 4. Bản đồ từ 10 public pillars sang paid journey

| Public pillar | Paid Core lesson | Deep track | Pro upsell | Creator/collab skill |
|---|---|---|---|---|
| Bốn Trục | Dùng 4 trục để tự định vị | 4-Axis Life Audit | Reset Life / Inner | Viết nội dung theo 4 trục |
| Cái Chổi | Việc nhỏ và nhịp sống thật | Manual Work Practice | Discipline / Environment | Thiết kế practice nhỏ cho web |
| Vòng Lặp | Gọi tên trigger và phản ứng | Loop Map | Inner / Reset Life | Biên tập case loop an toàn |
| Im Lặng | 5 phút không lấp | Silence Practice | Inner / Reset Life | Viết bài không giảng, có khoảng thở |
| Hệ Gia Đình | Vai trò và phản xạ gốc | Family Systems | Family & Relationship | Case family không đổ lỗi |
| Cô Đơn | Kết nối với chính mình | Self-Connection | Inner / Relationship | Community moderation nhẹ |
| Môi Trường | Không gian đang dạy gì | Environment as Teacher | Environment | Audit UX/content environment |
| Trẻ Em | Không làm gãy tự nhiên | Child Growth | Children & Education | Nội dung trẻ em có ranh giới |
| Lao Động Sáng Tạo | Hiện diện với việc làm | Creative Labor | Creation / Discipline | Hướng dẫn làm asset/content |
| Đầu Tư Bản Thân | Chọn đúng, không mua ảo tưởng | Right Investment | Wealth / Reset Life | Viết offer không phóng đại |

---

## 5. Chuỗi nội dung trả phí theo từng pillar

Mỗi pillar public cần một paid companion chain gồm:

- 1 orientation lesson
- 3-5 deep lessons
- 1 worksheet/practice
- 1 case hoặc self-audit
- 1 next-step chooser

### Pillar 01 - Bốn Trục

Paid chain:

1. `Core 01.1 - Đời sống hiện tại của tôi đang lệch ở trục nào`
2. `Core 01.2 - Quan sát mà không phán xét`
3. `Core 01.3 - Cảm nhận mà không chìm`
4. `Core 01.4 - Hành động nhỏ tạo bằng chứng`
5. `Core 01.5 - Chuyển hóa như đổi chất, không như mục tiêu`
6. `Worksheet - 4-Axis Life Audit`
7. `Chooser - Tôi nên vào Reset, Inner hay Discipline`

### Pillar 02 - Cái Chổi

Paid chain:

1. `Core 02.1 - Việc nhỏ không ai thấy`
2. `Core 02.2 - Dọn một góc để thấy một vòng lặp`
3. `Core 02.3 - Lao động tay chân và hệ thần kinh`
4. `Core 02.4 - Khi việc nhà là gánh nặng, không phải practice`
5. `Core 02.5 - 7 ngày trả đời sống về mặt đất`
6. `Worksheet - Manual Work Tracker`
7. `Chooser - Discipline hay Environment`

### Pillar 03 - Vòng Lặp

Paid chain:

1. `Deep 03.1 - Trigger: điều chạm đúng dây cũ`
2. `Deep 03.2 - Phản ứng: né, gồng, kiểm soát, chiều lòng`
3. `Deep 03.3 - Cái giá: năng lượng, quan hệ, tự trọng`
4. `Deep 03.4 - Niềm tin được củng cố sau mỗi vòng`
5. `Deep 03.5 - Một thay đổi nhỏ trước khi vòng khép lại`
6. `Worksheet - Loop Map`
7. `Case Library - 5 vòng lặp thường gặp`

### Pillar 04 - Im Lặng

Paid chain:

1. `Deep 04.1 - Tôi dùng tiếng ồn nào để không nghe mình`
2. `Deep 04.2 - 5 phút đầu tiên và cơ chế bỏ chạy`
3. `Deep 04.3 - Im lặng trong quan hệ`
4. `Deep 04.4 - Không làm gì mà vẫn ổn`
5. `Deep 04.5 - 7 ngày khoảng trống thật`
6. `Worksheet - Silence Log`
7. `Chooser - Inner hay Reset`

### Pillar 05 - Hệ Gia Đình

Paid chain:

1. `Deep 05.1 - Vai trò tôi đã nhận khi còn nhỏ`
2. `Deep 05.2 - Trung thành vô thức`
3. `Deep 05.3 - Né bằng giận và né bằng tha thứ ép`
4. `Deep 05.4 - Về nhà mà không trở thành đứa trẻ cũ`
5. `Deep 05.5 - Không truyền tiếp`
6. `Worksheet - Family Role Map`
7. `Chooser - Family Systems hay Children`

### Pillar 06 - Cô Đơn

Paid chain:

1. `Deep 06.1 - Tôi đang đưa phiên bản nào ra cho người khác`
2. `Deep 06.2 - Vai trò giữ quan hệ và cái giá`
3. `Deep 06.3 - Một mình không phải cô đơn`
4. `Deep 06.4 - Gặp người vì có mặt, không vì sợ`
5. `Deep 06.5 - Quan hệ với chính mình`
6. `Worksheet - Self-Connection Audit`
7. `Practice - Một buổi tối không lấp`

### Pillar 07 - Môi Trường

Paid chain:

1. `Deep 07.1 - Môi trường đang dạy tôi thành ai`
2. `Deep 07.2 - Căn phòng, bàn làm việc, điện thoại`
3. `Deep 07.3 - Môi trường số và nguồn vào`
4. `Deep 07.4 - Vi môi trường đúng`
5. `Deep 07.5 - 14 ngày chỉnh một góc sống`
6. `Worksheet - Environment Audit`
7. `Chooser - Environment Pro`

### Pillar 08 - Trẻ Em

Paid chain:

1. `Deep 08.1 - Khi người lớn muốn sửa trẻ quá nhanh`
2. `Deep 08.2 - Ranh giới khác với bẻ gãy`
3. `Deep 08.3 - Thành tích và điều kiện được yêu`
4. `Deep 08.4 - Màn hình như một môi trường nuôi dạy`
5. `Deep 08.5 - Đời sống thật để trẻ có đất sống`
6. `Worksheet - Child Environment Map`
7. `Practice - 3 giây trước khi sửa trẻ`

### Pillar 09 - Lao Động Sáng Tạo

Paid chain:

1. `Deep 09.1 - Đầu ra không phải toàn bộ sáng tạo`
2. `Deep 09.2 - Lao động và cảm hứng`
3. `Deep 09.3 - Chịu được bản nháp chưa hay`
4. `Deep 09.4 - Khoảng chưa ai nhìn thấy`
5. `Deep 09.5 - Giữ dòng sáng tạo 30 ngày`
6. `Worksheet - Creative Labor Log`
7. `Chooser - Creation hay Discipline`

### Pillar 10 - Đầu Tư Bản Thân

Paid chain:

1. `Deep 10.1 - Đầu tư hay mua cảm giác`
2. `Deep 10.2 - Đời sống hiện tại thật sự cần gì`
3. `Deep 10.3 - Lịch tuần sau có chỗ cho khoản đầu tư không`
4. `Deep 10.4 - Bớt đúng là một khoản đầu tư`
5. `Deep 10.5 - Bằng chứng nhỏ sau khi đầu tư`
6. `Worksheet - Right Investment Filter`
7. `Chooser - Wealth, Reset hay Core Continuity`

---

## 6. Deep layer hoàn chỉnh

Deep layer nên có 3 tầng, tổng 12 track:

### Tầng A - Self Foundation

1. Loop Map
2. Silence Practice
3. Self-Connection
4. Four Axes Audit

### Tầng B - Life Systems

5. Family Systems
6. Environment as Teacher
7. Gentle Discipline
8. Creative Labor
9. Right Investment

### Tầng C - Relational / Next Generation

10. Children Without Breaking Nature
11. Soft Boundaries in Family
12. Dialogue at Home

Mỗi track bắt buộc có:

- intro
- 5 lessons
- 1 worksheet
- 1 seven-day practice
- 1 caution note
- 1 next-step chooser
- interlinks về `Practice`, `Experience`, `Dashboard`

---

## 7. Pro program architecture

### 7.1. Existing 6 Pro tracks

| Track | Route | Outcome |
|---|---|---|
| Reset Life | `/members/pro/reset/` | Tái thiết điểm bắt đầu trong 30 ngày |
| Inner | `/members/pro/inner/` | Làm việc với niềm tin, cảm xúc, phản ứng gốc |
| Discipline | `/members/pro/discipline/` | Xây nhịp hành động bền, không ép ý chí |
| Environment | `/members/pro/environment/` | Thiết kế môi trường sống hỗ trợ nhịp mới |
| Creation | `/members/pro/creation/` | Mở dòng lao động sáng tạo có sản phẩm thật |
| Wealth | `/members/pro/wealth/` | Đầu tư, tiền, lựa chọn và tự do tương lai |

### 7.2. Required 2 new Pro tracks

| Track | Suggested route | Outcome |
|---|---|---|
| Family & Relationship Systems | `/members/pro/family/` | Đặt lại vai trò, ranh giới, đối thoại và sự gần gũi |
| Children & Education Environment | `/members/pro/children/` | Xây môi trường lớn lên cho trẻ mà không lặp phản xạ cũ |

### 7.3. Mỗi Pro track cần 8 module

1. Positioning: track này dành cho ai, không dành cho ai.
2. Diagnostic: self-audit hoặc situation map.
3. Root Pattern: mô thức gốc đang vận hành.
4. Daily Practice: việc làm hằng ngày.
5. System Design: cấu trúc mới trong đời sống.
6. Failure Pattern: khi lặp lại, quay về đâu.
7. 30-Day Plan: tuần 1-4.
8. Integration: chọn bước tiếp hoặc creator path.

---

## 8. Chủ đề bán và choose-right funnel

Không bán bằng hype. Bán bằng chọn đúng.

### 8.1. Public sales themes

1. `Tôi nên bắt đầu từ đâu`
2. `Khi nào chỉ đọc bài là đủ, khi nào cần vào hệ`
3. `Core Access không phải khóa học`
4. `Deep không phải đọc thêm`
5. `Pro chỉ mở khi đã có nhịp`
6. `Đầu tư bản thân không mua cảm giác`

### 8.2. Member sales themes

1. `Bạn đang kẹt ở tầng nào`
2. `Tín hiệu đã sẵn sàng vào Deep`
3. `Tín hiệu chưa nên vào Pro`
4. `Chọn Reset, Inner hay Discipline`
5. `Chọn Environment, Creation hay Wealth`
6. `Chọn Family hay Children`

### 8.3. Program chooser logic

Questions:

1. Tôi đang kẹt vì rối tổng thể hay một mảng cụ thể?
2. Tôi đã giữ được practice tối thiểu 7 ngày chưa?
3. Tôi đang cần nhìn gốc, đổi nhịp, đổi môi trường, hay làm ra sản phẩm?
4. Vấn đề chính nằm trong bản thân, gia đình, trẻ em, sáng tạo hay tiền?
5. Tôi có thời gian thật trong tuần tới không?

Outputs:

- chưa sẵn sàng trả phí -> Free/Core orientation
- rối tổng thể -> Reset Life
- phản ứng nội tâm -> Inner
- làm không đều -> Discipline
- môi trường kéo xuống -> Environment
- muốn sáng tạo có sản phẩm -> Creation
- tiền/đầu tư/lựa chọn -> Wealth
- gia đình/quan hệ -> Family
- trẻ em/giáo dục -> Children

---

## 9. Creator / cộng tác viên web system

Creator layer không phải tuyển người viết tự do đại trà. Đó là hệ cộng tác viên đủ hiểu voice và biết bảo vệ chất lượng.

### 9.1. Vai trò cộng tác viên

1. Content contributor: viết bài/case/practice.
2. Editor: kiểm voice, logic, không giảng, không hype.
3. Translator/native EN: chuyển EN theo meaning, không dịch máy.
4. Practice designer: biến bài thành worksheet/challenge.
5. Web content operator: đưa nội dung vào CMS/static, kiểm route, meta, links.
6. Visual assistant: chuẩn bị image brief, alt, asset naming.
7. Community moderator: phản hồi nhẹ, không tư vấn quá phạm vi.
8. Program coordinator: theo dõi lesson, progress, submission.

### 9.2. Creator training curriculum

1. `Creator 01 - Voice lock của NguyenLanAnh`
2. `Creator 02 - Viết không giảng, không chữa, không hứa`
3. `Creator 03 - Biến một public pillar thành paid practice`
4. `Creator 04 - Case thật: dùng được mà không xâm phạm riêng tư`
5. `Creator 05 - Internal links và route ổn định`
6. `Creator 06 - SEO/meta mà không phá giọng`
7. `Creator 07 - EN meaning adaptation`
8. `Creator 08 - Worksheet và 7-day practice`
9. `Creator 09 - Submission packet chuẩn`
10. `Creator 10 - Review, revision, approval, revenue ops`

### 9.3. Submission packet

Mỗi cộng tác viên gửi đủ:

- title
- intended route
- pillar/program mapped
- VI draft
- EN draft hoặc EN brief
- practice block
- reflection prompts
- caution note nếu liên quan thân tâm/gia đình/trẻ em
- internal links stable
- image brief + alt
- ownership note

### 9.4. Review rubric

Reject nếu:

- dùng hype, promise, breakthrough, life-change illusion
- giọng trị liệu/chữa lành quá phạm vi
- đổ lỗi gia đình hoặc lý tưởng hóa gia đình
- bán bằng sợ hãi
- thiếu practice
- hard-code route chưa build
- dùng case thật có khả năng nhận diện người

Approve nếu:

- đúng voice
- có đường thực hành
- có ranh giới chuyên môn
- đủ VI/EN hoặc EN brief tốt
- gắn đúng pillar/program
- có CTA phù hợp tầng access

---

## 10. CMS/admin data model cần thêm

Collections cần có:

### 10.1. `programs`

- `id`
- `slug`
- `title_vi`
- `title_en`
- `tier_required`
- `plan_codes`
- `positioning_vi`
- `positioning_en`
- `outcome_vi`
- `outcome_en`
- `status`
- `sort_order`

### 10.2. `program_modules`

- `id`
- `program_id`
- `module_order`
- `title_vi`
- `title_en`
- `summary_vi`
- `summary_en`
- `practice_id`
- `status`

### 10.3. `lessons`

- `id`
- `module_id`
- `route`
- `locale`
- `content_version`
- `body`
- `reflection_prompts`
- `cta`
- `caution_note`
- `status`

### 10.4. `worksheets`

- `id`
- `slug`
- `title`
- `fields_json`
- `download_asset`
- `tier_required`
- `status`

### 10.5. `offers`

- `id`
- `plan_code`
- `program_id`
- `price_usd`
- `price_vnd`
- `included_routes`
- `checkout_provider_rules`
- `refund_policy_id`
- `status`

### 10.6. `entitlements`

- `id`
- `user_id`
- `plan_code`
- `program_id`
- `route_pattern`
- `expires_at`
- `source_order_id`
- `status`

### 10.7. `creator_submissions`

- `id`
- `creator_user_id`
- `submission_type`
- `title`
- `pillar_mapped`
- `program_mapped`
- `payload_json`
- `status`
- `reviewer_id`
- `decision_note`
- `created_at`
- `updated_at`

### 10.8. `audit_logs`

- `id`
- `actor_id`
- `action`
- `entity_type`
- `entity_id`
- `before_json`
- `after_json`
- `reason`
- `created_at`

---

## 11. Admin workflow

Admin must support:

1. Content inventory by route.
2. Draft -> review -> approved -> published -> archived.
3. Program builder: program -> modules -> lessons -> worksheets.
4. Offer builder: plan -> entitlement -> checkout copy.
5. Member view: plan, progress, last activity, stuck signal.
6. Creator queue: submitted, revision, approved, rejected.
7. Audit logs for non-read actions.
8. Release checklist: route smoke, EN/VI check, internal links, noindex/index policy.

---

## 12. Homepage refresh - chỉ làm sau

Không cập nhật homepage ngay.

Chỉ cập nhật homepage khi các điều kiện sau xong:

- 10 public pillars live.
- Paid member content map locked.
- Core Access/Deep/Pro package copy locked.
- Program chooser có logic thật.
- Creator layer có guideline/curriculum.
- Admin/CMS workflow có route hoặc docs clear.
- Payment entitlements map với plans.

Homepage sau cùng cần thể hiện:

1. Hệ public writings.
2. Free join.
3. Member journey.
4. Deep programs.
5. Pro tracks.
6. Creator/collaborator layer chỉ như internal path, không public doanh thu.
7. CTA chính: bắt đầu bằng một bài viết hoặc free join, không ép mua ngay.

---

## 13. Definition of done cho Step 2-3

Step 2-3 chỉ được coi là xong khi có đủ:

- master plan này.
- implementation plan chi tiết cho dev/content/admin.
- content matrix từ 10 pillars sang paid lessons.
- program/package map.
- creator/collaborator curriculum.
- CMS/admin data model.
- homepage refresh checklist.
- report timestamp cho team dev.
- chưa update homepage trước khi đủ các bước trên.

