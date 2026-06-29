(function(){
  var u = "lienhe", d = "nguyenlananh.com", e = u + "@" + d;
  [
    "homeEmailDisplay","emailText","contactEmail","taiLieuEmail","privacyEmail"
  ].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.textContent = e;
  });
  [
    "homeEmailLink","contactEmailLink","headerEmailLink","taiLieuEmailLink"
  ].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.href = "mailto:" + e;
  });
  var s = "support@nguyenlananh.com";
  ["taiLieuSupport"].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.textContent = s;
  });
  ["taiLieuSupportLink"].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.href = "mailto:" + s;
  });
  var p = "pay@nguyenlananh.com";
  ["taiLieuPay"].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.textContent = p;
  });
  ["taiLieuPayLink"].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.href = "mailto:" + p;
  });
})();
