(function () {
  'use strict';

  var root = document.documentElement;
  var THEME_KEY = 'pa-editorial-theme';

  function applyTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') theme = 'light';
    root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#0e0e0e' : '#f7f4ef');
    }
  }

  function initTheme() {
    try {
      var s = localStorage.getItem(THEME_KEY);
      if (s === 'light' || s === 'dark') {
        applyTheme(s);
        return;
      }
    } catch (e) {}
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme('dark');
    } else {
      applyTheme('light');
    }
  }

  var themeBtn = document.getElementById('theme-flip');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  initTheme();

  /* Clock + date (local, Michigan-style tag is static [mi]) */
  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function tickClock() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var am = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    if (h === 0) h = 12;
    var label = h + ':' + pad(m) + ' ' + am;
    var clockEl = document.getElementById('clock');
    if (clockEl) {
      clockEl.textContent = label;
      clockEl.setAttribute('datetime', now.toISOString());
    }
    var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    var dateEl = document.getElementById('stamp-date');
    if (dateEl) {
      dateEl.textContent = pad(now.getDate()) + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
    }
  }

  tickClock();
  setInterval(tickClock, 30000);

  /* Scroll line */
  var line = document.getElementById('scroll-line');
  function onScroll() {
    if (!line) return;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    line.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Nav active */
  var links = document.querySelectorAll('.nav-main-list a[data-nav]');
  var sectionEls = [];
  links.forEach(function (a) {
    var href = a.getAttribute('href');
    if (href && href.charAt(0) === '#') {
      var el = document.getElementById(href.slice(1));
      if (el) sectionEls.push({ id: href.slice(1), link: a, el: el });
    }
  });

  function updateNav() {
    if (window.scrollY < 60) {
      sectionEls.forEach(function (s) {
        s.link.classList.remove('is-active');
      });
      return;
    }
    var y = window.scrollY + 120;
    var cur = null;
    for (var i = sectionEls.length - 1; i >= 0; i--) {
      if (sectionEls[i].el.offsetTop <= y) {
        cur = sectionEls[i];
        break;
      }
    }
    sectionEls.forEach(function (s) {
      s.link.classList.toggle('is-active', cur && s.id === cur.id);
    });
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* Mobile menu */
  var burger = document.getElementById('nav-burger');
  var navMain = document.getElementById('nav-main');
  function closeNav() {
    if (!burger || !navMain) return;
    burger.setAttribute('aria-expanded', 'false');
    navMain.classList.remove('is-open');
  }
  function toggleNav() {
    if (!burger || !navMain) return;
    var open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    navMain.classList.toggle('is-open', open);
  }
  if (burger && navMain) {
    burger.addEventListener('click', toggleNav);
    navMain.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
  }

  var yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();
})();
