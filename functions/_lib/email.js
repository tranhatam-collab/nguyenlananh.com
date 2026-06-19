import { TEMPLATE_IDS } from "./constants.js";
import { getEmailJobByDedupeKey, insertEmailJob, updateEmailJob } from "./db.js";
import { nowIso } from "./utils.js";

function normalizeEmailProvider(env) {
  const explicit = String(env.EMAIL_PROVIDER || "")
    .trim()
    .toLowerCase();
  if (explicit) return explicit;
  if (env.MAIL_API_KEY || env.MAIL_API_BASE_URL || env.MAIL_API_URL) return "mail_iai_one";
  if (env.RESEND_API_KEY) return "resend";
  return "preview";
}

function normalizeMailApiBaseUrl(env) {
  const raw = String(env.MAIL_API_BASE_URL || env.MAIL_API_URL || "https://api.mail.iai.one/v1").trim();
  return raw.replace(/\/+$/u, "");
}

function paymentFromAddress(env) {
  return env.EMAIL_FROM_PAY || "pay@nguyenlananh.com";
}

function systemFromAddress(env) {
  return env.EMAIL_FROM_SYSTEM || "noreply@nguyenlananh.com";
}

function supportAddress(env) {
  return env.EMAIL_REPLY_TO_SUPPORT || "support@nguyenlananh.com";
}

