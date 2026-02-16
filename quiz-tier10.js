// 퀴즈 티어 10: 영어 상황 → 영어 응답 고급 (선택지 영어만, 정답 후 한글 표시)
// 고급 영어 상황에 맞는 적절한 응답을 영어로 말하기

const QUIZ_TIER_10 = [
  {
    english: "Your neighbor asks if you could watch their dog while they're away for the weekend.",
    korean: "이웃이 주말 동안 집을 비울 때 강아지를 봐줄 수 있냐고 물어봅니다.",
    correctAnswer_en: "I'd be happy to help",
    correctAnswer_kr: "기꺼이 도와드리겠습니다",
    wrongChoices_en: ["That's too bad", "I'm not sure about that", "Maybe next time"],
    wrongChoices_kr: ["안됐네요", "잘 모르겠어요", "다음에요"],
    emoji: "🐕",
    hint: "기꺼이 돕겠다고 답하세요!",
    acceptedPronunciations: ["i'd be happy to help", "id be happy to help", "i would be happy to help"]
  },
  {
    english: "During a group project meeting, someone suggests an idea that won't work well.",
    korean: "그룹 프로젝트 회의 중에 누군가 잘 안 될 것 같은 아이디어를 제안합니다.",
    correctAnswer_en: "What if we try a different approach",
    correctAnswer_kr: "다른 방법을 시도해보는 게 어떨까요",
    wrongChoices_en: ["That's perfect", "I completely agree", "Let's do exactly that"],
    wrongChoices_kr: ["완벽해요", "완전히 동의해요", "정확히 그렇게 해요"],
    emoji: "💡",
    hint: "다른 방법을 제안하세요!",
    acceptedPronunciations: ["what if we try a different approach", "what if we try different approach"]
  },
  {
    english: "Your friend is nervous about giving a presentation in front of the class tomorrow.",
    korean: "친구가 내일 반 앞에서 발표하는 것에 대해 긴장하고 있습니다.",
    correctAnswer_en: "You'll do great, just be yourself",
    correctAnswer_kr: "잘할 거야, 그냥 네 모습대로 해",
    wrongChoices_en: ["You should probably skip it", "I wouldn't do it either", "That sounds terrible"],
    wrongChoices_kr: ["그냥 빠지는 게 좋겠어", "나도 안 할 거야", "끔찍하게 들리네"],
    emoji: "🎤",
    hint: "잘할 거라고 격려해주세요!",
    acceptedPronunciations: ["you'll do great just be yourself", "youll do great just be yourself", "you will do great"]
  },
  {
    english: "Someone accidentally spills juice on your notebook during lunch.",
    korean: "누군가 점심시간에 실수로 당신의 공책에 주스를 쏟았습니다.",
    correctAnswer_en: "It's okay, accidents happen",
    correctAnswer_kr: "괜찮아요, 실수는 있을 수 있어요",
    wrongChoices_en: ["How could you do this", "You need to buy me a new one", "I'm never talking to you again"],
    wrongChoices_kr: ["어떻게 이럴 수 있어", "새 거 사줘야 해", "다시는 말 안 할 거야"],
    emoji: "📓",
    hint: "괜찮다고 이해해주세요!",
    acceptedPronunciations: ["it's okay accidents happen", "its okay accidents happen", "it is okay accidents happen"]
  },
  {
    english: "Your teacher asks the class if anyone would like to volunteer for the school play.",
    korean: "선생님이 학교 연극에 자원할 사람이 있는지 반에 물어봅니다.",
    correctAnswer_en: "I'd love to give it a try",
    correctAnswer_kr: "한번 해보고 싶어요",
    wrongChoices_en: ["I don't think so", "That's not for me", "Someone else should do it"],
    wrongChoices_kr: ["아닌 것 같아요", "제겐 안 맞아요", "다른 사람이 해야 해요"],
    emoji: "🎭",
    hint: "해보고 싶다고 답하세요!",
    acceptedPronunciations: ["i'd love to give it a try", "id love to give it a try", "i would love to try"]
  },
  {
    english: "A classmate asks for your opinion on which book the class should read next.",
    korean: "반 친구가 다음에 읽을 책에 대한 당신의 의견을 물어봅니다.",
    correctAnswer_en: "I think we should read the mystery novel",
    correctAnswer_kr: "추리 소설을 읽는 게 좋을 것 같아요",
    wrongChoices_en: ["I don't care at all", "Whatever you want", "Books are boring"],
    wrongChoices_kr: ["전혀 상관없어요", "네가 원하는 대로", "책은 지루해요"],
    emoji: "📚",
    hint: "추리 소설을 추천하세요!",
    acceptedPronunciations: ["i think we should read the mystery novel", "i think we should read mystery novel"]
  },
  {
    english: "Your parents ask how your day at school was and if anything interesting happened.",
    korean: "부모님이 학교에서 어땠는지, 재미있는 일이 있었는지 물어봅니다.",
    correctAnswer_en: "It was good, we had science lab today",
    correctAnswer_kr: "좋았어요, 오늘 과학 실험이 있었어요",
    wrongChoices_en: ["I don't want to talk about it", "Nothing ever happens", "Same as always, boring"],
    wrongChoices_kr: ["말하고 싶지 않아요", "아무 일도 없어요", "늘 그렇듯이 지루해요"],
    emoji: "🔬",
    hint: "과학 실험이 있었다고 답하세요!",
    acceptedPronunciations: ["it was good we had science lab today", "it was good we had science lab"]
  },
  {
    english: "A friend invites you to their birthday party but you have other plans that day.",
    korean: "친구가 생일 파티에 초대했지만 그날 다른 약속이 있습니다.",
    correctAnswer_en: "I'd love to but I already have plans",
    correctAnswer_kr: "가고 싶지만 이미 다른 약속이 있어요",
    wrongChoices_en: ["I don't like birthday parties", "Maybe if I feel like it", "I'll think about it"],
    wrongChoices_kr: ["생일 파티 싫어해요", "기분 나면 갈게요", "생각해볼게요"],
    emoji: "🎂",
    hint: "가고 싶지만 약속이 있다고 답하세요!",
    acceptedPronunciations: ["i'd love to but i already have plans", "id love to but i have plans"]
  },
  {
    english: "The librarian reminds you that your library books are due tomorrow.",
    korean: "사서 선생님이 도서관 책을 내일까지 반납해야 한다고 알려줍니다.",
    correctAnswer_en: "Thank you for reminding me",
    correctAnswer_kr: "알려주셔서 감사합니다",
    wrongChoices_en: ["I'll return them whenever", "That's not important", "I might forget anyway"],
    wrongChoices_kr: ["아무 때나 반납할게요", "중요하지 않아요", "어차피 잊어버릴 거예요"],
    emoji: "📖",
    hint: "알려줘서 고맙다고 답하세요!",
    acceptedPronunciations: ["thank you for reminding me", "thanks for reminding me", "thank you for the reminder"]
  },
  {
    english: "Your coach asks if you're willing to practice extra hours to prepare for the championship.",
    korean: "코치가 챔피언십을 준비하기 위해 추가 연습을 할 의향이 있는지 물어봅니다.",
    correctAnswer_en: "I'm committed to doing my best",
    correctAnswer_kr: "최선을 다할 준비가 되어 있습니다",
    wrongChoices_en: ["I don't think it's worth it", "Only if others do it too", "I'm too tired for that"],
    wrongChoices_kr: ["그럴 가치가 없는 것 같아요", "다른 사람들도 하면요", "너무 피곤해요"],
    emoji: "🏆",
    hint: "최선을 다하겠다고 답하세요!",
    acceptedPronunciations: ["i'm committed to doing my best", "im committed to doing my best", "i am committed"]
  }
];
