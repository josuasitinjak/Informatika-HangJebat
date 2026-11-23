/**
 * demo-videos.js — "video demo" animasi (gaya rekaman layar dipercepat) untuk Peta Materi.
 * Tiap adegan adalah antarmuka HTML realistis 960×540 yang diskalakan ke kartu, dimainkan oleh
 * kursor virtual: bergerak, klik, mengetik, dengan caption langkah & bilah progres.
 *
 *   DemoVideos.mount(el, 'search' | 'law' | 'data')
 *
 * Diputar berulang hanya saat terlihat; berhenti saat keluar layar. Dengan "kurangi gerakan",
 * langsung menampilkan keadaan akhir (statis). Animasi memakai Motion (window.Motion) bila ada.
 * Semua angka di adegan data dihitung dari DATA contoh di bawah (diberi label "data contoh").
 */
(function () {
  'use strict';
  const M = window.Motion || null;
  const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const STOP = { stop: true };
  const W = 960, H = 540;
  const fmt1 = (n) => n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const CURSOR = '<svg class="vd-cursor" viewBox="0 0 24 24"><path d="M4 2 L4 19 L8.6 14.8 L11.6 21.4 L14.4 20.2 L11.4 13.7 L17.6 13.4 Z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  const ic = (n) => `<span class="material-symbols-outlined">${n}</span>`;

  // ───────── Pemutar ─────────
  function mount(host, sceneName) {
    const def = SCENES[sceneName];
    if (!host || !def) return null;
    host.innerHTML = `<div class="vd" role="img" aria-label="${def.label}">
      <div class="vd-stage"></div>
      <div class="vd-ui" aria-hidden="true"><div class="vd-cap vd-hide"></div><div class="vd-bar"><i></i></div></div>
    </div>`;
    const vd = host.firstElementChild;
    const stage = vd.querySelector('.vd-stage');
    const cap = vd.querySelector('.vd-cap');
    const bar = vd.querySelector('.vd-bar i');
    let scale = 1;
    const fit = () => { scale = (vd.clientWidth || W) / W; stage.style.transform = `scale(${scale})`; };
    new ResizeObserver(fit).observe(vd);
    fit();

    let token = null;

    function makeCtx(tok, instant) {
      let cx = 760, cy = 470;
      let cur;
      const A = (el, kf, opt) => {
        if (!el) return Promise.resolve();
        if (M && !instant) return M.animate(el, kf, Object.assign({ duration: 0.35, ease: [0.22, 1, 0.36, 1] }, opt || {})).finished;
        // tanpa Motion / mode statis: terapkan nilai akhir
        const last = (v) => (Array.isArray(v) ? v[v.length - 1] : v);
        const t = [];
        Object.keys(kf).forEach((k) => {
          const v = last(kf[k]);
          if (k === 'opacity') el.style.opacity = v;
          else if (k === 'x') t.push(`translateX(${typeof v === 'number' ? v + 'px' : v})`);
          else if (k === 'y') t.push(`translateY(${typeof v === 'number' ? v + 'px' : v})`);
          else if (k === 'scale') t.push(`scale(${v})`);
          else if (k === 'scaleX') t.push(`scaleX(${v})`);
          else if (k === 'scaleY') t.push(`scaleY(${v})`);
          else el.style[k] = v;
        });
        if (t.length) el.style.transform = t.join(' ');
        return Promise.resolve();
      };
      const live = () => { if (!tok.alive) throw STOP; };
      const ctx = {
        instant,
        $: (s) => stage.querySelector(s),
        $$: (s) => Array.from(stage.querySelectorAll(s)),
        A,
        async wait(ms) { if (!instant) await new Promise((r) => setTimeout(r, ms)); live(); },
        pos(el, ax, ay) {
          const sr = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
          return { x: (r.left - sr.left + r.width * (ax === undefined ? 0.5 : ax)) / scale, y: (r.top - sr.top + r.height * (ay === undefined ? 0.5 : ay)) / scale };
        },
        async move(target, dur, ax, ay) {
          const p = target && target.nodeType ? ctx.pos(target, ax, ay) : target;
          cx = p.x; cy = p.y;
          await A(cur, { x: cx, y: cy }, { duration: dur || 0.55, ease: [0.45, 0, 0.2, 1] });
          live();
        },
        async click() {
          if (instant) return;
          const r = document.createElement('div');
          r.className = 'vd-ripple'; r.style.left = cx + 'px'; r.style.top = cy + 'px';
          stage.appendChild(r);
          A(cur, { scale: [1, 0.82, 1] }, { duration: 0.22 });
          A(r, { scale: [0.3, 1.5], opacity: [1, 0] }, { duration: 0.5 }).then(() => r.remove());
          await ctx.wait(160);
        },
        async type(el, text, ms) {
          const speed = ms || 42;
          const caret = document.createElement('span'); caret.className = 'vd-caret';
          if (instant) { el.append(text); return; }
          el.appendChild(caret);
          for (const ch of text) {
            caret.before(ch);
            await ctx.wait(speed * (0.6 + Math.random() * 0.8));
          }
          caret.remove();
        },
        async key(label, near) {
          if (instant) return;
          const p = near ? ctx.pos(near, 1, 1) : { x: cx, y: cy };
          const k = document.createElement('div');
          k.className = 'vd-key'; k.textContent = label;
          k.style.left = Math.min(W - 120, p.x - 40) + 'px'; k.style.top = Math.min(H - 50, p.y + 10) + 'px';
          stage.appendChild(k);
          await A(k, { scale: [0.6, 1.08, 1], opacity: [0, 1] }, { duration: 0.3 });
          await ctx.wait(420);
          A(k, { opacity: 0, y: 8 }, { duration: 0.25 }).then(() => k.remove());
        },
        caption(step, text) {
          cap.innerHTML = `<b>${step}</b>${text}`;
          cap.classList.remove('vd-hide');
          A(cap, { opacity: [0, 1], y: [6, 0] }, { duration: 0.3 });
        },
        async show(el, from) {
          if (!el) return;
          el.classList.remove('vd-hide');
          const f = from || {};
          await A(el, { opacity: [0, 1], y: [f.y || 0, 0], scale: [f.s || 1, 1] }, { duration: f.d || 0.35 });
          live();
        },
        async hide(el, d) {
          if (!el) return;
          await A(el, { opacity: 0 }, { duration: d || 0.25 });
          el.classList.add('vd-hide'); el.style.opacity = '';
          live();
        },
        async count(el, to, dec, dur) {
          if (instant || !M) { el.textContent = dec ? fmt1(to) : String(to); return; }
          await M.animate(0, to, { duration: dur || 0.9, ease: 'easeOut', onUpdate: (v) => { el.textContent = dec ? fmt1(v) : String(Math.round(v)); } }).finished;
          live();
        },
      };
      ctx.setCursor = (c) => { cur = c; A(cur, { x: cx, y: cy }, { duration: 0 }); };
      return ctx;
    }

    function build(ctx) {
      stage.innerHTML = def.html() + CURSOR;
      cap.classList.add('vd-hide');
      ctx.setCursor(stage.querySelector('.vd-cursor'));
    }

    async function loop(tok) {
      while (tok.alive) {
        const ctx = makeCtx(tok, false);
        build(ctx);
        stage.style.opacity = '1';
        if (M) M.animate(bar, { scaleX: [0, 1] }, { duration: def.duration, ease: 'linear' });
        try {
          await def.play(ctx);
          await ctx.wait(1600);
          await ctx.A(stage, { opacity: 0 }, { duration: 0.45 });
        } catch (e) {
          if (e !== STOP) { console.error('DemoVideos', e); return; }
          return;
        }
      }
    }

    function start() { if (token && token.alive) return; token = { alive: true }; loop(token); }
    function stop() { if (token) token.alive = false; }

    if (reduced) {
      // Keadaan akhir statis
      const tok = { alive: true };
      const ctx = makeCtx(tok, true);
      build(ctx);
      bar.style.transform = 'scaleX(1)';
      def.play(ctx).catch(() => {});
      return { start() {}, stop() {} };
    }
    new IntersectionObserver((es) => es.forEach((en) => (en.isIntersecting ? start() : stop())), { threshold: 0.3 }).observe(vd);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    return { start, stop };
  }

  // ───────── Kerangka jendela browser ─────────
  const browser = (tabs, url, page, extraPageStyle) => `
    <div class="vd-win">
      <div class="vd-top"><span class="vd-dots"><i></i><i></i><i></i></span><div class="vd-tabs">${tabs}</div></div>
      <div class="vd-addr"><span class="vd-navi">${ic('arrow_back')}${ic('arrow_forward')}${ic('refresh')}</span><div class="vd-url">${ic('lock')}<span class="vd-u">${url}</span></div></div>
      <div class="vd-page" ${extraPageStyle || ''}>${page}</div>
    </div>`;

  // ═════════ ADEGAN 1 — MESIN PENCARI ═════════
  const S1_RESULTS = [
    { fav: 'B', site: 'BMKG', path: 'https://bmkg.go.id › press-release', title: 'BMKG Bantah Hoaks Prediksi Gempa', snip: 'Siaran pers BMKG: <b>gempa</b> bumi tidak dapat diprediksi waktunya secara pasti. Masyarakat diminta waspada <b>hoaks</b>.' },
    { fav: 'B', site: 'BMKG', path: 'https://bmkg.go.id › gempabumi › terkini', title: 'Info Gempa Bumi Terkini', snip: 'Informasi <b>gempa</b> bumi terkini dari BMKG: lokasi, magnitudo, kedalaman, dan potensi tsunami.' },
    { fav: 'B', site: 'BMKG', path: 'https://bmkg.go.id › laporan', title: 'Laporan Tahunan Gempa Bumi Indonesia', snip: 'Laporan resmi statistik <b>gempa</b> bumi di wilayah Indonesia beserta analisis kegempaan.', pdf: true },
  ];
  const logo = '<div class="s1-logo"><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></div>';

  const SCENES = {};
  SCENES.search = {
    label: 'Animasi demo: mengetik kata kunci dengan operator site: di Google, tahap crawling-indexing-ranking, hasil pencarian, lalu triangulasi tiga sumber.',
    duration: 17,
    html: () => browser(
      `<div class="vd-tab is-on"><span class="vd-fav" style="background:#4285F4">G</span><span class="vd-t1">Google</span></div>
       <div class="vd-tab vd-hide" data-tab2><span class="vd-fav" style="background:#188038">B</span><span>BMKG — Siaran Pers</span></div>`,
      'google.com',
      `<div class="s1-load"></div>
       <div class="s1-home">
         ${logo}
         <div class="s1-box" data-box>${ic('search')}<span class="s1-q"></span>${ic('mic')}
           <div class="s1-sug vd-hide">
             ${['hari ini', 'megathrust', 'bmkg', 'besok malam'].map((s) => `<div>${ic('search')}<span>hoaks gempa <b>${s}</b></span></div>`).join('')}
           </div>
         </div>
         <div class="s1-btns"><span>Penelusuran Google</span><span>Saya Lagi Beruntung</span></div>
         <div class="s1-tip vd-hide"><b>site:</b> membatasi pencarian hanya di satu situs — di sini situs resmi BMKG.</div>
       </div>
       <div class="s1-serp vd-hide">
         <div class="s1-head">${logo}<div class="s1-box">${ic('search')}<span class="s1-q">hoaks gempa <span class="s1-op">site:bmkg.go.id</span></span>${ic('close')}</div></div>
         <div class="s1-tabsrow"><span class="on">Semua</span><span>Berita</span><span>Gambar</span><span>Video</span><span>Lainnya</span></div>
         
         <div class="s1-res">
           ${S1_RESULTS.map((r, i) => `<div class="s1-r vd-hide" data-r="${i}">
             <span class="s1-rank vd-hide">${i + 1}</span>
             <div class="s1-site"><i>${r.fav}</i><div>${r.site}<small>${r.path}</small></div></div>
             <div class="s1-title">${r.pdf ? '<span class="s1-pdf">PDF</span>' : ''}${r.title}</div>
             <div class="s1-snip">${r.snip}</div></div>`).join('')}
         </div>
         <div class="s1-pipe vd-hide">
           <div data-p="0">${ic('bug_report')}1 · Crawling</div>
           <div data-p="1">${ic('database')}2 · Indexing</div>
           <div data-p="2">${ic('leaderboard')}3 · Ranking</div>
         </div>
         <div class="s1-tri vd-hide">
           <h4>Triangulasi 3 sumber</h4>
           <ul>
             <li data-t="0">${ic('check_circle')}Sumber resmi · bmkg.go.id</li>
             <li data-t="1">${ic('check_circle')}Sumber berita terverifikasi</li>
             <li data-t="2">${ic('check_circle')}Jurnal / pakar kegempaan</li>
           </ul>
           <div class="s1-verdict vd-hide">${ic('verified')}Gempa tidak bisa diprediksi → info itu hoaks</div>
         </div>
       </div>`),
    async play(c) {
      const box = c.$('[data-box]'), q = c.$('.s1-home .s1-q');
      c.caption('1/4', 'Ketik kata kunci + operator pencarian');
      await c.wait(400);
      await c.move(box, 0.8, 0.3);
      await c.click();
      box.classList.add('is-focus');
      await c.type(q, 'hoaks gempa ', 70);
      box.classList.add('is-open');
      await c.show(c.$('.s1-sug'), { y: -4 });
      await c.wait(500);
      await c.hide(c.$('.s1-sug'), 0.15);
      box.classList.remove('is-open');
      const op = document.createElement('span'); op.className = 's1-op'; q.appendChild(op);
      await c.type(op, 'site:bmkg.go.id', 60);
      await c.show(c.$('.s1-tip'), { y: 6 });
      await c.wait(1300);
      await c.key('Enter ↵', box);
      await c.hide(c.$('.s1-tip'), 0.15);
      // memuat
      c.caption('2/4', 'Di balik layar: crawling → indexing → ranking');
      await c.A(c.$('.s1-load'), { scaleX: [0, 1], opacity: [1, 1, 0] }, { duration: 0.7 });
      c.$('.vd-u').textContent = 'google.com/search?q=hoaks+gempa+site%3Abmkg.go.id';
      c.$('.s1-home').classList.add('vd-hide');
      await c.show(c.$('.s1-serp'));
      await c.show(c.$('.s1-pipe'), { y: 8 });
      for (const p of c.$$('[data-p]')) { p.classList.add('on'); await c.wait(450); }
      for (const r of c.$$('.s1-r')) { await c.show(r, { y: 12, d: 0.3 }); await c.wait(80); }
      c.caption('3/4', 'Ranking: sumber paling relevan & kredibel di atas');
      for (const r of c.$$('.s1-rank')) { await c.show(r, { s: 0.4 }); await c.wait(120); }
      await c.wait(700);
      await c.hide(c.$('.s1-pipe'), 0.2);
      const first = c.$('[data-r="0"] .s1-title');
      await c.move(first, 0.7, 0.35);
      c.$('[data-r="0"]').classList.add('is-hover');
      await c.wait(250);
      await c.click();
      c.caption('4/4', 'Membaca lateral: buka tab lain & bandingkan 3 sumber');
      await c.show(c.$('[data-tab2]'), { y: 6 });
      await c.show(c.$('.s1-tri'), { y: 10, s: 0.97 });
      for (const t of c.$$('[data-t]')) { await c.wait(380); t.classList.add('ok'); }
      await c.show(c.$('.s1-verdict'), { s: 0.9 });
      await c.move(c.$('.s1-verdict'), 0.6, 0.85, 0.5);
    },
  };

  // ═════════ ADEGAN 2 — HUKUM & PERUNDANG-UNDANGAN DIGITAL ═════════
  SCENES.law = {
    label: 'Animasi demo: peringatan UU ITE saat akan menyebarkan hoaks, mengecek sumber, menolak permintaan data pribadi (UU PDP), dan meminta izin serta mencantumkan sumber saat membagikan karya (UU Hak Cipta).',
    duration: 24,
    html: () => browser(
      `<div class="vd-tab is-on"><span class="vd-fav" style="background:#000">𝕏</span><span>Beranda / X</span></div>`,
      'x.com/home',
      `<div class="s2">
         <div class="s2-rail"><b>𝕏</b>${ic('home')}${ic('search')}${ic('notifications')}${ic('mail')}${ic('person')}</div>
         <div class="s2-feed">
           <div class="s2-card" data-composer>
             <div class="s2-row"><span class="s2-ava"></span><div class="s2-text ph">Apa yang sedang terjadi?</div></div>
             <div class="s2-tools"><span>${ic('image')}${ic('gif_box')}${ic('mood')}${ic('location_on')}</span><span class="s2-post" data-post>Posting</span></div>
           </div>
           <div data-newpost></div>
           <div class="s2-card">
             <div class="s2-row"><span class="s2-ava alt"></span><div><div class="s2-name">Info Viral 24 <span>@infoviral24 · 2 j</span></div>
             <div class="s2-body">Grup sebelah rame bahas gempa besar besok malam 😱 beneran nggak sih?</div></div></div>
           </div>
         </div>
         <div class="s2-side">
           <div class="s2-check vd-hide" data-check>
             <h5>${ic('travel_explore')}Cek sumber</h5>
             <div class="s2-src"><small>bmkg.go.id › press-release</small><div>BMKG: gempa bumi tidak dapat diprediksi waktunya secara pasti</div></div>
             <div class="s2-ok">${ic('verified')}Sumber resmi</div>
           </div>
           <div class="s2-dm vd-hide" data-dm>
             <div class="s2-name">Hadiah Kuota 🎁 <span>@promo_kuota99</span></div>
             <div class="s2-bubble" data-dmtext>Selamat! Kamu menang kuota 50 GB. Kirim <span data-f1>foto KTP</span>, <span data-f2>nomor HP</span>, dan <span data-f3>kode OTP</span> ya biar hadiahnya cair 😉</div>
             <div class="s2-pdp vd-hide" data-pdp><b>UU PDP No. 27/2022:</b> nomor identitas, nomor HP, dan data pribadi lain dilindungi. Pengumpulannya wajib dengan persetujuan pemilik data — dan OTP jangan pernah dibagikan.</div>
             <span class="s2-btn vd-hide" data-report>Laporkan & blokir</span>
           </div>
           <div class="s2-dm vd-hide" data-share>
             <div class="s2-name">Bagikan ulang video</div>
             <div class="s2-video">${ic('play_circle')}</div>
             <div class="s2-credit"><span class="s2-toggle" data-tg1></span>Sudah minta izin @kreator_asli</div>
             <div class="s2-credit"><span class="s2-toggle" data-tg2></span>Cantumkan sumber & nama kreator</div>
             <span class="s2-btn vd-hide" style="background:#1D9BF0" data-sharebtn>Bagikan</span>
             <div class="s2-ok vd-hide" data-shareok>${ic('verified')}Sesuai UU Hak Cipta No. 28/2014</div>
           </div>
         </div>
         <div class="s2-dim vd-hide" data-dim></div>
         <div class="s2-warn vd-hide" data-warn>
           <div class="s2-tag">Pengingat belajar · Informatika</div><h4>${ic('gpp_maybe')}Tunggu dulu!</h4>
           <p>Informasi ini belum terverifikasi. Menyebarkan pemberitahuan bohong yang menimbulkan kerusuhan di masyarakat dapat dijerat UU ITE.</p>
           <span class="s2-law">UU No. 1/2024 · Pasal 28 ayat (3)</span>
           <div class="s2-acts"><span>Tetap posting</span><span class="pri" data-cek>Cek sumber dulu</span></div>
         </div>
       </div>`),
    async play(c) {
      const text = c.$('.s2-text'), post = c.$('[data-post]');
      c.caption('UU ITE', 'Ikut menyebarkan kabar yang belum jelas?');
      await c.wait(400);
      await c.move(text, 0.8, 0.2);
      await c.click();
      text.textContent = ''; text.classList.remove('ph');
      await c.type(text, 'BREAKING‼ Gempa besar akan terjadi besok malam. SEBARKAN sebelum dihapus!!', 30);
      await c.move(post, 0.6);
      await c.click();
      await c.show(c.$('[data-dim]'), { d: 0.2 });
      await c.show(c.$('[data-warn]'), { s: 0.9, y: 10 });
      await c.wait(2200);
      await c.move(c.$('[data-cek]'), 0.6);
      await c.click();
      await c.hide(c.$('[data-warn]'), 0.2);
      await c.hide(c.$('[data-dim]'), 0.2);
      c.caption('Cek sumber', 'Bandingkan dengan sumber resmi sebelum membagikan');
      await c.show(c.$('[data-check]'), { y: 10 });
      await c.wait(1200);
      // tulis ulang dengan benar
      await c.move(text, 0.6, 0.5);
      await c.click();
      text.style.background = '#CFE3FF';
      await c.wait(250);
      text.style.background = '';
      text.textContent = '';
      await c.type(text, 'Info gempa "besok malam" itu HOAKS ya. Gempa tidak bisa diprediksi waktunya — cek bmkg.go.id 🙏', 26);
      await c.move(post, 0.5);
      await c.click();
      const np = document.createElement('div');
      np.className = 's2-card vd-hide';
      np.style.marginTop = '10px';
      np.innerHTML = `<div class="s2-row"><span class="s2-ava ok"></span><div><div class="s2-name">Kamu <span>@siswa_xi · 1 dtk</span></div><div class="s2-body">${text.textContent}</div><div class="s2-ok">${ic('verified')}Sumber jelas · bmkg.go.id</div></div></div>`;
      c.$('[data-newpost]').appendChild(np);
      text.textContent = 'Apa yang sedang terjadi?'; text.classList.add('ph');
      await c.show(np, { y: -10 });
      c.caption('Etika digital', 'Verifikasi dulu, baru bagikan');
      await c.wait(1200);
      // UU PDP
      await c.hide(c.$('[data-check]'));
      c.caption('UU PDP', 'Data pribadi bukan untuk dibagikan sembarangan');
      await c.show(c.$('[data-dm]'), { y: 10 });
      await c.wait(900);
      for (const f of ['[data-f1]', '[data-f2]', '[data-f3]']) { c.$(f).classList.add('s2-flag'); await c.wait(300); }
      await c.show(c.$('[data-pdp]'), { y: 6 });
      await c.show(c.$('[data-report]'), { s: 0.9 });
      await c.wait(1300);
      await c.move(c.$('[data-report]'), 0.6);
      await c.click();
      c.$('[data-dmtext]').innerHTML = '✅ Akun dilaporkan & diblokir. Data pribadimu aman.';
      c.$('[data-pdp]').classList.add('vd-hide');
      c.$('[data-report]').classList.add('vd-hide');
      await c.wait(1000);
      // UU Hak Cipta
      await c.hide(c.$('[data-dm]'));
      c.caption('UU Hak Cipta', 'Karya orang lain: minta izin & cantumkan sumber');
      await c.show(c.$('[data-share]'), { y: 10 });
      await c.move(c.$('[data-tg1]'), 0.6);
      await c.click(); c.$('[data-tg1]').classList.add('on');
      await c.move(c.$('[data-tg2]'), 0.4);
      await c.click(); c.$('[data-tg2]').classList.add('on');
      await c.show(c.$('[data-sharebtn]'), { s: 0.9 });
      await c.move(c.$('[data-sharebtn]'), 0.5);
      await c.click();
      c.$('[data-sharebtn]').classList.add('vd-hide');
      await c.show(c.$('[data-shareok]'), { s: 0.9 });
    },
  };

  // ═════════ ADEGAN 3 — ANALISIS DATA (EXCEL & POWER BI) ═════════
  const DATA = [
    ['Ayu', 90, 85, 88], ['Bima', 70, 68, 72], ['Citra', 88, 92, 90], ['Dimas', 76, 74, 80],
    ['Eka', 65, 70, 62], ['Fajar', 85, 80, 84], ['Gita', 92, 95, 89], ['Hana', 78, 82, 75],
  ].map(([n, a, b, d]) => ({ n, a, b, d, avg: Math.round(((a + b + d) / 3) * 10) / 10 }));
  DATA.forEach((r) => { r.ok = r.avg >= 75; });
  const CLASS_AVG = Math.round((DATA.reduce((s, r) => s + r.avg, 0) / DATA.length) * 10) / 10;
  const N_OK = DATA.filter((r) => r.ok).length;
  const N_NO = DATA.length - N_OK;

  function gridHtml() {
    const cols = ['', 'A', 'B', 'C', 'D', 'E', 'F'];
    let h = cols.map((c) => `<div class="h">${c}</div>`).join('');
    h += ['1', 'Nama', 'Tugas', 'UH', 'PTS', 'Rata-rata', 'Ket.'].map((t, i) => (i ? `<div class="th">${t}</div>` : `<div class="h">${t}</div>`)).join('');
    DATA.forEach((r, i) => {
      const row = i + 2;
      h += `<div class="h">${row}</div><div data-c="A${row}">${r.n}</div><div class="n" data-c="B${row}">${r.a}</div><div class="n" data-c="C${row}">${r.b}</div><div class="n" data-c="D${row}">${r.d}</div><div class="n" data-c="E${row}"></div><div data-c="F${row}"></div>`;
    });
    return h;
  }
  const C = 2 * Math.PI * 50;

  SCENES.data = {
    label: 'Animasi demo: menghitung rata-rata dengan AVERAGE dan status dengan IF di Microsoft Excel, membuat grafik, lalu dasbor interaktif di Power BI. Memakai data contoh.',
    duration: 26,
    html: () => `
      <div class="vd-win">
        <div class="vd-top"><span class="vd-dots"><i></i><i></i><i></i></span><div class="vd-tabs"><div class="vd-tab is-on" style="min-width:250px;max-width:260px"><span class="vd-fav" data-appfav style="background:#217346">X</span><span data-apptitle>Contoh_Nilai_Informatika.xlsx - Excel</span></div></div></div>
        <div class="vd-page" style="top:34px">
          <div class="s3">
            <div class="s3-ribbon"><span>File</span><span class="on" data-rb="home">Beranda</span><span data-rb="ins">Sisipkan</span><span>Rumus</span><span>Data</span></div>
            <div class="s3-tools" data-tools-home><span>${ic('content_paste')}Tempel</span><span>${ic('format_bold')}</span><span>${ic('percent')}</span><span>${ic('functions')}JumlahOtomatis</span><span>${ic('filter_alt')}Urutkan & Filter</span></div>
            <div class="s3-tools vd-hide" data-tools-ins style="margin-top:-36px"><span>${ic('table')}Tabel</span><span>${ic('image')}Gambar</span><span data-chartbtn>${ic('bar_chart')}Grafik</span><span>${ic('pie_chart')}Pai</span></div>
            <div class="s3-fx"><div class="s3-name" data-name>A1</div><div class="s3-fxi">fx</div><div class="s3-formula" data-fx></div></div>
            <div class="s3-grid">${gridHtml()}</div>
            <div class="s3-handle vd-hide" data-handle></div>
            <div class="s3-ac vd-hide" data-ac></div>
            <div class="s3-chart vd-hide" data-chart>
              <h5>Rata-rata Nilai per Siswa</h5>
              <div class="s3-bars">${DATA.map((r) => `<i class="${r.ok ? '' : 'r'}" style="height:${r.avg}%"></i>`).join('')}</div>
              <div class="s3-kkm" style="bottom:${40 + 2.14 * 75}px"></div>
              <div class="s3-axis">${DATA.map((r) => `<span>${r.n}</span>`).join('')}</div>
            </div>
          </div>
          <div class="s3-pbi vd-hide" data-pbi>
            <div class="s3-prail">${ic('menu')}<span class="material-symbols-outlined on">bar_chart</span>${ic('table_rows')}${ic('schema')}</div>
            <div class="s3-canvas">
              <div class="s3-ptitle">Laporan Nilai Informatika XI <small>Kelas: XI HJ 5 ▾ · data contoh</small></div>
              <div class="s3-kpis">
                <div class="s3-kpi"><b data-k1>0</b><span>Rata-rata kelas</span></div>
                <div class="s3-kpi"><b><span data-k2>0</span> / ${DATA.length}</b><span>Siswa tuntas (≥ 75)</span></div>
                <div class="s3-kpi"><b data-k3>0</b><span>Perlu remedial</span></div>
              </div>
              <div class="s3-vis"><h6>Rata-rata per siswa</h6>
                ${DATA.map((r) => `<div class="s3-hb" data-ok="${r.ok}"><span>${r.n}</span><i class="${r.ok ? '' : 'r'}" style="width:${(r.avg - 40) * 3.6}px"></i><em>${fmt1(r.avg)}</em></div>`).join('')}
              </div>
              <div class="s3-vis"><h6>Status ketuntasan</h6>
                <div class="s3-donut">
                  <svg viewBox="0 0 140 140" style="position:relative">
                    <circle cx="70" cy="70" r="50" fill="none" stroke="#118DFF" stroke-width="22" stroke-dasharray="${(C * N_OK) / DATA.length} ${C}" transform="rotate(-90 70 70)" data-don-ok/>
                    <circle cx="70" cy="70" r="50" fill="none" stroke="#E66C37" stroke-width="22" stroke-dasharray="${(C * N_NO) / DATA.length} ${C}" stroke-dashoffset="${-(C * N_OK) / DATA.length}" transform="rotate(-90 70 70)" data-don-no/>
                    <circle cx="${70 + 50 * Math.cos(Math.PI * 2 * (N_OK + N_NO / 2) / DATA.length - Math.PI / 2)}" cy="${70 + 50 * Math.sin(Math.PI * 2 * (N_OK + N_NO / 2) / DATA.length - Math.PI / 2)}" r="1" fill="none" data-don-hit/>
                  </svg>
                  <div class="s3-leg"><div><i style="background:#118DFF"></i>Tuntas (${N_OK})</div><div><i style="background:#E66C37"></i>Remedial (${N_NO})</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`,
    async play(c) {
      const cell = (id) => c.$(`[data-c="${id}"]`);
      const fx = c.$('[data-fx]'), name = c.$('[data-name]'), handle = c.$('[data-handle]'), ac = c.$('[data-ac]');
      const select = (id) => { c.$$('.s3-grid .sel').forEach((e) => e.classList.remove('sel')); cell(id).classList.add('sel'); name.textContent = id; };
      const s3 = c.$('.s3');
      const rel = (el, ax, ay) => { const a = c.pos(el, ax, ay), o = c.pos(s3, 0, 0); return { x: a.x - o.x, y: a.y - o.y }; };
      const placeHandle = (id) => {
        const p = rel(cell(id), 1, 1);
        handle.style.left = p.x - 4 + 'px'; handle.style.top = p.y - 4 + 'px';
        handle.classList.remove('vd-hide');
      };
      const typeBoth = async (target, txt, ms) => {
        for (const ch of txt) { target.append(ch); fx.append(ch); await c.wait(c.instant ? 0 : (ms || 55) * (0.6 + Math.random() * 0.8)); }
      };

      // 1. AVERAGE
      c.caption('Excel 1/4', 'Hitung rata-rata dengan fungsi AVERAGE');
      await c.wait(400);
      await c.move(cell('E2'), 0.8);
      await c.click(); select('E2');
      await typeBoth(cell('E2'), '=AVERAGE(');
      ac.innerHTML = '<b>AVERAGE</b>(number1; [number2]; …)';
      const pe = rel(cell('E2'), 0, 1);
      ac.style.left = pe.x + 'px'; ac.style.top = pe.y + 6 + 'px';
      await c.show(ac, { y: -4 });
      await typeBoth(cell('E2'), 'B2:D2');
      ['B2', 'C2', 'D2'].forEach((id) => cell(id).classList.add('rng'));
      await typeBoth(cell('E2'), ')');
      await c.wait(500);
      await c.key('Enter ↵', cell('E2'));
      await c.hide(ac, 0.15);
      ['B2', 'C2', 'D2'].forEach((id) => cell(id).classList.remove('rng'));
      cell('E2').textContent = fmt1(DATA[0].avg);
      fx.textContent = '=AVERAGE(B2:D2)';
      // 2. fill handle
      c.caption('Excel 2/4', 'Tarik fill handle untuk menyalin rumus ke bawah');
      placeHandle('E2');
      await c.move(handle, 0.6);
      await c.wait(200);
      await c.move(cell('E9'), 0.9, 0.95, 0.95);
      for (let i = 3; i <= 9; i++) {
        const el = cell('E' + i);
        el.classList.add('fill'); el.textContent = fmt1(DATA[i - 2].avg);
        await c.wait(70);
      }
      await c.wait(300);
      c.$$('.fill').forEach((e) => e.classList.remove('fill'));
      handle.classList.add('vd-hide');
      // 3. IF
      c.caption('Excel 3/4', 'Fungsi IF: “Tuntas” jika rata-rata ≥ 75');
      await c.move(cell('F2'), 0.6);
      await c.click(); select('F2'); fx.textContent = '';
      await typeBoth(cell('F2'), '=IF(E2>=75;"Tuntas";"Remedial")', 34);
      await c.key('Enter ↵', cell('F2'));
      const setKet = (i) => {
        const el = cell('F' + i), r = DATA[i - 2];
        el.textContent = r.ok ? 'Tuntas' : 'Remedial';
        el.className = r.ok ? 's3-ok s3-ok-bg' : 's3-no s3-no-bg';
      };
      setKet(2);
      placeHandle('F2');
      await c.move(handle, 0.5);
      await c.move(cell('F9'), 0.8, 0.95, 0.95);
      for (let i = 3; i <= 9; i++) { setKet(i); await c.wait(60); }
      handle.classList.add('vd-hide');
      // 4. grafik
      c.caption('Excel 4/4', 'Sisipkan grafik untuk melihat pola');
      await c.move(c.$('[data-rb="ins"]'), 0.7);
      await c.click();
      c.$('[data-rb="home"]').classList.remove('on'); c.$('[data-rb="ins"]').classList.add('on');
      c.$('[data-tools-home]').classList.add('vd-hide');
      await c.show(c.$('[data-tools-ins]'));
      await c.move(c.$('[data-chartbtn]'), 0.5);
      await c.click();
      c.$('[data-chartbtn]').classList.add('t-on');
      await c.show(c.$('[data-chart]'), { s: 0.92, y: 10 });
      for (const b of c.$$('.s3-bars i')) { c.A(b, { scaleY: [0, 1] }, { duration: 0.5 }); await c.wait(70); }
      await c.wait(1300);
      // 5. Power BI
      c.caption('Power BI', 'Dasbor interaktif dari data Excel yang sama');
      c.$('[data-apptitle]').textContent = 'Laporan Nilai - Power BI';
      c.$('[data-appfav]').style.background = '#F2C811'; c.$('[data-appfav]').textContent = 'B';
      await c.show(c.$('[data-pbi]'), { s: 0.98 });
      c.count(c.$('[data-k1]'), CLASS_AVG, true);
      c.count(c.$('[data-k2]'), N_OK);
      c.count(c.$('[data-k3]'), N_NO);
      for (const b of c.$$('.s3-hb i')) { c.A(b, { scaleX: [0, 1] }, { duration: 0.5 }); await c.wait(60); }
      await c.A(c.$('.s3-donut svg'), { scale: [0.6, 1], opacity: [0, 1] }, { duration: 0.5 });
      await c.wait(900);
      c.caption('Power BI', 'Klik visual → data lain ikut tersaring');
      await c.move(c.$('[data-don-hit]'), 0.8);
      await c.click();
      c.$('[data-don-ok]').style.opacity = '.25';
      c.$$('.s3-hb').forEach((h) => h.classList.toggle('dim', h.dataset.ok === 'true'));
      await c.wait(1600);
    },
  };

  window.DemoVideos = { mount };
})();
