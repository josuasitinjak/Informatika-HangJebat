# Design System "Momentum" — Informatika SMAN 1 Batam

Fase 1 (UI/UX). Arah visual mengikuti referensi GetLayers "Stride" yang dipilih pemilik proyek
(rekaman layar 22 Nov 2026), diadaptasi untuk konten Informatika kelas XI. Tidak ada nama, logo,
atau aset Stride yang dipakai.

## 1. Ringkasan audit

| | Versi GitHub (`HEAD`, Antigravity/Gemini) | Versi lokal sebelumnya (Claude, 13 Nov) |
|---|---|---|
| Kelebihan | Rapi, terang, mudah dibaca | Arsitektur JS kuat: `core.js` (XP, streak, lencana, sidebar terpadu), `content.js` (3 bab + 50 soal), `lessons.js` (12 widget), editor materi guru, rekap nilai |
| Kekurangan | Generik (hero teks + kartu), minim interaksi | Mode gelap otomatis mengikuti OS padahal gayanya belum lengkap → teks hilang di beranda; Motion dimuat tapi tidak dipakai; animasi CSS lambat (600 ms+); gaya "chunky" terlalu kekanak-kanakan untuk SMA; `index.html` sempat tertimpa template "Flowstate" |
| Keputusan | Tidak dipakai sebagai basis kode | **Logika JS dipertahankan utuh**; lapisan visual diganti |

Halaman HTML lama yang tidak ditautkan telah dibersihkan. Folder skill dan aset konsep dipertahankan karena menjadi bahan kerja proyek.

## 2. Token

| Token | Nilai | Pakai untuk |
|---|---|---|
| `--hj-bg` / `night` | `#05070F` | latar gelap utama |
| `--hj-bg-2` | `#0A0E1C` | panel gelap |
| `--hj-blue` / `primary` | `#2340FF` | cahaya biru, aksen, tombol biru |
| `--hj-blue-2` / `electric` | `#5B74FF` | fokus, gradasi |
| `--hj-paper` / `paper` | `#F4F5F8` | seksi terang di beranda |
| `--hj-text` | `#EEF1FA` | teks di latar gelap |
| `--hj-muted` | `#8C94AB` | teks sekunder di latar gelap |
| `--hj-line` | `rgba(255,255,255,.09)` | garis/border di latar gelap |

Tipografi: **Urbanist** (judul 300 tipis, isi 400–600) + **JetBrains Mono** (kode, angka teknis).
Judul besar memakai `.hj-display` (tracking −0.03em, line-height 1.02) dan pola dua nada:
bagian pertama putih, bagian kedua redup (`.hj-dim`).

Radius: 14 px (kontrol), 22 px (kartu), 28 px (bingkai hero). Tombol selalu **pil** (`999px`).

## 3. Komponen (`assets/css/hj.css`)

- Tombol: `.hj-btn` (putih), `--blue`, `--ghost`, `--dark`, `--sm`, `--lg`; tautan `.hj-link` (garis bawah memanjang saat hover).
- Permukaan: `.hj-glass` (kaca buram), `.hj-panel`, `.hj-card-light`, `.hj-lift` (naik + cahaya biru saat hover).
- Latar: `.hj-glow-bg` (cahaya biru bergerak pelan), `.hj-star` (ledakan cahaya CSS ringan), `.hj-chrome` (teks logam berkilau).
- Label: `.hj-eyebrow`, `.hj-chip` (`--blue`, `--good`, `--gold`).
- Form: `.hj-field` + `.hj-field__box` (input bergaris bawah seperti referensi).
- Shell aplikasi: `.hj-nav-link` (sidebar dari `core.js`), `.hj-topbar`.

## 4. Tema

- **Beranda** (`<html data-theme-fixed>`): seksi gelap & terang bergantian, tidak terpengaruh tombol tema.
- **Halaman aplikasi**: gelap secara bawaan. Blok `html.dark` di `style.css` memetakan kelas Tailwind
  terang lama (`bg-white`, `text-navy`, `border-slate-200`, …) ke palet gelap, sehingga semua halaman
  konsisten tanpa menulis ulang markup. Tombol "Terang" di sidebar tetap tersedia (`xavetra_theme = 'light'`).
- Catatan: di halaman bertema gelap, `bg-white` otomatis jadi gelap. Untuk putih sungguhan pakai `bg-[#fff]`.

## 5. Gerak (Motion)

Motion 12 (`motion@12.23.12`, build UMD → `window.Motion`) dimuat di semua halaman, lalu
`assets/js/motion-ui.js` menyediakan atribut deklaratif:

| Atribut | Efek |
|---|---|
| `data-m="up/fade/scale/left/right"` | muncul sekali saat masuk layar |
| `data-m-stagger` | anak-anaknya muncul bergiliran |
| `data-m-count="40"` | angka dihitung naik |
| `data-m-page` | halaman masuk halus, keluar halus saat pindah halaman lokal |

