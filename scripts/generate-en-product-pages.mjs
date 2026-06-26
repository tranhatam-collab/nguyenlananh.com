#!/usr/bin/env node
/**
 * Generate minimal EN landing pages for premium products and membership tiers.
 * Pages are functional (checkout box, data-plan, data-price) with real English content.
 * Full Vietnamese detail page is linked for users who want full context.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const PREMIUM = [
  {
    slug: "rhythm-design-lab",
    category: "programs",
    plan: "prog_rhythm_lab",
    price: 2500000,
    title: "Rhythm Design Lab",
    tagline: "Build a sustainable daily rhythm",
    description: "A guided lab to redesign your daily rhythm so it supports the life you actually want.",
    what: ["Personal rhythm assessment", "7-day reset protocol", "Weekly planning template", "Accountability checkpoint"],
    viPage: "/programs/rhythm-design-lab/",
  },
  {
    slug: "space-reset-practitioner",
    category: "programs",
    plan: "prog_space_reset",
    price: 12700000,
    title: "Space Reset Practitioner",
    tagline: "Rebuild your living space from the inside out",
    description: "A deeper program on how physical space mirrors and shapes inner life. For those ready to work with space as a practice.",
    what: ["Space-reading framework", "Reset toolkit", "Guided practice videos", "Community review space"],
    viPage: "/programs/space-reset-practitioner/",
  },
  {
    slug: "family-pattern-mapping",
    category: "programs",
    plan: "prog_family_pattern",
    price: 10000000,
    title: "Family Pattern Mapping",
    tagline: "See the patterns you inherited",
    description: "Map the family and relational patterns that shape your decisions, so you can choose differently where it matters.",
    what: ["Family pattern map", "Trigger-to-response journal", "Boundary practice", "Reflection prompts"],
    viPage: "/programs/family-pattern-mapping/",
  },
  {
    slug: "creative-practice-studio",
    category: "programs",
    plan: "prog_creative_studio",
    price: 10000000,
    title: "Creative Practice Studio",
    tagline: "Turn creative work into a sustainable practice",
    description: "For creators, writers, and makers who want a steady practice instead of feast-and-famine cycles.",
    what: ["Creative operating system", "Project rhythm design", "Resistance protocol", "Peer review circle"],
    viPage: "/programs/creative-practice-studio/",
  },
  {
    slug: "emotional-block-mapping",
    category: "programs",
    plan: "prog_emo_block",
    price: 6300000,
    title: "Emotional Block Mapping",
    tagline: "Find the point where emotion gets stuck",
    description: "Identify where emotional loops repeat and map a practical path through them.",
    what: ["Emotion map", "Release practices", "Decision-clarity exercise", "Reset journal"],
    viPage: "/programs/emotional-block-mapping/",
  },
  {
    slug: "personal-capital",
    category: "assessments",
    plan: "diag_capital_self",
    price: 1250000,
    title: "Personal Capital Assessment",
    tagline: "See your real resources clearly",
    description: "A self-assessment of your inner and outer resources, so you can invest energy where it compounds.",
    what: ["Capital scorecard", "Resource map", "Priority report", "Action worksheet"],
    viPage: "/assessments/personal-capital/",
  },
  {
    slug: "avoidance-map",
    category: "assessments",
    plan: "asmt_avoidance_self",
    price: 490000,
    title: "Avoidance Map",
    tagline: "See what you are avoiding and why",
    description: "A decision-clarity tool to map avoidance patterns and reconnect with what you actually want.",
    what: ["Avoidance map", "Decision checklist", "Fear-to-action guide", "Follow-up prompts"],
    viPage: "/assessments/avoidance-map/",
  },
  {
    slug: "practice-companion-level-1",
    category: "certification",
    plan: "cert_companion_l1",
    price: 30000000,
    title: "Practice Companion — Level 1",
    tagline: "Learn to hold space for others",
    description: "Foundational certification for those who want to become a practice companion in this system.",
    what: ["Companion framework", "Practice sessions", "Feedback protocol", "Certification exam"],
    viPage: "/certification/practice-companion-level-1/",
  },
  {
    slug: "practice-method-designer",
    category: "certification",
    plan: "cert_method_designer",
    price: 76000000,
    title: "Practice Method Designer",
    tagline: "Design and lead original practice methods",
    description: "Advanced certification for practitioners who want to design their own methods and teach them.",
    what: ["Method design framework", "Curriculum project", "Teaching rounds", "Final review"],
    viPage: "/certification/practice-method-designer/",
  },
  {
    slug: "boundary-foundation",
    category: "programs",
    plan: "cert_boundary_found",
    price: 7600000,
    title: "Boundary Foundation",
    tagline: "Rebuild boundaries from clarity, not anger",
    description: "A foundational program on boundaries: where they come from, why they fail, and how to rebuild them.",
    what: ["Boundary map", "Saying-no scripts", "Repair practice", "Weekly check-in"],
    viPage: "/programs/boundary-foundation/",
  },
  {
    slug: "self-trust-practice-lab",
    category: "programs",
    plan: "self_trust_evidence_builder",
    price: 990000,
    title: "Self-Trust Practice Lab",
    tagline: "Rebuild trust in yourself through action",
    description: "A short pilot lab to build self-trust through small, deliberate evidence rather than affirmations.",
    what: ["Self-trust tracker", "Evidence builder", "Weekly review", "Reset protocol"],
    viPage: "/programs/self-trust-practice-lab/",
  },
  {
    slug: "open-loop-closure-sprint",
    category: "programs",
    plan: "open_loop_closure_sprint",
    price: 490000,
    title: "Open-Loop Closure Sprint",
    tagline: "Close the loops that drain your attention",
    description: "A focused sprint to identify and close open loops so you can reclaim attention and energy.",
    what: ["Loop inventory", "Closure protocol", "Priority triage", "Maintenance rhythm"],
    viPage: "/programs/open-loop-closure-sprint/",
  },
  {
    slug: "personal-after-action-review",
    category: "programs",
    plan: "personal_after_action_review",
    price: 750000,
    title: "Personal After-Action Review",
    tagline: "Learn from what already happened",
    description: "A structured review method to extract learning from real life events and integrate it going forward.",
    what: ["After-action template", "Decision replay", "Pattern log", "Integration plan"],
    viPage: "/programs/personal-after-action-review/",
  },
];

const MEMBERSHIP = [
  {
    slug: "core-access",
    plan: "year1",
    price: 75000,
    title: "Core Access — Year 1",
    tagline: "Start the membership journey",
    description: "First-year membership with access to core content, community rhythm, and foundational practice.",
  },
  {
    slug: "year-2-continuity",
    plan: "year2",
    price: 1490000,
    title: "Year 2 — Continuity",
    tagline: "Keep the rhythm alive",
    description: "Second-year membership for those continuing the journey with deeper practice and content.",
  },
  {
    slug: "year-3-mastery",
    plan: "year3",
    price: 2490000,
    title: "Year 3+ — Mastery",
    tagline: "Go deep with mastery content",
    description: "Advanced membership for long-term practitioners ready for mastery-level content and peer circles.",
  },
];

function navLink(label, href) { return `<a href="${href}">${label}</a>`; }

function generatePage({ slug, category, plan, price, title, tagline, description, what, viPage, isMembership }) {
  const path = `/en/${category}/${slug}/`;
  const canonical = `https://www.nguyenlananh.com${path}`;
  const viCanonical = viPage ? `https://www.nguyenlananh.com${viPage}` : `https://www.nguyenlananh.com/${category}/${slug}/`;
  const relatedWriting = viPage ? `<p class="note" style="margin-top:10px;">Full details in Vietnamese: <a href="${viPage}">view here</a>.</p>` : "";
  const whatList = (what || []).map((w) => `<li>${w}</li>`).join("\n");
  const badge = isMembership ? "Membership" : category === "assessments" ? "Assessment" : category === "certification" ? "Certification" : "Program";
  const relatedSection = whatList ? `<section class="panel" style="margin-top:12px;"><h2>What you receive</h2><ul class="list">${whatList}</ul>${relatedWriting}</section>` : "";

  return `<!doctype html>
<html lang="en-US" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>${title} | Lan Anh Nguyen</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="alternate" hreflang="vi" href="${viCanonical}" />
  <link rel="alternate" hreflang="en-US" href="${canonical}" />
  <link rel="alternate" hreflang="en" href="${canonical}" />
  <link rel="alternate" hreflang="x-default" href="${viCanonical}" />
<meta name="robots" content="index,follow" />
  <link rel="stylesheet" href="/assets/site.css" />
  <meta property="og:title" content="${title} | Lan Anh Nguyen" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="https://www.nguyenlananh.com/assets/og/og-homepage.svg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title} | Lan Anh Nguyen" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="https://www.nguyenlananh.com/assets/og/og-homepage.svg" />
</head>
<body data-plan="${plan}" data-price="${price}"><a class="skip" href="#main">Skip navigation</a>
  <header class="topbar" role="banner"><div class="container"><div class="navwrap"><a class="brand" href="/en/" aria-label="Lan Anh Nguyen — go to homepage"><span class="mark" aria-hidden="true"><img class="markIcon" src="/assets/brand/logo-mark.svg" alt="" width="40" height="40" loading="eager" decoding="async" aria-hidden="true" role="presentation"/></span><span class="name"><strong>Lan Anh Nguyen</strong><span class="tagline">Go inward to reshape your life</span></span></a><nav class="navlinks" aria-label="Primary navigation"><a href="/en/hanh-trinh/">Journey</a><a href="/en/phuong-phap/">System</a><a href="/en/bai-viet/">Writings</a><a href="/en/members/">Members</a></nav><div class="actions"><a class="btn" href="/en/join/">Join membership</a><button class="hamburger" type="button" id="hamburger" aria-label="Open menu" aria-controls="drawer" aria-expanded="false"><span aria-hidden="true"></span></button></div></div></div><div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Navigation"><div class="dhead"><div><div style="font-weight:700;font-size:13px;">Navigation</div><div class="hint">Choose a section to go to.</div></div><button class="btn" type="button" id="closeDrawer">Close</button></div><nav aria-label="Mobile navigation"><a href="/en/hanh-trinh/" data-close>Journey</a><a href="/en/phuong-phap/" data-close>System</a><a href="/en/bai-viet/" data-close>Writings</a><a href="/en/members/" data-close>Members</a><a href="/en/join/" data-close class="drawerCta">Join membership</a></nav><div class="foot">Go slow to go deep. Go real to go far.</div></div></header>

  <main id="main" class="container" role="main">
    <section class="pageHead"><span class="badge">${badge}</span><h1 style="margin-top:8px;">${title}</h1><p class="sub">${tagline}</p></section>
    <section class="grid2" style="margin-top:12px;">
      <article class="panel">
        <h2>About this</h2>
        <p>${description}</p>
      </article>
      <article class="panel">
        <h2>Join</h2>
        <p><strong>Price:</strong> <span style="font-size:22px;font-weight:700;color:rgba(15,23,42,.9);">${price.toLocaleString("vi-VN")} VND</span></p>
        <div id="checkoutBox" style="margin-top:12px;">
          <div class="field"><label for="buyerEmail">Email to receive access</label><input id="buyerEmail" type="email" required placeholder="you@example.com" /></div>
          <div class="actionsRow" style="margin-top:10px;"><button id="buyNow" class="cta" type="button">Buy now — VietQR</button></div>
          <div id="checkoutStatus" class="statusBanner hidden" role="status" style="margin-top:10px;"></div>
          <div id="vietqrBox" class="hidden" style="margin-top:10px;">
            <p><strong>Scan VietQR or transfer manually</strong></p>
            <p class="note">Transfer note: <strong id="vietqrTransferNote">-</strong></p>
            <p class="note">Amount: <strong id="vietqrAmount">-</strong></p>
            <p class="note">Account: <strong id="vietqrAccountName">-</strong> · <span id="vietqrAccountNo">-</span> · BIN <span id="vietqrBankBin">-</span></p>
            <img id="vietqrImage" alt="VietQR checkout" style="width:100%;max-width:280px;border-radius:6px;border:1px solid rgba(148,163,184,.35);" />
            <div class="actionsRow" style="margin-top:10px;"><a id="payNowLink" class="ghost hidden" href="#" target="_blank" rel="noopener">Open payment page</a></div>
          </div>
        </div>
      </article>
    </section>
    ${relatedSection}
  </main>

  <footer role="contentinfo"><div class="container"><div class="fwrap"><div><div style="font-weight:700;color:rgba(15,23,42,.8);">Lan Anh Nguyen</div><div>© 2026 · Not to become someone else. To return to who you truly are.</div></div><div style="display:flex;gap:6px;flex-wrap:wrap;"><a href="/en/">Home</a><a href="/en/hanh-trinh/">Journey</a><a href="/en/phuong-phap/">System</a><a href="/en/bai-viet/">Writings</a><a href="/en/members/">Members</a><a href="/en/join/">Join</a></div></div><div class="legal" style="margin-top:10px;color:rgba(15,23,42,.6);"><a href="/en/chinh-sach-bao-mat/">Privacy Policy</a><a href="/en/dieu-khoan/">Terms of Use</a><a href="/en/mien-tru-trach-nhiem/">Disclaimer</a></div></div></footer>
  <script src="/assets/content-registry.js"></script>
  <script src="/assets/site.js"></script>
  <script src="/assets/i18n-config.js"></script>
  <script src="/assets/lang-routing.js"></script>
  <script src="/assets/products-checkout.js"></script>
</body>
</html>`;
}

async function main() {
  for (const p of PREMIUM) {
    const filePath = `en/${p.category}/${p.slug}/index.html`;
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, generatePage(p));
    console.log(`Generated ${filePath}`);
  }
  for (const m of MEMBERSHIP) {
    const filePath = `en/products/${m.slug}/index.html`;
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, generatePage({ ...m, category: "products", isMembership: true }));
    console.log(`Generated ${filePath}`);
  }
  console.log("\nDone. Run build + broken-link checker + flow matrix next.");
}

main();
