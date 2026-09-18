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

  /* Erklärvideo: eine einzige MP4-Datei, Bild, Stimme und Musik sind fest gemischt.
     Dadurch bleibt alles synchron, auch auf dem Handy. */
  var frame = d.querySelector('.video-frame');
  if (!frame) return;
  var overlay = frame.querySelector('.video-overlay');
  var video = frame.querySelector('video');
  var note = frame.querySelector('.video-note');
  if (!overlay || !video) return;

  overlay.addEventListener('click', function () {
    overlay.classList.add('hidden');
    video.controls = true;
    var p = video.play();
    if (p && p.catch) p.catch(function () {
      if (note) { note.textContent = 'Tippen Sie auf Play, um das Video zu starten.'; note.classList.add('show'); }
    });
  });
  video.addEventListener('play', function () { if (note) note.classList.remove('show'); });
  video.addEventListener('ended', function () {
    video.controls = false;
    try { video.currentTime = 0; } catch (e) {}
    video.load();
    overlay.classList.remove('hidden');
  });
})();
