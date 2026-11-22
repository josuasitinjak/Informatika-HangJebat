/**
 * motion-ui.js — sistem animasi bersama berbasis Motion (motion.dev, dulu Framer Motion).
 * Butuh build UMD Motion (window.Motion) dimuat lebih dulu:
 *   <script src="https://cdn.jsdelivr.net/npm/motion@12.23.12/dist/motion.js"></script>
 *
 * Atribut deklaratif:
 *   data-m="up|fade|scale|left|right"  → muncul saat masuk layar (sekali)
 *   data-m-delay="0.1"                 → jeda (detik)
 *   data-m-stagger                     → anak-anaknya muncul bergiliran saat kontainer terlihat
 *   data-m-count="42"                  → angka dihitung naik saat terlihat
 *   data-m-page                        → elemen halaman: masuk halus saat dimuat, keluar halus saat pindah halaman
 *   #hj-scroll-progress                → bilah progres baca yang mengikuti scroll
 *
 * API JS (untuk konten dinamis): HJMotion.reveal(root), HJMotion.enter(el, dir), HJMotion.pop(el), HJMotion.count(el, to)
 *
 * Prinsip: animasi hanya transform & opacity; durasi 0,2–0,6 dtk; pegas untuk interaksi;
 * semuanya mati bila pengguna memilih "kurangi gerakan".
 */
(function () {
  'use strict';
  const M = window.Motion;
  const root = document.documentElement;
  const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const EASE_OUT = [0.22, 1, 0.36, 1];

  function showAll(scope) {
    (scope || document).querySelectorAll('[data-m], [data-m-stagger] > *').forEach((el) => { el.style.opacity = 1; });
  }

  // Tanpa Motion atau gerakan dikurangi → tampilkan konten apa adanya, API jadi no-op aman.
  if (!M || reduced) {
    root.classList.remove('hj-motion');
    window.HJMotion = {
      enabled: false,
      reveal: showAll,
      enter() {}, pop() {},
      count(el, to) { if (el) el.textContent = Number(to).toLocaleString('id-ID'); },
    };
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('[data-m-count]').forEach((el) => { el.textContent = Number(el.dataset.mCount || 0).toLocaleString('id-ID'); });
    });
    return;
  }

  const { animate, inView, scroll, stagger } = M;

  const FROM = {
    up: { opacity: [0, 1], y: [18, 0] },
    fade: { opacity: [0, 1] },
    scale: { opacity: [0, 1], scale: [0.94, 1] },
    left: { opacity: [0, 1], x: [-24, 0] },
    right: { opacity: [0, 1], x: [24, 0] },
  };

  function revealOne(el) {
    if (el._hjM) return;
    el._hjM = true;
    const kind = FROM[el.dataset.m] || FROM.up;
    inView(el, () => {
      animate(el, kind, { duration: 0.55, ease: EASE_OUT, delay: parseFloat(el.dataset.mDelay || '0') });
    }, { amount: 0.15 });
  }

  function staggerOne(el) {
    if (el._hjM) return;
    el._hjM = true;
    inView(el, () => {
      const kids = Array.from(el.children);
      if (!kids.length) return;
      animate(kids, { opacity: [0, 1], y: [14, 0] }, { duration: 0.45, ease: EASE_OUT, delay: stagger(0.06, { startDelay: parseFloat(el.dataset.mDelay || '0') }) });
    }, { amount: 0.1 });
  }

  function count(el, to) {
    if (!el) return;
    const target = Number(to !== undefined ? to : el.dataset.mCount) || 0;
    animate(0, target, {
      duration: Math.min(1.4, 0.5 + target / 400),
      ease: EASE_OUT,
      onUpdate: (v) => { el.textContent = Math.round(v).toLocaleString('id-ID'); },
    });
  }

  function countOne(el) {
    if (el._hjC) return;
    el._hjC = true;
    el.textContent = '0';
    inView(el, () => count(el), { amount: 0.6 });
  }

  function reveal(scope) {
    const s = scope || document;
    s.querySelectorAll('[data-m]').forEach(revealOne);
    s.querySelectorAll('[data-m-stagger]').forEach(staggerOne);
    s.querySelectorAll('[data-m-count]').forEach(countOne);
  }

  /** Transisi isi yang berganti (mis. langkah pelajaran). dir: 1 = maju, -1 = mundur */
  function enter(el, dir) {
    if (!el) return;
    const d = dir === -1 ? -1 : 1;
    animate(el, { opacity: [0, 1], x: [16 * d, 0] }, { duration: 0.32, ease: EASE_OUT });
  }

  /** Umpan balik singkat (benar, simpan, dsb.) */
  function pop(el) {
    if (!el) return;
    animate(el, { scale: [1, 1.04, 1] }, { duration: 0.36, ease: 'easeOut' });
  }

  // ─── Transisi halaman ───
  function pageEnter() {
    const page = document.querySelector('[data-m-page]');
    if (page) animate(page, { opacity: [0, 1], y: [10, 0] }, { duration: 0.4, ease: EASE_OUT });
  }
  function pageExitOnNavigate() {
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href');
      if (!/^[a-z0-9_-]+\.html(\?[^#]*)?$/i.test(href)) return; // hanya halaman lokal, bukan anchor
      const page = document.querySelector('[data-m-page]');
      if (!page) return;
      e.preventDefault();
      animate(page, { opacity: 0, y: -6 }, { duration: 0.16, ease: [0.55, 0, 1, 0.45] }).finished.then(() => { location.href = href; });
      setTimeout(() => { location.href = href; }, 400); // pengaman
    });
    // Saat kembali lewat tombol Back (bfcache), pastikan halaman terlihat lagi.
    window.addEventListener('pageshow', (ev) => {
      if (ev.persisted) document.querySelectorAll('[data-m-page]').forEach((p) => { p.style.opacity = 1; p.style.transform = 'none'; });
    });
  }

  function scrollProgress() {
    const bar = document.getElementById('hj-scroll-progress');
    if (bar) scroll(animate(bar, { scaleX: [0, 1] }, { ease: 'linear' }));
  }

  window.HJMotion = { enabled: true, reveal, enter, pop, count, animate, stagger };

  function init() {
    pageEnter();
    reveal();
    scrollProgress();
    pageExitOnNavigate();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
