(function(){
  "use strict";
  var form = document.getElementById("admin-login-form");
  var errEl = document.getElementById("login-error");
  var infoEl = document.getElementById("login-info");
  var submitBtn = document.getElementById("login-submit");
  var turnstileWidgetId = null;
  if(window.TurnstileHelper && window.TurnstileHelper.isConfigured()){
    window.TurnstileHelper.render(document.getElementById("turnstile-admin-login")).then(function(id){ turnstileWidgetId = id; });
  }
  fetch("/api/admin/me", { credentials: "include" })
    .then(function(r){ return r.json(); })
    .then(function(data){
      if(data.ok){
        if(infoEl){ infoEl.style.display = "block"; infoEl.textContent = "Đã đăng nhập — đang chuyển..."; }
        setTimeout(function(){ window.location.href = "/admin/"; }, 800);
      }
    })
    .catch(function(){});
  if(!form) return;
  form.addEventListener("submit", function(e){
    e.preventDefault();
    if(errEl) errEl.style.display = "none";
    if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = "Đang đăng nhập..."; }
    var email = document.getElementById("login-email");
    var password = document.getElementById("login-password");
    if(!email || !password || !email.value.trim() || !password.value){
      if(errEl){ errEl.textContent = "Vui lòng nhập email và mật khẩu."; errEl.style.display = "block"; }
      if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = "Đăng nhập"; }
      return;
    }
    fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: email.value.trim(),
        password: password.value,
        "cf-turnstile-response": window.TurnstileHelper ? window.TurnstileHelper.getToken(turnstileWidgetId) : ""
      })
    })
    .then(function(r){ return r.json(); })
    .then(function(data){
      if(data.ok){
        if(submitBtn) submitBtn.textContent = "Thành công!";
        if(data.admin_user && data.admin_user.must_change_password){
          window.location.href = "/admin/?must_change_password=1";
        } else {
          window.location.href = "/admin/";
        }
      } else {
        var msg = (data.error && data.error.message) || "Đăng nhập thất bại.";
        if(errEl){ errEl.textContent = msg; errEl.style.display = "block"; }
        if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = "Đăng nhập"; }
        if(window.TurnstileHelper) window.TurnstileHelper.reset(turnstileWidgetId);
      }
    })
    .catch(function(){
      if(errEl){ errEl.textContent = "Lỗi kết nối. Vui lòng thử lại."; errEl.style.display = "block"; }
      if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = "Đăng nhập"; }
    });
  });
})();
