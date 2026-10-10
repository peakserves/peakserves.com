// Menu, scroll reveal, stage zoom, count-up, tabs, swipe dots, floating contact
// button and the IST footer clock. No dependencies.
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- Menu -----
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('menu-open', open);
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  // ----- Reveal on scroll (staggered inside [data-stagger]) -----
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.querySelectorAll('.fx'), function (el, i) {
      el.style.setProperty('--delay', Math.min(i, 8) * 80 + 'ms');
    });
  });
  if ('IntersectionObserver' in window && !reduce) {
    root.classList.add('fx-ready');
    var fxObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); fxObs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.querySelectorAll('.fx, .stage').forEach(function (el) { fxObs.observe(el); });

    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('seen'); revObs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -25% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { revObs.observe(el); });
  } else {
    document.querySelectorAll('.stage, .touch').forEach(function (el) { el.classList.add('in'); });
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('seen'); });
  }

  // ----- Count-up numbers -----
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cObs.unobserve(en.target);
        var el = en.target, to = parseInt(el.getAttribute('data-count'), 10), t0 = null;
        var step = function (t) {
          if (!t0) t0 = t;
          var k = Math.min((t - t0) / 1400, 1);
          el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        };
        el.textContent = '0';
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cObs.observe(el); });
  }

  // ----- Tabs -----
  document.querySelectorAll('[data-tabs]').forEach(function (tabs) {
    var buttons = tabs.querySelectorAll('[data-tab]');
    var ink = tabs.querySelector('.tabs-ink');
    var scope = tabs.parentElement;
    function moveInk(btn) {
      if (!ink) return;
      ink.style.width = btn.offsetWidth + 'px';
      ink.style.transform = 'translateX(' + (btn.offsetLeft - 4) + 'px)';
    }
    function select(btn) {
      buttons.forEach(function (b) { b.setAttribute('aria-selected', b === btn ? 'true' : 'false'); });
      scope.querySelectorAll('[data-panel]').forEach(function (p) {
        var on = p.getAttribute('data-panel') === btn.getAttribute('data-tab');
        p.hidden = !on;
        if (on) p.querySelectorAll('.fx').forEach(function (el) { el.classList.add('in'); });
      });
      moveInk(btn);
    }
    buttons.forEach(function (b) { b.addEventListener('click', function () { select(b); }); });
    var first = tabs.querySelector('[aria-selected="true"]') || buttons[0];
    requestAnimationFrame(function () { moveInk(first); });
    window.addEventListener('resize', function () { moveInk(tabs.querySelector('[aria-selected="true"]')); });
  });

  // ----- Swipe dots for horizontal rows (phones) -----
  var mobile = window.matchMedia('(max-width: 720px)');
  document.querySelectorAll('.scroller').forEach(function (row) {
    var items = row.children;
    if (items.length < 2) return;
    var dots = document.createElement('div');
    dots.className = 'swipe-hint';
    dots.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < items.length; i++) dots.appendChild(document.createElement('i'));
    row.parentNode.insertBefore(dots, row.nextSibling);
    var update = function () {
      dots.style.display = mobile.matches ? '' : 'none';
      var mid = row.scrollLeft + row.clientWidth / 2, best = 0, bestD = Infinity;
      for (var j = 0; j < items.length; j++) {
        var c = items[j].offsetLeft + items[j].offsetWidth / 2, d = Math.abs(c - mid);
        if (d < bestD) { bestD = d; best = j; }
      }
      Array.prototype.forEach.call(dots.children, function (dot, k) { dot.classList.toggle('on', k === best); });
    };
    row.addEventListener('scroll', function () { requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  // ----- Stage zoom, header hairline, floating contact button -----
  var stage = document.querySelector('.stage');
  var header = document.querySelector('.site-header');
  var cta = document.querySelector('.float-cta');
  var contact = document.getElementById('contact-us-section');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var vh = window.innerHeight;
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
    if (stage && !reduce) {
      var r = stage.getBoundingClientRect();
      var k = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.9)));
      stage.style.setProperty('--s', (0.9 + 0.1 * k).toFixed(4));
    }
    if (cta) {
      var nearContact = contact && contact.getBoundingClientRect().top < vh;
      cta.classList.toggle('show', window.scrollY > vh * 0.6 && !nearContact);
    }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // ----- Clock -----
  var clock = document.querySelector('[data-clock]');
  if (clock) {
    var fmt = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
    var tick = function () { clock.textContent = fmt.format(new Date()).toUpperCase(); };
    tick();
    setInterval(tick, 30000);
  }
})();
