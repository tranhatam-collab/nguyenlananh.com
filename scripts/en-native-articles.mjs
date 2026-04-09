import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DOMAIN = 'https://www.nguyenlananh.com';

const CATEGORY_LABELS = {
  '/en/bai-viet/di-vao-ben-trong/': 'Inner Work',
  '/en/bai-viet/mon-hoc-don-dep/': 'The Cleaning Practice',
  '/en/bai-viet/lao-dong-sang-tao/': 'Labor and Creation',
  '/en/bai-viet/gia-tri-noi-tai/': 'Inner Value',
  '/en/bai-viet/dau-tu-ban-than/': 'Investing in Yourself',
  '/en/bai-viet/du-an-nhat-ky/': 'Project Journal'
};

const ARTICLES = {
  'dieu-dang-tiec-nhat-khi-ket-thuc-mot-kiep-song': {
    title: 'The Deepest Regret at the End of a Life',
    description: 'A foundational reflection on the deepest regret: living an entire life without truly understanding yourself.',
    p1: 'The deepest regret is rarely losing to others. It is living far from yourself for too long.',
    p2: 'Many people stay busy, responsible, and functional, yet feel empty inside. The issue is not a lack of effort. The issue is a direction that no longer matches the truth inside.',
    p3: 'When you can name the loop you are trapped in, you regain the power to choose differently. That is where a meaningful life begins again.',
    practice: 'Write three lines tonight: what I am living for, what I keep avoiding, and one real step I will take tomorrow.'
  },
  'hanh-trinh-di-vao-ben-trong': {
    title: 'The Journey Inward',
    description: 'A clear map for returning inward, seeing what runs your life, and rebuilding from the inside out.',
    p1: 'Going inward is not withdrawal. It is a serious return to the center of your life.',
    p2: 'This journey asks for honesty: seeing your reactions, your old beliefs, and your repeated emotional patterns without self-judgment.',
    p3: 'The reward is not perfection. The reward is clarity, steadiness, and the ability to choose your next step with integrity.',
    practice: 'Set aside 15 quiet minutes today and describe one pattern you keep repeating and one boundary you now need.'
  },
  'di-vao-ben-trong-giai-ma-nhung-gi-dang-van-hanh-ban': {
    title: 'Going Inward: Decoding What Is Running You',
    description: 'A practical article to decode hidden drivers, emotional loops, and unconscious reactions that shape your life.',
    p1: 'Most of us are not fully choosing. We are reacting from old scripts.',
    p2: 'Unseen beliefs, old memories, and automatic defenses can quietly run your decisions, relationships, and direction.',
    p3: 'When you decode these inner drivers, you stop living on autopilot and begin living with intention.',
    practice: 'Notice one strong reaction today. Ask: what belief is behind this, and does that belief still serve my life now?'
  },
  'truong-thanh-thong-qua-mon-hoc-don-dep': {
    title: 'Growing Through the Cleaning Practice',
    description: 'How simple acts of cleaning become a real path of maturity, awareness, and inner order.',
    p1: 'Cleaning is not a small task. It is a training ground for maturity.',
    p2: 'When you clean with presence, you practice order, patience, and care. You also confront avoidance, distraction, and emotional noise.',
    p3: 'Over time, this practice rebuilds trust with yourself. Your outer space clears, and your inner life becomes more breathable.',
    practice: 'Choose one corner of your home and clean it with full attention for 20 minutes, no multitasking.'
  },
  'cai-choi': {
    title: 'The Broom',
    description: 'A symbol of conscious labor, quiet discipline, and everyday presence.',
    p1: 'A broom looks ordinary, but it can become a doorway to a different life.',
    p2: 'When you hold it with attention, you learn rhythm, humility, and consistency. You learn to create value without needing applause.',
    p3: 'Real discipline is often built through small repeated actions. The broom reminds us where true mastery starts.',
    practice: 'Do one manual task today with full presence for 20 uninterrupted minutes.'
  },
  'quet-la-va-viec-hoc': {
    title: 'Sweeping Leaves and the Way We Learn',
    description: 'A grounded lesson on learning through hands-on work, repetition, and real-life attention.',
    p1: 'Sweeping leaves can teach more than theory when you are fully present.',
    p2: 'Manual work slows the mind and reconnects you with rhythm, body, and reality. It turns learning into lived experience.',
    p3: 'This kind of learning is not fast, but it is durable. It changes how you live, not just what you know.',
    practice: 'Pick one repetitive task today and stay with it until your breathing and attention settle into one rhythm.'
  },
  'gia-tri-nao-la-vinh-cuu-truoc-song-gio': {
    title: 'What Value Endures Before Any Storm?',
    description: 'A reflection on the kind of value that remains when status, money, and certainty are shaken.',
    p1: 'When life shakes, external advantages can disappear quickly.',
    p2: 'What remains is inner stability: clear seeing, emotional steadiness, and the capacity to adapt with wisdom.',
    p3: 'Inner value is not abstract. It is built in daily choices, honest reflection, and disciplined action over time.',
    practice: 'List three inner qualities you want to strengthen this month and one daily action for each quality.'
  },
  'dau-tu-ban-than-hoc-tap-nhan-thuc-cao-hon': {
    title: 'Investing in Yourself Through Higher Awareness',
    description: 'Why the most important investment is upgrading awareness, not chasing quick external gains.',
    p1: 'Self-investment is not a trend. It is a long-term responsibility.',
    p2: 'Skills and credentials matter, but without deeper awareness they often repeat the same old patterns at a higher speed.',
    p3: 'When awareness grows, your decisions improve. Better decisions create a better life architecture over time.',
    practice: 'Review one recent decision and ask what a clearer, calmer, more aware version of you would choose now.'
  },
  'dau-tu-hien-tai-tu-do-tuong-lai': {
    title: 'Invest in the Present, Free Your Future',
    description: 'A practical framing of present-day discipline as the foundation of future freedom.',
    p1: 'Future freedom is built through present choices, not future wishes.',
    p2: 'When you invest attention, discipline, and resources wisely today, you reduce chaos and increase options tomorrow.',
    p3: 'Freedom is not an event. It is the result of repeated alignment between what you value and what you do.',
    practice: 'Choose one present investment this week that your future self will thank you for, and schedule it now.'
  },
  'kien-tao-mot-doi-song-y-nghia': {
    title: 'Designing a Meaningful Life',
    description: 'A practical philosophy for building a life that is grounded, useful, and aligned with your deepest values.',
    p1: 'A meaningful life is not found by accident. It is designed through conscious choices.',
    p2: 'Meaning grows when your actions, environment, and relationships reflect what you truly value, not what culture rewards loudly.',
    p3: 'Start small, stay honest, and keep building. Depth is created through continuity, not intensity.',
    practice: 'Define one value you want your life to express this week, then commit to one concrete action that embodies it.'
  },
  'mon-hoc-don-dep-tong-quan': {
    title: 'The Cleaning Practice: A Foundational View',
    description: 'An overview of cleaning as a life practice connecting inner awareness, environment, and behavior.',
    p1: 'The cleaning practice links inner life and outer life in a direct way.',
    p2: 'Your space reflects your inner state, and your inner state is shaped by your space. This relationship is practical, not symbolic only.',
    p3: 'By cleaning consciously, you train attention, restore order, and create conditions for creativity and healing.',
    practice: 'Walk through your space and remove five items that no longer support the life you want to live.'
  },
  'ket-noi-linh-hon-vat-the': {
    title: 'Connecting with the Soul of Objects',
    description: 'A contemplative practice of seeing objects not as clutter, but as mirrors of attention and meaning.',
    p1: 'Objects are not neutral. They carry traces of your habits, priorities, and emotional history.',
    p2: 'When you slow down and relate consciously to objects, you begin to see where energy leaks, where care is missing, and where meaning can return.',
    p3: 'This is not sentimentalism. It is a practical way to reconnect life, space, and intention.',
    practice: 'Choose one object you use daily and reset your relationship with it through care, order, and gratitude.'
  },
  'ket-noi-sang-tao': {
    title: 'Reconnecting with Creativity',
    description: 'How to reopen creative energy by restoring presence, order, and contact with real life.',
    p1: 'Creativity does not disappear. It gets buried under noise, pressure, and disconnection.',
    p2: 'When you return to simple acts done with full attention, creative flow starts to reopen naturally.',
    p3: 'Creation is less about force and more about connection with life, body, and truthful expression.',
    practice: 'Create something small today in 30 minutes without editing yourself while you work.'
  },
  'hoi-sinh-su-song-tu-su-sang-tao-nguyen-so': {
    title: 'Reviving Life Through Original Creativity',
    description: 'A deep look at how original creativity can restore vitality, meaning, and movement in daily life.',
    p1: 'Original creativity begins where imitation ends.',
    p2: 'When you stop performing and start listening inwardly, your work becomes alive again. With that aliveness, your energy returns.',
    p3: 'This revival does not require dramatic change. It requires honesty, space, and repeated acts of truthful making.',
    practice: 'Name one area where you have been imitating. Replace it with one expression that is honestly yours.'
  },
  'dong-chay-sang-tao-dong-chay-su-song': {
    title: 'Creative Flow, Life Flow',
    description: 'Why creative flow and life flow are connected, and how to restore both through consistent embodied action.',
    p1: 'When creative flow closes, life often feels heavy and fragmented.',
    p2: 'Flow returns when you reconnect with body, space, rhythm, and purposeful action. It is built, not wished into existence.',
    p3: 'As creative flow reopens, emotional energy and clarity often return with it.',
    practice: 'Build a 45-minute flow block this week for one meaningful task and protect it from distraction.'
  },
  'minh-dang-di-con-duong-gi': {
    title: 'What Path Am I Really On?',
    description: 'A reflective checkpoint for people who are moving fast but unsure whether their path still feels true.',
    p1: 'Many people are moving, but not all movement is direction.',
    p2: 'A true path is not just efficient. It is aligned with your values, your energy, and the life you actually want to build.',
    p3: 'Asking this question early can save years of silent misalignment.',
    practice: 'Write down your current path in one sentence, then rewrite it in a way that feels honest and sustainable.'
  },
  'gia-tri-cuoc-doi-ban-dang-gia-bao-nhieu': {
    title: 'How Much Is Your Life Actually Worth?',
    description: 'A direct inquiry into life value beyond income, titles, and social recognition.',
    p1: 'The worth of a life cannot be measured by income alone.',
    p2: 'A life becomes valuable through contribution, depth, integrity, and the quality of presence you bring to others and to your own path.',
    p3: 'When you redefine value clearly, your choices become cleaner and your life becomes more coherent.',
    practice: 'Define your personal metric of life value in three criteria and review one weekly decision against those criteria.'
  },
  'tu-55-trieu-den-tu-do': {
    title: 'From 55 Million to Freedom',
    description: 'Reframing money as a conscious commitment to growth, capacity, and long-term personal freedom.',
    p1: 'A number is never just a number. It can represent fear, commitment, or a turning point.',
    p2: 'When investment is tied to real practice and accountability, money becomes leverage for transformation, not consumption.',
    p3: 'Freedom is earned through capacity. Capacity is built through consistent investment in awareness and action.',
    practice: 'Review one financial choice and ask whether it serves short comfort or long freedom, then adjust one behavior this week.'
  },
  'hoc-tap-sang-tao-truong-thanh': {
    title: 'Learning, Creating, Growing',
    description: 'A practical triangle for sustainable growth through learning, creative expression, and disciplined practice.',
    p1: 'Learning gives structure, creating gives life, and growth gives direction.',
    p2: 'When these three are connected, progress becomes stable and meaningful. When disconnected, effort becomes scattered.',
    p3: 'Maturity comes from integrating understanding with daily behavior, not from information alone.',
    practice: 'Pick one thing to learn, one thing to create, and one habit to stabilize this week.'
  },
  'du-an-buoc': {
    title: 'Project STEP',
    description: 'An action journal built around small but real steps that restore rhythm and trust in yourself.',
    p1: 'Project STEP is built on one principle: small real actions beat grand intentions.',
    p2: 'Each step is practical, close to daily life, and clear enough to complete without burnout.',
    p3: 'The power of this project is continuity. Over time, consistent steps reshape identity and direction.',
    practice: 'Commit to one 10-minute step you can repeat daily this week, and track completion without negotiation.'
  },
  'du-an-37-ngay': {
    title: 'The 37-Day Project',
    description: 'A structured reset to rebuild self-leadership through 37 days of focused daily practice.',
    p1: 'The 37-Day Project is a practical reset for people who are ready to stop drifting.',
    p2: 'Across 37 days, you train observation, order, action, and review. The sequence is simple, but the impact is cumulative.',
    p3: 'By the end, the goal is not motivation. The goal is a new operating rhythm you can trust.',
    practice: 'Define your Day 1 action now and decide the exact time you will do it tomorrow.'
  }
};

