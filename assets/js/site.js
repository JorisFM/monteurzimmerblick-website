/* Monteurzimmerblick – Ticker und Erklärvideo
   (Navigation, Reveal, Rechner und Routen-Animation kommen aus main.js) */
(function () {
  'use strict';
  var d = document;

  /* Ticker: Inhalt einmal duplizieren, damit die Schleife nahtlos läuft */
  var track = d.querySelector('.ticker-track');
  if (track && !track.dataset.cloned) {
    track.innerHTML += track.innerHTML;
    track.dataset.cloned = '1';
  }

  /* Rendite-Rechner: Kunden pro Jahr × 200 € durchschnittliches Extraeinkommen */
  var kunden = d.getElementById('kunden');
  if (kunden) {
    var kOut = d.getElementById('kunden-out'), extra = d.getElementById('extra'), PRO_KUNDE = 200;
    var upd = function () {
      var n = Number(kunden.value);
      kOut.textContent = n;
      extra.textContent = (n * PRO_KUNDE).toLocaleString('de-DE') + ' €';
      kunden.style.setProperty('--pct', ((n - kunden.min) / (kunden.max - kunden.min) * 100) + '%');
      kunden.setAttribute('aria-valuetext', n + ' Kunden, bis zu ' + (n * PRO_KUNDE).toLocaleString('de-DE') + ' Euro');
    };
    kunden.addEventListener('input', upd);
    upd();
  }

  /* Erklärvideo: eigene Seite (erklaervideo.html) wird beim Klick in den Rahmen geladen */
  var frame = d.querySelector('.video-frame');
  if (!frame) return;
  var overlay = frame.querySelector('.video-overlay');
  var embed = frame.querySelector('.video-embed');
  if (!overlay || !embed) return;

  overlay.addEventListener('click', function () {
    if (embed.querySelector('iframe')) return;
    var f = d.createElement('iframe');
    f.src = embed.dataset.src;
    f.title = 'Erklärvideo: So funktioniert Monteurzimmerblick';
    f.setAttribute('allow', 'autoplay; fullscreen');
    f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;background:#0E0E0D';
    embed.appendChild(f);
    overlay.classList.add('hidden');
    var poster = frame.querySelector('img');
    if (poster) poster.style.display = 'none';
  });
})();
