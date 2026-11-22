/**
 * XAVETRA — Platform Pembelajaran Informatika Fase F
 * SMAN 1 Batam • Kelas XI HJ 5
 * Authentication & Session Management
 */

const AUTH_STORAGE_KEY = 'xavetra_user';

// Endpoint Resolver Database Google Apps Script (Di-encode agar aman dari automated web crawlers)
function getGoogleSheetEndpoint() {
  const customUrl = localStorage.getItem('xavetra_auth_url');
  if (customUrl && /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(customUrl.trim())) {
    return customUrl.trim();
  }
  try {
    const c1 = "aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mv";
    const c2 = "cy9BS2Z5Y2J3UjhmNmVvSU5LX2RpNVExTFhOODhmY010ME51";
    const c3 = "QjJzNTZUdkVjdzl6M29yd3Ruc2Z4RGZobU5sWFBLM25IR0Y2blZTUS9leGVj";
    return atob(c1 + c2 + c3);
  } catch (e) {
    return "";
  }
}

/**
 * Autentikasi Login melalui Google Sheets
 */
async function loginViaGoogleSheets(username, password) {
  const endpoint = getGoogleSheetEndpoint();
  if (!endpoint) {
    return {
      success: true,
      isLocal: true,
      message: 'Mode lokal aktif.'
    };
  }

  try {
    // POST text/plain: kata sandi tidak tercatat di URL/riwayat & tanpa preflight CORS
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'login', username, password })
    });

    if (!response.ok) {
      throw new Error(`Server status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Gagal menghubungi Google Sheets API:', error);
    return {
      success: false,
      message: 'Gagal terhubung ke database Google Sheets. Periksa koneksi internet atau URL Deployment.'
    };
  }
}

/**
 * Registrasi Siswa Baru melalui Google Sheets
 */
async function registerViaGoogleSheets(username, name, password, kelas) {
  const endpoint = getGoogleSheetEndpoint();
  if (!endpoint) {
    return {
      success: true,
      isLocal: true,
      message: 'Mode lokal aktif.'
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'register', username, name, password, kelas: kelas || 'XI HJ 5' })
    });

    if (!response.ok) {
      throw new Error(`Server status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Gagal mendaftar ke Google Sheets API:', error);
    return {
      success: false,
      message: 'Gagal terhubung ke database Google Sheets saat registrasi.'
    };
  }
}

/**
 * Mendapatkan data pengguna yang sedang login dari localStorage
 */
function getAuthUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Gagal membaca data sesi:', error);
    return null;
  }
}

/**
 * Menyimpan data pengguna ke localStorage
 */
function saveAuthUser(userData) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Gagal menyimpan sesi pengguna:', error);
    return false;
  }
}

/**
 * Menghapus sesi pengguna (Logout)
 */
function removeAuthUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Mengecek apakah pengguna saat ini sudah login
 */
function isAuthenticated() {
  return getAuthUser() !== null;
}

/**
 * Escape HTML sederhana (dipakai sebelum menyisipkan data pengguna ke DOM)
 */
function authEscape(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
}

/**
 * Redirect aman: hanya halaman .html lokal yang diizinkan
 */
function safeAuthRedirect(target, fallback) {
  const fb = fallback || 'dashboard.html';
  if (!target || typeof target !== 'string') return fb;
  return /^[a-z0-9_-]+\.html(\?[a-z0-9_=&%.-]*)?$/i.test(target.trim()) ? target.trim() : fb;
}

/**
 * Sinkronisasi status autentikasi pada Navbar (landing page)
 */
function syncNavbarAuth() {
  const user = getAuthUser();
  const container = document.getElementById('navbar-auth-section');
  if (!container) return;

  if (user) {
    const name = String(user.name || 'Siswa');
    const initials = name.split(/\s+/).map((n) => n[0] || '').join('').substring(0, 2).toUpperCase() || 'XI';
    container.innerHTML = `
      <a href="dashboard.html" class="inline-flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-2xl bg-white border-2 border-slate-200 text-xs font-extrabold text-navy hover:border-primary transition">
        <span class="w-7 h-7 rounded-xl bg-brand-gradient text-white flex items-center justify-center text-[10px] font-black">${authEscape(initials)}</span>
        <span class="max-w-[110px] truncate">${authEscape(name.split(/\s+/)[0])}</span>
        <span class="material-symbols-outlined text-[16px] text-primary">arrow_forward</span>
      </a>`;
  } else {
    container.innerHTML = `
      <a class="hidden sm:inline-flex items-center px-4 py-2.5 rounded-2xl text-sm font-bold text-navy hover:bg-white/70 transition" href="register.html">Daftar</a>
      <a class="inline-flex items-center px-5 py-2.5 rounded-2xl text-sm font-black text-white bg-primary border-b-4 border-primary-dark active:translate-y-0.5 active:border-b-2 transition" href="login.html">Masuk</a>`;
  }
}

/**
 * Handler tombol Logout
 */
function handleLogout() {
  if (confirm('Apakah Anda yakin ingin keluar dari akun?')) {
    removeAuthUser();
    window.location.href = 'login.html';
  }
}

/**
 * Handler aksi terproteksi: arahkan ke dashboard atau login
 */
function handleProtectedAction() {
  window.location.href = getAuthUser() ? 'dashboard.html' : 'login.html?redirect=dashboard.html';
  return !!getAuthUser();
}

/**
 * Helper untuk tombol tampilkan/sembunyikan kata sandi
 */
function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input || !icon) return;

  if (input.type === 'password') {
    input.type = 'text';
    icon.innerHTML = `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
    `;
  } else {
    input.type = 'password';
    icon.innerHTML = `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
    `;
  }
}
