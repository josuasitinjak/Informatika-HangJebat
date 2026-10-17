/**
 * XAVETRA — Platform Pembelajaran Informatika Fase F
 * SMAN 1 Batam • Kelas XI HJ 5
 * Main Application & UI Interactions
 */

/**
 * Membuka Modal Pembelajaran Interaktif
 */
function openLearningModal(moduleName, targetAnchor) {
  const user = typeof getAuthUser === 'function' ? getAuthUser() : null;
  if (!user) return;

  const modal = document.getElementById('learning-modal');
  const title = document.getElementById('modal-module-title');
  const desc = document.getElementById('modal-module-desc');
  const studentName = document.getElementById('modal-student-name');
  const studentAvatar = document.getElementById('modal-student-avatar');

  if (!modal) return;

  if (title) title.textContent = moduleName;
  if (studentName) studentName.textContent = user.name || 'Siswa XI HJ 5';
  
  if (studentAvatar) {
    const initials = user.name 
      ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
      : 'X5';
    studentAvatar.textContent = initials;
  }

  if (desc) {
    if (moduleName.includes('Bab 01') || moduleName.includes('Mesin Pencari')) {
      desc.textContent = "Pembelajaran Mesin Pencari & Cara Kerja: Crawling oleh robot crawler/spider, Indexing di server basis data raksasa, dan Ranking pengurutan relevansi algoritma.";
    } else if (moduleName.includes('Bab 02') || moduleName.includes('Strategi Riset')) {
      desc.textContent = "Pembelajaran Strategi Riset & Triangulasi: Penguasaan operator pencarian cerdas (\" \", -, site:, filetype:), teknik membaca lateral, serta verifikasi 3 sumber independen.";
    } else if (moduleName.includes('Bab 03') || moduleName.includes('Hukum Digital')) {
      desc.textContent = "Pembelajaran Hukum Digital Indonesia: Kajian pasal krusial UU ITE (Pasal 27, 28 hoaks/SARA, 30 hacking, 45 sanksi) dan UU Pelindungan Data Pribadi No. 27/2022.";
    } else if (moduleName.includes('Bab 04') || moduleName.includes('Hak Cipta')) {
      desc.textContent = "Pembelajaran Hak Cipta & Netiket: Regulasi UU Hak Cipta No. 28/2014, lisensi konten, pencegahan plagiarisme karya, etika kesantunan digital (netiket), dan studi kasus.";
    } else {
      desc.textContent = `Materi pembelajaran ${moduleName} Kurikulum Merdeka Informatika Fase F SMAN 1 Batam.`;
    }
  }

  modal.classList.remove('hidden');
}

/**
 * Menutup Modal Pembelajaran Interaktif
 */
function closeLearningModal() {
  const modal = document.getElementById('learning-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

/**
 * Utilitas Notifikasi Toast Global
 */
let toastTimeout;
function showToast(message, type = 'info') {
  const toast = document.getElementById('global-toast') || document.getElementById('toast');
  const text = document.getElementById('global-toast-text') || document.getElementById('toast-message');
  const indicator = document.getElementById('toast-indicator');

  if (!toast || !text) return;

  text.textContent = message;

  if (indicator) {
    if (type === 'alert') {
      indicator.className = 'w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse';
    } else if (type === 'warning') {
      indicator.className = 'w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse';
    } else {
      indicator.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse';
    }
  }

  toast.classList.remove('translate-y-24', 'opacity-0');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('translate-y-24', 'opacity-0');
  }, 3200);
}

// Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  if (typeof syncNavbarAuth === 'function') {
    syncNavbarAuth();
  }
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * XAVETRA TTS (Text-to-Speech) ENGINE — SPESIALISASI BAHASA INDONESIA
 * ─────────────────────────────────────────────────────────────────────────────
 * Menghadirkan suara berbahasa Indonesia dengan AKUSEN INDONESIA ALAMI & OTENTIK.
 * 
 * Arsitektur Dual-Engine:
 * 1. Mode Alami (Google Cloud Native Indonesian Voice, tl=id):
 *    - Aksen Bahasa Indonesia baku asli (persis seperti Google Maps & Translate Indonesia).
 *    - Pelafalan kata-kata Indonesia sempurna tanpa logat bule/robotik.
 *    - Bekerja melalui HTML5 Audio streaming dengan kebijakan no-referrer.
 * 2. Mode Sistem Browser (Web Speech API id-ID):
 *    - Cadangan cerdas jika offline / tanpa koneksi internet.
 *    - Pencarian selektif suara id-ID (Google Bahasa Indonesia, Microsoft Gadis/Ardi).
 *    - Chunking kalimat pendek & heartbeat anti-freeze untuk Chromium/Edge.
 */
