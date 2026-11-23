/**
 * cursor-glow.js — efek cahaya yang mengikuti kursor.
 *  1) Cahaya lembut biru yang melayang mengikuti kursor di seluruh halaman.
 *  2) "Spotlight": saat kursor berada di atas kartu/panel, permukaan & tepinya ikut menyala
 *     tepat di titik kursor.
 *
 * Elemen yang otomatis mendapat spotlight: lihat SPOT_SELECTOR, atau tambahkan atribut
 * data-spot pada elemen mana pun. Matikan untuk satu elemen dengan data-spot="off".
 * Tidak aktif di perangkat sentuh dan saat pengguna memilih "kurangi gerakan".
 */
(function () {
  'use strict';
  const mq = (q) => !!(window.matchMedia && window.matchMedia(q).matches);
  if (mq('(prefers-reduced-motion: reduce)') || !mq('(hover: hover) and (pointer: fine)')) return;

  const SPOT_SELECTOR = [
    '[data-spot]',
    '.hj-glass', '.hj-panel', '.hj-card-light',
    '.lp-bento__card', '.lp-feature', '.lp-chap', '.lp-law__item', '.lp-engine__visual', '.lp-demo__card',
    'main .bg-white[class*="rounded"]',
    'main [class*="rounded-"][class*="border"]',
    '.hj-btn',
  ].join(',');

  // 1) Cahaya global
  const glow = document.createElement('div');
  glow.id = 'hj-cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  let gx = -1000, gy = -1000, tx = -1000, ty = -1000, raf = 0, shown = false;

  function loop() {
    gx += (tx - gx) * 0.18;
    gy += (ty - gy) * 0.18;
    glow.style.transform = `translate3d(${gx.toFixed(1)}px, ${gy.toFixed(1)}px, 0)`;
    raf = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5 ? requestAnimationFrame(loop) : 0;
  }

  // 2) Spotlight per elemen
  let current = null;
  function spotOf(el) {
    const s = el && el.closest ? el.closest(SPOT_SELECTOR) : null;
    if (!s || s.dataset.spot === 'off' || s.closest('#hj-cursor-glow')) return null;
    return s;
  }
  function prepare(el) {
    // Cek lapisan setiap kali: isi elemen bisa dirender ulang lewat innerHTML
    if (el.querySelector(':scope > .hj-spot-layer')) return;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    const layer = document.createElement('span');
    layer.className = 'hj-spot-layer';
    layer.setAttribute('aria-hidden', 'true');
    el.appendChild(layer);
  }
  function setSpot(el, e) {
    if (current && current !== el) current.classList.remove('is-spot');
    current = el;
    if (!el) return;
    prepare(el);
    const r = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${e.clientX - r.left}px`);
    el.style.setProperty('--spot-y', `${e.clientY - r.top}px`);
    el.classList.add('is-spot');
  }

  function onMove(e) {
    if (!shown) { shown = true; glow.classList.add('is-on'); gx = e.clientX; gy = e.clientY; }
    tx = e.clientX; ty = e.clientY;
    if (!raf) raf = requestAnimationFrame(loop);
    setSpot(spotOf(e.target), e);
  }

  function init() {
    document.body.appendChild(glow);
    document.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { shown = false; glow.classList.remove('is-on'); setSpot(null); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
