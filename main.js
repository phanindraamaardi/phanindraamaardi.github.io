(function () {
  'use strict';

  var root = document.documentElement;
  var THEME_KEY = 'pa-theme';

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  }

  function applyTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') theme = 'dark';
    root.setAttribute('data-theme', theme);
    setStoredTheme(theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? '#f4f6fb' : '#0a0c10');
    }
  }

  function initTheme() {
    var stored = getStoredTheme();
    if (stored === 'light' || stored === 'dark') {
      applyTheme(stored);
      return;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      applyTheme('light');
    } else {
      applyTheme('dark');
    }
  }

  var themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
    });
  }

  initTheme();

  var progress = document.getElementById('scroll-progress');
  function onScroll() {
    if (!progress) return;
    var h = document.documentElement;
    var scrollTop = h.scrollTop || document.body.scrollTop;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (scrollTop / max) * 100 : 0;
    progress.style.transform = 'scaleX(' + pct / 100 + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduceMotion) {
    var reveals = document.querySelectorAll('.reveal');
    if (reveals.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
            }
          });
        },
        { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
      reveals.forEach(function (el) {
        io.observe(el);
      });
    } else {
      reveals.forEach(function (el) {
        el.classList.add('is-visible');
      });
    }
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  var navToggle = document.getElementById('nav-toggle');
  var navPanel = document.getElementById('nav-panel');
  function setNavOpen(open) {
    if (!navToggle || !navPanel) return;
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navPanel.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  }
  if (navToggle && navPanel) {
    navToggle.addEventListener('click', function () {
      var open = navToggle.getAttribute('aria-expanded') !== 'true';
      setNavOpen(open);
    });
    navPanel.querySelectorAll('[data-nav]').forEach(function (link) {
      link.addEventListener('click', function () {
        setNavOpen(false);
      });
    });
  }

  var navLinks = document.querySelectorAll('.nav-links a[data-nav]');
  var sections = [];
  navLinks.forEach(function (a) {
    var id = a.getAttribute('href');
    if (id && id.charAt(0) === '#') {
      var el = document.getElementById(id.slice(1));
      if (el) sections.push({ id: id.slice(1), link: a, el: el });
    }
  });

  function updateActiveNav() {
    var y = window.scrollY + 120;
    var current = null;
    for (var i = sections.length - 1; i >= 0; i--) {
      if (sections[i].el.offsetTop <= y) {
        current = sections[i];
        break;
      }
    }
    sections.forEach(function (s) {
      s.link.classList.toggle('is-active', current && s.id === current.id);
    });
  }
  if (sections.length) {
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
  }

  document.querySelectorAll('.skill-filter').forEach(function (btn) {
    btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');
    btn.addEventListener('click', function () {
      var filter = btn.getAttribute('data-filter') || 'all';
      document.querySelectorAll('.skill-filter').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      document.querySelectorAll('#skills-list li').forEach(function (li) {
        var cat = li.getAttribute('data-cat') || '';
        var show = filter === 'all' || cat === filter;
        li.classList.toggle('is-hidden', !show);
        li.setAttribute('aria-hidden', show ? 'false' : 'true');
      });
    });
  });

  var yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();
})();
