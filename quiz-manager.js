// ============================================
// SPEECH MANAGER (TTS + STT)
// ============================================
class SpeechManager {
  constructor() {
    this.ttsSupported = 'speechSynthesis' in window;
    this.sttSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    this._recognition = null;
    this._sttTimeout = null;
  }

  speak(text, onEnd, rate, pitch) {
    if (!this.ttsSupported) {
      if (onEnd) onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = QUIZ_CONFIG.sttLang; // ttsLang은 sttLang과 동일
    utter.rate = rate !== undefined ? rate : 0.85;
    utter.pitch = pitch !== undefined ? pitch : 1.1;
    utter.volume = 1.0;
    if (onEnd) utter.onend = onEnd;
    // Chrome bug: speechSynthesis can get stuck, resume it
    window.speechSynthesis.speak(utter);
    // Workaround for Chrome pausing long utterances
    this._keepAlive();
  }

  _keepAlive() {
    if (this._keepAliveTimer) clearInterval(this._keepAliveTimer);
    this._keepAliveTimer = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(this._keepAliveTimer);
        this._keepAliveTimer = null;
      } else {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 5000);
  }

  stopSpeak() {
    if (this.ttsSupported) window.speechSynthesis.cancel();
    if (this._keepAliveTimer) {
      clearInterval(this._keepAliveTimer);
      this._keepAliveTimer = null;
    }
  }

  listen(onResult, onError, onInterim) {
    if (!this.sttSupported) {
      if (onError) onError('STT not supported');
      return;
    }
    this.stopListen();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this._recognition = new SpeechRecognition();
    this._recognition.lang = QUIZ_CONFIG.sttLang;
    this._recognition.interimResults = true; // 실시간 결과 활성화
    this._recognition.maxAlternatives = 10;
    this._recognition.continuous = false;

    let gotResult = false;

    this._recognition.onresult = (event) => {
      // Interim results (실시간)
      for (let i = 0; i < event.results.length; i++) {
        if (!event.results[i].isFinal && onInterim) {
          const interim = event.results[i][0].transcript.toLowerCase().trim();
          onInterim(interim);
        }
      }

      // Final results (최종)
      if (event.results[event.results.length - 1].isFinal) {
        gotResult = true;
        this._clearSttTimeout();
        const results = [];
        for (let i = 0; i < event.results.length; i++) {
          for (let j = 0; j < event.results[i].length; j++) {
            results.push(event.results[i][j].transcript.toLowerCase().trim());
          }
        }
        if (onResult) onResult(results);
      }
    };

    this._recognition.onerror = (event) => {
      this._clearSttTimeout();
      // 'no-speech' and 'aborted' are common non-critical errors
      if (event.error === 'no-speech' || event.error === 'aborted') {
        if (onError) onError('no-speech');
      } else {
        if (onError) onError(event.error);
      }
    };

    this._recognition.onend = () => {
      this._clearSttTimeout();
      this._recognition = null;
      // If ended without result and no error, treat as no-speech
      if (!gotResult && onError) {
        onError('no-speech');
      }
    };

    try {
      this._recognition.start();
    } catch (e) {
      if (onError) onError('start-failed');
      return;
    }

    // Auto-timeout after 7 seconds of no result
    this._sttTimeout = setTimeout(() => {
      if (this._recognition && !gotResult) {
        try { this._recognition.stop(); } catch (e) { /* ignore */ }
      }
    }, 7000);
  }

  _clearSttTimeout() {
    if (this._sttTimeout) {
      clearTimeout(this._sttTimeout);
      this._sttTimeout = null;
    }
  }

  stopListen() {
    this._clearSttTimeout();
    if (this._recognition) {
      try { this._recognition.stop(); } catch (e) { /* ignore */ }
      this._recognition = null;
    }
  }

  // Fuzzy match: check if any recognized text matches accepted pronunciations
  fuzzyMatch(recognizedTexts, acceptedList) {
    for (const recognized of recognizedTexts) {
      const clean = recognized.toLowerCase().replace(/[^a-z\s]/g, '').trim();
      for (const accepted of acceptedList) {
        const cleanAccepted = accepted.toLowerCase().trim();
        // Exact match
        if (clean === cleanAccepted) return true;
        // Contains match (for short words in longer phrases)
        if (clean.includes(cleanAccepted) || cleanAccepted.includes(clean)) return true;
        // Levenshtein-like: allow 1~2 char difference for short words
        if (this._similarEnough(clean, cleanAccepted)) return true;
      }
    }
    return false;
  }

