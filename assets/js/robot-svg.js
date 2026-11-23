/**
 * robot-svg.js — CADANGAN 2D (dipakai bila WebGL tidak tersedia) untuk maskot "Jebat" (SVG) yang interaktif & mengikuti kursor.
 * Gaya: helm krom, visor kaca gelap, mata LED biru — gagah tapi tetap lucu.
 *
 *   const bot = HJRobot.mount(el, { size: 260, bubble: true });
 *   bot.setMood('idle' | 'happy' | 'sad' | 'think' | 'wow' | 'shy' | 'peek');
 *   bot.say('Halo!');           // gelembung bicara (bila bubble: true)
 *   bot.lookAt(elemen | null);  // arahkan pandangan ke elemen, null = ikuti kursor
 *   bot.celebrate(); bot.shake();
 *
 * Gerak: mengikuti kursor dengan pelembutan (lerp), kedip acak, antena & inti dada berdenyut.
 * Hormati prefers-reduced-motion (robot diam, ekspresi tetap berganti).
 * Reaksi lompat/geleng memakai Motion (window.Motion) bila tersedia.
 */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const M = window.Motion || null;
  let uid = 0;

  // Mata & mulut per ekspresi (koordinat di dalam visor; mata kiri di 98,109, kanan di 142,109)
  const EYE = 'fill="url(#{id}-led)" filter="url(#{id}-glow)"';
  const FACES = {
    idle: {
      eyes: `<rect class="r-eye" x="90" y="98" width="16" height="22" rx="8" ${EYE}/><rect class="r-eye" x="134" y="98" width="16" height="22" rx="8" ${EYE}/>`,
      mouth: '<rect x="112" y="128" width="16" height="3" rx="1.5" fill="#7FD8FF" opacity=".8"/>',
    },
    happy: {
      eyes: `<path d="M89 113 Q98 100 107 113" stroke="#9FE8FF" stroke-width="5" fill="none" stroke-linecap="round" filter="url(#{id}-glow)"/><path d="M133 113 Q142 100 151 113" stroke="#9FE8FF" stroke-width="5" fill="none" stroke-linecap="round" filter="url(#{id}-glow)"/>`,
      mouth: '<path d="M109 125 Q120 135 131 125" stroke="#7FD8FF" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
      blush: true,
    },
    sad: {
      eyes: `<rect class="r-eye" x="90" y="104" width="16" height="16" rx="8" ${EYE}/><rect class="r-eye" x="134" y="104" width="16" height="16" rx="8" ${EYE}/><path d="M88 99 L106 95" stroke="#7FD8FF" stroke-width="3" stroke-linecap="round"/><path d="M152 99 L134 95" stroke="#7FD8FF" stroke-width="3" stroke-linecap="round"/>`,
      mouth: '<path d="M110 132 Q120 124 130 132" stroke="#7FD8FF" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
    },
    think: {
      eyes: `<rect class="r-eye" x="90" y="98" width="16" height="22" rx="8" ${EYE}/><rect x="134" y="108" width="16" height="5" rx="2.5" ${EYE}/>`,
      mouth: '<rect x="114" y="128" width="12" height="3" rx="1.5" fill="#7FD8FF" opacity=".8" transform="rotate(-8 120 129)"/>',
    },
    wow: {
      eyes: `<circle cx="98" cy="109" r="10" fill="none" stroke="#9FE8FF" stroke-width="4.5" filter="url(#{id}-glow)"/><circle cx="142" cy="109" r="10" fill="none" stroke="#9FE8FF" stroke-width="4.5" filter="url(#{id}-glow)"/>`,
      mouth: '<ellipse cx="120" cy="130" rx="4" ry="5" fill="#7FD8FF"/>',
    },
    shy: {
      eyes: `<path d="M90 106 L104 112 L90 118" stroke="#9FE8FF" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#{id}-glow)"/><path d="M150 106 L136 112 L150 118" stroke="#9FE8FF" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#{id}-glow)"/>`,
      mouth: '<path d="M112 128 Q120 133 128 128" stroke="#7FD8FF" stroke-width="3" fill="none" stroke-linecap="round"/>',
      blush: true,
      hands: true,
    },
    peek: {
      eyes: `<circle cx="98" cy="109" r="10" fill="none" stroke="#9FE8FF" stroke-width="4.5" filter="url(#{id}-glow)"/><rect class="r-eye" x="134" y="98" width="16" height="22" rx="8" ${EYE}/>`,
      mouth: '<ellipse cx="120" cy="130" rx="4" ry="4.5" fill="#7FD8FF"/>',
      blush: true,
      hands: 'peek',
    },
  };
  // Alias dari ekspresi maskot lama
  FACES.wave = FACES.happy;

  function svgMarkup(id) {
    return `
<svg class="hj-robot__svg" viewBox="0 0 240 290" width="100%" height="100%" aria-hidden="true" focusable="false" xmlns="${NS}">
  <defs>
    <linearGradient id="${id}-chrome" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset=".22" stop-color="#C9D0E0"/><stop offset=".45" stop-color="#F3F5FB"/>
      <stop offset=".68" stop-color="#8D96AE"/><stop offset=".86" stop-color="#E4E8F2"/><stop offset="1" stop-color="#A7AFC4"/>
    </linearGradient>
    <linearGradient id="${id}-steel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3A4360"/><stop offset="1" stop-color="#151A2E"/>
    </linearGradient>
    <linearGradient id="${id}-visor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#141A33"/><stop offset=".6" stop-color="#070A16"/><stop offset="1" stop-color="#101632"/>
    </linearGradient>
    <linearGradient id="${id}-led" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#E6FBFF"/><stop offset=".5" stop-color="#8FE3FF"/><stop offset="1" stop-color="#4D8BFF"/>
    </linearGradient>
    <radialGradient id="${id}-core" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset=".35" stop-color="#9FB2FF"/><stop offset="1" stop-color="#2340FF" stop-opacity="0"/>
    </radialGradient>
    <filter id="${id}-glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="${id}-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
    <clipPath id="${id}-visorclip"><rect x="64" y="78" width="112" height="62" rx="28"/></clipPath>
  </defs>

  <ellipse class="r-shadow" cx="120" cy="280" rx="62" ry="7" fill="#000" opacity=".45" filter="url(#${id}-soft)"/>

  <g class="r-all">
    <!-- Badan -->
    <g class="r-body">
      <path d="M74 168 H166 Q178 168 180 180 L188 246 Q190 262 174 262 H66 Q50 262 52 246 L60 180 Q62 168 74 168 Z" fill="url(#${id}-chrome)"/>
      <path d="M82 180 H158 Q166 180 167 188 L172 238 Q173 248 163 248 H77 Q67 248 68 238 L73 188 Q74 180 82 180 Z" fill="url(#${id}-steel)"/>
      <circle class="r-core-halo" cx="120" cy="212" r="22" fill="url(#${id}-core)" opacity=".55"/>
      <circle cx="120" cy="212" r="11" fill="#0A0E1C" stroke="#5B74FF" stroke-width="2"/>
      <circle class="r-core" cx="120" cy="212" r="6" fill="#BFD0FF" filter="url(#${id}-glow)"/>
      <g stroke="#5B74FF" stroke-width="2" stroke-linecap="round" opacity=".7">
        <line x1="86" y1="236" x2="100" y2="236"/><line x1="140" y1="236" x2="154" y2="236"/>
        <line x1="86" y1="194" x2="96" y2="194"/><line x1="144" y1="194" x2="154" y2="194"/>
      </g>
      <path d="M70 175 Q120 166 170 175" stroke="#fff" stroke-width="2" opacity=".6" fill="none"/>
    </g>
    <!-- Leher -->
    <rect x="106" y="150" width="28" height="22" rx="6" fill="url(#${id}-steel)"/>
    <rect x="106" y="157" width="28" height="3" fill="#5B74FF" opacity=".6"/>

    <!-- Kepala -->
    <g class="r-head">
      <g class="r-antenna">
        <line x1="120" y1="54" x2="120" y2="30" stroke="url(#${id}-chrome)" stroke-width="5" stroke-linecap="round"/>
        <circle class="r-antenna-tip" cx="120" cy="26" r="7" fill="#8FE3FF" filter="url(#${id}-glow)"/>
      </g>
      <rect x="40" y="92" width="18" height="40" rx="8" fill="url(#${id}-steel)"/>
      <rect x="182" y="92" width="18" height="40" rx="8" fill="url(#${id}-steel)"/>
      <rect x="45" y="104" width="8" height="16" rx="4" fill="#5B74FF" opacity=".85"/>
      <rect x="187" y="104" width="8" height="16" rx="4" fill="#5B74FF" opacity=".85"/>
      <rect x="52" y="50" width="136" height="106" rx="46" fill="url(#${id}-chrome)"/>
      <path d="M78 60 Q120 44 162 60" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".75"/>
      <path d="M60 128 Q62 150 92 154" stroke="#6B7390" stroke-width="2" fill="none" opacity=".5"/>
      <rect x="64" y="78" width="112" height="62" rx="28" fill="url(#${id}-visor)" stroke="#5B74FF" stroke-opacity=".55" stroke-width="2"/>
      <g clip-path="url(#${id}-visorclip)">
        <g class="r-face">
          <g class="r-blush" opacity="0">
            <ellipse cx="84" cy="124" rx="7" ry="3.5" fill="#7C8CFF" opacity=".55"/>
            <ellipse cx="156" cy="124" rx="7" ry="3.5" fill="#7C8CFF" opacity=".55"/>
          </g>
          <g class="r-eyes"></g>
          <g class="r-mouth"></g>
        </g>
        <path d="M70 92 L104 80 L120 80 L80 138 L70 138 Z" fill="#fff" opacity=".06"/>
      </g>
    </g>

    <!-- Lengan (di depan kepala agar bisa menutup visor) -->
    <g class="r-arm r-arm--l">
      <circle cx="58" cy="182" r="13" fill="url(#${id}-chrome)"/>
      <rect x="50" y="184" width="16" height="56" rx="8" fill="url(#${id}-steel)"/>
      <circle cx="58" cy="248" r="15" fill="url(#${id}-chrome)" stroke="#6B7390" stroke-opacity=".5"/>
      <path d="M51 242 Q58 236 65 242" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".8"/>
    </g>
    <g class="r-arm r-arm--r">
      <circle cx="182" cy="182" r="13" fill="url(#${id}-chrome)"/>
      <rect x="174" y="184" width="16" height="56" rx="8" fill="url(#${id}-steel)"/>
      <circle cx="182" cy="248" r="15" fill="url(#${id}-chrome)" stroke="#6B7390" stroke-opacity=".5"/>
      <path d="M175 242 Q182 236 189 242" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".8"/>
    </g>
  </g>
</svg>`;
  }

  function mount(host, opts) {
    if (!host) return null;
    const o = Object.assign({ size: 200, bubble: false, mood: 'idle' }, opts || {});
    const id = `hjr${++uid}`;
    host.classList.add('hj-robot');
    host.style.setProperty('--size', `${o.size}px`);
    host.innerHTML = `${o.bubble ? '<div class="hj-robot__bubble" aria-hidden="true"></div>' : ''}<div class="hj-robot__stage">${svgMarkup(id)}</div>`;
    const svg = host.querySelector('svg');
    const q = (s) => svg.querySelector(s);
    const all = q('.r-all'), head = q('.r-head'), face = q('.r-face'), body = q('.r-body');
    const eyes = q('.r-eyes'), mouth = q('.r-mouth'), blush = q('.r-blush');
    const armL = q('.r-arm--l'), armR = q('.r-arm--r');
    const bubble = host.querySelector('.hj-robot__bubble');
    let mood = '';
    let target = null; // elemen yang sedang dilihat
    let px = 0, py = 0, cx = 0, cy = 0; // arah pandang target & sekarang (-1..1)
    let pointerActive = false;
    let raf = 0, visible = true, bubbleTimer = 0;

    // Lengan: pivot di bahu, sudut dalam derajat
    const arm = { l: 0, r: 0, tl: 8, tr: -8, ll: 0, lr: 0, tll: 0, tlr: 0 };
    function setArms(kind) {
      // tl/tr = sudut lengan; tll/tlr = angkat bahu (px) agar tangan sampai ke visor
      if (kind === true) { arm.tl = -146; arm.tr = 146; arm.tll = -14; arm.tlr = -14; } // tutup visor
      else if (kind === 'peek') { arm.tl = -146; arm.tr = -8; arm.tll = -14; arm.tlr = 0; } // satu tangan turun
      else if (kind === 'wave') { arm.tl = 8; arm.tr = -150; arm.tll = 0; arm.tlr = 0; } // melambai
      else { arm.tl = 8; arm.tr = -8; arm.tll = 0; arm.tlr = 0; }
    }

    function setMood(m) {
      const key = FACES[m] ? m : 'idle';
      if (key === mood) return;
      mood = key;
      const f = FACES[key];
      eyes.innerHTML = f.eyes.replace(/\{id\}/g, id);
      mouth.innerHTML = f.mouth;
      blush.setAttribute('opacity', f.blush ? '1' : '0');
      setArms(f.hands || false);
      if (M && !reduced) M.animate(eyes, { scaleY: [0.4, 1] }, { duration: 0.25, ease: 'easeOut' });
      if (reduced) paint(1);
      else wake(); // jalankan animasi lengan/mata meski kursor diam
    }

    function say(text, ms) {
      if (!bubble || !text) return;
      bubble.textContent = text;
      bubble.classList.add('is-on');
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => bubble.classList.remove('is-on'), ms || 2600);
      if (M && !reduced) M.animate(bubble, { scale: [0.85, 1], y: [6, 0] }, { type: 'spring', stiffness: 380, damping: 20 });
    }

    function celebrate() {
      setArms('wave');
      setTimeout(() => { if (!FACES[mood].hands) setArms(false); }, 900);
      if (M && !reduced) {
        M.animate(host.querySelector('.hj-robot__stage'), { y: [0, -22, 0, -8, 0] }, { duration: 0.9, ease: 'easeOut' });
        M.animate(q('.r-antenna'), { rotate: [0, -18, 14, -6, 0] }, { duration: 0.9 });
      }
    }
    function shake() {
      if (M && !reduced) M.animate(head, { x: [0, -7, 7, -5, 5, 0] }, { duration: 0.5, ease: 'easeInOut' });
    }

    // Kedip acak (hanya mata berbentuk persegi)
    function blinkLoop() {
      if (reduced) return;
      setTimeout(() => {
        const e = eyes.querySelectorAll('.r-eye');
        if (e.length && visible) {
          e.forEach((el) => el.classList.add('is-blink'));
          setTimeout(() => e.forEach((el) => el.classList.remove('is-blink')), 130);
        }
        blinkLoop();
      }, 2200 + Math.random() * 3200);
    }

    // Arah pandang
    function aimFrom(x, y) {
      const r = svg.getBoundingClientRect();
      const hx = r.left + r.width / 2, hy = r.top + r.height * 0.38;
      const dx = x - hx, dy = y - hy;
      const reach = Math.max(260, r.width * 1.4);
      px = Math.max(-1, Math.min(1, dx / reach));
      py = Math.max(-1, Math.min(1, dy / reach));
    }
    function onMove(e) {
      pointerActive = true;
      if (!target) aimFrom(e.clientX, e.clientY);
      wake();
    }
    function onLeave() { pointerActive = false; if (!target) { px = 0; py = 0; } wake(); }

    function paint(k) {
      cx += (px - cx) * k; cy += (py - cy) * k;
      arm.l += (arm.tl - arm.l) * Math.min(1, k * 1.6);
      arm.r += (arm.tr - arm.r) * Math.min(1, k * 1.6);
      arm.ll += (arm.tll - arm.ll) * Math.min(1, k * 1.6);
      arm.lr += (arm.tlr - arm.lr) * Math.min(1, k * 1.6);
      const covering = FACES[mood] && FACES[mood].hands;
      const ex = covering ? 0 : cx * 10, ey = covering ? 0 : cy * 6;
      face.setAttribute('transform', `translate(${ex.toFixed(2)} ${ey.toFixed(2)})`);
      head.setAttribute('transform', `translate(${(cx * 5).toFixed(2)} ${(cy * 3).toFixed(2)}) rotate(${(cx * 7).toFixed(2)} 120 150)`);
      body.setAttribute('transform', `rotate(${(cx * 2).toFixed(2)} 120 262)`);
      armL.setAttribute('transform', `translate(0 ${arm.ll.toFixed(2)}) rotate(${arm.l.toFixed(2)} 58 182)`);
      armR.setAttribute('transform', `translate(0 ${arm.lr.toFixed(2)}) rotate(${arm.r.toFixed(2)} 182 182)`);
      return Math.abs(px - cx) + Math.abs(py - cy) + Math.abs(arm.tl - arm.l) / 90 + Math.abs(arm.tr - arm.r) / 90;
    }
    let lastT = 0;
    function frame(now) {
      raf = 0;
      if (!visible || document.hidden) return;
      if (target) {
        const r = target.getBoundingClientRect();
        aimFrom(r.left + Math.min(r.width, 160) * 0.6, r.top + r.height / 2);
      }
      const dt = lastT ? Math.min(0.1, (now - lastT) / 1000) : 1 / 60;
      lastT = now;
      const rest = paint(1 - Math.pow(0.88, dt * 60)); // pelembutan berbasis waktu
      if (rest > 0.002 || target) raf = requestAnimationFrame(frame);
      else lastT = 0;
    }
    function wake() { if (!raf && !reduced) raf = requestAnimationFrame(frame); }

    function lookAt(el) { target = el || null; if (!target && !pointerActive) { px = 0; py = 0; } wake(); }

    setMood(o.mood);
    paint(1);
    if (!reduced) {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeave);
      new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); if (visible) wake(); }).observe(host);
      blinkLoop();
    }

    // Klik/ketuk robot: reaksi + kalimat
    const LINES = o.lines || ['Halo, aku Jebat!', 'Siap naik level hari ini?', 'Klik aku lagi, seru kan?', 'Belajar dikit-dikit, lama-lama jadi jago.'];
    let li = 0;
    host.addEventListener('click', () => {
      const prev = mood;
      setMood('happy');
      celebrate();
      say(LINES[li++ % LINES.length]);
      if (window.X && X.sfx) X.sfx.pop();
      setTimeout(() => { if (mood === 'happy') setMood(prev === 'happy' ? 'idle' : prev); }, 1400);
    });

    return { setMood, say, lookAt, celebrate, shake, get mood() { return mood; } };
  }

  /** Gabungkan beberapa robot agar bereaksi bersamaan. */
  function group(list) {
    const bots = list.filter(Boolean);
    const call = (fn, ...a) => bots.forEach((b) => b[fn](...a));
    return {
      setMood: (m) => call('setMood', m),
      say: (t, ms) => call('say', t, ms),
      lookAt: (el) => call('lookAt', el),
      celebrate: () => call('celebrate'),
      shake: () => call('shake'),
    };
  }

  window.HJRobotSVG = { mount, group };
})();
