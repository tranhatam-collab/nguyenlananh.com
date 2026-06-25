/**
 * Admin learning dashboard — loads overview stats + tables.
 */
(function () {
  "use strict";

  async function loadOverview() {
    try {
      const res = await fetch("/api/admin/learning/overview");
      if (!res.ok) return;
      const data = await res.json();
      if (!data.ok) return;
      const o = data.overview;

      const find = (arr, key, val) => (arr || []).find(r => r[key] === val)?.cnt || 0;
      document.getElementById("statLessonCompleted").textContent = find(o.lesson_progress, "status", "completed");
      document.getElementById("statLessonInProgress").textContent = find(o.lesson_progress, "status", "in_progress");
      document.getElementById("statAssessmentPassed").textContent = find(o.assessment_attempts, "passed", 1);
      document.getElementById("statExamPassed").textContent = find(o.exam_attempts, "passed", 1);
      document.getElementById("statPracticeSubmitted").textContent = find(o.practice_submissions, "status", "submitted");
      document.getElementById("statCertsIssued").textContent = find(o.certifications, "status", "issued");
      document.getElementById("statCheckins").textContent = o.total_checkins || 0;
    } catch (_e) {}
  }

  async function loadAttempts() {
    try {
      const res = await fetch("/api/admin/learning/attempts?type=assessment&limit=50");
      if (!res.ok) return;
      const data = await res.json();
      const body = document.getElementById("attemptsBody");
      if (!body) return;
      body.innerHTML = (data.attempts || []).map(a =>
        `<tr><td>${a.user_email || "-"}</td><td>${a.assessment_slug}</td><td>${a.score}/${a.max_score}</td><td>${a.percentage}%</td><td>${a.passed ? "✅" : "❌"}</td><td>${a.submitted_at || "-"}</td></tr>`
      ).join("") || "<tr><td colspan='6'>No data</td></tr>";
    } catch (_e) {}
  }

  async function loadExams() {
    try {
      const res = await fetch("/api/admin/learning/attempts?type=exam&limit=50");
      if (!res.ok) return;
      const data = await res.json();
      const body = document.getElementById("examsBody");
      if (!body) return;
      body.innerHTML = (data.attempts || []).map(a =>
        `<tr><td>${a.user_email || "-"}</td><td>${a.exam_slug}</td><td>${a.score}/${a.max_score}</td><td>${a.percentage}%</td><td>${a.passed ? "✅" : "❌"}</td><td>${a.submitted_at || "-"}</td></tr>`
      ).join("") || "<tr><td colspan='6'>No data</td></tr>";
    } catch (_e) {}
  }

  async function loadPractice() {
    try {
      const res = await fetch("/api/admin/learning/practice?status=submitted&limit=50");
      if (!res.ok) return;
      const data = await res.json();
      const body = document.getElementById("practiceBody");
      if (!body) return;
      body.innerHTML = (data.submissions || []).map(s =>
        `<tr><td>${s.user_email || "-"}</td><td>${s.lesson_slug}</td><td>${s.status}</td><td>${s.review_score || "-"}</td><td>${s.submitted_at || "-"}</td></tr>`
      ).join("") || "<tr><td colspan='5'>No data</td></tr>";
    } catch (_e) {}
  }

  async function loadCerts() {
    try {
      const res = await fetch("/api/admin/learning/certifications?limit=50");
      if (!res.ok) return;
      const data = await res.json();
      const body = document.getElementById("certsBody");
      if (!body) return;
      body.innerHTML = (data.certifications || []).map(c =>
        `<tr><td>${c.user_email || "-"}</td><td>${c.title}</td><td>${c.cert_number}</td><td>${c.status}</td><td>${c.issued_at || "-"}</td></tr>`
      ).join("") || "<tr><td colspan='5'>No data</td></tr>";
    } catch (_e) {}
  }

  function initTabs() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
      });
    });
  }

  function init() {
    initTabs();
    loadOverview();
    loadAttempts();
    loadExams();
    loadPractice();
    loadCerts();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
