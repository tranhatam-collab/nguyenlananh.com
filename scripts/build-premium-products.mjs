#!/usr/bin/env node
// Generate premium product landing pages for nguyenlananh.com
// Usage: node scripts/build-premium-products.mjs

import fs from "fs";
import path from "path";

const PRODUCTS = [
  {
    route: "/assessments/avoidance-map/",
    dir: "assessments/avoidance-map",
    planCode: "asmt_avoidance_self",
    priceVnd: 490000,
    priceUsd: 19,
    title: "Avoidance Map Professional Assessment",
    badge: "Assessment chuyên sâu",
    sub: "Bản đồ né tránh cá nhân — 28 câu hỏi, 5 nhóm né, báo cáo 12–18 trang, kế hoạch 14 ngày.",
    type: "assessment",
    deliverables: [
      "Test đầu vào 28–40 câu hỏi, đo 5 nhóm né: không biết / chưa sẵn sàng / trì hoãn / né cảm xúc / né trách nhiệm",
      "Báo cáo cá nhân 12–18 trang: avoidance profile, điểm 5 nhóm, biểu đồ mức độ",
      "Kế hoạch can thiệp 14 ngày: 1 hành động cho nhóm né cao nhất",
      "1 phiên review nhóm (tier có review) hoặc tự làm (tier self)",
      "Bản đồ né tránh trực quan: nơi nào né nhiều nhất, hậu quả, pattern lặp",
    ],
    input: "Bạn cảm thấy mình biết cần làm gì nhưng không làm. Hoặc làm được một lúc rồi dừng.",
    output: "Bản đồ rõ ràng: bạn né điều gì, kiểu né nào, tại sao, và 1 can thiệp 14 ngày để bắt đầu ngắt.",
    disclaimer: "Assessment này là công cụ tự quan sát, không phải chẩn đoán tâm lý. Nếu bạn đang gặp khó khăn nghiêm trọng, hãy tìm chuyên gia.",
    related: "/bai-viet/ban-dang-ne-dieu-gi/",
    tiers: [
      { code: "asmt_avoidance_self", label: "Tự làm", priceUsd: 19, priceVnd: 490000 },
      { code: "asmt_avoidance_review", label: "Có expert review", priceUsd: 79, priceVnd: 2000000 },
    ],
  },
  {
    route: "/programs/rhythm-design-lab/",
    dir: "programs/rhythm-design-lab",
    planCode: "prog_rhythm_lab",
    priceVnd: 2500000,
    priceUsd: 99,
    title: "Rhythm Design Lab — 21 Ngày",
    badge: "Chương trình thực hành 21 ngày",
    sub: "Đo lường và thiết kế lại nhịp sống — nhật ký hằng ngày, check-in, báo cáo ngày 7/14/21, thi cuối.",
    type: "program",
    deliverables: [
      "Bài đầu vào: đo hiện trạng nhịp, khung giờ mạnh, mức tải, khả năng giữ nhịp",
      "Nhật ký hằng ngày 21 ngày: ghi nhận hành động, năng lượng, mood",
      "Nhắc nhở có consent (không spam, tắt bất cứ lúc nào)",
      "Check-in ngày 7, 14, 21: review tiến độ, điều chỉnh",
      "Báo cáo cuối: nhịp ổn định nhất, pattern lặp, khuyến nghị",
      "Thi cuối: 15 câu trắc nghiệm + 1 reflection",
      "Điều kiện đạt: ≥15 check-in, 1 nhịp ổn định, nộp báo cáo cuối",
    ],
    input: "Bạn bắt đầu được nhiều thứ nhưng không đi tiếp được. Có nhịp vài ngày rồi đứt.",
    output: "Bạn biết nhịp tự nhiên của mình, khung giờ mạnh, mức tải phù hợp, và có 1 nhịp đã kiểm chứng 21 ngày.",
    disclaimer: "Chương trình này là công cụ thực hành cá nhân, không phải trị liệu y tế.",
    related: "/bai-viet/nang-luc-giu-nhip/",
    tiers: null,
  },
  {
    route: "/programs/emotional-block-mapping/",
    dir: "programs/emotional-block-mapping",
    planCode: "prog_emo_block",
    priceVnd: 6300000,
    priceUsd: 249,
    title: "Emotional Block Mapping Intensive — 30 Ngày",
    badge: "Chương trình chuyên sâu 30 ngày",
    sub: "Ánh xá điểm nghẽn cảm xúc — 6 module, 10 thực hành, 2 buổi nhóm, báo cáo cá nhân.",
    type: "program",
    deliverables: [
      "Test đầu vào: điểm nghẽn cảm xúc, 3 tình huống ưu tiên",
      "6 module: nhận diện cảm giác → phản ứng cơ thể → ý nghĩ tự động → hành vi bảo vệ → hậu quả → protocol điều chỉnh",
      "10 thực hành có hướng dẫn chi tiết, an toàn, từng bước",
      "2 buổi nhóm trực tuyến (consent, confidentiality)",
      "Báo cáo cá nhân: hồ sơ điểm nghẽn, pattern lặp, protocol tự điều chỉnh",
      "Escalation policy: khi nào cần dừng và tìm chuyên gia",
    ],
    input: "Bạn cảm thấy có cảm xúc nào đó khiến bạn đóng lại, né, hoặc phản ứng quá mức. Bạn muốn hiểu nhưng không biết bắt đầu đâu.",
    output: "Bạn có hồ sơ điểm nghẽn cảm xúc, 3 tình huống ưu tiên, và 1 protocol tự điều chỉnh an toàn đã thử.",
    disclaimer: "⚠️ Chương trình này KHÔNG phải trị liệu tâm lý. Không thay thế chuyên gia. Nếu bạn đang gặp trauma, lo âu nặng, hoặc trầm cảm, hãy tìm bác sĩ/psychologist. Chương trình có screening đầu vào và escalation policy.",
    related: "/bai-viet/diem-nghen-cam-xuc/",
    tiers: null,
  },
  {
    route: "/programs/boundary-foundation/",
    dir: "programs/boundary-foundation",
    planCode: "cert_boundary_found",
    priceVnd: 7600000,
    priceUsd: 299,
    title: "Boundary Practice Certification — Foundation",
    badge: "Khóa học + Thi + Chứng nhận",
    sub: "Nền tảng thực hành ranh giới cá nhân — 6 module, thi cuối, chứng nhận Foundation.",
    type: "certification",
    deliverables: [
      "6 module: nhận diện làm hài lòng → nhu cầu & ranh giới → câu từ chối → phản ứng khi bị ép → tình huống thật → đánh giá cuối",
      "Mỗi module: bài đọc, ví dụ, bài tập viết, thực hành tình huống",
      "Thi cuối: 30 trắc nghiệm + 3 tình huống + 1 thực hành có bằng chứng",
      "Rubric 4 mức: 0 chưa làm → 1 hình thức → 2 có bằng chứng → 3 có chiều sâu → 4 áp dụng lặp lại",
      "Chứng nhận Foundation (có hạn 12 tháng, tái đánh giá)",
      "Điều kiện cấp chứng nhận: vượt thi + nộp bằng chứng thực hành",
    ],
    input: "Bạn khó nói không, sợ làm thất vọng người khác, thường gánh việc không phải của mình, kiệt sức nhưng không biết ngừng đâu.",
    output: "Bạn có năng lực nhận diện ranh giới, câu từ chối phù hợp, phản ứng khi bị ép, và chứng nhận Foundation.",
    disclaimer: "Chương trình này là đào tạo năng lực cá nhân, không phải trị liệu quan hệ.",
    related: "/bai-viet/ranh-gioi-ca-nhan/",
    tiers: null,
  },
  {
    route: "/programs/family-pattern-mapping/",
    dir: "programs/family-pattern-mapping",
    planCode: "prog_family_pattern",
    priceVnd: 10000000,
    priceUsd: 399,
    title: "Family Pattern Mapping Program — 6 Tuần",
    badge: "Chương trình 6 tuần",
    sub: "Sơ đồ liên thế hệ — vai trò, luật ngầm, giao tiếp, tiền bạc, xung đột, báo cáo cuối.",
    type: "program",
    deliverables: [
      "Sơ đồ 3 thế hệ: vai trò, luật ngầm, pattern lặp",
      "6 tuần: sơ đồ → vai trò → luật ngầm → giao tiếp → tiền bạc → xung đột",
      "Mỗi tuần: bài đọc, bài tập, thực hành quan sát, journaling",
      "Báo cáo cuối: 3 vòng lặp truyền lại, kế hoạch ngắt 1 vòng",
      "1 phiên review nhóm cuối chương trình",
    ],
    input: "Bạn nhận thấy pattern trong gia đình lặp lại ở bạn. Bạn muốn hiểu nhưng không muốn đổ lỗi.",
    output: "Bạn có sơ đồ liên thế hệ, 3 vòng lặp đã nhận diện, và 1 kế hoạch ngắt vòng cụ thể.",
    disclaimer: "⚠️ Chương trình này KHÔNG phải trị liệu gia đình. Không định vị là family therapy. Nếu cần trị liệu, hãy tìm chuyên gia.",
    related: "/bai-viet/he-gia-dinh-trong-hanh-vi/",
    tiers: null,
  },
  {
    route: "/programs/space-reset-practitioner/",
    dir: "programs/space-reset-practitioner",
    planCode: "prog_space_reset",
    priceVnd: 12700000,
    priceUsd: 499,
    title: "Space Reset Practitioner Program",
    badge: "Chuyên môn không gian–hành vi",
    sub: "Nâng dọn dẹp thành công cụ phân tích — audit, vật thể, hành vi, ma sát, case report, panel review.",
    type: "program",
    deliverables: [
      "Module: audit không gian → vật thể → hành vi → ma sát → dọn theo vùng → before/after → case report",
      "Mỗi module: bài đọc, ví dụ, bài tập thực hành, ảnh before/after",
      "Thi cuối: 1 case thật, ảnh trước/sau, report, reflection, panel review",
      "Rubric 4 mức đánh giá case report",
      "Chứng nhận hoàn thành (có hạn 12 tháng)",
    ],
    input: "Bạn muốn hiểu tại sao không gian sống ảnh hưởng hành vi của bạn — và muốn có năng lực phân tích, không chỉ dọn dẹp.",
    output: "Bạn có năng lực audit không gian–hành vi, 1 case report hoàn chỉnh, và chứng nhận practitioner.",
    disclaimer: "Chương trình này là đào tạo năng lực thực hành, không phải interior design consulting.",
    related: "/bai-viet/khong-gian-va-hanh-vi/",
    tiers: null,
  },
  {
    route: "/programs/creative-practice-studio/",
    dir: "programs/creative-practice-studio",
    planCode: "prog_creative_studio",
    priceVnd: 10000000,
    priceUsd: 399,
    title: "Creative Practice Studio — 8 Tuần",
    badge: "Xưởng sáng tạo 8 tuần",
    sub: "Từ cảm hứng sang năng lực tạo đầu ra — 1 sản phẩm hoàn thiện, nhật ký quy trình, portfolio, báo cáo.",
    type: "program",
    deliverables: [
      "8 tuần: quan sát → thu thập → tạo → hoàn thiện → công bố → phản hồi → lặp → báo cáo",
      "Nhật ký quy trình hằng ngày/tuần",
      "1 sản phẩm hoàn thiện (bài viết, video, sản phẩm số, artwork...)",
      "Portfolio: 3–5 sản phẩm trong 8 tuần",
      "Phản hồi nhóm: 2 buổi review",
      "Báo cáo năng lực sáng tạo: điểm mạnh, điểm nghẽn, pattern",
    ],
    input: "Bạn là creator/writer/teacher/founder/artist. Bạn có ý tưởng nhưng không ra đầu ra. Hoặc ra được nhưng không ổn định.",
    output: "Bạn có 1 sản phẩm hoàn thiện, nhật ký quy trình, portfolio, và báo cáo năng lực sáng tạo.",
    disclaimer: "Chương trình này là xưởng thực hành, không phải khóa học lý thuyết sáng tạo.",
    related: "/bai-viet/lao-dong-sang-tao-va-dau-ra/",
    tiers: null,
  },
  {
    route: "/assessments/personal-capital/",
    dir: "assessments/personal-capital",
    planCode: "diag_capital_self",
    priceVnd: 1250000,
    priceUsd: 49,
    title: "Personal Capital Diagnostic & Strategy",
    badge: "Diagnostic + Chiến lược 90 ngày",
    sub: "Đo 8 loại vốn nội tại — sức khỏe, thời gian, tập trung, kỹ năng, quan hệ, niềm tin, tài chính, danh tiếng.",
    type: "assessment",
    deliverables: [
      "Diagnostic 8 loại vốn: sức khỏe / thời gian / tập trung / kỹ năng / quan hệ / niềm tin / tài chính / danh tiếng",
      "Risk profile: vốn nào đang rủi ro, vốn nào đang tăng",
      "Opportunity map: vốn nào mạnh nhưng chưa dùng, vốn nào yếu nhưng quan trọng",
      "Kế hoạch 90 ngày: 1 vốn ưu tiên, 3 hành động cụ thể",
      "Báo cáo hàng tháng (tier expert/business)",
      "Ma trận mạnh–yếu trực quan",
    ],
    input: "Bạn cảm thấy mình có thứ gì đó nhưng không biết gọi là gì, không biết đo, không biết ưu tiên đầu tư vào đâu.",
    output: "Bạn có báo cáo vốn 8 loại, risk profile, opportunity map, và kế hoạch 90 ngày cho 1 vốn ưu tiên.",
    disclaimer: "Diagnostic này là công cụ tự đánh giá, không phải tư vấn tài chính chuyên nghiệp.",
    related: "/bai-viet/ban-do-von-noi-tai/",
    tiers: [
      { code: "diag_capital_self", label: "Tự làm", priceUsd: 49, priceVnd: 1250000 },
      { code: "diag_capital_expert", label: "Expert reviewed", priceUsd: 299, priceVnd: 7600000 },
      { code: "diag_capital_biz", label: "Founder/Business", priceUsd: 1500, priceVnd: 38000000 },
    ],
  },
  {
    route: "/certification/practice-companion-level-1/",
    dir: "certification/practice-companion-level-1",
    planCode: "cert_companion_l1",
    priceVnd: 30000000,
    priceUsd: 1200,
    title: "Certified Practice Companion — Level 1",
    badge: "Chứng nhận chuyên môn",
    sub: "Đào tạo người đồng hành — active listening, boundaries, questioning, non-diagnosis, safety, escalation.",
    type: "certification",
    deliverables: [
      "Điều kiện đầu vào: hoàn thành ≥2 chương trình cá nhân, có lịch sử check-in, vượt test ethics, qua phỏng vấn",
      "Nội dung: active listening → boundaries → questioning → non-diagnosis → consent → safety → escalation → reporting",
      "Thi cuối: thi kiến thức + 3 case simulation + 1 buổi thực hành + supervisor review",
      "Chứng nhận có hạn 12 tháng, phải tái đánh giá",
      "Ethics policy + escalation protocol + reporting framework",
    ],
    input: "Bạn muốn đồng hành với người khác trong hành trình thực hành — đúng cách, an toàn, không áp đặt.",
    output: "Bạn có năng lực đồng hành có cấu trúc, chứng nhận Level 1, và framework escalation.",
    disclaimer: "⚠️ Chứng nhận này KHÔNG cấp quyền chẩn đoán, trị liệu, hoặc tư vấn chuyên gia. Companion ≠ therapist. Có ethics policy và escalation protocol bắt buộc.",
    related: "/bai-viet/nang-luc-dong-hanh/",
    tiers: null,
  },
  {
    route: "/certification/practice-method-designer/",
    dir: "certification/practice-method-designer",
    planCode: "cert_method_designer",
    priceVnd: 76000000,
    priceUsd: 3000,
    title: "Practice Method Designer Certification",
    badge: "Chứng nhận cao cấp nhất",
    sub: "Thiết kế chương trình, bài tập, rubric, assessment, pilot, báo cáo — 12–16 tuần.",
    type: "certification",
    deliverables: [
      "12–16 tuần: thiết kế chương trình → xây bài tập → viết rubric → tạo assessment → chạy pilot → lập báo cáo → cải tiến",
      "Đầu ra: micro-program 7 ngày + program 30 ngày + bộ test + workbook + rubric + báo cáo pilot + buổi bảo vệ",
      "Điều kiện cấp chứng nhận: vượt thi + hoàn thành pilot + đủ số người thử + không vi phạm ethics + hội đồng duyệt",
      "Buổi bảo vệ trước hội đồng (panel review)",
      "Chứng nhận Practice Method Designer (có hạn, tái đánh giá)",
    ],
    input: "Bạn đã có trải nghiệm thực hành cá nhân. Bạn muốn biến trải nghiệm thành phương pháp truyền dạy được.",
    output: "Bạn có năng lực thiết kế chương trình hoàn chỉnh, 1 micro-program + 1 program đã pilot, và chứng nhận Designer.",
    disclaimer: "⚠️ Đây là chứng nhận cao cấp nhất. Có ethics policy, panel review, và điều kiện đầu vào nghiêm ngặt.",
    related: "/bai-viet/thiet-ke-phuong-phap-thuc-hanh/",
    tiers: null,
  },
];

