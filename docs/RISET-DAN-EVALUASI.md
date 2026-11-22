# Riset & Evaluasi Lanjutan — Website Informatika SMAN 1 Batam

Tanggal: 12 November 2026. Dokumen ini jadi pegangan untuk putaran perombakan berikutnya.

## 1. Ringkasan riset (TikTok, Instagram, web)

### Skill/plugin yang sering direkomendasikan kreator
| Nama | Sumber rekomendasi | Status keamanan | Keputusan |
|---|---|---|---|
| **frontend-design** (Anthropic) | Paling banyak dibahas; viral di X & TikTok | Resmi Anthropic, ada di direktori | ✅ Disarankan — pasang lewat kartu katalog |
| **Design** (Anthropic) — critique, design system, UX copy, a11y | Direktori resmi | Resmi Anthropic | ✅ Disarankan — pasang lewat kartu katalog |
| **VectorLab UI/UX** — motion, transitions, empty states, anti-slop | Direktori resmi (direview) | Komunitas, direview direktori | ✅ Disarankan — pasang lewat kartu katalog |
| **Claude Education Skills Library** — 165 skill pedagogi | Direktori resmi (direview) | Komunitas, direview direktori | ✅ Disarankan — pasang lewat kartu katalog |
| **Playwright** (Microsoft) — uji otomatis browser | Direktori resmi | Partner | ✅ Disarankan — pasang lewat kartu katalog |
| **Axe Accessibility** (Deque) — audit WCAG | Direktori resmi | Partner | ✅ Disarankan — pasang lewat kartu katalog |
| **Skills For Real React/RN Engineers** — `css-animations`, `gsap-timelines`, `gsap-scroll-trigger`, `gsap-text`, `ui-motion`, `ui-interactions`, `unslop`, agen `animation-specialist` | Direktori resmi (direview) | Komunitas, akses "privileged" | ✅ Disarankan — pasang lewat kartu katalog |
| **Spline MCP** — scene 3D & desain 2D interaktif | Sudah tersambung di sesi ini | Konektor | ✅ Siap dipakai (mis. hero 3D maskot / visual crawler) |
| **Figma / Subframe / Moda MCP** — referensi desain, kanvas UI, motion graphic promo | Registri MCP | Konektor resmi | ⚙️ Opsional — sambungkan lewat kartu konektor bila punya akun |
| Impeccable, Taste Skill, Emil Kowalski motion, UI/UX Pro Max | Video TikTok kreator | Repo GitHub pihak ketiga, **belum direview** | ⛔ Tidak diunduh otomatis (lihat §4) — prinsipnya diterapkan manual |

### Pola desain yang konsisten muncul
- Alur kerja kreator: screenshot situs referensi → `CLAUDE.md` berisi standar "senior UI designer" → library komponen → gradien kustom → animasi & hover → elemen 3D → 2 Google Fonts (judul + isi) → iterasi dengan screenshot.
- Aplikasi belajar 2026: UI minimal & bersih **dengan** microinteraction halus (bukan animasi berat di mana-mana), streak/level/poin/liga, umpan balik instan, jalur skill personal (Duolingo sebagai acuan), tantangan adaptif, dark mode & aksesibilitas sebagai standar.

## 2. Evaluasi jujur kondisi saat ini

### Sudah baik
Kurikulum 4 bab + 11 widget, Kuis Arena (4 tipe soal, combo, nyawa, timer), simulator dengan 8 misi, XP/level/streak/lencana, dashboard, rekap nilai guru (butuh Apps Script v2), bug & celah keamanan utama sudah ditutup.

### Masih kurang (prioritas)
| # | Masalah | Dampak |
|---|---|---|
| ✅ v2 | ~~Catatan, Login, Register desain lama~~ → sudah dibuat ulang | — |
| ✅ v2 | ~~Tugas, Tanya AI, Komunitas gaya lama~~ → Tugas dibuat ulang (kartu misi, pemilih kategori, rubrik animasi); Tanya AI & Komunitas memakai tampilan & token warna baru + maskot | — |
| ✅ v2 | ~~Navigasi bawah HP~~ → navigasi bawah 5 tab di layar < 1024px | — |
| ✅ v2 | ~~Onboarding~~ → 3 langkah dengan maskot + pilihan target harian (20/50/100 XP) | — |
| ✅ v2 | ~~Ulangi soal salah~~ → mode "Ulangi Kesalahan" di Kuis Arena | — |
| P1 | Kuis: **papan peringkat kelas** & petunjuk bertahap | Motivasi sosial |
| ✅ v2 | ~~Dark mode~~ → tombol Gelap/Terang di sidebar, ikut tema sistem | — |
| P2 | Belum **PWA** (bisa di-install di HP, ikon, offline) | Tidak terasa seperti aplikasi |
| ✅ v2 | ~~Transisi halaman~~ → View Transitions API + scrollytelling GSAP di beranda | — |
| P2 | Maskot hanya SVG statis + CSS; belum ada **ekspresi/animasi beruntun** (mis. Lottie/rive) | "Wow factor" terbatas |
| P2 | Komunitas masih **lokal per perangkat**; Tanya AI memakai **API key di klien** | Fungsi & keamanan |
| P3 | Tailwind via CDN (peringatan di konsol, lebih lambat) | Performa |
| P3 | Belum ada **uji otomatis** (Playwright) & audit aksesibilitas (axe) | Regresi tidak terdeteksi |
| P3 | Konten: 40 soal (10/bab), belum ada video, glosarium, atau sertifikat tuntas | Kedalaman materi |