const TITLE_BY_SLUG = Object.fromEntries(Object.entries(ARTICLES).map(([slug, data]) => [slug, data.title]));

function escapeAttr(v) {
  return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function updateArticle(slug, data) {
  const file = path.join(ROOT, 'en', 'bai-viet', slug, 'index.html');
  if (!fs.existsSync(file)) return false;
  let html = fs.readFileSync(file, 'utf8');
  const canonical = `${DOMAIN}/en/bai-viet/${slug}/`;

  html = html.replace(/<title>[^<]*\| Nguyenlananh\.com<\/title>/i, `<title>${data.title} | Nguyenlananh.com</title>`);
  html = html.replace(/<meta name="description" content="[^"]*" \/>/i, `<meta name="description" content="${escapeAttr(data.description)}" />`);
  html = html.replace(/<meta property="og:title" content="[^"]*" \/>/i, `<meta property="og:title" content="${escapeAttr(data.title)}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*" \/>/i, `<meta property="og:description" content="${escapeAttr(data.description)}" />`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*" \/>/i, `<meta name="twitter:title" content="${escapeAttr(data.title)}" />`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*" \/>/i, `<meta name="twitter:description" content="${escapeAttr(data.description)}" />`);

  html = html.replace(/"headline":\s*"[^"]*"/i, `"headline": "${escapeAttr(data.title)}"`);
  html = html.replace(/"description":\s*"[^"]*"/i, `"description": "${escapeAttr(data.description)}"`);
  html = html.replace(/"inLanguage":\s*"[^"]*"/i, '"inLanguage": "en-US"');
  html = html.replace(/"mainEntityOfPage":\s*"[^"]*"/i, `"mainEntityOfPage": "${canonical}"`);

  html = html.replace(/<h1>[^<]*<\/h1>/i, `<h1>${data.title}</h1>`);
  html = html.replace(/<p class="sub">[\s\S]*?<\/p>/i, `<p class="sub">${data.description}</p>`);

  html = html.replace(/<article class="panel">[\s\S]*?<h3 style="margin-top:14px;">[\s\S]*?<\/article>/i, `
      <article class="panel">
        <h3>Main Insight</h3>
        <p>${data.p1}</p>
        <p style="margin-top:10px;">${data.p2}</p>
        <p style="margin-top:10px;">${data.p3}</p>
        <h3 style="margin-top:14px;">Practice Step</h3>
        <p>${data.practice}</p>
      </article>`);

  html = html.replace(/<h3>Bài liên quan<\/h3>/g, '<h3>Related Articles</h3>');
  html = html.replace(/>Đọc hành trình</g, '>Read the journey<');
  html = html.replace(/>Xem chương trình</g, '>View programs<');
  html = html.replace(/>Khi bạn sẵn sàng, hãy bước</g, '>When you are ready, take the step<');
  html = html.replace(/>Trang Dự án</g, '>Projects page<');

  html = html.replace(/(<p style="margin:0; font-size:13px; color:rgba\(15,23,42,.6\);"><a href="\/en\/bai-viet\/">Articles<\/a> \/ <a href="([^"]+)">)([^<]+)(<\/a><\/p>)/i, (_m, a, href, _old, c) => {
    return `${a}${CATEGORY_LABELS[href] || 'Articles'}${c}`;
  });

  html = html.replace(/"articleSection":\s*"[^"]*"/i, (_m) => {
    const m = html.match(/<a href="(\/en\/bai-viet\/[^"]+\/)">[^<]+<\/a><\/p>/i);
    const label = m ? (CATEGORY_LABELS[m[1]] || 'Articles') : 'Articles';
    return `"articleSection": "${label}"`;
  });

  html = html.replace(/<a href="(\/en\/bai-viet\/[a-z0-9\-]+\/)"[^>]*>([^<]+)<\/a>/g, (_m, href, oldText) => {
    const slugMatch = href.match(/^\/en\/bai-viet\/([^/]+)\/$/);
    if (!slugMatch) return _m;
    const t = TITLE_BY_SLUG[slugMatch[1]];
    if (!t) return _m;
    return `<a href="${href}">${t}</a>`;
  });

  fs.writeFileSync(file, html, 'utf8');
  return true;
}

let changed = 0;
for (const [slug, data] of Object.entries(ARTICLES)) {
  if (updateArticle(slug, data)) changed += 1;
}

console.log(`Updated EN native copy: ${changed} articles`);
