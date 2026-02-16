// 퀴즈 티어 8: 영어 상황 → 영어 응답 (선택지 한글 포함)
// 영어로 제시된 상황에 맞는 적절한 응답을 영어로 말하기

const QUIZ_TIER_8 = [
  {
    english: "You accidentally stepped on someone's foot.",
    korean: "실수로 누군가의 발을 밟았습니다.",
    correctAnswer_en: "I'm sorry",
    correctAnswer_kr: "미안합니다",
    wrongChoices_en: ["Thank you", "You're welcome", "Goodbye"],
    wrongChoices_kr: ["고마워요", "천만에요", "안녕히 가세요"],
    emoji: "😅",
    hint: "실수했을 때 하는 말이에요!",
    acceptedPronunciations: ["i'm sorry", "im sorry", "i am sorry", "sorry"]
  },
  {
    english: "Your friend invites you to play soccer.",
    korean: "친구가 당신을 축구하자고 초대합니다.",
    correctAnswer_en: "That sounds fun",
    correctAnswer_kr: "재미있겠다",
    wrongChoices_en: ["I'm sorry", "Nice to meet you", "Help me please"],
    wrongChoices_kr: ["미안해", "만나서 반가워", "도와주세요"],
    emoji: "⚽",
    hint: "재미있을 것 같다고 답하세요!",
    acceptedPronunciations: ["that sounds fun", "sounds fun", "that sounds good", "sounds good"]
  },
  {
    english: "Someone holds the door open for you.",
    korean: "누군가 당신을 위해 문을 잡아줍니다.",
    correctAnswer_en: "Thank you",
    correctAnswer_kr: "고마워요",
    wrongChoices_en: ["I'm sorry", "Excuse me", "Goodbye"],
    wrongChoices_kr: ["미안해요", "실례합니다", "안녕히 가세요"],
    emoji: "🚪",
    hint: "친절한 행동에 감사를 표현하세요!",
    acceptedPronunciations: ["thank you", "thanks", "thank u"]
  },
  {
    english: "You need to get past someone blocking your way.",
    korean: "길을 막고 있는 사람을 지나가야 합니다.",
    correctAnswer_en: "Excuse me",
    correctAnswer_kr: "실례합니다",
    wrongChoices_en: ["Thank you", "I'm sorry", "You're welcome"],
    wrongChoices_kr: ["고마워요", "미안해요", "천만에요"],
    emoji: "🚶",
    hint: "길을 비켜달라고 정중하게 말하세요!",
    acceptedPronunciations: ["excuse me", "excuseme", "scuse me"]
  },
  {
    english: "Your teacher asks if you understand the lesson.",
    korean: "선생님이 수업을 이해했는지 물어봅니다.",
    correctAnswer_en: "Yes, I understand",
    correctAnswer_kr: "네, 이해했어요",
    wrongChoices_en: ["Thank you", "Goodbye", "I'm sorry"],
    wrongChoices_kr: ["감사합니다", "안녕히 가세요", "죄송합니다"],
    emoji: "📚",
    hint: "이해했다고 답하세요!",
    acceptedPronunciations: ["yes i understand", "yes i understood", "i understand", "yeah i understand"]
  },
  {
    english: "A classmate shares their snack with you.",
    korean: "반 친구가 간식을 나눠줍니다.",
    correctAnswer_en: "Thank you so much",
    correctAnswer_kr: "정말 고마워",
    wrongChoices_en: ["I'm sorry", "Excuse me", "See you later"],
    wrongChoices_kr: ["미안해", "실례해", "나중에 봐"],
    emoji: "🍪",
    hint: "정말 고맙다고 말하세요!",
    acceptedPronunciations: ["thank you so much", "thanks so much", "thank you very much"]
  },
  {
    english: "Someone compliments your new backpack.",
    korean: "누군가 당신의 새 가방을 칭찬합니다.",
    correctAnswer_en: "Thank you very much",
    correctAnswer_kr: "정말 감사합니다",
    wrongChoices_en: ["I'm sorry", "You're welcome", "Goodbye"],
    wrongChoices_kr: ["미안해요", "천만에요", "안녕히 가세요"],
    emoji: "🎒",
    hint: "칭찬에 감사를 표현하세요!",
    acceptedPronunciations: ["thank you very much", "thanks very much", "thank you so much"]
  },
  {
    english: "Your mom tells you dinner is ready.",
    korean: "엄마가 저녁 준비됐다고 말합니다.",
    correctAnswer_en: "I'm coming",
    correctAnswer_kr: "가고 있어요",
    wrongChoices_en: ["Thank you", "I'm sorry", "Goodbye"],
    wrongChoices_kr: ["감사합니다", "미안해요", "안녕"],
    emoji: "🍽️",
    hint: "지금 간다고 답하세요!",
    acceptedPronunciations: ["i'm coming", "im coming", "i am coming", "coming"]
  },
  {
    english: "A friend asks if you want to join them for lunch.",
    korean: "친구가 같이 점심 먹자고 물어봅니다.",
    correctAnswer_en: "Sure, let's go",
    correctAnswer_kr: "그래, 가자",
    wrongChoices_en: ["I'm sorry", "Thank you", "Excuse me"],
    wrongChoices_kr: ["미안해", "고마워", "실례해"],
    emoji: "🍕",
    hint: "좋다고 하고 가자고 답하세요!",
    acceptedPronunciations: ["sure let's go", "sure lets go", "sure let us go", "yeah lets go"]
  },
  {
    english: "Someone asks if they can borrow your pencil.",
    korean: "누군가 연필을 빌려도 되냐고 물어봅니다.",
    correctAnswer_en: "Of course you can",
    correctAnswer_kr: "물론이지",
    wrongChoices_en: ["I'm sorry", "Thank you", "Goodbye"],
    wrongChoices_kr: ["미안해", "고마워", "안녕"],
    emoji: "✏️",
    hint: "물론이라고 답하세요!",
    acceptedPronunciations: ["of course you can", "ofcourse you can", "sure you can", "yes you can"]
  }
];
