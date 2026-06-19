(function(){
  const lang = document.documentElement.lang || 'vi';
  const s = {
    closeMenu: lang === 'en' ? 'Close menu' : 'Đóng menu',
    openMenu: lang === 'en' ? 'Open menu' : 'Mở menu',
    copied: lang === 'en' ? 'Copied' : 'Đã sao chép',
    copyFailed: lang === 'en' ? 'Cannot copy' : 'Không sao chép được',
    copyEmail: lang === 'en' ? 'Copy email' : 'Sao chép email',
    noteRecovered: lang === 'en' ? 'Recovered your previous note on this device.' : 'Đã khôi phục ghi chú bạn lưu lần trước (chỉ trên thiết bị này).',
    noteSaved: lang === 'en' ? 'Saved. You can return anytime.' : 'Đã lưu. Bạn có thể quay lại bất cứ lúc nào.',
    noteCannotSave: lang === 'en' ? 'Cannot save on this device.' : 'Không thể lưu trên thiết bị này.',
    noteCleared: lang === 'en' ? 'Note removed from this device.' : 'Đã xóa ghi chú trên thiết bị.',
    noteExported: lang === 'en' ? '.txt exported (if your browser allows it).' : 'Đã xuất file .txt (nếu trình duyệt cho phép).',
    filename: lang === 'en' ? 'one-note-for-myself.txt' : 'mot-dong-cho-minh.txt',
    quickStationLink: lang === 'en' ? '/en/join/' : '/join/',
  };

  var $ = function(s, root){ return (root||document).querySelector(s); };
  var $$ = function(s, root){ return Array.from((root||document).querySelectorAll(s)); };

  $("#year").textContent = new Date().getFullYear();

  var drawer = $("#drawer");
  var hamburger = $("#hamburger");
  var closeDrawer = $("#closeDrawer");

  function openDrawer(){
    drawer.classList.add("open");
    hamburger.setAttribute("aria-expanded","true");
    hamburger.setAttribute("aria-label", s.closeMenu);
  }
  function shutDrawer(){
    drawer.classList.remove("open");
    hamburger.setAttribute("aria-expanded","false");
    hamburger.setAttribute("aria-label", s.openMenu);
  }
  if(hamburger) hamburger.addEventListener("click", function(){
    (hamburger.getAttribute("aria-expanded") === "true") ? shutDrawer() : openDrawer();
  });
  if(closeDrawer) closeDrawer.addEventListener("click", shutDrawer);
  if(drawer) drawer.addEventListener("click", function(e){
    if(e.target.closest("[data-close]")) shutDrawer();
  });
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape") shutDrawer();
  });
  document.addEventListener("click", function(e){
    if(!drawer || !drawer.classList.contains("open")) return;
    if(!drawer.contains(e.target) && !hamburger.contains(e.target)) shutDrawer();
  });

  $$("[data-jump]").forEach(function(btn){
    btn.addEventListener("click", function(){
      var el = $(btn.getAttribute("data-jump"));
      if(el) el.scrollIntoView({behavior:"smooth", block:"start"});
      shutDrawer();
    });
  });

  var qs = $("#quickStation");
  if(qs) qs.addEventListener("click", function(){ window.location.href = s.quickStationLink; });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!reduceMotion){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add("show"); io.unobserve(en.target); }
      });
    }, {threshold: 0.12});
    $$(".reveal").forEach(function(el){ io.observe(el); });
  } else {
    $$(".reveal").forEach(function(el){ el.classList.add("show"); });
  }

  var ce = $("#copyEmail");
  if(ce) ce.addEventListener("click", async function(){
    var email = ($("#emailText")||{}).textContent || "lienhe@nguyenlananh.com";
    try{
      await navigator.clipboard.writeText(email.trim());
      ce.textContent = s.copied;
      setTimeout(function(){ ce.textContent = s.copyEmail; }, 1200);
    } catch(e){
      ce.textContent = s.copyFailed;
      setTimeout(function(){ ce.textContent = s.copyEmail; }, 1200);
    }
  });

  var NOTE_KEY = "nla_note_v1";
  var note = $("#note");
  var noteStatus = $("#noteStatus");
  function setStatus(msg){ if(noteStatus) noteStatus.textContent = msg||""; }
  function loadNote(){
    try{
      var v = localStorage.getItem(NOTE_KEY);
      if(v && note) note.value = v;
      if(v) setStatus(s.noteRecovered);
    } catch(e){}
  }
  function saveNote(){
    try{ localStorage.setItem(NOTE_KEY, (note||{}).value||""); setStatus(s.noteSaved); }
    catch(e){ setStatus(s.noteCannotSave); }
  }
  function clearNote(){
    if(note) note.value = "";
    try{ localStorage.removeItem(NOTE_KEY); } catch(e){}
    setStatus(s.noteCleared);
  }
  function exportNote(){
    var content = ((note||{}).value||"").trim();
    var blob = new Blob([content||""], {type:"text/plain;charset=utf-8"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = s.filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 500);
    setStatus(s.noteExported);
  }
  var sn = $("#saveNote"); if(sn) sn.addEventListener("click", saveNote);
  var cn = $("#clearNote"); if(cn) cn.addEventListener("click", clearNote);
  var en = $("#exportNote"); if(en) en.addEventListener("click", exportNote);
  var autot;
  if(note) note.addEventListener("input", function(){
    clearTimeout(autot);
    autot = setTimeout(function(){
      try{ localStorage.setItem(NOTE_KEY, note.value||""); } catch(e){}
    }, 500);
  });
  loadNote();

  var writingList = document.getElementById("writingList");
  var filterBtns = document.querySelectorAll("[data-filter]");
  function applyFilter(kind){
    if(!writingList) return;
    var items = Array.from(writingList.querySelectorAll("[data-kind]"));
    items.forEach(function(it){
      it.style.display = (kind==="all"||it.getAttribute("data-kind")===kind) ? "" : "none";
    });
    filterBtns.forEach(function(b){
      b.classList.remove("active");
      if(b.getAttribute("data-filter")===kind) b.classList.add("active");
    });
  }
  filterBtns.forEach(function(btn){
    btn.addEventListener("click", function(){ applyFilter(btn.getAttribute("data-filter")); });
  });
  applyFilter("all");

  function track(name, data){
    window.dispatchEvent(new CustomEvent("nla:track", {detail:{name:name, ...(data||{})}}));
  }
  ["#method","#content","#insight-series","#contact"].forEach(function(sel){
    var el = document.querySelector(sel);
    if(el){
      var obs = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){ track("section_view", {section:sel.slice(1)}); obs.unobserve(entry.target); }
        });
      }, {threshold:0.35});
      obs.observe(el);
    }
  });
  document.addEventListener("click", function(e){
    var cta = e.target.closest("button, a");
    if(!cta) return;
    var label = (cta.textContent||"").trim().slice(0,80);
    if(label) track("cta_click", {label:label});
  });

  $$("[data-lang]").forEach(function(btn){
    btn.addEventListener("click", function(){
      $$(".chip").forEach(function(b){ b.classList.remove("active"); });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed","true");
    });
  });
})();
