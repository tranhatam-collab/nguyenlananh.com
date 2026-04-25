# NGUYENLANANH_EDU_SYSTEM_DEV_SPEC_2026.md

**Dự án:** nguyenlananh.com  
**Mục tiêu:** Biến website hiện tại thành một hệ học tập động có membership, check-in, payment, email automation, nội dung 12 tháng, và dashboard giữ nhịp.  
**Trạng thái:** Dev-ready master spec v1.0  
**Ngôn ngữ ưu tiên:** Tiếng Việt trước, tiếng Anh sau.  
**Nguyên tắc thương hiệu:** Đi chậm. Đi thật. Đi sâu. Không bán quá sớm. Không hứa kết quả tuyệt đối. Không biến hành trình nội tâm thành một trang bán khóa học thông thường.

---

## 0. Kết luận chiến lược

nguyenlananh.com hiện đã có nền tảng đúng: trang chủ nói rõ đây không phải website truyền cảm hứng đơn thuần, mà là một hệ hành trình để nhìn, gỡ, và xây lại theo nhịp có thật. Trang hiện cũng đã có luồng đăng ký miễn phí, magic link, profile đồng hành, và nguyên tắc chỉ mở giá sau khi người dùng đã vào hệ và hoàn thiện profile.

Vì vậy, hướng nâng cấp đúng không phải là biến trang thành landing page bán hàng mạnh, mà là xây thành **Guided Inner Practice Membership OS**:

1. Người dùng đọc bài nền tảng.
2. Người dùng đăng ký miễn phí bằng email hoặc Google.
3. Người dùng hoàn thiện profile đồng hành.
4. Hệ xác định điểm bắt đầu.
5. Hệ mở lộ trình 30 ngày đầu, sau đó 90 ngày.
6. Người dùng học theo ngày, làm bài tập, check-in.
7. Email tự động giữ nhịp nếu người dùng bỏ cuộc.
8. Giá và gói trả phí chỉ xuất hiện đúng thời điểm.
9. Nội dung công khai phục vụ SEO; nội dung bên trong phục vụ chuyển đổi và giữ chân.
10. Dashboard giúp người dùng thấy mình đang đi tiếp, không bị thả vào thư viện rối.

---

## 1. Phạm vi launch chuẩn 30 ngày

Trong 30 ngày đầu, không triển khai đầy đủ 9 tier như một hệ hoàn chỉnh phức tạp. Cần thiết kế toàn bộ schema đủ cho 9 tier, nhưng chỉ bật công khai:

- Free Member
- Tier A: START
- Tier B: FOUNDATION
- Tier C: DISCIPLINE

Các tier 4 đến 9 được seed trong hệ thống nhưng để trạng thái `private`, `invite_only`, hoặc `application`.

### Launch scope bắt buộc

- Trang public SEO động.
- Trang bài viết/hub có internal link.
- Đăng ký miễn phí bằng magic link.
- Google login.
- Profile đồng hành cơ bản.
- Dashboard member.
- Lộ trình 30 ngày đầu.
- Check-in daily.
- Weekly review.
- Email automation cơ bản.
- Payment Stripe.
- Payment PayPal.
- QR Việt Nam theo đơn hàng.
- Admin xem user, payment, check-in, email log.
- 30 ngày nội dung seed thật.
- 10 bài public SEO mở đầu.
- Cơ chế khóa/mở bài theo ngày.
- Tracking sự kiện cơ bản.

---

## 2. Định vị sản phẩm

### Tên nội bộ trong code

```txt
NGUYENLANANH_GUIDED_JOURNEY_OS
```

### Tên hiển thị cho người dùng

```txt
Hệ hành trình 90 ngày
```

Hoặc:

```txt
Hành trình nhìn, gỡ, xây lại
```

### Không định vị là

- Website truyền cảm hứng.
- Khóa học chữa lành.
- Coaching hứa kết quả.
- Mạng xã hội đại trà.
- Thư viện bài viết khổng lồ.
- Nơi bán giá trước khi người dùng hiểu mình cần gì.

### Định vị đúng

> Một hệ hành trình giúp người dùng nhìn rõ vòng lặp đang vận hành mình, gỡ từng phản xạ cũ bằng hành động nhỏ, và xây lại nhịp sống bằng check-in, nội dung, thực hành, email nhắc nhở và dashboard theo dõi.

---

## 3. Architecture tổng thể