  _similarEnough(a, b) {
    if (a.length < 2 || b.length < 2) return a === b;
    const maxDist = a.length <= 4 ? 1 : 2;
    return this._levenshtein(a, b) <= maxDist;
  }

  _levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  }
}

// ============================================
// QUIZ MANAGER
// ============================================
class QuizManager {
  constructor() {
    this.speech = new SpeechManager();
    this.currentQuiz = null;
    this.attempts = 0;
    this.quizIndex = 0;
    this.levelIndex = 0;
    this.quizDifficulty = 3; // 기본 난이도 (1~10)
    this.onComplete = null;
    this.isActive = false;

    // 랜덤 퀴즈 생성용 - 세션 내 중복 방지
    this._usedQuizIds = new Set();

    // 키보드 네비게이션
    this._selectedChoiceIndex = 0;
    this._choiceButtons = [];

    // DOM 요소 캐시
    this.screen = document.getElementById('quiz-screen');
    this.emojiEl = document.getElementById('quiz-emoji');
    this.questionEl = document.getElementById('quiz-question');
    this.choicesEl = document.getElementById('quiz-choices');
    this.micBtn = document.getElementById('quiz-mic-btn');
    this.hintEl = document.getElementById('quiz-hint');
    this.feedbackEl = document.getElementById('quiz-feedback');

    this._setupMicButton();
    this._setupKeyboard();
  }

  _setupMicButton() {
    if (!this.micBtn) return;
    this.micBtn.addEventListener('click', () => {
      if (!this.currentQuiz || !this.isActive) return;
      this._startListening();
    });
  }

  _setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (!this.isActive || !this.currentQuiz) return;

      const choiceCount = this._choiceButtons.length;
      if (choiceCount === 0) return;

