// 퀴즈 티어 7: 한글 상황 + 영어 번역 → 영어 응답
// 상황에 맞는 적절한 응답을 영어로 말하기

const QUIZ_TIER_7 = [
  {
    english: "Your friend says: 'I passed my exam!'",
    korean: "친구가 말합니다: '나 시험 합격했어!'",
    correctAnswer_en: "Congratulations!",
    correctAnswer_kr: "축하해!",
    wrongChoices_en: ["I'm sorry", "Good luck", "See you later"],
    wrongChoices_kr: ["안됐다", "행운을 빌어", "나중에 봐"],
    emoji: "🎉",
    hint: "축하할 때 하는 말이에요!",
    acceptedPronunciations: ["congratulations", "congratulation", "congrats"]
  },
  {
    english: "Someone asks: 'How are you today?'",
    korean: "누군가 물어봅니다: '오늘 어때?'",
    correctAnswer_en: "I'm fine, thank you",
    correctAnswer_kr: "잘 지내, 고마워",
    wrongChoices_en: ["Yes, please", "You're welcome", "Goodbye"],
    wrongChoices_kr: ["네, 부탁해요", "천만에요", "안녕히 가세요"],
    emoji: "😊",
    hint: "기분이 좋을 때 하는 대답이에요!",
    acceptedPronunciations: ["i'm fine thank you", "im fine thank you", "fine thank you", "i am fine thank you"]
  },
  {
    english: "Your teacher says: 'See you tomorrow.'",
    korean: "선생님이 말합니다: '내일 봐.'",
    correctAnswer_en: "See you tomorrow",
    correctAnswer_kr: "내일 봐요",
    wrongChoices_en: ["Nice to meet you", "Thank you", "I'm sorry"],
    wrongChoices_kr: ["만나서 반가워요", "감사합니다", "죄송합니다"],
    emoji: "👋",
    hint: "작별 인사로 똑같이 답하면 돼요!",
    acceptedPronunciations: ["see you tomorrow", "c you tomorrow", "see u tomorrow"]
  },
  {
    english: "Someone says: 'Thank you very much!'",
    korean: "누군가 말합니다: '정말 고마워!'",
    correctAnswer_en: "You're welcome",
    correctAnswer_kr: "천만에요",
    wrongChoices_en: ["I'm sorry", "Excuse me", "Goodbye"],
    wrongChoices_kr: ["죄송해요", "실례합니다", "안녕히 가세요"],
    emoji: "🤗",
    hint: "고맙다는 말에 대한 답변이에요!",
    acceptedPronunciations: ["you're welcome", "your welcome", "youre welcome", "you are welcome"]
  },
  {
    english: "Your mom asks: 'Are you hungry?'",
    korean: "엄마가 물어봅니다: '배고프니?'",
    correctAnswer_en: "Yes, I am",
    correctAnswer_kr: "네, 배고파요",
    wrongChoices_en: ["No problem", "Thank you", "Goodbye"],
    wrongChoices_kr: ["괜찮아요", "감사합니다", "안녕히 가세요"],
    emoji: "🍽️",
    hint: "네, 그렇다고 답하면 돼요!",
    acceptedPronunciations: ["yes i am", "yes im", "yes i'm", "yeah i am"]
  },
  {
    english: "A friend says: 'I'm sorry I'm late.'",
    korean: "친구가 말합니다: '늦어서 미안해.'",
    correctAnswer_en: "That's okay",
    correctAnswer_kr: "괜찮아",
    wrongChoices_en: ["You're welcome", "Nice to meet you", "See you later"],
    wrongChoices_kr: ["천만에요", "만나서 반가워", "나중에 봐"],
    emoji: "🙂",
    hint: "괜찮다고 답해주세요!",
    acceptedPronunciations: ["that's okay", "thats okay", "that is okay", "its okay", "it's okay"]
  },
  {
    english: "Someone asks: 'What's your name?'",
    korean: "누군가 물어봅니다: '이름이 뭐예요?'",
    correctAnswer_en: "My name is Tom",
    correctAnswer_kr: "내 이름은 톰이야",
    wrongChoices_en: ["I'm fine", "Thank you", "Goodbye"],
    wrongChoices_kr: ["잘 지내", "고마워", "안녕"],
    emoji: "👤",
    hint: "자기 이름을 말하면 돼요!",
    acceptedPronunciations: ["my name is tom", "my name's tom", "i'm tom", "im tom"]
  },
  {
    english: "Teacher says: 'Good job!'",
    korean: "선생님이 말합니다: '잘했어!'",
    correctAnswer_en: "Thank you",
    correctAnswer_kr: "감사합니다",
    wrongChoices_en: ["I'm sorry", "Excuse me", "Help me"],
    wrongChoices_kr: ["죄송합니다", "실례합니다", "도와주세요"],
    emoji: "⭐",
    hint: "칭찬받았을 때 하는 말이에요!",
    acceptedPronunciations: ["thank you", "thanks", "thank u"]
  },
  {
    english: "Friend asks: 'Can you help me?'",
    korean: "친구가 물어봅니다: '도와줄 수 있어?'",
    correctAnswer_en: "Of course",
    correctAnswer_kr: "물론이지",
    wrongChoices_en: ["I'm sorry", "Goodbye", "No problem"],
    wrongChoices_kr: ["미안해", "안녕", "문제없어"],
    emoji: "🤝",
    hint: "물론이라고 긍정적으로 답하세요!",
    acceptedPronunciations: ["of course", "ofcourse", "sure", "yes"]
  },
  {
    english: "Mom says: 'Time for bed!'",
    korean: "엄마가 말합니다: '잘 시간이야!'",
    correctAnswer_en: "Good night",
    correctAnswer_kr: "잘 자요",
    wrongChoices_en: ["Good morning", "Good afternoon", "See you tomorrow"],
    wrongChoices_kr: ["좋은 아침", "좋은 오후", "내일 봐"],
    emoji: "🌙",
    hint: "잘 때 하는 인사말이에요!",
    acceptedPronunciations: ["good night", "goodnight", "nite", "night"]
  }
];
