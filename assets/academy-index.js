/**
 * Academy index — loads lesson progress and shows completion badges.
 */
(function () {
  "use strict";

  const LESSON_SLUGS = [
    "life-system-map-v1",
    "7-day-rhythm-audit",
    "space-friction-map",
    "family-role-boundary-map",
    "creative-workflow-audit",
    "personal-resource-audit",
    "decision-clarity-sheet",
    "environmental-influence-map",
    "community-fit-assessment",
    "37-day-project-charter",
  ];

  async function loadAllProgress() {
    try {
      const res = await fetch("/api/learn/lesson-progress");
      if (!res.ok) return;
      const data = await res.json();
      if (!data.ok) return;

      const progressMap = {};
      const items = Array.isArray(data.progress) ? data.progress : [data.progress];
      items.forEach((p) => {
        if (p && p.lesson_slug) progressMap[p.lesson_slug] = p;
      });

      // Update each list item
      LESSON_SLUGS.forEach((slug) => {
        const link = document.querySelector(`a[href="/members/academy/${slug}/"]`);
        if (!link) return;
        const p = progressMap[slug];
        if (p) {
          if (p.status === "completed") {
            link.innerHTML += ' <span style="color:#27ae60;font-size:.85em;">✓ hoàn thành</span>';
          } else if (p.status === "in_progress") {
            link.innerHTML += ' <span style="color:#f39c12;font-size:.85em;">— đang làm</span>';
          }
        }
      });

      // Show summary
      const completed = Object.values(progressMap).filter((p) => p.status === "completed").length;
      const inProgress = Object.values(progressMap).filter((p) => p.status === "in_progress").length;
      const summaryEl = document.querySelector("[data-academy-summary]");
      if (summaryEl) {
        if (completed > 0 || inProgress > 0) {
          summaryEl.textContent = `Đã hoàn thành ${completed}/10 bài · Đang làm ${inProgress} bài`;
          summaryEl.style.display = "block";
        }
      }
    } catch (_e) {
      // Not logged in or network error — silently ignore
    }
  }

  function init() {
    loadAllProgress();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