```txt
PUBLIC WEB
  -> Home, Journey, Method, Articles, Membership, Join
AUTH LAYER
  -> Magic Link, Google Login, Profile Intake
MEMBER APP
  -> Today, Journey Map, Lesson, Check-in, Progress, Library, Billing, Account
AUTOMATION
  -> Daily lesson email, Check-in reminder, Missed streak recovery, Weekly report, Upgrade trigger
PAYMENT
  -> Stripe, PayPal, VietQR
ADMIN
  -> Users, Lessons, Plans, Payments, Check-ins, Email Logs, KPI
```

---

## 4. Pricing chuẩn hóa

### Vấn đề cần sửa

Nếu nói “năm giảm 2 tháng”, giá năm phải bằng **giá tháng nhân 10**. Ví dụ $19/tháng thì năm giảm 2 tháng là $190/năm. Con số $152 là giảm sâu hơn, tương đương 8 tháng, không phải giảm 2 tháng.

Vì vậy hệ nên có hai loại giá:

1. **Annual 2 months free:** giá tháng nhân 10.
2. **Founder Launch Price:** giá ưu đãi sâu hơn, dùng trong thời gian giới hạn.

| Tier | Tên | Giá tuần | Giá tháng | Năm giảm 2 tháng | Founder launch optional | Trạng thái launch |
|---|---|---:|---:|---:|---:|---|
| Free | Member | $0 | $0 | $0 | $0 | Live |
| A | START | $7 | $19 | $190 | $152 | Live |
| B | FOUNDATION | $14 | $39 | $390 | $312 | Live |
| C | DISCIPLINE | $21 | $59 | $590 | $472 | Live |
| D | REBUILD | $35 | $99 | $990 | $792 | Private |
| E | INNER MASTER | $49 | $149 | $1490 | $1192 | Private |
| F | CREATOR | $63 | $199 | $1990 | $1592 | Private |
| G | MENTOR | Không dùng tuần | $299 | $2990 | $2392 | Invite |
| H | PRO GROUP | Không dùng tuần | $499 | $4990 | $3992 | Invite |
| I | INNER CIRCLE | Application | $300-$1000 | Custom | Custom | Application |

### Quy tắc hiển thị giá

- Trang chủ không hiển thị bảng giá dày.
- Trang join chỉ hiển thị đăng ký miễn phí.
- Giá chỉ hiện sau khi user xác nhận email, hoàn thiện profile, và xem xong trang “điểm bắt đầu”.
- Pricing screen cần có câu: “Bạn không cần mua để chứng minh điều gì. Chỉ mở khóa khi bạn thật sự muốn giữ nhịp đi tiếp.”

---

## 5. 9 lớp học

### Giai đoạn 1: Thức tỉnh

1. **START**: 30 ngày đầu, bài tập nhỏ, check-in nhẹ.
2. **FOUNDATION**: 90 ngày core, vòng lặp, môi trường sống, nhịp lao động, bản đồ hành vi.
3. **DISCIPLINE**: 90 ngày + practice library + weekly report nâng cao.

### Giai đoạn 2: Xây lại

4. **REBUILD**: Xây lại nhịp sống, môi trường, thói quen, cách làm việc.
5. **INNER MASTER**: Nhìn sâu cấu trúc bên trong, các phản xạ và điểm nghẽn chính.
6. **CREATOR**: Chuyển nội lực thành sáng tạo, công việc, sản phẩm, giá trị.

### Giai đoạn 3: Mở rộng

7. **MENTOR**: Dẫn nhóm nhỏ, tạo giá trị cho người khác.
8. **PRO GROUP**: Nhóm chuyên sâu, cohort, review định kỳ.
9. **INNER CIRCLE**: Đồng hành 1:1 hoặc nhóm chọn lọc, application only.

---

## 6. Learning flow chuẩn

```txt
Read -> Reflect -> Practice -> Check-in -> Feedback -> Unlock -> Weekly Review -> Level Up
```

Một lesson chuẩn gồm:

- `title_vi`, `title_en`
- `slug_vi`, `slug_en`
- `day_number`, `path`, `stage`
- `public_seo_summary`
- `member_intro`
- `core_insight`
- `deep_lesson`
- `practice_step`
- `checkin_questions`
- `image_prompt`, `image_alt_vi`
- `email_subject`, `email_preview`
- `unlock_rule`, `related_articles`, `related_lessons`

Unlock rule:

- Free member: xem Day 1 đến Day 3.
- START: xem 30 ngày đầu.
- FOUNDATION: xem 90 ngày core.
- DISCIPLINE: xem 90 ngày + practice library + weekly report nâng cao.
- REBUILD trở lên: mở các chuyên đề sâu.