function formatVnd(v) {
  return v.toLocaleString("vi-VN") + " VND";
}

function buildTierSelector(tiers) {
  if (!tiers || tiers.length === 0) return "";
  const buttons = tiers.map((t, i) => {
    return `<label class="tier-option" style="display:block;padding:10px 14px;border:1px solid rgba(148,163,184,.35);border-radius:8px;margin-bottom:6px;cursor:pointer;">
  <input type="radio" name="tier" value="${t.code}" data-price="${t.priceVnd}" ${i === 0 ? "checked" : ""} style="margin-right:8px;" />
  <strong>${t.label}</strong> — ${formatVnd(t.priceVnd)} ($${t.priceUsd})
</label>`;
  }).join("\n");
  return `<div id="tierSelector" style="margin-bottom:12px;">${buttons}</div>`;
}

function buildPage(p) {
  const tierHtml = buildTierSelector(p.tiers);
  const priceDisplay = p.tiers
    ? `<p><strong>Giá:</strong> từ <span style="font-size:22px;font-weight:700;color:rgba(15,23,42,.9);">${formatVnd(p.tiers[0].priceVnd)}</span> <span style="color:rgba(15,23,42,.6);">($${p.tiers[0].priceUsd})</span></p>`
    : `<p><strong>Giá:</strong> <span style="font-size:22px;font-weight:700;color:rgba(15,23,42,.9);">${formatVnd(p.priceVnd)}</span> <span style="color:rgba(15,23,42,.6);">($${p.priceUsd})</span></p>`;

  const planCode = p.tiers ? p.tiers[0].code : p.planCode;
  const priceVnd = p.tiers ? p.tiers[0].priceVnd : p.priceVnd;

  return `<!doctype html><html lang="vi" dir="ltr"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" /><title>${p.title} | Nguyễn Lan Anh</title><meta name="description" content="${p.sub}" /><link rel="canonical" href="https://www.nguyenlananh.com${p.route}" /><meta name="robots" content="index,follow" /><link rel="stylesheet" href="/assets/site.css" /><meta property="og:title" content="${p.title} | Nguyễn Lan Anh" /><meta property="og:description" content="${p.sub}" /><meta property="og:url" content="https://www.nguyenlananh.com${p.route}" /><meta name="twitter:card" content="summary_large_image" /></head>
<body data-plan="${planCode}" data-price="${priceVnd}"><a class="skip" href="#main">Bỏ qua điều hướng</a>
<header class="topbar" role="banner"><div class="container"><div class="navwrap"><a class="brand" href="/" aria-label="Nguyễn Lan Anh — về trang chủ"><span class="mark" aria-hidden="true"><img class="markIcon" src="/assets/brand/logo-mark.svg" alt="" width="40" height="40" loading="eager" decoding="async" aria-hidden="true" role="presentation"/></span><span class="name"><strong>Nguyễn Lan Anh</strong><span class="tagline">Đi vào bên trong để tái thiết cuộc đời</span></span></a><nav class="navlinks" aria-label="Điều hướng chính"><a href="/hanh-trinh/">Hành trình</a><a href="/phuong-phap/">Hệ thống</a><a href="/bai-viet/">Bài viết</a><a href="/members/">Thành viên</a></nav><div class="actions"><a class="btn" href="/join/">Đăng ký thành viên</a><button class="hamburger" type="button" id="hamburger" aria-label="Mở menu" aria-controls="drawer" aria-expanded="false"><span aria-hidden="true"></span></button></div></div></div><div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Điều hướng"><div class="dhead"><div><div style="font-weight:700;font-size:13px;">Điều hướng</div><div class="hint">Chọn một mục để đi tới.</div></div><button class="btn" type="button" id="closeDrawer" aria-label="Đóng menu">Đóng</button></div><nav aria-label="Điều hướng di động"><a href="/hanh-trinh/" data-close>Hành trình</a><a href="/phuong-phap/" data-close>Hệ thống</a><a href="/bai-viet/" data-close>Bài viết</a><a href="/members/" data-close>Thành viên</a><a href="/join/" data-close class="drawerCta">Đăng ký</a></nav><div class="foot">Đi chậm để đi sâu. Đi thật để đi xa.</div></div></header>
<main id="main" class="container" role="main">
<section class="pageHead"><span class="badge">${p.badge}</span><h1 style="margin-top:8px;">${p.title}</h1><p class="sub">${p.sub}</p></section>
<section class="grid2" style="margin-top:12px;">
<article class="panel">
<h2>Bạn nhận được gì</h2>
<ul class="list">
${p.deliverables.map(d => `<li>${d}</li>`).join("\n")}
</ul>
</article>
<article class="panel">
<h2>Đầu vào và đầu ra</h2>
<p><strong>Đầu vào:</strong> ${p.input}</p>
<p><strong>Đầu ra:</strong> ${p.output}</p>
${priceDisplay}
${tierHtml}
<div id="checkoutBox" style="margin-top:12px;">
<div class="field"><label for="buyerEmail">Email nhận sản phẩm</label><input id="buyerEmail" type="email" required placeholder="ban@vidu.com" /></div>
<div class="actionsRow" style="margin-top:10px;"><button id="buyNow" class="cta" type="button">Mua ngay — Thanh toán VietQR</button></div>
<div id="checkoutStatus" class="statusBanner hidden" role="status" style="margin-top:10px;"></div>
<div id="vietqrBox" class="hidden" style="margin-top:10px;"><p><strong>Quét mã VietQR hoặc chuyển khoản thủ công</strong></p><p class="note">Nội dung chuyển khoản: <strong id="vietqrTransferNote">-</strong></p><p class="note">Số tiền: <strong id="vietqrAmount">-</strong></p><p class="note">Tài khoản: <strong id="vietqrAccountName">-</strong> · <span id="vietqrAccountNo">-</span> · BIN <span id="vietqrBankBin">-</span></p><img id="vietqrImage" alt="VietQR checkout" style="width:100%;max-width:280px;border-radius:6px;border:1px solid rgba(148,163,184,.35);" /><div class="actionsRow" style="margin-top:10px;"><a id="payNowLink" class="ghost hidden" href="#" target="_blank" rel="noopener">Mở trang thanh toán</a></div></div>
</div>
</article>
</section>
<section class="panel" style="margin-top:12px; background:#fff8e8; border:1px solid #ead9ad;">
<h3>Lưu ý quan trọng</h3>
<p style="font-size:.95rem; color:#6b5d3f;">${p.disclaimer}</p>
</section>
<section class="panel" style="margin-top:12px;">
<h3>Bài viết liên quan</h3>
<ul class="list"><li><a href="${p.related}">Đọc bài viết gốc</a></li></ul>
</section>
</main>
<footer role="contentinfo"><div class="container"><div class="fwrap"><div><div style="font-weight:700;color:rgba(15,23,42,.8);">Nguyễn Lan Anh</div><div>© <span id="year"></span> · Không phải để trở thành ai đó. Mà để trở về đúng là mình.</div></div><div style="display:flex;gap:6px;flex-wrap:wrap;"><a href="/">Trang chủ</a><a href="/hanh-trinh/">Hành trình</a><a href="/phuong-phap/">Hệ thống</a><a href="/bai-viet/">Bài viết</a><a href="/members/">Thành viên</a><a href="/join/">Đăng ký</a></div></div><div class="legal" style="margin-top:10px;color:rgba(15,23,42,.6);"><a href="/chinh-sach-bao-mat/">Chính sách bảo mật</a><a href="/dieu-khoan/">Điều khoản sử dụng</a><a href="/mien-tru-trach-nhiem/">Miễn trừ trách nhiệm</a></div></div></footer>
<script src="/assets/content-registry.js"></script><script src="/assets/site.js"></script><script src="/assets/i18n-config.js"></script><script src="/assets/lang-routing.js"></script><script src="/assets/products-checkout.js?v=20260630a"></script>
${p.tiers ? `<script>document.querySelectorAll('input[name="tier"]').forEach(r=>{r.addEventListener("change",e=>{const t=e.target;document.body.dataset.plan=t.value;document.body.dataset.price=t.dataset.price;const a=document.querySelector('span[style*="22px"]');if(a){a.textContent=new Intl.NumberFormat("vi-VN").format(parseInt(t.dataset.price))+" VND";}});});</script>` : ""}
</body></html>
`;
}