function renderTemplate(templateId, locale, payload, env) {
  const isEnglish = locale === "en-US";
  const dashboardUrl = payload.dashboard_url || payload.magic_link || payload.next_step_url || env.API_BASE_URL || "";
  const supportEmail = payload.support_email || supportAddress(env);

  if (templateId === TEMPLATE_IDS.welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Welcome to your journey system"
        : "[Nguyenlananh.com] Chào mừng bạn vào hệ hành trình",
      text: isEnglish
        ? `Hi,\n\nYour membership is now active.\nPlan: ${payload.plan_name}\nMagic link: ${payload.magic_link}\nDashboard: ${dashboardUrl}\n\nIf this was not you, contact ${supportEmail}.`
        : `Chào bạn,\n\nTài khoản thành viên của bạn đã được kích hoạt.\nGói: ${payload.plan_name}\nMagic link: ${payload.magic_link}\nDashboard: ${dashboardUrl}\n\nNếu cần hỗ trợ, vui lòng liên hệ ${supportEmail}.`
    };
  }

  if (templateId === TEMPLATE_IDS.resend) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish ? "[Nguyenlananh.com] Your new magic link" : "[Nguyenlananh.com] Magic link mới của bạn",
      text: isEnglish
        ? `Hi,\n\nHere is your new login magic link:\n${payload.magic_link}\n\nThis link expires in ${payload.magic_link_expire_minutes || 15} minutes.`
        : `Chào bạn,\n\nĐây là magic link mới để đăng nhập:\n${payload.magic_link}\n\nLink có hiệu lực trong ${payload.magic_link_expire_minutes || 15} phút.`
    };
  }

  if (templateId === TEMPLATE_IDS.receipt) {
    return {
      from: paymentFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? `[Receipt] Payment successful #${payload.order_id}`
        : `[Biên nhận] Thanh toán thành công #${payload.order_id}`,
      text: isEnglish
        ? `Hi,\n\nWe received your payment successfully.\nPlan: ${payload.plan_name}\nAmount: ${payload.amount} ${payload.currency}\nOrder ID: ${payload.order_id}\nCapture ID: ${payload.capture_id}\nDashboard: ${dashboardUrl}`
        : `Chào bạn,\n\nChúng tôi đã nhận thanh toán thành công.\nGói: ${payload.plan_name}\nSố tiền: ${payload.amount} ${payload.currency}\nOrder ID: ${payload.order_id}\nCapture ID: ${payload.capture_id}\nDashboard: ${dashboardUrl}`
    };
  }

  if (templateId === TEMPLATE_IDS.failed) {
    return {
      from: paymentFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Payment not completed"
        : "[Nguyenlananh.com] Thanh toán chưa thành công",
      text: isEnglish
        ? `Hi,\n\nPayment for order ${payload.order_id} was not completed.\nRetry here: ${payload.next_step_url}\nNeed help? ${supportEmail}`
        : `Chào bạn,\n\nThanh toán cho đơn ${payload.order_id} chưa thành công.\nThử lại tại đây: ${payload.next_step_url}\nCần hỗ trợ? ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.refunded) {
    return {
      from: paymentFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? `[Nguyenlananh.com] Refund update #${payload.order_id}`
        : `[Nguyenlananh.com] Cập nhật hoàn tiền #${payload.order_id}`,
      text: isEnglish
        ? `Hi,\n\nA refund was recorded for order ${payload.order_id}.\nCurrent policy: ${payload.refund_policy}\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nHệ thống đã ghi nhận hoàn tiền cho đơn ${payload.order_id}.\nChính sách hiện tại: ${payload.refund_policy}\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.contact) {
    return {
      from: systemFromAddress(env),
      reply_to: payload.contact_email || supportEmail,
      subject: isEnglish
        ? `[Contact] Message from ${payload.name}`
        : `[Liên hệ] Tin nhắn từ ${payload.name}`,
      text: isEnglish
        ? `Name: ${payload.name}\nContact: ${payload.contact}\nMessage:\n${payload.message}\nSubmitted at: ${payload.submitted_at}`
        : `Tên: ${payload.name}\nLiên hệ: ${payload.contact}\nLời nhắn:\n${payload.message}\nGửi lúc: ${payload.submitted_at}`
    };
  }

  // Product-specific email sequences
  const productDeepUrl = payload.deep_url || "";
  const productArticleUrl = payload.article_url || "";

  if (templateId === TEMPLATE_IDS.product_loop_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Loop Map Kit is ready"
        : "[Nguyenlananh.com] Bộ Bản đồ Vòng lặp của bạn đã sẵn sàng",
      text: isEnglish
        ? `Hi,\n\nWelcome. You now have access to the Loop Map Kit.\n\nStart here:\n- Deep track: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n- Workbook (print/PDF): https://www.nguyenlananh.com/assets/pdf/loop-map-workbook.html\n\nThe first 7 days are for naming one loop. Not solving it. Just naming it.\n\nIf you need support: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã có quyền truy cập Bộ Bản đồ Vòng lặp.\n\nBắt đầu tại đây:\n- Chuyên đề chuyên sâu: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n- Workbook (in/PDF): https://www.nguyenlananh.com/assets/pdf/loop-map-workbook.html\n\n7 ngày đầu chỉ để gọi tên một vòng lặp. Chưa cần giải quyết. Chỉ cần gọi tên.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_loop_day3) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Day 3 · One loop named is already a shift"
        : "[Nguyenlananh.com] Ngày 3 · Một vòng lặp được gọi tên đã là chuyển biến",
      text: isEnglish
        ? `Hi,\n\nBy now you may have named one loop. That alone is already different from yesterday.\n\nIf you haven't, today is still fine. Pick one small trigger and write:\n- What happened\n- What I did automatically\n- What I was protecting myself from\n\nDeep track: ${productDeepUrl}\nWorkbook: https://www.nguyenlananh.com/assets/pdf/loop-map-workbook.html\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nĐến giờ bạn có thể đã gọi tên được một vòng lặp. Chỉ vậy thôi cũng đã khác hôm qua.\n\nNếu chưa, hôm nay vẫn ổn. Chọn một trigger nhỏ và viết:\n- Chuyện gì xảy ra\n- Tôi đã làm gì tự động\n- Tôi đang tự bảo vệ khỏi điều gì\n\nChuyên đề: ${productDeepUrl}\nWorkbook: https://www.nguyenlananh.com/assets/pdf/loop-map-workbook.html\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_loop_day7) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Day 7 · You are already changing the pattern"
        : "[Nguyenlananh.com] Ngày 7 · Bạn đã bắt đầu thay đổi mô thức",
      text: isEnglish
        ? `Hi,\n\nOne week in. You don't need to be finished. You only need to be a little more honest than last week.\n\nThis week: look for the insertion point — the tiny gap between trigger and reaction. That's where choice lives.\n\nDeep track: ${productDeepUrl}\nWorkbook: https://www.nguyenlananh.com/assets/pdf/loop-map-workbook.html\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nMột tuần rồi. Bạn không cần xong. Bạn chỉ cần thật thà hơn tuần trước một chút.\n\nTuần này: tìm điểm chèn — khe hở nhỏ giữa trigger và phản ứng. Đó là nơi sự lựa chọn sống.\n\nChuyên đề: ${productDeepUrl}\nWorkbook: https://www.nguyenlananh.com/assets/pdf/loop-map-workbook.html\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_space_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Space Rebuild guide is ready"
        : "[Nguyenlananh.com] Hướng dẫn Tái thiết Không gian của bạn đã sẵn sàng",
      text: isEnglish
        ? `Hi,\n\nWelcome. You now have access to the Space Rebuild program.\n\nStart here:\n- Deep track: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n- Guide (print/PDF): https://www.nguyenlananh.com/assets/pdf/space-declutter-guide.html\n\nThe first week is just looking. Do not clean yet. Look first.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã có quyền truy cập chương trình Tái thiết Không gian.\n\nBắt đầu tại đây:\n- Chuyên đề chuyên sâu: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n- Hướng dẫn (in/PDF): https://www.nguyenlananh.com/assets/pdf/space-declutter-guide.html\n\nTuần đầu chỉ để nhìn. Chưa dọn. Nhìn trước.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_space_day3) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Day 3 · One corner, one message"
        : "[Nguyenlananh.com] Ngày 3 · Một góc, một thông điệp",
      text: isEnglish
        ? `Hi,\n\nPick one drawer today. Not a room. Just one drawer.\n\nAsk each object: "What story are you telling about me?"\n\nDeep track: ${productDeepUrl}\nGuide: https://www.nguyenlananh.com/assets/pdf/space-declutter-guide.html\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nHôm nay chọn một ngăn kéo. Không phải một phòng. Chỉ một ngăn.\n\nHỏi mỗi đồ vật: "Anh/chị đang kể điều gì về tôi?"\n\nChuyên đề: ${productDeepUrl}\nHướng dẫn: https://www.nguyenlananh.com/assets/pdf/space-declutter-guide.html\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_space_day7) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Day 7 · Space is a second body"
        : "[Nguyenlananh.com] Ngày 7 · Không gian là thân thể thứ hai",
      text: isEnglish
        ? `Hi,\n\nOne week. If you cleared even one shelf with intention, your space already knows something is changing.\n\nThis week: add one living detail. A plant, a new seat, or simply light.\n\nDeep track: ${productDeepUrl}\nGuide: https://www.nguyenlananh.com/assets/pdf/space-declutter-guide.html\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nMột tuần. Nếu bạn đã dọn một kệ với ý định, không gian của bạn đã biết điều gì đó đang đổi.\n\nTuần này: thêm một chi tiết sống. Một chậu cây, một chỗ ngồi mới, hoặc đơn giản là ánh sáng.\n\nChuyên đề: ${productDeepUrl}\nHướng dẫn: https://www.nguyenlananh.com/assets/pdf/space-declutter-guide.html\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_capital_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Inner Capital filter is ready"
        : "[Nguyenlananh.com] Bộ lọc Vốn Nội tại của bạn đã sẵn sàng",
      text: isEnglish
        ? `Hi,\n\nWelcome. You now have access to the Inner Investment program.\n\nStart here:\n- Deep track: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n- Filter (print/PDF): https://www.nguyenlananh.com/assets/pdf/inner-capital-filter.html\n\nThis week: list your 3 biggest investments of time, money, and energy. Which one is actually yielding returns?\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã có quyền truy cập chương trình Đầu tư Nội tại.\n\nBắt đầu tại đây:\n- Chuyên đề chuyên sâu: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n- Bộ lọc (in/PDF): https://www.nguyenlananh.com/assets/pdf/inner-capital-filter.html\n\nTuần này: liệt kê 3 đầu tư lớn nhất của bạn về thời gian, tiền và năng lượng. Cái nào đang thực sự sinh lãi?\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_capital_day3) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Day 3 · One decision run through the filter"
        : "[Nguyenlananh.com] Ngày 3 · Một quyết định đặt qua bộ lọc",
      text: isEnglish
        ? `Hi,\n\nPick one decision you are about to make this week. Run it through the 5 questions.\n\nYou don't need the perfect answer. You need a clearer one.\n\nDeep track: ${productDeepUrl}\nFilter: https://www.nguyenlananh.com/assets/pdf/inner-capital-filter.html\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nChọn một quyết định sắp tới trong tuần này. Đặt qua 5 câu hỏi.\n\nBạn không cần câu trả lời hoàn hảo. Bạn cần câu trả lời rõ hơn.\n\nChuyên đề: ${productDeepUrl}\nBộ lọc: https://www.nguyenlananh.com/assets/pdf/inner-capital-filter.html\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_capital_day7) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Day 7 · One drain stopped is a system saved"
        : "[Nguyenlananh.com] Ngày 7 · Một rò rỉ bịt là một hệ thống được cứu",
      text: isEnglish
        ? `Hi,\n\nOne week. If you identified one drain and reduced it even slightly, your system is already stronger.\n\nThis week: reinvest. Move resources from negative to positive.\n\nDeep track: ${productDeepUrl}\nFilter: https://www.nguyenlananh.com/assets/pdf/inner-capital-filter.html\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nMột tuần. Nếu bạn đã nhận ra một rò rỉ và giảm nó dù chỉ chút ít, hệ thống của bạn đã vững hơn.\n\nTuần này: tái đầu tư. Chuyển nguồn lực từ chỗ âm sang chỗ dương.\n\nChuyên đề: ${productDeepUrl}\nBộ lọc: https://www.nguyenlananh.com/assets/pdf/inner-capital-filter.html\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_creative_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Creative Workshop is open"
        : "[Nguyenlananh.com] Xưởng Sáng tạo của bạn đã mở",
      text: isEnglish
        ? `Hi,\n\nWelcome. You now have access to the Creative Workshop.\n\nStart here:\n- Deep track: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n- Guide (print/PDF): https://www.nguyenlananh.com/assets/pdf/creative-workshop-guide.html\n\nToday: pick one corner. Set a timer for 15 minutes. Make an ugly draft.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã có quyền truy cập Xưởng Sáng tạo.\n\nBắt đầu tại đây:\n- Chuyên đề chuyên sâu: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n- Hướng dẫn (in/PDF): https://www.nguyenlananh.com/assets/pdf/creative-workshop-guide.html\n\nHôm nay: chọn một góc. Đặt giờ 15 phút. Làm một bản phác xấu.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_creative_day3) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Day 3 · Gather before you make"
        : "[Nguyenlananh.com] Ngày 3 · Thu thập trước khi tạo",
      text: isEnglish
        ? `Hi,\n\nBefore making, fill your reservoir. Today: read one page, listen to one song, or notice one detail on your walk.\n\nThen leave it. Do not create yet. Let it ferment.\n\nDeep track: ${productDeepUrl}\nGuide: https://www.nguyenlananh.com/assets/pdf/creative-workshop-guide.html\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nTrước khi tạo, lấp đầy kho. Hôm nay: đọc một trang, nghe một bài, hoặc để ý một chi tiết trên đường đi.\n\nRồi để đó. Chưa tạo. Để nó ủ.\n\nChuyên đề: ${productDeepUrl}\nHướng dẫn: https://www.nguyenlananh.com/assets/pdf/creative-workshop-guide.html\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_creative_day7) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Day 7 · One ugly draft is worth more than a hundred perfect ideas"
        : "[Nguyenlananh.com] Ngày 7 · Một bản phác xấu đáng giá hơn trăm ý tưởng hoàn hảo",
      text: isEnglish
        ? `Hi,\n\nOne week. If you made even one ugly draft, you have already done more than most people who are still waiting for inspiration.\n\nThis week: choose. Look back at your drafts. Pick the one with breath.\n\nDeep track: ${productDeepUrl}\nGuide: https://www.nguyenlananh.com/assets/pdf/creative-workshop-guide.html\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nMột tuần. Nếu bạn đã làm một bản phác xấu, bạn đã làm được nhiều hơn hầu hết những người vẫn đang đợi cảm hứng.\n\nTuần này: chọn. Nhìn lại phác thảo. Chọn cái có hơi thở.\n\nChuyên đề: ${productDeepUrl}\nHướng dẫn: https://www.nguyenlananh.com/assets/pdf/creative-workshop-guide.html\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_family_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Family & Roots map is ready"
        : "[Nguyenlananh.com] Bản đồ Gia đình & Gốc rễ của bạn đã sẵn sàng",
      text: isEnglish
        ? `Hi,\n\nWelcome. You now have access to the Family & Roots program.\n\nStart here:\n- Deep track: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n- Map (print/PDF): https://www.nguyenlananh.com/assets/pdf/family-roots-map.html\n\nThis week: write one belief your family holds without saying it out loud.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã có quyền truy cập chương trình Gia đình & Gốc rễ.\n\nBắt đầu tại đây:\n- Chuyên đề chuyên sâu: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n- Bản đồ (in/PDF): https://www.nguyenlananh.com/assets/pdf/family-roots-map.html\n\nTuần này: viết một niềm tin gia đình bạn đang giữ nhưng không nói thành lời.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_family_day3) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Day 3 · One role you play without choosing"
        : "[Nguyenlananh.com] Ngày 3 · Một vai bạn đóng mà không chọn",
      text: isEnglish
        ? `Hi,\n\nToday: notice one role you slip into when you are with family. The peacemaker. The over-functioner. The invisible one.\n\nYou are not blaming anyone. You are just seeing.\n\nDeep track: ${productDeepUrl}\nMap: https://www.nguyenlananh.com/assets/pdf/family-roots-map.html\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nHôm nay: để ý một vai bạn tự động đóng khi ở với gia đình. Người hòa giải. Người gánh hết. Người vô hình.\n\nBạn không đổ lỗi ai. Bạn chỉ nhìn.\n\nChuyên đề: ${productDeepUrl}\nBản đồ: https://www.nguyenlananh.com/assets/pdf/family-roots-map.html\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_family_day7) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Day 7 · You can keep what is true and release what is borrowed"
        : "[Nguyenlananh.com] Ngày 7 · Bạn có thể giữ điều thật và buông điều mượn",
      text: isEnglish
        ? `Hi,\n\nOne week. If you saw one pattern that is not yours, that is already a beginning.\n\nThis week: write one thing you choose to keep and one thing you choose to transform.\n\nDeep track: ${productDeepUrl}\nMap: https://www.nguyenlananh.com/assets/pdf/family-roots-map.html\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nMột tuần. Nếu bạn đã thấy một mô thức không thuộc về mình, đó đã là khởi đầu.\n\nTuần này: viết một điều bạn chọn giữ và một điều bạn chọn biến đổi.\n\nChuyên đề: ${productDeepUrl}\nBản đồ: https://www.nguyenlananh.com/assets/pdf/family-roots-map.html\n\nHỗ trợ: ${supportEmail}`
    };
  }

  return {
    from: systemFromAddress(env),
    reply_to: supportEmail,
    subject: isEnglish ? "[Nguyenlananh.com] Payment event" : "[Nguyenlananh.com] Sự kiện thanh toán",
    text: JSON.stringify(payload, null, 2)
  };
}

