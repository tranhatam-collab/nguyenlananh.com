(() => {
  const KEY = 'nla_lang_pref';
  const REDIRECT_ONCE_KEY = 'nla_lang_redirect_once';

  const path = window.location.pathname || '/';
  if (path.startsWith('/cdn-cgi/')) return;

  function getCurrentLang() {
    return path === '/en' || path.startsWith('/en/') ? 'en' : 'vi';
  }

  function detectBrowserLang() {
    const langs = [];
    if (Array.isArray(navigator.languages)) langs.push(...navigator.languages);
    if (navigator.language) langs.push(navigator.language);

    for (const raw of langs) {
      const l = String(raw || '').toLowerCase();
      if (l.startsWith('vi')) return 'vi';
      if (l.startsWith('en')) return 'en';
    }
    return 'vi';
  }

  function toVi(pathname) {
    if (pathname === '/en' || pathname === '/en/') return '/';
    if (pathname.startsWith('/en/')) return `/${pathname.slice(4)}`;
    return pathname;
  }

  function toEn(pathname) {
    if (pathname === '/' || pathname === '') return '/en/';
    if (pathname === '/en' || pathname.startsWith('/en/')) return pathname;
    return `/en${pathname}`;
  }

  function counterpart(lang) {
    return lang === 'en' ? toEn(path) : toVi(path);
  }

  function goTo(lang) {
    try { localStorage.setItem(KEY, lang); } catch (_e) {}
    const target = counterpart(lang);
    if (!target || target === path) return;
    window.location.href = `${target}${window.location.search || ''}${window.location.hash || ''}`;
  }

  function shouldAutoRedirect(stored) {
    const current = getCurrentLang();
    if (stored === current) return false;
    if (sessionStorage.getItem(REDIRECT_ONCE_KEY) === '1') return false;
    if (window.location.search.includes('lang=')) return false;
    return true;
  }

  function autoRedirect() {
    let stored = null;
    try { stored = localStorage.getItem(KEY); } catch (_e) {}

    if (!stored) {
      stored = detectBrowserLang();
      try { localStorage.setItem(KEY, stored); } catch (_e) {}
    }

    if (stored !== 'vi' && stored !== 'en') stored = 'vi';

    if (shouldAutoRedirect(stored)) {
      const target = counterpart(stored);
      if (target && target !== path) {
        sessionStorage.setItem(REDIRECT_ONCE_KEY, '1');
        window.location.replace(`${target}${window.location.search || ''}${window.location.hash || ''}`);
      }
    }
  }

  function installSwitch() {
    const box = document.createElement('div');
    box.setAttribute('aria-label', 'Language switch');
    box.style.position = 'fixed';
    box.style.right = '14px';
    box.style.bottom = '14px';
    box.style.zIndex = '9999';
    box.style.display = 'flex';
    box.style.gap = '6px';
    box.style.padding = '6px';
    box.style.border = '1px solid rgba(15,23,42,.18)';
    box.style.borderRadius = '999px';
    box.style.background = 'rgba(255,255,255,.92)';
    box.style.backdropFilter = 'blur(8px)';
    box.style.boxShadow = '0 10px 22px rgba(2,6,23,.12)';

    const current = getCurrentLang();

    const mkBtn = (lang, label) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.style.border = '1px solid rgba(15,23,42,.18)';
      b.style.borderRadius = '999px';
      b.style.padding = '6px 10px';
      b.style.fontSize = '12px';
      b.style.cursor = 'pointer';
      b.style.background = current === lang ? 'rgba(15,23,42,.9)' : 'rgba(255,255,255,.95)';
      b.style.color = current === lang ? '#fff' : '#111827';
      b.addEventListener('click', () => goTo(lang));
      return b;
    };

    box.appendChild(mkBtn('vi', 'VI'));
    box.appendChild(mkBtn('en', 'EN-US'));

    document.body.appendChild(box);
  }

  function wireExistingButtons() {
    const current = getCurrentLang();
    document.querySelectorAll('[data-lang]').forEach((btn) => {
      const lang = (btn.getAttribute('data-lang') || '').toLowerCase();
      const isActive = lang === current;
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      if (btn.classList) btn.classList.toggle('active', isActive);
      btn.addEventListener('click', () => {
        if (lang === 'vi' || lang === 'en') goTo(lang);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    autoRedirect();
    wireExistingButtons();
    installSwitch();
  });
})();
