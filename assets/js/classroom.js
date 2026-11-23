/* Fitur kelas: profil anonim, leaderboard, agenda, pengumpulan dan penilaian tugas. */
(function () {
  'use strict';
  var esc = function (v) { return X.esc(v == null ? '' : v); };
  var user = function () { return X.getUser() || {}; };
  var call = function (action, extra) { var u = user(); return X.cloud.call(action, Object.assign({ token: u.token }, extra || {})); };
  var unavailable = function (msg) { return 'Sambungkan Apps Script v3 untuk mengaktifkan sinkronisasi bersama.' + (msg ? ' ' + msg : ''); };
  var list = function (host, items, empty) {
    if (!host) return;
    if (!window.AnimatedList) { host.textContent = empty || 'Daftar belum tersedia.'; return; }
    AnimatedList.mount(host, items || [], { animation: 'pop', stagger: 0.045, maxHeight: 330, label: 'Daftar kelas', emptyText: empty || 'Belum ada data.' });
  };
  function loadLeaderboard() {
    var host = document.getElementById('leaderboard-list'), msg = document.getElementById('leaderboard-msg');
    if (!host) return;
    call('listLeaderboard').then(function (res) {
      if (!res.success) { list(host, [], 'Peringkat belum tersedia.'); msg.textContent = unavailable(res.message || ''); return; }
      var rows = res.entries || [];
      list(host, rows.map(function (r, i) { return { icon: i < 3 ? 'emoji_events' : 'person', title: (i + 1) + '. ' + r.name, description: 'Nama samaran', meta: String(r.xp) + ' XP' }; }), 'Belum ada peserta yang memilih tampil di peringkat.');
      msg.textContent = 'Hanya nama samaran dan XP tersimpan yang ditampilkan.';
    }).catch(function () { list(host, [], 'Peringkat belum tersedia.'); msg.textContent = unavailable(); });
  }
  function loadEvents(hostId) {
    var host = document.getElementById(hostId); if (!host) return;
    call('listEvents').then(function (res) {
      if (!res.success) { list(host, [], unavailable(res.message || '')); return; }
      var rows = res.events || [];
      if (hostId === 'student-events') scheduleReminder(rows);
      list(host, rows.map(function (e) { var date = new Date(e.date); return { icon: e.type === 'Kuis' ? 'quiz' : e.type === 'Tugas' ? 'assignment' : 'event', title: e.title, description: (isNaN(date.getTime()) ? '' : date.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })) + (e.detail ? ' · ' + e.detail : ''), meta: e.type || 'Agenda' }; }), 'Belum ada agenda kelas.');
    }).catch(function () { list(host, [], unavailable()); });
  }
  var reminderTimer = null;
  function scheduleReminder(events) {
    clearTimeout(reminderTimer);
    var enabled = false; try { enabled = localStorage.getItem('xavetra_event_reminders') === 'on'; } catch (e) {}
    if (!enabled || !('Notification' in window) || Notification.permission !== 'granted') return;
    var now = Date.now(), upcoming = (events || []).map(function (e) { var d = new Date(e.date); d.setHours(8,0,0,0); return { event:e, at:d.getTime() - 86400000 }; }).filter(function (x) { return new Date(x.event.date).getTime() >= now; }).sort(function(a,b){return a.at-b.at;})[0];
    if (!upcoming) return;
    var key = 'xavetra_reminded::' + upcoming.event.id;
    var fire = function () { try { if (localStorage.getItem(key)) return; new Notification('Agenda Informatika besok', { body: upcoming.event.title, tag: key }); localStorage.setItem(key, '1'); } catch (e) {} };
    if (upcoming.at <= now) fire(); else reminderTimer = setTimeout(fire, Math.min(upcoming.at - now, 2147480000));
  }
  function plan() {
    var host = document.getElementById('learning-plan'); if (!host) return;
    var p = X.getProgress(), mistakes = p.mistakes || [], counts = {};
    mistakes.forEach(function (k) { var src = String(k).split(':')[0]; counts[src] = (counts[src] || 0) + 1; });
    var weak = Object.keys(counts).sort(function (a,b) { return counts[b] - counts[a]; })[0];
    var chapter = weak && XContent.get(weak), next = XContent.CHAPTERS.find(function (c) { return !(p.lessons[c.id] || {}).completed; });
    if (chapter) {
      host.innerHTML = '<p class="text-sm text-slate-600">Ada ' + counts[weak] + ' soal yang pernah salah di <b>' + esc(chapter.short) + '</b>. Ulangi soal itu untuk memperkuat materi.</p><a href="kuis.html?topik=ulang" class="mt-3 inline-flex px-4 py-2 rounded-full bg-primary text-white text-xs font-bold">Ulangi soal yang salah</a>';
    } else if (next) {
      host.innerHTML = '<p class="text-sm text-slate-600">Lanjutkan <b>Bab ' + next.number + ': ' + esc(next.short) + '</b> untuk menjaga progres belajarmu.</p><a href="modul.html?bab=' + next.number + '" class="mt-3 inline-flex px-4 py-2 rounded-full bg-primary text-white text-xs font-bold">Buka langkah berikutnya</a>';
    } else {
      host.innerHTML = '<p class="text-sm text-slate-600">Semua langkah materi sudah selesai. Coba kuis campuran untuk meninjau kembali.</p><a href="kuis.html?topik=campuran" class="mt-3 inline-flex px-4 py-2 rounded-full bg-primary text-white text-xs font-bold">Mulai kuis campuran</a>';
    }
  }
  function loadProfile() {
    var form = document.getElementById('profile-form'); if (!form) return;
    call('getProfile').then(function (res) {
      if (!res.success) { document.getElementById('profile-msg').textContent = unavailable(res.message || ''); return; }
      var p = res.profile || {}; form.elements.displayName.value = p.displayName || ''; form.elements.dailyGoal.value = String(p.dailyGoal || 50); form.elements.leaderboard.checked = !!p.leaderboard; if (form.elements.kelas) form.elements.kelas.value = p.kelas || user().kelas || '';
      try { var goalKey = 'xavetra_onboarded::' + String(user().username || '').toLowerCase(); localStorage.setItem(goalKey, '1'); localStorage.setItem(goalKey.replace('onboarded','goal'), String(p.dailyGoal || 50)); } catch (e) {}
      document.dispatchEvent(new CustomEvent('x:progress', { detail: X.getProgress() }));
    }).catch(function () { document.getElementById('profile-msg').textContent = unavailable(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault(); var msg = document.getElementById('profile-msg'); msg.textContent = 'Menyimpan…';
      call('saveProfile', { displayName: form.elements.displayName.value, dailyGoal: form.elements.dailyGoal.value, leaderboard: form.elements.leaderboard.checked }).then(function (res) {
        msg.textContent = res.success ? 'Pengaturan tersimpan.' : (res.message || unavailable());
        if (res.success) {
          var uname = String(user().username || '').toLowerCase();
          try { localStorage.setItem('xavetra_goal::' + uname, String(res.profile.dailyGoal)); localStorage.setItem('xavetra_onboarded::' + uname, '1'); } catch (err) {}
          var goalKey = 'xavetra_onboarded::' + uname; try { localStorage.setItem(goalKey.replace('onboarded','goal'), String(res.profile.dailyGoal)); } catch (err) {}
          loadLeaderboard();
        }
      }).catch(function () { msg.textContent = unavailable(); });
    });
  }
  function loadTeacherSubmissions() {
    var host = document.getElementById('teacher-submissions'); if (!host) return;
    call('listSubmissions').then(function (res) {
      if (!res.success) { host.textContent = unavailable(res.message || ''); return; }
      var rows = res.submissions || [];
      list(host, rows.map(function (s) { return { icon: 'assignment_turned_in', title: s.name + ' · ' + s.taskId, description: s.status + (s.score !== '' && s.score != null ? ' · ' + s.score + '/100' : ''), meta: new Date(s.time).toLocaleDateString('id-ID') }; }), 'Belum ada tugas yang dikumpulkan.');
      var frame = host.querySelector('.al-list');
      if (frame) frame.addEventListener('click', function (e) {
        var row = e.target.closest('.al-row'), index = row ? Array.prototype.indexOf.call(frame.children, row) : -1, item = rows[index]; if (!item) return;
        var wrap = document.getElementById('grade-form-wrap'); wrap.classList.remove('hidden');
        wrap.innerHTML = '<div class="text-xs font-bold">' + esc(item.name) + ' · ' + esc(item.taskId) + '</div><a class="text-xs text-primary underline" href="' + esc(item.url) + '" target="_blank" rel="noopener">Buka hasil ' + esc(item.fileName || 'tautan') + '</a><form id="grade-form" class="mt-2 grid sm:grid-cols-[100px_1fr_auto] gap-2"><input name="score" type="number" min="0" max="100" placeholder="Nilai" class="rounded-lg border px-2 py-1 text-xs"><input name="feedback" maxlength="1000" placeholder="Umpan balik" class="rounded-lg border px-2 py-1 text-xs"><button class="px-3 py-1 rounded-full bg-primary text-white text-xs">Simpan</button></form><p id="grade-msg" class="mt-1 text-xs text-text-muted"></p>';
        document.getElementById('grade-form').addEventListener('submit', function (ev) { ev.preventDefault(); var f = ev.currentTarget; call('gradeSubmission', { id: item.id, score: f.elements.score.value, feedback: f.elements.feedback.value }).then(function (out) { document.getElementById('grade-msg').textContent = out.success ? 'Penilaian tersimpan.' : out.message; if (out.success) loadTeacherSubmissions(); }); });
      });
    }).catch(function () { host.textContent = unavailable(); });
  }
  function initDashboard() {
    loadLeaderboard(); loadEvents('student-events'); plan(); loadProfile();
    var theme = document.getElementById('toggle-theme'); if (theme) theme.addEventListener('click', X.toggleTheme);
    var reminder = document.getElementById('reminder-toggle');
    if (reminder) reminder.addEventListener('click', async function () {
      var msg = document.getElementById('reminder-msg');
      if (!('Notification' in window)) { msg.textContent = 'Browser ini tidak mendukung notifikasi.'; return; }
      var permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
      if (permission !== 'granted') { msg.textContent = 'Izin notifikasi belum diberikan.'; return; }
      try { localStorage.setItem('xavetra_event_reminders', localStorage.getItem('xavetra_event_reminders') === 'on' ? 'off' : 'on'); } catch (e) {}
      var enabled = localStorage.getItem('xavetra_event_reminders') === 'on'; reminder.textContent = enabled ? 'Pengingat aktif · 1 hari sebelumnya' : 'Aktifkan pengingat 1 hari sebelumnya';
      msg.textContent = enabled ? 'Pengingat berjalan saat dashboard terbuka.' : 'Pengingat dimatikan.'; loadEvents('student-events');
    });
    var sound = document.getElementById('toggle-sound'); if (sound) sound.addEventListener('click', function () { try { var on = localStorage.getItem('xavetra_sound') !== 'off'; localStorage.setItem('xavetra_sound', on ? 'off' : 'on'); sound.textContent = 'Suara: ' + (on ? 'mati' : 'aktif'); } catch (e) {} });
  }
  function initTeacher() {
    loadTeacherSubmissions(); loadEvents('teacher-events');
    var form = document.getElementById('event-form'); if (!form) return;
    form.addEventListener('submit', function (e) { e.preventDefault(); var msg = document.getElementById('event-form-msg'); msg.textContent = 'Menerbitkan…';
      call('saveEvent', { title: form.elements.title.value, date: form.elements.date.value, type: form.elements.type.value, detail: form.elements.detail.value }).then(function (res) { msg.textContent = res.success ? 'Agenda diterbitkan untuk kelas.' : (res.message || unavailable()); if (res.success) { form.reset(); loadEvents('teacher-events'); } }).catch(function () { msg.textContent = unavailable(); });
    });
  }
  function loadMySubmissions() {
    var host = document.getElementById('my-submissions'); if (!host) return;
    call('mySubmissions').then(function (res) {
      if (!res.success) { list(host, [], unavailable(res.message || '')); return; }
      var rows = res.submissions || [];
      list(host, rows.map(function (s) { var d = s.feedback ? 'Umpan balik: ' + s.feedback : (s.fileName || s.url); return { icon: s.status === 'Dinilai' ? 'task_alt' : 'hourglass_top', title: s.taskId === 't1' ? 'Analisis Kasus Hukum Digital' : s.taskId === 't2' ? 'Investigasi Isu Digital' : 'Analisis Data Excel & Power BI', description: s.status + (s.score !== '' && s.score != null ? ' · Nilai ' + s.score : '') + (d ? ' · ' + d : ''), meta: new Date(s.time).toLocaleDateString('id-ID') }; }), 'Belum ada pengumpulan.');
    }).catch(function () { list(host, [], unavailable()); });
  }
  function readFile(file) {
    return new Promise(function (resolve, reject) {
      if (file.size > 4 * 1024 * 1024) return reject(new Error('Ukuran file maksimal 4 MB.'));
      var r = new FileReader(); r.onload = function () { resolve(String(r.result).split(',')[1] || ''); }; r.onerror = function () { reject(new Error('File gagal dibaca.')); }; r.readAsDataURL(file);
    });
  }
  function initTasks() {
    loadMySubmissions(); var form = document.getElementById('submission-form'); if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault(); var msg = document.getElementById('submission-msg'), btn = document.getElementById('submit-task-btn'), file = form.elements.file.files[0];
      if (!form.elements.url.value.trim() && !file) { msg.textContent = 'Pilih file atau isi tautan terlebih dahulu.'; return; }
      btn.disabled = true; msg.textContent = 'Mengirim…';
      try {
        var payload = { taskId: form.elements.taskId.value, url: form.elements.url.value.trim() };
        if (file) { payload.fileData = await readFile(file); payload.fileName = file.name; payload.mimeType = file.type; }
        var res = await call('submitTask', payload);
        msg.textContent = res.success ? 'Tugas berhasil dikumpulkan.' : (res.message || unavailable());
        if (res.success) { form.reset(); loadMySubmissions(); }
      } catch (err) { msg.textContent = err.message || unavailable(); }
      finally { btn.disabled = false; }
    });
  }
  window.ClassroomUI = { initDashboard: initDashboard, initTasks: initTasks, initTeacher: initTeacher };
})();
