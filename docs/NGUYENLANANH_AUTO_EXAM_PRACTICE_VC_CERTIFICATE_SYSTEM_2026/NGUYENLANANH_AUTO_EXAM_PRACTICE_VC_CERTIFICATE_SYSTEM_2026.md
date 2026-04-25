# NGUYENLANANH_AUTO_EXAM_PRACTICE_VC_CERTIFICATE_SYSTEM_2026.md

**Project:** nguyenlananh.com  
**Module:** Auto Learning, Practice, Exam, Grading and Free VC Certificate System  
**Version:** 1.0 Production Handoff  
**Date:** 2026-04-25  
**Owner:** Trần Hà Tâm  
**Primary language:** Vietnamese  
**Secondary language:** English  
**Connected verification layer:** vc.vetuonglai.com  
**Core goal:** Build an automated learning, practice, exam, grading and certificate system where learners can study, submit, retry, improve and receive free verifiable certificates when they meet evidence-based requirements. Direct expert interaction is reserved for 1:1 cases, disputed grading, high-tier members or flagged support needs.

---

## 0. Executive lock

This module adds an evidence-based assessment engine to the existing nguyenlananh.com learning system.

The system must support:

1. Learning sessions limited to 30 to 60 minutes.
2. Read, learn, practice and submit after each lesson.
3. Unlimited practice and exam attempts.
4. Automatic grading for quizzes, practice submissions and structured reflections.
5. Continuous feedback after every submission.
6. Weekly, monthly, quarterly, yearly and 3-year assessment paths.
7. Free certificate issuance when learners meet the requirements.
8. Certificate verification through `vc.vetuonglai.com`.
9. Public certificate record with only minimum required proof.
10. No certificate fee. Payment is for learning access only; eligible certificates are issued free.

This system must not become a fake credential machine. A certificate must represent:

> A completed learning path, submitted practice evidence, passing score, time record, and verification record.

---

## 1. Product principle

### 1.1 What this system is

This system is:

1. A learning rhythm system.
2. A practice submission system.
3. An assessment system.
4. An automated grading system.
5. A continuous improvement loop.
6. A verifiable certificate issuing system.
7. A bridge from nguyenlananh.com to vc.vetuonglai.com.

### 1.2 What this system is not

This system is not:

1. A formal degree-granting university.
2. A government-accredited certificate unless legal accreditation is later obtained.
3. A psychological or medical diagnosis system.
4. A guarantee of personal, financial, health or career result.
5. A certificate decoration tool.
6. A place to expose private journals or sensitive check-ins publicly.
7. A place where AI grading alone decides every high-stakes outcome without rules and auditability.

### 1.3 Language rule

Public-facing language must be calm, clear and evidence-based.

Use:

1. Học
2. Thực hành
3. Nộp đầu ra
4. Nhận phản hồi
5. Hoàn thành yêu cầu
6. Cấp chứng nhận xác minh
7. Tra cứu bằng mã

Avoid:

1. Đảm bảo thay đổi cuộc đời
2. Chứng chỉ quyền lực
3. Cam kết thành công
4. Chữa khỏi
5. Đột phá thần tốc
6. Kiếm tiền nhanh
7. Học là chắc chắn đạt kết quả

---

## 2. Full learner journey

The learner journey should follow this path:

```txt
Public content
→ Free registration
→ Placement check
→ Learning session
→ Read-back / trả bài
→ Practice submission
→ Auto grading
→ Feedback
→ Retry if needed
→ Weekly assessment
→ Monthly review
→ Milestone certificate eligibility
→ Free VC certificate issue
→ Verify at vc.vetuonglai.com/v/:code
→ Continue next path
```

The core loop after every lesson:

```txt
Read / watch / listen
→ Answer 3 to 5 questions
→ Submit one small practice
→ Receive score and feedback
→ Retry if below threshold
→ Complete lesson
→ Unlock next step
```

---

## 3. Standard 30 to 60 minute session design

Each learning session must fit a maximum of 60 minutes.

### 3.1 30-minute session

Use for free member, 7-day starter and light daily practice.

```txt
0–3 min: Start and intention
3–12 min: Read or watch lesson
12–20 min: Key questions
20–27 min: Practice submission
27–30 min: Check-in and next action
```

### 3.2 45-minute session

Use for 30-day and 90-day paid learning.

```txt
0–5 min: Start and review previous action
5–18 min: Lesson content
18–28 min: Read-back / trả bài
28–38 min: Practice task
38–43 min: Auto feedback and retry suggestion
43–45 min: Check-in
```

### 3.3 60-minute session

Use for weekly exam, monthly review, 90-day milestone or high-depth lessons.

```txt
0–5 min: Preparation
5–20 min: Deep lesson or case
20–35 min: Assessment questions
35–50 min: Practice submission
50–57 min: Auto feedback
57–60 min: Commitment and next step
```

### 3.4 Session rule

No normal lesson should require more than 60 minutes.

If a task is longer than 60 minutes, split it into:

1. Lesson
2. Practice
3. Review
4. Submission
5. Certificate evidence

---

## 4. Assessment types

### 4.1 Placement check

Purpose:

1. Understand user starting point.
2. Recommend 7-day, 30-day or 90-day path.
3. Avoid forcing everyone into the same depth.

Format:

1. 12 questions.
2. 5 to 7 minutes.
3. No pass or fail.
4. Produces starting recommendation.

Scoring categories:

1. Current rhythm.
2. Emotional clarity.
3. Practice readiness.
4. Time availability.
5. Support need.
6. Preferred learning style.

Output:

```txt
Recommended path:
- Free 7-day start
- 30-day foundation
- 90-day deep journey
- 1:1 application if user requests direct support
```

---

### 4.2 Lesson quick check

Purpose:

1. Confirm learner understood the lesson.
2. Keep learning active.
3. Avoid passive reading.

Format:

1. 5 questions.
2. 3 multiple choice.
3. 1 short answer.
4. 1 action commitment.

Time:

```txt
5 to 8 minutes
```

Passing rule:

```txt
70 percent or higher
```

Retry:

```txt
Unlimited
```

Certificate contribution:

```txt
10 percent of lesson score
```

---

### 4.3 Read-back / trả bài

Purpose:

1. Confirm learner can explain the lesson in their own words.
2. Encourage deeper retention.
3. Create evidence beyond multiple-choice answers.

Format options:

1. Text summary.
2. Voice recording.
3. Short video.
4. Slide or note image.

V1 recommendation:

```txt
Text summary first.
Voice and video in V2.
```

Required prompt:

```txt
Hãy viết lại bằng lời của bạn:
1. Bài học chính là gì?
2. Điều này liên quan gì đến đời sống của bạn?
3. Bạn sẽ làm một việc nhỏ nào sau bài học này?
```

Time:

```txt
5 to 12 minutes
```

Scoring:

| Criterion | Weight |
|---|---:|
| Captures key idea | 30 |
| Uses learner's own words | 25 |
| Connects to real life | 25 |
| Gives one clear next action | 20 |

Passing rule:

```txt
70/100
```

Retry:

```txt
Unlimited, but must edit content meaningfully.
```

---

### 4.4 Practice submission

Purpose:

1. Turn learning into action.
2. Create evidence.
3. Prepare certificate qualification.

Format:

1. Short written exercise.
2. Checklist.
3. Reflection.
4. Practical task.
5. Upload image or file if needed.

Time:

```txt
10 to 25 minutes
```

Scoring:

| Criterion | Weight |
|---|---:|
| Completeness | 25 |
| Relevance | 25 |
| Specificity | 20 |
| Actionability | 20 |
| Care and honesty | 10 |

Passing rule:

```txt
70/100
```

Certificate contribution:

```txt
35 percent of lesson score
```

---

### 4.5 Daily check-in

Purpose:

1. Maintain rhythm.
2. Help learner return.
3. Feed report and recommendation engine.

Time:

```txt
1 to 3 minutes
```

Questions:

1. Hôm nay năng lượng của bạn ở mức nào?
2. Cảm xúc chính hôm nay là gì?
3. Bạn đã học hoặc làm được điều gì?
4. Một hành động nhỏ tiếp theo là gì?
5. Bạn có cần hỗ trợ sâu hơn không?

Scoring:

Check-in is not graded for right or wrong.

It contributes to:

1. Consistency score.
2. Progress report.
3. Support trigger.
4. Certificate evidence.

---

### 4.6 Weekly assessment

Purpose:

1. Review seven days.
2. Confirm retention.
3. Detect learners who are drifting away.
4. Create stronger evidence for certificates.

Format:

1. 10 to 15 questions.
2. 1 weekly read-back.
3. 1 weekly practice summary.
4. 1 next-week commitment.

Time:

```txt
30 to 45 minutes
```

Passing rule:

```txt
75/100
```

Retry:

```txt
Unlimited
```

Certificate contribution:

```txt
20 percent of weekly score
```

---

### 4.7 Monthly assessment

Purpose:

1. Review a full learning cycle.
2. Evaluate practice consistency.
3. Prepare milestone certificate.

Format:

1. 20 questions.
2. 1 written reflection.
3. 1 practical submission.
4. 1 self-assessment.
5. 1 future plan.

Time:

```txt
45 to 60 minutes
```

Passing rule:

```txt
80/100
```

Retry:

```txt
Unlimited, but only one full monthly assessment attempt per day counts toward certificate score.
```

---

### 4.8 90-day milestone exam

Purpose:

1. Confirm learner completed the core journey.
2. Generate 90-day report.
3. Determine certificate eligibility.

Format:

1. Knowledge review.
2. Practice evidence review.
3. Consistency review.
4. 90-day reflection.
5. 30-day next plan.

Time:

```txt
60 minutes maximum
```

Eligibility:

```txt
- Completed at least 80 percent of required lessons
- Submitted at least 70 percent of required check-ins
- Passed at least 70 percent of weekly assessments
- Passed 90-day milestone exam with 80/100 or higher
- Accepted certificate attestation
```

Certificate:

```txt
Free VC certificate issued if eligible.
```

---

### 4.9 120-day integration assessment

Purpose:

1. Confirm learning has entered daily life.
2. Strengthen evidence beyond the 90-day completion.
3. Prepare 1-year membership path.

Eligibility:

```txt
- Completed 90-day journey
- Completed day 91 to 120 integration path
- Submitted integration plan
- Passed integration assessment
```

Certificate:

```txt
Free VC certificate: 120-Day Integration Certificate
```

---

