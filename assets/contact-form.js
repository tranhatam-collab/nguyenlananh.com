(function(){
  var form = document.getElementById('contactForm');
  var feedback = document.getElementById('contactFeedback');
  var btn = document.getElementById('contactSubmit');
  if(!form) return;
  form.addEventListener('submit', async function(e){
    e.preventDefault();
    if(feedback) feedback.style.display = 'none';
    if(btn){ btn.disabled = true; btn.textContent = 'Đang gửi…'; }
    try{
      var r = await fetch('/api/contact/submit', {
        method:'POST', headers:{'content-type':'application/json'},
        body:JSON.stringify({name:form.name.value.trim(), contact:form.contact.value.trim(), message:form.message.value.trim()})
      });
      var data = await r.json().catch(function(){ return {ok:false,message:'Phản hồi không hợp lệ.'}; });
      if(feedback){
        if(data.ok){
          feedback.style.background = 'rgba(34,197,94,.12)';
          feedback.style.color = '#166534';
          feedback.textContent = data.message;
          form.reset();
        } else {
          feedback.style.background = 'rgba(239,68,68,.12)';
          feedback.style.color = '#991b1b';
          feedback.textContent = data.message || 'Không gửi được. Vui lòng thử lại.';
        }
        feedback.style.display = 'block';
      }
    } catch(err){
      if(feedback){
        feedback.style.background = 'rgba(239,68,68,.12)';
        feedback.style.color = '#991b1b';
        feedback.textContent = 'Lỗi kết nối. Vui lòng thử lại.';
        feedback.style.display = 'block';
      }
    }
    if(btn){ btn.disabled = false; btn.textContent = 'Gửi lời nhắn'; }
  });
})();
