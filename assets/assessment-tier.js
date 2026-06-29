(function(){
  document.querySelectorAll('input[name="tier"]').forEach(function(r){
    r.addEventListener("change",function(e){
      var t = e.target;
      document.body.dataset.plan = t.value;
      document.body.dataset.price = t.dataset.price;
      var a = document.querySelector('span[style*="22px"]');
      if(a) a.textContent = new Intl.NumberFormat("vi-VN").format(parseInt(t.dataset.price)) + " VND";
    });
  });
})();