const XavetraTTS = (function() {
  let _voices = [];
  let _isPlaying = false;
  let _isPaused = false;
  let _chunks = [];
  let _currentChunkIdx = 0;
  let _activeUtterance = null;
  let _currentAudio = null;
  let _keepAliveTimer = null;
  let _currentCallbacks = null;
  let _playbackRate = 1.0;
  let _mode = 'natural'; // 'natural' (Aksen Indonesia Asli) atau 'system' (Web Speech)

  // Pre-load suara browser
  function _loadVoices() {
    if (!('speechSynthesis' in window)) return;
    const v = window.speechSynthesis.getVoices();
    if (v && v.length) {
      _voices = v;
    }
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    _loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = _loadVoices;
    }
  }

  // Cari suara sistem terbaik berbahasa Indonesia
  function _findBestSystemVoice() {
    if (!_voices.length) _loadVoices();
    
    // 1. Suara resmi Bahasa Indonesia (id-ID, id)
    let v = _voices.find(v => v.lang && (v.lang.toLowerCase().startsWith('id') || v.lang.toLowerCase().startsWith('in')));
    if (v) return v;

    // 2. Berdasarkan nama suara (mengandung kata 'indonesia', 'gadis', 'ardi', 'andika')
    v = _voices.find(v => v.name && /indonesia|gadis|ardi|andika/i.test(v.name));
    if (v) return v;

    // 3. Suara Bahasa Melayu (ms-MY, ms)
    v = _voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ms'));
    if (v) return v;

    // 4. Default sistem
    v = _voices.find(v => v.default);
    if (v) return v;

    return _voices[0] || null;
  }

  // Membersihkan teks dari markdown, kode, simbol & emoji agar nyaman didengar
  function cleanText(rawText) {
    if (!rawText) return '';
    return rawText
      // Hapus tag HTML
      .replace(/<[^>]+>/g, ' ')
      // Lewati blok kode program
      .replace(/```[\s\S]*?```/g, '. Contoh kode program dilewati. ')
      // Inline kode `...`
      .replace(/`([^`]+)`/g, '$1')
      // Markdown link [teks](url) -> teks
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      // Markdown image
      .replace(/!\[.*?\]\(.*?\)/g, '')
      // Heading markdown (#, ##, dll)
      .replace(/^#{1,6}\s+/gm, '')
      // Garis tabel |---|---|
      .replace(/\|[\s\-:|]+\|/g, ' ')
      // Pemisah tabel |
      .replace(/\|/g, ', ')
      // Tanda list (*, -, +, 1.)
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // Format bold/italic
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // Label UI internal
      .replace(/\b(Salin Kode|Tersalin|menu_book|auto_awesome|smart_toy|content_copy|volume_up|stop|info|bookmark_star|military_tech|bolt|quiz)\b/gi, '')
      // URL web
      .replace(/https?:\/\/\S+/gi, 'tautan web')
      // Emoji & simbol khusus
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      // Rapikan spasi & tanda baca ganda
      .replace(/\s+/g, ' ')
      .replace(/([.?!,;:])\1+/g, '$1')
      .trim();
  }

  // Memecah teks menjadi potongan kalimat ringkas (maks ~110 karakter)
  function chunkText(text, maxLen = 110) {
    if (!text) return [];
    const rawSentences = text.match(/[^.!?;\n]+[.!?;\n]+|[^.!?;\n]+$/g) || [text];
    const result = [];

    for (let s of rawSentences) {
      s = s.trim();
      if (!s) continue;
      if (s.length <= maxLen) {
        result.push(s);
      } else {
        const words = s.split(' ');
        let cur = '';
        for (const w of words) {
          if ((cur + ' ' + w).trim().length <= maxLen) {
            cur = (cur + ' ' + w).trim();
          } else {
            if (cur) result.push(cur);
            cur = w;
          }
        }
        if (cur) result.push(cur);
      }
    }
    return result;
  }

  // Hentikan suara sepenuhnya
  function stop() {
    _isPlaying = false;
    _isPaused = false;
    _chunks = [];
    _currentChunkIdx = 0;
    
    if (_keepAliveTimer) {
      clearInterval(_keepAliveTimer);
      _keepAliveTimer = null;
    }
    
    if (_currentAudio) {
      try {
        _currentAudio.pause();
        _currentAudio.onended = null;
        _currentAudio.onerror = null;
        _currentAudio.src = '';
      } catch (e) {}
      _currentAudio = null;
    }
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    if (_currentCallbacks && typeof _currentCallbacks.onEnd === 'function') {
      try { _currentCallbacks.onEnd(); } catch (e) {}
    }
    
    _currentCallbacks = null;
    _activeUtterance = null;
  }

  // Jeda suara
  function pause() {
    if (!_isPlaying || _isPaused) return;
    _isPaused = true;
    
    if (_mode === 'natural' && _currentAudio) {
      _currentAudio.pause();
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    
    if (_currentCallbacks && typeof _currentCallbacks.onPause === 'function') {
      try { _currentCallbacks.onPause(); } catch (e) {}
    }
  }

  // Lanjutkan suara
  function resume() {
    if (!_isPlaying || !_isPaused) return;
    _isPaused = false;
    
    if (_mode === 'natural' && _currentAudio) {
      _currentAudio.play().catch(() => {});
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    
    if (_currentCallbacks && typeof _currentCallbacks.onResume === 'function') {
      try { _currentCallbacks.onResume(); } catch (e) {}
    }
  }

  // Putar potongan suara mode Alami (Google Native Indonesian Voice)
  function _playNextNaturalChunk() {
    if (!_isPlaying || _currentChunkIdx >= _chunks.length) {
      stop();
      return;
    }

    const chunk = _chunks[_currentChunkIdx];
    const encoded = encodeURIComponent(chunk);
    // Menggunakan parameter tl=id untuk Bahasa Indonesia murni
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=${encoded}`;

    if (_currentAudio) {
      try {
        _currentAudio.pause();
        _currentAudio.onended = null;
        _currentAudio.onerror = null;
        _currentAudio.src = '';
      } catch (e) {}
    }

    const audio = new Audio();
    audio.referrerPolicy = 'no-referrer';
    audio.src = audioUrl;
    audio.playbackRate = _playbackRate;
    _currentAudio = audio;

    audio.onended = () => {
      if (!_isPlaying) return;
      _currentChunkIdx++;
      if (_currentCallbacks && typeof _currentCallbacks.onProgress === 'function') {
        try {
          _currentCallbacks.onProgress(_currentChunkIdx, _chunks.length, chunk);
        } catch (e) {}
      }
      _playNextNaturalChunk();
    };

    audio.onerror = (e) => {
      console.warn('Google Natural Voice offline / gagal, beralih ke suara sistem browser...');
      _mode = 'system';
      _speakNextSystemChunk();
    };

    audio.play().catch(err => {
      console.warn('Autoplay error / stream failed, beralih ke suara sistem:', err);
      _mode = 'system';
      _speakNextSystemChunk();
    });
  }

  // Putar potongan suara mode Sistem Browser (Web Speech API)
  function _speakNextSystemChunk() {
    if (!_isPlaying || _currentChunkIdx >= _chunks.length) {
      stop();
      return;
    }

    const chunk = _chunks[_currentChunkIdx];
    const utterance = new SpeechSynthesisUtterance(chunk);
    _activeUtterance = utterance;

    const voice = _findBestSystemVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'id-ID';
    } else {
      utterance.lang = 'id-ID';
    }

    utterance.rate = _playbackRate || 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      if (!_isPlaying) return;
      _currentChunkIdx++;
      if (_currentCallbacks && typeof _currentCallbacks.onProgress === 'function') {
        try {
          _currentCallbacks.onProgress(_currentChunkIdx, _chunks.length, chunk);
        } catch (e) {}
      }
      _speakNextSystemChunk();
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      console.warn('System TTS chunk error:', e.error);
      _currentChunkIdx++;
      if (_currentChunkIdx < _chunks.length && _isPlaying) {
        _speakNextSystemChunk();
      } else {
        stop();
      }
    };

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
  }

  // Fungsi utama untuk mulai membacakan
  function speakText(rawText, callbacks = {}) {
    stop();

    const cleaned = cleanText(rawText);
    if (!cleaned || cleaned.length < 2) {
      if (typeof callbacks.onError === 'function') {
        callbacks.onError('Tidak ada teks yang dapat dibaca.');
      }
      return false;
    }

    _playbackRate = callbacks.rate || 1.0;
    // Default utama: Mode Alami (Aksen Indonesia Asli)
    _mode = callbacks.mode || 'natural';

    _chunks = chunkText(cleaned, 110);
    if (!_chunks.length) {
      if (typeof callbacks.onError === 'function') {
        callbacks.onError('Teks kosong setelah dibersihkan.');
      }
      return false;
    }

    _isPlaying = true;
    _isPaused = false;
    _currentChunkIdx = 0;
    _currentCallbacks = callbacks;

    if (typeof callbacks.onStart === 'function') {
      try { callbacks.onStart(_chunks.length, _mode); } catch (e) {}
    }

    if (_mode === 'natural') {
      _playNextNaturalChunk();
    } else {
      _keepAliveTimer = setInterval(() => {
        if (_isPlaying && !_isPaused && 'speechSynthesis' in window) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 8000);
      _speakNextSystemChunk();
    }

    return true;
  }

  function setRate(rate) {
    _playbackRate = rate;
    if (_currentAudio) {
      _currentAudio.playbackRate = rate;
    }
  }

  return {
    speakText,
    stop,
    pause,
    resume,
    setRate,
    isPlaying: () => _isPlaying,
    isPaused: () => _isPaused,
    getMode: () => _mode,
    cleanText,
    getVoices: () => _voices,
    findBestSystemVoice: _findBestSystemVoice
  };
})();

window.XavetraTTS = XavetraTTS;

/**
 * Toggle Mobile Navigation Drawer (Landing Page)
 */
function toggleMobileNav() {
  const drawer = document.getElementById('mobile-nav-drawer');
  const icon = document.getElementById('mobile-menu-icon');
  if (!drawer) return;
  const isHidden = drawer.classList.contains('hidden');
  if (isHidden) {
    drawer.classList.remove('hidden');
    if (icon) icon.textContent = 'close';
  } else {
    drawer.classList.add('hidden');
    if (icon) icon.textContent = 'menu';
  }
}
