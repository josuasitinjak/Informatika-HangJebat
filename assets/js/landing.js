/**
 * landing.js — interaksi beranda gaya "Momentum".
 * Bergantung pada: window.Motion (opsional), HJMotion (motion-ui.js), X (core.js), XContent (content.js).
 * Semua angka dihitung dari materi nyata di content.js — tidak ada statistik karangan.
 */
(function () {
  'use strict';
  const M = window.Motion || null;
  const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const canAnimate = !!M && !reduced;
  const EASE = [0.22, 1, 0.36, 1];
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (v) => (window.X ? X.esc(v) : String(v));

  // ───────── Data nyata dari kurikulum ─────────
  const CH = (window.XContent && XContent.CHAPTERS) || [];
  const QUIZ = (window.XContent && XContent.QUIZ) || {};
  const STATS = {
    chapters: CH.length,
    widgets: CH.reduce((n, c) => n + c.steps.filter((s) => s.type === 'widget').length, 0),
    questions: Object.values(QUIZ).reduce((n, list) => n + (Array.isArray(list) ? list.length : 0), 0),
  };
  const user = window.X ? X.getUser() : null;

  function setStats(animated) {
    $$('[data-stat]').forEach((el) => {
      const v = STATS[el.dataset.stat] || 0;
      if (animated && window.HJMotion && HJMotion.enabled) HJMotion.count(el, v);
      else el.textContent = v.toLocaleString('id-ID');
    });
  }

  // ───────── Header & menu HP ─────────
  function initHeader() {
    const hdr = $('#lp-header');
    const onScroll = () => hdr.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (user) {
      $('#hdr-login').classList.add('hidden');
      $('#hdr-login').classList.remove('sm:inline-flex');
      $('#mm-login').textContent = 'Dashboard';
      $('#mm-login').href = 'dashboard.html';
      $('#hdr-cta').textContent = 'Lanjut belajar';
    }

    const btn = $('#menu-btn');
    const menu = $('#mobile-menu');
    function setMenu(open) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
      menu.hidden = !open;
      document.body.style.overflow = open ? 'hidden' : '';
      if (open && canAnimate) M.animate($$('a', menu), { opacity: [0, 1], y: [20, 0] }, { delay: M.stagger(0.05), duration: 0.45, ease: EASE });
    }
    btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); } });
  }

  // ───────── Hero: pecah kata & animasi masuk ─────────
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    // Gradasi putih → abu kebiruan per kata (background-clip:text tidak tembus ke span yang ditransformasi)
    const fade = el.classList.contains('hj-fade-text');
    if (fade) el.classList.remove('hj-fade-text');
    el.innerHTML = words.map((w, i) => {
      const k = fade && words.length > 1 ? i / (words.length - 1) : 0;
      const style = fade ? ` style="color:rgba(${Math.round(255 - k * 45)},${Math.round(255 - k * 38)},${Math.round(255 - k * 15)},${(1 - k * 0.42).toFixed(2)})"` : '';
      return `<span class="lp-word"${style}>${esc(w)}</span>`;
    }).join(' ');
    return $$('.lp-word', el);
  }
  function initHero() {
    const title = $('.lp-hero__title');
    const words = $$('[data-split]', title).flatMap(splitWords);
    if (!canAnimate) { setStats(false); return; }
    title.style.opacity = 1;
    M.animate(words, { opacity: [0, 1], y: ['70%', '0%'], filter: ['blur(10px)', 'blur(0px)'] }, { duration: 1.05, ease: EASE, delay: M.stagger(0.07, { startDelay: 0.15 }) });
    M.animate($$('[data-hero-in]'), { opacity: [0, 1], y: [18, 0] }, { duration: 0.8, ease: EASE, delay: M.stagger(0.08, { startDelay: 0.55 }) });
    M.animate('#hero-ascii', { opacity: [0, 1] }, { duration: 1.2, ease: EASE });
    setTimeout(() => setStats(true), 800);
  }

  // ───────── Latar hero: Gradient ASCII (port React Bits) ─────────
  function initAscii() {
    const host = $('#hero-ascii');
    if (!host || !window.GradientASCII) return;
    const small = window.innerWidth < 700;
    const stop = GradientASCII.mount(host, {
      colors: ['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8'],
      shape: 'horizon',
      characters: ' =+xX0S8#@',
      cellSize: small ? 14 : 18,
      density: 0.8,
      dpr: small ? 1.5 : 2,
    });
    if (stop) $('.lp-hero').classList.add('has-ascii');
    else host.remove(); // tanpa WebGL2 → latar CSS cadangan di .lp-hero
  }

  // ───────── Marquee topik ─────────
  function initMarquee() {
    const items = [['travel_explore', 'Crawling'], ['database', 'Indexing'], ['leaderboard', 'Ranking'], ['manage_search', 'Operator site:'], ['picture_as_pdf', 'filetype:'], ['fact_check', 'Triangulasi'], ['psychology_alt', 'Metode SIFT'], ['gavel', 'UU ITE'], ['shield_person', 'UU PDP'], ['copyright', 'Hak Cipta'], ['license', 'Creative Commons'], ['forum', 'Netiket']];
    const html = items.map(([i, t]) => `<span class="lp-marquee__item"><span class="material-symbols-outlined">${i}</span>${t}</span>`).join('');
    $('#topic-track').innerHTML = html + html;
  }

  // ───────── Kalimat muncul kata per kata mengikuti scroll ─────────
  function initScrollWords() {
    $$('[data-scroll-words]').forEach((el) => {
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map((w) => `<span class="lp-w">${esc(w)}</span>`).join(' ');
      if (!canAnimate || !M.scroll) return;
      const spans = $$('.lp-w', el);
      const n = spans.length;
      M.scroll((p) => {
        spans.forEach((s, i) => {
          const k = Math.max(0, Math.min(1, p * (n + 4) - i));
          s.style.opacity = String(0.14 + 0.86 * k);
          s.style.filter = k < 1 ? `blur(${((1 - k) * 3).toFixed(2)}px)` : 'none';
        });
      }, { target: el, offset: ['start 0.9', 'end 0.55'] });
    });
  }

  // ───────── Kartu pelajar 3D ─────────
  function initCard() {
    const card = $('#card-3d');
    const stage = $('#card-stage');
    if (user && window.X) {
      const p = X.getProgress();
      const lv = X.levelInfo(p.xp);
      $('#card-name').textContent = user.name || 'Siswa';
      $('#card-xp').textContent = p.xp.toLocaleString('id-ID');
      $('#card-level').textContent = `Lv.${lv.level} · ${lv.title}`;
      $('#card-caption').textContent = 'Data diambil dari progres akunmu di perangkat ini. Gerakkan kursor di atas kartu.';
    }
    if (reduced) return;
    const fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) {
      if (canAnimate) M.animate(card, { rotateY: [-10, 10], rotateX: [6, -4] }, { duration: 5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' });
      return;
    }
    stage.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotX = Math.max(-22, Math.min(22, -(y / rect.height) * 22));
      const rotY = Math.max(-22, Math.min(22, (x / rect.width) * 22));
      card.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
      card.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
      if (canAnimate) M.animate(card, { rotateX: rotX, rotateY: rotY }, { type: 'spring', stiffness: 220, damping: 22 });
      else card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });
    stage.addEventListener('pointerleave', () => {
      card.style.setProperty('--mx', '50%'); card.style.setProperty('--my', '50%');
      if (canAnimate) M.animate(card, { rotateX: 0, rotateY: 0 }, { type: 'spring', stiffness: 140, damping: 14 });
      else card.style.transform = '';
    });
  }

  // ───────── Konverter bilangan (angka pegas) ─────────
  function initConverter() {
    const big = $('#conv-big'), bitsEl = $('#conv-bits'), line = $('#conv-line'), input = $('#conv-input');
    const tabs = $$('.lp-seg [data-base]');
    let base = 10, value = 0, shown = 0, holdUntil = 0, visible = false;
    bitsEl.innerHTML = [128, 64, 32, 16, 8, 4, 2, 1].map((pv) => `<div class="lp-bit" data-pv="${pv}"><span>0</span><small>${pv}</small></div>`).join('');
    const bitCells = $$('.lp-bit', bitsEl);
    const live = document.createElement('div');
    live.className = 'sr-only'; live.setAttribute('aria-live', 'polite');
    bitsEl.after(live);

    const fmt = (n) => (base === 2 ? n.toString(2).padStart(8, '0') : base === 16 ? '0x' + n.toString(16).toUpperCase().padStart(2, '0') : String(n));
    function paintBig(n) { big.textContent = fmt(n); }
    function render(next, announce) {
      const from = shown;
      value = next;
      const bin = next.toString(2).padStart(8, '0');
      bitCells.forEach((c, i) => {
        const on = bin[i] === '1';
        if (c.classList.contains('on') !== on) {
          c.classList.toggle('on', on);
          c.firstElementChild.textContent = on ? '1' : '0';
          if (canAnimate) M.animate(c, { scale: [0.8, 1], rotateX: [90, 0] }, { type: 'spring', stiffness: 300, damping: 18 });
        }
      });
      const parts = { 10: `DEC ${next}`, 2: `BIN ${bin}`, 16: `HEX 0x${next.toString(16).toUpperCase().padStart(2, '0')}` };
      line.textContent = Object.keys(parts).filter((k) => +k !== base).map((k) => parts[k]).join(' · ');
      if (canAnimate && base !== 2) {
        M.animate(from, next, { type: 'spring', stiffness: 90, damping: 16, onUpdate: (v) => { shown = Math.max(0, Math.min(255, Math.round(v))); paintBig(shown); } });
      } else { shown = next; paintBig(next); }
      shown = base === 2 ? next : shown;
      if (announce) live.textContent = `${next} desimal sama dengan ${bin} biner dan ${next.toString(16).toUpperCase()} heksadesimal.`;
    }
    tabs.forEach((t) => t.addEventListener('click', () => {
      base = +t.dataset.base;
      tabs.forEach((x) => x.setAttribute('aria-selected', String(x === t)));
      shown = value; paintBig(value);
      render(value, false);
      if (window.X) X.sfx.click();
    }));
    input.addEventListener('input', () => {
      const n = parseInt(input.value, 10);
      if (Number.isNaN(n)) return;
      holdUntil = Date.now() + 12000;
      render(Math.max(0, Math.min(255, n)), true);
    });
    render(173, false);
    if (!reduced) {
      new IntersectionObserver((es) => es.forEach((en) => { visible = en.isIntersecting; })).observe(big);
      setInterval(() => {
        if (!visible || document.hidden || Date.now() < holdUntil || document.activeElement === input) return;
        render(Math.floor(Math.random() * 256), false);
      }, 2800);
    }
  }

  // ───────── Tab "cara belajar" dengan layar demo ─────────
  const ENGINE = {
    baca: () => `<div class="lp-demo"><div class="lp-demo__card">
        <div class="text-[11px] tracking-[0.16em] text-white/50 font-semibold">BAB 01 · LANGKAH 1</div>
        <div class="text-[22px] font-medium mt-2 tracking-tight">Apa itu Mesin Pencari?</div>
        <p class="text-[14px] text-white/75 leading-relaxed mt-3">Mesin pencari <span class="lp-mark" data-mark>tidak mencari di internet secara langsung</span> saat kamu menekan Enter. Ia mencari di <span class="lp-mark" data-mark>indeks</span> yang sudah disiapkan sebelumnya.</p>
        <div class="lp-demo__line w-4/5"></div><div class="lp-demo__line w-3/5"></div>
      </div><div class="text-[12px] text-white/50 mt-3 text-center">Cuplikan materi asli dari Bab 1</div></div>`,
    coba: () => {
      const nodes = [[60, 60], [190, 40], [310, 90], [110, 170], [240, 180], [70, 280], [200, 290], [320, 250]];
      const edges = [[0, 1], [1, 2], [0, 3], [1, 4], [3, 4], [2, 7], [4, 7], [3, 5], [5, 6], [4, 6]];
      return `<div class="lp-demo text-center"><svg viewBox="0 0 380 340" class="w-full" role="img" aria-label="Animasi robot crawler mengikuti tautan antarhalaman">
        ${edges.map(([a, b], i) => `<line data-edge="${i}" x1="${nodes[a][0]}" y1="${nodes[a][1]}" x2="${nodes[b][0]}" y2="${nodes[b][1]}" stroke="rgba(255,255,255,.18)" stroke-width="1.5"/>`).join('')}
        ${nodes.map(([x, y], i) => `<g><circle class="lp-node" data-node="${i}" cx="${x}" cy="${y}" r="14" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.35)"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="10" fill="#fff" font-family="JetBrains Mono">${i + 1}</text></g>`).join('')}
      </svg><div class="text-[13px] text-white/70 mt-2" id="crawl-label">Crawler menjelajah halaman lewat tautan…</div></div>`;
    },
    cek: () => `<div class="lp-demo"><div class="lp-demo__card">
        <div class="text-[11px] tracking-[0.16em] text-white/50 font-semibold">CEK PEMAHAMAN · COBA JAWAB</div>
        <p class="text-[16px] font-medium mt-3 leading-snug">Saat kamu menekan Enter, mesin pencari langsung membuka semua situs di internet satu per satu.</p>
        <button type="button" class="lp-opt" data-ans="true">Benar</button>
        <button type="button" class="lp-opt" data-ans="false">Salah</button>
        <div id="cek-fb" class="text-[13px] mt-3 min-h-[40px]" aria-live="polite"></div>
      </div></div>`,
    catat: () => `<div class="lp-demo"><div class="lp-demo__card" style="background:rgba(255,255,255,.92);color:#0A0E1C">
        <div class="flex items-center justify-between"><span class="text-[11px] font-semibold tracking-[0.14em] text-[#5B6275]">BAB 01 · CATATAN</span><span class="hj-chip !bg-[#EEF0F5] !text-[#5B6275] !border-transparent">contoh</span></div>
        <div class="text-[18px] font-semibold mt-2">Beda crawling & indexing</div>
        <p class="text-[14px] text-[#3A4258] mt-2 leading-relaxed" id="note-type"></p>
      </div><div class="text-[12px] text-white/50 mt-3 text-center">Catatan tersimpan per bab dan muncul di menu Catatan Belajar</div></div>`,
  };
  let engineTimer = null;
  function showEngine(key) {
    const screen = $('#engine-screen');
    clearInterval(engineTimer);
    screen.innerHTML = ENGINE[key]();
    if (canAnimate) M.animate(screen.firstElementChild, { opacity: [0, 1], y: [24, 0], scale: [0.97, 1] }, { duration: 0.6, ease: EASE });
    if (key === 'baca' && canAnimate) {
      $$('[data-mark]', screen).forEach((m, i) => {
        m.style.backgroundSize = '0% 100%'; m.style.backgroundRepeat = 'no-repeat';
        M.animate(m, { backgroundSize: ['0% 100%', '100% 100%'] }, { duration: 0.8, delay: 0.5 + i * 0.5, ease: EASE });
      });
    }
    if (key === 'coba') {
      const order = [0, 1, 3, 4, 2, 7, 6, 5];
      let k = 0;
      const step = () => {
        $$('[data-node]', screen).forEach((n) => { const idx = order.indexOf(+n.dataset.node); n.setAttribute('fill', idx < k ? '#2340FF' : 'rgba(255,255,255,.08)'); });
        const lab = $('#crawl-label', screen);
        if (lab) lab.textContent = k >= order.length ? `Selesai! ${order.length} halaman masuk antrean indeks.` : `Merayapi halaman ${order[Math.min(k, order.length - 1)] + 1}…`;
        k = k > order.length ? 0 : k + 1;
      };
      step();
      if (!reduced) engineTimer = setInterval(step, 650);
    }
    if (key === 'cek') {
      $$('[data-ans]', screen).forEach((b) => b.addEventListener('click', () => {
        const ok = b.dataset.ans === 'false';
        $$('[data-ans]', screen).forEach((x) => { x.disabled = true; x.classList.add(x.dataset.ans === 'false' ? 'ok' : 'no'); });
        if (window.X) (ok ? X.sfx.correct() : X.sfx.wrong());
        $('#cek-fb', screen).innerHTML = `<b>${ok ? 'Tepat!' : 'Belum tepat.'}</b> <span class="text-white/70">Pencarian dilakukan pada indeks yang sudah disiapkan sebelumnya. Di modul, jawaban benar memberi +10 XP.</span>`;
        if (canAnimate) M.animate(b, { scale: [1, 1.04, 1] }, { duration: 0.35 });
      }));
    }
    if (key === 'catat') {
      const text = 'Crawling = robot menjelajah web lewat tautan. Indexing = isi halaman dicatat ke katalog kata kunci, jadi pencarian cukup melihat katalog ini.';
      const el = $('#note-type', screen);
      if (reduced) { el.textContent = text; return; }
      let i = 0;
      engineTimer = setInterval(() => { i += 2; el.innerHTML = esc(text.slice(0, i)) + '<span class="hj-caret"></span>'; if (i >= text.length) clearInterval(engineTimer); }, 30);
    }
  }
  function initEngine() {
    const tabs = $$('#engine-tabs [data-tab]');
    tabs.forEach((t) => t.addEventListener('click', () => {
      tabs.forEach((x) => x.setAttribute('aria-selected', String(x === t)));
      showEngine(t.dataset.tab);
    }));
    // Panah kiri/kanan untuk berpindah tab
    $('#engine-tabs').addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      n.focus(); n.click();
    });
    showEngine('baca');
  }

  // ───────── Peta materi: kartu bertumpuk ─────────
  function chapterArt(c, i) {
    const id = `ga${i}`;
    const bg = `<defs><radialGradient id="${id}" cx="50%" cy="110%" r="80%"><stop offset="0" stop-color="#2340FF" stop-opacity=".9"/><stop offset=".55" stop-color="#1424B8" stop-opacity=".25"/><stop offset="1" stop-color="#070910" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}c" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#9AA3BC"/><stop offset=".55" stop-color="#F4F6FB"/><stop offset=".8" stop-color="#5A6380"/><stop offset="1" stop-color="#E7EBF4"/></linearGradient></defs>
      <rect width="800" height="425" fill="#070910"/><rect width="800" height="425" fill="url(#${id})"/>`;
    let art = '';
    if (i === 0) {
      const pts = [[220, 150], [330, 110], [420, 170], [520, 120], [600, 200], [280, 250], [400, 270], [520, 290], [350, 330], [470, 210]];
      const ed = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 4], [6, 8], [2, 9], [9, 7], [1, 9], [5, 8]];
      art = ed.map(([a, b]) => `<line x1="${pts[a][0]}" y1="${pts[a][1]}" x2="${pts[b][0]}" y2="${pts[b][1]}" stroke="rgba(170,185,255,.45)" stroke-width="1.2" class="crawl-edge active"/>`).join('')
        + pts.map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="${k % 3 === 0 ? 9 : 6}" fill="${k % 3 === 0 ? '#fff' : '#8EA2FF'}" opacity="${k % 3 === 0 ? 1 : 0.8}"/>`).join('');
    } else if (i === 1) {
      art = `<rect x="190" y="170" width="420" height="58" rx="29" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.25)"/>
        <text x="222" y="207" font-family="JetBrains Mono" font-size="19" fill="#fff">"hoaks gempa" site:go.id</text>
        ${[['filetype:pdf', 150, 110], ['-viral', 520, 120], ['intitle:', 600, 300], ['OR', 210, 310], ['triangulasi', 380, 330]].map(([t, x, y]) => `<g><rect x="${x}" y="${y - 22}" width="${t.length * 11 + 28}" height="34" rx="17" fill="rgba(35,64,255,.25)" stroke="rgba(142,162,255,.5)"/><text x="${x + 14}" y="${y}" font-family="JetBrains Mono" font-size="14" fill="#C9D3FF">${t}</text></g>`).join('')}`;
    } else if (i === 2) {
      art = `${[150, 115, 80].map((r, k) => `<circle cx="400" cy="215" r="${r}" fill="none" stroke="rgba(170,185,255,${0.15 + k * 0.1})"/>`).join('')}
        <path d="M400 135 L465 160 V215 C465 255 437 283 400 298 C363 283 335 255 335 215 V160 Z" fill="url(#${id}c)" opacity=".95"/>
        <path d="M375 215 l18 18 l35 -38" stroke="#0A0E1C" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else {
      art = `<text x="400" y="290" text-anchor="middle" font-family="Urbanist" font-weight="300" font-size="230" fill="url(#${id}c)">©</text>
        <g font-family="JetBrains Mono" font-size="15" fill="#C9D3FF">${[['CC BY', 170, 140], ['CC BY-SA', 560, 120], ['CC BY-NC', 600, 320], ['Atribusi', 150, 320]].map(([t, x, y]) => `<text x="${x}" y="${y}">${t}</text>`).join('')}</g>`;
    }
    return `<svg viewBox="0 0 800 425" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${bg}${art}</svg>`;
  }
  function initStack() {
    const host = $('#chapter-stack');
    host.innerHTML = CH.map((c, i) => `<article class="lp-chap" data-idx="${i}" aria-labelledby="chap-${i}">
      <div class="lp-chap__art">${chapterArt(c, i)}<div class="lp-chap__title">${esc(c.short)}</div></div>
      <div class="lp-chap__body">
        <div>
          <div class="flex flex-wrap gap-1.5"><span class="hj-chip hj-chip--blue">Bab ${String(c.number).padStart(2, '0')}</span><span class="hj-chip">${esc(c.badge)}</span><span class="hj-chip">${c.steps.length} langkah · ${esc(c.duration)}</span></div>
          <h3 id="chap-${i}" class="mt-3">${esc(c.title)}</h3>
          <p>${esc(c.desc)}</p>
        </div>
        <a href="modul.html?bab=${c.number}" class="hj-btn hj-btn--sm">Buka bab</a>
      </div>
    </article>`).join('');
    const cards = $$('.lp-chap', host);
    const count = $('#stack-count'), link = $('#stack-link');
    if (!canAnimate) return;
    cards.forEach((card, i) => {
      M.inView(card, () => {
        count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
        link.href = `modul.html?bab=${CH[i].number}`;
      }, { amount: 0.55 });
      if (i < cards.length - 1 && M.scroll) {
        M.scroll(M.animate(card, { scale: [1, 0.9], opacity: [1, 0.35] }, { ease: 'linear' }), { target: cards[i + 1], offset: ['start end', 'start start'] });
      }
    });
  }

  // ───────── Objek krom 3D ─────────
  function initChrome() {
    $$('.lp-chrome-obj').forEach((obj) => {
      const g = obj.dataset.glyph;
      const layers = 16;
      obj.innerHTML = Array.from({ length: layers }, (_, i) => `<span class="${i === layers - 1 ? 'front hj-chrome' : 'back'}" style="transform:translateZ(${(i - layers) * 1.6}px);${i < layers - 1 ? `opacity:${0.4 + (i / layers) * 0.6}` : ''}">${esc(g)}</span>`).join('');
      if (canAnimate) M.animate(obj, { rotateY: [-32, 32], rotateX: [10, -8], y: [-10, 10] }, { duration: 7, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' });
      else obj.style.transform = 'rotateY(-20deg) rotateX(6deg)';
    });
  }

  // ───────── Fitur ─────────
  function initFeatures() {
    const F = [
      ['sports_esports', 'Kuis Arena', 'Mode latihan dan Tantangan Kilat dengan combo, lencana, dan pembahasan tiap soal.', 'kuis.html'],
      ['travel_explore', 'Simulator Riset', 'Uji operator pencarian di mesin pencari mini dan selesaikan misi riset.', 'simulator.html'],
      ['smart_toy', 'Tanya AI', 'Minta penjelasan ulang materi dengan bahasa yang lebih santai.', 'tanya-ai.html'],
      ['edit_note', 'Catatan Belajar', 'Tulis ringkasan dengan bahasamu sendiri, tersimpan per bab.', 'catatan.html'],
      ['assignment', 'Tugas & Rubrik', 'Panduan tugas lengkap dengan rubrik penilaian yang jelas.', 'tugas.html'],
      ['forum', 'Komunitas', 'Diskusi dan berbagi temuan riset dengan teman sekelas.', 'komunitas.html'],
    ];
    $('#features').innerHTML = F.map(([ic, t, d, h]) => `<a href="${h}" class="lp-feature">
      <div class="lp-feature__art"><span class="material-symbols-outlined" aria-hidden="true">${ic}</span></div>
      <div class="py-1 pr-1"><h3>${t}</h3><p>${d}</p><span class="hj-link text-[13px] mt-3 inline-block text-[#2340FF]">Buka</span></div>
    </a>`).join('');
  }

  // ───────── Tombol suara ─────────
  function initSound() {
    const b = $('#sound-btn');
    if (!window.X) { b.hidden = true; return; }
    const paint = () => {
      const on = X.sfx.enabled();
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', on ? 'Efek suara aktif — klik untuk mematikan' : 'Efek suara mati — klik untuk menyalakan');
      b.firstElementChild.textContent = on ? 'volume_up' : 'volume_off';
    };
    paint();
    b.addEventListener('click', () => { X.sfx.toggle(); paint(); if (canAnimate) M.animate(b, { scale: [0.85, 1] }, { type: 'spring', stiffness: 400, damping: 15 }); });
  }

  // ───────── Drawer "Mulai belajar" ─────────
  function initDrawer() {
    const d = $('#drawer');
    const panel = $('.lp-drawer__panel', d);
    const scrim = $('.lp-drawer__scrim', d);
    let opener = null;
    const name = user ? X.firstName(user.name) : '';
    $('#drawer-body').innerHTML = user ? `
      <h2 id="drawer-title" class="hj-display text-[40px] mt-6">Halo, ${esc(name)}.</h2>
      <p class="text-[#9AA3BC] mt-3 text-[15px]">Progres, XP, dan lencanamu sudah menunggu.</p>
      <div class="grid gap-3 mt-8">
        <a href="dashboard.html" class="hj-btn hj-btn--lg w-full">Buka dashboard</a>
        <a href="modul.html" class="hj-btn hj-btn--ghost hj-btn--lg w-full">Lanjut ke modul</a>
      </div>` : `
      <h2 id="drawer-title" class="hj-display text-[40px] mt-6">Mulai dalam <span class="hj-dim">3 langkah.</span></h2>
      <div class="mt-6">
        <div class="lp-step"><span class="lp-step__n">01</span><div><b>Buat akun</b><p>Daftar dengan nama dan kelasmu agar progres tersimpan.</p></div></div>
        <div class="lp-step"><span class="lp-step__n">02</span><div><b>Pilih bab</b><p>Mulai dari Bab 1 — sekitar 25 menit untuk paham cara kerja mesin pencari.</p></div></div>
        <div class="lp-step"><span class="lp-step__n">03</span><div><b>Kumpulkan XP</b><p>Selesaikan langkah, kuis, dan misi untuk naik level.</p></div></div>
      </div>
      <div class="grid gap-3 mt-8 relative">
        <a href="register.html" class="hj-btn hj-btn--lg w-full">Daftar akun</a>
        <a href="login.html" class="hj-btn hj-btn--ghost hj-btn--lg w-full">Saya sudah punya akun</a>
      </div>`;

    function open(e) {
      opener = e && e.currentTarget;
      d.hidden = false;
      document.body.style.overflow = 'hidden';
      if (window.X) X.sfx.click();
      if (canAnimate) {
        M.animate(scrim, { opacity: [0, 1] }, { duration: 0.3 });
        M.animate(panel, { x: [60, 0], opacity: [0, 1] }, { type: 'spring', stiffness: 260, damping: 28 });
        M.animate($$('#drawer-body > *', panel), { opacity: [0, 1], y: [14, 0] }, { delay: M.stagger(0.05, { startDelay: 0.1 }), duration: 0.45, ease: EASE });
      }
      $('[data-drawer-close].lp-icon-btn', d).focus();
    }
    function close() {
      const done = () => { d.hidden = true; document.body.style.overflow = ''; if (opener) opener.focus(); };
      if (!canAnimate) return done();
      M.animate(scrim, { opacity: 0 }, { duration: 0.2 });
      M.animate(panel, { x: 60, opacity: 0 }, { duration: 0.22, ease: [0.55, 0, 1, 0.45] }).finished.then(done);
    }
    $$('[data-drawer-open]').forEach((b) => b.addEventListener('click', open));
    $$('[data-drawer-close]', d).forEach((b) => b.addEventListener('click', close));
    d.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { // jebakan fokus sederhana
        const f = $$('a[href], button:not([disabled])', panel);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
  }

  function init() {
    initHeader();
    initMarquee();
    initFeatures();
    initStack();
    initHero();
    initAscii();
    initScrollWords();
    initCard();
    initConverter();
    initEngine();
    initChrome();
    initSound();
    initDrawer();
    if (window.HJMotion) HJMotion.reveal(); // isi dinamis (fitur, bab) ikut animasi masuk
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