### 4.10 Annual assessment

Purpose:

1. Create yearly learning record.
2. Summarize all monthly themes.
3. Create annual progress evidence.

Time:

```txt
60 minutes per yearly assessment session
```

Because a full year is large, the final review should be split into:

1. Year reflection.
2. Evidence review.
3. Future plan.
4. Certificate confirmation.

Certificate:

```txt
Free VC certificate: 1-Year Learning Record
```

---

### 4.11 3-year assessment

Purpose:

1. Verify long-term completion.
2. Convert learning history into a long-form evidence record.
3. Prepare learner for mentor or alumni path if appropriate.

Certificate:

```txt
Free VC certificate: 3-Year Learning Journey Record
```

Must include:

1. Year 1 completion.
2. Year 2 completion.
3. Year 3 completion.
4. Portfolio evidence.
5. Public-safe summary.
6. Learner consent.

---

## 5. Scoring system

### 5.1 Lesson score

```txt
lesson_score =
  quick_check_score * 0.25
+ read_back_score * 0.25
+ practice_score * 0.35
+ checkin_completion * 0.15
```

Passing threshold:

```txt
70/100
```

### 5.2 Weekly score

```txt
weekly_score =
  lesson_average * 0.35
+ weekly_exam_score * 0.30
+ practice_completion * 0.20
+ checkin_consistency * 0.15
```

Passing threshold:

```txt
75/100
```

### 5.3 Monthly score

```txt
monthly_score =
  weekly_average * 0.40
+ monthly_exam_score * 0.30
+ monthly_practice_submission * 0.20
+ monthly_reflection * 0.10
```

Passing threshold:

```txt
80/100
```

### 5.4 Certificate score

```txt
certificate_score =
  completion_rate * 0.25
+ assessment_average * 0.30
+ practice_evidence_score * 0.25
+ consistency_score * 0.10
+ final_reflection_score * 0.10
```

Certificate threshold:

```txt
80/100
```

### 5.5 Score labels

Use these labels:

| Score | Label VI | Meaning |
|---:|---|---|
| 0–59 | Chưa đạt | Needs more practice |
| 60–69 | Cần hoàn thiện | Close but not enough |
| 70–79 | Đạt bài học | Lesson-level pass |
| 80–89 | Hoàn thành tốt | Certificate-ready |
| 90–100 | Hoàn thành xuất sắc | Strong evidence |

---

## 6. Unlimited attempts policy

### 6.1 Principle

Learners may practice and take exams without hard limit.

The purpose is improvement, not punishment.

### 6.2 Rules

1. Unlimited attempts are allowed.
2. All attempts are stored.
3. The highest verified score is used for progress.
4. The latest attempt is displayed by default.
5. Certificate uses highest verified score plus completion history.
6. If a learner retries too quickly, show a cooldown suggestion.
7. If repeated attempts show copied answers, require rewrite.
8. If essay answer is identical, do not count as a new meaningful attempt.
9. For monthly and milestone exams, only one certificate-counting attempt per day is allowed.
10. Practice attempts remain unlimited even when certificate-counting attempts are limited.

### 6.3 Anti-abuse

The system must detect:

1. Empty answer.
2. Identical answer.
3. Copy-paste answer without change.
4. Very short answer.
5. Repeated random guessing.
6. Submission spam.
7. Suspiciously fast completion.
8. Multiple accounts using same payment or device pattern if needed.
9. Certificate farming behavior.
10. Public verification requests that exceed rate limit.

---

## 7. Auto grading engine

### 7.1 Grading layers

Use four layers:

1. Deterministic grading.
2. Rubric grading.
3. AI-assisted grading.
4. Human review only when needed.

### 7.2 Deterministic grading

Used for:

1. Multiple choice.
2. True/false.
3. Matching.
4. Ordered steps.
5. Numeric range.
6. Required checklist.

Benefits:

1. Fast.
2. Stable.
3. Easy to audit.

### 7.3 Rubric grading

Used for:

1. Read-back.
2. Reflection.
3. Practice submission.
4. Weekly review.
5. Monthly review.
6. 90-day reflection.

Rubric example:

| Criterion | Weight | Auto signal |
|---|---:|---|
| Completeness | 25 | Answer length, all required parts |
| Specificity | 20 | Contains concrete example |
| Relevance | 20 | Matches lesson topic |
| Actionability | 20 | Has next action |
| Care | 15 | Not empty, not random, not abusive |

### 7.4 AI-assisted grading

AI may be used to:

1. Suggest scores.
2. Summarize learner answer.
3. Detect missing parts.
4. Generate feedback.
5. Recommend retry focus.

AI must not:

1. Expose private check-in content publicly.
2. Diagnose medical or psychological conditions.
3. Guarantee outcomes.
4. Be the only source of truth for high-stakes certificate disputes.
5. Override deterministic requirements silently.

### 7.5 Human review triggers

Human review is needed only when:

1. Learner disputes certificate result.
2. Answer is flagged as unsafe.
3. Submission is unusually complex.
4. User is in 1:1 or high-tier plan.
5. Admin manually selects review.
6. AI confidence is low.
7. Certificate is high-visibility or public-facing.

---

## 8. Feedback system

### 8.1 Immediate feedback

After each submission, show:

