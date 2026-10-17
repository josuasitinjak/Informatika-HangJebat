/**
 * XAVETRA — Platform Pembelajaran Informatika Fase F
 * SMAN 1 Batam • Kelas XI HJ 5
 * Authentication & Session Management
 */

const AUTH_STORAGE_KEY = 'xavetra_user';

// Endpoint Resolver Database Google Apps Script (Di-encode agar aman dari automated web crawlers)
function getGoogleSheetEndpoint() {
  const customUrl = localStorage.getItem('xavetra_auth_url');
  if (customUrl && customUrl.trim().startsWith('https://script.google.com')) {
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
    const url = `${endpoint}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
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
    const url = `${endpoint}?action=register&username=${encodeURIComponent(username)}&name=${encodeURIComponent(name)}&password=${encodeURIComponent(password)}&kelas=${encodeURIComponent(kelas || 'XI HJ 5')}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
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
 * Sinkronisasi status autentikasi pada Navbar
 */
function syncNavbarAuth() {
  const user = getAuthUser();
  const container = document.getElementById('navbar-auth-section');
  if (!container) return;

  if (user) {
    // Pengguna sudah login: tampilkan badge profil dan tombol keluar
    const initials = user.name 
      ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
      : 'X5';

    container.innerHTML = `
      <div class="flex items-center gap-2 pl-3 pr-2 py-1 rounded-full bg-primary-subtle text-primary border border-border-focus text-xs font-semibold">
        <span class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">${initials}</span>
        <span class="max-w-[120px] truncate" title="${user.name}">${user.name.split(' ')[0]}</span>
        <button onclick="handleLogout()" title="Keluar Akun" class="ml-1 text-slate-400 hover:text-red-500 transition flex items-center">
          <span class="material-symbols-outlined text-[16px]">logout</span>
        </button>
      </div>
      <a href="dashboard.html" class="interactive-btn inline-flex items-center justify-center px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-primary hover:bg-primary-dark shadow-glow">
        Dashboard Siswa
      </a>
    `;
  } else {
    // Pengguna belum login: tampilkan 1 tombol utama Mulai Belajar yang lebih lebar
    container.innerHTML = `
      <a class="interactive-btn inline-flex items-center justify-center px-7 py-2.5 rounded-full text-sm font-bold text-white bg-primary hover:bg-primary-dark shadow-glow tracking-wide" href="login.html">
        Mulai Belajar
      </a>
    `;
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
 * Handler aksi terproteksi (Buka Materi, Kuis, Lanjutkan Belajar)
 * Jika belum login, diarahkan ke login.html dengan target dashboard.html
 */
function handleProtectedAction(targetAnchor, featureName) {
  const user = getAuthUser();
  
  if (!user) {
    window.location.href = `login.html?redirect=dashboard.html`;
    return false;
  }

  // Pengguna sudah login: arahkan langsung ke dashboard pembelajaran
  window.location.href = 'dashboard.html';
  return true;
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
