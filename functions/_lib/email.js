import { TEMPLATE_IDS } from "./constants.js";
import { getEmailJobByDedupeKey, insertEmailJob, updateEmailJob } from "./db.js";
import { nowIso } from "./utils.js";

function normalizeEmailProvider(env) {
  const explicit = String(env.EMAIL_PROVIDER || "")
    .trim()
    .toLowerCase();
  if (explicit) return explicit;
  if (env.MAIL_API_KEY) return "mail_iai_one";
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
    const loginUrl = payload.login_url || payload.magic_link || dashboardUrl || "";
    const loginExpireMinutes = payload.login_url_expire_minutes || 60;
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Welcome to your journey system"
        : "[Nguyenlananh.com] Chào mừng bạn vào hệ hành trình",
      text: isEnglish
        ? `Hi,\n\nYour membership is now active.\nPlan: ${payload.plan_name}\nLogin link (expires in ${loginExpireMinutes} minutes): ${loginUrl}\nDashboard: ${dashboardUrl}\n\nIf this was not you, contact ${supportEmail}.`
        : `Chào bạn,\n\nTài khoản thành viên của bạn đã được kích hoạt.\nGói: ${payload.plan_name}\nLink đăng nhập (có hiệu lực trong ${loginExpireMinutes} phút): ${loginUrl}\nDashboard: ${dashboardUrl}\n\nNếu cần hỗ trợ, vui lòng liên hệ ${supportEmail}.`
    };
  }

  if (templateId === TEMPLATE_IDS.resend) {
    const loginUrl = payload.login_url || payload.magic_link || "";
    const loginExpireMinutes = payload.login_url_expire_minutes || payload.magic_link_expire_minutes || 60;
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish ? "[Nguyenlananh.com] Your new login link" : "[Nguyenlananh.com] Link đăng nhập mới của bạn",
      text: isEnglish
        ? `Hi,\n\nHere is your new login link:\n${loginUrl}\n\nThis link expires in ${loginExpireMinutes} minutes. If you did not request this, contact ${supportEmail}.`
        : `Chào bạn,\n\nĐây là link đăng nhập mới của bạn:\n${loginUrl}\n\nLink có hiệu lực trong ${loginExpireMinutes} phút. Nếu bạn không yêu cầu, vui lòng liên hệ ${supportEmail}.`
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

  // Pilot program welcome emails (T90-T92)
  if (templateId === TEMPLATE_IDS.product_self_trust_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Self-Trust Practice Lab is ready"
        : "[Nguyenlananh.com] Phòng thực hành Niềm tin bản thân đã sẵn sàng",
      text: isEnglish
        ? `Hi,\n\nWelcome to the Self-Trust Practice Lab.\n\nYou now have access to the full program: pre-assessment, 6 lessons, 2 practice labs, submissions, and final report.\n\nStart here:\n- Deep track: ${productDeepUrl}\n- Landing page: ${productArticleUrl}\n\nWeek 1-3: Build your evidence log daily. Don't aim for big — aim for honest.\nWeek 4-6: Review and submit your evidence vault.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nChào mừng bạn vào Phòng thực hành Niềm tin bản thân.\n\nBạn đã có quyền truy cập toàn bộ chương trình: pre-assessment, 6 bài học, 2 practice labs, 2 submissions, và báo cáo cuối.\n\nBắt đầu tại đây:\n- Chuyên đề: ${productDeepUrl}\n- Trang sản phẩm: ${productArticleUrl}\n\nTuần 1-3: Ghi bằng chứng hằng ngày. Không cần lớn — cần thật.\nTuần 4-6: Review và nộp kho bằng chứng.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_open_loop_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Open Loop Closure Sprint starts now"
        : "[Nguyenlananh.com] Sprint Đóng vòng lặp bắt đầu ngay",
      text: isEnglish
        ? `Hi,\n\nWelcome to the Open Loop Closure Sprint — 7 days.\n\nYou now have access to the full program: pre-assessment, 6 lessons, 2 labs, submissions, and final report.\n\nStart here:\n- Deep track: ${productDeepUrl}\n- Landing page: ${productArticleUrl}\n\nDay 1: List every open loop. Don't solve yet. Just list.\nDay 7: Close at least 3 loops and submit your report.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nChào mừng bạn vào Sprint Đóng vòng lặp — 7 ngày.\n\nBạn đã có quyền truy cập toàn bộ chương trình: pre-assessment, 6 bài học, 2 labs, 2 submissions, và báo cáo cuối.\n\nBắt đầu tại đây:\n- Chuyên đề: ${productDeepUrl}\n- Trang sản phẩm: ${productArticleUrl}\n\nNgày 1: Liệt kê tất cả vòng lặp đang treo. Chưa đóng. Chỉ liệt kê.\nNgày 7: Đóng ít nhất 3 loop và nộp báo cáo.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_after_action_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your After-Action Review System is ready"
        : "[Nguyenlananh.com] Hệ thống Hậu kiểm đã sẵn sàng",
      text: isEnglish
        ? `Hi,\n\nWelcome to the Personal After-Action Review System.\n\nYou now have access to the full program: pre-assessment, 6 lessons, 2 labs, submissions, and final report.\n\nStart here:\n- Deep track: ${productDeepUrl}\n- Landing page: ${productArticleUrl}\n\nWeek 1-2: Run an AAR on one recent project using the 4-question framework.\nWeek 3-4: Run an AAR on a 3-month period and submit.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nChào mừng bạn vào Hệ thống Hậu kiểm cá nhân.\n\nBạn đã có quyền truy cập toàn bộ chương trình: pre-assessment, 6 bài học, 2 labs, 2 submissions, và báo cáo cuối.\n\nBắt đầu tại đây:\n- Chuyên đề: ${productDeepUrl}\n- Trang sản phẩm: ${productArticleUrl}\n\nTuần 1-2: Chạy AAR cho 1 dự án gần nhất với khung 4 câu.\nTuần 3-4: Chạy AAR cho 1 giai đoạn 3 tháng và nộp.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  // Micro product welcome emails (T70-T74)
  if (templateId === TEMPLATE_IDS.product_micro_life_reset_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Life Reset Mini guide is ready"
        : "[Nguyenlananh.com] Hướng dẫn Life Reset Mini của bạn đã sẵn sàng",
      text: isEnglish
        ? `Hi,\n\nWelcome. You now have access to the Life Reset Mini.\n\nStart here:\n- Deep track: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n\nToday: pick one area of life that feels off. Write one sentence: "What is actually draining me here?" That question is the reset.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã có quyền truy cập Life Reset Mini.\n\nBắt đầu tại đây:\n- Chuyên đề: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n\nHôm nay: chọn một lĩnh vực đời sống đang lệch nhịp. Viết một câu: "Điều gì thực sự đang làm tôi kiệt?" Câu hỏi đó là reset.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_micro_inner_listening_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Inner Listening Kit is ready"
        : "[Nguyenlananh.com] Bộ Lắng nghe Bên trong của bạn đã sẵn sàng",
      text: isEnglish
        ? `Hi,\n\nWelcome. You now have access to the Inner Listening Kit.\n\nStart here:\n- Deep track: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n\nToday: sit for 5 minutes. Do not fix anything. Just listen to what is moving inside you.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã có quyền truy cập Bộ Lắng nghe Bên trong.\n\nBắt đầu tại đây:\n- Chuyên đề: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n\nHôm nay: ngồi 5 phút. Đừng sửa gì. Chỉ lắng nghe điều gì đang chuyển động bên trong.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_micro_one_corner_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your One Corner Reset is ready"
        : "[Nguyenlananh.com] Bộ Dọn Một Góc của bạn đã sẵn sàng",
      text: isEnglish
        ? `Hi,\n\nWelcome. You now have access to the One Corner Reset.\n\nStart here:\n- Deep track: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n\nToday: pick one corner. Not a room. One corner. Remove 3 things that do not belong there.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã có quyền truy cập Bộ Dọn Một Góc.\n\nBắt đầu tại đây:\n- Chuyên đề: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n\nHôm nay: chọn một góc. Không phải một phòng. Một góc. Bỏ 3 thứ không thuộc về nơi đó.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_micro_7day_rhythm_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your 7-Day True Rhythm starts now"
        : "[Nguyenlananh.com] Nhịp Sống Thật 7 ngày của bạn bắt đầu ngay",
      text: isEnglish
        ? `Hi,\n\nWelcome. You now have access to the 7-Day True Rhythm.\n\nStart here:\n- Deep track: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n\nDay 1: write down your actual wake, eat, work, rest, and sleep times. Not the ideal. The actual.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã có quyền truy cập Nhịp Sống Thật 7 ngày.\n\nBắt đầu tại đây:\n- Chuyên đề: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n\nNgày 1: ghi lại giờ thức, ăn, làm, nghỉ, ngủ thực tế. Không phải lý tưởng. Mà là thực tế.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_micro_companion_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Companion Circle is ready"
        : "[Nguyenlananh.com] Vòng Đồng hành của bạn đã sẵn sàng",
      text: isEnglish
        ? `Hi,\n\nWelcome. You now have access to the Companion Circle.\n\nStart here:\n- Deep track: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n\nThis is a small, guided circle. Show up as you are. The first step is to share one thing you are currently holding.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã có quyền truy cập Vòng Đồng hành.\n\nBắt đầu tại đây:\n- Chuyên đề: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n\nĐây là một vòng nhỏ, có hướng dẫn. Hãy đến như bạn đang là. Bước đầu là chia sẻ một điều bạn đang mang theo.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  // Premium product welcome emails (T80-T89)
  if (templateId === TEMPLATE_IDS.product_asmt_avoidance_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Avoidance Map assessment is ready"
        : "[Nguyenlananh.com] Bài đánh giá Bản đồ Né tránh của bạn đã sẵn sàng",
      text: isEnglish
        ? `Hi,\n\nWelcome. You now have access to the Avoidance Map assessment.\n\nStart here:\n- Assessment: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n\nTake the assessment in one sitting if possible. The map is most useful when you answer honestly, not ideally.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã có quyền truy cập bài đánh giá Bản đồ Né tránh.\n\nBắt đầu tại đây:\n- Bài đánh giá: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n\nNên làm bài trong một lần. Bản đồ có ích nhất khi bạn trả lời thật, không phải lý tưởng.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_prog_rhythm_lab_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Rhythm Design Lab is ready"
        : "[Nguyenlananh.com] Phòng thực hành Thiết kế Nhịp sống đã sẵn sàng",
      text: isEnglish
        ? `Hi,\n\nWelcome. You now have access to the Rhythm Design Lab.\n\nStart here:\n- Program: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n\nWeek 1: audit your current rhythm. Week 2: design one small, repeatable change.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã có quyền truy cập Phòng thực hành Thiết kế Nhịp sống.\n\nBắt đầu tại đây:\n- Chương trình: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n\nTuần 1: kiểm tra nhịp sống hiện tại. Tuần 2: thiết kế một thay đổi nhỏ, có thể lặp lại.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_prog_emo_block_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Emotional Block Mapping is ready"
        : "[Nguyenlananh.com] Bản đồ Khối Cảm xúc của bạn đã sẵn sàng",
      text: isEnglish
        ? `Hi,\n\nWelcome. You now have access to the Emotional Block Mapping program.\n\nStart here:\n- Program: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n\nToday: name one place where you feel stuck but cannot say why. That is your first block.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã có quyền truy cập chương trình Bản đồ Khối Cảm xúc.\n\nBắt đầu tại đây:\n- Chương trình: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n\nHôm nay: gọi tên một nơi bạn cảm thấy mắc kẹt nhưng không nói được lý do. Đó là khối đầu tiên.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_cert_boundary_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Boundary Foundation Certification is ready"
        : "[Nguyenlananh.com] Chứng nhận Nền tảng Ranh giới của bạn đã sẵn sàng",
      text: isEnglish
        ? `Hi,\n\nWelcome. You are enrolled in the Boundary Practice Certification — Foundation.\n\nStart here:\n- Program: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n\nThis certification includes 6 modules, a final exam, and a practical submission. Plan 4-6 weeks.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã đăng ký Chứng nhận Thực hành Ranh giới — Nền tảng.\n\nBắt đầu tại đây:\n- Chương trình: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n\nChứng nhận gồm 6 module, thi cuối và bài thực hành. Dự kiến 4-6 tuần.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_prog_family_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Family Pattern Mapping is ready"
        : "[Nguyenlananh.com] Bản đồ Mô thức Gia đình của bạn đã sẵn sàng",
      text: isEnglish
        ? `Hi,\n\nWelcome. You now have access to the Family Pattern Mapping program.\n\nStart here:\n- Program: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n\nWeek 1: map one role you play in your family without choosing it.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã có quyền truy cập chương trình Bản đồ Mô thức Gia đình.\n\nBắt đầu tại đây:\n- Chương trình: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n\nTuần 1: vẽ một vai bạn đang đóng trong gia đình mà không chọn nó.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_prog_space_reset_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Space Reset Practitioner path is ready"
        : "[Nguyenlananh.com] Lộ trình Space Reset Practitioner đã sẵn sàng",
      text: isEnglish
        ? `Hi,\n\nWelcome. You are now on the Space Reset Practitioner path.\n\nStart here:\n- Program: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n\nModule 1: observe before you change. Do not declutter yet. Just look.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã bắt đầu lộ trình Space Reset Practitioner.\n\nBắt đầu tại đây:\n- Chương trình: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n\nModule 1: quan sát trước khi thay đổi. Chưa dọn. Chỉ nhìn.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_prog_creative_studio_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Creative Practice Studio is open"
        : "[Nguyenlananh.com] Xưởng Thực hành Sáng tạo của bạn đã mở",
      text: isEnglish
        ? `Hi,\n\nWelcome. You now have access to the Creative Practice Studio.\n\nStart here:\n- Program: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n\nDay 1: gather 5 raw materials (images, quotes, questions) before making anything.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã có quyền truy cập Xưởng Thực hành Sáng tạo.\n\nBắt đầu tại đây:\n- Chương trình: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n\nNgày 1: thu thập 5 nguyên liệu thô (hình ảnh, trích dẫn, câu hỏi) trước khi tạo gì.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_diag_capital_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Inner Capital Diagnostic is ready"
        : "[Nguyenlananh.com] Bộ chẩn đoán Vốn Nội tại của bạn đã sẵn sàng",
      text: isEnglish
        ? `Hi,\n\nWelcome. You now have access to the Inner Capital Diagnostic.\n\nStart here:\n- Diagnostic: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n\nSet aside 20-30 minutes. Answer about the last 90 days, not who you want to become.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã có quyền truy cập Bộ chẩn đoán Vốn Nội tại.\n\nBắt đầu tại đây:\n- Chẩn đoán: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n\nDành 20-30 phút. Trả lời về 90 ngày qua, không phải về người bạn muốn trở thành.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_cert_companion_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Certified Practice Companion L1 path is ready"
        : "[Nguyenlananh.com] Lộ trình Certified Practice Companion L1 đã sẵn sàng",
      text: isEnglish
        ? `Hi,\n\nWelcome. You are enrolled in the Certified Practice Companion — Level 1 path.\n\nStart here:\n- Program: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n\nThis is a 12-month certification path. You will move through practice labs, submissions, and a final assessment.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã đăng ký lộ trình Certified Practice Companion — Level 1.\n\nBắt đầu tại đây:\n- Chương trình: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n\nĐây là lộ trình chứng nhận 12 tháng. Bạn sẽ trải qua practice labs, bài nộp và đánh giá cuối.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.product_cert_method_designer_welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Practice Method Designer path is ready"
        : "[Nguyenlananh.com] Lộ trình Practice Method Designer đã sẵn sàng",
      text: isEnglish
        ? `Hi,\n\nWelcome. You are enrolled in the Practice Method Designer path.\n\nStart here:\n- Program: ${productDeepUrl}\n- Base article: ${productArticleUrl}\n\nThis path teaches you to design repeatable practice systems for yourself and others.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nBạn đã đăng ký lộ trình Practice Method Designer.\n\nBắt đầu tại đây:\n- Chương trình: ${productDeepUrl}\n- Bài viết nền: ${productArticleUrl}\n\nLộ trình này dạy bạn thiết kế hệ thống thực hành có thể lặp lại cho bản thân và người khác.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  // User notifications
  if (templateId === TEMPLATE_IDS.payment_pending) {
    return {
      from: paymentFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? `[Nguyenlananh.com] Payment pending confirmation #${payload.order_id}`
        : `[Nguyenlananh.com] Thanh toán đang chờ xác nhận #${payload.order_id}`,
      text: isEnglish
        ? `Hi,\n\nWe received your order and are waiting for the bank transfer to be confirmed.\n\nOrder: ${payload.order_id}\nAmount: ${payload.amount} ${payload.currency}\nTransfer note: ${payload.transfer_note || "-"}\n\nOnce confirmed, you will receive a welcome email with your login link.\n\nQuestions? ${supportEmail}`
        : `Chào bạn,\n\nChúng tôi đã nhận đơn hàng và đang chờ xác nhận chuyển khoản.\n\nĐơn: ${payload.order_id}\nSố tiền: ${payload.amount} ${payload.currency}\nNội dung CK: ${payload.transfer_note || "-"}\n\nKhi được xác nhận, bạn sẽ nhận email chào mừng kèm link đăng nhập.\n\nThắc mắc: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.payment_confirmed) {
    return {
      from: paymentFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? `[Nguyenlananh.com] Payment confirmed #${payload.order_id}`
        : `[Nguyenlananh.com] Thanh toán đã được xác nhận #${payload.order_id}`,
      text: isEnglish
        ? `Hi,\n\nYour payment has been confirmed. You can now access your content.\n\nOrder: ${payload.order_id}\nAmount: ${payload.amount} ${payload.currency}\nDashboard: ${payload.dashboard_url || "-"}\n\nIf you do not see your content, try logging in again.\n\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nThanh toán của bạn đã được xác nhận. Bạn có thể truy cập nội dung ngay bây giờ.\n\nĐơn: ${payload.order_id}\nSố tiền: ${payload.amount} ${payload.currency}\nDashboard: ${payload.dashboard_url || "-"}\n\nNếu chưa thấy nội dung, hãy đăng nhập lại.\n\nHỗ trợ: ${supportEmail}`
    };
  }

  // Creator onboarding (T93-T95)
  const creatorDashboardUrl = "https://www.nguyenlananh.com/members/creator-dashboard/";
  const creatorPolicyUrl = "https://www.nguyenlananh.com/creators/policy/";

  if (templateId === TEMPLATE_IDS.creator_onboarding) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Welcome to the Creator program"
        : "[Nguyenlananh.com] Chào mừng bạn vào chương trình Creator",
      text: isEnglish
        ? `Hi ${creatorName},\n\nThank you for applying to become a Creator on nguyenlananh.com.\n\nWe received your application and will review it within 5-7 business days. You'll receive an email once approved.\n\nWhile you wait, please review our Creator Policy:\n- IP rights, consent, revenue share: ${creatorPolicyUrl}\n\nIf approved, you'll get access to the Creator Dashboard: ${creatorDashboardUrl}\n\nSupport: ${supportEmail}`
        : `Chào ${creatorName},\n\nCảm ơn bạn đã ứng tuyển làm Creator trên nguyenlananh.com.\n\nChúng tôi đã nhận đơn và sẽ duyệt trong 5-7 ngày làm việc. Bạn sẽ nhận email khi được duyệt.\n\nTrong lúc chờ, vui lòng đọc Chính sách Creator:\n- Quyền IP, đồng thuận, chia sẻ doanh thu: ${creatorPolicyUrl}\n\nNếu được duyệt, bạn sẽ có quyền truy cập Creator Dashboard: ${creatorDashboardUrl}\n\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.creator_approved) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Your Creator application is approved!"
        : "[Nguyenlananh.com] Đơn Creator của bạn đã được duyệt!",
      text: isEnglish
        ? `Hi ${creatorName},\n\nCongratulations! Your Creator application has been approved.\n\nYou can now:\n- Access your Creator Dashboard: ${creatorDashboardUrl}\n- Submit your first content piece\n- Review the Creator Policy (IP, revenue share 70/30): ${creatorPolicyUrl}\n\nNext steps:\n1. Complete your creator profile (bio, avatar, links)\n2. Submit your first article or lesson\n3. Wait for review (usually 2-3 days)\n\nRevenue share: You keep 70% of all sales from your content. Payouts are monthly (min 500,000 VND or $20).\n\nWelcome aboard!\nSupport: ${supportEmail}`
        : `Chào ${creatorName},\n\nChúc mừng! Đơn Creator của bạn đã được duyệt.\n\nBạn có thể:\n- Truy cập Creator Dashboard: ${creatorDashboardUrl}\n- Nộp nội dung đầu tiên\n- Đọc Chính sách Creator (IP, doanh thu 70/30): ${creatorPolicyUrl}\n\nBước tiếp theo:\n1. Hoàn thiện profile (bio, avatar, links)\n2. Nộp bài viết hoặc bài học đầu tiên\n3. Chờ duyệt (thường 2-3 ngày)\n\nChia sẻ doanh thu: Bạn giữ 70% doanh thu từ nội dung. Thanh toán hàng tháng (tối thiểu 500.000 VND hoặc $20).\n\nChào mừng bạn!\nHỗ trợ: ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.creator_rejected) {
    const reason = String(payload?.reason || "");
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Update on your Creator application"
        : "[Nguyenlananh.com] Cập nhật đơn Creator của bạn",
      text: isEnglish
        ? `Hi ${creatorName},\n\nThank you for your interest in becoming a Creator on nguyenlananh.com.\n\nAfter review, we're unable to approve your application at this time.${reason ? `\n\nReason: ${reason}` : ""}\n\nThis doesn't mean you can't apply again. We encourage you to:\n- Review our content values and methodology\n- Submit more sample work\n- Apply again after 30 days\n\nIf you have questions, reply to this email.\n\nSupport: ${supportEmail}`
        : `Chào ${creatorName},\n\nCảm ơn bạn đã quan tâm đến chương trình Creator trên nguyenlananh.com.\n\nSau khi xem xét, chúng tôi chưa thể duyệt đơn của bạn lúc này.${reason ? `\n\nLý do: ${reason}` : ""}\n\nĐiều này không có nghĩa bạn không thể ứng tuyển lại. Chúng tôi khuyến khích:\n- Đọc lại giá trị nội dung và phương pháp của chúng tôi\n- Gửi thêm sample work\n- Ứng tuyển lại sau 30 ngày\n\nNếu có thắc mắc, trả lời email này.\n\nHỗ trợ: ${supportEmail}`
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
