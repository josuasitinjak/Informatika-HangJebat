/**
 * GOOGLE APPS SCRIPT v2 — DATABASE PLATFORM INFORMATIKA SMAN 1 BATAM (TEMPLATE)
 *
 * Fitur:
 *  - login / register (kata sandi disimpan sebagai hash SHA-256 + salt;
 *    akun lama berkata sandi polos otomatis di-upgrade saat login berhasil)
 *  - token sesi (sheet "Sesi") untuk aksi yang butuh identitas
 *  - saveScore  : siswa mengirim nilai kuis      (butuh token)
 *  - listScores : guru melihat rekap nilai kelas (butuh token role Guru/Admin)
 *  - listChapters / saveChapters : materi tambahan guru dibagikan ke semua siswa
 *
 * PANDUAN DEPLOYMENT / UPDATE:
 * 1. Buka Google Spreadsheet database (sheet pertama = data akun).
 *    Baris 1 header: A Timestamp | B Username | C Nama_Lengkap | D Password | E Role | F Kelas
 * 2. Ekstensi > Apps Script. Ganti seluruh kode dengan isi file ini, lalu Simpan.
 * 3. Deploy > Manage deployments > (ikon pensil) Edit > Version: "New version" > Deploy.
 *    (Dengan cara ini URL Web App TIDAK berubah, jadi website tidak perlu diubah.)
 * 4. Untuk akun guru: isi kolom E (Role) dengan "Guru". Akun yang mendaftar dari website
 *    selalu berperan "Siswa" — peran Guru hanya bisa diberikan lewat Sheet ini.
 * 5. Sheet "Sesi", "Nilai", dan "Materi" dibuat otomatis saat pertama dipakai.
 */

var SESSION_DAYS = 30;

function doGet(e) {
  return handleRequest((e && e.parameter) || {});
}

function doPost(e) {
  var params = {};
  try {
    params = JSON.parse(e.postData.contents);
  } catch (err) {
    params = (e && e.parameter) || {};
  }
  return handleRequest(params);
}

function handleRequest(p) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return json({ success: false, message: 'Server sibuk, coba lagi sebentar.' });
  }
  try {
    switch (p.action) {
      case 'login': return json(login(p));
      case 'register': return json(register(p));
      case 'saveScore': return json(saveScore(p));
      case 'listScores': return json(listScores(p));
      case 'listChapters': return json(listChapters());
      case 'saveChapters': return json(saveChapters(p));
      default: return json({ success: false, message: 'Aksi tidak valid' });
    }
  } catch (err) {
    return json({ success: false, message: 'Terjadi kesalahan server: ' + err.message });
  } finally {
    lock.releaseLock();
  }
}

// ───────────────────────── Akun ─────────────────────────
function usersSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

function hashPassword(password, salt) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + '::' + password, Utilities.Charset.UTF_8);
  return 'sha256$' + salt + '$' + Utilities.base64Encode(bytes);
}

function checkPassword(stored, password) {
  stored = String(stored || '');
  if (stored.indexOf('sha256$') === 0) {
    var salt = stored.split('$')[1];
    return hashPassword(password, salt) === stored;
  }
  return stored.trim() === String(password).trim(); // akun lama (teks polos)
}

function cleanText(v, max) {
  return String(v || '').replace(/[<>]/g, '').trim().substring(0, max || 100);
}

function login(p) {
  var username = cleanText(p.username, 40).toLowerCase();
  var password = String(p.password || '');
  if (!username || !password) return { success: false, message: 'Username dan kata sandi wajib diisi.' };

  var sheet = usersSheet();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var rowUser = String(data[i][1] || '').trim().toLowerCase();
    var rowName = String(data[i][2] || '').trim().toLowerCase();
    if ((rowUser === username || rowName === username) && checkPassword(data[i][3], password)) {
      // Upgrade kata sandi polos → hash
      if (String(data[i][3]).indexOf('sha256$') !== 0) {
        sheet.getRange(i + 1, 4).setValue(hashPassword(password, Utilities.getUuid()));
      }
      var user = {
        username: String(data[i][1]),
        name: String(data[i][2] || data[i][1]),
        role: String(data[i][4] || 'Siswa'),
        kelas: String(data[i][5] || 'XI HJ 5'),
        school: 'SMAN 1 Batam',
        loginTime: new Date().toISOString()
      };
      user.token = createSession(user);
      return { success: true, message: 'Berhasil masuk!', user: user };
    }
  }
  return { success: false, message: 'Username atau kata sandi tidak cocok.' };
}