// Write all pages
for (const p of PRODUCTS) {
  const outDir = path.join(process.cwd(), p.dir);
  fs.mkdirSync(outDir, { recursive: true });
  const html = buildPage(p);
  fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
  console.log(`✅ ${p.dir}/index.html (${html.length} bytes)`);
}

// Create index pages for /assessments/, /programs/, /certification/
const indices = [
  {
    dir: "assessments",
    title: "Assessments — Đánh giá chuyên sâu",
    sub: "Các bài đánh giá chuyên sâu: test đầu vào, báo cáo cá nhân, kế hoạch hành động.",
    items: PRODUCTS.filter(p => p.type === "assessment"),
  },
  {
    dir: "programs",
    title: "Programs — Chương trình thực hành",
    sub: "Các chương trình thực hành có cấu trúc: 21–42 ngày, module, check-in, báo cáo.",
    items: PRODUCTS.filter(p => p.type === "program"),
  },
  {
    dir: "certification",
    title: "Certification — Chứng nhận chuyên môn",
    sub: "Các khóa học có thi cuối và chứng nhận: Foundation, Level 1, Designer.",
    items: PRODUCTS.filter(p => p.type === "certification"),
  },
];

for (const idx of indices) {
  const list = idx.items.map(p => `<li><a href="${p.route}">${p.title}</a> — ${p.sub}</li>`).join("\n");
  const html = `<!doctype html><html lang="vi" dir="ltr"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" /><title>${idx.title} | Nguyễn Lan Anh</title><meta name="description" content="${idx.sub}" /><link rel="canonical" href="https://www.nguyenlananh.com/${idx.dir}/" /><meta name="robots" content="index,follow" /><link rel="stylesheet" href="/assets/site.css" /></head>
<body><a class="skip" href="#main">Bỏ qua điều hướng</a>
<header class="topbar" role="banner"><div class="container"><div class="navwrap"><a class="brand" href="/" aria-label="Nguyễn Lan Anh — về trang chủ"><span class="mark" aria-hidden="true"><img class="markIcon" src="/assets/brand/logo-mark.svg" alt="" width="40" height="40" loading="eager" decoding="async" aria-hidden="true" role="presentation"/></span><span class="name"><strong>Nguyễn Lan Anh</strong><span class="tagline">Đi vào bên trong để tái thiết cuộc đời</span></span></a><nav class="navlinks" aria-label="Điều hướng chính"><a href="/hanh-trinh/">Hành trình</a><a href="/phuong-phap/">Hệ thống</a><a href="/bai-viet/">Bài viết</a><a href="/members/">Thành viên</a></nav><div class="actions"><a class="btn" href="/join/">Đăng ký thành viên</a><button class="hamburger" type="button" id="hamburger" aria-label="Mở menu" aria-controls="drawer" aria-expanded="false"><span aria-hidden="true"></span></button></div></div></div><div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Điều hướng"><div class="dhead"><div><div style="font-weight:700;font-size:13px;">Điều hướng</div><div class="hint">Chọn một mục để đi tới.</div></div><button class="btn" type="button" id="closeDrawer" aria-label="Đóng menu">Đóng</button></div><nav aria-label="Điều hướng di động"><a href="/hanh-trinh/" data-close>Hành trình</a><a href="/phuong-phap/" data-close>Hệ thống</a><a href="/bai-viet/" data-close>Bài viết</a><a href="/members/" data-close>Thành viên</a><a href="/join/" data-close class="drawerCta">Đăng ký</a></nav><div class="foot">Đi chậm để đi sâu. Đi thật để đi xa.</div></div></header>
<main id="main" class="container" role="main">
<section class="pageHead"><h1>${idx.title}</h1><p class="sub">${idx.sub}</p></section>
<section class="panel"><ol class="list">
${list}
</ol></section>
</main>
<footer role="contentinfo"><div class="container"><div class="fwrap"><div><div style="font-weight:700;color:rgba(15,23,42,.8);">Nguyễn Lan Anh</div><div>© <span id="year"></span> · Không phải để trở thành ai đó. Mà để trở về đúng là mình.</div></div><div style="display:flex;gap:6px;flex-wrap:wrap;"><a href="/">Trang chủ</a><a href="/hanh-trinh/">Hành trình</a><a href="/phuong-phap/">Hệ thống</a><a href="/bai-viet/">Bài viết</a><a href="/members/">Thành viên</a><a href="/join/">Đăng ký</a></div></div></div></footer>
<script src="/assets/content-registry.js"></script><script src="/assets/site.js"></script><script src="/assets/i18n-config.js"></script><script src="/assets/lang-routing.js"></script>
</body></html>`;
  fs.writeFileSync(path.join(process.cwd(), idx.dir, "index.html"), html, "utf8");
  console.log(`✅ ${idx.dir}/index.html`);
}

console.log("\nDone! 10 premium products + 3 index pages created.");
