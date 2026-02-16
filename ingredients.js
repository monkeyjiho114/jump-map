// ============================================
// DUBAI CHEWY COOKIE - INGREDIENT COLLECTION
// ============================================
const INGREDIENTS = [
  { id: 0, name: '버터',              emoji: '🧈', color: 0xFFF3B0, desc: '카다이프 굽기용' },
  { id: 1, name: '식용유',            emoji: '🫗', color: 0xF5E6AB, desc: '손에 바를 식용유' },
  { id: 2, name: '탈지분유',          emoji: '🥛', color: 0xFFF8F0, desc: '마시멜로 반죽용' },
  { id: 3, name: '코코아 파우더',      emoji: '🍫', color: 0x6D4C41, desc: '코팅용 + 반죽용' },
  { id: 4, name: '마시멜로',          emoji: '🍡', color: 0xFFF0F5, desc: '쫀득한 반죽 핵심' },
  { id: 5, name: '화이트 초콜릿',      emoji: '🍬', color: 0xFFF8DC, desc: '필링 바인더' },
  { id: 6, name: '피스타치오 분태',    emoji: '🌰', color: 0x93C572, desc: '필링 토핑' },
  { id: 7, name: '카다이프',          emoji: '🍝', color: 0xDEB887, desc: '바삭한 외피 핵심' },
  { id: 8, name: '피스타치오 스프레드', emoji: '🥜', color: 0x8FBC8F, desc: '필링 핵심' },
  { id: 9, name: '두바이 쫀득 쿠키',   emoji: '🍪', color: 0xD4943A, desc: '완성!' },
];

function createIngredientModel(ingredientData) {
  const group = new THREE.Group();
  const isComplete = ingredientData.id === 9;
  const scale = isComplete ? 1.5 : 1.0;

  // Canvas texture
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Background
  const colorHex = '#' + ingredientData.color.toString(16).padStart(6, '0');
  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);

  // Rounded rectangle background
  ctx.beginPath();
  const radius = 30;
  ctx.moveTo(radius, 8);
  ctx.lineTo(248, 8);
  ctx.quadraticCurveTo(248, 8, 248, 8 + radius);
  ctx.lineTo(248, 248 - radius);
  ctx.quadraticCurveTo(248, 248, 248 - radius, 248);
  ctx.lineTo(8 + radius, 248);
  ctx.quadraticCurveTo(8, 248, 8, 248 - radius);
  ctx.lineTo(8, 8 + radius);
  ctx.quadraticCurveTo(8, 8, 8 + radius, 8);
  ctx.closePath();

  // Gradient fill
  const gradient = ctx.createRadialGradient(128, 110, 20, 128, 128, 150);
  gradient.addColorStop(0, `rgba(${Math.min(255, r + 60)}, ${Math.min(255, g + 60)}, ${Math.min(255, b + 60)}, 1)`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 1)`);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Border
  ctx.strokeStyle = `rgba(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)}, 0.6)`;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Emoji
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = isComplete ? '100px serif' : '90px serif';
  ctx.fillText(ingredientData.emoji, 128, 105);

  // Name text
  const isDark = (r * 0.299 + g * 0.587 + b * 0.114) < 128;
  ctx.fillStyle = isDark ? '#fff' : '#333';
  ctx.font = 'bold 26px "Jua", sans-serif';
  ctx.fillText(ingredientData.name, 128, 210);

  // Subtle shine
  const shineGrad = ctx.createLinearGradient(0, 0, 256, 256);
  shineGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
  shineGrad.addColorStop(0.5, 'rgba(255,255,255,0)');
  shineGrad.addColorStop(1, 'rgba(255,255,255,0.05)');
  ctx.fillStyle = shineGrad;
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;

  // Box mesh (card-like)
  const boxW = 1.5 * scale;
  const boxH = 1.5 * scale;
  const boxD = 0.3 * scale;
  const boxGeo = new THREE.BoxGeometry(boxW, boxH, boxD);

  const sideMat = new THREE.MeshPhongMaterial({
    color: ingredientData.color, shininess: 40
  });
  const faceMat = new THREE.MeshPhongMaterial({
    map: texture, shininess: 30
  });
  // Order: +X, -X, +Y, -Y, +Z (front), -Z (back)
  const materials = [sideMat, sideMat, sideMat, sideMat, faceMat, faceMat];
  const box = new THREE.Mesh(boxGeo, materials);
  box.castShadow = true;
  group.add(box);

  // Glow sphere
  const glowRadius = 1.2 * scale;
  const glowGeo = new THREE.SphereGeometry(glowRadius, 16, 12);
  const glowColor = isComplete ? 0xFFD700 : ingredientData.color;
  const glowMat = new THREE.MeshBasicMaterial({
    color: glowColor, transparent: true, opacity: 0.12, side: THREE.BackSide
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  group.add(glow);

  // For complete cookie, add extra golden ring
  if (isComplete) {
    const ringGeo = new THREE.TorusGeometry(1.3, 0.06, 8, 32);
    const ringMat = new THREE.MeshPhongMaterial({
      color: 0xFFD700, emissive: 0xFFAA00, emissiveIntensity: 0.3, shininess: 80
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  }

  group.userData = { ingredientId: ingredientData.id, isComplete: isComplete };
  return group;
}