async function sendViaResend(env, emailJob) {
  const content = renderTemplate(emailJob.template_id, emailJob.language, emailJob.payload_json, env);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: content.from,
      to: [emailJob.recipient_email],
      reply_to: content.reply_to,
      subject: content.subject,
      text: content.text,
      html: `<pre style="font-family:ui-monospace, SFMono-Regular, Menlo, monospace; white-space:pre-wrap;">${escapeHtml(
        content.text
      )}</pre>`
    })
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.message || "Email provider request failed.");
    error.details = body;
    throw error;
  }

  return {
    provider_message_id: body.id || null
  };
}

async function sendViaMailIaiOne(env, emailJob) {
  const content = renderTemplate(emailJob.template_id, emailJob.language, emailJob.payload_json, env);
  const baseUrl = normalizeMailApiBaseUrl(env);
  const useLegacyEndpoint = baseUrl.includes("/_mail");
  const endpoint = useLegacyEndpoint ? `${baseUrl}/emails` : `${baseUrl}/send`;

  const headers = {
    Authorization: `Bearer ${env.MAIL_API_KEY}`,
    "Content-Type": "application/json"
  };

  if (!useLegacyEndpoint && env.MAIL_API_WORKSPACE_ID) {
    headers["X-Workspace-Id"] = env.MAIL_API_WORKSPACE_ID;
  }

  if (!useLegacyEndpoint) {
    headers["X-Request-Id"] = `nla-${emailJob.template_id}-${Date.now()}`;
  }

  const html = `<pre style="font-family:ui-monospace, SFMono-Regular, Menlo, monospace; white-space:pre-wrap;">${escapeHtml(
    content.text
  )}</pre>`;

  const body = useLegacyEndpoint
    ? {
        from: content.from,
        to: [emailJob.recipient_email],
        reply_to: content.reply_to,
        subject: content.subject,
        text: content.text,
        html
      }
    : {
        from: { email: content.from },
        to: [{ email: emailJob.recipient_email }],
        reply_to: content.reply_to ? { email: content.reply_to } : undefined,
        subject: content.subject,
        text: content.text,
        html,
        tags: ["nguyenlananh.com", emailJob.template_id],
        metadata: {
          source_domain: "nguyenlananh.com",
          template_id: emailJob.template_id
        }
      };

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
  const raw = await response.text();
  const parsed = (() => {
    try {
      return JSON.parse(raw);
    } catch (_error) {
      return {};
    }
  })();

  if (!response.ok) {
    const error = new Error(parsed.message || raw || "MAIL_API request failed.");
    error.details = parsed;
    throw error;
  }

  return {
    provider_message_id: parsed.message_id || parsed.id || parsed.data?.message_id || null
  };
}