## 3. Rencana implementasi putaran berikutnya
1. **Design system v2** (skill `frontend-design` + `Design:design-system`): token warna/tipografi, dark mode, komponen tombol/kartu/input seragam.
2. **Rombak halaman lama** (Catatan, Tugas, Tanya AI, Komunitas, Login, Register) memakai shell & komponen baru.
3. **Pengalaman app di HP**: bottom navigation, onboarding 3 langkah dengan maskot, View Transitions.
4. **Kuis v2** (skill Education Skills Library): mode "Ulangi yang Salah", petunjuk bertahap, liga/peringkat kelas (via Apps Script), sertifikat tuntas bab (bisa diunduh).
5. **Motion v2** (VectorLab `motion`/`transitions`/`reduced-motion`): animasi maskot lebih ekspresif, celebration screen, skeleton loader.
6. **PWA**: `manifest.json`, service worker, ikon, mode offline untuk materi.
7. **Keamanan**: proxy Groq lewat Apps Script (key di Script Properties), komunitas tersinkron via Apps Script.
8. **QA**: tes Playwright untuk alur login → modul → kuis; audit axe; cek mobile 375px.

## 4. Catatan keamanan pemasangan skill
Skill pihak ketiga dari video TikTok/Instagram (Impeccable, Taste Skill, UI/UX Pro Max, dll.) berasal dari repo GitHub yang belum direview. Agar aman, Claude tidak mengunduh/menjalankannya otomatis. Jika ingin memakainya, periksa repo-nya sendiri lalu pasang dengan perintah `/plugin` di terminal Claude Code; setelah itu Claude bisa langsung memakainya.

## 5. Checklist QA
```bash
node -e "const fs=require('fs');for(const f of fs.readdirSync('.').filter(f=>f.endsWith('.html'))){const s=fs.readFileSync(f,'utf8');for(const m of s.matchAll(/<script>([\s\S]*?)<\/script>/g)){try{new Function(m[1])}catch(e){console.log('ERR',f,e.message)}}}for(const f of fs.readdirSync('assets/js')){try{new Function(fs.readFileSync('assets/js/'+f,'utf8'))}catch(e){console.log('ERR',f,e.message)}}console.log('selesai')"
```
- [ ] Semua halaman terbuka tanpa error konsol (desktop & 375px)
- [ ] Login → Dashboard → Modul (selesaikan 1 bab) → Kuis → hasil tersimpan
- [ ] Simulator: 8 misi bisa diselesaikan
- [ ] Akun Guru: rekap nilai & tambah materi tersinkron (Apps Script v2)
- [ ] `prefers-reduced-motion` mematikan animasi besar

## Sumber riset
- [14 Best Claude Code Skills for Developers in 2026 — Firecrawl](https://www.firecrawl.dev/blog/best-claude-code-skills)
- [The 20 Best Claude Code Skills for UI/UX Design](https://pasqualepillitteri.it/en/news/576/claude-code-skills-design-uiux-guide)
- [10 Claude Code Frontend Design Skills for 2026 — Chase AI](https://chaseai.io/blog/claude-code-frontend-design-skills)
- [Claude Code design skills: the 8 worth installing — Duply](https://duply.ai/blog/claude-code-design-skills)
- [5 Claude Code animation skills — The AI Leverage](https://theaileverage.beehiiv.com/p/5-claude-code-animation-skills-that-make-your-ui-look-like-it-had-a-50k-motion-team)
- [TikTok @jonocatliff — alur 8 langkah website dengan Claude Code](https://www.tiktok.com/@jonocatliff/video/7624902183384927506)
- [TikTok @chase_ai_ — 3 GitHub repos untuk frontend design](https://www.tiktok.com/@chase_ai_/video/7625388860536605966)
- [TikTok Discover — Claude Code UI design skill](https://www.tiktok.com/discover/claude-code-ui-design-skill)
- [Education App Design Trends 2026 — Gapsy Studio](https://gapsystudio.com/blog/education-app-design)
- [9 Gamification Trends Shaping Engagement in 2026 — Scavify](https://www.scavify.com/gamification/9-gamification-trends-shaping-engagement-in-2026)
- [Top Education App Design Trends — Lollypop](https://lollypop.design/blog/2025/august/top-education-app-design-trends-2025/?p=19532)
