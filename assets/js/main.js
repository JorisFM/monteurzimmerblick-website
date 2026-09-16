/* Monteurzimmerblick – Interaktion
   1. Navigation (mobil)
   2. Scroll-Reveal
   3. Gebührenrechner
   4. Weitergabe-Route (Hero)
*/
(function () {
  'use strict';
  var d = document;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var forceStatic = /[?&]static\b/.test(location.search);

  /* 1. Navigation */
  var nav = d.querySelector('.nav');
  var toggle = d.querySelector('.nav-toggle');
  function closeNav() {
    if (!nav) return;
    nav.classList.remove('open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }
  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('.nav-panel a').forEach(function (a) { a.addEventListener('click', closeNav); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { closeNav(); toggle.focus(); }
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', closeNav);
  }

  /* 2. Scroll-Reveal */
  var revealEls = d.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced && !forceStatic) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* 3. Gebührenrechner */
  var range = d.getElementById('leadpreis');
  if (range) {
    var out = d.getElementById('preis-out');
    var fee = d.getElementById('fee');
    var payout = d.getElementById('payout');
    var FEE = 0.10;
    var fmt = function (n) { return n.toLocaleString('de-DE') + ' €'; };
    var update = function () {
      var v = Number(range.value);
      var f = Math.round(v * FEE);
      out.textContent = fmt(v);
      fee.textContent = '– ' + fmt(f);
      payout.textContent = fmt(v - f);
      range.style.setProperty('--pct', ((v - range.min) / (range.max - range.min) * 100) + '%');
      range.setAttribute('aria-valuetext', fmt(v));
    };
    range.addEventListener('input', update);
    update();
  }

  /* 4. Weitergabe-Route */
  var track = d.querySelector('.track');
  if (!track) return;

  var nodes = Array.prototype.slice.call(track.querySelectorAll('.node'));
  var dots = nodes.map(function (n) { return n.querySelector('.node-dot'); });
  var segs = Array.prototype.slice.call(track.querySelectorAll('.seg'));
  var rail = track.querySelector('.rail');
  var ticket = track.querySelector('.ticket');
  var el = {
    id: ticket.querySelector('.ticket-id'),
    status: ticket.querySelector('.ticket-status'),
    dest: ticket.querySelector('.ticket-dest'),
    l1: ticket.querySelector('.t-l1'),
    l2: ticket.querySelector('.t-l2'),
    price: ticket.querySelector('.ticket-price')
  };

  /* Zwei Anfragen derselben Baufirma: Magdeburg → Dortmund → Hamburg */
  var steps = [
    { id: '#4821', dest: 'Dortmund', l1: '24 Monteure · 6 Wochen · ab 12.10.', l2: '28 €/Nacht · 2er-Zimmer · monatlich', price: '1.400 €' },
    { id: '#4877', dest: 'Hamburg', l1: '24 Monteure · 9 Wochen · ab 24.11.', l2: '30 €/Nacht · 2er-Zimmer · monatlich', price: '1.800 €' }
  ];

  var centers = [];
  var current = 0;

  function measure() {
    var tr = track.getBoundingClientRect();
    centers = dots.map(function (dt) {
      var r = dt.getBoundingClientRect();
      return { x: r.left - tr.left + r.width / 2, y: r.top - tr.top + r.height / 2 };
    });
    var vertical = Math.abs(centers[1].y - centers[0].y) > Math.abs(centers[1].x - centers[0].x);
    track.classList.toggle('vertical', vertical);
    segs.forEach(function (s, i) {
      var a = centers[i], b = centers[i + 1];
      if (!a || !b) return;
      if (vertical) {
        s.style.left = (a.x - 4) + 'px'; s.style.top = a.y + 'px';
        s.style.width = '8px'; s.style.height = (b.y - a.y) + 'px';
      } else {
        s.style.left = a.x + 'px'; s.style.top = (a.y - 4) + 'px';
        s.style.width = (b.x - a.x) + 'px'; s.style.height = '8px';
      }
    });
    var first = centers[0], last = centers[centers.length - 1];
    if (vertical) {
      rail.style.left = (first.x - 2) + 'px'; rail.style.top = first.y + 'px';
      rail.style.width = '4px'; rail.style.height = (last.y - first.y) + 'px';
    } else {
      rail.style.left = first.x + 'px'; rail.style.top = (first.y - 2) + 'px';
      rail.style.width = (last.x - first.x) + 'px'; rail.style.height = '4px';
    }
  }

  function place(i, animate) {
    var c = centers[i];
    if (!c) return;
    if (!animate) ticket.style.transition = 'none';
    ticket.style.setProperty('--x', c.x + 'px');
    ticket.style.setProperty('--y', c.y + 'px');
    if (!animate) { void ticket.offsetHeight; ticket.style.transition = ''; }
    current = i;
  }

  function setTicket(step) {
    el.id.textContent = 'Anfrage ' + step.id;
    el.dest.textContent = 'Ziel: ' + step.dest;
    el.l1.textContent = step.l1;
    el.l2.textContent = step.l2;
    el.price.textContent = step.price;
  }
  function setStatus(s) {
    el.status.textContent = s;
    el.status.dataset.state = s.toLowerCase();
  }
  function fill(i, v) { segs[i].style.setProperty('--fill', v); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function showStatic() {
    nodes.forEach(function (n, i) { n.classList.add(i === nodes.length - 1 ? 'active' : 'done'); });
    segs.forEach(function (s) { s.style.setProperty('--fill', 1); });
    setTicket(steps[steps.length - 1]);
    setStatus('Verkauft');
    place(nodes.length - 1, false);
    ticket.classList.add('show');
  }

  async function loop() {
    for (;;) {
      nodes.forEach(function (n) { n.classList.remove('active', 'done'); });
      segs.forEach(function (s) { s.style.setProperty('--fill', 0); });
      ticket.classList.remove('show');
      await sleep(500);
      place(0, false);
      nodes[0].classList.add('active');
      setTicket(steps[0]);
      setStatus('Verfügbar');
      await sleep(350);
      ticket.classList.add('show');
      await sleep(1500);

      for (var i = 0; i < steps.length; i++) {
        fill(i, 1);
        place(i + 1, true);
        await sleep(1550);
        nodes[i].classList.remove('active');
        nodes[i].classList.add('done');
        nodes[i + 1].classList.add('active');
        setStatus('Verkauft');
        await sleep(1700);
        if (i < steps.length - 1) {
          setTicket(steps[i + 1]);
          setStatus('Verfügbar');
          await sleep(1100);
        }
      }
      await sleep(2600);
      while (d.hidden) await sleep(500);
    }
  }

  measure();
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { measure(); place(current, false); }, 80);
  });
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { measure(); place(current, false); });

  if (reduced || forceStatic) {
    showStatic();
  } else {
    loop();
  }
})();