export async function sendTemplateEmailDirect({ env, templateId, recipientEmail, language, payload }) {
  const content = renderTemplate(templateId, language, payload, env);
  const emailJob = {
    template_id: templateId,
    recipient_email: recipientEmail,
    language,
    payload_json: payload
  };

  const provider = normalizeEmailProvider(env);
  const canSend =
    (provider === "mail_iai_one" && !!env.MAIL_API_KEY) || (provider === "resend" && !!env.RESEND_API_KEY);

  if (!canSend) {
    return {
      status: "preview",
      provider,
      provider_message_id: null,
      content
    };
  }

  // Try primary provider
  let lastError = null;
  try {
    const result =
      provider === "mail_iai_one" ? await sendViaMailIaiOne(env, emailJob) : await sendViaResend(env, emailJob);
    return {
      status: "sent",
      provider,
      provider_message_id: result.provider_message_id || null,
      content
    };
  } catch (error) {
    lastError = error;
    console.error("[EMAIL_SEND_FAILED] provider=" + provider + " error=" + (error.message || "unknown") + " details=" + JSON.stringify(error.details || {}));

    // Fallback to Resend if primary failed and Resend key is available
    if (provider !== "resend" && env.RESEND_API_KEY) {
      try {
        const fallbackResult = await sendViaResend(env, emailJob);
        console.warn("[EMAIL_SEND_FALLBACK] Fallback to Resend succeeded after " + provider + " failed.");
        return {
          status: "sent",
          provider: "resend",
          provider_message_id: fallbackResult.provider_message_id || null,
          content
        };
      } catch (fallbackError) {
        console.error("[EMAIL_SEND_FALLBACK] Fallback to Resend also failed:", fallbackError.message);
      }
    }
  }

  return {
    status: "failed",
    provider,
    provider_message_id: null,
    error_detail: lastError?.message || "Unknown email failure",
    content
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function queueAndSendEmail({ db, env, templateId, recipientEmail, language, dedupeKey, payload }) {
  const provider = normalizeEmailProvider(env);
  const existing = await getEmailJobByDedupeKey(db, dedupeKey);
  if (existing) return existing;

  const timestamp = nowIso();
  const job = await insertEmailJob(db, {
    template_id: templateId,
    recipient_email: recipientEmail,
    language,
    provider,
    dedupe_key: dedupeKey,
    payload_json: payload,
    status: "queued",
    created_at: timestamp,
    updated_at: timestamp,
    scheduled_for: timestamp
  });

  const canSend =
    (provider === "mail_iai_one" && !!env.MAIL_API_KEY) || (provider === "resend" && !!env.RESEND_API_KEY);
  if (!canSend) {
    return job;
  }

  let result = null;
  let lastError = null;
  try {
    result = provider === "mail_iai_one" ? await sendViaMailIaiOne(env, job) : await sendViaResend(env, job);
  } catch (error) {
    lastError = error;
    console.error("[EMAIL_QUEUE_SEND_FAILED] provider=" + provider + " error=" + (error.message || "unknown"));

    // Fallback to Resend if primary failed and Resend key is available
    if (provider !== "resend" && env.RESEND_API_KEY) {
      try {
        result = await sendViaResend(env, job);
        console.warn("[EMAIL_QUEUE_SEND_FALLBACK] Fallback to Resend succeeded after " + provider + " failed.");
      } catch (fallbackError) {
        console.error("[EMAIL_QUEUE_SEND_FALLBACK] Fallback to Resend also failed:", fallbackError.message);
        lastError = fallbackError;
      }
    }
  }

  if (result) {
    await updateEmailJob(db, job.id, {
      status: "sent",
      provider_message_id: result.provider_message_id,
      sent_at: nowIso(),
      updated_at: nowIso()
    });
    return {
      ...job,
      status: "sent",
      provider_message_id: result.provider_message_id
    };
  }

  await updateEmailJob(db, job.id, {
    status: "failed",
    error_detail: lastError?.message || "Unknown email failure",
    failed_at: nowIso(),
    updated_at: nowIso()
  });
  return {
    ...job,
    status: "failed",
    error_detail: lastError?.message || "Unknown email failure"
  };
}
