(function(){
  "use strict";
  var statusLoading = document.getElementById("twofa-status-loading");
  var statusEnabled = document.getElementById("twofa-status-enabled");
  var statusDisabled = document.getElementById("twofa-status-disabled");
  var enabledAt = document.getElementById("twofa-enabled-at");
  var setupPanel = document.getElementById("twofa-setup-panel");
  var setupBtn = document.getElementById("twofa-setup-btn");
  var qrImg = document.getElementById("twofa-qr");
  var secretEl = document.getElementById("twofa-secret");
  var verifyCodeInput = document.getElementById("twofa-verify-code");
  var enableBtn = document.getElementById("twofa-enable-btn");
  var cancelBtn = document.getElementById("twofa-cancel-btn");
  var setupError = document.getElementById("twofa-setup-error");
  var backupPanel = document.getElementById("twofa-backup-panel");
  var backupCodesEl = document.getElementById("twofa-backup-codes");
  var backupDoneBtn = document.getElementById("twofa-backup-done-btn");
  var disableBtn = document.getElementById("twofa-disable-btn");
  var disablePanel = document.getElementById("twofa-disable-panel");
  var disableCodeInput = document.getElementById("twofa-disable-code");
  var disableConfirmBtn = document.getElementById("twofa-disable-confirm-btn");
  var disableCancelBtn = document.getElementById("twofa-disable-cancel-btn");
  var disableError = document.getElementById("twofa-disable-error");
  var currentSecret = null;
  function showErr(el,msg){if(el){el.textContent=msg;el.style.display="block";}}
  function hideErr(el){if(el)el.style.display="none";}
  var sc=new AbortController();
  var stid=setTimeout(function(){sc.abort();},10000);
  fetch("/api/auth/2fa/status",{credentials:"include",signal:sc.signal})
    .then(function(r){clearTimeout(stid);return r.json();})
    .then(function(data){
      if(statusLoading)statusLoading.style.display="none";
      if(data.ok&&data.enabled){
        if(statusEnabled)statusEnabled.style.display="block";
        if(enabledAt&&data.enabled_at)enabledAt.textContent="Bật từ: "+new Date(data.enabled_at).toLocaleDateString("vi-VN");
      } else {
        if(statusDisabled)statusDisabled.style.display="block";
      }
    })
    .catch(function(err){
      clearTimeout(stid);
      if(statusLoading)statusLoading.textContent=err&&err.name==="AbortError"?"Không thể kiểm tra trạng thái. Vui lòng tải lại trang.":"Không thể kiểm tra trạng thái. Vui lòng đăng nhập lại.";
    });
  if(setupBtn)setupBtn.addEventListener("click",function(){
    hideErr(setupError); setupBtn.disabled=true; setupBtn.textContent="Đang tạo...";
    fetch("/api/auth/2fa/setup",{method:"POST",credentials:"include"})
      .then(function(r){return r.json();})
      .then(function(data){
        setupBtn.disabled=false; setupBtn.textContent="Bật 2FA";
        if(data.ok){
          currentSecret=data.secret;
          if(qrImg)qrImg.src=data.qr_url; if(secretEl)secretEl.textContent=data.secret;
          if(setupPanel)setupPanel.style.display="block";
          if(setupPanel)setupPanel.scrollIntoView({behavior:"smooth"});
        } else { showErr(setupError,data.message||"Không thể thiết lập 2FA."); }
      })
      .catch(function(){setupBtn.disabled=false;setupBtn.textContent="Bật 2FA";showErr(setupError,"Lỗi kết nối.");});
  });
  if(enableBtn)enableBtn.addEventListener("click",function(){
    hideErr(setupError);
    var code=(verifyCodeInput?verifyCodeInput.value.trim():""); if(!code||code.length!==6){showErr(setupError,"Vui lòng nhập mã 6 số.");return;}
    enableBtn.disabled=true; enableBtn.textContent="Đang xác nhận...";
    fetch("/api/auth/2fa/enable",{
      method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",
      body:JSON.stringify({secret:currentSecret,code:code})
    })
    .then(function(r){return r.json();})
    .then(function(data){
      enableBtn.disabled=false; enableBtn.textContent="Xác nhận & bật 2FA";
      if(data.ok){
        if(setupPanel)setupPanel.style.display="none";
        if(statusDisabled)statusDisabled.style.display="none";
        if(statusEnabled)statusEnabled.style.display="block";
        if(data.backup_codes&&backupCodesEl){backupCodesEl.textContent=data.backup_codes.join("\n");if(backupPanel)backupPanel.style.display="block";if(backupPanel)backupPanel.scrollIntoView({behavior:"smooth"});}
      } else { showErr(setupError,data.message||"Mã không đúng. Thử lại."); }
    })
    .catch(function(){enableBtn.disabled=false;enableBtn.textContent="Xác nhận & bật 2FA";showErr(setupError,"Lỗi kết nối.");});
  });
  if(cancelBtn)cancelBtn.addEventListener("click",function(){if(setupPanel)setupPanel.style.display="none";currentSecret=null;});
  if(backupDoneBtn)backupDoneBtn.addEventListener("click",function(){if(backupPanel)backupPanel.style.display="none";});
  if(disableBtn)disableBtn.addEventListener("click",function(){hideErr(disableError);if(disablePanel){disablePanel.style.display="block";disablePanel.scrollIntoView({behavior:"smooth"});}});
  if(disableConfirmBtn)disableConfirmBtn.addEventListener("click",function(){
    hideErr(disableError);
    var code=(disableCodeInput?disableCodeInput.value.trim():""); if(!code||code.length!==6){showErr(disableError,"Vui lòng nhập mã 6 số.");return;}
    disableConfirmBtn.disabled=true; disableConfirmBtn.textContent="Đang tắt...";
    fetch("/api/auth/2fa/disable",{
      method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",
      body:JSON.stringify({code:code})
    })
    .then(function(r){return r.json();})
    .then(function(data){
      disableConfirmBtn.disabled=false; disableConfirmBtn.textContent="Xác nhận tắt 2FA";
      if(data.ok){
        if(disablePanel)disablePanel.style.display="none";
        if(statusEnabled)statusEnabled.style.display="none";
        if(statusDisabled)statusDisabled.style.display="block";
        if(disableCodeInput)disableCodeInput.value="";
      } else { showErr(disableError,data.message||"Mã không đúng."); }
    })
    .catch(function(){disableConfirmBtn.disabled=false;disableConfirmBtn.textContent="Xác nhận tắt 2FA";showErr(disableError,"Lỗi kết nối.");});
  });
  if(disableCancelBtn)disableCancelBtn.addEventListener("click",function(){if(disablePanel)disablePanel.style.display="none";if(disableCodeInput)disableCodeInput.value="";});
})();
