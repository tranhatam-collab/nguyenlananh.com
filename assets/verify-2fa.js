(function(){
  "use strict";
  var codeInput = document.getElementById("twofa-code");
  var verifyBtn = document.getElementById("twofa-verify-btn");
  var errEl = document.getElementById("twofa-error");
  var backupInput = document.getElementById("twofa-backup");
  var backupBtn = document.getElementById("twofa-backup-btn");
  function showErr(msg){if(errEl){errEl.textContent=msg;errEl.style.display="block";}}
  function hideErr(){if(errEl)errEl.style.display="none";}
  function verifyCode(code,isBackup){
    hideErr();
    if(verifyBtn){verifyBtn.disabled=true;verifyBtn.textContent="Đang xác nhận...";}
    var payload=isBackup?{backup_code:code}:{code:code};
    fetch("/api/auth/2fa/verify",{
      method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",
      body:JSON.stringify(payload)
    })
    .then(function(r){return r.json();})
    .then(function(data){
      if(data.ok){
        if(verifyBtn)verifyBtn.textContent="Thành công!";
        var next=new URLSearchParams(window.location.search).get("next_path")||"/members/dashboard/";
        setTimeout(function(){window.location.href=next;},500);
      } else {
        showErr(data.message||"Mã không đúng. Thử lại.");
        if(verifyBtn){verifyBtn.disabled=false;verifyBtn.textContent="Xác nhận";}
        if(codeInput){codeInput.value="";codeInput.focus();}
      }
    })
    .catch(function(){
      showErr("Lỗi kết nối. Thử lại.");
      if(verifyBtn){verifyBtn.disabled=false;verifyBtn.textContent="Xác nhận";}
    });
  }
  if(verifyBtn)verifyBtn.addEventListener("click",function(){
    var code=codeInput?codeInput.value.trim():"";
    if(!code||code.length!==6){showErr("Vui lòng nhập mã 6 số.");return;}
    verifyCode(code,false);
  });
  if(codeInput)codeInput.addEventListener("keypress",function(e){if(e.key==="Enter"&&verifyBtn)verifyBtn.click();});
  if(backupBtn)backupBtn.addEventListener("click",function(){
    var code=backupInput?backupInput.value.trim():"";
    if(!code){showErr("Vui lòng nhập mã dự phòng.");return;}
    if(verifyBtn){verifyBtn.disabled=true;verifyBtn.textContent="Đang xác nhận...";}
    fetch("/api/auth/2fa/verify",{
      method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",
      body:JSON.stringify({backup_code:code})
    })
    .then(function(r){return r.json();})
    .then(function(data){
      if(data.ok){
        if(verifyBtn)verifyBtn.textContent="Thành công!";
        var next=new URLSearchParams(window.location.search).get("next_path")||"/members/dashboard/";
        setTimeout(function(){window.location.href=next;},500);
      } else {
        showErr(data.message||"Mã dự phòng không đúng.");
        if(verifyBtn){verifyBtn.disabled=false;verifyBtn.textContent="Xác nhận";}
      }
    })
    .catch(function(){
      showErr("Lỗi kết nối.");
      if(verifyBtn){verifyBtn.disabled=false;verifyBtn.textContent="Xác nhận";}
    });
  });
})();
