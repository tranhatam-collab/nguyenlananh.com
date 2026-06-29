(function(){
  "use strict";
  if(!window.AdminAuth) return;
  var autoRefreshTimer = null;
  AdminAuth.ensureSession().then(function(session){
    if(!session) return;
    document.getElementById("session-status").textContent = "Đã đăng nhập: " + session.admin_user.email + " | " + session.admin_user.role;
    var logoutBtn = document.getElementById("admin-logout");
    if(logoutBtn){
      logoutBtn.style.display = "";
      logoutBtn.addEventListener("click", function(){ AdminAuth.logout().then(function(){ window.location.href = "/admin/login/"; }); });
    }
    loadSummary();
    loadEvents();
    loadErrors();
  });
  document.querySelectorAll(".tab-btn").forEach(function(btn){
    btn.addEventListener("click", function(){
      document.querySelectorAll(".tab-btn").forEach(function(b){ b.classList.remove("active"); });
      document.querySelectorAll(".tab-content").forEach(function(c){ c.classList.remove("active"); });
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    });
  });
  function esc(s){ return String(s||"").replace(/[&<>"']/g,function(c){var m={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};return m[c]||c;}); }
  function loadSummary(){
    fetch("/api/admin/events/summary", {credentials:"include"})
      .then(function(r){return r.json();})
      .then(function(data){
        if(!data.ok) return;
        var s = data.summary, grid = document.getElementById("summary-grid");
        grid.innerHTML = "";
        var cards = [
          {num:s.total,lbl:"Tổng events",color:"#333"},
          {num:s.lastHour,lbl:"Giờ qua",color:"#1565c0"},
          {num:s.last24h,lbl:"24h qua",color:"#1565c0"},
          {num:s.errors,lbl:"Lỗi",color:"#c62828"},
          {num:s.warnings,lbl:"Cảnh báo",color:"#e65100"},
          {num:s.unresolvedErrors,lbl:"Lỗi chưa xử lý",color:"#c62828"}
        ];
        cards.forEach(function(c){
          var d = document.createElement("div"); d.className = "summary-card";
          d.innerHTML = '<div class="num" style="color:'+c.color+'">'+c.num+'</div><div class="lbl">'+c.lbl+'</div>';
          grid.appendChild(d);
        });
        ["byCategory","byStatus"].forEach(function(key){
          var el = document.getElementById("summary-"+key);
          if(s[key]&&s[key].length){
            el.innerHTML = "<h3>Theo "+key.replace("by","")+"</h3><table class='events-table'><tr><th>"+(key==="byCategory"?"Category":"Status")+"</th><th>Số lượng</th></tr>"+
              s[key].map(function(c){return "<tr><td>"+esc(c[key==="byCategory"?"category":"status"])+"</td><td>"+c.count+"</td></tr>";}).join("")+"</table>";
          }
        });
      });
  }
  function loadEvents(){
    var p = new URLSearchParams();
    ["level","category","action","path","status"].forEach(function(f){
      var v = document.getElementById("filter-"+f); if(v&&v.value) p.set(f,v.value);
    });
    var u = document.getElementById("filter-user"); if(u&&u.value) p.set("user_email",u.value);
    var l = document.getElementById("filter-limit"); if(l&&l.value) p.set("limit",l.value);
    fetch("/api/admin/events?"+p.toString(),{credentials:"include"})
      .then(function(r){return r.json();})
      .then(function(data){
        var w = document.getElementById("events-table-wrap");
        if(!data.ok){w.innerHTML="<p class='note'>Lỗi tải events.</p>";return;}
        if(!data.events||!data.events.length){w.innerHTML="<p class='note'>Chưa có event nào.</p>";return;}
        var h="<table class='events-table'><thead><tr><th>Thời gian</th><th>Level</th><th>Category</th><th>Action</th><th>Method</th><th>Path</th><th>Status</th><th>Duration</th><th>User</th><th>Admin</th><th>IP</th><th>Country</th></tr></thead><tbody>";
        data.events.forEach(function(e){
          var lc="badge-"+(e.level||"info");
          var sc=e.status>=500?"badge-status-5xx":e.status>=400?"badge-status-4xx":e.status>=300?"badge-status-3xx":e.status>=200?"badge-status-2xx":"";
          h+="<tr><td class='mono'>"+esc((e.ts||"").replace("T"," ").slice(0,19))+"</td><td><span class='badge-level "+lc+"'>"+esc(e.level)+"</span></td><td>"+esc(e.category)+"</td><td>"+esc(e.action)+"</td><td>"+esc(e.method)+"</td><td class='mono truncate' title='"+esc(e.path)+"'>"+esc(e.path)+"</td><td><span class='badge-level "+sc+"'>"+e.status+"</span></td><td class='mono'>"+(e.duration_ms||0)+"ms</td><td class='truncate'>"+esc(e.user_email)+"</td><td class='truncate'>"+esc(e.admin_email)+"</td><td class='mono'>"+esc(e.ip)+"</td><td>"+esc(e.country)+"</td></tr>";
        });
        h+="</tbody></table>"; w.innerHTML=h;
      });
  }
  function loadErrors(){
    var p = new URLSearchParams();
    var st=document.getElementById("err-filter-status");if(st&&st.value)p.set("status",st.value);
    var cd=document.getElementById("err-filter-code");if(cd&&cd.value)p.set("code",cd.value);
    var rs=document.getElementById("err-filter-resolved");if(rs&&rs.value!=="")p.set("resolved",rs.value);
    var lm=document.getElementById("err-filter-limit");if(lm&&lm.value)p.set("limit",lm.value);
    fetch("/api/admin/errors?"+p.toString(),{credentials:"include"})
      .then(function(r){return r.json();})
      .then(function(data){
        var w=document.getElementById("errors-table-wrap");
        if(!data.ok){w.innerHTML="<p class='note'>Lỗi tải errors.</p>";return;}
        if(!data.errors||!data.errors.length){w.innerHTML="<p class='note'>Không có lỗi nào.</p>";return;}
        var h="<table class='events-table'><thead><tr><th>Thời gian</th><th>Status</th><th>Code</th><th>Message</th><th>Path</th><th>Method</th><th>User</th><th>Admin</th><th>IP</th><th>Resolved</th><th>Action</th></tr></thead><tbody>";
        data.errors.forEach(function(e){
          h+="<tr><td class='mono'>"+esc((e.ts||"").replace("T"," ").slice(0,19))+"</td><td><span class='badge-level "+(e.status>=500?"badge-error":"badge-warn")+"'>"+e.status+"</span></td><td>"+esc(e.code)+"</td><td class='truncate' title='"+esc(e.message)+"'>"+esc(e.message)+"</td><td class='mono truncate' title='"+esc(e.path)+"'>"+esc(e.path)+"</td><td>"+esc(e.method)+"</td><td class='truncate'>"+esc(e.user_email)+"</td><td class='truncate'>"+esc(e.admin_email)+"</td><td class='mono'>"+esc(e.ip)+"</td><td>"+(e.resolved?"✅":"⛔")+"</td><td>"+(e.resolved?"":"<button class='ghost' style='font-size:10px;' data-resolve='"+esc(e.id)+"'>Đánh dấu đã xử lý</button>")+"</td></tr>";
        });
        h+="</tbody></table>"; w.innerHTML=h;
        w.querySelectorAll("[data-resolve]").forEach(function(btn){
          btn.addEventListener("click",function(){
            var id=btn.getAttribute("data-resolve");
            fetch("/api/admin/errors/"+id,{method:"PATCH",credentials:"include"}).then(function(){loadErrors();loadSummary();});
          });
        });
      });
  }
  document.getElementById("btn-refresh").addEventListener("click",loadEvents);
  document.getElementById("err-btn-refresh").addEventListener("click",loadErrors);
  document.querySelectorAll("#filter-level,#filter-category,#filter-action,#filter-path,#filter-status,#filter-user,#filter-limit").forEach(function(el){
    if(el) el.addEventListener("change",loadEvents);
  });
  document.querySelectorAll("#err-filter-status,#err-filter-code,#err-filter-resolved,#err-filter-limit").forEach(function(el){
    if(el) el.addEventListener("change",loadErrors);
  });
  document.getElementById("btn-auto-refresh").addEventListener("click",function(){
    if(autoRefreshTimer){
      clearInterval(autoRefreshTimer); autoRefreshTimer=null;
      this.textContent="Auto (10s)"; this.classList.remove("cta"); this.classList.add("ghost");
    } else {
      autoRefreshTimer=setInterval(function(){loadEvents();loadSummary();},10000);
      this.textContent="Stop auto"; this.classList.remove("ghost"); this.classList.add("cta");
    }
  });
})();
