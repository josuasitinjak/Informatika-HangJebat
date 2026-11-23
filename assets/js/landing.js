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

  // ───────── Peta materi: kartu bertumpuk + video demo per materi ─────────
  // Materi semester 1 yang sudah dipelajari kelas XI (sesuai bahan ajar guru).
  const MATERI = [
    {
      scene: 'search', tag: 'Literasi digital', title: 'Mesin Pencari',
      desc: 'Fungsi & cara kerja mesin pencari (crawling, indexing, ranking), ragam mesin pencari, operator pencarian, membaca lateral, triangulasi, dan ciri sumber yang kredibel.',
      chips: ['Crawling · Indexing · Ranking', 'Operator " " - site: filetype:', 'Triangulasi'],
      href: 'modul.html?bab=1', cta: 'Buka modul',
    },
    {
      scene: 'law', tag: 'Regulasi siber', title: 'Hukum & Perundang-Undangan Digital',
      desc: 'UU ITE, UU Pelindungan Data Pribadi, dan UU Hak Cipta — hak & kewajiban warganet, studi kasus pelanggaran, sanksi, serta etika digital (netiket).',
      chips: ['UU ITE', 'UU PDP No. 27/2022', 'UU Hak Cipta No. 28/2014'],
      href: 'modul.html?bab=2', cta: 'Buka modul',
    },
    {
      scene: 'data', tag: 'Analisis data', title: 'Analisis Data: Excel & Power BI',
      desc: 'Mengolah data dengan rumus Excel (AVERAGE, IF), fill handle, dan grafik, lalu menyajikannya sebagai dasbor interaktif di Power BI.',
      chips: ['AVERAGE · IF', 'Grafik', 'Dasbor Power BI'],
      href: 'modul.html?bab=3', cta: 'Buka modul',
    },
  ];
  function initStack() {
    const host = $('#chapter-stack');
    host.innerHTML = MATERI.map((m, i) => `<article class="lp-chap" data-idx="${i}" aria-labelledby="chap-${i}">
      <div class="lp-chap__art"><div class="lp-vid" data-scene="${m.scene}"></div></div>
      <div class="lp-chap__body">
        <div>
          <div class="flex flex-wrap gap-1.5"><span class="hj-chip hj-chip--blue">Materi ${String(i + 1).padStart(2, '0')}</span><span class="hj-chip">${esc(m.tag)}</span>${m.chips.map((t) => `<span class="hj-chip">${esc(t)}</span>`).join('')}</div>
          <h3 id="chap-${i}" class="mt-3">${esc(m.title)}</h3>
          <p>${esc(m.desc)}</p>
        </div>
        ${m.href ? `<a href="${m.href}" class="hj-btn hj-btn--sm">${esc(m.cta)}</a>` : `<span class="hj-btn hj-btn--sm hj-btn--ghost text-white" aria-disabled="true">${esc(m.cta)}</span>`}
      </div>
    </article>`).join('');
    if (window.DemoVideos) $$('.lp-vid', host).forEach((el) => DemoVideos.mount(el, el.dataset.scene));
    const cards = $$('.lp-chap', host);
    const count = $('#stack-count'), link = $('#stack-link');
    count.textContent = `01 / ${String(cards.length).padStart(2, '0')}`;
    // Penghitung & tombol samping hanya tampil saat kartu materi melewati tengah layar
    const meta = $('.lp-stack-meta');
    if (meta && 'IntersectionObserver' in window) {
      new IntersectionObserver((es) => meta.classList.toggle('is-on', es.some((e) => e.isIntersecting)), { rootMargin: '-45% 0px -45% 0px' }).observe(host);
    }
    if (!canAnimate) return;
    cards.forEach((card, i) => {
      M.inView(card, () => {
        count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
        link.href = MATERI[i].href || 'modul.html';
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

  // ───────── Maskot 3D di seksi Etika digital (Three.js dimuat saat seksi mendekat) ─────────
  function loadScript(src) {
    return new Promise((ok, fail) => {
      const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = fail; document.head.appendChild(s);
    });
  }
  function initLawMascot() {
    const host = $('#law-mascot');
    if (!host) return;
    let started = false;
    const start = async () => {
      if (started) return; started = true;
      try {
        if (!window.THREE) await loadScript('https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js');
        if (!window.HJRobotSVG) await loadScript('assets/js/robot-svg.js');
        if (!window.HJRobot) await loadScript('assets/js/robot.js');
      } catch (e) { /* tanpa jaringan: coba cadangan 2D bila sudah ada */ }
      const api = window.HJRobot || window.HJRobotSVG;
      if (!api) { host.remove(); return; }
      const bot = api.mount(host, {
        size: 320, bubble: true, mood: 'think',
        lines: ['Saring dulu sebelum sharing!', 'Data pribadimu berharga, jaga ya.', 'Karya orang lain? Minta izin & cantumkan sumber.', 'Beda pendapat boleh, tetap sopan ya.'],
      });
      if (canAnimate) M.animate(host, { opacity: [0, 1], y: [20, 0] }, { duration: 0.7, ease: EASE });
      // Saat kartu UU disorot, maskot menoleh ke kartu itu
      $$('.lp-law__item').forEach((card) => {
        card.addEventListener('mouseenter', () => bot && bot.lookAt && bot.lookAt(card));
        card.addEventListener('mouseleave', () => bot && bot.lookAt && bot.lookAt(null));
      });
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '400px 0px' });
      io.observe(host);
    } else start();
  }

  // ───────── Fitur ─────────
  function initFeatures() {
    const F = [
      ['sports_esports', 'Kuis Arena', 'Mode latihan dan Tantangan Kilat dengan combo, lencana, dan pembahasan tiap soal.', 'kuis.html'],
      ['travel_explore', 'Simulator Riset', 'Uji operator pencarian di mesin pencari mini dan selesaikan misi riset.', 'simulator.html'],
      ['smart_toy', 'Tanya AI', 'Minta penjelasan ulang materi dengan bahasa yang lebih santai.', 'tanya-ai.html'],
      ['edit_note', 'Catatan Belajar', 'Tulis ringkasan dengan bahasamu sendiri, tersimpan per bab.', 'catatan.html'],
      ['assignment', 'Tugas & Rubrik', 'Panduan tugas lengkap dengan rubrik penilaian yang jelas.', 'tugas.html'],
      ['auto_stories', 'Modul Materi', 'Pelajaran langkah demi langkah dengan animasi, latihan, dan cek pemahaman.', 'modul.html'],
    ];
    $('#features').innerHTML = F.map(([ic, t, d, h]) => `<a href="${h}" class="lp-feature">
      <div class="lp-feature__art"><span class="material-symbols-outlined" aria-hidden="true">${ic}</span></div>
      <div class="py-1 pr-1"><h3>${t}</h3><p>${d}</p><span class="hj-link text-[13px] mt-3 inline-block text-[#2340FF]">Buka</span></div>
    </a>`).join('');
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
    initLawMascot();
    initDrawer();
    if (window.HJMotion) HJMotion.reveal(); // isi dinamis (fitur, bab) ikut animasi masuk
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
