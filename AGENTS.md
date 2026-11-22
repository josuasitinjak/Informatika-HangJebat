# Website Pembelajaran Informatika — SMAN 1 Batam (XI HJ 5)

Media belajar Informatika Fase F (Kurikulum Merdeka) untuk siswa & guru. Situs statis (HTML + Tailwind CDN + JS vanilla), tanpa build step. Bahasa UI: Indonesia, gaya Gen Z yang tetap sopan.

## Menjalankan
- Lokal: `python -m http.server 5510` di root (konfigurasi pratinjau ada di `.Codex/launch.json`, nama `web`).
- Juga harus tetap jalan bila dibuka lewat `file://`.

## Arsitektur
- `assets/js/core.js` — fondasi semua halaman: `window.X` (escape HTML, redirect aman, progres per akun: XP/level/streak/lencana, efek suara Web Audio, confetti, toast, scroll-reveal, maskot SVG "Xavi", sidebar terpadu, jembatan cloud Apps Script). Sidebar setiap halaman dirender ulang dari `NAV` di file ini — tambah menu di sana, bukan di HTML.
- `assets/js/content.js` — `window.XContent`: 4 bab bawaan (langkah `read` / `widget` / `check`) + bank soal `QUIZ` (tipe `mc`, `tf`, `order`, `build`).
- `assets/js/lessons.js` — `window.XLessons`: 11 widget interaktif (`mount(nama, el, {onDone})`), dataset mesin pencari mini `DOCS`, `parseQuery`/`search` operator pencarian.
- `assets/js/auth.js` — login/register ke Google Apps Script (POST `text/plain`), sesi di `localStorage['xavetra_user']`.
- `assets/js/gemini.js` — Tanya AI (Groq) + parser markdown visual (`formatMarkdown` meng-escape HTML).
- `assets/js/tw-config.js` — token Tailwind bersama (dimuat setelah CDN Tailwind).
- `assets/css/style.css` — sistem animasi (reveal, pop, shake, confetti, maskot, marquee) + `prefers-reduced-motion`.
- `google_sheets_auth_script.example.gs` — Apps Script v2 (token sesi, hash kata sandi, `saveScore`, `listScores`, `listChapters`, `saveChapters`). Versi deploy pribadi `google_sheets_auth_script.gs` di-gitignore.

## Kunci localStorage
`xavetra_user`, `xavetra_progress_v2::<username>`, `xavetra_student_notes` (`{id, chapter, chapterId?, title, body, date}`), `xavetra_custom_chapters`, `xavetra_community_posts`, `xavetra_sound`, `xavetra_focus_sessions`.

## Aturan wajib
- Selalu escape data pengguna/AI sebelum `innerHTML` (`X.esc`). Jangan taruh teks bebas di atribut `onclick`; pakai `data-*` atau map JS.
- Redirect hanya lewat `X.safeRedirect` / `safeAuthRedirect`.
- Peran Guru hanya dari kolom Role di Google Sheet — jangan pernah membuat kredensial admin di kode klien.
- Jangan menampilkan angka/statistik palsu; data harus nyata atau diberi label "contoh".
- **Tanpa logo** di samping merek "Informatika / SMAN 1 BATAM" — teks saja.
- Gaya: tombol "chunky" (border-b-4), maskot bereaksi, umpan balik instan + XP; hormati `prefers-reduced-motion`.
- Konten hukum (UU ITE No. 1/2024, UU PDP No. 27/2022, UU Hak Cipta No. 28/2014) harus akurat; cek ulang bila mengubah.

## Pengujian
- Cek sintaks semua skrip: lihat perintah node di `docs/RISET-DAN-EVALUASI.md` (bagian Checklist QA).
- Uji manual di browser pratinjau: desktop + mobile 375px, konsol tanpa error.
