/**
 * XAVETRA — Platform Pembelajaran Informatika Fase F
 * SMAN 1 Batam • Kelas XI HJ 5
 * Interactive Quiz Simulation: Mesin Pencari, Strategi Riset & Hukum Digital
 */

/**
 * Memproses pilihan jawaban kuis literasi & operator riset siswa
 */
function handleSearchQuizAnswer(selectedOption, buttonElement) {
  const container = document.getElementById('quiz-options-container');
  if (!container) return;

  const allButtons = container.querySelectorAll('.quiz-opt');
  const feedbackBox = document.getElementById('quiz-feedback-box');
  const feedbackTitle = document.getElementById('quiz-feedback-title');
  const feedbackDesc = document.getElementById('quiz-feedback-desc');

  // Reset tampilan tombol opsi
  allButtons.forEach(btn => {
    btn.classList.remove(
      'border-emerald-500', 'bg-emerald-50', 'text-emerald-700',
      'border-red-400', 'bg-red-50', 'text-red-700', 'bg-emerald-50/50'
    );
    btn.classList.add('border-border-light');
    const badge = btn.querySelector('.quiz-badge');
    if (badge) badge.innerHTML = '';
  });

  // Jawaban benar adalah B (Slide 11 PPT Mesin Pencari)
  if (selectedOption === 'B') {
    buttonElement.classList.remove('border-border-light');
    buttonElement.classList.add('border-emerald-500', 'bg-emerald-50', 'text-emerald-700');
    buttonElement.querySelector('.quiz-badge').innerHTML = '<span class="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>';

    feedbackBox.className = 'p-3.5 rounded-xl text-xs leading-relaxed transition-all bg-emerald-50 border border-emerald-200 block';
    feedbackTitle.className = 'flex items-center gap-1.5 font-bold mb-1 text-emerald-700';
    feedbackTitle.innerHTML = '<span class="material-symbols-outlined text-[16px]">check_circle</span> Jawaban Benar Sekali!';
    feedbackDesc.textContent = 'Sintaks site:kemdikbud.go.id membatasi domain resmi, tanda kutip "kurikulum merdeka" mencari frasa persis, filetype:pdf menyaring format dokumen, dan -iklan mengecualikan kata komersial yang tidak diinginkan (Slide 11 PPT Mesin Pencari).';
  } else {
    buttonElement.classList.remove('border-border-light');
    buttonElement.classList.add('border-red-400', 'bg-red-50', 'text-red-700');
    buttonElement.querySelector('.quiz-badge').innerHTML = '<span class="material-symbols-outlined text-[18px] text-red-500">cancel</span>';

    // Sorot opsi yang benar
    allButtons.forEach(btn => {
      if (btn.innerText.includes('B.')) {
        btn.classList.add('border-emerald-500', 'bg-emerald-50/50');
        btn.querySelector('.quiz-badge').innerHTML = '<span class="material-symbols-outlined text-[18px] text-emerald-600">check</span>';
      }
    });

    feedbackBox.className = 'p-3.5 rounded-xl text-xs leading-relaxed transition-all bg-red-50 border border-red-200 block';
    feedbackTitle.className = 'flex items-center gap-1.5 font-bold mb-1 text-red-700';
    feedbackTitle.innerHTML = '<span class="material-symbols-outlined text-[16px]">error</span> Belum Tepat';
    feedbackDesc.textContent = 'Jawaban yang tepat adalah B. Operator mesin pencari menggunakan site:domain, frasa " ", filetype:ekstensi, dan tanda minus (-) untuk menyaring kata.';
  }
}

/**
 * Mengatur ulang kuis
 */
function resetSearchQuiz() {
  const container = document.getElementById('quiz-options-container');
  if (!container) return;

  const allButtons = container.querySelectorAll('.quiz-opt');
  const feedbackBox = document.getElementById('quiz-feedback-box');

  allButtons.forEach(btn => {
    btn.classList.remove(
      'border-emerald-500', 'bg-emerald-50', 'text-emerald-700',
      'border-red-400', 'bg-red-50', 'text-red-700', 'bg-emerald-50/50'
    );
    btn.classList.add('border-border-light');
    const badge = btn.querySelector('.quiz-badge');
    if (badge) badge.innerHTML = '';
  });

  if (feedbackBox) {
    feedbackBox.className = 'hidden';
  }
}

// Fallback alias kompatibilitas
window.handleQuizAnswer = handleSearchQuizAnswer;
window.resetQuiz = resetSearchQuiz;
