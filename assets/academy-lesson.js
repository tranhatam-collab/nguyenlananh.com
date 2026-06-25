/**
 * Academy lesson interaction module.
 * Handles self-assessment scoring, progress tracking, and practice submission
 * for free member lessons at /members/academy/<slug>/
 */
(function () {
  "use strict";

  const ACADEMY_API = "/api/learn/lesson-progress";
  const PRACTICE_API = "/api/learn/submit-practice";

  function getLessonSlug() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    // /members/academy/<slug>/ → ["members", "academy", "<slug>"]
    if (parts.length >= 3 && parts[0] === "members" && parts[1] === "deep") {
      return parts[2];
    }
    return null;
  }

  function getProgressKey(slug) {
    return `deep_progress_${slug}`;
  }

  // Save self-assessment answers locally + to server
  async function saveSelfAssessment(slug, answers, score) {
    // Local backup
    try {
      localStorage.setItem(getProgressKey(slug), JSON.stringify({ answers, score, savedAt: new Date().toISOString() }));
    } catch (_e) {}

    // Server sync
    try {
      const res = await fetch(ACADEMY_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_slug: slug,
          status: score !== null ? "in_progress" : "not_started",
          self_assessment_score: score,
          self_assessment_answers: answers,
        }),
      });
      return await res.json();
    } catch (_e) {
      return { ok: false, error: "network" };
    }
  }

  // Mark lesson as completed
  async function markCompleted(slug) {
    try {
      const res = await fetch(ACADEMY_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_slug: slug, status: "completed" }),
      });
      return await res.json();
    } catch (_e) {
      return { ok: false, error: "network" };
    }
  }

  // Submit practice exercise
  async function submitPractice(slug, content, exerciseSlug) {
    try {
      const res = await fetch(PRACTICE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_slug: slug,
          exercise_slug: exerciseSlug || null,
          submission_type: "text",
          content: content,
        }),
      });
      return await res.json();
    } catch (_e) {
      return { ok: false, error: "network" };
    }
  }

  // Load saved progress
  async function loadProgress(slug) {
    try {
      const res = await fetch(`${ACADEMY_API}?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (data.ok && data.progress) {
        return data.progress;
      }
    } catch (_e) {}
    // Fallback to localStorage
    try {
      const local = localStorage.getItem(getProgressKey(slug));
      if (local) return JSON.parse(local);
    } catch (_e) {}
    return null;
  }

  // Wire up self-assessment form
  function initSelfAssessment(slug) {
    const form = document.querySelector("[data-self-assessment]");
    if (!form) return;

    const radios = form.querySelectorAll('input[type="radio"]');
    const submitBtn = form.querySelector('[data-submit-assessment]');
    const resultDiv = form.querySelector('[data-assessment-result]');

    // Restore previous answers
    loadProgress(slug).then((progress) => {
      if (progress && progress.self_assessment_answers_json) {
        try {
          const answers = typeof progress.self_assessment_answers_json === "string"
            ? JSON.parse(progress.self_assessment_answers_json)
            : progress.self_assessment_answers_json;
          Object.entries(answers).forEach(([name, value]) => {
            const radio = form.querySelector(`input[name="${name}"][value="${value}"]`);
            if (radio) radio.checked = true;
          });
          if (progress.self_assessment_score !== null && resultDiv) {
            resultDiv.innerHTML = `<p><strong>Điểm tự đánh giá trước đó: ${progress.self_assessment_score}/30</strong></p>`;
            resultDiv.style.display = "block";
          }
        } catch (_e) {}
      }
    });

    if (submitBtn) {
      submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const answers = {};
        let total = 0;
        let answered = 0;
        const groups = {};
        radios.forEach((r) => {
          if (!groups[r.name]) groups[r.name] = 0;
        });
        radios.forEach((r) => {
          if (r.checked) {
            answers[r.name] = r.value;
            total += parseInt(r.value, 10) || 0;
            groups[r.name] = 1;
          }
        });
        answered = Object.values(groups).filter((v) => v).length;
        const totalQs = Object.keys(groups).length;

        if (answered < totalQs) {
          if (resultDiv) {
            resultDiv.innerHTML = `<p style="color:#c0392b;">Bạn đã trả lời ${answered}/${totalQs} câu. Vui lòng trả lời tất cả.</p>`;
            resultDiv.style.display = "block";
          }
          return;
        }

        if (resultDiv) {
          resultDiv.innerHTML = `<p>Đang lưu...</p>`;
          resultDiv.style.display = "block";
        }

        const result = await saveSelfAssessment(slug, answers, total);
        if (resultDiv) {
          const pct = Math.round((total / (totalQs * 3)) * 100);
          resultDiv.innerHTML = `
            <p><strong>Điểm: ${total}/${totalQs * 3} (${pct}%)</strong></p>
            <p>${pct >= 70 ? "Bạn đang nắm rõ bài học này. Có thể đi tiếp bài sau." : "Hãy đọc lại bài đọc chuyên sâu và làm lại bài tập."}</p>
          `;
          resultDiv.style.display = "block";
        }
      });
    }
  }

  // Wire up practice submission
  function initPractice(slug) {
    const form = document.querySelector("[data-practice-form]");
    if (!form) return;

    const textarea = form.querySelector("textarea");
    const submitBtn = form.querySelector('[data-submit-practice]');
    const resultDiv = form.querySelector('[data-practice-result]');

    if (submitBtn) {
      submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const content = textarea ? textarea.value.trim() : "";
        if (!content) {
          if (resultDiv) {
            resultDiv.innerHTML = `<p style="color:#c0392b;">Vui lòng viết bài tập trước khi nộp.</p>`;
            resultDiv.style.display = "block";
          }
          return;
        }

        if (resultDiv) {
          resultDiv.innerHTML = `<p>Đang nộp...</p>`;
          resultDiv.style.display = "block";
        }

        const exerciseSlug = form.getAttribute("data-exercise-slug") || null;
        const result = await submitPractice(slug, content, exerciseSlug);
        if (result.ok) {
          if (resultDiv) {
            resultDiv.innerHTML = `<p style="color:#27ae60;"><strong>Đã nộp bài tập.</strong> Bạn có thể đánh dấu bài học là hoàn thành.</p>`;
            resultDiv.style.display = "block";
          }
          // Enable complete button
          const completeBtn = document.querySelector('[data-mark-complete]');
          if (completeBtn) completeBtn.removeAttribute("disabled");
        } else {
          if (resultDiv) {
            resultDiv.innerHTML = `<p style="color:#c0392b;">Lỗi nộp bài. Vui lòng thử lại.</p>`;
            resultDiv.style.display = "block";
          }
        }
      });
    }
  }

  // Wire up mark-complete button
  function initComplete(slug) {
    const btn = document.querySelector('[data-mark-complete]');
    if (!btn) return;

    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const result = await markCompleted(slug);
      if (result.ok) {
        btn.textContent = "Đã hoàn thành";
        btn.setAttribute("disabled", "disabled");
        btn.style.opacity = "0.6";
      }
    });
  }

  // Init on DOM ready
  function init() {
    const slug = getLessonSlug();
    if (!slug) return;
    initSelfAssessment(slug);
    initPractice(slug);
    initComplete(slug);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
