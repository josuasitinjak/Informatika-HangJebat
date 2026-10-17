/**
 * GOOGLE APPS SCRIPT — SCRIPT DATABASE LOGIN & REGISTRASI (TEMPLATE CONTOH)
 * Platform Informatika SMAN 1 Batam
 * 
 * PANDUAN DEPLOYMENT:
 * 1. Buka Google Spreadsheet baru (https://sheets.new).
 * 2. Baris 1 buat Header kolom:
 *    A: Timestamp | B: Username | C: Nama_Lengkap | D: Password | E: Role | F: Kelas
 * 3. Menu: Ekstensi > Apps Script.
 * 4. Paste script ini ke editor Apps Script.
 * 5. Klik 'Deploy' > 'New Deployment' > Pilih jenis 'Web App'.
 * 6. Set 'Execute as': 'Me' dan 'Who has access': 'Anyone'.
 * 7. Copy URL Web App yang dihasilkan untuk digunakan di aplikasi.
 */

function doGet(e) {
  return handleRequest(e.parameter || {});
}

function doPost(e) {
  var params = {};
  try {
    params = JSON.parse(e.postData.contents);
  } catch (err) {
    params = e.parameter || {};
  }
  return handleRequest(params);
}

function handleRequest(params) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var action = params.action;

  var response = { success: false, message: "Aksi tidak valid" };

  if (action === "login") {
    var username = (params.username || "").toString().trim().toLowerCase();
    var password = (params.password || "").toString().trim();

    if (!username || !password) {
      response.message = "Username dan kata sandi wajib diisi.";
      return createJsonResponse(response);
    }

    var userFound = null;
    for (var i = 1; i < data.length; i++) {
      var rowUser = (data[i][1] || "").toString().trim().toLowerCase();
      var rowPass = (data[i][3] || "").toString().trim();

      if (rowUser === username && rowPass === password) {
        userFound = {
          username: data[i][1],
          name: data[i][2] || data[i][1],
          role: data[i][4] || "Siswa",
          kelas: data[i][5] || "XI HJ 5",
          school: "SMAN 1 Batam",
          loginTime: new Date().toISOString()
        };
        break;
      }
    }

    if (userFound) {
      response.success = true;
      response.message = "Berhasil masuk!";
      response.user = userFound;
    } else {
      response.message = "Username atau kata sandi tidak cocok.";
    }
  } else if (action === "register") {
    var newUsername = (params.username || "").toString().trim().toLowerCase();
    var newPassword = (params.password || "").toString().trim();
    var newName = (params.name || "").toString().trim();
    var newKelas = (params.kelas || "XI HJ 5").toString().trim();

    if (!newUsername || !newPassword || !newName) {
      response.message = "Data pendaftaran tidak lengkap.";
      return createJsonResponse(response);
    }

    for (var j = 1; j < data.length; j++) {
      var existing = (data[j][1] || "").toString().trim().toLowerCase();
      if (existing === newUsername) {
        response.message = "Username sudah digunakan. Silakan pilih username lain.";
        return createJsonResponse(response);
      }
    }

    sheet.appendRow([
      new Date(),
      newUsername,
      newName,
      newPassword,
      "Siswa",
      newKelas
    ]);

    response.success = true;
    response.message = "Registrasi berhasil!";
    response.user = {
      username: newUsername,
      name: newName,
      role: "Siswa",
      kelas: newKelas,
      school: "SMAN 1 Batam",
      loginTime: new Date().toISOString()
    };
  }

  return createJsonResponse(response);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