function register(p) {
  var username = cleanText(p.username, 30).toLowerCase().replace(/\s+/g, '_');
  var name = cleanText(p.name, 60);
  var kelas = cleanText(p.kelas || 'XI HJ 5', 20);
  var password = String(p.password || '');
  if (!/^[a-z0-9_.]{3,30}$/.test(username)) return { success: false, message: 'Username 3–30 karakter: huruf kecil, angka, titik, atau garis bawah.' };
  if (!name || password.length < 6) return { success: false, message: 'Data pendaftaran tidak lengkap (kata sandi minimal 6 karakter).' };

  var sheet = usersSheet();
  var data = sheet.getDataRange().getValues();
  for (var j = 1; j < data.length; j++) {
    if (String(data[j][1] || '').trim().toLowerCase() === username) {
      return { success: false, message: "Username '" + username + "' sudah digunakan. Pilih username lain." };
    }
  }
  sheet.appendRow([new Date(), username, name, hashPassword(password, Utilities.getUuid()), 'Siswa', kelas]);
  var user = { username: username, name: name, role: 'Siswa', kelas: kelas, school: 'SMAN 1 Batam', loginTime: new Date().toISOString() };
  user.token = createSession(user);
  return { success: true, message: 'Registrasi berhasil!', user: user };
}

// ───────────────────────── Sesi ─────────────────────────
function sheetByName(name, header) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(header);
  }
  return sh;
}

function createSession(user) {
  var token = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, '');
  sheetByName('Sesi', ['Token', 'Username', 'Nama', 'Role', 'Kelas', 'Dibuat']).appendRow([token, user.username, user.name, user.role, user.kelas, new Date()]);
  return token;
}

function getSession(token) {
  if (!token || String(token).length < 30) return null;
  var data = sheetByName('Sesi', ['Token', 'Username', 'Nama', 'Role', 'Kelas', 'Dibuat']).getDataRange().getValues();
  var limit = Date.now() - SESSION_DAYS * 86400000;
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === token) {
      if (new Date(data[i][5]).getTime() < limit) return null;
      return { username: data[i][1], name: data[i][2], role: String(data[i][3] || ''), kelas: data[i][4] };
    }
  }
  return null;
}

function isGuru(s) {
  return s && /guru|admin|pengajar/i.test(s.role);
}

// ───────────────────────── Nilai ─────────────────────────
function saveScore(p) {
  var s = getSession(p.token);
  if (!s) return { success: false, message: 'Sesi tidak valid. Silakan login ulang.' };
  var score = Math.max(0, Math.min(100, parseInt(p.score, 10) || 0));
  sheetByName('Nilai', ['Waktu', 'Username', 'Nama', 'Kelas', 'Topik', 'Skor', 'Benar', 'Total', 'Mode', 'XP']).appendRow([
    new Date(), s.username, s.name, s.kelas, cleanText(p.chapter, 30), score,
    parseInt(p.correct, 10) || 0, parseInt(p.total, 10) || 0, cleanText(p.mode, 20), parseInt(p.xp, 10) || 0
  ]);
  return { success: true };
}

function listScores(p) {
  var s = getSession(p.token);
  if (!isGuru(s)) return { success: false, message: 'Hanya akun Guru yang dapat melihat rekap nilai.' };
  var data = sheetByName('Nilai', ['Waktu', 'Username', 'Nama', 'Kelas', 'Topik', 'Skor', 'Benar', 'Total', 'Mode', 'XP']).getDataRange().getValues();
  var scores = [];
  for (var i = 1; i < data.length; i++) {
    scores.push({ time: data[i][0], username: data[i][1], name: data[i][2], kelas: data[i][3], chapter: data[i][4], score: data[i][5], correct: data[i][6], total: data[i][7], mode: data[i][8], xp: data[i][9] });
  }
  return { success: true, scores: scores.slice(-2000) };
}

// ───────────────────────── Materi guru ─────────────────────────
function listChapters() {
  var sh = sheetByName('Materi', ['JSON', 'Diperbarui', 'Oleh']);
  var raw = sh.getLastRow() >= 2 ? sh.getRange(2, 1).getValue() : '[]';
  try {
    return { success: true, chapters: JSON.parse(raw || '[]') };
  } catch (err) {
    return { success: true, chapters: [] };
  }
}

function saveChapters(p) {
  var s = getSession(p.token);
  if (!isGuru(s)) return { success: false, message: 'Hanya akun Guru yang dapat mempublikasikan materi.' };
  var list = Array.isArray(p.chapters) ? p.chapters.slice(0, 30) : [];
  var raw = JSON.stringify(list);
  if (raw.length > 45000) return { success: false, message: 'Materi terlalu panjang (maks ±45.000 karakter total).' };
  var sh = sheetByName('Materi', ['JSON', 'Diperbarui', 'Oleh']);
  sh.getRange(2, 1, 1, 3).setValues([[raw, new Date(), s.name]]);
  return { success: true };
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
