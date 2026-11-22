/**
 * XAVETRA — Widget pelajaran interaktif & animasi
 * Setiap widget: XLessons.mount(nama, elemen, { onDone })
 * onDone() dipanggil saat siswa menuntaskan interaksi (membuka tombol "Lanjut").
 */
(function () {
  'use strict';
  const esc = (s) => (window.X ? X.esc(s) : String(s));
  const sfx = () => (window.X ? X.sfx : { click() {}, pop() {}, correct() {}, wrong() {}, whoosh() {}, tick() {}, win() {} });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [b[i], b[j]] = [b[j], b[i]]; } return b; };

  // Tombol bergaya "chunky" (ala aplikasi belajar)
  const BTN = 'inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm border-b-4 active:border-b-2 active:translate-y-0.5 transition-all select-none';
  const BTN_PRIMARY = `${BTN} bg-primary text-white border-primary-dark hover:brightness-110`;
  const BTN_GHOST = `${BTN} bg-white text-navy border-slate-200 border-2 border-b-4 hover:bg-slate-50`;

  /** Animasi FLIP: mengurutkan ulang elemen dengan gerakan halus. */
  function flip(container, reorderFn) {
    const kids = Array.from(container.children);
    const first = new Map(kids.map((k) => [k, k.getBoundingClientRect().top]));
    reorderFn();
    Array.from(container.children).forEach((k) => {
      const dy = (first.get(k) || 0) - k.getBoundingClientRect().top;
      if (!dy) return;
      k.style.transition = 'none';
      k.style.transform = `translateY(${dy}px)`;
      requestAnimationFrame(() => {
        k.style.transition = 'transform 520ms cubic-bezier(.22,1,.36,1)';
        k.style.transform = '';
      });
    });
  }

  // ═════════════════════ Dataset mesin pencari mini (dipakai playground & simulator) ═════════════════════
  const DOCS = [
    { title: 'Panduan Implementasi Kurikulum Merdeka', url: 'kemdikbud.go.id/panduan-kurikulum-merdeka.pdf', type: 'pdf', snippet: 'Dokumen resmi panduan kurikulum merdeka untuk satuan pendidikan jenjang SMA, termasuk mata pelajaran informatika fase F.' },
    { title: 'Capaian Pembelajaran Informatika Fase F', url: 'kemdikbud.go.id/cp-informatika-fase-f.pdf', type: 'pdf', snippet: 'Capaian pembelajaran informatika fase F kurikulum merdeka: berpikir komputasional, literasi digital, dan etika.' },
    { title: 'Download Gratis Modul Kurikulum Merdeka Lengkap!!!', url: 'modulgratis.blogspot.com/kurikulum-merdeka', type: 'html', snippet: 'Klik di sini download gratis modul kurikulum merdeka, banyak iklan promo dan link tidak jelas.' },
    { title: 'Kurikulum Merdeka: Pro dan Kontra di Sekolah', url: 'kompas.com/edu/kurikulum-merdeka', type: 'html', snippet: 'Liputan jurnalistik tentang penerapan kurikulum merdeka di berbagai sekolah, wawancara guru dan pakar pendidikan.' },
    { title: 'Info Gempa Bumi Terkini', url: 'bmkg.go.id/gempabumi/terkini', type: 'html', snippet: 'Informasi gempa bumi terkini dari BMKG: lokasi, magnitudo, kedalaman, dan potensi tsunami.' },
    { title: 'VIRAL! Gempa Besar Akan Terjadi Besok Malam', url: 'beritaheboh.xyz/gempa-besok', type: 'html', snippet: 'Kabar hoaks gempa besar besok malam beredar di grup chat, tanpa sumber resmi, sebarkan sebelum dihapus!' },
    { title: 'BMKG Bantah Hoaks Prediksi Gempa', url: 'bmkg.go.id/press-release/bantah-hoaks', type: 'html', snippet: 'Siaran pers BMKG: gempa bumi tidak dapat diprediksi waktunya secara pasti, masyarakat diminta waspada hoaks.' },
    { title: 'Laporan Tahunan Gempa Bumi Indonesia', url: 'bmkg.go.id/laporan-gempa-bumi.pdf', type: 'pdf', snippet: 'Laporan resmi statistik gempa bumi di wilayah Indonesia beserta analisis kegempaan.' },
    { title: 'Salinan UU No. 1 Tahun 2024 tentang ITE', url: 'peraturan.go.id/uu-1-2024-ite.pdf', type: 'pdf', snippet: 'Dokumen undang-undang perubahan kedua UU ITE, mengatur pasal 27, pasal 28 hoaks, pasal 30 akses ilegal.' },
    { title: 'Putusan Kasus Penyebaran Hoaks Pasal 28', url: 'mahkamahagung.go.id/putusan-pasal-28.pdf', type: 'pdf', snippet: 'Putusan pengadilan atas kasus penyebaran berita bohong melanggar pasal 28 UU ITE.' },
    { title: 'Apa Itu UU PDP? Penjelasan Sederhana', url: 'kominfo.go.id/uu-pdp-penjelasan', type: 'html', snippet: 'Penjelasan undang-undang pelindungan data pribadi nomor 27 tahun 2022 dan hak subjek data.' },
    { title: 'Jurnal: Literasi Digital Remaja Indonesia', url: 'journal.ui.ac.id/literasi-digital-remaja.pdf', type: 'pdf', snippet: 'Penelitian ilmiah peer-review tentang tingkat literasi digital dan kemampuan mengenali hoaks pada remaja.' },
    { title: 'Jaguar: Kucing Besar dari Amerika Selatan', url: 'id.wikipedia.org/wiki/Jaguar', type: 'html', snippet: 'Jaguar adalah hewan kucing besar predator yang hidup di hutan hujan Amerika Selatan.' },
    { title: 'Harga Mobil Jaguar Terbaru', url: 'otomotifku.com/mobil-jaguar', type: 'html', snippet: 'Daftar harga mobil jaguar terbaru, spesifikasi otomotif, dan promo iklan dealer.' },
    { title: 'Fakta Ilmiah Hewan Jaguar', url: 'biologi.ac.id/fakta-jaguar.pdf', type: 'pdf', snippet: 'Dokumen penelitian habitat, perilaku berburu, dan konservasi hewan jaguar.' },
    { title: 'Template Laporan Tugas Informatika', url: 'sman1batam.sch.id/template-laporan.docx', type: 'docx', snippet: 'Template laporan tugas informatika kelas XI: kronologi, analisis pasal, triangulasi sumber.' },
    { title: 'Tips Mengenali Hoaks di Media Sosial', url: 'cekfakta.com/tips-hoaks', type: 'html', snippet: 'Cara mengenali hoaks dan disinformasi: cek sumber, cek tanggal, baca lateral, dan bandingkan berita.' },
    { title: 'Promo Kuota Internet Murah Hari Ini', url: 'promokuota.biz/iklan', type: 'html', snippet: 'Iklan promo kuota internet murah, klik link dan isi data diri untuk hadiah.' },
  ];
  DOCS.forEach((d) => { d.domain = d.url.split('/')[0]; });

  /** Parser query dengan operator: "frasa", -kata, site:, filetype:, intitle:, OR */
  function parseQuery(q) {
    const res = { phrases: [], exclude: [], site: [], filetype: [], intitle: [], terms: [], orGroups: [], errors: [] };
    const re = /(-?)"([^"]+)"|(\S+)/g;
    const raw = [];
    let m;
    while ((m = re.exec(q || ''))) {
      if (m[2] !== undefined) raw.push({ kind: m[1] ? 'notphrase' : 'phrase', v: m[2].toLowerCase() });
      else raw.push({ kind: 'word', v: m[3] });
    }
    for (let i = 0; i < raw.length; i++) {
      const t = raw[i];
      if (t.kind === 'phrase') { res.phrases.push(t.v); continue; }
      if (t.kind === 'notphrase') { res.exclude.push(t.v); continue; }
      const w = t.v;
      const lw = w.toLowerCase();
      if (w === 'OR') continue;
      if (/^site:$/i.test(w) || /^filetype:$/i.test(w) || /^intitle:$/i.test(w)) { res.errors.push(`Operator "${w}" kosong. Jangan beri spasi setelah titik dua.`); continue; }
      if (lw.startsWith('site:')) { res.site.push(lw.slice(5)); continue; }
      if (lw.startsWith('filetype:')) { res.filetype.push(lw.slice(9).replace(/^\./, '')); continue; }
      if (lw.startsWith('intitle:')) { res.intitle.push(lw.slice(8)); continue; }
      if (lw.startsWith('-') && lw.length > 1) { res.exclude.push(lw.slice(1)); continue; }
      if (lw.startsWith('+')) { res.errors.push('Tanda + tidak dipakai lagi di Google. Gunakan tanda kutip untuk kata wajib.'); }
      const prevOr = raw[i - 1] && raw[i - 1].v === 'OR';
      const nextOr = raw[i + 1] && raw[i + 1].v === 'OR';
      const clean = lw.replace(/^\+/, '');
      if (prevOr && res.orGroups.length) res.orGroups[res.orGroups.length - 1].push(clean);
      else if (nextOr) res.orGroups.push([clean]);
      else res.terms.push(clean);
    }
    return res;
  }

  function search(q, docs) {
    const p = parseQuery(q);
    const list = (docs || DOCS).map((d) => {
      const text = `${d.title} ${d.snippet} ${d.url}`.toLowerCase();
      const title = d.title.toLowerCase();
      const reasons = [];
      let ok = true;
      if (p.site.length && !p.site.some((s) => d.domain === s || d.domain.endsWith('.' + s) || d.domain.endsWith(s))) { ok = false; reasons.push('domain tidak cocok'); }
      if (p.filetype.length && !p.filetype.includes(d.type)) { ok = false; reasons.push('format berkas beda'); }
      p.phrases.forEach((ph) => { if (!text.includes(ph)) { ok = false; reasons.push(`tidak ada frasa "${ph}"`); } });
      p.exclude.forEach((ex) => { if (text.includes(ex)) { ok = false; reasons.push(`mengandung "${ex}"`); } });
      p.intitle.forEach((it) => { if (!title.includes(it)) { ok = false; reasons.push(`judul tanpa "${it}"`); } });
      p.terms.forEach((t) => { if (!text.includes(t)) { ok = false; reasons.push(`tanpa kata "${t}"`); } });
      p.orGroups.forEach((g) => { if (!g.some((t) => text.includes(t))) { ok = false; reasons.push(`tanpa ${g.join('/')}`); } });
      let score = 0;
      [...p.terms, ...p.phrases, ...p.orGroups.flat()].forEach((t) => {
        if (title.includes(t)) score += 3;
        if (text.includes(t)) score += 1;
      });
      if (/\.(go|ac|sch)\.id$/.test(d.domain)) score += 2;
      return { doc: d, ok, reasons, score };
    });
    const hits = list.filter((r) => r.ok).sort((a, b) => b.score - a.score);
    return { parsed: p, hits, all: list };
  }

  function docTypeBadge(type) {
    const map = { pdf: 'bg-red-50 text-red-600 border-red-200', docx: 'bg-blue-50 text-blue-600 border-blue-200', html: 'bg-slate-50 text-slate-500 border-slate-200' };
    return `<span class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border ${map[type] || map.html}">${type}</span>`;
  }

  function resultCard(r, i) {
    const d = r.doc;
    const official = /\.(go|ac|sch)\.id$/.test(d.domain);
    return `<div class="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-primary/40 transition" style="animation:staggerIn 420ms cubic-bezier(.22,1,.36,1) ${i * 50}ms both">
      <div class="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
        <span class="w-5 h-5 rounded-md ${official ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'} flex items-center justify-center text-[10px] font-black">${esc(d.domain[0].toUpperCase())}</span>
        <span class="truncate">${esc(d.url)}</span>${docTypeBadge(d.type)}
        ${official ? '<span class="material-symbols-outlined text-[14px] text-emerald-600 icon-fill" title="Domain resmi">verified</span>' : ''}
      </div>
      <div class="text-sm font-bold text-[#1a0dab] mt-1 leading-snug">${esc(d.title)}</div>
      <div class="text-xs text-slate-600 mt-0.5 leading-relaxed">${esc(d.snippet)}</div>
    </div>`;
  }

  // ═════════════════════ WIDGET: Pipeline 3 tahap ═════════════════════
  function pipeline(el, opts) {
    el.innerHTML = `
      <div class="rounded-3xl bg-[#0B1530] p-4 sm:p-6 text-white overflow-hidden relative">
        <div class="absolute inset-0 grid-pattern opacity-30"></div>
        <div class="relative grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4" data-stages>
          ${[
            ['public', 'Crawling', 'Bot menjelajah web', 'from-sky-400 to-blue-600'],
            ['database', 'Indexing', 'Simpan kata kunci', 'from-violet-400 to-fuchsia-600'],
            ['leaderboard', 'Ranking', 'Urutkan hasil terbaik', 'from-amber-300 to-orange-500'],
          ].map(([ic, t, s, g], i) => `
            <div class="stage relative rounded-2xl bg-white/5 border border-white/10 p-4 transition-all duration-500" data-stage="${i}">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-2xl bg-gradient-to-br ${g} flex items-center justify-center shadow-lg"><span class="material-symbols-outlined icon-fill">${ic}</span></div>
                <div><div class="text-[10px] font-black text-white/50 tracking-widest">TAHAP ${i + 1}</div><div class="font-extrabold">${t}</div></div>
              </div>
              <div class="text-[11px] text-white/60 mt-2">${s}</div>
              <div class="stage-body mt-3 min-h-[92px] space-y-1.5"></div>
            </div>`).join('')}
        </div>
        <div class="relative mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p class="text-xs sm:text-sm text-blue-100 font-semibold min-h-[20px]" data-caption>Siap memutar animasi alur mesin pencari.</p>
          <button type="button" class="${BTN} bg-white text-navy border-slate-300" data-play><span class="material-symbols-outlined text-[18px] icon-fill">play_arrow</span> Putar Animasi</button>
        </div>
      </div>`;
    const stages = el.querySelectorAll('.stage');
    const cap = el.querySelector('[data-caption]');
    const btn = el.querySelector('[data-play]');
    let running = false;
    function activate(i) {
      stages.forEach((s, k) => {
        s.style.borderColor = k === i ? 'rgba(125,211,252,.8)' : 'rgba(255,255,255,.1)';
        s.style.background = k === i ? 'rgba(59,130,246,.18)' : 'rgba(255,255,255,.05)';
        s.style.transform = k === i ? 'translateY(-4px) scale(1.02)' : '';
      });
    }
    btn.addEventListener('click', async () => {
      if (running) return;
      running = true;
      btn.disabled = true;
      btn.style.opacity = '.6';
      stages.forEach((s) => (s.querySelector('.stage-body').innerHTML = ''));
      sfx().whoosh();
      // Tahap 1
      activate(0);
      cap.textContent = '🕷️ Crawler mengikuti tautan dan menemukan halaman-halaman baru…';
      const b0 = stages[0].querySelector('.stage-body');
      const pages = ['sekolah.sch.id', 'bmkg.go.id', 'berita.com', 'wiki.org'];
      for (const pg of pages) {
        b0.insertAdjacentHTML('beforeend', `<div class="anim-pop flex items-center gap-2 text-[11px] bg-white/10 rounded-lg px-2 py-1"><span class="material-symbols-outlined text-[14px] text-sky-300">description</span>${pg}</div>`);
        sfx().tick();
        await sleep(380);
      }
      await sleep(400);
      // Tahap 2
      activate(1);
      cap.textContent = '🗂️ Isi halaman dipecah jadi kata kunci dan disimpan di inverted index…';
      const b1 = stages[1].querySelector('.stage-body');
      const rows = [['gempa', '2, 3'], ['hoaks', '3'], ['sekolah', '1'], ['data', '1, 4']];
      for (const [k, v] of rows) {
        b1.insertAdjacentHTML('beforeend', `<div class="anim-pop flex justify-between text-[11px] font-mono bg-white/10 rounded-lg px-2 py-1"><span class="text-fuchsia-300">${k}</span><span class="text-white/70">→ hal. ${v}</span></div>`);
        sfx().tick();
        await sleep(380);
      }
      await sleep(400);
      // Tahap 3
      activate(2);
      cap.textContent = '🏆 Saat kamu mencari "gempa", algoritma mengurutkan halaman paling relevan & tepercaya!';
      const b2 = stages[2].querySelector('.stage-body');
      const res = [['bmkg.go.id', 96], ['berita.com', 71], ['wiki.org', 54]];
      for (let i = 0; i < res.length; i++) {
        const [s, sc] = res[i];
        b2.insertAdjacentHTML('beforeend', `<div class="anim-pop text-[11px] bg-white/10 rounded-lg px-2 py-1"><div class="flex justify-between"><span>#${i + 1} ${s}</span><span class="text-amber-300 font-bold">${sc}</span></div><div class="h-1 mt-1 rounded-full bg-white/10 overflow-hidden"><div class="h-full bg-gradient-to-r from-amber-300 to-orange-500 bar-fill" style="width:0%" data-w="${sc}"></div></div></div>`);
        await sleep(60);
        b2.lastElementChild.querySelector('[data-w]').style.width = sc + '%';
        sfx().pop();
        await sleep(420);
      }
      cap.textContent = '✅ Selesai! Crawling → Indexing → Ranking terjadi terus-menerus di balik layar.';
      btn.disabled = false;
      btn.style.opacity = '';
      btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">replay</span> Putar Ulang';
      running = false;
      opts.onDone && opts.onDone();
    });
  }

  // ═════════════════════ WIDGET: Lab Crawler ═════════════════════
  function crawler(el, opts) {
    const nodes = [
      { id: 0, label: 'Beranda', x: 50, y: 14 },
      { id: 1, label: 'Berita', x: 18, y: 42 },
      { id: 2, label: 'Profil', x: 50, y: 46 },
      { id: 3, label: 'Galeri', x: 82, y: 40 },
      { id: 4, label: 'Artikel', x: 12, y: 80 },
      { id: 5, label: 'Kontak', x: 40, y: 84 },
      { id: 6, label: '/admin', x: 66, y: 82, blocked: true },
      { id: 7, label: 'Video', x: 90, y: 78 },
    ];
    const edges = [[0, 1], [0, 2], [0, 3], [1, 4], [2, 5], [2, 6], [3, 7], [4, 5]];
    const visited = new Set([0]);
    let at = 0;
    const W = 100, H = 100;
    el.innerHTML = `
      <div class="grid lg:grid-cols-[1fr_260px] gap-4">
        <div class="relative rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 overflow-hidden">
          <div class="absolute inset-0 dot-pattern opacity-60"></div>
          <svg viewBox="0 0 ${W} ${H}" class="relative w-full h-[300px] sm:h-[340px]" preserveAspectRatio="none" data-svg>
            ${edges.map(([a, b]) => `<line class="crawl-edge" data-edge="${a}-${b}" x1="${nodes[a].x}" y1="${nodes[a].y}" x2="${nodes[b].x}" y2="${nodes[b].y}" stroke="#CBD5E1" stroke-width="0.6" vector-effect="non-scaling-stroke"/>`).join('')}
          </svg>
          <div class="absolute inset-0" data-layer>
            ${nodes.map((n) => `<button type="button" data-node="${n.id}" class="absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold border-2 border-b-4 transition-all duration-300 flex items-center gap-1" style="left:${n.x}%;top:${n.y}%"><span class="material-symbols-outlined text-[14px]">${n.blocked ? 'lock' : 'description'}</span>${n.label}</button>`).join('')}
            <div data-spider class="absolute -translate-x-1/2 -translate-y-[150%] text-2xl transition-all duration-700 ease-out pointer-events-none" style="left:${nodes[0].x}%;top:${nodes[0].y}%">🕷️</div>
          </div>
        </div>
        <div class="rounded-3xl bg-[#0B1530] text-white p-4 flex flex-col">
          <div class="flex items-center justify-between"><span class="text-xs font-black tracking-wider text-sky-300">LOG CRAWLER</span><span class="text-xs font-bold" data-count></span></div>
          <div class="mt-2 h-2 rounded-full bg-white/10 overflow-hidden"><div class="h-full bg-gradient-to-r from-sky-400 to-violet-400 bar-fill" data-bar style="width:0%"></div></div>
          <div class="mt-3 space-y-1.5 text-[11px] font-mono flex-1 overflow-y-auto max-h-[240px] thin-scroll" data-log></div>
        </div>
      </div>`;
    const allowed = nodes.filter((n) => !n.blocked).length;
    const log = el.querySelector('[data-log]');
    function addLog(html, color) {
      log.insertAdjacentHTML('afterbegin', `<div class="anim-pop ${color || 'text-white/80'}">${html}</div>`);
    }
    function frontier() {
      const f = new Set();
      edges.forEach(([a, b]) => {
        if (visited.has(a) && !visited.has(b)) f.add(b);
        if (visited.has(b) && !visited.has(a)) f.add(a);
      });
      return f;
    }
    function paint() {
      const f = frontier();
      nodes.forEach((n) => {
        const b = el.querySelector(`[data-node="${n.id}"]`);
        const isV = visited.has(n.id);
        const isF = f.has(n.id);
        b.className = `absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold border-2 border-b-4 transition-all duration-300 flex items-center gap-1 ${
          n.blocked && isF ? 'bg-red-50 border-red-300 text-red-600 cursor-pointer' :
          isV ? 'bg-emerald-500 border-emerald-700 text-white shadow-lg' :
          isF ? 'bg-white border-primary text-primary cursor-pointer pulse-ring shadow-md hover:-translate-y-[60%]' :
          'bg-white/70 border-slate-200 text-slate-400 cursor-not-allowed'}`;
      });
      edges.forEach(([a, b]) => {
        const e = el.querySelector(`[data-edge="${a}-${b}"]`);
        const both = visited.has(a) && visited.has(b);
        const half = visited.has(a) !== visited.has(b);
        e.setAttribute('stroke', both ? '#10B981' : half ? '#1F6BFF' : '#CBD5E1');
        e.setAttribute('stroke-width', both || half ? '1.6' : '0.6');
        e.classList.toggle('active', half);
      });
      const done = [...visited].filter((id) => !nodes[id].blocked).length;
      el.querySelector('[data-count]').textContent = `${done}/${allowed} halaman`;
      el.querySelector('[data-bar]').style.width = `${(done / allowed) * 100}%`;
      return done;
    }
    addLog('> start crawl: https://sekolah.sch.id/', 'text-sky-300');
    addLog('✓ Beranda diindeks', 'text-emerald-300');
    paint();
    let finished = false;
    el.querySelector('[data-layer]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-node]');
      if (!b) return;
      const id = +b.dataset.node;
      const n = nodes[id];
      if (visited.has(id)) return;
      if (!frontier().has(id)) {
        sfx().wrong();
        b.classList.add('anim-shake');
        setTimeout(() => b.classList.remove('anim-shake'), 500);
        addLog(`✗ ${n.label}: belum ada tautan menuju halaman ini`, 'text-amber-300');
        return;
      }
      if (n.blocked) {
        sfx().wrong();
        b.classList.add('anim-shake');
        setTimeout(() => b.classList.remove('anim-shake'), 500);
        addLog('⛔ /admin diblokir oleh robots.txt — crawler yang baik mematuhinya!', 'text-red-300');
        return;
      }
      const spider = el.querySelector('[data-spider]');
      spider.style.left = n.x + '%';
      spider.style.top = n.y + '%';
      sfx().pop();
      visited.add(id);
      at = id;
      addLog(`✓ ${n.label} ditemukan & diindeks`, 'text-emerald-300');
      const done = paint();
      if (done >= allowed && !finished) {
        finished = true;
        setTimeout(() => {
          addLog('🎉 Semua halaman publik selesai dirayapi!', 'text-yellow-300 font-bold');
          sfx().win();
          opts.onDone && opts.onDone();
        }, 500);
      }
    });
  }

  // ═════════════════════ WIDGET: Indexer ═════════════════════
  function indexer(el, opts) {
    const docs = [
      { id: 1, title: 'Dok 1 · Pengumuman', text: 'Sekolah libur saat gempa melanda Batam' },
      { id: 2, title: 'Dok 2 · Artikel', text: 'Cara cek hoaks gempa di situs BMKG' },
      { id: 3, title: 'Dok 3 · Catatan', text: 'Data pribadi siswa wajib dilindungi sekolah' },
    ];
    const STOP = ['saat', 'di', 'cara', 'wajib', 'yang', 'dan'];
    const index = {};
    const done = new Set();
    let searched = false;
    el.innerHTML = `
      <div class="grid md:grid-cols-2 gap-4">
        <div class="space-y-2.5" data-docs>
          ${docs.map((d) => `<button type="button" data-doc="${d.id}" class="w-full text-left p-3.5 rounded-2xl bg-white border-2 border-b-4 border-slate-200 hover:border-primary transition-all group">
            <div class="flex items-center justify-between"><span class="text-xs font-black text-navy">${d.title}</span><span class="text-[10px] font-bold text-primary group-hover:underline" data-state>Klik untuk indeks</span></div>
            <div class="text-sm text-slate-600 mt-1" data-text>${d.text}</div></button>`).join('')}
        </div>
        <div class="rounded-3xl bg-[#0B1530] text-white p-4">
          <div class="text-xs font-black tracking-wider text-fuchsia-300">INVERTED INDEX</div>
          <div class="mt-3 grid grid-cols-1 gap-1 text-[12px] font-mono max-h-[200px] overflow-y-auto thin-scroll" data-index><div class="text-white/40">Belum ada kata terindeks…</div></div>
          <div class="mt-3 flex gap-2">
            <input data-q placeholder="cari kata, mis: gempa" class="flex-1 min-w-0 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm placeholder-white/40 focus:outline-none focus:border-sky-300" />
            <button type="button" data-go class="${BTN} bg-sky-400 text-navy border-sky-600">Cari</button>
          </div>
          <div class="mt-2 text-xs text-sky-200 min-h-[18px]" data-hint>Indeks semua dokumen dulu, lalu cari.</div>
        </div>
      </div>`;
    const idxBox = el.querySelector('[data-index]');
    function renderIndex(highlight) {
      const keys = Object.keys(index).sort();
      if (!keys.length) return;
      idxBox.innerHTML = keys.map((k) => `<div class="flex justify-between px-2 py-1 rounded-lg ${highlight === k ? 'bg-yellow-300/20 text-yellow-200' : 'bg-white/5'} anim-pop"><span class="text-fuchsia-300">${k}</span><span>→ [${[...index[k]].join(', ')}]</span></div>`).join('');
    }
    el.querySelector('[data-docs]').addEventListener('click', async (e) => {
      const b = e.target.closest('[data-doc]');
      if (!b) return;
      const d = docs.find((x) => x.id === +b.dataset.doc);
      if (done.has(d.id)) return;
      done.add(d.id);
      b.querySelector('[data-state]').textContent = 'Mengindeks…';
      const words = d.text.toLowerCase().split(/\s+/);
      const txt = b.querySelector('[data-text]');
      txt.innerHTML = words.map((w) => `<span class="inline-block transition-all duration-300 ${STOP.includes(w) ? 'line-through text-slate-300' : ''}">${w}</span>`).join(' ');
      for (const w of words) {
        if (STOP.includes(w)) continue;
        (index[w] = index[w] || new Set()).add(d.id);
        renderIndex();
        sfx().tick();
        await sleep(140);
      }
      b.classList.add('border-emerald-400', 'bg-emerald-50');
      b.querySelector('[data-state]').innerHTML = '<span class="text-emerald-600">✓ Terindeks</span>';
      el.querySelector('[data-hint]').textContent = done.size < docs.length ? `${docs.length - done.size} dokumen lagi. Kata dicoret = stop words (dibuang).` : 'Semua terindeks! Sekarang coba cari "gempa" atau "data".';
    });
    function go() {
      const q = el.querySelector('[data-q]').value.trim().toLowerCase();
      const hint = el.querySelector('[data-hint]');
      if (!q) return;
      if (done.size < docs.length) { hint.textContent = '⚠️ Indeks semua dokumen dulu ya!'; sfx().wrong(); return; }
      const hit = index[q];
      el.querySelectorAll('[data-doc]').forEach((b) => b.classList.remove('ring-4', 'ring-yellow-300'));
      renderIndex(q);
      if (hit) {
        hit.forEach((id) => el.querySelector(`[data-doc="${id}"]`).classList.add('ring-4', 'ring-yellow-300'));
        hint.innerHTML = `⚡ Ketemu instan di dokumen <b>${[...hit].join(', ')}</b> tanpa membaca ulang semua dokumen!`;
        sfx().correct();
        if (!searched) { searched = true; opts.onDone && opts.onDone(); }
      } else {
        hint.textContent = `Kata "${q}" tidak ada di indeks. Coba kata lain.`;
        sfx().wrong();
      }
    }
    el.querySelector('[data-go]').addEventListener('click', go);
    el.querySelector('[data-q]').addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  }

  // ═════════════════════ WIDGET: Ranking ═════════════════════
  function ranking(el, opts) {
    const pages = [
      { name: 'bmkg.go.id — Info Gempa Terkini', rel: 8, auth: 10, fresh: 9, emoji: '🏛️' },
      { name: 'beritaheboh.xyz — VIRAL gempa besok!!', rel: 10, auth: 1, fresh: 10, emoji: '⚠️' },
      { name: 'wikipedia.org — Gempa Bumi', rel: 7, auth: 8, fresh: 3, emoji: '📚' },
      { name: 'blog-pribadi.com — Pengalamanku saat gempa', rel: 6, auth: 2, fresh: 5, emoji: '✍️' },
    ];
    const w = { rel: 5, auth: 5, fresh: 5 };
    let moves = 0;
    el.innerHTML = `
      <div class="grid md:grid-cols-[240px_1fr] gap-4">
        <div class="rounded-3xl bg-white border border-slate-200 p-4 space-y-4">
          ${[['rel', 'Relevansi', 'text-primary'], ['auth', 'Otoritas (PageRank)', 'text-violet-600'], ['fresh', 'Kesegaran', 'text-amber-600']].map(([k, l, c]) => `
            <label class="block"><div class="flex justify-between text-xs font-extrabold ${c}"><span>${l}</span><span data-v="${k}">5</span></div>
            <input type="range" min="0" max="10" value="5" data-w="${k}" class="w-full accent-[#1F6BFF] mt-1"></label>`).join('')}
          <div class="text-[11px] text-text-muted leading-relaxed" data-msg>Coba naikkan <b>Otoritas</b> — situs hoaks akan turun!</div>
        </div>
        <div class="space-y-2" data-list></div>
      </div>`;
    const list = el.querySelector('[data-list]');
    pages.forEach((p, i) => {
      list.insertAdjacentHTML('beforeend', `<div data-page="${i}" class="p-3 rounded-2xl bg-white border-2 border-slate-200 flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-sm" data-rank>#</div>
        <div class="text-xl">${p.emoji}</div>
        <div class="flex-1 min-w-0"><div class="text-xs sm:text-sm font-bold text-navy truncate">${p.name}</div>
          <div class="h-1.5 mt-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full bg-gradient-to-r from-primary to-violet-500 bar-fill" data-bar style="width:0%"></div></div></div>
        <div class="text-sm font-black text-navy w-10 text-right" data-score>0</div></div>`);
    });
    function update(interactive) {
      const scored = pages.map((p, i) => ({ i, s: p.rel * w.rel + p.auth * w.auth + p.fresh * w.fresh }));
      const max = Math.max(1, ...scored.map((x) => x.s));
      scored.sort((a, b) => b.s - a.s);
      flip(list, () => scored.forEach((x) => list.appendChild(list.querySelector(`[data-page="${x.i}"]`))));
      scored.forEach((x, r) => {
        const row = list.querySelector(`[data-page="${x.i}"]`);
        row.querySelector('[data-rank]').textContent = `#${r + 1}`;
        row.querySelector('[data-rank]').className = `w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${r === 0 ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-600'}`;
        row.querySelector('[data-bar]').style.width = `${(x.s / max) * 100}%`;
        row.querySelector('[data-score]').textContent = x.s;
      });
      const top = pages[scored[0].i];
      el.querySelector('[data-msg]').innerHTML = top.auth < 3
        ? '⚠️ Situs tidak tepercaya jadi juara! Itulah kenapa otoritas penting dalam algoritma.'
        : `✅ Juara saat ini: <b>${esc(top.name.split(' — ')[0])}</b>. Mesin pencari nyata memakai ratusan sinyal seperti ini.`;
      if (interactive && ++moves === 3) opts.onDone && opts.onDone();
    }
    el.querySelectorAll('[data-w]').forEach((inp) => inp.addEventListener('input', () => {
      w[inp.dataset.w] = +inp.value;
      el.querySelector(`[data-v="${inp.dataset.w}"]`).textContent = inp.value;
      sfx().tick();
      clearTimeout(inp._t);
      inp._t = setTimeout(() => update(true), 120);
    }));
    setTimeout(() => update(false), 50);
  }

  // ═════════════════════ WIDGET: Playground Operator ═════════════════════
  function operatorPlayground(el, opts) {
    const missions = [
      { text: 'Tampilkan HANYA dokumen PDF tentang "kurikulum merdeka"', test: (r) => r.hits.length > 0 && r.hits.every((h) => h.doc.type === 'pdf' && /kurikulum merdeka/i.test(h.doc.title + h.doc.snippet)) },
      { text: 'Cari info gempa HANYA dari bmkg.go.id', test: (r) => r.hits.length > 0 && r.hits.every((h) => h.doc.domain === 'bmkg.go.id') && r.parsed.terms.concat(r.parsed.phrases).some((t) => t.includes('gempa')) },
      { text: 'Cari "jaguar" si hewan, singkirkan hasil tentang mobil', test: (r) => r.hits.length > 0 && r.hits.every((h) => !/mobil/i.test(h.doc.title + h.doc.snippet)) && r.hits.some((h) => /jaguar/i.test(h.doc.title)) },
    ];
    const doneM = new Set();
    el.innerHTML = `
      <div class="space-y-4">
        <div class="grid sm:grid-cols-3 gap-2" data-missions>
          ${missions.map((m, i) => `<div data-m="${i}" class="p-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white text-xs font-bold text-slate-600 flex items-start gap-2 transition-all duration-300"><span class="material-symbols-outlined text-[18px] text-slate-300" data-mi>radio_button_unchecked</span><span>Misi ${i + 1}: ${m.text}</span></div>`).join('')}
        </div>
        <div class="rounded-3xl bg-white border-2 border-slate-200 shadow-card p-3 sm:p-4">
          <div class="flex items-center gap-2 rounded-2xl border-2 border-slate-200 focus-within:border-primary px-3 py-2 transition">
            <span class="material-symbols-outlined text-primary">search</span>
            <input data-q spellcheck="false" class="flex-1 min-w-0 font-mono text-sm text-navy focus:outline-none bg-transparent" placeholder='coba: "kurikulum merdeka" filetype:pdf' />
            <button type="button" data-clear class="text-slate-400 hover:text-navy" aria-label="Hapus query"><span class="material-symbols-outlined text-[18px]">close</span></button>
          </div>
          <div class="flex flex-wrap gap-1.5 mt-3">
            ${['"..."', '-', 'site:', 'filetype:pdf', 'OR', 'intitle:'].map((t) => `<button type="button" data-ins="${esc(t)}" class="token-chip px-2.5 py-1 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-mono font-bold text-navy hover:border-primary">${esc(t)}</button>`).join('')}
          </div>
          <div class="flex flex-wrap gap-1.5 mt-3 min-h-[24px]" data-parsed></div>
        </div>
        <div class="flex items-center justify-between text-xs font-bold text-text-muted px-1"><span data-count></span><span class="hidden sm:inline">Hasil diurutkan otomatis (ranking)</span></div>
        <div class="space-y-2" data-results></div>
      </div>`;
    const input = el.querySelector('[data-q]');
    function run() {
      const q = input.value;
      const r = search(q);
      const p = r.parsed;
      const pills = [
        ...p.phrases.map((x) => ['bg-amber-100 text-amber-800', `"${x}" frasa persis`]),
        ...p.site.map((x) => ['bg-emerald-100 text-emerald-800', `site:${x} domain`]),
        ...p.filetype.map((x) => ['bg-violet-100 text-violet-800', `.${x} format`]),
        ...p.exclude.map((x) => ['bg-red-100 text-red-700', `-${x} dikecualikan`]),
        ...p.intitle.map((x) => ['bg-sky-100 text-sky-800', `judul: ${x}`]),
        ...p.orGroups.map((g) => ['bg-pink-100 text-pink-800', g.join(' ATAU ')]),
        ...p.errors.map((e) => ['bg-red-500 text-white', `⚠ ${e}`]),
      ];
      el.querySelector('[data-parsed]').innerHTML = pills.map(([c, t]) => `<span class="anim-pop text-[11px] font-bold px-2 py-0.5 rounded-lg ${c}">${esc(t)}</span>`).join('');
      el.querySelector('[data-count]').textContent = q.trim() ? `${r.hits.length} dari ${DOCS.length} halaman cocok` : `${DOCS.length} halaman di indeks mini`;
      const show = q.trim() ? r.hits : DOCS.map((d) => ({ doc: d }));
      el.querySelector('[data-results]').innerHTML = show.length
        ? show.slice(0, 6).map(resultCard).join('') + (show.length > 6 ? `<div class="text-center text-xs text-text-muted font-semibold">+${show.length - 6} hasil lainnya…</div>` : '')
        : '<div class="p-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-sm text-text-muted anim-pop">🙈 Tidak ada hasil. Filtermu terlalu ketat — coba kurangi operator.</div>';
      if (q.trim()) {
        missions.forEach((m, i) => {
          if (!doneM.has(i) && m.test(r)) {
            doneM.add(i);
            const card = el.querySelector(`[data-m="${i}"]`);
            card.className = 'p-3 rounded-2xl border-2 border-emerald-400 bg-emerald-50 text-xs font-bold text-emerald-800 flex items-start gap-2 transition-all duration-300 anim-correct';
            card.querySelector('[data-mi]').textContent = 'check_circle';
            card.querySelector('[data-mi]').className = 'material-symbols-outlined text-[18px] text-emerald-500 icon-fill';
            sfx().correct();
            if (window.X) X.confetti({ count: 50, originY: 0.5 });
            if (doneM.size === missions.length) opts.onDone && opts.onDone();
          }
        });
      }
    }
    let t;
    input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(run, 160); });
    el.querySelector('[data-clear]').addEventListener('click', () => { input.value = ''; run(); input.focus(); });
    el.querySelectorAll('[data-ins]').forEach((b) => b.addEventListener('click', () => {
      sfx().click();
      let ins = b.dataset.ins;
      const v = input.value.replace(/\s+$/, '');
      if (ins === '"..."') ins = '""';
      input.value = (v ? v + ' ' : '') + ins;
      input.focus();
      const pos = ins === '""' ? input.value.length - 1 : input.value.length;
      input.setSelectionRange(pos, pos);
      run();
    }));
    run();
  }

  // ═════════════════════ WIDGET: Triangulasi ═════════════════════
  function triangulation(el, opts) {
    const sources = [
      { name: 'Siaran pers resmi BMKG', cat: 'Lembaga resmi', good: true, icon: '🏛️' },
      { name: 'Akun anonim @infoviral_123', cat: 'Anonim', good: false, icon: '👤' },
      { name: 'Kompas.com (terverifikasi Dewan Pers)', cat: 'Media terverifikasi', good: true, icon: '📰' },
      { name: 'Pesan berantai grup keluarga', cat: 'Tidak jelas', good: false, icon: '💬' },
      { name: 'Pernyataan ahli geofisika ITB', cat: 'Pakar / akademisi', good: true, icon: '🎓' },
      { name: 'Video TikTok 20 juta views', cat: 'Viral ≠ benar', good: false, icon: '🎬' },
      { name: 'Situs beritaheboh.xyz', cat: 'Situs abal-abal', good: false, icon: '⚠️' },
      { name: 'Jurnal ilmiah peer-review', cat: 'Pakar / akademisi', good: true, icon: '📚' },
    ];
    const order = shuffle(sources.map((_, i) => i));
    const pick = new Set();
    el.innerHTML = `
      <div class="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-4 flex items-start gap-3">
        <div class="text-3xl anim-wiggle">📢</div>
        <div><div class="text-[10px] font-black text-amber-700 tracking-widest">KABAR VIRAL</div><div class="font-extrabold text-navy text-sm sm:text-base">"Gempa besar akan mengguncang Batam besok malam pukul 21.00!"</div></div>
      </div>
      <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2" data-src>
        ${order.map((i) => { const s = sources[i]; return `<button type="button" data-s="${i}" class="opt-card text-left p-3 rounded-2xl bg-white border-2 border-slate-200 flex items-center gap-3"><span class="text-2xl">${s.icon}</span><span class="flex-1 min-w-0"><span class="block text-xs sm:text-sm font-bold text-navy">${s.name}</span><span class="block text-[10px] text-slate-400 font-semibold" data-cat></span></span><span class="w-6 h-6 rounded-lg border-2 border-slate-200 flex items-center justify-center text-xs font-black" data-tick></span></button>`; }).join('')}
      </div>
      <div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="text-xs font-bold text-text-muted" data-info>Pilih 3 sumber (0/3)</div>
        <button type="button" data-check class="${BTN_PRIMARY} opacity-50" disabled>Verifikasi Sekarang</button>
      </div>
      <div data-fb class="mt-3"></div>`;
    const btn = el.querySelector('[data-check]');
    function paint() {
      el.querySelectorAll('[data-s]').forEach((b) => {
        const on = pick.has(+b.dataset.s);
        b.classList.toggle('border-primary', on);
        b.classList.toggle('bg-blue-50', on);
        b.querySelector('[data-tick]').textContent = on ? '✓' : '';
        b.querySelector('[data-tick]').className = `w-6 h-6 rounded-lg border-2 flex items-center justify-center text-xs font-black ${on ? 'bg-primary border-primary text-white anim-pop' : 'border-slate-200'}`;
      });
      el.querySelector('[data-info]').textContent = `Pilih 3 sumber (${pick.size}/3)`;
      btn.disabled = pick.size !== 3;
      btn.classList.toggle('opacity-50', pick.size !== 3);
    }
    el.querySelector('[data-src]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-s]');
      if (!b) return;
      const i = +b.dataset.s;
      if (pick.has(i)) pick.delete(i);
      else if (pick.size < 3) pick.add(i);
      else { b.classList.add('anim-shake'); setTimeout(() => b.classList.remove('anim-shake'), 500); return; }
      sfx().click();
      el.querySelector('[data-fb]').innerHTML = '';
      paint();
    });
    btn.addEventListener('click', () => {
      const chosen = [...pick].map((i) => sources[i]);
      const good = chosen.filter((s) => s.good);
      const cats = new Set(good.map((s) => s.cat));
      el.querySelectorAll('[data-s]').forEach((b) => {
        const s = sources[+b.dataset.s];
        b.querySelector('[data-cat]').textContent = s.cat;
        b.querySelector('[data-cat]').className = `block text-[10px] font-bold ${s.good ? 'text-emerald-600' : 'text-red-500'}`;
      });
      const fb = el.querySelector('[data-fb]');
      if (good.length === 3 && cats.size >= 2) {
        sfx().correct();
        if (window.X) X.confetti({ count: 80 });
        fb.innerHTML = `<div class="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-sm text-emerald-900 anim-bounce-in"><b>🎯 Triangulasi berhasil!</b> Ketiga sumber kredibel dan independen. Hasilnya: BMKG menegaskan <b>gempa tidak bisa diprediksi waktunya secara pasti</b> → kabar tersebut <b>HOAKS</b>.</div>`;
        opts.onDone && opts.onDone();
      } else {
        sfx().wrong();
        el.querySelector('[data-src]').classList.add('anim-shake');
        setTimeout(() => el.querySelector('[data-src]').classList.remove('anim-shake'), 500);
        fb.innerHTML = `<div class="p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-sm text-red-800 anim-pop"><b>Belum tepat.</b> ${good.length < 3 ? `Ada ${3 - good.length} sumber yang tidak kredibel (lihat label merah).` : 'Sumbermu kredibel tapi kurang beragam — ambil dari jenis yang berbeda (lembaga resmi, media, pakar).'} Coba lagi!</div>`;
      }
    });
  }

  // ═════════════════════ WIDGET: Swipe Fakta/Hoaks ═════════════════════
  function hoaxSwipe(el, opts) {
    const cards = shuffle([
      { text: 'Membagikan link resmi BMKG tentang peringatan cuaca ke grup kelas.', fact: true, why: 'Aman: sumber resmi dan bermanfaat.' },
      { text: 'Menyebar pesan "Minum air garam bisa menyembuhkan semua penyakit, sebarkan!"', fact: false, why: 'Hoaks kesehatan tanpa dasar ilmiah — jangan disebar.' },
      { text: 'Menyebar foto KTP teman di story karena lucu.', fact: false, why: 'Melanggar UU PDP: mengungkapkan data pribadi orang lain.' },
      { text: 'Mengecek klaim viral di situs cekfakta.com sebelum membagikan.', fact: true, why: 'Tepat! Verifikasi dulu sebelum share.' },
      { text: 'Membuat postingan yang menghasut kebencian terhadap suku tertentu.', fact: false, why: 'Melanggar Pasal 28 ayat (2) UU ITE (SARA).' },
      { text: 'Meminta izin sebelum mengunggah foto teman ke media sosial.', fact: true, why: 'Netiket yang baik & menghormati privasi.' },
    ]);
    let i = 0, right = 0, mistakes = 0;
    el.innerHTML = `
      <div class="max-w-md mx-auto">
        <div class="flex items-center justify-between text-xs font-extrabold mb-3"><span class="text-text-muted" data-pos></span><span class="text-emerald-600" data-score></span></div>
        <div class="h-2 rounded-full bg-slate-100 overflow-hidden mb-4"><div class="h-full bg-gradient-to-r from-emerald-400 to-primary bar-fill" data-bar style="width:0%"></div></div>
        <div class="relative h-[250px]" data-deck></div>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <button type="button" data-ans="0" class="${BTN} bg-red-500 text-white border-red-700 py-3"><span class="material-symbols-outlined icon-fill">close</span> Hoaks / Melanggar</button>
          <button type="button" data-ans="1" class="${BTN} bg-emerald-500 text-white border-emerald-700 py-3"><span class="material-symbols-outlined icon-fill">check</span> Fakta / Aman</button>
        </div>
        <div class="mt-3 min-h-[48px]" data-fb></div>
      </div>`;
    const deck = el.querySelector('[data-deck]');
    function render() {
      el.querySelector('[data-pos]').textContent = `Kartu ${Math.min(i + 1, cards.length)} / ${cards.length}`;
      el.querySelector('[data-score]').textContent = `✓ ${right} benar`;
      el.querySelector('[data-bar]').style.width = `${(i / cards.length) * 100}%`;
      deck.innerHTML = '';
      cards.slice(i, i + 3).reverse().forEach((c, k, arr) => {
        const depth = arr.length - 1 - k;
        const d = document.createElement('div');
        d.className = 'swipe-card absolute inset-0 rounded-[28px] bg-white border-2 border-slate-200 shadow-card p-6 flex flex-col justify-between cursor-grab';
        d.style.transform = `translateY(${depth * 10}px) scale(${1 - depth * 0.05})`;
        d.style.zIndex = 10 - depth;
        d.innerHTML = `<div class="flex items-center justify-between"><span class="text-[10px] font-black tracking-widest text-violet-600">SITUASI</span><span class="text-2xl">🤔</span></div>
          <p class="text-base sm:text-lg font-extrabold text-navy leading-snug">${esc(c.text)}</p>
          <div class="flex justify-between text-[11px] font-bold text-slate-400"><span>← Hoaks</span><span>Fakta →</span></div>
          <div data-stamp class="absolute top-6 right-6 px-3 py-1 rounded-xl border-4 font-black text-lg rotate-12 opacity-0 transition-opacity"></div>`;
        deck.appendChild(d);
        if (depth === 0) drag(d);
      });
      if (i >= cards.length) finish();
    }
    function drag(card) {
      let sx = 0, dx = 0, on = false;
      const stamp = card.querySelector('[data-stamp]');
      card.addEventListener('pointerdown', (e) => { on = true; sx = e.clientX; card.setPointerCapture(e.pointerId); card.style.transition = 'none'; card.style.cursor = 'grabbing'; });
      card.addEventListener('pointermove', (e) => {
        if (!on) return;
        dx = e.clientX - sx;
        card.style.transform = `translateX(${dx}px) rotate(${dx / 14}deg)`;
        stamp.style.opacity = Math.min(1, Math.abs(dx) / 90);
        stamp.textContent = dx > 0 ? 'FAKTA' : 'HOAKS';
        stamp.className = `absolute top-6 ${dx > 0 ? 'left-6 -rotate-12 text-emerald-500 border-emerald-500' : 'right-6 rotate-12 text-red-500 border-red-500'} px-3 py-1 rounded-xl border-4 font-black text-lg transition-opacity`;
      });
      const end = () => {
        if (!on) return;
        on = false;
        card.style.transition = '';
        card.style.cursor = '';
        if (Math.abs(dx) > 90) answer(dx > 0);
        else { card.style.transform = ''; stamp.style.opacity = 0; }
        dx = 0;
      };
      card.addEventListener('pointerup', end);
      card.addEventListener('pointercancel', end);
    }
    let busy = false;
    function answer(saidFact) {
      if (busy || i >= cards.length) return;
      busy = true;
      const c = cards[i];
      const top = deck.lastElementChild;
      top.classList.add(saidFact ? 'fly-right' : 'fly-left');
      const ok = saidFact === c.fact;
      if (ok) { right++; sfx().correct(); } else { mistakes++; sfx().wrong(); }
      el.querySelector('[data-fb]').innerHTML = `<div class="anim-pop p-3 rounded-2xl text-sm font-semibold ${ok ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-200' : 'bg-red-50 text-red-800 border-2 border-red-200'}">${ok ? '✅ Tepat!' : '❌ Kurang tepat.'} ${esc(c.why)}</div>`;
      setTimeout(() => { i++; busy = false; render(); }, 450);
    }
    function finish() {
      el.querySelector('[data-bar]').style.width = '100%';
      deck.innerHTML = `<div class="absolute inset-0 rounded-[28px] bg-gradient-to-br from-primary to-violet-600 text-white flex flex-col items-center justify-center text-center p-6 anim-bounce-in">
        <div class="text-5xl">${mistakes === 0 ? '🏆' : '👏'}</div><div class="text-2xl font-black mt-2">${right}/${cards.length} benar</div>
        <div class="text-sm text-blue-100 mt-1">${mistakes === 0 ? 'Sempurna! Kamu Pemburu Hoaks sejati.' : 'Mantap! Baca penjelasannya lalu coba lagi untuk skor sempurna.'}</div>
        <button type="button" data-again class="mt-4 ${BTN} bg-white text-primary border-slate-300">Main Lagi</button></div>`;
      el.querySelectorAll('[data-ans]').forEach((b) => (b.disabled = true));
      deck.querySelector('[data-again]').addEventListener('click', () => { i = 0; right = 0; mistakes = 0; el.querySelectorAll('[data-ans]').forEach((b) => (b.disabled = false)); el.querySelector('[data-fb]').innerHTML = ''; render(); });
      if (mistakes === 0) { sfx().win(); if (window.X) { X.confetti(); X.grantBadge('hoax_buster'); } }
      opts.onDone && opts.onDone();
    }
    el.querySelectorAll('[data-ans]').forEach((b) => b.addEventListener('click', () => answer(b.dataset.ans === '1')));
    render();
  }

  // ═════════════════════ WIDGET: Sortir Data Pribadi ═════════════════════
  function dataSorter(el, opts) {
    const items = shuffle([
      ['Nama lengkap', 'umum', '🪪'], ['Riwayat penyakit', 'spesifik', '🏥'], ['Sidik jari', 'spesifik', '👆'], ['Jenis kelamin', 'umum', '⚧'],
      ['Data rekening bank', 'spesifik', '💳'], ['Kewarganegaraan', 'umum', '🌏'], ['Catatan kejahatan', 'spesifik', '⚖️'], ['Agama', 'umum', '🕌'],
    ]);
    let i = 0, ok = 0;
    const bins = { umum: [], spesifik: [] };
    el.innerHTML = `
      <div class="grid grid-cols-2 gap-3">
        ${[['umum', 'Data Umum', 'from-sky-400 to-blue-600'], ['spesifik', 'Data Spesifik', 'from-rose-400 to-red-600']].map(([k, l, g]) => `
          <button type="button" data-bin="${k}" class="rounded-3xl p-3 sm:p-4 bg-gradient-to-br ${g} text-white text-left border-b-4 border-black/20 active:translate-y-0.5 transition min-h-[150px] flex flex-col">
            <div class="flex items-center justify-between"><span class="font-black text-sm">${l}</span><span class="material-symbols-outlined icon-fill">${k === 'umum' ? 'inventory_2' : 'shield_lock'}</span></div>
            <div class="mt-2 flex flex-wrap gap-1" data-binlist="${k}"></div></button>`).join('')}
      </div>
      <div class="mt-4 flex flex-col items-center" data-stage></div>`;
    function next() {
      const st = el.querySelector('[data-stage]');
      if (i >= items.length) {
        st.innerHTML = `<div class="anim-bounce-in text-center p-4"><div class="text-4xl">${ok === items.length ? '🛡️' : '👍'}</div><div class="font-black text-navy mt-1">${ok}/${items.length} tepat</div><div class="text-xs text-text-muted">Data spesifik butuh perlindungan ekstra karena dampaknya lebih besar jika bocor.</div></div>`;
        sfx().win();
        opts.onDone && opts.onDone();
        return;
      }
      const [name, , emo] = items[i];
      st.innerHTML = `<div class="text-[11px] font-bold text-text-muted mb-2">Masukkan ke keranjang yang tepat (${i + 1}/${items.length})</div>
        <div data-cur class="anim-bounce-in px-6 py-4 rounded-3xl bg-white border-2 border-b-4 border-slate-200 shadow-card text-lg font-black text-navy flex items-center gap-2"><span class="text-2xl">${emo}</span>${esc(name)}</div>`;
    }
    el.querySelectorAll('[data-bin]').forEach((b) => b.addEventListener('click', () => {
      if (i >= items.length) return;
      const [name, kind, emo] = items[i];
      const cur = el.querySelector('[data-cur]');
      const good = b.dataset.bin === kind;
      if (good) {
        ok++;
        sfx().correct();
        cur.style.transition = 'transform 380ms cubic-bezier(.22,1,.36,1), opacity 380ms';
        const br = b.getBoundingClientRect(), cr = cur.getBoundingClientRect();
        cur.style.transform = `translate(${br.left + br.width / 2 - (cr.left + cr.width / 2)}px, ${br.top + br.height / 2 - (cr.top + cr.height / 2)}px) scale(.3)`;
        cur.style.opacity = '0';
        setTimeout(() => {
          el.querySelector(`[data-binlist="${kind}"]`).insertAdjacentHTML('beforeend', `<span class="anim-pop text-[10px] font-bold bg-white/25 rounded-lg px-1.5 py-0.5">${emo} ${esc(name)}</span>`);
          i++; next();
        }, 380);
      } else {
        sfx().wrong();
        cur.classList.remove('anim-bounce-in');
        cur.classList.add('anim-shake');
        cur.insertAdjacentHTML('afterend', `<div class="anim-pop mt-2 text-xs font-bold text-red-600">Hmm, "${esc(name)}" termasuk data <b>${kind}</b>.</div>`);
        setTimeout(() => {
          el.querySelector(`[data-binlist="${kind}"]`).insertAdjacentHTML('beforeend', `<span class="anim-pop text-[10px] font-bold bg-white/25 rounded-lg px-1.5 py-0.5">${emo} ${esc(name)}</span>`);
          i++; next();
        }, 1300);
      }
    }));
    next();
  }

  // ═════════════════════ WIDGET: Cocokkan Kasus–Pasal ═════════════════════
  function caseMatch(el, opts) {
    const cases = [
      { text: 'Dimas menyebar video editan berisi ujaran kebencian kepada kelompok agama tertentu.', ans: 'Pasal 28 ayat (2) UU ITE', opts: ['Pasal 28 ayat (2) UU ITE', 'Pasal 30 UU ITE', 'UU Hak Cipta', 'Pasal 32 UU ITE'] },
      { text: 'Sebuah aplikasi pinjol menyebarkan data kontak & foto KTP peminjam ke orang lain.', ans: 'UU PDP No. 27/2022', opts: ['Pasal 27 UU ITE', 'UU PDP No. 27/2022', 'UU Hak Cipta', 'Pasal 28 ayat (1)'] },
      { text: 'Seorang peretas membobol server sekolah lalu mengubah nilai rapor.', ans: 'Pasal 30 & 32 UU ITE', opts: ['Pasal 28 ayat (2) UU ITE', 'Pasal 30 & 32 UU ITE', 'UU PDP No. 27/2022', 'Pasal 27 UU ITE'] },
      { text: 'Toko online palsu mengiklankan HP murah dengan info bohong sehingga pembeli rugi.', ans: 'Pasal 28 ayat (1) UU ITE', opts: ['Pasal 28 ayat (1) UU ITE', 'Pasal 30 UU ITE', 'UU Hak Cipta', 'Pasal 29 UU ITE'] },
    ];
    let i = 0, score = 0;
    function render() {
      if (i >= cases.length) {
        el.innerHTML = `<div class="anim-bounce-in rounded-3xl bg-gradient-to-br from-[#0B1530] to-[#2a1a5e] text-white p-6 text-center"><div class="text-5xl">⚖️</div><div class="text-xl font-black mt-2">Sidang selesai: ${score}/${cases.length} putusan tepat</div><div class="text-sm text-blue-200 mt-1">Ingat: hukum digital melindungi semua orang, termasuk kamu.</div></div>`;
        sfx().win();
        opts.onDone && opts.onDone();
        return;
      }
      const c = cases[i];
      el.innerHTML = `
        <div class="flex items-center gap-2 mb-3">${cases.map((_, k) => `<div class="h-2 flex-1 rounded-full ${k < i ? 'bg-emerald-400' : k === i ? 'bg-primary' : 'bg-slate-200'} transition-all"></div>`).join('')}</div>
        <div class="rounded-3xl bg-white border-2 border-slate-200 p-5 flex gap-3 items-start anim-pop">
          <div class="text-3xl" data-gavel>🧑‍⚖️</div>
          <div><div class="text-[10px] font-black tracking-widest text-accent">KASUS ${i + 1}</div><div class="text-sm sm:text-base font-extrabold text-navy leading-snug mt-0.5">${esc(c.text)}</div></div>
        </div>
        <div class="grid sm:grid-cols-2 gap-2 mt-3">${shuffle(c.opts).map((o) => `<button type="button" data-o="${esc(o)}" class="opt-card p-3 rounded-2xl bg-white border-2 border-slate-200 text-sm font-bold text-navy text-left">${esc(o)}</button>`).join('')}</div>
        <div data-fb class="mt-3"></div>`;
      el.querySelectorAll('[data-o]').forEach((b) => b.addEventListener('click', () => {
        el.querySelectorAll('[data-o]').forEach((x) => (x.disabled = true));
        const ok = b.dataset.o === c.ans;
        el.querySelectorAll('[data-o]').forEach((x) => { if (x.dataset.o === c.ans) x.className = 'opt-card p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-sm font-bold text-emerald-800 text-left anim-correct'; });
        if (ok) { score++; sfx().correct(); el.querySelector('[data-gavel]').textContent = '🔨'; el.querySelector('[data-gavel]').classList.add('anim-wiggle'); }
        else { sfx().wrong(); b.className = 'opt-card p-3 rounded-2xl bg-red-50 border-2 border-red-300 text-sm font-bold text-red-700 text-left anim-shake'; }
        el.querySelector('[data-fb]').innerHTML = `<div class="anim-pop flex items-center justify-between gap-3 p-3 rounded-2xl ${ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'} text-sm font-semibold"><span>${ok ? '✅ Putusan tepat!' : `❌ Yang tepat: <b>${esc(c.ans)}</b>`}</span><button type="button" data-next class="${BTN_PRIMARY}">Lanjut</button></div>`;
        el.querySelector('[data-next]').addEventListener('click', () => { i++; render(); });
      }));
    }
    render();
  }

  // ═════════════════════ WIDGET: Racik Lisensi CC ═════════════════════
  function ccBuilder(el, opts) {
    const st = { commercial: true, modify: 'yes' };
    const targets = [{ code: 'CC BY-NC-SA', hint: 'Boleh diubah tapi lisensi harus sama, dan tidak untuk komersial' }, { code: 'CC BY-ND', hint: 'Boleh dijual, tapi tidak boleh diubah' }];
    let ti = 0;
    el.innerHTML = `
      <div class="grid md:grid-cols-2 gap-4">
        <div class="space-y-4">
          <div class="p-3 rounded-2xl bg-violet-50 border-2 border-violet-200 text-xs font-bold text-violet-900" data-target></div>
          <div><div class="text-xs font-extrabold text-navy mb-2">Boleh dipakai untuk tujuan komersial (dijual)?</div>
            <div class="grid grid-cols-2 gap-2">${[['true', 'Ya, boleh'], ['false', 'Tidak (NC)']].map(([v, l]) => `<button type="button" data-c="${v}" class="opt-card p-2.5 rounded-2xl border-2 text-sm font-bold">${l}</button>`).join('')}</div></div>
          <div><div class="text-xs font-extrabold text-navy mb-2">Boleh diubah / dibuat karya turunan?</div>
            <div class="grid grid-cols-3 gap-2">${[['yes', 'Ya'], ['sa', 'Ya, lisensi sama (SA)'], ['no', 'Tidak (ND)']].map(([v, l]) => `<button type="button" data-m="${v}" class="opt-card p-2.5 rounded-2xl border-2 text-xs font-bold">${l}</button>`).join('')}</div></div>
        </div>
        <div class="rounded-3xl bg-gradient-to-br from-slate-900 to-[#1b2a55] text-white p-5 flex flex-col items-center justify-center text-center" data-out></div>
      </div>
      <div class="mt-3 flex justify-end"><button type="button" data-submit class="${BTN_PRIMARY}">Cek Lisensi</button></div>
      <div data-fb class="mt-2"></div>`;
    function code() {
      let c = 'CC BY';
      if (!st.commercial) c += '-NC';
      if (st.modify === 'sa') c += '-SA';
      if (st.modify === 'no') c += '-ND';
      return c;
    }
    function paint() {
      el.querySelector('[data-target]').innerHTML = ti < targets.length ? `🎯 Tantangan ${ti + 1}/${targets.length}: ${targets[ti].hint}` : '🏁 Semua tantangan selesai! Bebas bereksperimen.';
      el.querySelectorAll('[data-c]').forEach((b) => { const on = String(st.commercial) === b.dataset.c; b.className = `opt-card p-2.5 rounded-2xl border-2 text-sm font-bold ${on ? 'bg-primary text-white border-primary-dark' : 'bg-white text-navy border-slate-200'}`; });
      el.querySelectorAll('[data-m]').forEach((b) => { const on = st.modify === b.dataset.m; b.className = `opt-card p-2.5 rounded-2xl border-2 text-xs font-bold ${on ? 'bg-primary text-white border-primary-dark' : 'bg-white text-navy border-slate-200'}`; });
      const c = code();
      const parts = [['BY', '👤', 'Atribusi: wajib cantumkan nama'], ...(!st.commercial ? [['NC', '🚫💲', 'Non-komersial']] : []), ...(st.modify === 'sa' ? [['SA', '🔁', 'Bagikan dengan lisensi sama']] : []), ...(st.modify === 'no' ? [['ND', '🔒', 'Tanpa turunan / tidak boleh diubah']] : [])];
      el.querySelector('[data-out]').innerHTML = `<div class="text-[10px] font-black tracking-widest text-sky-300">LISENSIMU</div>
        <div class="text-3xl font-black mt-1 anim-pop" key="${c}">${c}</div>
        <div class="mt-3 flex flex-wrap justify-center gap-2">${parts.map(([k, ic, d]) => `<div class="anim-pop px-2.5 py-1.5 rounded-xl bg-white/10 text-[11px] font-bold" title="${d}">${ic} ${k}</div>`).join('')}</div>
        <div class="mt-3 text-[11px] text-blue-100 leading-relaxed">${parts.map((p) => p[2]).join(' • ')}</div>`;
    }
    el.querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => { st.commercial = b.dataset.c === 'true'; sfx().click(); paint(); }));
    el.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => { st.modify = b.dataset.m; sfx().click(); paint(); }));
    el.querySelector('[data-submit]').addEventListener('click', () => {
      const fb = el.querySelector('[data-fb]');
      if (ti >= targets.length) return;
      if (code() === targets[ti].code) {
        sfx().correct();
        fb.innerHTML = `<div class="anim-pop p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-bold">✅ Tepat, itu ${targets[ti].code}!</div>`;
        ti++;
        if (ti === targets.length) { if (window.X) X.confetti({ count: 70 }); opts.onDone && opts.onDone(); }
        paint();
      } else {
        sfx().wrong();
        el.querySelector('[data-out]').classList.add('anim-shake');
        setTimeout(() => el.querySelector('[data-out]').classList.remove('anim-shake'), 500);
        fb.innerHTML = `<div class="anim-pop p-3 rounded-2xl bg-red-50 text-red-800 text-sm font-bold">Belum pas. Baca lagi tantangannya ya.</div>`;
      }
    });
    paint();
  }

  // ═════════════════════ WIDGET: Chat Netiket ═════════════════════
  function netiquetteChat(el, opts) {
    const rounds = [
      { from: 'Bu Rina (Guru)', msg: 'Anak-anak, tugas laporan dikumpulkan Jumat ya. Ada pertanyaan?', replies: [
        ['IYA BU!!! KENAPA CEPET BANGET SIH', false, 'Huruf kapital semua terkesan berteriak & tidak sopan.'],
        ['Baik, Bu. Izin bertanya, apakah laporan boleh dikirim dalam format PDF? Terima kasih 🙏', true, 'Sopan, jelas, dan pakai salam.'],
        ['p', false, 'Pesan "p" tidak jelas maksudnya dan kurang menghargai.']] },
      { from: 'Kevin', msg: 'Eh guys, ini ss chat pribadi si Andi lagi curhat, lucu wkwk 😂', replies: [
        ['Wkwk sebar ke grup sebelah!', false, 'Menyebar chat pribadi tanpa izin melanggar privasi.'],
        ['Vin, mending dihapus deh. Itu privasi Andi, kasihan kalau tersebar.', true, 'Kamu menghormati privasi teman dan mengingatkan dengan baik.'],
        ['🤣🤣🤣', false, 'Ikut menertawakan sama saja mendukung perundungan.']] },
      { from: 'Sinta', msg: 'Katanya besok sekolah libur karena ada badai, beneran?', replies: [
        ['Iya bener! Aku denger dari temen sepupuku', false, 'Info tanpa sumber jelas bisa jadi hoaks.'],
        ['Belum tahu, Sin. Yuk cek pengumuman resmi sekolah atau info BMKG dulu.', true, 'Mengajak verifikasi ke sumber resmi — netiket & literasi digital!'],
        ['Libur lah, sebarin aja biar semua tau', false, 'Menyebar info yang belum pasti berpotensi hoaks.']] },
    ];
    let r = 0, score = 0;
    el.innerHTML = `
      <div class="max-w-xl mx-auto rounded-[28px] overflow-hidden border-2 border-slate-200 shadow-card">
        <div class="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-3 flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center font-black">XI</div>
          <div><div class="font-extrabold text-sm">Grup Kelas XI HJ 5</div><div class="text-[10px] text-emerald-50" data-typing>36 anggota</div></div>
        </div>
        <div class="bg-[#ECE5DD] p-3 space-y-2 h-[300px] overflow-y-auto thin-scroll" data-chat></div>
        <div class="bg-white p-3 space-y-2" data-replies></div>
      </div>`;
    const chat = el.querySelector('[data-chat]');
    const replies = el.querySelector('[data-replies]');
    function bubble(html, mine) {
      chat.insertAdjacentHTML('beforeend', `<div class="flex ${mine ? 'justify-end' : 'justify-start'}"><div class="anim-pop max-w-[82%] px-3 py-2 rounded-2xl text-[13px] shadow-sm ${mine ? 'bg-[#DCF8C6] rounded-br-sm' : 'bg-white rounded-bl-sm'}">${html}</div></div>`);
      chat.scrollTop = chat.scrollHeight;
    }
    async function play() {
      if (r >= rounds.length) {
        replies.innerHTML = `<div class="anim-bounce-in text-center py-2"><div class="text-3xl">${score === rounds.length ? '🌟' : '💬'}</div><div class="font-black text-navy">${score}/${rounds.length} balasan beretika</div></div>`;
        sfx().win();
        opts.onDone && opts.onDone();
        return;
      }
      const rd = rounds[r];
      replies.innerHTML = '';
      el.querySelector('[data-typing]').textContent = `${rd.from} sedang mengetik…`;
      chat.insertAdjacentHTML('beforeend', `<div data-dots class="flex"><div class="px-3 py-2 rounded-2xl bg-white flex gap-1"><span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span><span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style="animation-delay:.15s"></span><span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style="animation-delay:.3s"></span></div></div>`);
      chat.scrollTop = chat.scrollHeight;
      await sleep(900);
      chat.querySelector('[data-dots]')?.remove();
      el.querySelector('[data-typing]').textContent = '36 anggota';
      bubble(`<div class="text-[11px] font-bold text-teal-700">${esc(rd.from)}</div>${esc(rd.msg)}`);
      sfx().pop();
      replies.innerHTML = `<div class="text-[11px] font-bold text-text-muted">Pilih balasanmu:</div>` + shuffle(rd.replies.map((x, k) => k)).map((k) => `<button type="button" data-k="${k}" class="opt-card w-full text-left p-2.5 rounded-2xl bg-white border-2 border-slate-200 text-[13px] font-semibold text-navy">${esc(rd.replies[k][0])}</button>`).join('');
      replies.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', async () => {
        const [txt, ok, why] = rd.replies[+b.dataset.k];
        replies.querySelectorAll('[data-k]').forEach((x) => (x.disabled = true));
        bubble(`${esc(txt)} <span class="text-[10px] text-slate-400 ml-1">✓✓</span>`, true);
        if (ok) { score++; sfx().correct(); } else sfx().wrong();
        await sleep(350);
        replies.innerHTML = `<div class="anim-pop p-3 rounded-2xl text-sm font-semibold ${ok ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}">${ok ? '👍 Netiket mantap!' : '🤔 Kurang tepat.'} ${esc(why)}</div><button type="button" data-next class="w-full ${BTN_PRIMARY}">Lanjut</button>`;
        replies.querySelector('[data-next]').addEventListener('click', () => { r++; play(); });
      }));
    }
    play();
  }

  const WIDGETS = { pipeline, crawler, indexer, ranking, operatorPlayground, triangulation, hoaxSwipe, dataSorter, caseMatch, ccBuilder, netiquetteChat };

  window.XLessons = {
    DOCS, parseQuery, search, resultCard, flip, shuffle, BTN, BTN_PRIMARY, BTN_GHOST,
    mount(name, el, opts) {
      const fn = WIDGETS[name];
      if (!fn) { el.innerHTML = '<p class="text-sm text-text-muted">Widget tidak ditemukan.</p>'; return; }
      try { fn(el, opts || {}); } catch (e) { console.error('Widget error', name, e); el.innerHTML = '<p class="text-sm text-red-600">Terjadi kendala memuat aktivitas ini.</p>'; }
    },
  };
})();