---

## 7. UX/UI nâng cấp để web động và cuốn hút

### Public site

Các block cần có:

1. Hero sống động: câu chính mạnh, mô tả ngắn, CTA “Đăng ký miễn phí”, CTA phụ “Đọc hành trình”.
2. “Bạn đang ở đâu”: 4 thẻ symptom; khi hover/click, hiện câu hỏi phản chiếu.
3. “Lộ trình 90 ngày”: Day 1-7 Nhìn cho rõ, Day 8-21 Gỡ vòng cũ, Day 22-90 Xây nhịp mới.
4. “Phương pháp 4 bước”: Quan sát, Cảm nhận, Hành động, Chuyển hóa.
5. Article hub: filter theo chủ đề và reading path, không chỉ grid.
6. Membership CTA: không bán mạnh, mời vào bằng email.

### Member app routes

```txt
/app
/app/today
/app/journey
/app/lesson/[slug]
/app/check-in
/app/progress
/app/library
/app/billing
/app/account
/app/admin
```

### Dashboard Today

Dashboard không được giống LMS khô cứng. Cần có:

- Câu nhắc hôm nay.
- Lesson hôm nay.
- Practice 10 phút.
- Check-in button.
- Streak nhẹ.
- Tiến độ 30 ngày.
- “Đi tiếp từ hôm qua”.
- “Nếu bạn đã bỏ lỡ, quay lại bằng một bước nhỏ”.

### Hình ảnh minh họa

Không dùng ảnh stock quá sáng, quá corporate. Hình ảnh phải có cảm giác đời sống thật: phòng ở, ánh sáng tự nhiên, bàn tay, cái chổi, cửa sổ, vật thể, không gian tĩnh, người đang dừng lại, màu ấm, dịu.

Mỗi bài nên có:

- 1 hero image.
- 1 illustration nhỏ trong bài.
- 1 share card 1200x630.

---

## 8. Tech stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS.
- Backend: Supabase Postgres, Supabase Auth, Supabase Storage hoặc Cloudflare R2.
- Auth: Magic link, Google login, không cần password trong V1.
- Payment: Stripe chính, PayPal phụ, QR Việt Nam theo order/invoice.
- Email: email.iai.one gateway; app không gọi trực tiếp provider.
- Scheduler: Vercel Cron hoặc Supabase Edge Functions; khi Cloudflare-first có thể chuyển sang Workers Cron + Queues.
- Analytics: internal `user_events`, có thể nối PostHog sau.

Email architecture:

```txt
app -> /api/email/send -> email.iai.one gateway -> provider adapter -> inbox
```

Payment architecture:

```txt
checkout request -> payment provider -> verified webhook -> subscription update -> access unlock -> email event
```

---

## 9. Database schema

Xem file SQL đi kèm: `supabase_schema_nguyenlananh_edu_v1.sql`

Các bảng chính:

```txt
profiles
member_profiles
plans
subscriptions
payments
payment_orders
content_items
lessons
journey_enrollments
lesson_progress
checkins
email_templates
email_events
automation_jobs
media_assets
user_events
audit_logs
```

Nguyên tắc:

- Không quyết định quyền truy cập dựa trên frontend.
- Quyền truy cập dựa trên `subscriptions.status`, `plan.access_level`, và `lesson.min_access_level`.
- Mọi webhook payment phải idempotent.
- Mọi email phải có log.
- Mọi check-in phải lưu lịch sử, không overwrite.

---

## 10. API contract

### Auth

```http
POST /api/auth/magic-link
GET  /api/auth/callback
GET  /api/me
POST /api/profile
```

### Plans and billing

```http
GET  /api/plans
POST /api/checkout/stripe
POST /api/checkout/paypal
POST /api/checkout/vietqr
POST /api/webhooks/stripe
POST /api/webhooks/paypal
POST /api/webhooks/vietqr
GET  /api/billing/me
POST /api/billing/cancel
```

### Journey

```http
GET  /api/journey/today
GET  /api/journey/map
GET  /api/lessons/:slug
POST /api/lessons/:id/complete
POST /api/checkins
GET  /api/checkins/me
GET  /api/progress/me
```

### Automation

```http
POST /api/automation/email/run
POST /api/automation/checkin-reminders/run
POST /api/automation/weekly-report/run
```

### Admin

