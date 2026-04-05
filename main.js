(function () {
  'use strict';

  var root = document.documentElement;
  var PALETTE_KEY = 'pa-palette';
  var PALETTES = ['midnight', 'aurora', 'ember', 'glacier'];
  var THEME_COLORS = {
    midnight: '#070a0f',
    aurora: '#0b0618',
    ember: '#12080a',
    glacier: '#f0f4f8'
  };

  function getStoredPalette() {
    try {
      return localStorage.getItem(PALETTE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredPalette(p) {
    try {
      localStorage.setItem(PALETTE_KEY, p);
    } catch (e) {}
  }

  function applyPalette(palette) {
    if (PALETTES.indexOf(palette) === -1) palette = 'midnight';
    root.setAttribute('data-palette', palette);
    setStoredPalette(palette);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[palette] || THEME_COLORS.midnight);
    document.querySelectorAll('.theme-swatch').forEach(function (btn) {
      var id = btn.getAttribute('data-palette');
      btn.setAttribute('aria-pressed', id === palette ? 'true' : 'false');
    });
  }

  function initPalette() {
    var stored = getStoredPalette();
    if (stored && PALETTES.indexOf(stored) !== -1) {
      applyPalette(stored);
    } else {
      applyPalette('midnight');
    }
  }

  initPalette();

  document.querySelectorAll('.theme-swatch').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var p = btn.getAttribute('data-palette');
      if (p) applyPalette(p);
    });
  });

  /* Scroll progress */
  var progress = document.getElementById('scroll-progress');
  function onScroll() {
    if (!progress) return;
    var h = document.documentElement;
    var scrollTop = h.scrollTop || document.body.scrollTop;
    var max = h.scrollHeight - h.clientHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? scrollTop / max : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Cursor glow */
  var glow = document.getElementById('cursor-glow');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (glow && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    var gx = 0;
    var gy = 0;
    var tx = 0;
    var ty = 0;
    window.addEventListener(
      'mousemove',
      function (e) {
        tx = e.clientX;
        ty = e.clientY;
      },
      { passive: true }
    );
    function loop() {
      gx += (tx - gx) * 0.08;
      gy += (ty - gy) * 0.08;
      glow.style.left = gx + 'px';
      glow.style.top = gy + 'px';
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* Reveal on scroll */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.06 }
    );
    document.querySelectorAll('.reveal').forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* Nav */
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
      setNavOpen(navToggle.getAttribute('aria-expanded') !== 'true');
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
    var y = window.scrollY + 100;
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

  /* Skill filters */
  document.querySelectorAll('.skill-filter').forEach(function (btn) {
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

  /* Tilt cards */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        var rx = (y * -6).toFixed(2);
        var ry = (x * 8).toFixed(2);
        card.style.transform = 'perspective(1000px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(0)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* Count up hero stats */
  function animateValue(el, end, duration) {
    var start = 0;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var p = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (end - start) * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
      var done = false;
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting || done) return;
            done = true;
            document.querySelectorAll('.hero-stat-value[data-count]').forEach(function (el) {
              var n = parseInt(el.getAttribute('data-count'), 10);
              if (!isNaN(n)) animateValue(el, n, 1200);
            });
            obs.disconnect();
          });
        },
        { threshold: 0.3 }
      );
      obs.observe(heroStats);
    }
  } else {
    document.querySelectorAll('.hero-stat-value[data-count]').forEach(function (el) {
      var n = parseInt(el.getAttribute('data-count'), 10);
      if (!isNaN(n)) el.textContent = String(n);
    });
  }

  var yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();
})();