Prinsip: hanya `transform` + `opacity` (plus blur pada judul hero); 0,3–0,6 dtk untuk UI, pegas
untuk interaksi (kartu 3D, konverter, drawer); animasi berhenti saat di luar layar.
`prefers-reduced-motion` mematikan semuanya dan konten tampil statis. Bila Motion gagal dimuat,
`tw-config.js` membuka kembali konten setelah 2,5 dtk.

### Maskot 3D "Jebat" (`assets/js/robot.js`)

Model Three.js (`three@0.149.0` UMD) prosedural, mengikuti Character Model Sheet pemilik:
- **Kepala**: helm putih hasil putaran profil superelips (sisi tegak, kubah atas, bawah lebih datar; bulat dari atas, kedalaman 86% lebar) + panel melingkar di atas.
- **Layar 3 lapis**: bingkai abu-abu kebiruan → bezel hitam tebal → kaca gelap melengkung & menjorok; wajah digambar di tekstur kanvas (ekspresi: ∩∩, wink, ●●, sad, ^^, think, tutup mata, mengintip).
- **Leher** mekanis metalik; **jas navy** 3D bertebal dengan bukaan V, lapel, tepi; kemeja putih, kerah 2 bagian, **dasi merah 3D bergaris emas**; mangkuk bawah + senyum LED + **thruster cincin cyan**.
- **Tangan** kapsul putih + cincin cyan + sambungan mekanis gelap yang mengarah ke badan.
- Warna hex diperlakukan sebagai sRGB (`ColorManagement.legacyMode = false`).
- Interaksi: kepala/mata ikut kursor, melayang, kedip, tangan berayun alami; `controls: true` → seret putar 360°, roda/cubit zoom, klik ganda reset (kembali menghadap depan setelah diam).
- API: `HJRobot.mount(el, { size, bubble, mood, lines, controls, view })` → `setMood`, `say`, `lookAt`, `celebrate`, `shake`, `setView(yaw, pitch)`.
- Evaluasi multi sudut: `docs/konsep/maskot-3d-sudut.html` (render ke `maskot-3d-sudut.png`).
- Tanpa WebGL → cadangan 2D `robot-svg.js`.

### Cahaya kursor (`assets/js/cursor-glow.js`)

Cahaya biru lembut mengikuti kursor di semua halaman, plus "spotlight" pada kartu/panel/tombol: permukaan
dan tepinya menyala di titik kursor. Tambahkan `data-spot` untuk menyalakan, `data-spot="off"` untuk mematikan.
Nonaktif di perangkat sentuh dan saat "kurangi gerakan".

## 6. Beranda — padanan referensi

| Referensi | Versi Informatika |
|---|---|
| Latar hero | **Gradient ASCII** dari React Bits (MIT), di-port ke JS biasa di `assets/js/gradient-ascii.js` (`GradientASCII.mount(el, opsi)`), bentuk `horizon`, warna bawaan. Karakter teracak di bawah kursor, gelombang saat klik. Tanpa WebGL2 → latar CSS cadangan. Isi hero diletakkan di bagian bawah yang gelap agar teks putih terbaca. (Menggantikan filamen cahaya, 22 Nov 2026.) |
| Statistik 4.9 / 30k / 15k | 3 bab · 12 aktivitas · 50 soal — dihitung dari `content.js` |
| Marquee logo + kalimat muncul kata per kata | Marquee topik + kalimat yang menajam mengikuti scroll |
| Bento kartu foto/angka | Kartu pelajar logam 3D (tilt + kilau pelangi, data akun nyata), konverter DEC/BIN/HEX dengan angka pegas |
| "Thoughtful engineering" + tab | "Dirancang teliti di setiap langkah" + tab Baca/Coba/Cek/Catat dengan demo hidup |
| Portofolio kartu bertumpuk | Peta Materi semester 1 (Mesin Pencari · Hukum Digital · Analisis Data) sebagai kartu bertumpuk sticky, masing-masing berisi **video demo** animasi (`assets/js/demo-videos.js` + `demo-videos.css`): antarmuka realistis 960×540 (mesin pencari, media sosial, spreadsheet + dasbor) yang dimainkan kursor virtual dengan caption langkah. Diputar hanya saat terlihat; "kurangi gerakan" → keadaan akhir statis. |
| Rantai krom 3D | Maskot 3D Jebat (pose berpikir) di seksi hukum/etika — Three.js dimuat saat seksi mendekat; menoleh ke kartu UU yang disorot |
| Hati krom + "Have questions?" | `?` krom + "Ada pertanyaan? Tanya Jebat." |
| Drawer registrasi | Drawer "Mulai belajar" (3 langkah / lanjut belajar bila sudah masuk) |
| Tombol suara melayang | Tombol efek suara situs (`X.sfx`) |

## 7. Langkah berikutnya (belum dikerjakan)

- Merombak isi halaman Modul (ruang belajar), Kuis, Simulator, Catatan, Tugas, Tanya AI
  dengan komponen `hj-*` — saat ini halaman tersebut sudah memakai tema & shell baru lewat pemetaan
  `html.dark`, tetapi markup dalamnya masih gaya lama (judul tebal, tombol `border-b-4`).
- Mode terang untuk halaman aplikasi perlu ditinjau ulang setelah markup diperbarui.
