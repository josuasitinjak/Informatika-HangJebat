(function () {
  'use strict';
  const terms = [
    ['crawler','Mesin Pencari','Program otomatis yang mengikuti tautan dan mengunjungi halaman web untuk ditemukan mesin pencari.','Bot pencari menelusuri halaman sekolah lalu mengikuti tautan ke halaman berita.'],
    ['crawling','Mesin Pencari','Proses menjelajahi halaman web menggunakan crawler.','Seperti petugas yang berkeliling mencari buku baru untuk perpustakaan.'],
    ['indeks pencarian','Mesin Pencari','Kumpulan informasi halaman yang sudah ditemukan dan dipetakan oleh mesin pencari.','Saat mencari, mesin biasanya memeriksa indeksnya terlebih dahulu.'],
    ['inverted index','Mesin Pencari','Struktur yang memetakan sebuah kata ke daftar dokumen yang memuat kata tersebut.','Kata “gempa” dapat dipetakan ke halaman BMKG dan artikel mitigasi.'],
    ['ranking','Mesin Pencari','Pengurutan hasil berdasarkan perkiraan relevansi terhadap kebutuhan pencari.','Hasil teratas tidak otomatis paling benar; sumber dan tanggal tetap perlu diperiksa.'],
    ['query','Mesin Pencari','Kata, frasa, atau perintah yang dimasukkan ke kotak pencarian.','site:bmkg.go.id gempa adalah sebuah query.'],
    ['operator pencarian','Mesin Pencari','Perintah khusus untuk mempersempit atau mengatur hasil pencarian.','site: membatasi domain; tanda kutip mencari frasa yang sama persis.'],
    ['snippet','Mesin Pencari','Cuplikan singkat yang membantu memperkirakan isi halaman pada hasil pencarian.','Baca snippet untuk memilih hasil yang relevan, lalu cek isi halaman aslinya.'],
    ['SEO','Mesin Pencari','Upaya membuat halaman mudah ditemukan dan dipahami mesin pencari.','SEO yang baik membantu penemuan; tidak menjadi bukti bahwa klaim halaman benar.'],
    ['membaca lateral','Mesin Pencari','Memeriksa sumber dengan membuka informasi dari situs atau tab lain, bukan hanya membaca halaman itu sendiri.','Cari siapa penerbit situs dan apa kata sumber tepercaya lain tentang klaimnya.'],
    ['SIFT','Mesin Pencari','Kerangka periksa informasi: Stop, Investigate the source, Find better coverage, Trace claims to the original.','Berhenti, selidiki sumber, cari liputan lain, lalu telusuri klaim ke sumber awal.'],
    ['triangulasi','Mesin Pencari','Membandingkan klaim dengan beberapa sumber yang independen dan relevan.','Tiga situs yang menyalin siaran pers sama bukan tiga konfirmasi independen.'],
    ['data pribadi','Hukum Digital','Data tentang seseorang yang dapat mengenali orang tersebut secara langsung atau melalui penggabungan dengan data lain.','Nama yang digabungkan dengan kelas dan sekolah dapat mengarah ke seseorang.'],
    ['data pribadi spesifik','Hukum Digital','Kategori data pribadi yang lebih sensitif dan memerlukan perlindungan khusus sesuai aturan yang berlaku.','Data kesehatan dan biometrik termasuk contoh yang perlu dijaga ketat.'],
    ['persetujuan','Hukum Digital','Pernyataan setuju yang diberikan secara sadar setelah seseorang menerima informasi yang diperlukan.','Sebelum mengunggah foto teman, mintalah izin dan perhatikan konteksnya.'],
    ['jejak digital','Hukum Digital','Rekaman aktivitas atau informasi yang tertinggal ketika seseorang menggunakan layanan digital.','Komentar publik dapat disalin atau tersimpan meski kemudian dihapus.'],
    ['phishing','Hukum Digital','Upaya menipu seseorang agar memberikan kata sandi, kode OTP, atau informasi penting lainnya.','Pesan palsu yang mengaku dari sekolah dan meminta kode OTP adalah tanda bahaya.'],
    ['akses tanpa hak','Hukum Digital','Memasuki akun atau sistem tanpa izin pemilik atau kewenangan yang sah.','Mengetahui kata sandi teman tidak otomatis memberi izin untuk masuk ke akunnya.'],
    ['hak cipta','Hukum Digital','Hak yang melekat pada pencipta atas karya yang dibuatnya, sesuai ketentuan hukum.','Foto, ilustrasi, musik, tulisan, dan video dapat memiliki perlindungan hak cipta.'],
    ['plagiarisme','Hukum Digital','Mengambil atau memakai karya maupun gagasan orang lain seolah-olah milik sendiri.','Menyalin paragraf tugas tanpa sumber dapat menjadi plagiarisme.'],
    ['atribusi','Hukum Digital','Pencantuman keterangan yang mengakui pencipta atau sumber karya yang digunakan.','Tuliskan nama pembuat dan tautan sumber sesuai syarat lisensinya.'],
    ['lisensi Creative Commons','Hukum Digital','Pilihan lisensi yang menjelaskan izin dan syarat penggunaan suatu karya.','Periksa apakah lisensi mengizinkan adaptasi atau penggunaan komersial.'],
    ['netiket','Hukum Digital','Pedoman bersikap sopan, aman, dan menghargai orang lain saat berkomunikasi secara daring.','Kritik isi gagasan dengan sopan; jangan menyebarkan data pribadi.'],
    ['workbook','Excel & Power BI','Berkas Excel yang dapat memuat satu atau beberapa lembar kerja.','Satu workbook bisa menyimpan data penjualan dan ringkasan pada sheet berbeda.'],
    ['worksheet','Excel & Power BI','Lembar kerja berbentuk kisi baris dan kolom di dalam workbook.','Setiap worksheet memiliki nama tab di bagian bawah Excel.'],
    ['sel (cell)','Excel & Power BI','Kotak pada perpotongan satu baris dan satu kolom.','B3 berarti sel di kolom B dan baris 3.'],
    ['range','Excel & Power BI','Sekumpulan satu atau lebih sel yang dinyatakan dengan alamat.','A2:C8 mencakup kolom A sampai C pada baris 2 sampai 8.'],
    ['formula','Excel & Power BI','Ekspresi yang ditulis untuk menghitung atau mengolah nilai; biasanya dimulai dengan tanda sama dengan.','=B2*C2 mengalikan nilai pada B2 dan C2.'],
    ['fungsi','Excel & Power BI','Rumus siap pakai yang menjalankan operasi tertentu pada data.','SUM menjumlahkan angka; AVERAGE menghitung nilai rata-rata.'],
    ['referensi relatif','Excel & Power BI','Alamat sel yang menyesuaikan posisinya ketika formula disalin ke lokasi lain.','B2 biasanya berubah menjadi B3 ketika rumus disalin satu baris ke bawah.'],
    ['referensi absolut','Excel & Power BI','Alamat sel yang dikunci dengan tanda dolar agar tetap saat formula disalin.','$B$2 tetap menunjuk ke B2 ketika disalin ke sel lain.'],
    ['sortir dan filter','Excel & Power BI','Fitur untuk mengurutkan baris atau menampilkan baris yang memenuhi kriteria tertentu.','Filter dapat menampilkan transaksi bulan tertentu tanpa menghapus data lain.'],
    ['pembersihan data','Excel & Power BI','Proses memeriksa dan membetulkan data yang kosong, ganda, salah format, atau tidak konsisten.','Samakan format tanggal dan cek nama produk ganda sebelum membuat ringkasan.'],
    ['PivotTable','Excel & Power BI','Fitur untuk merangkum dan menyusun ulang data berdasarkan kategori tanpa menulis banyak formula.','Jumlah penjualan dapat diringkas menurut bulan dan nama produk.'],
    ['visualisasi data','Excel & Power BI','Penyajian data dalam bentuk visual agar pola dan perbandingan lebih mudah dibaca.','Diagram batang cocok membandingkan jumlah antarkategori.'],
    ['dashboard','Excel & Power BI','Tampilan ringkas berisi metrik dan visual utama untuk membantu memahami keadaan data.','Dashboard penjualan bisa memuat total, tren bulanan, dan produk terlaris.'],
    ['KPI','Excel & Power BI','Indikator terukur yang dipakai untuk menilai kemajuan menuju tujuan tertentu.','Target ketepatan stok dapat menjadi KPI jika definisi dan cara ukurnya jelas.'],
    ['Power Query','Excel & Power BI','Alat untuk mengimpor, membersihkan, dan membentuk data sebelum dianalisis.','Langkah pembersihan yang sama dapat dijalankan kembali saat data diperbarui.'],
    ['model data','Excel & Power BI','Susunan tabel dan hubungan antartabel yang dipakai untuk analisis.','Tabel transaksi dapat dihubungkan dengan tabel produk melalui kode produk.'],
  ].map(([term, topic, meaning, example], i) => ({ id: `g${i + 1}`, term, topic, meaning, example, bab: topic === 'Mesin Pencari' ? 1 : topic === 'Hukum Digital' ? 2 : 3 }));

  const esc = (value) => window.X ? X.esc(value) : String(value).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const key = 'xavetra_glossary_saved_v1';
  const readSaved = () => { try { const raw = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(raw) ? raw.filter((id) => terms.some((t) => t.id === id)) : []; } catch (_) { return []; } };
  let saved = readSaved(), activeTopic = 'Semua', onlySaved = false, deck = [], deckIndex = 0, revealed = false;
  const list = document.getElementById('glossary-list');
  const search = document.getElementById('glossary-search');
  const categories = ['Semua', 'Mesin Pencari', 'Hukum Digital', 'Excel & Power BI'];

  function renderFilters() {
    document.getElementById('glossary-filters').innerHTML = categories.map((label) => `<button type="button" data-topic="${esc(label)}" aria-pressed="${activeTopic === label}" class="rounded-full px-3 py-2 text-[11px] font-extrabold transition ${activeTopic === label ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">${esc(label)}</button>`).join('');
  }
  function renderList() {
    const query = search.value.trim().toLocaleLowerCase('id');
    const visible = terms.filter((t) => (activeTopic === 'Semua' || t.topic === activeTopic) && (!onlySaved || saved.includes(t.id)) && (!query || `${t.term} ${t.topic} ${t.meaning} ${t.example}`.toLocaleLowerCase('id').includes(query)));
    list.innerHTML = visible.map((t) => `<article class="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition" data-spot>
      <div class="flex items-start justify-between gap-3"><div class="min-w-0"><span class="text-[10px] font-black tracking-widest text-primary">${esc(t.topic.toUpperCase())}</span><h2 class="text-lg font-black text-navy mt-1">${esc(t.term)}</h2></div>
      <button type="button" data-save="${t.id}" aria-label="${saved.includes(t.id) ? 'Hapus' : 'Simpan'} istilah ${esc(t.term)}" aria-pressed="${saved.includes(t.id)}" class="shrink-0 w-10 h-10 rounded-xl border border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-amber-50 ${saved.includes(t.id) ? 'text-amber-500 bg-amber-50' : ''}"><span class="material-symbols-outlined">${saved.includes(t.id) ? 'bookmark_added' : 'bookmark_add'}</span></button></div>
      <p class="text-sm text-slate-700 leading-relaxed mt-3">${esc(t.meaning)}</p><p class="text-xs text-slate-500 leading-relaxed mt-3"><strong class="text-slate-700">Contoh:</strong> ${esc(t.example)}</p>
      <a href="modul.html?bab=${t.bab}" class="inline-flex items-center gap-1 mt-4 text-xs font-extrabold text-primary hover:underline">Buka materi terkait <span aria-hidden="true">→</span></a></article>`).join('');
    document.getElementById('glossary-count').textContent = `${visible.length} dari ${onlySaved ? saved.length : terms.length} istilah`;
    document.getElementById('glossary-empty').classList.toggle('hidden', visible.length > 0);
    document.getElementById('saved-count').textContent = saved.length;
    document.querySelector('[data-show-saved]').setAttribute('aria-pressed', String(onlySaved));
  }
  function makeDeck() { const chosen = saved.length ? terms.filter((t) => saved.includes(t.id)) : terms; deck = chosen.slice(); if (deck.length > 1) { for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; } } deckIndex = 0; revealed = false; renderCard(); }
  function renderCard() {
    const card = deck[deckIndex];
    document.getElementById('flash-category').textContent = card ? card.topic.toUpperCase() : 'KARTU BELAJAR';
    document.getElementById('flash-position').textContent = card ? `${deckIndex + 1} / ${deck.length}` : '';
    document.getElementById('flash-term').textContent = card ? card.term : 'Belum ada kartu';
    const answer = document.getElementById('flash-answer');
    answer.textContent = card ? `${card.meaning} Contoh: ${card.example}` : 'Simpan beberapa istilah atau mulai dari daftar glosarium.';
    answer.classList.toggle('hidden', !card || !revealed);
    document.getElementById('flash-reveal').textContent = revealed ? 'Tutup arti' : 'Lihat arti';
    document.getElementById('flash-reveal').disabled = !card;
    document.getElementById('flash-hint').textContent = card ? (saved.length ? 'Kartu berasal dari istilah yang kamu simpan.' : 'Simpan istilah untuk membuat dek latihan khusus.') : '';
  }
  document.getElementById('glossary-filters').addEventListener('click', (e) => { const b = e.target.closest('[data-topic]'); if (!b) return; activeTopic = b.dataset.topic; onlySaved = false; renderFilters(); renderList(); });
  search.addEventListener('input', renderList);
  document.querySelector('[data-show-saved]').addEventListener('click', () => { onlySaved = !onlySaved; renderList(); });
  list.addEventListener('click', (e) => { const b = e.target.closest('[data-save]'); if (!b) return; const id = b.dataset.save; saved = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id]; try { localStorage.setItem(key, JSON.stringify(saved)); } catch (_) {} renderList(); makeDeck(); });
  document.getElementById('flash-reveal').addEventListener('click', () => { revealed = !revealed; renderCard(); });
  document.getElementById('flash-next').addEventListener('click', () => { if (!deck.length) return; deckIndex = (deckIndex + 1) % deck.length; revealed = false; renderCard(); });
  document.getElementById('flash-prev').addEventListener('click', () => { if (!deck.length) return; deckIndex = (deckIndex - 1 + deck.length) % deck.length; revealed = false; renderCard(); });
  renderFilters(); renderList(); makeDeck();
})();
