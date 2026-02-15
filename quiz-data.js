// ============================================
// QUIZ DATA - 영어 교육 콘텐츠
// ============================================
// 콘텐츠 확장: QUIZ_DATA.levels[n].quizzes 배열에 객체를 추가하면 됨
// 퀴즈 유형:
//   word_en_to_kr   — 영어 단어 보고 한국어 뜻 고르기
//   word_kr_to_en   — 한국어 보고 영어 단어 고르기
//   listen_and_repeat — TTS로 듣고 따라 말하기 (STT)
//   listen_and_choose — TTS로 듣고 맞는 그림/단어 고르기

const QUIZ_CONFIG = {
  maxAttempts: 3,         // 최대 시도 횟수 (초과 시 자동 통과)
  hintAfterAttempts: 2,   // 힌트 표시 시점
  ttsRate: 0.85,          // TTS 속도 (어린이용 느리게)
  ttsPitch: 1.1,          // TTS 피치
  ttsLang: 'en-US',       // TTS 언어
  sttLang: 'en-US',       // STT 언어
  correctDelay: 1500,     // 정답 후 게임 복귀 딜레이 (ms)
  wrongDelay: 1000,       // 오답 후 재시도 딜레이 (ms)
};

const QUIZ_DATA = {
  levels: [
    // ─── 스테이지 1: 기본 단어 ───
    {
      quizzes: [
        {
          id: 'l1_q1',
          type: 'word_en_to_kr',
          english: 'Apple',
          korean: '사과',
          emoji: '🍎',
          choices: ['사과', '바나나', '포도', '딸기'],
          correctIndex: 0,
          hint: '빨간색 과일이에요!',
          acceptedPronunciations: ['apple', 'appel', 'aple'],
        },
        {
          id: 'l1_q2',
          type: 'listen_and_repeat',
          english: 'Hello',
          korean: '안녕하세요',
          emoji: '👋',
          choices: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
          correctIndex: 0,
          hint: '만날 때 하는 인사예요!',
          acceptedPronunciations: ['hello', 'helo', 'hullo'],
        },
      ]
    },
    // ─── 스테이지 2: 동물 & 인사 ───
    {
      quizzes: [
        {
          id: 'l2_q1',
          type: 'listen_and_choose',
          english: 'Cat',
          korean: '고양이',
          emoji: '🐱',
          choices: ['🐱 Cat', '🐶 Dog', '🐰 Rabbit', '🐻 Bear'],
          correctIndex: 0,
          hint: '야옹~ 하고 울어요!',
          acceptedPronunciations: ['cat', 'kat', 'caat'],
        },
        {
          id: 'l2_q2',
          type: 'word_kr_to_en',
          english: 'Dog',
          korean: '강아지',
          emoji: '🐶',
          choices: ['Dog', 'Cat', 'Bird', 'Fish'],
          correctIndex: 0,
          hint: '멍멍! 하고 짖어요!',
          acceptedPronunciations: ['dog', 'dawg', 'dog'],
        },
        {
          id: 'l2_q3',
          type: 'listen_and_repeat',
          english: 'Thank you',
          korean: '감사합니다',
          emoji: '🙏',
          choices: ['Thank you', 'Sorry', 'Hello', 'Goodbye'],
          correctIndex: 0,
          hint: '고마울 때 하는 말이에요!',
          acceptedPronunciations: ['thank you', 'thankyou', 'thank u', 'thenk you'],
        },
      ]
    },
    // ─── 스테이지 3: 색깔 & 숫자 ───
    {
      quizzes: [
        {
          id: 'l3_q1',
          type: 'word_en_to_kr',
          english: 'Red',
          korean: '빨간색',
          emoji: '🔴',
          choices: ['빨간색', '파란색', '노란색', '초록색'],
          correctIndex: 0,
          hint: '사과 색깔이에요!',
          acceptedPronunciations: ['red', 'rad'],
        },
        {
          id: 'l3_q2',
          type: 'listen_and_choose',
          english: 'Blue',
          korean: '파란색',
          emoji: '🔵',
          choices: ['🔵 Blue', '🔴 Red', '🟡 Yellow', '🟢 Green'],
          correctIndex: 0,
          hint: '하늘 색깔이에요!',
          acceptedPronunciations: ['blue', 'bloo', 'bleu'],
        },
        {
          id: 'l3_q3',
          type: 'listen_and_repeat',
          english: 'I love you',
          korean: '사랑해요',
          emoji: '❤️',
          choices: ['I love you', 'I like you', 'I miss you', 'I need you'],
          correctIndex: 0,
          hint: '하트 ❤️ 가 생각나는 말이에요!',
          acceptedPronunciations: ['i love you', 'i luv you', 'i love u', 'i luv u'],
        },
      ]
    },
  ]
};