      if (e.code === 'ArrowDown' || e.code === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        this._selectedChoiceIndex = (this._selectedChoiceIndex + 1) % choiceCount;
        this._updateChoiceFocus();
        soundManager.playMenuMove();
      } else if (e.code === 'ArrowUp' || e.code === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        this._selectedChoiceIndex = (this._selectedChoiceIndex - 1 + choiceCount) % choiceCount;
        this._updateChoiceFocus();
        soundManager.playMenuMove();
      } else if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (this._choiceButtons[this._selectedChoiceIndex] && !this._choiceButtons[this._selectedChoiceIndex].disabled) {
          this._checkAnswer(this._selectedChoiceIndex);
        }
      }
    });
  }

  _updateChoiceFocus() {
    this._choiceButtons.forEach((btn, idx) => {
      if (idx === this._selectedChoiceIndex) {
        btn.classList.add('quiz-choice-focused');
      } else {
        btn.classList.remove('quiz-choice-focused');
      }
    });
  }

  resetForLevel(levelIndex) {
    this.levelIndex = levelIndex;
    this.quizIndex = 0;
    this.currentQuiz = null;
    this.attempts = 0;
    this.isActive = false;
    this._selectedChoiceIndex = 0;
    this._choiceButtons = [];
    this.speech.stopSpeak();
    this.speech.stopListen();
  }

  setQuizDifficulty(level) {
    this.quizDifficulty = Math.max(1, Math.min(10, level));
  }

  triggerQuiz(checkpointIndex, onComplete) {
    // 랜덤 퀴즈 생성 (난이도별 단어 뱅크에서 선택)
    const quiz = this._generateQuiz();
    if (!quiz) {
      if (onComplete) onComplete();
      return false;
    }

    this.currentQuiz = quiz;
    this.attempts = 0;
    this.onComplete = onComplete;
    this.isActive = true;
    this._selectedChoiceIndex = 0;

    this._renderQuiz();
    return true;
  }

  _generateQuiz() {
    const tier = this.quizDifficulty;
    const bank = QUIZ_WORD_BANK[tier];
    const settings = QUIZ_CONFIG.difficultySettings[tier];
    if (!bank || bank.length === 0 || !settings) return null;

    // 미사용 엔트리 선택 (중복 방지)
    let available = bank.filter(e => !this._usedQuizIds.has(e.english));
    if (available.length === 0) {
      // 모두 사용했으면 리셋
      this._usedQuizIds.clear();
      available = bank;
    }
    const entry = available[Math.floor(Math.random() * available.length)];
    this._usedQuizIds.add(entry.english);

    // 난이도별 퀴즈 타입 가져오기
    const quizType = settings.type;

    // 선택지 배열 생성 (난이도별 개수 조절)
    const choiceCount = settings.choiceCount;
    let choices, correctIndex;

    // 타입별 선택지 구성
    if (quizType === 'exact_repeat' || quizType === 'situation_kr' || quizType === 'situation_en') {
      // 영어 단어/문장 선택지
      choices = this._shuffleWithCorrect(entry.english, entry.wrongChoices_en, choiceCount - 1);
      correctIndex = choices.indexOf(entry.english);
    } else if (quizType === 'kr_to_en_speak') {
      // 영어 선택지만
      choices = this._shuffleWithCorrect(entry.english, entry.wrongChoices_en, choiceCount - 1);
      correctIndex = choices.indexOf(entry.english);
    }

    return {
      id: `dynamic_${tier}_${entry.english}`,
      type: quizType,
      english: entry.english,
      korean: entry.korean,
      emoji: entry.emoji,
      choices: choices,
      correctIndex: correctIndex,
      hint: entry.hint,
      acceptedPronunciations: entry.acceptedPronunciations,
      settings: settings, // 난이도별 설정 포함
    };
  }

  _shuffleWithCorrect(correct, wrongs, wrongCount) {
    // 정답 1개 + 오답 n개를 합쳐서 셔플
    const selectedWrongs = wrongs.slice(0, Math.min(wrongCount, wrongs.length));
    const all = [correct, ...selectedWrongs];
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }

  _renderQuiz() {
    const quiz = this.currentQuiz;
    if (!quiz || !this.screen) return;

    const settings = quiz.settings;
    if (!settings) return;

    // 이모지
    if (this.emojiEl) this.emojiEl.textContent = quiz.emoji;

    // 질문 텍스트 (타입별 렌더링)
    if (this.questionEl) {
      let questionHtml = '';

      if (quiz.type === 'exact_repeat') {
        // 따라하기: 영어 텍스트를 단어별로 span으로 감싸기 (실시간 색상 변경용)
        const words = quiz.english.split(/\s+/);
        const wordsHtml = words.map((word, idx) =>
          `<span class="quiz-word" data-word-index="${idx}">${word}</span>`
        ).join(' ');
        questionHtml = `잘 듣고 따라 말해보세요!<br><span class="quiz-english">${wordsHtml}</span>`;
        if (settings.showKoreanInQuestion) {
          questionHtml += `<br><span class="quiz-korean">(${quiz.korean})</span>`;
        }
      } else if (quiz.type === 'kr_to_en_speak') {
        // 한글→영어: 한글만 표시
        questionHtml = `<span class="quiz-korean">${quiz.korean}</span><br>영어로 뭐라고 할까요?`;
      } else if (quiz.type === 'situation_kr') {
        // 한글 상황 설명
        questionHtml = `<div class="quiz-situation">${quiz.korean}</div>`;
        if (settings.showEnglishInQuestion) {
          questionHtml += `<br><span class="quiz-english-small">예: ${quiz.english}</span>`;
        }
        questionHtml += `<br><span class="quiz-prompt">이 상황에 맞는 영어 표현을 말해보세요!</span>`;
      } else if (quiz.type === 'situation_en') {
        // 영어 상황 설명
        questionHtml = `<div class="quiz-situation-en">${quiz.english}</div>`;
        if (settings.showKoreanInQuestion) {
          questionHtml += `<br><span class="quiz-korean-small">(${quiz.korean})</span>`;
        }
        questionHtml += `<br><span class="quiz-prompt">What would you say?</span>`;
      }

      this.questionEl.innerHTML = questionHtml;
    }

    // 인식된 텍스트 표시 영역 초기화
    this._recognizedTextEl = this.questionEl.querySelector('.recognized-text');
    if (!this._recognizedTextEl && settings.showRecognizedText) {
      this._recognizedTextEl = document.createElement('div');
      this._recognizedTextEl.className = 'recognized-text';
      this.questionEl.appendChild(this._recognizedTextEl);
    }

    // 선택지 버튼 생성
    this._choiceButtons = [];
    if (this.choicesEl) {
      this.choicesEl.innerHTML = '';
      quiz.choices.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-choice-btn';

        // 선택지에 한글 표시 여부
        if (settings.showKoreanInChoices && idx < quiz.choices.length) {
          // 영어만 있는 경우, 해당하는 한글 찾기 (정답일 경우)
          if (idx === quiz.correctIndex && quiz.korean) {
            btn.innerHTML = `<span class="choice-en">${choice}</span><br><span class="choice-kr">(${quiz.korean})</span>`;
          } else {
            btn.textContent = choice;
          }
        } else {
          btn.textContent = choice;
        }

        btn.addEventListener('click', () => this._checkAnswer(idx));
        this.choicesEl.appendChild(btn);
        this._choiceButtons.push(btn);
      });
      // 첫 번째 선택지에 포커스
      this._selectedChoiceIndex = 0;
      this._updateChoiceFocus();
    }

    // 마이크 버튼: STT 지원 시만 표시
    if (this.micBtn) {
      const showMic = this.speech.sttSupported;
      this.micBtn.style.display = showMic ? 'flex' : 'none';
      this.micBtn.textContent = '🎤 말하기';
      this.micBtn.classList.remove('listening');
    }

    // 힌트/피드백 초기화
    if (this.hintEl) { this.hintEl.textContent = ''; this.hintEl.style.display = 'none'; }
    if (this.feedbackEl) { this.feedbackEl.textContent = ''; this.feedbackEl.className = 'quiz-feedback'; }

    // TTS 설정 (난이도별)
    const ttsSettings = QUIZ_CONFIG.ttsSettings[this.quizDifficulty] || { rate: 0.85, pitch: 1.1 };

    // TTS로 영어 읽어주기 → 자동으로 듣기 시작
    const autoListen = this.speech.sttSupported;
    this.speech.speak(quiz.english, () => {
      if (autoListen && this.isActive) {
        // TTS 끝나고 잠시 후 자동 듣기 시작
        setTimeout(() => {
          if (this.isActive) this._startListening();
        }, 300);
      }
    }, ttsSettings.rate, ttsSettings.pitch);
  }

  _startListening() {
    if (!this.isActive || !this.currentQuiz) return;

    if (this.micBtn) {
      this.micBtn.classList.add('listening');
      this.micBtn.textContent = '🎤 듣고 있어요...';
    }

    this.speech.listen(
      // Final result callback
      (results) => {
        if (this.micBtn) {
          this.micBtn.classList.remove('listening');
          this.micBtn.textContent = '🎤 말하기';
        }

        const isCorrect = this.speech.fuzzyMatch(results, this.currentQuiz.acceptedPronunciations);
        if (isCorrect) {
          this._onCorrect();
        } else {
          this._onIncorrect();
          // STT가 인식은 했지만 틀린 경우 피드백에 인식 결과 표시
          if (this.feedbackEl && results.length > 0) {
            const heard = results[0];
            this.feedbackEl.textContent = `"${heard}" 라고 들렸어요. 다시 해볼까요? 💪`;
            this.feedbackEl.className = 'quiz-feedback quiz-feedback-wrong';
          }
        }
      },
      // Error callback
      (error) => {
        if (this.micBtn) {
          this.micBtn.classList.remove('listening');
          this.micBtn.textContent = '🎤 다시 말하기';
        }
        if (this.feedbackEl) {
          if (error === 'no-speech') {
            this.feedbackEl.textContent = '소리가 안 들렸어요. 🎤 버튼을 누르고 말해보세요!';
          } else if (error === 'not-allowed') {
            this.feedbackEl.textContent = '마이크 사용을 허용해주세요! 아니면 버튼을 눌러 답해보세요.';
          } else {
            this.feedbackEl.textContent = '다시 한번 시도해보세요! 버튼으로도 답할 수 있어요.';
          }
          this.feedbackEl.className = 'quiz-feedback quiz-feedback-hint';
        }
      },
      // Interim result callback (실시간 피드백)
      (interimText) => {
        this._updateRecognitionProgress(interimText);
      }
    );
  }

  _updateRecognitionProgress(interimText) {
    if (!this.currentQuiz || !this.questionEl) return;

    const settings = this.currentQuiz.settings;
    if (!settings) return;

    // exact_repeat 타입: 실시간 색상 피드백
    if (settings.useRealtimeColorFeedback && this.currentQuiz.type === 'exact_repeat') {
      // 정답 텍스트의 단어들
      const correctWords = this.currentQuiz.english.toLowerCase().split(/\s+/);

      // 인식된 텍스트의 단어들
      const recognizedWords = interimText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);

      // 각 단어 span 요소들 가져오기
      const wordSpans = this.questionEl.querySelectorAll('.quiz-word');

      // 단어별로 매칭 확인 및 색상 업데이트
      wordSpans.forEach((span, idx) => {
        if (idx < recognizedWords.length && idx < correctWords.length) {
          const recognized = recognizedWords[idx].trim();
          const correct = correctWords[idx].toLowerCase().replace(/[^\w]/g, '');

          // 단어가 매칭되면 'recognized' 클래스 추가
          if (recognized && correct.startsWith(recognized)) {
            span.classList.add('recognized');
          } else {
            span.classList.remove('recognized');
          }
        } else {
          span.classList.remove('recognized');
        }
      });
    }
    // 다른 타입: 인식된 텍스트 표시
    else if (settings.showRecognizedText && this._recognizedTextEl) {
      this._recognizedTextEl.textContent = `말하는 중: "${interimText}"`;
      this._recognizedTextEl.style.display = 'block';
    }
  }

  _checkAnswer(selectedIndex) {
    if (!this.isActive || !this.currentQuiz) return;

    if (selectedIndex === this.currentQuiz.correctIndex) {
      this._onCorrect();
    } else {
      this._onIncorrect();
    }
  }

  _onCorrect() {
    this.isActive = false;
    this.speech.stopListen();

    const settings = this.currentQuiz.settings;

    // 정답 선택지 하이라이트 + 정답 후 한글 표시
    this._choiceButtons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === this.currentQuiz.correctIndex) {
        btn.classList.add('quiz-choice-correct');

        // 정답 후 한글 번역 표시
        if (settings && settings.showKoreanAfterCorrect && this.currentQuiz.korean) {
          const currentText = btn.textContent || btn.innerText;
          btn.innerHTML = `<span class="choice-en">${currentText}</span><br><span class="choice-kr choice-kr-revealed">(${this.currentQuiz.korean})</span>`;
        }
      }
    });

    // 피드백
    const praises = ['잘했어요! 🎉', '정답이에요! ⭐', '대단해요! 🌟', '멋져요! 🏆'];
    const praise = praises[Math.floor(Math.random() * praises.length)];

    if (this.feedbackEl) {
      this.feedbackEl.textContent = praise;
      this.feedbackEl.className = 'quiz-feedback quiz-feedback-correct';
    }

    soundManager.playQuizCorrect();

    this.speech.speak('Great job!', () => {
      setTimeout(() => {
        if (this.onComplete) this.onComplete();
      }, QUIZ_CONFIG.correctDelay);
    });
  }

  _onIncorrect() {
    this.attempts++;
    soundManager.playQuizWrong();

    const settings = this.currentQuiz.settings;
    const maxAttempts = settings ? settings.maxAttempts : 3;
    const hintAfterAttempts = settings ? settings.hintAfterAttempts : 2;

    // 최대 시도 초과 → 정답 보여주고 통과
    if (this.attempts >= maxAttempts) {
      if (this.feedbackEl) {
        this.feedbackEl.textContent = `정답은 "${this.currentQuiz.choices[this.currentQuiz.correctIndex]}" 이에요!`;
        this.feedbackEl.className = 'quiz-feedback quiz-feedback-answer';
      }

      this._choiceButtons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === this.currentQuiz.correctIndex) {
          btn.classList.add('quiz-choice-correct');

          // 정답 공개 시 한글 번역 표시
          if (settings && settings.showKoreanAfterCorrect && this.currentQuiz.korean) {
            const currentText = btn.textContent || btn.innerText;
            btn.innerHTML = `<span class="choice-en">${currentText}</span><br><span class="choice-kr choice-kr-revealed">(${this.currentQuiz.korean})</span>`;
          }
        }
      });

      this.speech.speak(this.currentQuiz.english, () => {
        setTimeout(() => {
          this.isActive = false;
          if (this.onComplete) this.onComplete();
        }, QUIZ_CONFIG.correctDelay);
      });
      return;
    }

    // 격려 메시지
    const encouragements = ['다시 해볼까요? 💪', '한번 더! 😊', '괜찮아요, 다시! 🌈'];
    const msg = encouragements[Math.floor(Math.random() * encouragements.length)];

    if (this.feedbackEl) {
      this.feedbackEl.textContent = msg;
      this.feedbackEl.className = 'quiz-feedback quiz-feedback-wrong';
    }

    // 힌트 표시 (일정 횟수 이후)
    if (this.attempts >= hintAfterAttempts && this.hintEl && this.currentQuiz.hint) {
      this.hintEl.textContent = '💡 힌트: ' + this.currentQuiz.hint;
      this.hintEl.style.display = 'block';
    }

    // TTS로 다시 읽어주기
    setTimeout(() => {
      const ttsSettings = QUIZ_CONFIG.ttsSettings[this.quizDifficulty] || { rate: 0.85, pitch: 1.1 };
      this.speech.speak(this.currentQuiz.english, null, ttsSettings.rate, ttsSettings.pitch);
    }, QUIZ_CONFIG.wrongDelay);
  }
}
