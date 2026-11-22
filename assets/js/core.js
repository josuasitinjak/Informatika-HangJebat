/**
 * XAVETRA — Platform Pembelajaran Informatika Fase F
 * SMAN 1 Batam • Kelas XI HJ 5
 *
 * core.js — fondasi bersama semua halaman:
 *  - utilitas aman (escape HTML, redirect aman)
 *  - progres belajar per akun (XP, level, streak, lencana)
 *  - efek suara (Web Audio), confetti, toast, popup XP, level-up
 *  - animasi scroll-reveal, count-up, tilt
 *  - sidebar navigasi terpadu (satu sumber untuk semua halaman)
 *  - maskot "Xavi" (SVG animasi)
 *  - jembatan cloud (Google Apps Script v2, opsional)
 */
(function () {
  'use strict';

  // ───────────────────────── Utilitas dasar ─────────────────────────
  const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  function esc(v) {
    if (v === null || v === undefined) return '';
    return String(v).replace(/[&<>"']/g, (m) => ESC_MAP[m]);
  }

  /** Hanya izinkan redirect ke halaman .html lokal (mencegah javascript:/situs luar). */
  function safeRedirect(target, fallback) {
    const fb = fallback || 'dashboard.html';
    if (!target || typeof target !== 'string') return fb;
    const t = target.trim();
    if (/^[a-z0-9_-]+\.html(\?[a-z0-9_=&%.-]*)?(#[a-z0-9_-]*)?$/i.test(t)) return t;
    return fb;
  }

  function readJSON(key, def) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : def;
    } catch (e) {
      return def;
    }
  }
  function writeJSON(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (e) {
      console.warn('Penyimpanan penuh / gagal:', e);
      return false;
    }
  }

  function getUser() {
    return readJSON('xavetra_user', null);
  }
  function isGuru(user) {
    const u = user || getUser();
    if (!u) return false;
    const r = String(u.role || '').toLowerCase();
    return r.includes('guru') || r.includes('admin') || r.includes('pengajar');
  }
  function initials(name) {
    if (!name) return 'XI';
    const parts = String(name).trim().split(/\s+/);
    return ((parts[0] || '')[0] + ((parts[1] || '')[0] || (parts[0] || '')[1] || '')).toUpperCase();
  }
  function firstName(name) {
    return String(name || 'Siswa').trim().split(/\s+/)[0];
  }
  function todayKey(d) {
    const x = d || new Date();
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  }

  // ───────────────────────── Progres per akun ─────────────────────────
  const LEVELS = [
    { min: 0, title: 'Netizen Pemula', icon: '🌱' },
    { min: 100, title: 'Penjelajah Web', icon: '🧭' },
    { min: 250, title: 'Pencari Cerdas', icon: '🔎' },
    { min: 450, title: 'Detektif Data', icon: '🕵️' },
    { min: 700, title: 'Analis Digital', icon: '📊' },
    { min: 1000, title: 'Master Riset', icon: '🧠' },
    { min: 1400, title: 'Penjaga Etika Siber', icon: '🛡️' },
    { min: 1900, title: 'Legenda Informatika', icon: '👑' },
  ];

  const BADGES = {
    first_step: { name: 'Langkah Pertama', icon: '🚀', desc: 'Menyelesaikan langkah pelajaran pertama.' },
    bab_done: { name: 'Bab Tuntas', icon: '📘', desc: 'Menuntaskan satu bab penuh.' },
    all_bab: { name: 'Tamat Kurikulum', icon: '🎓', desc: 'Menuntaskan keempat bab inti.' },
    perfect: { name: 'Nilai Sempurna', icon: '💯', desc: 'Meraih skor 100 pada kuis.' },
    combo5: { name: 'Combo x5', icon: '🔥', desc: 'Menjawab 5 soal benar berturut-turut.' },
    streak3: { name: 'Konsisten 3 Hari', icon: '📅', desc: 'Belajar 3 hari berturut-turut.' },
    detective: { name: 'Detektif Query', icon: '🕵️', desc: 'Menyelesaikan 5 misi simulator.' },
    note_taker: { name: 'Rajin Mencatat', icon: '📝', desc: 'Menyimpan 3 catatan belajar.' },
    hoax_buster: { name: 'Pemburu Hoaks', icon: '🧯', desc: 'Menyelesaikan permainan Fakta atau Hoaks tanpa salah.' },
    speedrun: { name: 'Si Kilat', icon: '⚡', desc: 'Menyelesaikan mode Tantangan dengan skor ≥ 80.' },
  };

  function progressKey() {
    const u = getUser();
    const id = u && u.username ? String(u.username).toLowerCase() : 'tamu';
    return `xavetra_progress_v2::${id}`;
  }
  function defaultProgress() {
    return { xp: 0, lessons: {}, quizzes: {}, streak: { count: 0, last: null }, badges: [], sim: { missions: [] }, activity: [] };
  }
  function getProgress() {
    const p = readJSON(progressKey(), null);
    if (!p) return defaultProgress();
    const d = defaultProgress();
    return Object.assign(d, p, { streak: Object.assign(d.streak, p.streak || {}), sim: Object.assign(d.sim, p.sim || {}) });
  }
  function saveProgress(p) {
    writeJSON(progressKey(), p);
    document.dispatchEvent(new CustomEvent('x:progress', { detail: p }));
  }

  function levelInfo(xp) {
    let idx = 0;
    for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].min) idx = i;
    const cur = LEVELS[idx];
    const next = LEVELS[idx + 1];
    const pct = next ? Math.round(((xp - cur.min) / (next.min - cur.min)) * 100) : 100;
    return { level: idx + 1, title: cur.title, icon: cur.icon, xp, nextAt: next ? next.min : null, pct, toNext: next ? next.min - xp : 0 };
  }

  function touchStreak(p) {
    const today = todayKey();
    if (p.streak.last === today) return false;
    const y = new Date();
    y.setDate(y.getDate() - 1);
    p.streak.count = p.streak.last === todayKey(y) ? p.streak.count + 1 : 1;
    p.streak.last = today;
    return true;
  }

  function logActivity(p, text, icon) {
    p.activity = p.activity || [];
    p.activity.unshift({ t: Date.now(), text, icon: icon || 'bolt' });
    p.activity = p.activity.slice(0, 12);
  }

  /** Tambah XP + animasi popup. Mengembalikan objek progres terbaru. */
  function addXP(amount, reason, anchorEl) {
    const p = getProgress();
    const before = levelInfo(p.xp).level;
    p.xp = Math.max(0, (p.xp || 0) + amount);
    const tk = todayKey();
    if (!p.daily || p.daily.d !== tk) p.daily = { d: tk, xp: 0 };
    p.daily.xp += Math.max(0, amount);
    touchStreak(p);
    if (reason) logActivity(p, `${reason} (+${amount} XP)`, 'bolt');
    if (p.streak.count >= 3) grantBadge('streak3', p, true);
    saveProgress(p);
    if (amount > 0) floatXP(amount, anchorEl);
    const after = levelInfo(p.xp);
    if (after.level > before) setTimeout(() => showLevelUp(after), 650);
    refreshShell();
    return p;
  }

  function grantBadge(id, pIn, silent) {
    const p = pIn || getProgress();
    if (!BADGES[id] || p.badges.includes(id)) return false;
    p.badges.push(id);
    logActivity(p, `Lencana baru: ${BADGES[id].name}`, 'military_tech');
    if (!pIn) saveProgress(p);
    if (!silent || pIn) {
      setTimeout(() => {
        toast(`${BADGES[id].icon} Lencana baru terbuka: <b>${esc(BADGES[id].name)}</b>`, 'badge');
        sfx.badge();
      }, 400);
    }
    return true;
  }

  function markLessonStep(chapId, stepIdx, totalSteps) {
    const p = getProgress();
    const l = p.lessons[chapId] || { done: [], completed: false };
    let fresh = false;
    if (!l.done.includes(stepIdx)) {
      l.done.push(stepIdx);
      fresh = true;
    }
    let justCompleted = false;
    if (!l.completed && totalSteps && l.done.length >= totalSteps) {
      l.completed = true;
      justCompleted = true;
    }
    l.updated = Date.now();
    p.lessons[chapId] = l;
    saveProgress(p);
    if (fresh) grantBadge('first_step');
    if (justCompleted) {
      grantBadge('bab_done');
      const all = ['bab1', 'bab2', 'bab3', 'bab4'].every((id) => (getProgress().lessons[id] || {}).completed);
      if (all) grantBadge('all_bab');
    }
    return { fresh, justCompleted };
  }

  function recordQuiz(key, result) {
    const p = getProgress();
    const q = p.quizzes[key] || { best: 0, last: 0, attempts: 0, history: [] };
    q.attempts += 1;
    q.last = result.score;
    q.best = Math.max(q.best, result.score);
    q.history.unshift({ t: Date.now(), score: result.score, correct: result.correct, total: result.total, mode: result.mode });
    q.history = q.history.slice(0, 10);
    p.quizzes[key] = q;
    logActivity(p, `Kuis ${result.label || key}: skor ${result.score}`, 'quiz');
    saveProgress(p);
    // Kompatibilitas: metrik "Nilai Kuis Terakhir" lama
    try { localStorage.setItem('xavetra_quiz_score', String(result.score)); } catch (e) {}
    if (result.score === 100) grantBadge('perfect');
    if (result.mode === 'challenge' && result.score >= 80) grantBadge('speedrun');
    cloud.saveScore(key, result);
    return q;
  }

  // ───────────────────────── Efek suara (Web Audio) ─────────────────────────
  let audioCtx = null;
  function soundOn() {
    return localStorage.getItem('xavetra_sound') !== 'off';
  }
  function ctx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return audioCtx;
  }
  function tone(freq, start, dur, type, vol) {
    const c = ctx();
    if (!c) return;
    const t0 = c.currentTime + (start || 0);
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  const sfx = {
    enabled: soundOn,
    toggle() {
      const next = soundOn() ? 'off' : 'on';
      localStorage.setItem('xavetra_sound', next);
      refreshShell();
      if (next === 'on') sfx.click();
      return next === 'on';
    },
    play(fn) { if (soundOn()) { try { fn(); } catch (e) {} } },
    click() { sfx.play(() => tone(660, 0, 0.06, 'triangle', 0.06)); },
    pop() { sfx.play(() => { tone(520, 0, 0.08, 'sine', 0.09); tone(880, 0.05, 0.08, 'sine', 0.07); }); },
    correct() { sfx.play(() => { tone(659.25, 0, 0.12, 'triangle', 0.12); tone(987.77, 0.09, 0.2, 'triangle', 0.12); }); },
    wrong() { sfx.play(() => { tone(220, 0, 0.18, 'sawtooth', 0.05); tone(174.6, 0.12, 0.25, 'sawtooth', 0.05); }); },
    tick() { sfx.play(() => tone(1200, 0, 0.03, 'square', 0.025)); },
    whoosh() { sfx.play(() => { tone(300, 0, 0.12, 'sine', 0.04); tone(600, 0.04, 0.12, 'sine', 0.03); }); },
    badge() { sfx.play(() => [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.08, 0.25, 'triangle', 0.09))); },
    win() { sfx.play(() => [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, i * 0.11, 0.35, 'triangle', 0.1))); },
    levelUp() { sfx.play(() => [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.4, 'square', 0.05))); },
  };

  // ───────────────────────── Confetti ─────────────────────────
  function confetti(opts) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const o = Object.assign({ count: 140, spread: 1, originX: 0.5, originY: 0.35, duration: 2600 }, opts || {});
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
    document.body.appendChild(canvas);
    const c2d = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = (canvas.width = innerWidth * dpr);
    const H = (canvas.height = innerHeight * dpr);
    const colors = ['#1F6BFF', '#7C3AED', '#06B6D4', '#FF7A2F', '#10B981', '#F59E0B', '#EC4899'];
    const parts = [];
    for (let i = 0; i < o.count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9 * o.spread;
      const speed = (7 + Math.random() * 9) * dpr;
      parts.push({
        x: W * o.originX, y: H * o.originY,
        vx: Math.cos(angle) * speed * (0.6 + Math.random()),
        vy: Math.sin(angle) * speed,
        w: (6 + Math.random() * 6) * dpr, h: (8 + Math.random() * 8) * dpr,
        r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.35,
        color: colors[(Math.random() * colors.length) | 0],
        shape: Math.random() > 0.7 ? 'circle' : 'rect',
      });
    }
    const start = performance.now();
    function frame(now) {
      const t = now - start;
      c2d.clearRect(0, 0, W, H);
      parts.forEach((p) => {
        p.vy += 0.32 * dpr;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        c2d.save();
        c2d.globalAlpha = Math.max(0, 1 - t / o.duration);
        c2d.translate(p.x, p.y);
        c2d.rotate(p.r);
        c2d.fillStyle = p.color;
        if (p.shape === 'circle') {
          c2d.beginPath();
          c2d.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          c2d.fill();
        } else {
          c2d.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)));
        }
        c2d.restore();
      });
      if (t < o.duration) requestAnimationFrame(frame);
      else canvas.remove();
    }
    requestAnimationFrame(frame);
  }

  // ───────────────────────── Toast, XP popup, level-up ─────────────────────────
  function toast(html, type) {
    let stack = document.getElementById('x-toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'x-toast-stack';
      document.body.appendChild(stack);
    }
    const colors = { success: '#10B981', alert: '#EF4444', error: '#EF4444', warning: '#F59E0B', info: '#1F6BFF', badge: '#F59E0B' };
    const el = document.createElement('div');
    el.className = 'x-toast';
    el.setAttribute('role', 'status');
    el.innerHTML = `<span style="width:10px;height:10px;border-radius:99px;flex-shrink:0;background:${colors[type] || colors.success}"></span><span style="line-height:1.4">${html}</span>`;
    stack.appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 320);
    }, type === 'badge' ? 4200 : 3200);
  }

  function floatXP(amount, anchorEl) {
    const el = document.createElement('div');
    el.className = 'xp-float';
    el.textContent = `+${amount} XP`;
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    if (anchorEl && anchorEl.getBoundingClientRect) {
      const r = anchorEl.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top;
    }
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }

  function showLevelUp(info) {
    sfx.levelUp();
    confetti({ count: 180 });
    const ov = document.createElement('div');
    ov.className = 'levelup-overlay';
    ov.innerHTML = `
      <div class="anim-bounce-in" style="background:#fff;border-radius:32px;padding:32px 28px;max-width:340px;width:calc(100% - 40px);text-align:center;box-shadow:0 30px 80px -20px rgba(15,27,51,.5)">
        <div style="font-size:56px;line-height:1" class="anim-wiggle">${info.icon}</div>
        <div style="font-size:11px;font-weight:900;letter-spacing:.18em;color:#7C3AED;margin-top:14px">NAIK LEVEL!</div>
        <div style="font-size:30px;font-weight:900;color:#0F1B33;margin-top:4px">Level ${info.level}</div>
        <div style="font-size:14px;font-weight:700;color:#5B6679;margin-top:2px">${esc(info.title)}</div>
        <button type="button" style="margin-top:20px;width:100%;padding:12px;border-radius:16px;background:linear-gradient(120deg,#1F6BFF,#7C3AED);color:#fff;font-weight:800;font-size:14px;border:0;cursor:pointer">Gaskeun! 🚀</button>
      </div>`;
    ov.addEventListener('click', () => ov.remove());
    document.body.appendChild(ov);
  }

  // ───────────────────────── Scroll reveal, count-up, tilt ─────────────────────────
  let revealObserver = null;
  function initReveal(root) {
    const els = (root || document).querySelectorAll('[data-reveal]:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('is-visible'));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-visible');
            revealObserver.unobserve(en.target);
            en.target.querySelectorAll('[data-count]').forEach(countUp);
            if (en.target.hasAttribute('data-count')) countUp(en.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    }
    els.forEach((e) => revealObserver.observe(e));
  }

  function countUp(el) {
    if (!el || el.dataset.counted) return;
    el.dataset.counted = '1';
    const target = parseFloat(el.dataset.count) || 0;
    const dur = parseInt(el.dataset.duration || '1200', 10);
    const suffix = el.dataset.suffix || '';
    const start = performance.now();
    function step(now) {
      const k = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(target * eased).toLocaleString('id-ID') + suffix;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initTilt(root) {
    if (window.matchMedia && (window.matchMedia('(hover: none)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    (root || document).querySelectorAll('[data-tilt]').forEach((el) => {
      if (el._tilt) return;
      el._tilt = true;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-4px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  // ───────────────────────── Maskot "Xavi" ─────────────────────────
  function mascot(mood, size) {
    const s = size || 96;
    const m = mood || 'idle';
    const mouths = {
      idle: '<path d="M40 63 Q50 69 60 63" stroke="#0F1B33" stroke-width="3.2" fill="none" stroke-linecap="round"/>',
      happy: '<path d="M37 60 Q50 74 63 60 Z" fill="#0F1B33"/><path d="M43 66 Q50 71 57 66" fill="#FF7A9A"/>',
      sad: '<path d="M40 67 Q50 60 60 67" stroke="#0F1B33" stroke-width="3.2" fill="none" stroke-linecap="round"/>',
      think: '<path d="M42 65 L58 63" stroke="#0F1B33" stroke-width="3.2" stroke-linecap="round"/>',
      wow: '<ellipse cx="50" cy="65" rx="5" ry="6" fill="#0F1B33"/>',
    };
    const eyes = m === 'happy'
      ? '<path d="M33 48 Q38 42 43 48" stroke="#0F1B33" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M57 48 Q62 42 67 48" stroke="#0F1B33" stroke-width="3.4" fill="none" stroke-linecap="round"/>'
      : `<g class="mascot-eye"><ellipse cx="38" cy="47" rx="5.2" ry="${m === 'wow' ? 7 : 6}" fill="#0F1B33"/><circle cx="39.8" cy="44.8" r="1.8" fill="#fff"/></g>
         <g class="mascot-eye"><ellipse cx="62" cy="47" rx="5.2" ry="${m === 'wow' ? 7 : 6}" fill="#0F1B33"/><circle cx="63.8" cy="44.8" r="1.8" fill="#fff"/></g>`;
    const brows = m === 'sad'
      ? '<path d="M31 38 L43 41" stroke="#0F1B33" stroke-width="2.6" stroke-linecap="round"/><path d="M69 38 L57 41" stroke="#0F1B33" stroke-width="2.6" stroke-linecap="round"/>'
      : m === 'think' ? '<path d="M32 39 L44 37" stroke="#0F1B33" stroke-width="2.6" stroke-linecap="round"/>' : '';
    const cheeks = m === 'happy' || m === 'idle' ? '<ellipse cx="29" cy="58" rx="4.5" ry="3" fill="#FF9EB5" opacity=".7"/><ellipse cx="71" cy="58" rx="4.5" ry="3" fill="#FF9EB5" opacity=".7"/>' : '';
    const tear = m === 'sad' ? '<path d="M66 55 q3 6 0 8 q-3 -2 0 -8z" fill="#60A5FA"/>' : '';
    const bubble = m === 'think' ? '<circle cx="86" cy="18" r="6" fill="#E0E7FF"/><circle cx="78" cy="30" r="3.5" fill="#E0E7FF"/>' : '';
    return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" aria-hidden="true" class="${m === 'happy' ? 'mascot-happy' : 'mascot-bob'}" style="overflow:visible">
      <defs><linearGradient id="xvg-${m}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5B8CFF"/><stop offset="1" stop-color="#7C3AED"/></linearGradient></defs>
      ${bubble}
      <g class="mascot-antenna"><line x1="50" y1="20" x2="50" y2="8" stroke="#7C3AED" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="7" r="4.5" fill="#FF7A2F"/></g>
      <rect x="20" y="88" width="60" height="6" rx="3" fill="#0F1B33" opacity=".08"/>
      <rect x="14" y="20" width="72" height="62" rx="24" fill="url(#xvg-${m})"/>
      <rect x="21" y="29" width="58" height="45" rx="18" fill="#F0F5FF"/>
      <rect x="8" y="44" width="8" height="16" rx="4" fill="#4F46E5"/><rect x="84" y="44" width="8" height="16" rx="4" fill="#4F46E5"/>
      ${brows}${eyes}${cheeks}${mouths[m] || mouths.idle}${tear}
    </svg>`;
  }

  // ───────────────────────── Sidebar navigasi terpadu ─────────────────────────
  const NAV = [
    { group: 'Belajar', items: [
      { href: 'dashboard.html', icon: 'space_dashboard', label: 'Dashboard' },
      { href: 'modul.html', icon: 'auto_stories', label: 'Modul Materi' },
      { href: 'kuis.html', icon: 'sports_esports', label: 'Kuis Arena', tag: 'Seru' },
      { href: 'simulator.html', icon: 'travel_explore', label: 'Simulator Riset' },
      { href: 'tugas.html', icon: 'assignment', label: 'Tugas & Rubrik' },
    ] },
    { group: 'Alat Bantu', items: [
      { href: 'catatan.html', icon: 'edit_note', label: 'Catatan Belajar' },
      { href: 'tanya-ai.html', icon: 'smart_toy', label: 'Tanya AI' },
      { href: 'komunitas.html', icon: 'forum', label: 'Komunitas' },
    ] },
  ];

  function currentPage() {
    const p = location.pathname.split('/').pop() || 'index.html';
    return p.toLowerCase();
  }

  function renderShell() {
    const aside = document.getElementById('main-sidebar');
    if (!aside || aside.dataset.static === 'true') return;
    const user = getUser();
    const page = currentPage();
    const prog = getProgress();
    const lv = levelInfo(prog.xp);
    const guru = isGuru(user);

    const navHtml = NAV.map((g) => `
      <div>
        <div class="px-3 mb-1.5 text-[10.5px] font-semibold tracking-[0.16em] uppercase text-[#5E6680]">${g.group}</div>
        <div class="space-y-0.5">
        ${g.items.map((it) => {
          const active = page === it.href;
          return `<a href="${it.href}" class="hj-nav-link" ${active ? 'aria-current="page"' : ''}>
              <span class="material-symbols-outlined" aria-hidden="true">${it.icon}</span>
              <span class="flex-1">${it.label}</span>
              ${it.tag && !active ? `<span class="hj-chip hj-chip--blue !text-[10px] !px-2 !py-0.5">${it.tag}</span>` : ''}
            </a>`;
        }).join('')}
        </div>
      </div>`).join('');

    const profile = user ? `
      <div class="relative overflow-hidden rounded-2xl p-4 hj-glass text-white">
        <div class="absolute -right-10 -bottom-12 w-32 h-32 rounded-full bg-[#2340FF] opacity-40 blur-2xl pointer-events-none" aria-hidden="true"></div>
        <div class="relative flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B74FF] to-[#2340FF] text-white flex items-center justify-center font-bold text-sm">${esc(initials(user.name))}</div>
          <div class="min-w-0 flex-1">
            <div class="text-[14px] font-semibold truncate">${esc(user.name || 'Siswa')}</div>
            <div class="text-[11px] text-white/60 font-semibold truncate">${guru ? 'Guru / Pengajar' : `Lv.${lv.level} · ${esc(lv.title)}`}</div>
          </div>
          ${guru ? '' : `<div class="text-right shrink-0" title="Streak belajar harian">
            <div class="flex items-center gap-0.5 text-sm font-bold leading-none text-[#FFC94D]"><span class="material-symbols-outlined icon-fill text-[16px]" aria-hidden="true">local_fire_department</span>${prog.streak.count || 0}</div>
            <div class="text-[10px] text-white/50 font-bold mt-0.5">hari</div>
          </div>`}
        </div>
        ${guru ? '' : `
        <div class="relative mt-3">
          <div class="flex justify-between text-[10.5px] font-bold text-white/60 mb-1"><span class="font-mono">${prog.xp} XP</span><span>${lv.nextAt ? `${lv.toNext} XP lagi` : 'MAX'}</span></div>
          <div class="hj-progress hj-progress--dark !h-1.5"><span style="width:${lv.pct}%"></span></div>
        </div>`}
        <div class="relative mt-3 grid grid-cols-[1fr_1fr_auto] gap-1.5">
          <button type="button" data-x-sound class="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold transition" aria-label="Efek suara ${soundOn() ? 'aktif' : 'mati'}">
            <span class="material-symbols-outlined text-[16px]" aria-hidden="true">${soundOn() ? 'volume_up' : 'volume_off'}</span>${soundOn() ? 'Suara' : 'Senyap'}
          </button>
          <button type="button" data-x-theme class="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold transition" aria-label="Ganti tema">
            <span class="material-symbols-outlined text-[16px]" aria-hidden="true">${isDark() ? 'light_mode' : 'dark_mode'}</span>${isDark() ? 'Terang' : 'Gelap'}
          </button>
          <button type="button" data-x-logout class="flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-[#E5484D] text-[11px] font-bold transition" aria-label="Keluar akun">
            <span class="material-symbols-outlined text-[16px]" aria-hidden="true">logout</span>
          </button>
        </div>
      </div>` : `
      <a href="login.html?redirect=${esc(page)}" class="hj-btn hj-btn--blue w-full">Masuk untuk menyimpan progres</a>`;

    aside.innerHTML = `
      <div class="flex flex-col h-full w-full">
        <div class="px-5 pt-5 pb-4 flex items-center justify-between shrink-0">
          <a href="index.html" class="group block" aria-label="Informatika SMAN 1 Batam — ke beranda">
            <span class="block text-[20px] font-semibold text-white tracking-tight leading-none group-hover:text-[#AFBDFF] transition-colors">Informatika</span>
            <span class="block text-[10.5px] text-[#8C94AB] font-semibold tracking-[0.18em] mt-1.5">SMAN 1 BATAM · XI HJ 5</span>
          </a>
          <button type="button" data-x-close-sidebar class="lg:hidden text-[#8C94AB] hover:text-white p-2 rounded-xl hover:bg-white/5" aria-label="Tutup menu">
            <span class="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
          </button>
        </div>
        <nav class="flex-1 overflow-y-auto thin-scroll px-3 py-2 space-y-5" aria-label="Menu utama">${navHtml}</nav>
        <div class="p-3 shrink-0">${profile}</div>
      </div>`;

    aside.querySelector('[data-x-sound]')?.addEventListener('click', () => sfx.toggle());
    aside.querySelector('[data-x-theme]')?.addEventListener('click', toggleTheme);
    aside.querySelector('[data-x-logout]')?.addEventListener('click', logout);
    aside.querySelector('[data-x-close-sidebar]')?.addEventListener('click', () => {
      if (typeof window.toggleSidebar === 'function') window.toggleSidebar();
    });
  }

  function refreshShell() {
    if (document.getElementById('main-sidebar')) renderShell();
  }

  function syncTopbarUser() {
    const user = getUser();
    if (!user) return;
    const name = user.name || 'Siswa';
    const role = isGuru(user) ? 'Guru / Pengajar' : (user.kelas ? `Siswa ${user.kelas}` : (user.role || 'Siswa'));
    const ini = initials(name);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('top-user-avatar', ini);
    set('dropdown-user-avatar', ini);
    set('student-display-name', name);
    set('dropdown-user-name', name);
    set('student-display-role', role);
    set('dropdown-user-role', `${role} • SMAN 1 Batam`);
  }

  // ───────────────────────── Tema gelap/terang ─────────────────────────
  function isDark() { return document.documentElement.classList.contains('dark'); }
  function toggleTheme() {
    const apply = () => {
      const dark = !isDark();
      document.documentElement.classList.toggle('dark', dark);
      try { localStorage.setItem('xavetra_theme', dark ? 'dark' : 'light'); } catch (e) {}
      refreshShell();
    };
    sfx.click();
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(apply);
    else apply();
  }

  // ───────────────────────── Navigasi bawah (HP) ─────────────────────────
  const BOTTOM = [
    { href: 'dashboard.html', icon: 'space_dashboard', label: 'Beranda' },
    { href: 'modul.html', icon: 'auto_stories', label: 'Belajar' },
    { href: 'kuis.html', icon: 'sports_esports', label: 'Kuis' },
    { href: 'simulator.html', icon: 'travel_explore', label: 'Riset' },
  ];
  function renderBottomNav() {
    if (!document.getElementById('main-sidebar') || document.getElementById('x-bottom-nav')) return;
    const page = currentPage();
    const inMain = BOTTOM.some((b) => b.href === page);
    const nav = document.createElement('nav');
    nav.id = 'x-bottom-nav';
    nav.setAttribute('aria-label', 'Navigasi utama');
    nav.innerHTML = BOTTOM.map((b) => `<a href="${b.href}" class="${page === b.href ? 'is-active' : ''}"><span class="material-symbols-outlined text-[22px]">${b.icon}</span>${b.label}</a>`).join('')
      + `<button type="button" class="${inMain ? '' : 'is-active'}" data-x-more><span class="material-symbols-outlined text-[22px]">apps</span>Lainnya</button>`;
    document.body.appendChild(nav);
    document.body.classList.add('has-bottom-nav');
    nav.querySelector('[data-x-more]').addEventListener('click', () => {
      sfx.click();
      if (typeof window.toggleSidebar === 'function') window.toggleSidebar();
    });
  }

  // ───────────────────────── Onboarding (pengguna baru) ─────────────────────────
  function onboardingKey() { const u = getUser(); return `xavetra_onboarded::${u && u.username ? String(u.username).toLowerCase() : 'tamu'}`; }
  function dailyGoal() { return parseInt(localStorage.getItem(onboardingKey().replace('onboarded', 'goal')) || '50', 10); }
  function showOnboarding(force) {
    const user = getUser();
    if (!user || isGuru(user)) return;
    if (!force && localStorage.getItem(onboardingKey())) return;
    let step = 0;
    let goal = dailyGoal();
    const ov = document.createElement('div');
    ov.className = 'levelup-overlay';
    ov.style.alignItems = 'flex-end';
    ov.style.overflowY = 'auto';
    const steps = [
      () => `<div class="flex justify-center">${mascot('happy', 120)}</div>
        <div class="text-[11px] font-black tracking-[0.2em] text-primary mt-3">KENALAN DULU YUK</div>
        <h2 class="text-2xl font-black text-navy mt-1">Hai ${esc(firstName(user.name))}, aku Xavi! 👋</h2>
        <p class="text-sm text-text-muted mt-2">Aku bakal nemenin kamu belajar Informatika: mesin pencari, riset anti-hoaks, hukum digital, dan etika internet. Santai, tiap langkahnya singkat kok.</p>`,
      () => `<div class="flex justify-center">${mascot('think', 96)}</div>
        <h2 class="text-xl font-black text-navy mt-3">Mau target belajar harian berapa?</h2>
        <p class="text-xs text-text-muted mt-1">Bisa diubah kapan saja. Konsisten lebih penting daripada banyak.</p>
        <div class="grid grid-cols-3 gap-2 mt-4" data-goals>
          ${[[20, 'Santai', '☕', '±5 menit'], [50, 'Serius', '🔥', '±15 menit'], [100, 'Ambis', '🚀', '±30 menit']].map(([v, l, e, t]) => `<button type="button" data-goal="${v}" class="opt-card p-3 rounded-2xl border-2 ${goal === v ? 'border-primary bg-primary-subtle' : 'border-slate-200 bg-white'}"><div class="text-2xl">${e}</div><div class="text-sm font-black text-navy mt-1">${l}</div><div class="text-[10px] font-bold text-text-muted">${v} XP • ${t}</div></button>`).join('')}
        </div>`,
      () => `<div class="flex justify-center">${mascot('wow', 96)}</div>
        <h2 class="text-xl font-black text-navy mt-3">Cara dapat XP ⚡</h2>
        <div class="mt-4 grid gap-2 text-left">
          ${[['auto_stories', 'Selesaikan langkah di Modul', '+5 s.d. +15 XP'], ['sports_esports', 'Jawab benar di Kuis Arena', '+10 XP, combo = bonus'], ['travel_explore', 'Tuntaskan misi Simulator', '+20 XP'], ['local_fire_department', 'Belajar tiap hari', 'jaga streak 🔥']].map(([ic, t, d]) => `<div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-50"><span class="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-primary"><span class="material-symbols-outlined icon-fill text-[20px]">${ic}</span></span><div><div class="text-sm font-extrabold text-navy">${t}</div><div class="text-[11px] font-bold text-text-muted">${d}</div></div></div>`).join('')}
        </div>`,
    ];
    function render() {
      ov.innerHTML = `<div class="anim-bounce-in bg-white w-full sm:max-w-md sm:mb-auto sm:mt-auto rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-7 text-center shadow-2xl">
        <div class="flex justify-center gap-1.5 mb-4">${steps.map((_, k) => `<span class="onb-dot ${k === step ? 'on' : ''}"></span>`).join('')}</div>
        ${steps[step]()}
        <div class="mt-6 flex gap-2">
          ${step > 0 ? '<button type="button" data-back class="px-5 py-3.5 rounded-2xl bg-white border-2 border-b-4 border-slate-200 font-black text-sm text-navy">Kembali</button>' : '<button type="button" data-skip class="px-4 py-3.5 rounded-2xl text-sm font-bold text-text-muted">Lewati</button>'}
          <button type="button" data-next class="flex-1 px-5 py-3.5 rounded-2xl bg-primary text-white font-black text-sm border-b-4 border-primary-dark active:translate-y-0.5 active:border-b-2 transition">${step === steps.length - 1 ? 'Mulai Belajar 🚀' : 'Lanjut'}</button>
        </div></div>`;
      ov.querySelector('[data-goals]')?.addEventListener('click', (e) => {
        const b = e.target.closest('[data-goal]');
        if (!b) return;
        goal = +b.dataset.goal;
        sfx.pop();
        render();
      });
      ov.querySelector('[data-back]')?.addEventListener('click', () => { step--; sfx.click(); render(); });
      ov.querySelector('[data-skip]')?.addEventListener('click', finish);
      ov.querySelector('[data-next]').addEventListener('click', () => {
        if (step < steps.length - 1) { step++; sfx.whoosh(); render(); } else finish(true);
      });
    }
    function finish(go) {
      try {
        localStorage.setItem(onboardingKey(), '1');
        localStorage.setItem(onboardingKey().replace('onboarded', 'goal'), String(goal));
      } catch (e) {}
      ov.remove();
      document.dispatchEvent(new CustomEvent('x:progress', { detail: getProgress() }));
      if (go === true) { sfx.win(); confetti({ count: 120 }); }
    }
    render();
    document.body.appendChild(ov);
  }

  function logout() {
    if (!confirm('Yakin ingin keluar dari akun?')) return;
    try { localStorage.removeItem('xavetra_user'); } catch (e) {}
    location.href = 'login.html';
  }

  function requireAuth() {
    if (!getUser()) {
      location.replace(`login.html?redirect=${encodeURIComponent(currentPage())}`);
      return false;
    }
    return true;
  }

  // ───────────────────────── Cloud (Google Apps Script v2, opsional) ─────────────────────────
  const cloud = {
    endpoint() {
      return typeof window.getGoogleSheetEndpoint === 'function' ? window.getGoogleSheetEndpoint() : '';
    },
    async call(action, payload) {
      const url = cloud.endpoint();
      if (!url) return { success: false, unsupported: true, message: 'Endpoint belum diatur.' };
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 15000);
      try {
        // text/plain agar tidak memicu preflight CORS di Google Apps Script
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(Object.assign({ action }, payload || {})),
          signal: ctrl.signal,
        });
        clearTimeout(tid);
        const data = await res.json();
        if (data && data.message === 'Aksi tidak valid') data.unsupported = true;
        return data;
      } catch (e) {
        clearTimeout(tid);
        return { success: false, offline: true, message: 'Tidak dapat terhubung ke server.' };
      }
    },
    saveScore(key, result) {
      const u = getUser();
      if (!u || !u.token) return;
      cloud.call('saveScore', {
        token: u.token, username: u.username, chapter: key, score: result.score,
        correct: result.correct, total: result.total, mode: result.mode || 'practice', xp: getProgress().xp,
      }).catch(() => {});
    },
  };

  // ───────────────────────── Init ─────────────────────────
  function init() {
    // Ganti showToast lama dengan toast animasi baru (kompatibel dengan pemanggilan lama)
    window.showToast = function (msg, type) {
      toast(esc(msg), type === 'alert' ? 'alert' : type || 'success');
    };
    renderShell();
    renderBottomNav();
    syncTopbarUser();
    initReveal();
    initTilt();
    const main = document.querySelector('main');
    if (main && !main.classList.contains('no-enter') && !main.hasAttribute('data-m-page')) main.classList.add('page-enter');
    // Buka AudioContext pada interaksi pertama (kebijakan autoplay browser)
    document.addEventListener('pointerdown', function once() {
      if (soundOn()) ctx();
      document.removeEventListener('pointerdown', once);
    });
  }

  window.X = {
    esc, safeRedirect, readJSON, writeJSON, getUser, isGuru, initials, firstName, todayKey,
    LEVELS, BADGES, getProgress, saveProgress, levelInfo, addXP, grantBadge, markLessonStep, recordQuiz,
    sfx, confetti, toast, floatXP, showLevelUp, initReveal, countUp, initTilt, mascot,
    renderShell, refreshShell, syncTopbarUser, logout, requireAuth, cloud,
    isDark, toggleTheme, showOnboarding, dailyGoal,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
