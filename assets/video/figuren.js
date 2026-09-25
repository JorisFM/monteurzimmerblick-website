/* Figuren für das Erklärvideo (SVG-Rig).
   Jede Figur hat Parameter (Winkel, Stimmung, Gehphase), die GSAP animiert.
   Figuren.draw(t) setzt daraus jedes Bild; Atmen, Gewichtsverlagerung, Blinzeln
   und der Gehzyklus mit Knie und Fuß werden aus der Zeit berechnet. */
(function (global) {
  'use strict';
  var INK = '#0E0E0D', Y = '#F5B800', WH = '#FFFFFF', G4 = '#7A7A74', DK = '#3A3A36';
  function sk(w) { return 'stroke="' + INK + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"'; }

  /* Maße (Füße bei y = 0, Blick nach rechts) */
  var THIGH = 82, SHIN = 78, HIP = -176, SHOULDER = -340, UPPER = 76, FORE = 70;
  var OFF = HIP + 194;   /* Oberkörper ist für Hüfthöhe -194 gezeichnet */
  var REST = { armFu: -5, armFl: 7, armBu: 5, armBl: -7 };

  var LOOKS = {
    berger:  { skin: '#F2C9A5', skinD: '#DDA27C', hair: '#D4D4CE', brow: '#8E8E88', top: DK, sleeve: WH, pants: G4 },
    kollege: { skin: '#EFC49E', skinD: '#D69C74', hair: '#9C7352', brow: '#5E4330', top: WH, sleeve: WH, pants: DK },
    worker:  { skin: '#A36B45', skinD: '#85522F', hair: '#1E1E1C', brow: '#1E1E1C', top: DK, sleeve: DK, pants: G4 }
  };
  var TORSO = 'M-46,-334 C-48,-352 -36,-360 -22,-360 L22,-360 C36,-360 48,-352 46,-334 L42,-214 C42,-196 34,-186 18,-186 L-18,-186 C-34,-186 -42,-196 -42,-214 Z';

  function hand(id, L) {
    return '<g id="' + id + '">' +
      '<path d="M-13,-6 C-16,8 -12,23 0,24 C12,24 16,11 13,-6 Z" fill="' + L.skin + '" ' + sk(4.5) + '/>' +
      '<path d="M10,2 C19,1 22,10 15,16" fill="' + L.skin + '" ' + sk(4) + '/></g>';
  }

  function headSvg(id, type, L) {
    /* Kopf: Mitte (4,-424), Gesicht leicht nach rechts gedreht (Dreiviertelansicht) */
    var eyeY = type === 'worker' ? -420 : -428;
    var ear = '<ellipse cx="-33" cy="' + (eyeY + 6) + '" rx="9" ry="12" fill="' + L.skin + '" ' + sk(4) + '/>' +
      '<path d="M-35,' + eyeY + ' Q-29,' + (eyeY + 6) + ' -34,' + (eyeY + 12) + '" fill="none" ' + sk(3) + '/>';
    var hair = '', lower = '', top = '';
    if (type === 'berger') {
      hair = '<path d="M44,-457 C36,-488 -30,-494 -46,-456 C-55,-436 -52,-412 -44,-400 L-34,-406 C-37,-420 -35,-438 -24,-447 C-8,-458 20,-459 44,-457 Z" fill="' + L.hair + '" ' + sk(4.5) + '/>' +
        '<path d="M8,-458 C14,-466 26,-470 38,-466" fill="none" stroke="#B9B9B2" stroke-width="3.5" stroke-linecap="round"/>';
      top = '<rect x="-1" y="' + (eyeY - 9) + '" width="22" height="18" rx="6" fill="none" ' + sk(3) + '/>' +
        '<rect x="25" y="' + (eyeY - 9) + '" width="17" height="18" rx="6" fill="none" ' + sk(3) + '/>' +
        '<path d="M21,' + (eyeY - 2) + ' L25,' + (eyeY - 2) + ' M-1,' + (eyeY - 2) + ' L-26,' + (eyeY + 2) + '" fill="none" ' + sk(3) + '/>';
    }
    if (type === 'kollege') {
      hair = '<path d="M-30,-452 C-40,-440 -40,-418 -32,-410 L-26,-424 C-28,-434 -26,-446 -22,-452 Z" fill="' + L.hair + '" ' + sk(4) + '/>';
      lower = '<path d="M-31,-432 L-29,-412 C-20,-403 -6,-403 8,-408 C16,-411 24,-410 29,-405 C35,-410 43,-414 53,-418 L53,-408 C50,-384 30,-368 10,-368 C-12,-368 -29,-384 -35,-404 Z" fill="' + L.hair + '" ' + sk(4) + '/>';
      top = '<path d="M-48,-450 C-50,-472 -40,-486 -10,-489 L30,-489 C48,-487 56,-472 54,-450 Z" fill="' + INK + '" ' + sk(4.5) + '/>' +
        '<rect x="-50" y="-457" width="106" height="11" rx="4" fill="' + DK + '" ' + sk(4) + '/>' +
        '<path d="M28,-449 C46,-449 62,-445 67,-436 C53,-438 40,-440 24,-442 Z" fill="' + INK + '" ' + sk(4) + '/>' +
        '<circle cx="4" cy="-472" r="5" fill="' + Y + '"/>';
    }
    if (type === 'worker') {
      hair = '<path d="M-36,-436 C-44,-424 -42,-410 -36,-404 L-28,-412 C-31,-420 -31,-428 -28,-436 Z" fill="' + L.hair + '"/>';
      top = '<path d="M-54,-438 C-54,-478 -24,-493 6,-493 C36,-493 60,-478 60,-438 Z" fill="' + Y + '" ' + sk(4.5) + '/>' +
        '<path d="M-58,-446 L70,-446 C76,-446 76,-434 70,-434 L-58,-434 C-63,-434 -63,-446 -58,-446 Z" fill="' + Y + '" ' + sk(4.5) + '/>' +
        '<path d="M4,-491 V-448" ' + sk(4) + '/>';
    }
    var face =
      '<g id="' + id + '-face">' +
      '<g id="' + id + '-eyes"><ellipse cx="10" cy="' + eyeY + '" rx="4.3" ry="5.3" fill="' + INK + '"/><ellipse cx="34" cy="' + eyeY + '" rx="4" ry="5.1" fill="' + INK + '"/></g>' +
      '<g id="' + id + '-brows" fill="none" stroke="' + L.brow + '" stroke-width="4.5" stroke-linecap="round">' +
      '<path id="' + id + '-browL" d="M2,' + (eyeY - 15) + ' Q9,' + (eyeY - 19) + ' 17,' + (eyeY - 16) + '"/>' +
      '<path id="' + id + '-browR" d="M27,' + (eyeY - 17) + ' Q34,' + (eyeY - 19) + ' 41,' + (eyeY - 14) + '"/></g>' +
      '<path d="M25,' + (eyeY + 5) + ' C31,' + (eyeY + 12) + ' 32,' + (eyeY + 17) + ' 25,' + (eyeY + 19) + '" fill="none" ' + sk(3.6) + '/>' +
      '<g id="' + id + '-mouths">' +
      '<path class="m0" d="M12,' + (eyeY + 28) + ' Q21,' + (eyeY + 36) + ' 30,' + (eyeY + 27) + '" fill="none" ' + sk(4) + '/>' +
      '<path class="m1" d="M10,' + (eyeY + 25) + ' Q21,' + (eyeY + 44) + ' 32,' + (eyeY + 24) + ' Z" fill="' + INK + '" ' + sk(3.5) + '/>' +
      '<path class="m2" d="M13,' + (eyeY + 34) + ' Q21,' + (eyeY + 28) + ' 29,' + (eyeY + 34) + '" fill="none" ' + sk(4) + '/>' +
      '<ellipse class="m3" cx="21" cy="' + (eyeY + 31) + '" rx="4.5" ry="5.5" fill="' + INK + '"/>' +
      '</g></g>';
    /* Reihenfolge: Kopf, Haar, Bart, Ohr, Gesicht, Mütze/Helm/Brille */
    return '<ellipse cx="4" cy="-424" rx="50" ry="55" fill="' + L.skin + '" ' + sk(5) + '/>' + hair + lower + ear + face + top;
  }

  function svg(id, type) {
    var L = LOOKS[type];
    function arm(side) {
      var band = type === 'worker' ? '<rect x="-13" y="42" width="26" height="11" fill="' + Y + '" ' + sk(3.5) + '/>' : '';
      var cuff = type === 'berger' ? '<path d="M-13,58 H13" ' + sk(3.5) + '/>' : '';
      return '<g id="' + id + '-arm' + side + '">' +
        '<rect x="-14" y="-12" width="28" height="' + (UPPER + 16) + '" rx="14" fill="' + L.sleeve + '" ' + sk(5) + '/>' +
        '<g id="' + id + '-fore' + side + '">' +
        '<rect x="-13" y="-10" width="26" height="' + (FORE + 12) + '" rx="13" fill="' + L.sleeve + '" ' + sk(5) + '/>' + band + cuff +
        '<g id="' + id + '-hand' + side + '">' + hand(id + '-h' + side, L) + '<g id="' + id + '-hold' + side + '"></g></g>' +
        '</g></g>';
    }
    function leg(side) {
      return '<g id="' + id + '-leg' + side + '">' +
        '<rect x="-19" y="-12" width="38" height="' + (THIGH + 20) + '" rx="19" fill="' + L.pants + '" ' + sk(5) + '/>' +
        '<g id="' + id + '-knee' + side + '">' +
        '<rect x="-17" y="-12" width="34" height="' + (SHIN + 14) + '" rx="17" fill="' + L.pants + '" ' + sk(5) + '/>' +
        '<g id="' + id + '-foot' + side + '"><path d="M-17,-2 L16,-2 C34,-2 40,6 40,14 L40,17 L-19,17 C-21,17 -21,15 -21,13 L-21,2 C-21,0 -19,-2 -17,-2 Z" fill="' + INK + '" ' + sk(4) + '/></g>' +
        '</g></g>';
    }

    var torso = '<path d="' + TORSO + '" fill="' + L.top + '" ' + sk(5) + '/>';
    if (type === 'berger') {
      torso += '<path d="M-21,-360 L0,-310 L21,-360 Z" fill="' + WH + '" ' + sk(4) + '/>' +
        '<path d="M-21,-360 L-9,-340 L0,-354 L9,-340 L21,-360" fill="' + WH + '" ' + sk(4) + '/>' +
        '<path d="M0,-348 L-6,-334 L0,-306 L6,-334 Z" fill="' + Y + '" ' + sk(3) + '/>' +
        '<circle cx="0" cy="-282" r="4" fill="' + WH + '"/><circle cx="0" cy="-252" r="4" fill="' + WH + '"/><circle cx="0" cy="-222" r="4" fill="' + WH + '"/>';
    }
    if (type === 'kollege') {
      var st = '';
      for (var i = 0; i < 6; i++) st += '<rect x="-50" y="' + (-334 + i * 25) + '" width="100" height="10" fill="' + DK + '"/>';
      torso = '<clipPath id="' + id + '-tc"><path d="' + TORSO + '"/></clipPath>' +
        torso + '<g clip-path="url(#' + id + '-tc)">' + st + '</g>' +
        '<path d="' + TORSO + '" fill="none" ' + sk(5) + '/>' +
        '<path d="M-18,-360 Q0,-344 18,-360" fill="' + L.skin + '" ' + sk(4) + '/>';
    }
    if (type === 'worker') {
      torso += '<rect x="-45" y="-300" width="90" height="16" fill="' + Y + '" ' + sk(4) + '/><rect x="-43" y="-250" width="86" height="16" fill="' + Y + '" ' + sk(4) + '/>' +
        '<path d="M0,-360 V-190" ' + sk(3.5) + '/>';
    }

    return '<g id="' + id + '">' +
      '<ellipse id="' + id + '-shadow" cx="6" cy="1" rx="78" ry="11" fill="' + INK + '" opacity=".08"/>' +
      '<g id="' + id + '-body">' +
      '<g id="' + id + '-armBw">' + arm('B') + '</g>' +
      '<g id="' + id + '-legBw">' + leg('B') + '</g>' +
      '<g id="' + id + '-legFw">' + leg('F') + '</g>' +
      '<g id="' + id + '-upper">' +
      torso +
      '<rect x="-12" y="-378" width="24" height="28" fill="' + L.skin + '" ' + sk(5) + '/>' +
      '<g id="' + id + '-head">' + headSvg(id, type, L) + '</g>' +
      '</g>' +
      '<g id="' + id + '-armFw">' + arm('F') + '</g>' +
      '</g></g>';
  }

  var ALL = [];
  function $(x) { return document.getElementById(x); }

  function create(svgEl, id, type, p) {
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = svg(id, type);
    svgEl.appendChild(g);
    var c = {
      id: id, type: type, seed: ALL.length * 1.73 + 0.4, root: $(id),
      body: $(id + '-body'), upper: $(id + '-upper'), head: $(id + '-head'), face: $(id + '-face'),
      eyes: $(id + '-eyes'), browL: $(id + '-browL'), browR: $(id + '-browR'), brows: $(id + '-brows'),
      mouths: [0, 1, 2, 3].map(function (i) { return $(id + '-mouths').querySelector('.m' + i); }),
      legF: $(id + '-legFw'), legB: $(id + '-legBw'), kneeF: $(id + '-kneeF'), kneeB: $(id + '-kneeB'),
      footF: $(id + '-footF'), footB: $(id + '-footB'),
      armF: $(id + '-armFw'), armB: $(id + '-armBw'), foreF: $(id + '-foreF'), foreB: $(id + '-foreB'),
      handF: $(id + '-handF'), handB: $(id + '-handB'), holdF: $(id + '-holdF'), holdB: $(id + '-holdB'),
      eyeY: type === 'worker' ? -420 : -428,
      p: Object.assign({
        x: 0, y: 0, s: 1, face: 1, op: 1, lean: 0, bob: 0, sy: 1,
        headRot: 0, headY: 0, lookX: 0, lookY: 0, brow: 0, worry: 0, mood: 0, blink: 1,
        armFu: REST.armFu, armFl: REST.armFl, handF: 0, armBu: REST.armBu, armBl: REST.armBl, handB: 0, shoulderY: 0,
        legF: 0, legB: 0, kneeF: 0, kneeB: 0, walkPhase: 0, walkAmp: 0
      }, p || {})
    };
    ALL.push(c);
    return c;
  }

  function rad(d) { return d * Math.PI / 180; }
  function f(n) { return n.toFixed(2); }
  function tr(el, x, y, r) { el.setAttribute('transform', 'translate(' + f(x) + ',' + f(y) + ') rotate(' + f(r) + ')'); }

  function drawOne(c, t) {
    var p = c.p, a = p.walkAmp, ph = p.walkPhase, sp = Math.sin(ph), cp = Math.cos(ph);
    /* Gehen: Hüfte schwingt, Knie beugt sich in der Schwungphase, Fuß bleibt waagerecht */
    var hipF = p.legF - a * 21 * sp, hipB = p.legB + a * 21 * sp;
    var kneeF = p.kneeF + a * (54 * Math.pow(Math.max(0, cp), 1.4) + 6 * Math.max(0, sp)),
      kneeB = p.kneeB + a * (54 * Math.pow(Math.max(0, -cp), 1.4) + 6 * Math.max(0, -sp));
    function reach(h, k) { return THIGH * Math.cos(rad(h)) + SHIN * Math.cos(rad(h + k)); }
    var drop = (THIGH + SHIN) - Math.max(reach(hipF, kneeF), reach(hipB, kneeB));
    /* Ruhe: Atmen und leichte Gewichtsverlagerung */
    var still = 1 - a;
    var breath = Math.sin(t * 1.75 + c.seed), sway = Math.sin(t * 1.13 + c.seed * 2.1);
    var lean = p.lean + a * 4 + sway * 0.7 * still;
    var swing = a * 17 * sp;

    c.root.setAttribute('transform', 'translate(' + f(p.x) + ',' + f(p.y) + ') scale(' + (p.s * p.face).toFixed(4) + ',' + (p.s * p.sy).toFixed(4) + ')');
    c.root.setAttribute('opacity', p.op);
    c.body.setAttribute('transform', 'translate(' + f(sway * 1.2 * still) + ',' + f(drop) + ')');
    tr(c.legF, 18, HIP, hipF); tr(c.kneeF, 0, THIGH, kneeF); tr(c.footF, 0, SHIN, -(hipF + kneeF));
    tr(c.legB, -18, HIP, hipB); tr(c.kneeB, 0, THIGH, kneeB); tr(c.footB, 0, SHIN, -(hipB + kneeB));
    c.upper.setAttribute('transform', 'translate(0,' + f(OFF + p.bob - breath * 1.4) + ') rotate(' + f(lean) + ',0,-194)');
    var sy = SHOULDER + OFF + p.bob + p.shoulderY - breath * 0.5;
    tr(c.armF, 36 + lean * 0.9, sy, p.armFu + swing);
    tr(c.foreF, 0, UPPER, p.armFl - a * (7 + 9 * Math.max(0, -sp)));
    tr(c.handF, 0, FORE, p.handF);
    tr(c.armB, -36 + lean * 0.9, sy, p.armBu - swing);
    tr(c.foreB, 0, UPPER, p.armBl - a * (7 + 9 * Math.max(0, sp)));
    tr(c.handB, 0, FORE, p.handB);
    c.head.setAttribute('transform', 'translate(0,' + f(p.headY - breath * 0.6) + ') rotate(' + f(p.headRot + sway * 0.8 * still - a * 2) + ',4,-380)');
    c.face.setAttribute('transform', 'translate(' + f(p.lookX) + ',' + f(p.lookY) + ')');
    /* Blinzeln: alle paar Sekunden, gelegentlich doppelt */
    var k = (t + c.seed * 1.9) % 4.1, bl = (k < 0.11 || (c.seed % 2 > 1 && k > 0.24 && k < 0.33)) ? 0.12 : 1;
    bl = Math.min(bl, p.blink);
    c.eyes.setAttribute('transform', 'translate(0,' + c.eyeY + ') scale(1,' + bl + ') translate(0,' + (-c.eyeY) + ')');
    var ey = c.eyeY, wr = p.worry * 14;
    c.brows.setAttribute('transform', 'translate(0,' + f(-p.brow * 5) + ')');
    c.browL.setAttribute('transform', 'rotate(' + f(-wr) + ',2,' + (ey - 15) + ')');
    c.browR.setAttribute('transform', 'rotate(' + f(wr) + ',41,' + (ey - 14) + ')');
    var m = Math.round(p.mood);
    for (var i = 0; i < 4; i++) c.mouths[i].setAttribute('display', i === m ? 'inline' : 'none');
  }

  function draw(t) { for (var i = 0; i < ALL.length; i++) drawOne(ALL[i], t); }

  /* Weltposition der vorderen Hand (für Handschlag und Übergaben) */
  function handPos(c) {
    var p = c.p, s = p.s, fc = p.face;
    var a1 = rad(p.armFu), a2 = rad(p.armFu + p.armFl);
    var x = 36 + p.lean * 0.9 - Math.sin(a1) * UPPER - Math.sin(a2) * (FORE + 12);
    var y = SHOULDER + OFF + p.bob + p.shoulderY + Math.cos(a1) * UPPER + Math.cos(a2) * (FORE + 12);
    return { x: p.x + x * s * fc, y: p.y + y * s * p.sy };
  }

  /* Gesten, gebunden an eine GSAP-Timeline */
  function gestures(tl) {
    var G = {};
    G.rest = function (c, t, d) {
      tl.to(c.p, { armFu: REST.armFu, armFl: REST.armFl, armBu: REST.armBu, armBl: REST.armBl, handF: 0, handB: 0, shoulderY: 0, lean: 0, headRot: 0, headY: 0, lookX: 0, lookY: 0, brow: 0, worry: 0, duration: d || 0.5, ease: 'power2.inOut' }, t);
    };
    /* Gehen: Schrittzahl passend zur Strecke, damit die Füße nicht rutschen */
    G.walk = function (c, t, toX, stepDur) {
      var from = c._x == null ? c.p.x : c._x, dist = Math.abs(toX - from);
      var stepLen = 2 * (THIGH + SHIN) * Math.sin(rad(21)) * c.p.s * 0.92;
      var steps = Math.max(2, Math.round(dist / stepLen)), sd = stepDur || 0.36, dur = steps * sd;
      tl.to(c.p, { x: toX, duration: dur, ease: 'none' }, t);
      tl.to(c.p, { walkPhase: '+=' + (Math.PI * steps).toFixed(4), duration: dur, ease: 'none' }, t);
      tl.to(c.p, { walkAmp: 1, duration: sd * 0.6, ease: 'sine.out' }, t);
      tl.to(c.p, { walkAmp: 0, duration: sd * 0.8, ease: 'sine.inOut' }, t + dur - sd * 0.8);
      c._x = toX;
      return dur;
    };
    G.turn = function (c, t, face) {
      tl.to(c.p, { headRot: -4, duration: 0.08, ease: 'sine.in' }, t - 0.08);
      tl.set(c.p, { face: face }, t);
      tl.to(c.p, { headRot: 0, duration: 0.25, ease: 'sine.out' }, t);
    };
    /* Winken: Arm seitlich hoch, Unterarm schwingt, Hand schwingt nach */
    G.wave = function (c, t, n) {
      n = n || 2;
      tl.to(c.p, { armFu: 2, duration: 0.1, ease: 'sine.inOut' }, t);
      tl.to(c.p, { armFu: -118, armFl: -62, handF: -8, headRot: 3, lean: -1.5, brow: 0.6, mood: 1, duration: 0.38, ease: 'back.out(1.3)' }, t + 0.1);
      var t1 = t + 0.48;
      for (var i = 0; i < n; i++) {
        tl.to(c.p, { armFl: -34, armFu: -114, handF: 14, duration: 0.19, ease: 'sine.inOut' }, t1 + i * 0.38);
        tl.to(c.p, { armFl: -74, armFu: -121, handF: -14, duration: 0.19, ease: 'sine.inOut' }, t1 + i * 0.38 + 0.19);
      }
      var te = t1 + n * 0.38;
      tl.to(c.p, { armFu: REST.armFu, headRot: 0, lean: 0, brow: 0, mood: 0, duration: 0.5, ease: 'power2.inOut' }, te);
      tl.to(c.p, { armFl: REST.armFl, handF: 0, duration: 0.55, ease: 'power2.inOut' }, te + 0.07);
      return te + 0.6;
    };
    G.nod = function (c, t, n) {
      n = n || 2;
      for (var i = 0; i < n; i++) {
        tl.to(c.p, { headRot: 7, headY: 2, duration: 0.17, ease: 'sine.inOut' }, t + i * 0.36);
        tl.to(c.p, { headRot: -1.5, headY: 0, duration: 0.19, ease: 'sine.inOut' }, t + i * 0.36 + 0.17);
      }
      tl.to(c.p, { headRot: 0, duration: 0.25, ease: 'sine.out' }, t + n * 0.36);
    };
    G.shrug = function (c, t, hold) {
      tl.to(c.p, { shoulderY: -8, armFu: -24, armFl: -82, handF: -30, armBu: 24, armBl: 82, handB: 30, headRot: 9, worry: 1, brow: 0.4, mood: 2, duration: 0.32, ease: 'back.out(1.6)' }, t);
      tl.to(c.p, { shoulderY: 0, armFu: REST.armFu, armFl: REST.armFl, handF: 0, armBu: REST.armBu, armBl: REST.armBl, handB: 0, headRot: 4, brow: 0, duration: 0.45, ease: 'power2.inOut' }, t + 0.32 + (hold || 0.5));
    };
    G.point = function (c, t, up) {
      tl.to(c.p, { armFu: -80 - (up || 0), armFl: -12, handF: -12, lean: 2, duration: 0.35, ease: 'back.out(1.5)' }, t);
    };
    G.hold = function (c, t) {
      tl.to(c.p, { armFu: -38, armFl: -78, handF: -6, duration: 0.4, ease: 'power2.out' }, t);
    };
    G.reachUp = function (c, t) {
      tl.to(c.p, { armFu: -132, armFl: -22, handF: -10, armBu: -120, armBl: -18, handB: -10, lookY: -3, headRot: -7, brow: 0.8, mood: 3, duration: 0.35, ease: 'back.out(1.4)' }, t);
    };
    G.toChest = function (c, t) {
      tl.to(c.p, { armFu: -26, armFl: -84, handF: -10, armBu: -20, armBl: -88, handB: -10, lookY: 3, headRot: 5, brow: 0.3, mood: 1, duration: 0.45, ease: 'power2.inOut' }, t);
    };
    G.shake = function (c, t, n) {
      tl.to(c.p, { armFu: -62, armFl: -26, handF: -80, lean: 2.5, mood: 1, duration: 0.35, ease: 'power2.out' }, t);
      for (var i = 0; i < (n || 2); i++) {
        tl.to(c.p, { armFl: -16, duration: 0.14, ease: 'sine.inOut' }, t + 0.38 + i * 0.28);
        tl.to(c.p, { armFl: -32, duration: 0.14, ease: 'sine.inOut' }, t + 0.52 + i * 0.28);
      }
    };
    G.enter = function (c, t) {
      tl.fromTo(c.p, { op: 0, bob: 18 }, { op: 1, bob: 0, duration: 0.5, ease: 'power2.out' }, t);
    };
    G.mood = function (c, t, m, extra) {
      tl.to(c.p, Object.assign({ mood: m, duration: 0.01 }, extra || {}), t);
    };
    return G;
  }

  global.Figuren = { create: create, draw: draw, gestures: gestures, handPos: handPos, REST: REST, all: ALL };
})(window);
