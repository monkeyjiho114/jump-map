# 붕어빵 점프맵 - 프로젝트 가이드

## 자동 Git Push 규칙
- 코드 수정이 완료되면 자동으로 git add, commit, push를 수행한다.
- 커밋 메시지는 한국어로 작성하며, 변경 내용을 간결하게 요약한다.
- push 대상: `origin main` (https://github.com/monkeyjiho114/jump-map.git)

## 기술 스택
- Three.js r160 (로컬 three.min.js, CDN 아님)
- 순수 HTML/CSS/JS — npm, 빌드 도구 없음
- 정적 파일 배포 (Vercel 호환)

## 파일 구조
```
index.html   — 진입점, UI 오버레이
style.css    — 메뉴/HUD/터치 컨트롤/반응형 스타일
game.js      — 모든 게임 로직 (~2000줄)
three.min.js — Three.js r160 로컬 파일
package.json — 프로젝트 메타데이터
```

## 핵심 규칙
- 붕어빵 몸통 재질: MeshLambertMaterial (광택 없음)
- 머리/플랫폼/환경: MeshPhongMaterial (광택 있음)
- 비늘: U-arc 3개씩 양쪽 옆면, 열린 쪽 → 머리, 닫힌 쪽 → 꼬리
- 틀 이음선(seam line) 없음
- 환경 오브젝트(나무, 풀, 무지개)는 y=-10 지면에서 시작
