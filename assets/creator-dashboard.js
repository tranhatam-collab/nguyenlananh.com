/**
 * Creator dashboard for members.
 */
(function () {
  "use strict";

  const statusBox = document.getElementById("creatorStatus");
  const subForm = document.getElementById("submissionForm");
  const subStatus = document.getElementById("subStatus");

  function setStatus(msg, type) {
    if (!statusBox) return;
    statusBox.innerHTML = `<div class="statusBanner ${type}">${msg}</div>`;
  }

  function setSubStatus(msg, type) {
    if (!subStatus) return;
    subStatus.textContent = msg;
    subStatus.className = "statusBanner " + type;
    subStatus.classList.remove("hidden");
  }

  let statusResolved = false;

  async function init() {
    // Timeout fallback: if status doesn't resolve in 10s, show error
    setTimeout(() => {
      if (!statusResolved) {
        setStatus("Không thể kiểm tra trạng thái. Vui lòng tải lại trang.", "error");
      }
    }, 10000);

    try {
      const res = await fetch("/api/members/me");
      statusResolved = true;
      if (!res.ok) {
        setStatus("Bạn cần <a href='/join/'>đăng nhập</a>.", "error");
        return;
      }
      const user = await res.json();
      if (!user?.is_creator) {
        setStatus("Bạn chưa được duyệt là creator. <a href='/creators/apply/'>Đăng ký tại đây</a>.", "warning");
        return;
      }
      setStatus(`Xin chào ${user.name || user.email}. Bạn đã được duyệt là creator.`, "success");
      subForm?.classList.remove("hidden");
    } catch (e) {
      statusResolved = true;
      setStatus("Không kiểm tra được trạng thái.", "error");
    }
  }

  document.getElementById("submitBtn")?.addEventListener("click", async () => {
    const type = document.getElementById("subType").value;
    const title = document.getElementById("subTitle").value.trim();
    const content = document.getElementById("subContent").value.trim();
    if (!title || !content) {
      setSubStatus("Vui lòng nhập tiêu đề và nội dung.", "warning");
      return;
    }
    try {
      const res = await fetch("/api/creators/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, content })
      });
      const data = await res.json();
      if (data.ok) {
        setSubStatus("Đã lưu draft.", "success");
        document.getElementById("subTitle").value = "";
        document.getElementById("subContent").value = "";
      } else {
        setSubStatus(data.message || "Không lưu được.", "error");
      }
    } catch (e) {
      setSubStatus("Lỗi kết nối.", "error");
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
