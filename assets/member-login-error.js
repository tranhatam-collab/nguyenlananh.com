(function(){
  var p = new URLSearchParams(window.location.search);
  var e = p.get("error");
  if(!e) return;
  var b = document.getElementById("loginErrorBanner");
  if(!b) return;
  var isEN = (document.documentElement.lang||"").startsWith("en");
  var msg;
  if(isEN){
    msg = {
      "SESSION_CREATE_FAILED":"Could not create a login session. Please try again or contact support.",
      "GOOGLE_TOKEN_FAILED_invalid_grant":"Google authorization code expired. Please log in again.",
      "GOOGLE_STATE_INVALID":"Login session expired. Please try again.",
      "GOOGLE_PROFILE_FAILED":"Could not fetch your Google profile. Please try again.",
      "GOOGLE_EMAIL_MISSING":"Your Google account has no email. Please use a different account.",
      "GOOGLE_EMAIL_UNVERIFIED":"Your Google email is not verified. Please verify it on Google first.",
      "5":"Google login hit a technical session error. Please try again in an incognito window; the system has logged details for support.",
      "google_callback_failed":"Google login failed. Please try again."
    };
  } else {
    msg = {
      "SESSION_CREATE_FAILED":"Không thể tạo phiên đăng nhập. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
      "GOOGLE_TOKEN_FAILED_invalid_grant":"Mã xác thực Google đã hết hạn. Vui lòng đăng nhập lại.",
      "GOOGLE_STATE_INVALID":"Phiên đăng nhập đã hết hạn. Vui lòng thử lại.",
      "GOOGLE_PROFILE_FAILED":"Không thể lấy thông tin từ Google. Vui lòng thử lại.",
      "GOOGLE_EMAIL_MISSING":"Tài khoản Google không có email. Vui lòng dùng tài khoản khác.",
      "GOOGLE_EMAIL_UNVERIFIED":"Email Google chưa được xác thực. Vui lòng xác thực email trên Google trước.",
      "5":"Đăng nhập Google gặp lỗi kỹ thuật khi tạo phiên. Vui lòng thử lại trong cửa sổ ẩn danh; hệ thống đã ghi log để đội kỹ thuật xử lý.",
      "google_callback_failed":"Đăng nhập Google thất bại. Vui lòng thử lại."
    };
  }
  b.textContent = msg[e] || ("Login error ("+e+"). Please try again or contact support if the issue persists.");
  b.style.display = "block";
})();
