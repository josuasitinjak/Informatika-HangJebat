/* Konfigurasi Tailwind bersama — satu sumber token desain "HangJebat" untuk semua halaman.
 * Dimuat SETELAH CDN Tailwind. Nilai lama (navy, canvas, primary, …) tetap ada agar halaman
 * lama otomatis ikut palet baru. Rujukan lengkap: docs/DESIGN-SYSTEM.md
 *
 * Jika halaman sudah punya konfigurasi sendiri, nilai yang belum ada akan dilengkapi
 * (nilai milik halaman tetap dipertahankan). */
(function () {
  var base = {
    colors: {
      // Inti tema "Momentum"
      ink: '#0A0E1C',
      'ink-2': '#11162A',
      night: '#05070F',        // latar gelap utama
      paper: '#F4F5F8',        // seksi terang
      surface: '#FFFFFF',
      line: '#E6E8EF',
      primary: '#2340FF',      // biru listrik
      'primary-dark': '#1528C9',
      'primary-subtle': '#E8ECFF',
      electric: '#5B74FF',
      gold: '#FFC94D',
      'gold-subtle': '#FFF6DD',
      accent: '#FF6B3D',
      'accent-subtle': '#FFEEE7',
      laut: '#14B8A6',
      'laut-subtle': '#E0F7F4',
      // Alias lama (kompatibel dengan halaman yang sudah ada)
      navy: '#0A0E1C',
      'on-surface': '#0A0E1C',
      'text-main': '#151A2C',
      'text-muted': '#5B6275',
      canvas: '#F4F5F8',
      'border-light': '#E6E8EF',
      'border-focus': '#B9C4FF',
    },
    fontFamily: {
      sans: ["'Urbanist'", "'Plus Jakarta Sans'", 'system-ui', 'sans-serif'],
      display: ["'Urbanist'", 'sans-serif'],
      mono: ["'JetBrains Mono'", 'ui-monospace', 'monospace'],
    },
    borderRadius: { card: '22px' },
    boxShadow: {
      card: '0 1px 0 rgba(10,14,28,.04), 0 10px 30px -14px rgba(10,14,28,.18)',
      'card-hover': '0 24px 50px -24px rgba(35,64,255,.55)',
      glow: '0 12px 34px -8px rgba(35,64,255,.7)',
      float: '0 20px 50px -16px rgba(0,0,0,.5)',
      xs: '0 1px 2px rgba(10,14,28,.06)',
    },
  };
  window.tailwind = window.tailwind || {};
  var cfg = window.tailwind.config || {};
  cfg.theme = cfg.theme || {};
  var ext = (cfg.theme.extend = cfg.theme.extend || {});
  Object.keys(base).forEach(function (k) {
    ext[k] = Object.assign({}, base[k], ext[k] || {});
  });
  window.tailwind.config = cfg;

  var root = document.documentElement;
  // Tema: halaman aplikasi memakai tema gelap "Momentum" secara bawaan; pengguna bisa memilih
  // tema terang lewat tombol di sidebar (disimpan di xavetra_theme). Halaman dengan atribut
  // data-theme-fixed (mis. beranda) mengatur tampilannya sendiri.
  try {
    if (!root.hasAttribute('data-theme-fixed') && localStorage.getItem('xavetra_theme') !== 'light') root.classList.add('dark');
  } catch (e) { if (!root.hasAttribute('data-theme-fixed')) root.classList.add('dark'); }

  // Tandai bahwa animasi Motion akan berjalan → elemen [data-m] boleh disembunyikan dulu.
  // Tidak aktif bila pengguna memilih "kurangi gerakan".
  try {
    if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      root.classList.add('hj-motion');
      // Pengaman: bila Motion gagal dimuat, tampilkan semua konten setelah 2,5 detik.
      setTimeout(function () { if (!window.HJMotion) root.classList.remove('hj-motion'); }, 2500);
    }
  } catch (e) {}
})();