```http
GET /api/admin/kpis
GET /api/admin/users
GET /api/admin/payments
GET /api/admin/checkins
GET /api/admin/email-events
POST /api/admin/content/publish
```

---

## 11. Payment implementation

### Stripe

Flow:

```txt
User chọn plan -> create checkout session -> redirect Stripe Checkout -> payment success -> Stripe webhook -> update subscription -> unlock content -> send email success
```

Webhook tối thiểu:

```txt
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_succeeded
invoice.payment_failed
```

### PayPal

Map:

```txt
plan_id_internal -> paypal_product_id -> paypal_plan_id
```

Webhook tối thiểu:

```txt
BILLING.SUBSCRIPTION.CREATED
BILLING.SUBSCRIPTION.ACTIVATED
BILLING.SUBSCRIPTION.CANCELLED
PAYMENT.SALE.COMPLETED
PAYMENT.SALE.DENIED
```

### QR Việt Nam

V1 nên triển khai theo order/invoice, không hứa recurring tự động nếu chưa có đối tác ngân hàng/gateway hỗ trợ webhook chắc chắn.

Flow:

```txt
User chọn gói -> create payment_order -> generate VietQR with amount + transfer content -> user scan QR -> admin hoặc bank callback xác nhận -> mark paid -> unlock content
```

Transfer content bắt buộc:

```txt
NLA-{ORDER_CODE}
```

Ví dụ:

```txt
NLA-START-8F3K2
```

---

## 12. Email automation

Xem file: `NGUYENLANANH_EMAIL_AUTOMATION_TEMPLATES_2026.md`

Loại email bắt buộc:

1. Magic link.
2. Welcome Day 0.
3. Profile incomplete.
4. Daily lesson.
5. Check-in reminder.
6. Missed Day 1.
7. Missed Day 3.
8. Missed Day 7 re-entry.
9. Weekly progress report.
10. Payment success.
11. Payment pending QR.
12. Payment failed.
13. Upgrade soft suggestion.
14. Annual renewal reminder.
15. Unsubscribe confirmation.

Không gửi email như spam:

- Không quá 2 email/ngày/user trong launch.
- Daily lesson chỉ gửi nếu user còn active hoặc chưa unsubscribe.
- Check-in reminder không gửi sau 21:30 theo timezone user.
- Missed streak không dùng ngôn ngữ gây tội lỗi.
- Mọi email có unsubscribe.

---

## 13. Check-in system

### Daily check-in

Form chỉ cần 3 câu:

1. Hôm nay bạn thấy rõ điều gì?
2. Bạn đã làm một hành động nhỏ nào?
3. Ngày mai bạn sẽ giữ lại một bước nào?

Optional:

- mood score: 1 đến 5.
- energy score: 1 đến 5.
- practice minutes.
- note private.

### Weekly check-in

1. Vòng lặp nào xuất hiện nhiều nhất tuần này?
2. Điều gì giúp bạn đi tiếp?
3. Điều gì đang kéo bạn lại?
4. Một điều cần gỡ trong tuần tới là gì?

### Monthly review

1. Tôi đã không còn giống 30 ngày trước ở điểm nào?
2. Nhịp nào đang hoạt động?
3. Nhịp nào cần bỏ?
4. Tôi chọn đi tiếp như thế nào?

Reminder logic:

```txt
No check-in by 19:00 -> gentle reminder
No check-in for 1 day -> return email
No check-in for 3 days -> reset step
No check-in for 7 days -> re-entry pathway
```

---

## 14. SEO và content architecture

Public routes:

```txt
/
/hanh-trinh/
/phuong-phap/
/bai-viet/
/bai-viet/[slug]
/thanh-vien/
/dang-ky/
/chuoi-noi-dung/
/chuoi-noi-dung/di-vao-ben-trong/
/chuoi-noi-dung/gia-tri-noi-tai/
/chuoi-noi-dung/don-dep/
/chuoi-noi-dung/lao-dong-sang-tao/
/chuoi-noi-dung/dau-tu-ban-than/
```

Member routes `/app/*` phải `noindex, nofollow`.

Structured data:

- Article.
- BreadcrumbList.
- WebSite.
- Organization.
- Course, chỉ dùng cho chương trình rõ ràng, không dùng để thổi phồng.

---

## 15. Risk mitigation

### Content không đủ sâu

- Mỗi lesson có 4 tầng: thấy rõ, hiểu sâu, làm thật, check-in.
- Mỗi bài public có search intent, câu chuyện đời sống, hành động cụ thể, internal links, hình minh họa thật.
- Founder duyệt 10 bài trụ cột trước khi scale.