1. Score.
2. Passed or not yet passed.
3. Strongest part.
4. Missing part.
5. One improvement suggestion.
6. Retry button.
7. Continue button if passed.

### 8.2 Tone

Feedback must be:

1. Clear.
2. Calm.
3. Non-shaming.
4. Specific.
5. Short enough to act on.

Do not say:

```txt
Bạn thất bại.
Bạn không đủ tốt.
Bạn làm sai hoàn toàn.
Bạn phải cố hơn.
```

Say:

```txt
Bài này chưa đạt ngưỡng hoàn thành. Bạn chỉ cần bổ sung ví dụ cụ thể hơn và viết rõ một hành động tiếp theo.
```

### 8.3 Feedback templates

#### Passed lesson

```txt
Bạn đã hoàn thành bài học này. Phần trả bài cho thấy bạn đã nắm được ý chính và có một hành động tiếp theo rõ ràng. Bạn có thể tiếp tục bài sau hoặc ghi thêm vào nhật ký cá nhân.
```

#### Need retry

```txt
Bài nộp chưa đủ điều kiện hoàn thành. Bạn đang gần đạt. Hãy bổ sung một ví dụ cụ thể từ đời sống của bạn và viết rõ việc nhỏ bạn sẽ làm trong 24 giờ tới.
```

#### Strong practice

```txt
Bài thực hành có tính cụ thể và có thể áp dụng. Hệ thống đã ghi nhận bài này như một phần bằng chứng học tập của bạn.
```

#### Certificate eligible

```txt
Bạn đã đủ điều kiện nhận chứng nhận miễn phí cho chặng này. Chứng nhận sẽ chỉ công bố phần thông tin tối thiểu cần thiết để xác minh, không công bố nhật ký riêng tư của bạn.
```

#### Certificate not yet eligible

```txt
Bạn chưa đủ điều kiện nhận chứng nhận cho chặng này. Hệ thống gợi ý bạn hoàn thành các bài còn thiếu, bổ sung bài thực hành và làm lại bài đánh giá mốc.
```

---

## 9. Certificate system

### 9.1 Certificate principle

Certificates must be free when earned.

The learner pays for access to learning if the plan is paid. The certificate itself should not be sold separately in the normal learning flow.

### 9.2 Certificate types

| Code | Certificate | Trigger |
|---|---|---|
| `CERT_7_DAY_START` | 7-Day Start Certificate | Completed 7-day starter |
| `CERT_30_DAY_FOUNDATION` | 30-Day Foundation Certificate | Completed 30-day path |
| `CERT_90_DAY_JOURNEY` | 90-Day Journey Certificate | Completed 90-day path and milestone exam |
| `CERT_120_DAY_INTEGRATION` | 120-Day Integration Certificate | Completed 120-day path |
| `CERT_YEAR_1_RECORD` | 1-Year Learning Record | Completed 12-month journey |
| `CERT_YEAR_2_RECORD` | 2-Year Learning Record | Completed year 2 |
| `CERT_YEAR_3_RECORD` | 3-Year Learning Journey Record | Completed 3-year journey |
| `CERT_WEEKLY_PRACTICE` | Weekly Practice Badge | Optional weekly badge |
| `CERT_SKILL_MICRO` | Micro Skill Badge | Specific skill or module |

### 9.3 Certificate visibility

Each certificate has two layers.

Private layer:

1. Full learner name.
2. Email.
3. Private progress data.
4. Full check-in history.
5. Full submission history.
6. Internal grading notes.

Public VC layer:

1. Certificate code.
2. Issuer name.
3. Program name.
4. Issue date.
5. Completion level.
6. Public-safe evidence summary.
7. Verification URL.
8. Status.
9. Optional expiry or renewal rule.
10. Hash of internal evidence package.

The public layer must not include:

1. Private journal.
2. Sensitive reflection.
3. Payment history.
4. Private email.
5. Personal issues.
6. Detailed support notes.

### 9.4 Certificate status

Use these statuses:

```txt
draft
eligible
issued
active
revoked
expired
reissued
```

### 9.5 Certificate revocation

A certificate can be revoked if:

1. Issued by mistake.
2. Evidence was falsified.
3. Duplicate record was created.
4. Learner requests removal from public registry.
5. Legal or privacy issue requires removal.

Revocation must be logged.

---

## 10. VC integration with vc.vetuonglai.com

### 10.1 Integration principle

nguyenlananh.com is the learning and evidence system.

vc.vetuonglai.com is the verification layer.

Do not duplicate the full learning system inside VC.

### 10.2 Verification route

Public verification should use:

```txt
https://vc.vetuonglai.com/v/:code
```

Example:

```txt
https://vc.vetuonglai.com/v/NLA-90D-2026-000001
```

### 10.3 VC code format

Recommended:

```txt
NLA-{TYPE}-{YEAR}-{SERIAL}
```

Examples:

```txt
NLA-7D-2026-000001
NLA-30D-2026-000001
NLA-90D-2026-000001
NLA-120D-2026-000001
NLA-Y1-2026-000001
NLA-Y3-2028-000001
```

### 10.4 Public record shape

Minimum record:

```json
{
  "code": "NLA-90D-2026-000001",
  "type": "learning_certificate",
  "status": "active",
  "issuer": {
    "name": "nguyenlananh.com",
    "verificationLayer": "vc.vetuonglai.com"
  },
  "holder": {
    "displayName": "Learner Name or Private Holder",
    "privacyMode": "public_minimal"
  },
  "achievement": {
    "name": "90-Day Journey Certificate",
    "program": "Nguyen Lan Anh 90-Day Learning Journey",
    "level": "completed",
    "completionDate": "2026-06-30"
  },
  "evidence": {
    "completionRate": 0.87,
    "assessmentScore": 84,
    "practiceSubmissions": 72,
    "publicSummary": "Completed required learning, practice and milestone assessment.",
    "evidenceHash": "sha256:..."
  },
  "verification": {
    "url": "https://vc.vetuonglai.com/v/NLA-90D-2026-000001",
    "issuedAt": "2026-06-30T10:00:00+07:00"
  }
}
```

### 10.5 W3C-compatible payload option

If the team wants future portability, create a W3C-style credential object in the private registry or API layer.

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2"
  ],
  "type": ["VerifiableCredential", "LearningAchievementCredential"],
  "issuer": "https://nguyenlananh.com",
  "validFrom": "2026-06-30T10:00:00+07:00",
  "credentialSubject": {
    "id": "did:web:nguyenlananh.com:learners:private-holder-id",
    "achievement": {
      "name": "90-Day Journey Certificate",
      "description": "Completed the 90-day learning, practice and assessment path."
    }
  }
}
```

This is optional for V1. The V1 requirement is a working public verification record at vc.vetuonglai.com.

### 10.6 Registry sync options

Option A — Static registry JSON:

1. nguyenlananh.com issues certificate.
2. Admin or API appends a public-safe record to VC registry JSON.
3. `vc.vetuonglai.com/v/:code` reads registry and displays record.
4. Good for simple Cloudflare Pages.

Option B — API registry:

1. nguyenlananh.com calls VC API.
2. VC stores record in D1 or database.
3. `/v/:code` reads API.
4. Better for scale.

Option C — Hybrid:

1. API writes registry.
2. Static snapshot is generated for public fallback.
3. Best for resilience.

V1 recommendation:

```txt
Start with Option A or C if current VC is static Pages-based.
Move to Option B when volume grows.
```

---

## 11. Learning and exam scenarios

### Scenario 1 — Free user tries first lesson

User path:

1. Reads public article.
2. Registers free.
3. Receives placement check.
4. Starts lesson 1.
5. Completes quick check.
6. Submits read-back.
7. Receives feedback.
8. Gets invitation to 7-day starter.

System:

1. Create profile.
2. Create placement attempt.
3. Create lesson progress.
4. Create grading result.
5. Queue email.
6. Show upgrade recommendation.

---

### Scenario 2 — 7-day learner completes daily session

User path:

1. Opens Today page.
2. Reads lesson for 12 minutes.
3. Answers 5 questions.
4. Writes read-back.
5. Submits one small action.
6. Receives score.
7. If score is below 70, retries.
8. If passed, lesson is completed.

System:

1. Load lesson by day number.
2. Enforce plan access.
3. Store attempt.
4. Grade deterministic answers.
5. Grade read-back by rubric.
6. Generate feedback.
7. Update progress.
8. Trigger streak update.

---

### Scenario 3 — Learner fails but retries

User path:

1. Learner scores 62.
2. System shows missing parts.
3. Learner edits answer.
4. Learner resubmits.
5. New score is 76.
6. Lesson is completed.

System:

1. Store both attempts.
2. Mark best attempt.
3. Keep history.
4. Use verified best score for progress.
5. Show improvement message.

---

### Scenario 4 — Weekly assessment

User path:

1. System opens weekly assessment on day 7.
2. Learner completes 15 questions.
3. Learner writes weekly summary.
4. Learner receives score.
5. If passed, weekly report is generated.
6. If not passed, learner retries.

System:

1. Generate assessment from question bank.
2. Grade all answers.
3. Update weekly score.
4. Generate weekly report.
5. Queue weekly email.

---

### Scenario 5 — 30-day certificate

User path:

1. Learner completes day 30.
2. System checks eligibility.
3. Learner completes final 30-day assessment.
4. System issues free certificate if eligible.
5. Learner receives VC code.
6. Learner can open verification URL.

System:

1. Run eligibility check.
2. Create certificate record.
3. Generate VC code.
4. Sync public record to vc.vetuonglai.com.
5. Queue certificate email.
6. Display certificate in dashboard.

---

### Scenario 6 — 90-day certificate

User path:

1. Learner completes required 90-day journey.
2. System creates 90-day report.
3. Learner completes milestone exam.
4. System checks score and evidence.
5. Certificate is issued free.
6. Public-safe VC record is created.

System:

1. Calculate completion rate.
2. Calculate assessment average.
3. Calculate check-in consistency.
4. Calculate practice evidence count.
5. Generate evidence hash.
6. Issue certificate.
7. Sync to VC.
8. Send email.

---

### Scenario 7 — Learner requests 1:1

User path:

1. Learner selects “Tôi cần hỗ trợ sâu hơn”.
2. If selected repeatedly, system offers 1:1 application.
3. Learner submits application.
4. Admin reviews.
5. Expert interacts directly only after approval.

System:

1. Log support signal.
2. Check trigger threshold.
3. Show soft 1:1 CTA.
4. Create application.
5. Notify support.
6. Do not expose private journal unless learner consent is explicit.

---

### Scenario 8 — Annual certificate

User path:

1. Learner completes 12 monthly themes.
2. System creates yearly learning record.
3. Learner completes yearly assessment.
4. System issues annual VC certificate.
5. Learner may continue to year 2 or 3.

System:

1. Aggregate 12 months.
2. Generate public-safe summary.
3. Create annual certificate.
4. Update membership milestone.
5. Sync to VC.

---

## 12. Content requirements per lesson

Every lesson must have:

1. Title.
2. Summary.
3. Core lesson.
4. Example.
5. Read-back prompt.
6. Practice task.
7. Quick check questions.
8. Check-in prompt.
9. Scoring rubric.
10. Feedback templates.
11. Unlock rule.
12. Certificate contribution rule.

### 12.1 Lesson JSON sample

```json
{
  "programCode": "DEEP_JOURNEY_90_DAY",
  "dayNumber": 31,
  "weekNumber": 5,
  "titleVi": "Buổi sáng quyết định nhịp sống",
  "sessionMaxMinutes": 45,
  "lessonBodyVi": "Nội dung bài học...",
  "readBackPromptVi": "Hãy viết lại bằng lời của bạn...",
  "practiceTaskVi": "Trong 24 giờ tới, hãy chọn một hành động nhỏ...",
  "quickCheck": [
    {
      "type": "single_choice",
      "question": "Ý chính của bài học là gì?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "B"
    }
  ],
  "rubricCode": "READ_BACK_BASIC",
  "certificateContribution": true
}
```

---

## 13. Admin studio requirements

Admin needs these sections.

### 13.1 Assessment builder

Admin can create:

1. Quiz.
2. Read-back prompt.
3. Practice task.
4. Weekly assessment.
5. Monthly assessment.
6. Milestone exam.
7. Certificate eligibility rule.

Fields:

1. Title.
2. Program.
3. Day/week/month.
4. Question bank.
5. Rubric.
6. Time limit.
7. Passing score.
8. Retry rule.
9. Certificate contribution.
10. Publish status.

### 13.2 Rubric builder

Admin can create:

1. Criteria.
2. Weight.
3. Level descriptions.
4. Minimum threshold.
5. AI grading prompt.
6. Feedback templates.

### 13.3 Certificate manager

Admin can:

1. View eligible learners.
2. Issue certificate.
3. Revoke certificate.
4. Reissue certificate.
5. Sync to VC.
6. View VC status.
7. Copy verification URL.
8. Export certificate records.

### 13.4 Grading monitor

Admin can see:

1. Attempts.
2. Scores.
3. Failed grading jobs.
4. AI confidence.
5. Disputes.
6. Manual review queue.
7. Certificate risk flags.

---

## 14. Database additions

Add these table groups:

1. Assessment templates.
2. Assessment items.
3. Attempts.
4. Answers.
5. Rubrics.
6. Grading results.
7. Practice submissions.
8. Certificate definitions.
9. Issued certificates.
10. VC sync events.
11. Grading disputes.
12. Question banks.
13. Anti-abuse logs.

Detailed SQL is provided in:

```txt
assessment_vc_schema_nguyenlananh_v1.sql
```

---

## 15. API additions

### 15.1 Assessment APIs

```txt
GET /api/assessments/today
GET /api/assessments/:id
POST /api/assessments/:id/attempts
POST /api/assessments/attempts/:attemptId/answers
POST /api/assessments/attempts/:attemptId/submit
GET /api/assessments/attempts/:attemptId/result
GET /api/assessments/history
```

### 15.2 Practice APIs

```txt
GET /api/practice/today
POST /api/practice/submissions
GET /api/practice/submissions/:id
POST /api/practice/submissions/:id/resubmit
```

### 15.3 Grading APIs

```txt
POST /api/grading/grade-attempt
POST /api/grading/grade-practice
GET /api/grading/results/:id
POST /api/grading/disputes
```

### 15.4 Certificate APIs

```txt
GET /api/certificates/eligibility
GET /api/certificates
GET /api/certificates/:id
POST /api/certificates/issue
POST /api/certificates/:id/revoke
POST /api/certificates/:id/reissue
POST /api/certificates/:id/sync-vc
```

### 15.5 VC APIs

```txt
POST /api/integrations/vc/records
GET /api/integrations/vc/records/:code/status
POST /api/integrations/vc/records/:code/revoke
```

---

## 16. Frontend routes

### 16.1 Learner routes

```txt
/app/learn/today
/app/learn/:lessonId
/app/assessment/today
/app/assessment/:assessmentId
/app/assessment/result/:attemptId
/app/practice/today
/app/certificates
/app/certificates/:certificateId
/app/verify/:code
```

### 16.2 Admin routes

```txt
/admin/assessments
/admin/assessments/new
/admin/assessments/:id
/admin/rubrics
/admin/grading
/admin/certificates
/admin/certificates/eligible
/admin/vc-sync
```

---

## 17. Email automation for assessment and certificate

### 17.1 Required email triggers

| Trigger | Email |
|---|---|
| `assessment_available` | Bài đánh giá đã mở |
| `assessment_passed` | Bạn đã hoàn thành bài đánh giá |
| `assessment_failed_retry` | Bài chưa đạt, hãy làm lại |
| `weekly_exam_available` | Bài tổng kết tuần đã mở |
| `monthly_exam_available` | Bài tổng kết tháng đã mở |
| `certificate_eligible` | Bạn đã đủ điều kiện nhận chứng nhận miễn phí |
| `certificate_issued` | Chứng nhận của bạn đã được cấp |
| `certificate_synced_vc` | Mã xác minh VC đã sẵn sàng |
| `certificate_revoked` | Chứng nhận đã được cập nhật trạng thái |
| `grading_dispute_received` | Yêu cầu xem lại đã được ghi nhận |

### 17.2 Certificate issued email

Subject:

```txt
Chứng nhận của bạn đã sẵn sàng để tra cứu
```

Body:

```txt
Chào {{name}},

