/**
 * XAVETRA — Kurikulum bawaan Informatika Fase F (Kelas XI)
 * 3 bab inti + langkah pelajaran interaktif + bank soal kuis.
 *
 * Tipe langkah (step):
 *   read   → bacaan (HTML aman, ditulis oleh tim pengajar)
 *   widget → animasi/latihan interaktif dari lessons.js
 *   check  → cek pemahaman cepat (1 soal pilihan ganda)
 *
 * Tipe soal (quiz):
 *   mc    → pilihan ganda (answer = indeks opsi benar)
 *   tf    → benar / salah (answer = true/false)
 *   order → urutkan langkah (items ditulis dalam urutan BENAR, diacak saat tampil)
 *   build → susun query dari token (answer = token wajib, urutan bebas)
 */
(function () {
  'use strict';

  const OLD_CHAPTERS = [
    // ════════════════════════════════════════ BAB 1 ════════════════════════════════════════
    {
      id: 'bab1',
      number: 1,
      title: 'Mesin Pencari & Cara Kerjanya',
      short: 'Mesin Pencari',
      badge: 'Arsitektur Web',
      icon: 'travel_explore',
      color: 'blue',
      duration: '25 Menit',
      desc: 'Kenali cara Google & kawan-kawan bekerja: robot crawler menjelajah web, indeks raksasa menyimpan kata kunci, lalu algoritma ranking memilih hasil terbaik dalam hitungan milidetik.',
      goals: ['Menjelaskan fungsi mesin pencari', 'Mengurutkan tahap crawling → indexing → ranking', 'Memahami konsep inverted index & PageRank'],
      steps: [
        {
          type: 'read',
          title: 'Apa itu Mesin Pencari?',
          html: `
            <p>Setiap hari ada miliaran halaman web baru. Tanpa <strong>mesin pencari</strong> (search engine), kita seperti mencari satu buku di perpustakaan raksasa tanpa katalog.</p>
            <p>Mesin pencari adalah <strong>sistem perangkat lunak</strong> yang mengumpulkan, menyimpan, dan menyajikan informasi dari internet sesuai kata kunci (<em>query</em>) yang kita ketik.</p>
            <h3>Contoh mesin pencari populer</h3>
            <table>
              <tr><th>Mesin Pencari</th><th>Ciri Khas</th></tr>
              <tr><td><strong>Google</strong></td><td>Paling banyak dipakai, algoritma PageRank & AI.</td></tr>
              <tr><td><strong>Bing</strong></td><td>Milik Microsoft, terintegrasi dengan Windows & Copilot.</td></tr>
              <tr><td><strong>DuckDuckGo</strong></td><td>Fokus privasi, tidak melacak riwayat pencarian.</td></tr>
              <tr><td><strong>Ecosia</strong></td><td>Keuntungan iklannya dipakai untuk menanam pohon.</td></tr>
            </table>
            <div class="callout callout-info"><span>💡</span><span>Mesin pencari <strong>tidak mencari di internet secara langsung</strong> saat kamu menekan Enter. Ia mencari di <strong>indeks</strong> yang sudah disiapkan sebelumnya. Itulah kenapa hasilnya muncul dalam 0,5 detik!</span></div>`,
        },
        {
          type: 'widget',
          widget: 'pipeline',
          title: '3 Tahap Kerja: Crawling → Indexing → Ranking',
          intro: 'Tekan <b>Putar Animasi</b> dan perhatikan perjalanan data dari web sampai ke layar hasil pencarian.',
        },
        {
          type: 'widget',
          widget: 'crawler',
          title: 'Lab Crawler: Jadilah Robot Spider!',
          intro: 'Robot crawler berpindah dari satu halaman ke halaman lain lewat <b>tautan (link)</b>. Klik halaman yang terhubung untuk merayapi seluruh web mini ini.',
        },
        {
          type: 'read',
          title: 'Indexing: Katalog Raksasa',
          html: `
            <p>Setelah halaman dikumpulkan, mesin pencari <strong>membaca isinya</strong>, membuang kata umum (seperti "yang", "di", "dan"), lalu mencatat <strong>kata kunci → daftar halaman</strong> yang memuatnya.</p>
            <p>Struktur data ini disebut <strong>inverted index</strong> (indeks terbalik), mirip indeks di halaman belakang buku pelajaran.</p>
            <table>
              <tr><th>Kata kunci</th><th>Muncul di halaman</th></tr>
              <tr><td><code>hoaks</code></td><td>Hal. 2, Hal. 5, Hal. 9</td></tr>
              <tr><td><code>gempa</code></td><td>Hal. 1, Hal. 5</td></tr>
              <tr><td><code>bmkg</code></td><td>Hal. 1</td></tr>
            </table>
            <div class="callout callout-tip"><span>⚡</span><span>Cari "gempa bmkg"? Mesin pencari cukup mencari irisan daftar <code>gempa</code> ∩ <code>bmkg</code> → Hal. 1. Super cepat tanpa membaca ulang semua halaman.</span></div>`,
        },
        {
          type: 'widget',
          widget: 'indexer',
          title: 'Bangun Inverted Index Sendiri',
          intro: 'Klik setiap dokumen untuk “mengindeks” kata-katanya. Lalu coba cari kata kunci dan lihat dokumen mana yang cocok.',
        },
        {
          type: 'read',
          title: 'Ranking: Siapa Juara Halaman 1?',
          html: `
            <p>Untuk satu kata kunci bisa ada jutaan halaman. Algoritma <strong>ranking</strong> menentukan urutannya berdasarkan ratusan sinyal, di antaranya:</p>
            <ul>
              <li><strong>Relevansi</strong> — seberapa cocok isi halaman dengan kata kunci.</li>
              <li><strong>Otoritas / PageRank</strong> — halaman yang banyak ditautkan oleh situs tepercaya dianggap lebih penting.</li>
              <li><strong>Kesegaran</strong> — informasi terbaru diutamakan untuk topik yang cepat berubah (berita, gempa).</li>
              <li><strong>Pengalaman pengguna</strong> — cepat dibuka, aman (HTTPS), nyaman di HP.</li>
            </ul>
            <div class="callout callout-warn"><span>⚠️</span><span>Peringkat 1 <strong>bukan jaminan benar</strong>. Hasil teratas bisa berupa iklan atau situs yang pandai SEO. Tetap cek sumbernya (dibahas di Bab 2).</span></div>`,
        },
        {
          type: 'widget',
          widget: 'ranking',
          title: 'Simulasi Ranking: Atur Bobot Algoritma',
          intro: 'Geser bobot sinyal ranking dan lihat urutan hasil pencarian berubah secara langsung.',
        },
        {
          type: 'check',
          title: 'Cek Pemahaman',
          q: {
            type: 'mc',
            question: 'Kenapa hasil pencarian bisa muncul kurang dari 1 detik?',
            options: ['Mesin pencari membuka semua situs saat itu juga', 'Mesin pencari mencari di indeks yang sudah disiapkan sebelumnya', 'Karena internet kita sangat cepat', 'Karena hanya menampilkan 10 situs saja'],
            answer: 1,
            explain: 'Crawling & indexing dilakukan jauh sebelum kamu mencari. Saat Enter ditekan, sistem hanya mencari di indeks lalu meranking hasilnya.',
          },
        },
      ],
    },

    // ════════════════════════════════════════ BAB 2 ════════════════════════════════════════
    {
      id: 'bab2',
      number: 2,
      title: 'Strategi Riset, Operator & Triangulasi',
      short: 'Strategi Riset',
      badge: 'Literasi Informasi',
      icon: 'manage_search',
      color: 'violet',
      duration: '30 Menit',
      desc: 'Cari seperti pro: kuasai operator pencarian, baca lateral seperti fact-checker, dan verifikasi info dengan triangulasi minimal 3 sumber independen.',
      goals: ['Menggunakan operator " ", -, site:, filetype:, OR, intitle:', 'Menerapkan membaca lateral (SIFT)', 'Melakukan triangulasi 3 sumber'],
      steps: [
        {
          type: 'read',
          title: 'Operator Pencarian: Jurus Rahasia',
          html: `
            <p>Mengetik kalimat panjang di Google sering menghasilkan jutaan hasil acak. <strong>Operator pencarian</strong> membantu menyaring hasil seperti filter kamera.</p>
            <table>
              <tr><th>Operator</th><th>Fungsi</th><th>Contoh</th></tr>
              <tr><td><code>"..."</code></td><td>Frasa persis</td><td><code>"kurikulum merdeka"</code></td></tr>
              <tr><td><code>-kata</code></td><td>Kecualikan kata</td><td><code>jaguar -mobil</code></td></tr>
              <tr><td><code>site:</code></td><td>Batasi ke situs/domain</td><td><code>site:go.id</code></td></tr>
              <tr><td><code>filetype:</code></td><td>Format berkas</td><td><code>filetype:pdf</code></td></tr>
              <tr><td><code>OR</code></td><td>Salah satu kata</td><td><code>hoaks OR disinformasi</code></td></tr>
              <tr><td><code>intitle:</code></td><td>Kata wajib ada di judul</td><td><code>intitle:jadwal</code></td></tr>
            </table>
            <div class="callout callout-tip"><span>💡</span><span>Jangan beri spasi setelah titik dua: tulis <code>site:bmkg.go.id</code>, bukan <code>site: bmkg.go.id</code>.</span></div>`,
        },
        {
          type: 'widget',
          widget: 'operatorPlayground',
          title: 'Playground Operator (Hasil Bergerak Live!)',
          intro: 'Ketik atau klik operator. Hasil pencarian di bawah tersaring <b>secara langsung</b> sesuai query-mu.',
        },
        {
          type: 'read',
          title: 'Membaca Lateral & Metode SIFT',
          html: `
            <p>Pemeriksa fakta profesional tidak membaca satu situs dari atas ke bawah. Mereka <strong>membuka tab baru</strong> untuk mencari tahu <em>siapa</em> di balik situs itu. Teknik ini disebut <strong>membaca lateral</strong>.</p>
            <h3>Metode SIFT</h3>
            <ol>
              <li><strong>S</strong>top — berhenti sejenak, jangan langsung percaya atau membagikan.</li>
              <li><strong>I</strong>nvestigate the source — selidiki siapa pembuat/penerbitnya.</li>
              <li><strong>F</strong>ind better coverage — cari liputan dari sumber lain yang tepercaya.</li>
              <li><strong>T</strong>race claims — telusuri klaim ke sumber aslinya (data, dokumen resmi, wawancara asli).</li>
            </ol>`,
        },
        {
          type: 'widget',
          widget: 'triangulation',
          title: 'Misi Triangulasi 3 Sumber',
          intro: 'Sebuah kabar viral beredar. Pilih <b>3 sumber independen yang kredibel</b> untuk memverifikasinya.',
        },
        {
          type: 'check',
          title: 'Cek Pemahaman',
          q: {
            type: 'mc',
            question: 'Query mana yang paling tepat untuk mencari dokumen PDF resmi tentang "kurikulum merdeka" hanya dari situs Kemendikbud?',
            options: ['kurikulum merdeka kemdikbud pdf download', 'site:kemdikbud.go.id "kurikulum merdeka" filetype:pdf', '"site kemdikbud" kurikulum merdeka pdf', 'filetype:kemdikbud.go.id kurikulum merdeka'],
            answer: 1,
            explain: 'site: membatasi domain, tanda kutip mencari frasa persis, dan filetype:pdf menyaring format dokumen.',
          },
        },
      ],
    },

    // ════════════════════════════════════════ BAB 3 ════════════════════════════════════════
    {
      id: 'bab3',
      number: 3,
      title: 'Hukum Digital: UU ITE & UU PDP',
      short: 'Hukum Digital',
      badge: 'Regulasi Siber',
      icon: 'gavel',
      color: 'orange',
      duration: '30 Menit',
      desc: 'Pahami batas aman bermedia digital: pasal penting UU ITE (hoaks, SARA, akses ilegal) dan hak kita atas data pribadi menurut UU Pelindungan Data Pribadi No. 27/2022.',
      goals: ['Mengenali pasal penting UU ITE', 'Membedakan data pribadi umum & spesifik', 'Menganalisis kasus pelanggaran hukum digital'],
      steps: [
        {
          type: 'read',
          title: 'Mengenal UU ITE',
          html: `
            <p><strong>UU Informasi dan Transaksi Elektronik (UU ITE)</strong> adalah UU No. 11 Tahun 2008 yang diubah dengan UU No. 19 Tahun 2016 dan terakhir <strong>UU No. 1 Tahun 2024</strong>. Aturan ini mengatur informasi, dokumen, dan transaksi elektronik di Indonesia.</p>
            <h3>Pasal yang wajib kamu kenal</h3>
            <table>
              <tr><th>Pasal</th><th>Perbuatan yang dilarang</th></tr>
              <tr><td><strong>27</strong></td><td>Menyebarkan konten melanggar kesusilaan & perjudian. (Pencemaran nama baik kini di <strong>27A</strong>, pemerasan/pengancaman di <strong>27B</strong>.)</td></tr>
              <tr><td><strong>28 ayat (1)</strong></td><td>Menyebarkan berita bohong/menyesatkan yang merugikan konsumen dalam transaksi elektronik.</td></tr>
              <tr><td><strong>28 ayat (2)</strong></td><td>Menyebarkan informasi yang menghasut kebencian berdasarkan SARA.</td></tr>
              <tr><td><strong>28 ayat (3)</strong></td><td>Menyebarkan pemberitahuan bohong yang menimbulkan kerusuhan di masyarakat.</td></tr>
              <tr><td><strong>29</strong></td><td>Mengirim ancaman kekerasan atau menakut-nakuti secara pribadi.</td></tr>
              <tr><td><strong>30</strong></td><td>Mengakses sistem/akun orang lain tanpa hak (hacking, akses ilegal).</td></tr>
              <tr><td><strong>32</strong></td><td>Mengubah, merusak, memindahkan, atau membocorkan data elektronik milik orang lain.</td></tr>
              <tr><td><strong>45–51</strong></td><td>Ketentuan pidana (ancaman penjara dan/atau denda).</td></tr>
            </table>
            <div class="callout callout-warn"><span>⚖️</span><span>Contoh: menyebarkan berita bohong yang merugikan konsumen (Pasal 28 ayat 1) diancam pidana penjara paling lama <strong>6 tahun</strong> dan/atau denda paling banyak <strong>Rp1 miliar</strong> (Pasal 45A).</span></div>`,
        },
        {
          type: 'widget',
          widget: 'hoaxSwipe',
          title: 'Game: Fakta atau Hoaks? (Geser Kartunya!)',
          intro: 'Geser kartu ke <b>kanan</b> jika menurutmu <b>aman/fakta</b>, ke <b>kiri</b> jika <b>hoaks/melanggar</b>. Bisa juga pakai tombol.',
        },
        {
          type: 'read',
          title: 'UU Pelindungan Data Pribadi (UU PDP)',
          html: `
            <p><strong>UU No. 27 Tahun 2022</strong> tentang Pelindungan Data Pribadi berlaku penuh sejak Oktober 2024. UU ini melindungi data yang bisa mengidentifikasi seseorang.</p>
            <table>
              <tr><th>Data Pribadi Umum</th><th>Data Pribadi Spesifik (lebih sensitif)</th></tr>
              <tr><td>Nama lengkap, jenis kelamin, kewarganegaraan, agama, status perkawinan, data yang dikombinasikan untuk mengenali seseorang.</td><td>Data kesehatan, biometrik (sidik jari, wajah), genetika, catatan kejahatan, data anak, data keuangan pribadi.</td></tr>
            </table>
            <h3>Hak kamu sebagai subjek data</h3>
            <ul>
              <li>Mendapat informasi tujuan pengumpulan data.</li>
              <li>Mengakses, memperbaiki, dan memperbarui datamu.</li>
              <li>Meminta data dihapus & menarik kembali persetujuan.</li>
              <li>Menggugat dan menerima ganti rugi atas pelanggaran.</li>
            </ul>
            <div class="callout callout-warn"><span>🚫</span><span>Mengungkapkan data pribadi milik orang lain secara melawan hukum diancam penjara hingga <strong>4 tahun</strong> dan/atau denda hingga <strong>Rp4 miliar</strong> (Pasal 67 ayat 2). Jadi <strong>jangan sebar KTP, nomor HP, atau alamat teman</strong> (doxing)!</span></div>`,
        },
        {
          type: 'widget',
          widget: 'dataSorter',
          title: 'Sortir Data: Umum atau Spesifik?',
          intro: 'Klik setiap data lalu masukkan ke keranjang yang tepat. Data spesifik butuh perlindungan ekstra!',
        },
        {
          type: 'widget',
          widget: 'caseMatch',
          title: 'Hakim Digital: Cocokkan Kasus dengan Pasal',
          intro: 'Baca kasusnya, lalu pilih pasal UU yang paling sesuai. Kamu adalah hakimnya!',
        },
        {
          type: 'check',
          title: 'Cek Pemahaman',
          q: {
            type: 'mc',
            question: 'Rani masuk ke akun Instagram temannya tanpa izin karena tahu kata sandinya. Perbuatan ini melanggar…',
            options: ['Pasal 27 UU ITE', 'Pasal 28 ayat (2) UU ITE', 'Pasal 30 UU ITE', 'UU Hak Cipta'],
            answer: 2,
            explain: 'Pasal 30 UU ITE melarang mengakses sistem elektronik/akun milik orang lain tanpa hak, walaupun kata sandinya diketahui.',
          },
        },
      ],
    },

    // ════════════════════════════════════════ BAB 4 ════════════════════════════════════════
    {
      id: 'bab4',
      number: 4,
      title: 'Hak Cipta Digital & Netiket',
      short: 'Hak Cipta & Netiket',
      badge: 'Etika Digital',
      icon: 'copyright',
      color: 'emerald',
      duration: '25 Menit',
      desc: 'Hargai karya orang lain dan tampil keren di internet: UU Hak Cipta No. 28/2014, lisensi Creative Commons, cara menghindari plagiarisme, dan etika berkomunikasi (netiket).',
      goals: ['Menjelaskan hak moral & hak ekonomi', 'Memilih lisensi Creative Commons yang tepat', 'Menerapkan netiket dalam komunikasi daring'],
      steps: [
        {
          type: 'read',
          title: 'Hak Cipta itu Otomatis!',
          html: `
            <p>Menurut <strong>UU No. 28 Tahun 2014</strong>, hak cipta adalah hak eksklusif pencipta yang <strong>timbul otomatis</strong> (prinsip deklaratif) begitu karya diwujudkan dalam bentuk nyata — tanpa perlu didaftarkan dulu.</p>
            <table>
              <tr><th>Hak Moral</th><th>Hak Ekonomi</th></tr>
              <tr><td>Hak agar nama pencipta tetap dicantumkan & karya tidak diubah sembarangan. Melekat selamanya.</td><td>Hak mendapat manfaat ekonomi: menerbitkan, menggandakan, menjual, menyewakan karya.</td></tr>
            </table>
            <h3>Berapa lama dilindungi?</h3>
            <ul>
              <li>Buku, lagu, lukisan: <strong>seumur hidup pencipta + 70 tahun</strong>.</li>
              <li>Program komputer, karya fotografi, video game: <strong>50 tahun</strong> sejak pertama diumumkan.</li>
            </ul>
            <div class="callout callout-info"><span>🎓</span><span>Untuk keperluan pendidikan, kamu boleh mengutip sebagian karya <strong>asal mencantumkan sumber</strong> dan tidak merugikan kepentingan wajar pencipta (Pasal 44).</span></div>`,
        },
        {
          type: 'widget',
          widget: 'ccBuilder',
          title: 'Racik Lisensi Creative Commons',
          intro: 'Pilih izin yang kamu inginkan untuk karyamu, dan lihat lisensi CC yang terbentuk secara otomatis.',
        },
        {
          type: 'read',
          title: 'Plagiarisme & Cara Atribusi',
          html: `
            <p><strong>Plagiarisme</strong> adalah mengakui karya/ide orang lain sebagai milik sendiri. Copy-paste tugas dari internet tanpa sumber = plagiat, walau hanya beberapa paragraf.</p>
            <h3>Cara aman memakai karya orang lain</h3>
            <ol>
              <li><strong>Kutip</strong> dengan tanda petik dan sebutkan sumbernya.</li>
              <li><strong>Parafrase</strong>: tulis ulang dengan kalimatmu sendiri, tetap cantumkan sumber.</li>
              <li><strong>Atribusi lengkap</strong> untuk gambar/musik: Judul – Pencipta – Sumber – Lisensi. Contoh: <code>"Pantai Nongsa" oleh Andi, via Wikimedia, CC BY 4.0</code>.</li>
            </ol>
            <h3>Netiket (Network Etiquette)</h3>
            <ul>
              <li>Ingat ada <strong>manusia</strong> di balik layar — jaga perasaan orang lain.</li>
              <li>Jangan menulis SEMUA HURUF KAPITAL (terkesan berteriak).</li>
              <li>Hormati privasi: jangan sebar tangkapan layar chat pribadi tanpa izin.</li>
              <li>Cek fakta sebelum membagikan & beri kritik dengan sopan.</li>
              <li>Hargai waktu orang lain: pesan singkat, jelas, dan pada waktu yang pantas.</li>
            </ul>`,
        },
        {
          type: 'widget',
          widget: 'netiquetteChat',
          title: 'Chat Simulator: Pilih Balasan Paling Netiket',
          intro: 'Kamu berada di grup kelas. Pilih balasan yang paling sopan dan beretika untuk setiap situasi.',
        },
        {
          type: 'check',
          title: 'Cek Pemahaman',
          q: {
            type: 'mc',
            question: 'Kamu ingin karyamu boleh dipakai & diubah orang lain, asal namamu dicantumkan dan TIDAK untuk dijual. Lisensi yang tepat adalah…',
            options: ['CC BY', 'CC BY-NC', 'CC BY-ND', 'CC0'],
            answer: 1,
            explain: 'BY = wajib atribusi, NC = Non-Commercial (tidak untuk komersial). Tanpa ND berarti boleh diubah.',
          },
        },
      ],
    },
  ];

  // Tiga bab resmi. Materi riset digabung ke Mesin Pencari; hak cipta/netiket ke Hukum Digital.
  const oldById = Object.fromEntries(OLD_CHAPTERS.map((chapter) => [chapter.id, chapter]));
  const CHAPTERS = [
    Object.assign({}, oldById.bab1, {
      number: 1, title: 'Mesin Pencari', short: 'Mesin Pencari', duration: '50 Menit',
      desc: 'Pahami cara kerja mesin pencari, susun query yang tepat, lalu verifikasi informasi dengan membaca lateral dan triangulasi.',
      goals: ['Menjelaskan crawling, indexing, dan ranking', 'Menggunakan operator pencarian', 'Memeriksa kredibilitas informasi'],
      steps: oldById.bab1.steps.concat(oldById.bab2.steps),
    }),
    Object.assign({}, oldById.bab3, {
      number: 2, title: 'Hukum dan Perundang-Undangan Digital di Indonesia', short: 'Hukum Digital', duration: '55 Menit',
      desc: 'Pelajari UU ITE, UU PDP, UU Hak Cipta, lisensi karya, dan etika berkomunikasi digital.',
      goals: ['Mengenali aturan digital di Indonesia', 'Melindungi data pribadi dan menghargai hak cipta', 'Menerapkan netiket'],
      steps: oldById.bab3.steps.concat(oldById.bab4.steps),
    }),
    {
      id: 'bab5', number: 3, title: 'Analisis Data (Excel dan Power BI)', short: 'Analisis Data', badge: 'Data & Visualisasi', icon: 'query_stats', color: 'emerald', duration: '35 Menit',
      desc: 'Bersihkan, hitung, rangkum, dan sajikan data dengan Excel dan Power BI.',
      goals: ['Memilih rumus Excel sesuai kebutuhan', 'Meringkas data dengan tabel pivot', 'Membuat visualisasi yang mudah dibaca'],
      steps: [
        { type: 'read', title: 'Dari Data Mentah ke Informasi', html: `<p>Analisis data dimulai dengan pertanyaan yang jelas. Periksa kolom, satuan, nilai kosong, dan data ganda sebelum menghitung.</p><table><tr><th>Bulan</th><th>Produk</th><th>Unit terjual</th></tr><tr><td>Januari</td><td>Buku</td><td>18</td></tr><tr><td>Januari</td><td>Pena</td><td>25</td></tr><tr><td>Februari</td><td>Buku</td><td>22</td></tr><tr><td>Februari</td><td>Pena</td><td>20</td></tr></table><p>Gunakan <code>SUM</code> untuk total, <code>AVERAGE</code> untuk rata-rata, <code>COUNTIF</code> untuk menghitung data yang memenuhi kriteria, dan <code>IF</code> untuk memberi label berdasarkan kondisi.</p><div class="callout callout-tip"><span>📊</span><span>Rumus menjawab pertanyaan tertentu. Grafik membantu pembaca melihat pola. Pilih jenis grafik sesuai datanya.</span></div>` },
        { type: 'widget', widget: 'excelLab', title: 'Lab Ringkas Data Penjualan', intro: 'Filter wilayah, bandingkan total penjualan, lalu tandai langkah ini selesai.' },
        { type: 'read', title: 'Menyusun Dasbor di Power BI', html: `<ol><li><strong>Get Data</strong> — impor tabel Excel atau CSV.</li><li><strong>Transform</strong> — rapikan nama kolom, tipe data, nilai kosong, dan duplikasi di Power Query.</li><li><strong>Model</strong> — hubungkan tabel menggunakan kunci yang tepat.</li><li><strong>Visualize</strong> — pilih kartu KPI, batang untuk perbandingan, atau garis untuk tren waktu.</li><li><strong>Periksa</strong> — beri judul, satuan, sumber, dan konteks; jangan tampilkan data pribadi.</li></ol><div class="callout callout-warn"><span>🔒</span><span>Bagikan hanya data yang memang boleh dilihat penerima. Nama, nomor identitas, dan informasi sensitif tidak perlu dimasukkan ke dasbor kelas.</span></div>` },
        { type: 'check', title: 'Cek Pemahaman', q: { type: 'mc', question: 'Rumus Excel mana yang menghitung rata-rata nilai pada rentang B2 sampai B20?', options: ['=SUM(B2:B20)', '=AVERAGE(B2:B20)', '=COUNTIF(B2:B20)', '=IF(B2:B20)'], answer: 1, explain: 'AVERAGE menghitung nilai rata-rata dari rentang yang dipilih.' } },
      ],
    },
  ];

  // ════════════════════════════════════════ BANK SOAL ════════════════════════════════════════
  const OLD_QUIZ = {
    bab1: [
      { type: 'mc', question: 'Robot program yang menjelajahi web dari satu tautan ke tautan lain disebut…', options: ['Crawler / spider', 'Firewall', 'Compiler', 'Router'], answer: 0, explain: 'Crawler (spider/bot) merayapi web dengan mengikuti hyperlink untuk menemukan halaman baru.' },
      { type: 'order', question: 'Urutkan tahap kerja mesin pencari dari awal sampai hasil tampil!', items: ['Crawling (menjelajah)', 'Indexing (mengarsipkan)', 'Ranking (mengurutkan)', 'Menampilkan SERP'], explain: 'Data dikumpulkan dulu (crawling), disimpan di indeks (indexing), diurutkan (ranking), lalu ditampilkan di halaman hasil (SERP).' },
      { type: 'mc', question: 'Struktur data yang mencatat "kata kunci → daftar halaman yang memuatnya" disebut…', options: ['Linked list', 'Inverted index', 'Stack', 'Binary tree'], answer: 1, explain: 'Inverted index memetakan setiap kata ke dokumen-dokumen tempat kata itu muncul.' },
      { type: 'tf', question: 'Saat kamu menekan Enter, mesin pencari langsung membuka semua situs di internet satu per satu.', answer: false, explain: 'Salah. Pencarian dilakukan pada indeks yang sudah disiapkan sebelumnya, bukan membuka situs satu per satu.' },
      { type: 'mc', question: 'Algoritma Google yang menilai pentingnya halaman berdasarkan jumlah & kualitas tautan yang mengarah ke halaman itu adalah…', options: ['PageRank', 'QuickSort', 'Dijkstra', 'Caesar Cipher'], answer: 0, explain: 'PageRank: semakin banyak situs tepercaya yang menautkan, semakin tinggi nilainya.' },
      { type: 'mc', question: 'File yang dipakai pemilik situs untuk memberi tahu crawler halaman mana yang tidak boleh dirayapi adalah…', options: ['index.html', 'robots.txt', 'style.css', 'readme.md'], answer: 1, explain: 'robots.txt berisi aturan akses untuk bot crawler.' },
      { type: 'mc', question: 'Mesin pencari yang terkenal karena tidak melacak riwayat pencarian penggunanya adalah…', options: ['Google', 'Bing', 'DuckDuckGo', 'Yahoo'], answer: 2, explain: 'DuckDuckGo berfokus pada privasi pengguna.' },
      { type: 'tf', question: 'Hasil pencarian peringkat 1 pasti informasi yang paling benar.', answer: false, explain: 'Salah. Peringkat dipengaruhi relevansi, SEO, iklan, dan sinyal lain — tetap perlu verifikasi sumber.' },
      { type: 'mc', question: 'SERP adalah singkatan dari…', options: ['Search Engine Result Page', 'Server Error Response Protocol', 'Secure Engine Rank Program', 'Search Entry Record Page'], answer: 0, explain: 'SERP = halaman hasil pencarian yang kamu lihat setelah mencari.' },
      { type: 'mc', question: 'Saat proses indexing, kata umum seperti "yang", "dan", "di" biasanya dibuang karena…', options: ['Termasuk kata kasar', 'Terlalu sering muncul sehingga tidak membedakan dokumen (stop words)', 'Tidak bisa dibaca komputer', 'Melanggar hak cipta'], answer: 1, explain: 'Stop words muncul di hampir semua dokumen sehingga tidak membantu membedakan relevansi.' },
    ],
    bab2: [
      { type: 'build', question: 'Susun query untuk mencari PDF resmi tentang "kurikulum merdeka" hanya dari kemdikbud.go.id!', tokens: ['site:kemdikbud.go.id', '"kurikulum merdeka"', 'filetype:pdf', 'site:blogspot.com', 'filetype:mp3', 'download gratis'], answer: ['site:kemdikbud.go.id', '"kurikulum merdeka"', 'filetype:pdf'], explain: 'Kombinasi site:, frasa persis, dan filetype: menyaring hasil secara tepat.' },
      { type: 'mc', question: 'Operator untuk mengecualikan kata tertentu dari hasil pencarian adalah…', options: ['Tanda tambah (+)', 'Tanda minus (-)', 'Tanda bintang (*)', 'Tanda tanya (?)'], answer: 1, explain: 'Contoh: jaguar -mobil akan menyingkirkan hasil tentang mobil Jaguar.' },
      { type: 'mc', question: 'Fungsi tanda kutip pada query "literasi digital" adalah…', options: ['Mencari salah satu kata saja', 'Mencari frasa persis sesuai urutan', 'Mengecualikan frasa', 'Mencari gambar'], answer: 1, explain: 'Tanda kutip memaksa kata dicari sebagai frasa utuh dengan urutan yang sama.' },
      { type: 'tf', question: 'Penulisan "site: bmkg.go.id" (dengan spasi setelah titik dua) tetap bekerja dengan benar.', answer: false, explain: 'Salah. Operator harus ditulis tanpa spasi: site:bmkg.go.id.' },
      { type: 'order', question: 'Urutkan langkah metode SIFT untuk memeriksa informasi!', items: ['Stop – berhenti sejenak', 'Investigate – selidiki sumbernya', 'Find – cari liputan lain yang tepercaya', 'Trace – telusuri ke sumber asli'], explain: 'SIFT: Stop, Investigate the source, Find better coverage, Trace claims.' },
      { type: 'mc', question: 'Teknik membuka tab baru untuk mencari tahu kredibilitas sebuah situs disebut…', options: ['Membaca vertikal', 'Membaca lateral', 'Skimming', 'Clickbait'], answer: 1, explain: 'Membaca lateral = mengecek sumber dari luar situs tersebut, seperti fact-checker profesional.' },
      { type: 'mc', question: 'Triangulasi sumber berarti memverifikasi informasi dengan…', options: ['Satu sumber yang paling viral', 'Minimal 3 sumber independen yang kredibel', 'Bertanya di grup WhatsApp', 'Melihat jumlah like'], answer: 1, explain: 'Bandingkan minimal 3 sumber independen: lembaga resmi, media terverifikasi, dan pakar/jurnal.' },
      { type: 'build', question: 'Susun query: cari berita tentang "gempa bumi" dari situs BMKG tanpa kata hoaks!', tokens: ['site:bmkg.go.id', '"gempa bumi"', '-hoaks', '+hoaks', 'site:tiktok.com', 'filetype:exe'], answer: ['site:bmkg.go.id', '"gempa bumi"', '-hoaks'], explain: 'site:bmkg.go.id membatasi ke BMKG, frasa persis "gempa bumi", dan -hoaks mengecualikan kata hoaks.' },
      { type: 'mc', question: 'Query hoaks OR disinformasi akan menampilkan…', options: ['Halaman yang memuat kedua kata sekaligus saja', 'Halaman yang memuat salah satu atau kedua kata', 'Halaman tanpa kedua kata', 'Tidak ada hasil'], answer: 1, explain: 'OR berarti salah satu boleh muncul.' },
      { type: 'mc', question: 'Sumber mana yang PALING kredibel untuk mengecek info cuaca ekstrem?', options: ['Akun anonim di media sosial', 'Situs resmi BMKG (bmkg.go.id)', 'Broadcast pesan berantai', 'Komentar di video'], answer: 1, explain: 'BMKG adalah lembaga resmi yang berwenang soal cuaca, iklim, dan gempa.' },
    ],
    bab3: [
      { type: 'mc', question: 'UU ITE terbaru (perubahan kedua) adalah…', options: ['UU No. 11 Tahun 2008', 'UU No. 19 Tahun 2016', 'UU No. 1 Tahun 2024', 'UU No. 28 Tahun 2014'], answer: 2, explain: 'UU No. 1 Tahun 2024 adalah perubahan kedua atas UU ITE.' },
      { type: 'mc', question: 'Menyebarkan informasi yang menghasut kebencian berdasarkan SARA dilarang dalam…', options: ['Pasal 27', 'Pasal 28 ayat (2)', 'Pasal 30', 'Pasal 32'], answer: 1, explain: 'Pasal 28 ayat (2) UU ITE mengatur larangan ujaran kebencian berbasis SARA.' },
      { type: 'mc', question: 'Mengakses sistem elektronik atau akun milik orang lain tanpa hak diatur dalam…', options: ['Pasal 30 UU ITE', 'Pasal 27 UU ITE', 'Pasal 44 UU Hak Cipta', 'Pasal 28 ayat (1)'], answer: 0, explain: 'Pasal 30 = akses ilegal (illegal access/hacking).' },
      { type: 'tf', question: 'Nomor HP dan alamat rumah temanmu boleh disebar di media sosial asalkan untuk bercanda.', answer: false, explain: 'Salah. Itu termasuk doxing dan dapat melanggar UU PDP (mengungkapkan data pribadi orang lain tanpa hak).' },
      { type: 'mc', question: 'Data berikut yang termasuk DATA PRIBADI SPESIFIK menurut UU PDP adalah…', options: ['Nama lengkap', 'Jenis kelamin', 'Data biometrik (sidik jari)', 'Kewarganegaraan'], answer: 2, explain: 'Biometrik termasuk data spesifik bersama data kesehatan, genetika, catatan kejahatan, data anak, dan keuangan pribadi.' },
      { type: 'mc', question: 'UU Pelindungan Data Pribadi adalah…', options: ['UU No. 27 Tahun 2022', 'UU No. 11 Tahun 2008', 'UU No. 36 Tahun 1999', 'UU No. 28 Tahun 2014'], answer: 0, explain: 'UU PDP = UU No. 27 Tahun 2022, berlaku penuh Oktober 2024.' },
      { type: 'tf', question: 'Menurut UU PDP, kita berhak meminta data pribadi kita dihapus oleh pengendali data.', answer: true, explain: 'Benar. Subjek data berhak mengakhiri pemrosesan, menghapus, dan memusnahkan datanya.' },
      { type: 'mc', question: 'Seseorang membuat berita palsu "BBM gratis besok" sehingga terjadi kerusuhan antrean. Pasal yang paling relevan adalah…', options: ['Pasal 28 ayat (3) UU ITE', 'Pasal 30 UU ITE', 'Pasal 32 UU ITE', 'Pasal 43 UU Hak Cipta'], answer: 0, explain: 'Pasal 28 ayat (3) (UU 1/2024) mengatur pemberitahuan bohong yang menimbulkan kerusuhan.' },
      { type: 'mc', question: 'Mengubah atau merusak data elektronik milik orang lain tanpa hak diatur dalam…', options: ['Pasal 32 UU ITE', 'Pasal 27 UU ITE', 'Pasal 29 UU ITE', 'Pasal 28 ayat (2)'], answer: 0, explain: 'Pasal 32 melarang mengubah, merusak, memindahkan, atau membocorkan data elektronik milik orang lain.' },
      { type: 'mc', question: 'Langkah paling tepat saat menerima pesan berantai yang belum jelas kebenarannya adalah…', options: ['Langsung meneruskan ke semua grup', 'Cek ke sumber resmi / situs cek fakta sebelum membagikan', 'Menambah bumbu agar lebih menarik', 'Menghapus tanpa membaca'], answer: 1, explain: 'Verifikasi dulu (misalnya ke situs resmi atau cekfakta.com) — jangan ikut menyebarkan hoaks.' },
    ],
    bab4: [
      { type: 'mc', question: 'UU Hak Cipta yang berlaku di Indonesia adalah…', options: ['UU No. 28 Tahun 2014', 'UU No. 27 Tahun 2022', 'UU No. 11 Tahun 2008', 'UU No. 1 Tahun 2024'], answer: 0, explain: 'UU No. 28 Tahun 2014 tentang Hak Cipta.' },
      { type: 'tf', question: 'Hak cipta baru berlaku setelah karya didaftarkan ke pemerintah.', answer: false, explain: 'Salah. Hak cipta timbul otomatis (prinsip deklaratif) saat karya diwujudkan. Pendaftaran/pencatatan hanya sebagai bukti.' },
      { type: 'mc', question: 'Hak agar nama pencipta selalu dicantumkan pada karyanya disebut…', options: ['Hak ekonomi', 'Hak moral', 'Hak paten', 'Hak merek'], answer: 1, explain: 'Hak moral melekat abadi pada diri pencipta, termasuk hak atas pencantuman nama.' },
      { type: 'mc', question: 'Pada lisensi Creative Commons, kode "NC" berarti…', options: ['No Copy', 'Non-Commercial (tidak untuk komersial)', 'New Creation', 'No Credit'], answer: 1, explain: 'NC = NonCommercial, karya tidak boleh digunakan untuk tujuan komersial.' },
      { type: 'mc', question: 'Lisensi CC yang mewajibkan karya turunan dibagikan dengan lisensi yang SAMA adalah komponen…', options: ['BY', 'SA (ShareAlike)', 'ND', 'NC'], answer: 1, explain: 'SA = ShareAlike: karya turunan harus memakai lisensi yang sama.' },
      { type: 'mc', question: 'Masa perlindungan hak cipta untuk lagu atau buku adalah…', options: ['10 tahun', '25 tahun sejak terbit', 'Seumur hidup pencipta + 70 tahun', 'Selamanya'], answer: 2, explain: 'Untuk buku, lagu, dan sejenisnya: seumur hidup pencipta ditambah 70 tahun setelah meninggal.' },
      { type: 'tf', question: 'Menulis pesan di grup dengan HURUF KAPITAL SEMUA dianggap sopan dan tegas.', answer: false, explain: 'Salah. Dalam netiket, huruf kapital semua terkesan berteriak/marah.' },
      { type: 'order', question: 'Urutkan format atribusi karya Creative Commons yang benar!', items: ['Judul karya', 'Nama pencipta', 'Sumber / tautan', 'Jenis lisensi'], explain: 'Format TASL: Title – Author – Source – License.' },
      { type: 'mc', question: 'Kamu memakai paragraf dari artikel internet di tugas tanpa menyebut sumber. Ini termasuk…', options: ['Parafrase', 'Plagiarisme', 'Atribusi', 'Fair use'], answer: 1, explain: 'Mengakui tulisan orang lain sebagai milik sendiri tanpa sumber adalah plagiarisme.' },
      { type: 'mc', question: 'Lisensi yang melepaskan karya ke domain publik sehingga bebas dipakai siapa saja tanpa syarat adalah…', options: ['CC BY-ND', 'CC BY-NC-SA', 'CC0', 'All Rights Reserved'], answer: 2, explain: 'CC0 (No Rights Reserved) = pencipta melepaskan haknya sejauh diizinkan hukum.' },
    ],
  };
  const QUIZ = {
    bab1: OLD_QUIZ.bab1.concat(OLD_QUIZ.bab2),
    bab3: OLD_QUIZ.bab3.concat(OLD_QUIZ.bab4),
    bab5: [
      { type: 'mc', question: 'Rumus Excel untuk menghitung rata-rata adalah…', options: ['SUM', 'AVERAGE', 'COUNTIF', 'IF'], answer: 1, explain: 'AVERAGE menghitung rata-rata angka pada rentang.' },
      { type: 'mc', question: 'Fungsi COUNTIF digunakan untuk…', options: ['Menjumlah semua angka', 'Menghitung sel yang memenuhi kriteria', 'Mengurutkan tabel', 'Menghapus duplikasi'], answer: 1, explain: 'COUNTIF menghitung banyak sel yang memenuhi satu kriteria.' },
      { type: 'mc', question: 'Langkah yang tepat sebelum membuat grafik adalah…', options: ['Menghapus judul kolom', 'Memeriksa tipe data dan nilai kosong', 'Mengubah semua angka menjadi teks', 'Menyembunyikan sumber data'], answer: 1, explain: 'Periksa dan bersihkan data agar ringkasan dan visualisasi tidak menyesatkan.' },
      { type: 'order', question: 'Urutkan alur sederhana membuat laporan di Power BI!', items: ['Impor data', 'Bersihkan data', 'Buat model', 'Pilih visualisasi'], explain: 'Impor, transformasi, model, lalu susun visualisasi.' },
      { type: 'mc', question: 'Grafik yang paling sesuai untuk melihat perubahan penjualan dari bulan ke bulan adalah…', options: ['Grafik garis', 'Diagram lingkaran 3D', 'Tabel tanpa judul', 'Piktogram acak'], answer: 0, explain: 'Grafik garis memudahkan pembaca melihat tren sepanjang waktu.' },
      { type: 'tf', question: 'Nama dan nomor identitas siswa sebaiknya ditampilkan pada dasbor kelas yang dibagikan luas.', answer: false, explain: 'Salah. Dasbor sebaiknya hanya memuat data yang diperlukan dan tidak membuka informasi pribadi.' },
      { type: 'mc', question: 'Fitur Excel yang membantu merangkum penjualan berdasarkan wilayah dan produk adalah…', options: ['Tabel Pivot', 'WordArt', 'Mail Merge', 'Page Break'], answer: 0, explain: 'Tabel Pivot merangkum dan membandingkan data menurut kategori.' },
      { type: 'mc', question: 'Di Power BI, Power Query terutama dipakai untuk…', options: ['Menggambar ikon', 'Mengimpor dan menyiapkan data', 'Membuat kata sandi', 'Mengirim email otomatis'], answer: 1, explain: 'Power Query membantu mengambil, mengubah, dan membersihkan data.' },
      { type: 'tf', question: 'Semua data yang berhasil dihitung otomatis menjadi informasi yang benar tanpa perlu diperiksa.', answer: false, explain: 'Salah. Rumus yang tepat tetap membutuhkan data bersih dan interpretasi yang sesuai.' },
      { type: 'mc', question: 'Elemen yang membantu pembaca memahami satuan pada grafik adalah…', options: ['Judul dan label yang jelas', 'Warna sebanyak mungkin', 'Efek animasi', 'Menyembunyikan sumbu'], answer: 0, explain: 'Judul, label, dan satuan memberi konteks agar grafik mudah dibaca.' },
    ],
  };

  // Label tampilan setiap bab
  // Warna per bab — satu rona per bab (gradasi halus, bukan pelangi). Selaras token di tw-config.js.
  const COLOR = {
    blue: { from: '#2B54F0', to: '#1C3BC2', soft: 'bg-primary-subtle', text: 'text-primary', ring: 'border-blue-200' },
    violet: { from: '#6D4AFF', to: '#4B2FD6', soft: 'bg-violet-50', text: 'text-violet-600', ring: 'border-violet-200' },
    orange: { from: '#E8562A', to: '#C23D16', soft: 'bg-accent-subtle', text: 'text-accent', ring: 'border-orange-200' },
    emerald: { from: '#0E9F8E', to: '#0A7A6D', soft: 'bg-laut-subtle', text: 'text-laut', ring: 'border-emerald-200' },
  };

  window.XContent = {
    CHAPTERS,
    QUIZ,
    COLOR,
    get(id) {
      return CHAPTERS.find((c) => c.id === id || String(c.number) === String(id)) || null;
    },
  };
})();