### User không check-in

- Check-in dưới 90 giây.
- Không hỏi quá dài.
- Có “quay lại bằng một bước nhỏ”.
- Không phạt user.
- Streak không tạo áp lực.
- Weekly report cho họ thấy tiến bộ.

### Email không chạy đúng

- Email queue.
- Email event log.
- Retry tối đa 3 lần.
- Dead-letter queue.
- Admin thấy trạng thái sent, bounced, opened nếu provider hỗ trợ.
- Không unlock hoặc charge dựa trên email, chỉ dùng email như thông báo.

### System quá phức tạp

- Feature flag cho tier 4 đến 9.
- 30 ngày đầu chỉ bật 3 tier.
- QR Việt Nam V1 bán theo invoice, chưa cần subscription nội địa tự động.
- Admin có thao tác manual unlock khi cần.
- Không làm community/feed trong V1.

---

## 16. KPI launch

Mục tiêu 30 ngày đầu:

```txt
Signup -> profile completion: >= 50%
Profile -> Day 1 complete: >= 60%
Day 1 -> Day 7 active: >= 30%
Check-in daily among active users: >= 35%
Free -> paid: 3% đến 8%
Email delivery: >= 95%
Payment success: >= 90% với Stripe/PayPal
```

---

## 17. 30 ngày triển khai dev

### Week 1: Foundation

- Next.js project audit.
- Supabase project.
- Auth magic link + Google.
- Profiles + member profiles.
- Plans seed.
- Public routes cleanup.
- Admin protected route.

### Week 2: Member app

- `/app/today`
- `/app/journey`
- `/app/lesson/[slug]`
- `/app/check-in`
- `/app/progress`
- Lesson seed 30 ngày.
- Check-in write/read.
- Progress logic.

### Week 3: Payment + email

- Stripe checkout + webhook.
- PayPal subscription + webhook.
- VietQR order + admin confirmation.
- email.iai.one adapter.
- Magic link templates.
- Daily lesson email.
- Reminder cron.
- Weekly report.

### Week 4: QA + launch

- SEO metadata.
- Images.
- Event tracking.
- Payment sandbox test.
- Email deliverability test.
- RLS test.
- Admin audit.
- Content QA.
- Soft launch with 20 đến 50 users.

---

## 18. Environment variables

```env
NEXT_PUBLIC_SITE_URL=https://www.nguyenlananh.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_ENV=sandbox

VIETQR_PROVIDER=
VIETQR_CLIENT_ID=
VIETQR_CLIENT_SECRET=
VIETQR_BANK_ID=
VIETQR_ACCOUNT_NO=
VIETQR_ACCOUNT_NAME=

EMAIL_GATEWAY_BASE_URL=https://email.iai.one
EMAIL_GATEWAY_API_KEY=
EMAIL_FROM_NAME=Nguyễn Lan Anh
EMAIL_FROM_ADDRESS=hanhtrinh@email.iai.one

CRON_SECRET=
ADMIN_EMAILS=
```

---

## 19. Code structure đề xuất

```txt
apps/web/
  app/
    (public)/
    app/
    api/
  components/
    public/
    app/
    billing/
    checkin/
    journey/
  lib/
    supabase/
    auth/
    payments/
      stripe.ts
      paypal.ts
      vietqr.ts
    email/
      gateway.ts
    content/
    access/
    analytics/
  content/
    vi/
    en/
  scripts/
    seed-plans.ts
    seed-lessons.ts
    smoke-payment.ts
    smoke-email.ts
```

---

## 20. Starter pseudocode

### Create VietQR order