Bạn đã hoàn thành yêu cầu của chặng {{programName}}.

Chứng nhận miễn phí của bạn đã được cấp với mã:

{{certificateCode}}

Bạn có thể tra cứu tại:

{{verificationUrl}}

Bản ghi công khai chỉ hiển thị phần thông tin tối thiểu cần thiết để xác minh. Nhật ký riêng tư, bài viết cá nhân và dữ liệu nhạy cảm của bạn không được công bố.

Cảm ơn bạn đã học, thực hành và hoàn thành bằng bằng chứng thật.
```

---

## 18. Certificate eligibility matrix

### 18.1 7-day certificate

```txt
Completion rate: 100 percent of 7 lessons
Check-in: at least 5 days
Average lesson score: 70+
Final reflection: submitted
```

### 18.2 30-day certificate

```txt
Completion rate: at least 80 percent
Check-in: at least 20 days
Weekly assessments: at least 3 passed
Monthly assessment: 80+
Practice submissions: at least 20
```

### 18.3 90-day certificate

```txt
Completion rate: at least 80 percent
Check-in: at least 63 days
Weekly assessments: at least 9 passed
Monthly assessments: at least 2 passed
90-day milestone exam: 80+
Practice submissions: at least 60
```

### 18.4 120-day certificate

```txt
Must have 90-day certificate
Complete integration days 91–120 at 70 percent or higher
Submit 30-day integration plan
Pass integration assessment
```

### 18.5 1-year record

```txt
Complete at least 9 of 12 monthly themes
Pass at least 3 quarterly reviews
Submit year-end reflection
Create next-year plan
```

### 18.6 3-year record

```txt
Complete 3 annual records
Submit portfolio evidence
Complete final 3-year reflection
Consent to public-safe VC summary
```

---

## 19. Privacy and consent

### 19.1 Certificate consent

Before certificate issue, learner must confirm:

```txt
Tôi đồng ý để hệ thống công bố bản ghi xác minh tối thiểu cho chứng nhận này trên lớp xác minh VC.
Tôi hiểu rằng nhật ký riêng tư, nội dung check-in nhạy cảm và dữ liệu thanh toán không được công bố.
Tôi có thể yêu cầu ẩn hoặc thu hồi bản ghi công khai theo quy trình hỗ trợ.
```

### 19.2 Data minimization

Public certificate must contain minimum required fields only.

Do not publish:

1. Email.
2. Phone.
3. Payment.
4. Journal.
5. Sensitive check-in.
6. Detailed personal issues.
7. Private admin note.
8. Exact raw answer unless learner explicitly chooses to publish a portfolio artifact.

### 19.3 Educational disclaimer

Every certificate page should include:

```txt
Chứng nhận này xác minh việc hoàn thành một lộ trình học, thực hành và đánh giá trong hệ thống. Đây không phải văn bằng nhà nước, chứng chỉ hành nghề, tư vấn y tế, tư vấn tâm lý hoặc cam kết kết quả cá nhân.
```

---

## 20. QA checklist

### 20.1 Assessment QA

```txt
[ ] User can start assessment
[ ] User can save progress
[ ] User can submit answers
[ ] System grades multiple choice correctly
[ ] System grades rubric task
[ ] User can retry
[ ] Duplicate attempt does not overwrite old attempt
[ ] Best score is calculated correctly
[ ] Future assessment remains locked
[ ] Free user cannot access paid assessment
```

### 20.2 Certificate QA

```txt
[ ] Eligibility check works
[ ] Ineligible user cannot issue certificate
[ ] Eligible user can request certificate
[ ] Certificate code is unique
[ ] Public record excludes private data
[ ] VC sync works
[ ] Verification URL works
[ ] Revocation works
[ ] Reissue works
[ ] Certificate email sends
```

### 20.3 Grading QA

```txt
[ ] Exact-answer grading works
[ ] Rubric scoring works
[ ] Empty answer rejected
[ ] Identical answer detected
[ ] Suspicious fast submit flagged
[ ] AI confidence stored if AI grading is used
[ ] Human review queue works
[ ] Dispute flow works
[ ] Feedback is non-shaming
[ ] Score cannot be changed from frontend
```

---

## 21. Sprint plan

### Sprint A — Assessment foundation

Tasks:

1. Add schema.
2. Add assessment builder.
3. Add attempt and answer APIs.
4. Add deterministic grading.
5. Add learner assessment UI.
6. Add basic result page.

Acceptance:

```txt
A user can take a quiz, submit, receive a score and retry.
```

### Sprint B — Practice and rubric grading

Tasks:

1. Add practice submission.
2. Add rubric builder.
3. Add rubric grading.
4. Add read-back task.
5. Add feedback templates.
6. Add grading result history.

Acceptance:

```txt
A user can submit a practice answer, receive rubric feedback and improve through retry.
```

### Sprint C — Weekly and monthly exams

Tasks:

1. Add weekly assessment.
2. Add monthly assessment.
3. Add scheduled unlock.
4. Add report connection.
5. Add email triggers.

Acceptance:

```txt
A user receives weekly and monthly assessments automatically and sees scores in dashboard.
```

### Sprint D — Certificate engine

Tasks:

1. Add certificate definitions.
2. Add eligibility engine.
3. Add issue/revoke/reissue.
4. Add certificate dashboard.
5. Add certificate email.
6. Add admin certificate manager.

Acceptance:

```txt
Eligible users can receive free certificates and view them in dashboard.
```

### Sprint E — VC integration

Tasks:

1. Add VC record format.
2. Add VC sync adapter.
3. Add public-safe field mapping.
4. Add verification URL.
5. Add sync status.
6. Add revocation sync.

Acceptance:

```txt
A certificate issued by nguyenlananh.com can be verified through vc.vetuonglai.com/v/:code.
```

### Sprint F — QA and launch

Tasks:

1. Full assessment QA.
2. Certificate QA.
3. VC verification QA.
4. Privacy QA.
5. Security QA.
6. Launch report.

Acceptance:

```txt
No P0 issues. Certificates do not leak private data. VC verification works.
```

---

## 22. Build order for dev

Build in this order:

```txt
1. Database schema
2. Assessment APIs
3. Deterministic grading
4. Learner assessment UI
5. Practice submission
6. Rubric grading
7. Weekly and monthly exams
8. Certificate eligibility
9. Certificate issue
10. VC sync
11. Admin certificate manager
12. QA and launch
```

Do not build advanced AI grading before deterministic and rubric grading are stable.

---

## 23. Acceptance criteria for launch

The module is launch-ready when:

1. A learner can complete a 30-minute lesson session.
2. A learner can answer questions.
3. A learner can submit read-back.
4. A learner can submit practice.
5. The system can auto-grade.
6. The system can show feedback.
7. The learner can retry without limit.
8. Weekly assessment works.
9. Monthly assessment works.
10. Certificate eligibility works.
11. Free certificate issue works.
12. VC code is generated.
13. Verification URL works.
14. Public record excludes private data.
15. Admin can revoke or reissue.
16. Email automation works.
17. QA evidence exists.
18. Founder approves public language.

---

## 24. Required files to add to repo

```txt
/docs/NGUYENLANANH_AUTO_EXAM_PRACTICE_VC_CERTIFICATE_SYSTEM_2026.md
/migrations/assessment_vc_schema_nguyenlananh_v1.sql
/content/certificates/vc_certificate_record_sample_nguyenlananh.json
```

Optional:

```txt
/docs/ASSESSMENT_API_CONTRACT_NGUYENLANANH_2026.md
/docs/VC_INTEGRATION_NGUYENLANANH_TO_VETUONGLAI_2026.md
/docs/GRADING_RUBRIC_LIBRARY_NGUYENLANANH_2026.md
```

---

## 25. GitHub issue plan

### Epic: Assessment and Practice Engine

Issues:

1. Create assessment schema.
2. Create question bank model.
3. Create attempt model.
4. Create deterministic grading service.
5. Create read-back submission.
6. Create practice submission.
7. Create rubric scoring.
8. Create retry logic.
9. Create result page.
10. Create assessment admin.

### Epic: Certificate and VC

Issues:

1. Create certificate definitions.
2. Create eligibility engine.
3. Create certificate issue flow.
4. Create VC code generator.
5. Create VC public record mapper.
6. Create VC sync adapter.
7. Create certificate dashboard.
8. Create certificate email.
9. Create revoke/reissue.
10. Create VC verification QA.

---

## 26. Production lock

This module must connect to:

```txt
/docs/NGUYENLANANH_90_DAY_TO_3_YEAR_AUTOMATION_MASTER_PLAN_2026.md
/docs/NGUYENLANANH_TEAM_DEV_EXECUTION_PLAN_2026.md
```

Required PR title:

```txt
feat: add auto assessment practice grading and VC certificate system
```

Required PR labels:

```txt
assessment
learning-engine
auto-grading
certificate
vc
privacy
launch-readiness
```

Required PR checklist:

```txt
[ ] Added assessment schema
[ ] Added assessment API contract
[ ] Added grading model
[ ] Added unlimited retry rules
[ ] Added certificate eligibility rules
[ ] Added VC sync plan
[ ] Added privacy rules
[ ] Added QA checklist
[ ] No sensitive data exposed
[ ] No unsupported certificate claims
```

---

## 27. Official references for dev

Use current official documentation during implementation.

1. W3C Verifiable Credentials Data Model v2.0.
2. W3C VC Data Integrity and JOSE/COSE security specifications.
3. 1EdTech Open Badges 3.0.
4. 1EdTech Comprehensive Learner Record 2.0.
5. Current implementation details of `vc.vetuonglai.com`.
6. Current implementation details of `nguyenlananh.com`.

End of document.
