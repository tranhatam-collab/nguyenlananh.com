(function(){
  document.querySelectorAll('.docsToc a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var id = a.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth',block:'start'}); }
    });
  });
  var yr = document.getElementById('year');
  if(yr) yr.textContent = new Date().getFullYear();
  var drawer = document.getElementById('drawer');
  var hamburger = document.getElementById('hamburger');
  var closeDrawer = document.getElementById('closeDrawer');
  function setDrawer(open){
    if(!drawer || !hamburger) return;
    drawer.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('drawerOpen', open);
  }
  if(hamburger) hamburger.addEventListener('click', function(){ setDrawer(!drawer.classList.contains('open')); });
  if(closeDrawer) closeDrawer.addEventListener('click', function(){ setDrawer(false); });
  document.querySelectorAll('[data-close]').forEach(function(a){ a.addEventListener('click', function(){ setDrawer(false); }); });
  document.querySelectorAll('[data-lang]').forEach(function(btn){
    btn.addEventListener('click', function(){
      if(btn.dataset.lang === 'en') window.location.href = '/en/tai-lieu/';
    });
  });
})();
