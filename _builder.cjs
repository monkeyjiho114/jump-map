const fs = require('fs');
const path = require('path');

function fmt(e) {
  const J = JSON.stringify;
  return '    { english: ' + J(e.english) + ', korean: ' + J(e.korean) + ', emoji: ' + J(e.emoji) + ', hint: ' + J(e.hint) + ',\n' +
         '      wrongChoices_kr: ' + J(e.wrongChoices_kr) + ', wrongChoices_en: ' + J(e.wrongChoices_en) + ',\n' +
         '      acceptedPronunciations: ' + J(e.acceptedPronunciations) + ' }';
}

function writeTier(num, comment, data) {
  let s = '  // ' + comment + '\n';
  s += '  ' + num + ': [\n';
  data.forEach((e, i) => { s += fmt(e) + (i < data.length - 1 ? ',' : '') + '\n'; });
  s += '  ],\n';
  return s;
}

const comments = {
  1: '─── 티어 1 (기초): 20 단어 + 10 짧은 문장 ───',
  2: '─── 티어 2 (쉬운): 20 단어 + 10 짧은 문장 ───',
  3: '─── 티어 3 (기본): 15 단어 + 15 짧은 문장 ───',
  4: '─── 티어 4 (짧은 표현): 10 단어 + 20 문장 ───',
  5: '─── 티어 5 (표현): 5 단어 + 25 문장 ───',
  6: '─── 티어 6 (짧은 문장): 30 문장 ───',
  7: '─── 티어 7 (의문문): 30 문장 ───',
  8: '─── 티어 8 (자연스러운 문장): 30 문장 ───',
  9: '─── 티어 9 (복합 문장): 30 문장 ───',
  10: '─── 티어 10 (긴 자연 문장): 30 문장 ───'
};

const outPath = path.resolve('quiz-data.js');
let out = '\nconst QUIZ_WORD_BANK = {\n';

for (let i = 1; i <= 10; i++) {
  const dp = path.resolve('_tier' + i + '.json');
  const data = JSON.parse(fs.readFileSync(dp, 'utf8'));
  console.log('Tier ' + i + ': ' + data.length + ' entries');
  out += writeTier(i, comments[i], data);
}
out += '};\n';

fs.appendFileSync(outPath, out, 'utf8');
console.log('QUIZ_WORD_BANK appended to quiz-data.js');

// Clean up
for (let i = 1; i <= 10; i++) {
  fs.unlinkSync(path.resolve('_tier' + i + '.json'));
}
fs.unlinkSync(path.resolve('_builder.cjs'));
console.log('Temp files cleaned up');
