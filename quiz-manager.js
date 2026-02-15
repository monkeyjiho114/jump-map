// ============================================
// SPEECH MANAGER (TTS + STT)
// ============================================
class SpeechManager {
  constructor() {
    this.ttsSupported = 'speechSynthesis' in window;
    this.sttSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    this._recognition = null;
  }

  speak(text, onEnd) {
    if (!this.ttsSupported) {
      if (onEnd) onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = QUIZ_CONFIG.ttsLang;
    utter.rate = QUIZ_CONFIG.ttsRate;
    utter.pitch = QUIZ_CONFIG.ttsPitch;
    utter.volume = 1.0;
    if (onEnd) utter.onend = onEnd;
    window.speechSynthesis.speak(utter);
  }

  stopSpeak() {
    if (this.ttsSupported) window.speechSynthesis.cancel();
  }

  listen(onResult, onError) {
    if (!this.sttSupported) {
      if (onError) onError('STT not supported');
      return;
    }
    this.stopListen();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this._recognition = new SpeechRecognition();
    this._recognition.lang = QUIZ_CONFIG.sttLang;
    this._recognition.interimResults = false;
    this._recognition.maxAlternatives = 5;

    this._recognition.onresult = (event) => {
      const results = [];
      for (let i = 0; i < event.results[0].length; i++) {
        results.push(event.results[0][i].transcript.toLowerCase().trim());
      }
      if (onResult) onResult(results);
    };

    this._recognition.onerror = (event) => {
      if (onError) onError(event.error);
    };

    this._recognition.onend = () => {
      this._recognition = null;
    };

    this._recognition.start();
  }

  stopListen() {
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
        if (clean === accepted.toLowerCase()) return true;
        // Levenshtein-like: allow 1~2 char difference for short words
        if (this._similarEnough(clean, accepted.toLowerCase())) return true;
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
    this.quizIndex = 0;       // 현재 레벨에서 몇 번째 퀴즈인지
    this.levelIndex = 0;
    this.onComplete = null;   // 퀴즈 완료 시 콜백
    this.isActive = false;

    // DOM 요소 캐시
    this.screen = document.getElementById('quiz-screen');
    this.emojiEl = document.getElementById('quiz-emoji');
    this.questionEl = document.getElementById('quiz-question');
    this.choicesEl = document.getElementById('quiz-choices');
    this.micBtn = document.getElementById('quiz-mic-btn');
    this.hintEl = document.getElementById('quiz-hint');
    this.feedbackEl = document.getElementById('quiz-feedback');

    this._setupMicButton();
  }

  _setupMicButton() {
    if (!this.micBtn) return;
    this.micBtn.addEventListener('click', () => {
      if (!this.currentQuiz || !this.isActive) return;
      this._startListening();
    });
  }

  // 레벨 전환 시 초기화
  resetForLevel(levelIndex) {
    this.levelIndex = levelIndex;
    this.quizIndex = 0;
    this.currentQuiz = null;
    this.attempts = 0;
    this.isActive = false;
    this.speech.stopSpeak();
    this.speech.stopListen();
  }

  // 체크포인트 도달 시 퀴즈 트리거
  // checkpointIndex: 이 레벨에서 몇 번째 체크포인트인지 (0-based)
  // onComplete: 퀴즈 완료 시 호출될 콜백
  triggerQuiz(checkpointIndex, onComplete) {
    const levelData = QUIZ_DATA.levels[this.levelIndex % QUIZ_DATA.levels.length];
    if (!levelData || !levelData.quizzes) {
      if (onComplete) onComplete();
      return false;
    }

    const quiz = levelData.quizzes[checkpointIndex % levelData.quizzes.length];
    if (!quiz) {
      if (onComplete) onComplete();
      return false;
    }

    this.currentQuiz = quiz;
    this.attempts = 0;
    this.onComplete = onComplete;
    this.isActive = true;

    this._renderQuiz();
    return true;
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
          this.questionEl.innerHTML = `잘 듣고 따라 말해보세요!<br><span class="quiz-english">${quiz.english}</span>`;
          break;
        case 'listen_and_choose':
          this.questionEl.innerHTML = `잘 듣고 맞는 것을 골라보세요!`;
          break;
      }
    }

    // 선택지 버튼 생성
    if (this.choicesEl) {
      this.choicesEl.innerHTML = '';
      quiz.choices.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-choice-btn';
        btn.textContent = choice;
        btn.addEventListener('click', () => this._checkAnswer(idx));
        this.choicesEl.appendChild(btn);
      });
    }

    // 마이크 버튼: listen_and_repeat 타입 + STT 지원 시만 표시
    if (this.micBtn) {
      const showMic = (quiz.type === 'listen_and_repeat') && this.speech.sttSupported;
      this.micBtn.style.display = showMic ? 'flex' : 'none';
    }

    // 힌트/피드백 초기화
    if (this.hintEl) { this.hintEl.textContent = ''; this.hintEl.style.display = 'none'; }
    if (this.feedbackEl) { this.feedbackEl.textContent = ''; this.feedbackEl.className = 'quiz-feedback'; }

    // TTS로 영어 읽어주기
    this.speech.speak(quiz.english);
  }

  _startListening() {
    if (!this.isActive || !this.currentQuiz) return;

    if (this.micBtn) {
      this.micBtn.classList.add('listening');
      this.micBtn.textContent = '🎤 듣고 있어요...';
    }

    this.speech.listen(
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
        }
      },
      (error) => {
        if (this.micBtn) {
          this.micBtn.classList.remove('listening');
          this.micBtn.textContent = '🎤 말하기';
        }
        // STT 에러 시 선택지로 대답하도록 안내
        if (this.feedbackEl) {
          this.feedbackEl.textContent = '목소리가 잘 안 들렸어요. 버튼을 눌러보세요!';
          this.feedbackEl.className = 'quiz-feedback quiz-feedback-hint';
        }
      }
    );
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

    // 피드백
    const praises = ['잘했어요! 🎉', '정답이에요! ⭐', '대단해요! 🌟', '멋져요! 🏆'];
    const praise = praises[Math.floor(Math.random() * praises.length)];

    if (this.feedbackEl) {
      this.feedbackEl.textContent = praise;
      this.feedbackEl.className = 'quiz-feedback quiz-feedback-correct';
    }

    // 정답 효과음
    soundManager.playQuizCorrect();

    // TTS 칭찬
    this.speech.speak('Great job!', () => {
      // 딜레이 후 게임 복귀
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

      // 정답 선택지 하이라이트
      if (this.choicesEl) {
        const btns = this.choicesEl.querySelectorAll('.quiz-choice-btn');
        btns.forEach((btn, idx) => {
          btn.disabled = true;
          if (idx === this.currentQuiz.correctIndex) {
            btn.classList.add('quiz-choice-correct');
          }
        });
      }

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
      this.speech.speak(this.currentQuiz.english);
    }, QUIZ_CONFIG.wrongDelay);
  }
}
