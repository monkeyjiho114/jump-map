// 퀴즈 티어 9: 영어 상황 → 영어 응답 중급 (선택지 한글 포함)
// 조금 더 복잡한 영어 상황에 맞는 적절한 응답을 영어로 말하기

const QUIZ_TIER_9 = [
  {
    english: "Your friend looks sad because they lost their favorite toy.",
    korean: "친구가 좋아하는 장난감을 잃어버려서 슬퍼 보입니다.",
    correctAnswer_en: "Don't worry, we'll find it",
    correctAnswer_kr: "걱정 마, 우리가 찾을 거야",
    wrongChoices_en: ["Congratulations", "Thank you so much", "See you later"],
    wrongChoices_kr: ["축하해", "정말 고마워", "나중에 봐"],
    emoji: "😢",
    hint: "걱정하지 말라고 위로해주세요!",
    acceptedPronunciations: ["don't worry we'll find it", "dont worry well find it", "do not worry we will find it"]
  },
  {
    english: "Someone asks for directions but you don't know the way.",
    korean: "누군가 길을 물어보는데 당신도 모릅니다.",
    correctAnswer_en: "Sorry, I don't know",
    correctAnswer_kr: "미안해요, 저도 몰라요",
    wrongChoices_en: ["You're welcome", "That sounds fun", "Good job"],
    wrongChoices_kr: ["천만에요", "재미있겠다", "잘했어"],
    emoji: "🗺️",
    hint: "모른다고 솔직하게 말하세요!",
    acceptedPronunciations: ["sorry i don't know", "sorry i dont know", "i'm sorry i don't know", "sorry i do not know"]
  },
  {
    english: "Your classmate asks if you want to study together for the test.",
    korean: "반 친구가 시험 때문에 같이 공부하자고 물어봅니다.",
    correctAnswer_en: "That's a great idea",
    correctAnswer_kr: "정말 좋은 생각이야",
    wrongChoices_en: ["I'm sorry", "Excuse me", "Goodbye"],
    wrongChoices_kr: ["미안해", "실례해", "안녕"],
    emoji: "📖",
    hint: "좋은 생각이라고 답하세요!",
    acceptedPronunciations: ["that's a great idea", "thats a great idea", "that is a great idea", "great idea"]
  },
  {
    english: "You're at a restaurant and the waiter asks what you'd like to order.",
    korean: "식당에 있는데 웨이터가 주문할 것을 물어봅니다.",
    correctAnswer_en: "I'd like a pizza please",
    correctAnswer_kr: "피자 주세요",
    wrongChoices_en: ["Thank you very much", "I'm sorry", "See you tomorrow"],
    wrongChoices_kr: ["정말 감사합니다", "미안해요", "내일 봐"],
    emoji: "🍕",
    hint: "피자를 주문하세요!",
    acceptedPronunciations: ["i'd like a pizza please", "id like a pizza please", "i would like a pizza please"]
  },
  {
    english: "Your teacher announces a surprise field trip tomorrow.",
    korean: "선생님이 내일 깜짝 현장학습이 있다고 발표합니다.",
    correctAnswer_en: "That's so exciting",
    correctAnswer_kr: "정말 신나요",
    wrongChoices_en: ["I'm sorry", "You're welcome", "Excuse me"],
    wrongChoices_kr: ["미안해요", "천만에요", "실례해요"],
    emoji: "🚌",
    hint: "신난다고 표현하세요!",
    acceptedPronunciations: ["that's so exciting", "thats so exciting", "that is so exciting", "so exciting"]
  },
  {
    english: "A friend offers to help you carry your heavy books.",
    korean: "친구가 무거운 책들을 들어주겠다고 제안합니다.",
    correctAnswer_en: "That would be helpful",
    correctAnswer_kr: "도움이 될 거야",
    wrongChoices_en: ["I'm sorry", "Goodbye", "Nice to meet you"],
    wrongChoices_kr: ["미안해", "안녕", "만나서 반가워"],
    emoji: "📚",
    hint: "도움이 될 거라고 답하세요!",
    acceptedPronunciations: ["that would be helpful", "that'd be helpful", "thatd be helpful"]
  },
  {
    english: "Someone asks if you're enjoying the party.",
    korean: "누군가 파티를 즐기고 있냐고 물어봅니다.",
    correctAnswer_en: "Yes, I'm having fun",
    correctAnswer_kr: "네, 재미있어요",
    wrongChoices_en: ["I'm sorry", "Excuse me", "Thank you"],
    wrongChoices_kr: ["미안해요", "실례해요", "감사합니다"],
    emoji: "🎉",
    hint: "재미있다고 답하세요!",
    acceptedPronunciations: ["yes i'm having fun", "yes im having fun", "yes i am having fun", "yeah im having fun"]
  },
  {
    english: "Your mom asks if you've finished your homework.",
    korean: "엄마가 숙제를 다 했는지 물어봅니다.",
    correctAnswer_en: "Not yet, I'm working on it",
    correctAnswer_kr: "아직이요, 하고 있어요",
    wrongChoices_en: ["Thank you", "You're welcome", "Goodbye"],
    wrongChoices_kr: ["감사합니다", "천만에요", "안녕"],
    emoji: "✍️",
    hint: "아직이라고 솔직하게 답하세요!",
    acceptedPronunciations: ["not yet i'm working on it", "not yet im working on it", "not yet working on it"]
  },
  {
    english: "A new student arrives and introduces themselves to the class.",
    korean: "새로운 학생이 와서 반에 자기소개를 합니다.",
    correctAnswer_en: "Nice to meet you",
    correctAnswer_kr: "만나서 반가워",
    wrongChoices_en: ["I'm sorry", "Excuse me", "Goodbye"],
    wrongChoices_kr: ["미안해", "실례해", "안녕"],
    emoji: "👋",
    hint: "만나서 반갑다고 인사하세요!",
    acceptedPronunciations: ["nice to meet you", "pleased to meet you", "good to meet you"]
  },
  {
    english: "Your friend suggests watching a movie but you've already seen it.",
    korean: "친구가 영화 보자고 하는데 당신은 이미 봤습니다.",
    correctAnswer_en: "I've already seen it",
    correctAnswer_kr: "나 이미 봤어",
    wrongChoices_en: ["That sounds fun", "Thank you", "You're welcome"],
    wrongChoices_kr: ["재미있겠다", "고마워", "천만에"],
    emoji: "🎬",
    hint: "이미 봤다고 답하세요!",
    acceptedPronunciations: ["i've already seen it", "ive already seen it", "i have already seen it", "already seen it"]
  }
];