```ts
export async function createVietQrOrder(input: {
  userId: string;
  planId: string;
  amountUsd: number;
  amountVnd: number;
}) {
  const orderCode = `NLA-${input.planId.toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

  const order = await db.payment_orders.insert({
    user_id: input.userId,
    plan_id: input.planId,
    provider: "vietqr",
    amount_usd: input.amountUsd,
    amount_vnd: input.amountVnd,
    currency: "VND",
    order_code: orderCode,
    status: "pending",
    transfer_content: orderCode
  });

  const qrPayload = {
    bank_id: process.env.VIETQR_BANK_ID,
    account_no: process.env.VIETQR_ACCOUNT_NO,
    account_name: process.env.VIETQR_ACCOUNT_NAME,
    amount: input.amountVnd,
    content: orderCode
  };

  const qr = await vietqr.generate(qrPayload);

  return {
    order_id: order.id,
    order_code: orderCode,
    qr_image_url: qr.image_url,
    transfer_content: orderCode,
    expires_at: order.expires_at
  };
}
```

### Submit daily check-in

```ts
export async function submitDailyCheckin(input: {
  userId: string;
  lessonId: string;
  moodScore?: number;
  energyScore?: number;
  practiceMinutes?: number;
  answer1: string;
  answer2: string;
  answer3: string;
}) {
  const checkin = await db.checkins.insert({
    user_id: input.userId,
    lesson_id: input.lessonId,
    checkin_type: "daily",
    mood_score: input.moodScore,
    energy_score: input.energyScore,
    practice_minutes: input.practiceMinutes,
    answers: {
      saw: input.answer1,
      did: input.answer2,
      next: input.answer3
    }
  });

  await db.lesson_progress.upsert({
    user_id: input.userId,
    lesson_id: input.lessonId,
    status: "completed",
    completed_at: new Date().toISOString()
  });

  return checkin;
}
```

---

## 21. Acceptance criteria

### User flow

- User vào home.
- User click đăng ký miễn phí.
- User nhập email.
- User nhận magic link.
- User vào app.
- User hoàn thiện profile.
- User thấy Day 1.
- User đọc lesson.
- User submit check-in.
- User thấy progress tăng.
- User nhận email ngày tiếp theo.
- User thấy pricing sau khi đủ điều kiện.
- User thanh toán Stripe hoặc PayPal.
- User thanh toán QR và admin xác nhận.
- User được unlock đúng tier.

### Admin flow

- Admin xem danh sách user.
- Admin xem trạng thái profile.
- Admin xem check-in.
- Admin xem payment.
- Admin xác nhận QR.
- Admin xem email log.
- Admin seed/publish lesson.
- Admin xem KPI.

### Security

- User không xem lesson vượt quyền bằng URL trực tiếp.
- Webhook phải verify signature.
- Admin route phải role-protected.
- Service role key không bao giờ lộ frontend.
- RLS bật trên bảng user data.
- Payment order không thể tự mark paid từ client.

---

## 22. Dev agent command

```txt
Build NGUYENLANANH_GUIDED_JOURNEY_OS for nguyenlananh.com according to NGUYENLANANH_EDU_SYSTEM_DEV_SPEC_2026.md.

Rules:
1. Keep public pages calm, minimal, SEO-ready, Vietnamese-first, English-ready.
2. Do not show paid pricing before authenticated profile completion.
3. Implement magic link + Google auth using Supabase.
4. Implement member app routes: /app/today, /app/journey, /app/lesson/[slug], /app/check-in, /app/progress, /app/billing, /app/account.
5. Implement plans, subscriptions, payments, lessons, checkins, email_events, user_events with Supabase and RLS.
6. Implement Stripe, PayPal, and VietQR payment adapters behind a clean internal payment service.
7. Implement email.iai.one gateway adapter. Do not hard-code a single email provider into product logic.
8. Seed the 30-day content from NGUYENLANANH_30_DAY_CONTENT_SYSTEM_2026.md.
9. Implement email automation from NGUYENLANANH_EMAIL_AUTOMATION_TEMPLATES_2026.md.
10. Keep tier 4-9 private behind feature flags for launch.
11. Add smoke tests for auth, check-in, payment webhooks, email queue, and access control.
12. Return a PR with screenshots, test logs, seeded content count, and a production readiness checklist.
```

---

## 23. Production readiness checklist

- [ ] Supabase migrations applied.
- [ ] RLS enabled.
- [ ] Magic link tested.
- [ ] Google login tested.
- [ ] Profile completion tested.
- [ ] 30 lessons seeded.
- [ ] Check-in submitted.
- [ ] Progress updates.
- [ ] Stripe sandbox success.
- [ ] Stripe webhook verified.
- [ ] PayPal sandbox success.
- [ ] PayPal webhook verified.
- [ ] VietQR order generated.
- [ ] VietQR manual confirm works.
- [ ] Email DNS ready.
- [ ] Magic link email delivered.
- [ ] Daily lesson email delivered.
- [ ] Missed check-in reminder delivered.
- [ ] Weekly report generated.
- [ ] Admin role protected.
- [ ] SEO metadata valid.
- [ ] Public pages indexable.
- [ ] App pages noindex.
- [ ] Analytics events captured.
- [ ] Backup/export plan documented.
