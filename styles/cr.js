/* ============================================================
   Content & Research — Project Arklight (new brand)
   Shared behavior: mobile menu, scroll reveal, filter chips,
   and Chart.js brand theming for research briefings.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- mobile menu ---------- */
  function initMenu() {
    var burger = document.querySelector('[data-cr-burger]');
    var menu = document.querySelector('[data-cr-mobile]');
    if (!burger || !menu) return;
    function close() {
      menu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    }
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('no-scroll', open);
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- filter chips (index) ---------- */
  function initFilters() {
    var chips = document.querySelectorAll('.cr-chip');
    if (!chips.length) return;
    var sections = document.querySelectorAll('[data-section]');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.dataset.filter;
        chips.forEach(function (c) { c.classList.toggle('active', c === chip); });
        sections.forEach(function (sec) {
          sec.style.display = (f === 'all' || f === sec.dataset.section) ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Chart.js brand theme ---------- */
  // Exposed so research briefings can read consistent colors.
  window.CR = window.CR || {};
  window.CR.colors = {
    rust: '#B85416',
    rustFill: 'rgba(184,84,22,0.16)',
    steel: '#2E5A86',
    steelFill: 'rgba(46,90,134,0.16)',
    amber: '#C9781F',
    ember: '#C0432B',
    ink: '#15140F',
    grid: 'rgba(20,18,15,0.10)',
    tick: 'rgba(20,18,15,0.55)',
    track: 'rgba(20,18,15,0.08)',
    mono: "'JetBrains Mono', ui-monospace, monospace",
    body: "'Inter Tight', sans-serif"
  };
  window.CR.applyChartTheme = function () {
    if (!window.Chart) return;
    var c = window.CR.colors;
    Chart.defaults.font.family = c.mono;
    Chart.defaults.font.size = 10;
    Chart.defaults.color = c.tick;
    Chart.defaults.borderColor = c.grid;
  };
  window.CR.fmtK = function (v) {
    return v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v;
  };
  // Shared tooltip styling for the light brand.
  window.CR.tooltip = function (suffix) {
    var c = window.CR.colors;
    return {
      backgroundColor: 'rgba(21,20,15,0.95)',
      borderColor: 'rgba(255,255,255,0.14)',
      borderWidth: 1,
      titleColor: '#F5F3ED',
      bodyColor: '#F5F3ED',
      titleFont: { family: c.mono, size: 10 },
      bodyFont: { family: c.mono, size: 11 },
      padding: 12,
      callbacks: suffix ? {
        label: function (ctx) { return '  ' + ctx.raw.toLocaleString() + suffix; }
      } : {}
    };
  };

  function init() {
    initMenu();
    initReveal();
    initFilters();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
