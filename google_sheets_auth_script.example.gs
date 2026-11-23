/**
 * GOOGLE APPS SCRIPT v3 — DATABASE PLATFORM INFORMATIKA SMAN 1 BATAM (TEMPLATE)
 *
 * Fitur:
 *  - login / register (kata sandi disimpan sebagai hash SHA-256 + salt;
 *    akun lama berkata sandi polos otomatis di-upgrade saat login berhasil)
 *  - token sesi (sheet "Sesi") untuk aksi yang butuh identitas
 *  - saveScore  : siswa mengirim nilai kuis      (butuh token)
 *  - listScores : guru melihat rekap nilai kelas (butuh token role Guru/Admin)
 *  - listChapters / saveChapters : materi tambahan guru dibagikan ke semua siswa
 *  - leaderboard anonim, profil, pengumpulan/penilaian tugas, dan agenda kelas
 *
 * PANDUAN DEPLOYMENT / UPDATE:
 * 1. Buka Google Spreadsheet database (sheet pertama = data akun).
 *    Baris 1 header: A Timestamp | B Username | C Nama_Lengkap | D Password | E Role | F Kelas
 * 2. Ekstensi > Apps Script. Ganti seluruh kode dengan isi file ini, lalu Simpan.
 * 3. Deploy > Manage deployments > (ikon pensil) Edit > Version: "New version" > Deploy.
 *    (Dengan cara ini URL Web App TIDAK berubah, jadi website tidak perlu diubah.)
 * 4. Untuk akun guru: isi kolom E (Role) dengan "Guru". Akun yang mendaftar dari website
 *    selalu berperan "Siswa" — peran Guru hanya bisa diberikan lewat Sheet ini.
 * 5. Sheet "Sesi", "Nilai", "Materi", "Profil", "Pengumpulan", dan "Agenda" dibuat otomatis.
 * 6. Deploy memakai akun guru yang perlu mengakses kiriman file. File siswa tetap privat di Drive; jangan ubah aksesnya menjadi publik.
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
      case 'getProfile': return json(getProfile(p));
      case 'saveProfile': return json(saveProfile(p));
      case 'listLeaderboard': return json(listLeaderboard(p));
      case 'submitTask': return json(submitTask(p));
      case 'mySubmissions': return json(mySubmissions(p));
      case 'listSubmissions': return json(listSubmissions(p));
      case 'gradeSubmission': return json(gradeSubmission(p));
      case 'listEvents': return json(listEvents(p));
      case 'saveEvent': return json(saveEvent(p));
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


// ─────────────────────── Profil & Papan Peringkat ───────────────────────
function profileSheet() {
  return sheetByName('Profil', ['Username', 'Nama_Tampilan', 'Kelas', 'Target_Harian', 'Peringkat_Aktif', 'Diperbarui']);
}
function profileFor(username, name, kelas) {
  var sh = profileSheet(), data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === String(username).toLowerCase()) {
      return { username: username, displayName: String(data[i][1] || ''), kelas: String(data[i][2] || kelas || ''), dailyGoal: Number(data[i][3]) || 50, leaderboard: String(data[i][4]).toUpperCase() === 'TRUE' };
    }
  }
  return { username: username, displayName: '', kelas: kelas || '', dailyGoal: 50, leaderboard: false };
}
function getProfile(p) {
  var s = getSession(p.token);
  if (!s) return { success: false, message: 'Sesi tidak valid. Silakan login ulang.' };
  return { success: true, profile: profileFor(s.username, s.name, s.kelas) };
}
function saveProfile(p) {
  var s = getSession(p.token);
  if (!s) return { success: false, message: 'Sesi tidak valid. Silakan login ulang.' };
  var alias = cleanText(p.displayName, 24);
  var goal = Math.max(20, Math.min(100, parseInt(p.dailyGoal, 10) || 50));
  var optedIn = p.leaderboard === true;
  if (optedIn && alias.length < 2) return { success: false, message: 'Isi nama samaran minimal 2 karakter untuk ikut peringkat.' };
  var sh = profileSheet(), data = sh.getDataRange().getValues(), row = 0;
  for (var i = 1; i < data.length; i++) if (String(data[i][0]).toLowerCase() === String(s.username).toLowerCase()) { row = i + 1; break; }
  var values = [s.username, alias, s.kelas, goal, optedIn, new Date()];
  if (row) sh.getRange(row, 1, 1, values.length).setValues([values]); else sh.appendRow(values);
  return { success: true, profile: { username: s.username, displayName: alias, kelas: s.kelas, dailyGoal: goal, leaderboard: optedIn } };
}
function listLeaderboard(p) {
  var s = getSession(p.token);
  if (!s) return { success: false, message: 'Sesi tidak valid. Silakan login ulang.' };
  var profiles = profileSheet().getDataRange().getValues(), allowed = {};
  for (var i = 1; i < profiles.length; i++) {
    var username = String(profiles[i][0] || '').toLowerCase();
    if (username && String(profiles[i][4]).toUpperCase() === 'TRUE' && String(profiles[i][1] || '').trim()) {
      allowed[username] = { alias: cleanText(profiles[i][1], 24), kelas: String(profiles[i][2] || '') };
    }
  }
  var sh = sheetByName('Nilai', ['Waktu', 'Username', 'Nama', 'Kelas', 'Topik', 'Skor', 'Benar', 'Total', 'Mode', 'XP']);
  var scores = sh.getDataRange().getValues(), totals = {};
  for (var j = 1; j < scores.length; j++) {
    var key = String(scores[j][1] || '').toLowerCase();
    if (!allowed[key] || (allowed[key].kelas && String(allowed[key].kelas) !== String(s.kelas))) continue;
    totals[key] = Math.max(totals[key] || 0, Number(scores[j][9]) || 0);
  }
  var rows = Object.keys(totals).map(function (key) { return { name: allowed[key].alias, xp: totals[key] }; });
  rows.sort(function (a, b) { return b.xp - a.xp; });
  return { success: true, entries: rows.slice(0, 30) };
}

// ───────────────────────── Pengumpulan Tugas ─────────────────────────
function taskSheet() {
  return sheetByName('Pengumpulan', ['ID', 'Waktu', 'Username', 'Nama', 'Kelas', 'Tugas', 'Tautan', 'File_ID', 'Nama_File', 'Status', 'Nilai', 'Umpan_Balik', 'Diperbarui']);
}
function submitTask(p) {
  var s = getSession(p.token);
  if (!s) return { success: false, message: 'Sesi tidak valid. Silakan login ulang.' };
  var task = cleanText(p.taskId, 20), link = String(p.url || '').trim(), fileId = '', fileName = '';
  if (!/^t[1-3]$/.test(task)) return { success: false, message: 'Tugas tidak dikenal.' };
  if (link && !/^https:\/\//i.test(link)) return { success: false, message: 'Tautan harus diawali https://.' };
  if (p.fileData) {
    var name = cleanText(p.fileName, 120), mime = String(p.mimeType || '').toLowerCase();
    var allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/png', 'image/jpeg'];
    if (!name || allowed.indexOf(mime) < 0) return { success: false, message: 'Jenis file tidak didukung. Gunakan PDF, Office, PNG, atau JPG.' };
    var bytes = Utilities.base64Decode(String(p.fileData));
    if (bytes.length > 4 * 1024 * 1024) return { success: false, message: 'Ukuran file maksimal 4 MB.' };
    var folderIt = DriveApp.getFoldersByName('Pengumpulan Tugas Informatika');
    var folder = folderIt.hasNext() ? folderIt.next() : DriveApp.createFolder('Pengumpulan Tugas Informatika');
    var file = folder.createFile(Utilities.newBlob(bytes, mime, name));
    fileId = file.getId(); fileName = name; link = file.getUrl();
  }
  if (!link) return { success: false, message: 'Masukkan tautan tugas atau pilih file.' };
  var id = Utilities.getUuid();
  taskSheet().appendRow([id, new Date(), s.username, s.name, s.kelas, task, link, fileId, fileName, 'Menunggu penilaian', '', '', new Date()]);
  return { success: true, message: 'Tugas berhasil dikumpulkan.', submission: { id: id, taskId: task, status: 'Menunggu penilaian', url: link, fileName: fileName } };
}
function submissionRows(p, teacherOnly) {
  var s = getSession(p.token);
  if (!s) return { error: 'Sesi tidak valid. Silakan login ulang.' };
  if (teacherOnly && !isGuru(s)) return { error: 'Hanya akun Guru yang dapat melihat pengumpulan kelas.' };
  var data = taskSheet().getDataRange().getValues(), rows = [];
  for (var i = 1; i < data.length; i++) {
    if (!teacherOnly && String(data[i][2]).toLowerCase() !== String(s.username).toLowerCase()) continue;
    rows.push({ id: data[i][0], time: data[i][1], username: data[i][2], name: data[i][3], kelas: data[i][4], taskId: data[i][5], url: data[i][6], fileName: data[i][8], status: data[i][9], score: data[i][10], feedback: data[i][11] });
  }
  rows.sort(function (a, b) { return new Date(b.time) - new Date(a.time); });
  return { success: true, submissions: rows.slice(0, 300) };
}
function mySubmissions(p) { return submissionRows(p, false); }
function listSubmissions(p) { return submissionRows(p, true); }
function gradeSubmission(p) {
  var s = getSession(p.token);
  if (!isGuru(s)) return { success: false, message: 'Hanya akun Guru yang dapat memberi nilai.' };
  var id = cleanText(p.id, 80), score = p.score === '' || p.score == null ? '' : Math.max(0, Math.min(100, Number(p.score) || 0));
  var feedback = cleanText(p.feedback, 1000), sh = taskSheet(), data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) if (String(data[i][0]) === id) {
    sh.getRange(i + 1, 10, 1, 4).setValues([[score === '' ? 'Sudah ditinjau' : 'Dinilai', score, feedback, new Date()]]);
    return { success: true };
  }
  return { success: false, message: 'Pengumpulan tidak ditemukan.' };
}

// ───────────────────────── Agenda Kelas ─────────────────────────
function eventSheet() {
  return sheetByName('Agenda', ['ID', 'Dibuat', 'Tanggal', 'Jenis', 'Judul', 'Detail', 'Oleh', 'Kelas']);
}
function listEvents(p) {
  var s = getSession(p.token);
  if (!s) return { success: false, message: 'Sesi tidak valid. Silakan login ulang.' };
  var data = eventSheet().getDataRange().getValues(), rows = [];
  for (var i = 1; i < data.length; i++) if (!data[i][7] || String(data[i][7]) === String(s.kelas)) rows.push({ id: data[i][0], created: data[i][1], date: data[i][2], type: data[i][3], title: data[i][4], detail: data[i][5], author: data[i][6] });
  rows.sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
  return { success: true, events: rows.slice(0, 100) };
}
function saveEvent(p) {
  var s = getSession(p.token);
  if (!isGuru(s)) return { success: false, message: 'Hanya akun Guru yang dapat membuat agenda.' };
  var date = String(p.date || ''), type = cleanText(p.type, 20), title = cleanText(p.title, 120), detail = cleanText(p.detail, 500);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !title) return { success: false, message: 'Tanggal dan judul agenda wajib diisi.' };
  var id = Utilities.getUuid();
  eventSheet().appendRow([id, new Date(), new Date(date + 'T12:00:00'), type || 'Agenda', title, detail, s.name, cleanText(p.kelas, 20)]);
  return { success: true, id: id };
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
