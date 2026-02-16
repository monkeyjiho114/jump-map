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
    if (!bank || bank.length === 0) return null;

    // 미사용 엔트리 선택 (중복 방지)
    let available = bank.filter(e => !this._usedQuizIds.has(e.english));
    if (available.length === 0) {
      // 모두 사용했으면 리셋
      this._usedQuizIds.clear();
      available = bank;
    }
    const entry = available[Math.floor(Math.random() * available.length)];
    this._usedQuizIds.add(entry.english);

    // 난이도별 퀴즈 유형 확률 선택
    const dist = QUIZ_CONFIG.typeDistribution[tier];
    const rand = Math.random();
    let cumulative = 0;
    let selectedType = 'word_en_to_kr';
    for (const [type, prob] of Object.entries(dist)) {
      cumulative += prob;
      if (rand <= cumulative) {
        selectedType = type;
        break;
      }
    }

    // STT 미지원 시 listen_and_repeat → listen_and_choose
    if (selectedType === 'listen_and_repeat' && !this.speech.sttSupported) {
      selectedType = 'listen_and_choose';
    }

    // 선택지 배열 생성 (정답 + 오답 3개 랜덤 배치)
    let choices, correctIndex;
    if (selectedType === 'word_en_to_kr') {
      choices = this._shuffleWithCorrect(entry.korean, entry.wrongChoices_kr);
      correctIndex = choices.indexOf(entry.korean);
    } else if (selectedType === 'word_kr_to_en') {
      choices = this._shuffleWithCorrect(entry.english, entry.wrongChoices_en);
      correctIndex = choices.indexOf(entry.english);
    } else if (selectedType === 'listen_and_choose') {
      const correctWithEmoji = entry.emoji + ' ' + entry.english;
      choices = this._shuffleWithCorrect(correctWithEmoji, entry.wrongChoices_en);
      correctIndex = choices.indexOf(correctWithEmoji);
    } else { // listen_and_repeat
      choices = this._shuffleWithCorrect(entry.english, entry.wrongChoices_en);
      correctIndex = choices.indexOf(entry.english);
    }

    return {
      id: `dynamic_${tier}_${entry.english}`,
      type: selectedType,
      english: entry.english,
      korean: entry.korean,
      emoji: entry.emoji,
      choices: choices,
      correctIndex: correctIndex,
      hint: entry.hint,
      acceptedPronunciations: entry.acceptedPronunciations,
    };
  }

  _shuffleWithCorrect(correct, wrongs) {
    // 정답 1개 + 오답 3개를 합쳐서 셔플
    const all = [correct, ...wrongs.slice(0, 3)];
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }

  _renderQuiz() {
    const quiz = this.currentQuiz;
    if (!quiz || !this.screen) return;

    // 이모지
    if (this.emojiEl) this.emojiEl.textContent = quiz.emoji;

    // 질문 텍스트
    if (this.questionEl) {
      switch (quiz.type) {
        case 'word_en_to_kr':
          this.questionEl.innerHTML = `<span class="quiz-english">${quiz.english}</span><br>이것은 무슨 뜻일까요?`;
          break;
        case 'word_kr_to_en':
          this.questionEl.innerHTML = `<span class="quiz-korean">${quiz.korean}</span><br>영어로 뭐라고 할까요?`;
          break;
        case 'listen_and_repeat':
          // 영어 텍스트를 단어별로 span으로 감싸기 (실시간 색상 변경용)
          const words = quiz.english.split(/\s+/);
          const wordsHtml = words.map((word, idx) =>
            `<span class="quiz-word" data-word-index="${idx}">${word}</span>`
          ).join(' ');
          this.questionEl.innerHTML = `잘 듣고 따라 말해보세요!<br><span class="quiz-english">${wordsHtml}</span><br><span class="quiz-korean">(${quiz.korean})</span>`;
          break;
        case 'listen_and_choose':
          this.questionEl.innerHTML = `잘 듣고 맞는 것을 골라보세요!`;
          break;
      }
    }

    // 선택지 버튼 생성
    this._choiceButtons = [];
    if (this.choicesEl) {
      this.choicesEl.innerHTML = '';
      quiz.choices.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-choice-btn';
        btn.textContent = choice;
        btn.addEventListener('click', () => this._checkAnswer(idx));
        this.choicesEl.appendChild(btn);
        this._choiceButtons.push(btn);
      });
      // 첫 번째 선택지에 포커스
      this._selectedChoiceIndex = 0;
      this._updateChoiceFocus();
    }

    // 마이크 버튼: listen_and_repeat 타입 + STT 지원 시만 표시
    if (this.micBtn) {
      const showMic = (quiz.type === 'listen_and_repeat') && this.speech.sttSupported;
      this.micBtn.style.display = showMic ? 'flex' : 'none';
      this.micBtn.textContent = '🎤 말하기';
      this.micBtn.classList.remove('listening');
    }

    // 힌트/피드백 초기화
    if (this.hintEl) { this.hintEl.textContent = ''; this.hintEl.style.display = 'none'; }
    if (this.feedbackEl) { this.feedbackEl.textContent = ''; this.feedbackEl.className = 'quiz-feedback'; }

    // TTS 설정 (난이도별)
    const ttsSettings = QUIZ_CONFIG.ttsSettings[this.quizDifficulty] || { rate: 0.85, pitch: 1.1 };

    // TTS로 영어 읽어주기 → listen_and_repeat이면 TTS 끝난 후 자동으로 듣기 시작
    const autoListen = (quiz.type === 'listen_and_repeat') && this.speech.sttSupported;
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

    // 정답 선택지 하이라이트
    this._choiceButtons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === this.currentQuiz.correctIndex) {
        btn.classList.add('quiz-choice-correct');
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

    // 최대 시도 초과 → 정답 보여주고 통과
    if (this.attempts >= QUIZ_CONFIG.maxAttempts) {
      if (this.feedbackEl) {
        this.feedbackEl.textContent = `정답은 "${this.currentQuiz.choices[this.currentQuiz.correctIndex]}" 이에요!`;
        this.feedbackEl.className = 'quiz-feedback quiz-feedback-answer';
      }

      this._choiceButtons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === this.currentQuiz.correctIndex) {
          btn.classList.add('quiz-choice-correct');
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
    if (this.attempts >= QUIZ_CONFIG.hintAfterAttempts && this.hintEl) {
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
