// Three.js is loaded as global THREE via <script> tag

// ============================================
// Section 1: CONSTANTS & CONFIG
// ============================================
const CONFIG = {
  GRAVITY: -28,
  JUMP_FORCE: 13,
  MOVE_SPEED: 9,
  AIR_CONTROL: 0.65,
  MAX_FALL_SPEED: -45,
  GROUND_FRICTION: 0.82,
  COYOTE_TIME: 0.1,
  JUMP_BUFFER_TIME: 0.12,

  CAM_DISTANCE: 12,
  CAM_HEIGHT: 7,
  CAM_LOOK_AHEAD: 2,
  CAM_LERP_SPEED: 5,
  CAM_MOUSE_SENSITIVITY: 0.003,

  KILL_Y: -25,
  RESPAWN_FLASH_TIME: 1.0,

  FOG_NEAR: 80,
  FOG_FAR: 250,

  PLAYER_WIDTH: 1.0,
  PLAYER_HEIGHT: 1.4,
  PLAYER_DEPTH: 1.2,
};

const GameState = {
  TITLE: 'title',
  CHARACTER_SELECT: 'character_select',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  STAGE_CLEAR: 'stage_clear',
  ALL_CLEAR: 'all_clear',
};

// ============================================
// Section 2: SOUND SYSTEM (Web Audio API)
// ============================================
class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.bgmPlaying = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7;
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.5;
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.7;
      this.sfxGain.connect(this.masterGain);

      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio not available');
    }
  }

  _playTone(freq, duration, type, gainNode, volume, delay) {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const t = this.ctx.currentTime + (delay || 0);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume || 0.3, t);
    gain.gain.setValueAtTime(volume || 0.3, t + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(gainNode || this.sfxGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  // Play a chord (multiple tones simultaneously)
  _playChord(freqs, duration, type, gainNode, volume, delay) {
    freqs.forEach(f => this._playTone(f, duration, type, gainNode, volume / freqs.length, delay));
  }

  playJump() {
    this._playTone(440, 0.15, 'square', this.sfxGain, 0.2);
    this._playTone(580, 0.1, 'square', this.sfxGain, 0.15, 0.05);
  }

  playLand() {
    this._playTone(150, 0.12, 'triangle', this.sfxGain, 0.25);
  }

  playCheckpoint() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => {
      this._playTone(f, 0.35, 'sine', this.sfxGain, 0.25, i * 0.1);
    });
  }

  playDeath() {
    this._playTone(300, 0.2, 'sawtooth', this.sfxGain, 0.2);
    this._playTone(200, 0.35, 'sawtooth', this.sfxGain, 0.2, 0.1);
  }

  playClear() {
    const notes = [523, 659, 784, 1047, 1319, 1568];
    notes.forEach((f, i) => {
      this._playTone(f, 0.6, 'sine', this.sfxGain, 0.25, i * 0.12);
    });
  }

  playMenuSelect() {
    this._playTone(600, 0.1, 'square', this.sfxGain, 0.15);
  }

  playMenuMove() {
    this._playTone(400, 0.06, 'square', this.sfxGain, 0.12);
  }

  startBGM(levelIndex) {
    if (!this.ctx) return;
    this.stopBGM();
    this.bgmPlaying = true;
    this._bgmLevelIndex = levelIndex;
    this._scheduleBGM(levelIndex);
  }

  _scheduleBGM(levelIndex) {
    if (!this.bgmPlaying || !this.ctx) return;

    // Richer melodies with longer phrases
    const melodies = [
      // Level 1: cheerful bouncy (C major pentatonic)
      { notes: [
        { f: 523, d: 0.3 }, { f: 587, d: 0.3 }, { f: 659, d: 0.3 }, { f: 784, d: 0.6 },
        { f: 659, d: 0.3 }, { f: 523, d: 0.3 }, { f: 659, d: 0.3 }, { f: 587, d: 0.6 },
        { f: 523, d: 0.3 }, { f: 392, d: 0.3 }, { f: 440, d: 0.3 }, { f: 523, d: 0.6 },
        { f: 659, d: 0.3 }, { f: 784, d: 0.3 }, { f: 880, d: 0.3 }, { f: 784, d: 0.6 },
        { f: 659, d: 0.3 }, { f: 587, d: 0.3 }, { f: 523, d: 0.6 }, { f: 392, d: 0.6 },
      ], bass: [262, 330, 196, 262, 330, 262, 196, 262, 330, 262], pad: [523, 659, 784] },
      // Level 2: mysterious ethereal (minor)
      { notes: [
        { f: 440, d: 0.4 }, { f: 523, d: 0.4 }, { f: 494, d: 0.4 }, { f: 440, d: 0.8 },
        { f: 392, d: 0.4 }, { f: 440, d: 0.4 }, { f: 523, d: 0.8 }, { f: 494, d: 0.4 },
        { f: 440, d: 0.4 }, { f: 392, d: 0.4 }, { f: 349, d: 0.8 }, { f: 392, d: 0.4 },
        { f: 440, d: 0.4 }, { f: 523, d: 0.4 }, { f: 494, d: 0.4 }, { f: 440, d: 0.8 },
      ], bass: [220, 175, 196, 220, 175, 220, 196, 220], pad: [440, 523, 659] },
      // Level 3: intense driving (minor + chromatic)
      { notes: [
        { f: 587, d: 0.2 }, { f: 659, d: 0.2 }, { f: 698, d: 0.2 }, { f: 784, d: 0.4 },
        { f: 740, d: 0.2 }, { f: 698, d: 0.2 }, { f: 659, d: 0.4 }, { f: 587, d: 0.2 },
        { f: 659, d: 0.2 }, { f: 698, d: 0.2 }, { f: 784, d: 0.2 }, { f: 880, d: 0.4 },
        { f: 784, d: 0.2 }, { f: 698, d: 0.2 }, { f: 659, d: 0.2 }, { f: 587, d: 0.4 },
        { f: 523, d: 0.2 }, { f: 587, d: 0.2 }, { f: 659, d: 0.4 }, { f: 587, d: 0.4 },
      ], bass: [294, 294, 349, 294, 262, 294, 349, 262, 294, 294], pad: [587, 698, 880] },
    ];

    const m = melodies[levelIndex % melodies.length];
    let time = 0;

    // Schedule melody notes
    m.notes.forEach(note => {
      this._playTone(note.f, note.d * 0.85, 'sine', this.bgmGain, 0.3, time);
      // Harmony (5th above, quieter)
      this._playTone(note.f * 1.5, note.d * 0.7, 'sine', this.bgmGain, 0.08, time);
      time += note.d;
    });

    // Schedule bass line across the melody
    const bassInterval = time / m.bass.length;
    m.bass.forEach((f, i) => {
      this._playTone(f, bassInterval * 0.9, 'triangle', this.bgmGain, 0.2, i * bassInterval);
    });

    // Schedule pad (sustained chord, very soft)
    if (m.pad) {
      m.pad.forEach(f => {
        this._playTone(f, time * 0.95, 'sine', this.bgmGain, 0.06, 0);
      });
    }

    // Loop after the melody finishes
    const totalMs = time * 1000;
    this._bgmTimeout = setTimeout(() => this._scheduleBGM(levelIndex), totalMs);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this._bgmTimeout) {
      clearTimeout(this._bgmTimeout);
      this._bgmTimeout = null;
    }
  }
}

const soundManager = new SoundManager();

// ============================================
// Section 3: CHARACTER MODELS (High Quality)
// ============================================
function createBungeoppangBody() {
  const group = new THREE.Group();

  // 따뜻한 붕어빵 색상 (무광)
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0xD4943A });
  const darkMat = new THREE.MeshLambertMaterial({ color: 0xB07828 });
  const bellyMat = new THREE.MeshLambertMaterial({ color: 0xE8C070 });
  const lineMat = new THREE.MeshLambertMaterial({ color: 0x8B5A1B });
  const tailMat = new THREE.MeshLambertMaterial({ color: 0xC48530 });

  // === 메인 몸체 — 통통하고 둥근 빵 형태 ===
  const bodyGeo = new THREE.SphereGeometry(1, 28, 20);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.scale.set(0.55, 0.50, 0.95);
  body.castShadow = true;
  group.add(body);

  // 배 (아래쪽 밝은색)
  const bellyGeo = new THREE.SphereGeometry(0.88, 18, 12);
  const belly = new THREE.Mesh(bellyGeo, bellyMat);
  belly.scale.set(0.44, 0.30, 0.72);
  belly.position.set(0, -0.14, 0.02);
  group.add(belly);

  // === 꼬리 지느러미 — V자 + 줄무늬 ===
  const tailGeo = new THREE.ConeGeometry(0.25, 0.6, 6);
  const tail1 = new THREE.Mesh(tailGeo, tailMat);
  tail1.position.set(0.14, 0.06, -0.88);
  tail1.rotation.set(0.4, 0, 0.45);
  tail1.castShadow = true;
  group.add(tail1);

  const tail2 = new THREE.Mesh(tailGeo, tailMat);
  tail2.position.set(-0.14, 0.06, -0.88);
  tail2.rotation.set(0.4, 0, -0.45);
  tail2.castShadow = true;
  group.add(tail2);

  // 꼬리 연결부
  const tailCGeo = new THREE.SphereGeometry(0.12, 8, 6);
  const tailC = new THREE.Mesh(tailCGeo, tailMat);
  tailC.position.set(0, 0.02, -0.80);
  tailC.scale.set(0.8, 0.6, 1.2);
  group.add(tailC);

  // 꼬리 줄무늬 (3개)
  for (let t = 0; t < 3; t++) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.008, 0.25, 0.008), lineMat
    );
    stripe.position.set(0.14, 0.06, -0.92 - t * 0.06);
    stripe.rotation.set(0.4, 0, 0.45);
    group.add(stripe);
    const stripe2 = stripe.clone();
    stripe2.position.set(-0.14, 0.06, -0.92 - t * 0.06);
    stripe2.rotation.set(0.4, 0, -0.45);
    group.add(stripe2);
  }

  // === 등 지느러미 — 작고 둥근 혹 ===
  const dorsalGeo = new THREE.SphereGeometry(0.08, 8, 6);
  const dorsal = new THREE.Mesh(dorsalGeo, bodyMat);
  dorsal.position.set(0, 0.47, -0.15);
  dorsal.scale.set(1, 0.7, 1.5);
  group.add(dorsal);

  // === 옆 지느러미 ===
  const sideFinGeo = new THREE.ConeGeometry(0.08, 0.18, 5);
  const leftFin = new THREE.Mesh(sideFinGeo, bodyMat);
  leftFin.position.set(0.48, -0.05, 0.10);
  leftFin.rotation.set(0.2, 0.3, -1.1);
  leftFin.castShadow = true;
  group.add(leftFin);
  const rightFin = new THREE.Mesh(sideFinGeo, bodyMat);
  rightFin.position.set(-0.48, -0.05, 0.10);
  rightFin.rotation.set(0.2, -0.3, 1.1);
  rightFin.castShadow = true;
  group.add(rightFin);

  // === 비늘 패턴 — 양쪽 옆면에 굵은 U자 곡선 3줄 ===
  // 열린쪽(U자 입구) = 머리(+z), 닫힌쪽(둥근부분) = 꼬리(-z)
  const scaleLine = new THREE.MeshLambertMaterial({ color: 0x9B6A1F, side: THREE.DoubleSide });

  for (let side = -1; side <= 1; side += 2) {
    for (let row = 0; row < 3; row++) {
      const z = -0.25 + row * 0.28;
      const r = 0.22 - row * 0.02;

      const arcGeo = new THREE.TorusGeometry(r, 0.02, 6, 16, Math.PI);
      const arc = new THREE.Mesh(arcGeo, scaleLine);
      arc.position.set(side * 0.53, 0.05, z);
      // 옆면에 붙이되, 호의 둥근부분이 꼬리(-z), 열린 양끝이 머리(+z) 향하도록
      arc.rotation.set(Math.PI / 2, Math.PI / 2, 0);
      arc.rotateZ(side > 0 ? 0 : Math.PI);
      arc.scale.set(0.8, 1, 1);
      group.add(arc);
    }
  }

  // === 배 곡선 (아래쪽 부드러운 선) ===
  const bellyLineGeo = new THREE.TorusGeometry(0.35, 0.012, 4, 20, Math.PI * 0.6);
  const bellyLine = new THREE.Mesh(bellyLineGeo, lineMat);
  bellyLine.position.set(0, -0.22, 0.05);
  bellyLine.rotation.set(Math.PI / 2, 0, 0);
  group.add(bellyLine);

  return group;
}

function createPigHead() {
  const group = new THREE.Group();
  const pinkMat = new THREE.MeshPhongMaterial({ color: 0xFFB6C1, shininess: 40 });
  const darkPinkMat = new THREE.MeshPhongMaterial({ color: 0xFF8FA0, shininess: 30 });
  const whiteMat = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, shininess: 80 });
  const blackMat = new THREE.MeshPhongMaterial({ color: 0x111111, shininess: 100 });
  const innerEarMat = new THREE.MeshPhongMaterial({ color: 0xFFCCDD, shininess: 20 });

  // Head - slightly squished sphere
  const headGeo = new THREE.SphereGeometry(0.44, 20, 16);
  const head = new THREE.Mesh(headGeo, pinkMat);
  head.scale.set(1, 0.95, 0.9);
  head.castShadow = true;
  group.add(head);

  // Snout - more cylindrical and cute
  const snoutGeo = new THREE.CylinderGeometry(0.16, 0.2, 0.14, 16);
  const snout = new THREE.Mesh(snoutGeo, darkPinkMat);
  snout.position.set(0, -0.06, 0.38);
  snout.rotation.set(Math.PI / 2, 0, 0);
  snout.castShadow = true;
  group.add(snout);

  // Snout face (flat disc)
  const snoutFaceGeo = new THREE.CircleGeometry(0.16, 16);
  const snoutFace = new THREE.Mesh(snoutFaceGeo, darkPinkMat);
  snoutFace.position.set(0, -0.06, 0.45);
  group.add(snoutFace);

  // Nostrils - oval shaped
  const nostrilGeo = new THREE.SphereGeometry(0.035, 8, 6);
  const nostrilL = new THREE.Mesh(nostrilGeo, blackMat);
  nostrilL.position.set(-0.06, -0.06, 0.455);
  nostrilL.scale.set(1, 0.7, 0.4);
  group.add(nostrilL);
  const nostrilR = new THREE.Mesh(nostrilGeo, blackMat);
  nostrilR.position.set(0.06, -0.06, 0.455);
  nostrilR.scale.set(1, 0.7, 0.4);
  group.add(nostrilR);

  // Eyes with highlight
  const eyeWhiteGeo = new THREE.SphereGeometry(0.1, 12, 10);
  const eyePupilGeo = new THREE.SphereGeometry(0.065, 10, 8);
  const eyeHighGeo = new THREE.SphereGeometry(0.025, 6, 6);

  // Left eye
  const eyeL = new THREE.Mesh(eyeWhiteGeo, whiteMat);
  eyeL.position.set(-0.16, 0.1, 0.32);
  group.add(eyeL);
  const pupilL = new THREE.Mesh(eyePupilGeo, blackMat);
  pupilL.position.set(-0.16, 0.1, 0.4);
  group.add(pupilL);
  const highL = new THREE.Mesh(eyeHighGeo, whiteMat);
  highL.position.set(-0.13, 0.13, 0.44);
  group.add(highL);

  // Right eye
  const eyeR = new THREE.Mesh(eyeWhiteGeo, whiteMat);
  eyeR.position.set(0.16, 0.1, 0.32);
  group.add(eyeR);
  const pupilR = new THREE.Mesh(eyePupilGeo, blackMat);
  pupilR.position.set(0.16, 0.1, 0.4);
  group.add(pupilR);
  const highR = new THREE.Mesh(eyeHighGeo, whiteMat);
  highR.position.set(0.19, 0.13, 0.44);
  group.add(highR);

  // Ears - triangular with inner color
  const earGeo = new THREE.ConeGeometry(0.14, 0.26, 5);
  const innerEarGeo = new THREE.ConeGeometry(0.08, 0.16, 5);

  const earL = new THREE.Mesh(earGeo, pinkMat);
  earL.position.set(-0.25, 0.4, 0.05);
  earL.rotation.set(0, 0, -0.35);
  earL.castShadow = true;
  group.add(earL);
  const innerEarL = new THREE.Mesh(innerEarGeo, innerEarMat);
  innerEarL.position.set(-0.25, 0.4, 0.08);
  innerEarL.rotation.set(0, 0, -0.35);
  group.add(innerEarL);

  const earR = new THREE.Mesh(earGeo, pinkMat);
  earR.position.set(0.25, 0.4, 0.05);
  earR.rotation.set(0, 0, 0.35);
  earR.castShadow = true;
  group.add(earR);
  const innerEarR = new THREE.Mesh(innerEarGeo, innerEarMat);
  innerEarR.position.set(0.25, 0.4, 0.08);
  innerEarR.rotation.set(0, 0, 0.35);
  group.add(innerEarR);

  // Blush circles (rosy cheeks)
  const blushMat = new THREE.MeshPhongMaterial({
    color: 0xFF8A9E, transparent: true, opacity: 0.6
  });
  const blushGeo = new THREE.SphereGeometry(0.07, 10, 8);
  const blushL = new THREE.Mesh(blushGeo, blushMat);
  blushL.position.set(-0.3, -0.02, 0.26);
  blushL.scale.set(1.2, 0.7, 0.3);
  group.add(blushL);
  const blushR = new THREE.Mesh(blushGeo, blushMat);
  blushR.position.set(0.3, -0.02, 0.26);
  blushR.scale.set(1.2, 0.7, 0.3);
  group.add(blushR);

  // Cute smile
  const smileGeo = new THREE.TorusGeometry(0.05, 0.01, 6, 10, Math.PI);
  const smileMat = new THREE.MeshPhongMaterial({ color: 0xCC5566 });
  const smile = new THREE.Mesh(smileGeo, smileMat);
  smile.position.set(0, -0.15, 0.4);
  smile.rotation.set(0, 0, Math.PI);
  group.add(smile);

  return group;
}

function createMonkeyHead() {
  const group = new THREE.Group();
  const brownMat = new THREE.MeshPhongMaterial({ color: 0x8B5E3C, shininess: 30 });
  const faceMat = new THREE.MeshPhongMaterial({ color: 0xDEB887, shininess: 25 });
  const whiteMat = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, shininess: 80 });
  const blackMat = new THREE.MeshPhongMaterial({ color: 0x111111, shininess: 100 });
  const darkBrownMat = new THREE.MeshPhongMaterial({ color: 0x5B3A1A, shininess: 20 });

  // Head
  const headGeo = new THREE.SphereGeometry(0.44, 20, 16);
  const head = new THREE.Mesh(headGeo, brownMat);
  head.castShadow = true;
  group.add(head);

  // Fur tuft on top
  for (let i = 0; i < 5; i++) {
    const tuftGeo = new THREE.ConeGeometry(0.04, 0.15, 4);
    const tuft = new THREE.Mesh(tuftGeo, darkBrownMat);
    const angle = (i / 5) * Math.PI * 0.8 - 0.4;
    tuft.position.set(Math.sin(angle) * 0.1, 0.44, Math.cos(angle) * 0.05);
    tuft.rotation.set(-0.3, 0, angle * 0.5);
    group.add(tuft);
  }

  // Face plate (lighter heart-shape)
  const faceGeo = new THREE.SphereGeometry(0.35, 16, 14);
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.position.set(0, -0.04, 0.16);
  face.scale.set(0.9, 0.88, 0.45);
  group.add(face);

  // Eyes with highlights
  const eyeWhiteGeo = new THREE.SphereGeometry(0.09, 12, 10);
  const eyePupilGeo = new THREE.SphereGeometry(0.055, 10, 8);
  const eyeHighGeo = new THREE.SphereGeometry(0.022, 6, 6);

  const eyeL = new THREE.Mesh(eyeWhiteGeo, whiteMat);
  eyeL.position.set(-0.15, 0.1, 0.33);
  group.add(eyeL);
  const pupilL = new THREE.Mesh(eyePupilGeo, blackMat);
  pupilL.position.set(-0.15, 0.1, 0.4);
  group.add(pupilL);
  const highL = new THREE.Mesh(eyeHighGeo, whiteMat);
  highL.position.set(-0.12, 0.13, 0.43);
  group.add(highL);

  const eyeR = new THREE.Mesh(eyeWhiteGeo, whiteMat);
  eyeR.position.set(0.15, 0.1, 0.33);
  group.add(eyeR);
  const pupilR = new THREE.Mesh(eyePupilGeo, blackMat);
  pupilR.position.set(0.15, 0.1, 0.4);
  group.add(pupilR);
  const highR = new THREE.Mesh(eyeHighGeo, whiteMat);
  highR.position.set(0.18, 0.13, 0.43);
  group.add(highR);

  // Muzzle area (protruding)
  const muzzleGeo = new THREE.SphereGeometry(0.14, 12, 10);
  const muzzle = new THREE.Mesh(muzzleGeo, faceMat);
  muzzle.position.set(0, -0.1, 0.36);
  muzzle.scale.set(1.2, 0.8, 0.7);
  group.add(muzzle);

  // Nose
  const noseGeo = new THREE.SphereGeometry(0.04, 8, 6);
  const nose = new THREE.Mesh(noseGeo, darkBrownMat);
  nose.position.set(0, -0.06, 0.44);
  nose.scale.set(1.2, 0.9, 0.6);
  group.add(nose);

  // Smile
  const smileGeo = new THREE.TorusGeometry(0.06, 0.012, 6, 10, Math.PI);
  const smileMat = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
  const smile = new THREE.Mesh(smileGeo, smileMat);
  smile.position.set(0, -0.15, 0.4);
  smile.rotation.set(0, 0, Math.PI);
  group.add(smile);

  // Ears (round, large)
  const earGeo = new THREE.SphereGeometry(0.19, 14, 10);
  const innerEarGeo = new THREE.SphereGeometry(0.12, 10, 8);

  const earL = new THREE.Mesh(earGeo, brownMat);
  earL.position.set(-0.44, 0.12, 0);
  earL.scale.set(1, 1, 0.35);
  earL.castShadow = true;
  group.add(earL);
  const innerEarL = new THREE.Mesh(innerEarGeo, faceMat);
  innerEarL.position.set(-0.44, 0.12, 0.05);
  innerEarL.scale.set(1, 1, 0.25);
  group.add(innerEarL);

  const earR = new THREE.Mesh(earGeo, brownMat);
  earR.position.set(0.44, 0.12, 0);
  earR.scale.set(1, 1, 0.35);
  earR.castShadow = true;
  group.add(earR);
  const innerEarR = new THREE.Mesh(innerEarGeo, faceMat);
  innerEarR.position.set(0.44, 0.12, 0.05);
  innerEarR.scale.set(1, 1, 0.25);
  group.add(innerEarR);

  // Eyebrow ridges
  const browGeo = new THREE.BoxGeometry(0.13, 0.03, 0.03);
  const browL = new THREE.Mesh(browGeo, darkBrownMat);
  browL.position.set(-0.15, 0.21, 0.37);
  browL.rotation.set(0, 0, 0.2);
  group.add(browL);
  const browR = new THREE.Mesh(browGeo, darkBrownMat);
  browR.position.set(0.15, 0.21, 0.37);
  browR.rotation.set(0, 0, -0.2);
  group.add(browR);

  return group;
}

function createCharacterModel(type) {
  const group = new THREE.Group();

  const body = createBungeoppangBody();
  body.position.set(0, 0, 0);
  group.add(body);

  const head = type === 'pig' ? createPigHead() : createMonkeyHead();
  head.position.set(0, 0.40, 0.58);
  head.scale.set(1.1, 1.1, 1.1);
  group.add(head);

  group.scale.set(0.9, 0.9, 0.9);
  return group;
}

// ============================================
// Section 4: LEVEL DATA
// ============================================
const LEVELS = [
  {
    id: 1,
    name: '스테이지 1: 시작의 다리',
    skyColor: 0x87CEEB,
    fogColor: 0x87CEEB,
    platforms: [
      { type: 'static', pos: [0, 0, 0], size: [7, 1, 7], color: 0x4CAF50, isStart: true },
      { type: 'static', pos: [0, 0, 8], size: [3, 1, 3], color: 0x42A5F5 },
      { type: 'static', pos: [3, 0.5, 14], size: [3, 1, 3], color: 0x42A5F5 },
      { type: 'static', pos: [0, 1, 20], size: [3, 1, 3], color: 0x66BB6A },
      { type: 'static', pos: [-3, 1.5, 26], size: [2.5, 1, 2.5], color: 0x66BB6A },
      { type: 'static', pos: [-3, 2, 32], size: [5, 1, 5], color: 0xFFA726, isCheckpoint: true },
      { type: 'static', pos: [0, 2.5, 38], size: [2, 1, 2], color: 0xAB47BC },
      { type: 'static', pos: [3, 3, 42], size: [2, 1, 2], color: 0xAB47BC },
      { type: 'static', pos: [0, 3.5, 46], size: [2, 1, 2], color: 0xAB47BC },
      { type: 'static', pos: [-3, 4, 50], size: [2, 1, 2], color: 0xEF5350 },
      { type: 'moving', pos: [0, 4.5, 56], size: [3, 0.6, 3], color: 0xFFEE58,
        movement: { axis: 'x', range: 3, speed: 1.5 } },
      { type: 'static', pos: [0, 5, 62], size: [5, 1, 5], color: 0xFFA726, isCheckpoint: true },
      { type: 'disappearing', pos: [0, 5.5, 68], size: [3, 0.5, 3], color: 0xFF7043,
        timing: { visible: 2.5, hidden: 1.2, offset: 0 } },
      { type: 'disappearing', pos: [0, 6, 74], size: [3, 0.5, 3], color: 0xFF7043,
        timing: { visible: 2.5, hidden: 1.2, offset: 1.2 } },
      { type: 'static', pos: [3, 6.5, 80], size: [2.5, 1, 2.5], color: 0x26C6DA },
      { type: 'static', pos: [0, 7, 86], size: [2.5, 1, 2.5], color: 0x26C6DA },
      { type: 'static', pos: [0, 7.5, 93], size: [6, 1, 6], color: 0xFFD700, isFinish: true },
    ],
    decorations: [
      { type: 'cloud', pos: [15, 18, 20] },
      { type: 'cloud', pos: [-12, 22, 45] },
      { type: 'cloud', pos: [18, 20, 70] },
      { type: 'cloud', pos: [-15, 25, 85] },
    ]
  },
  {
    id: 2,
    name: '스테이지 2: 구름 위의 길',
    skyColor: 0xFFE4B5,
    fogColor: 0xFFE4B5,
    platforms: [
      { type: 'static', pos: [0, 0, 0], size: [6, 1, 6], color: 0x4DB6AC, isStart: true },
      { type: 'static', pos: [3, 1, 6], size: [2.5, 1, 2.5], color: 0x7986CB },
      { type: 'static', pos: [0, 2.5, 11], size: [2, 1, 2], color: 0x7986CB },
      { type: 'static', pos: [-3, 4, 16], size: [2, 1, 2], color: 0x7986CB },
      { type: 'static', pos: [0, 5.5, 21], size: [2, 1, 2], color: 0x9575CD },
      { type: 'moving', pos: [3, 6, 27], size: [2.5, 0.6, 2.5], color: 0xFFCA28,
        movement: { axis: 'x', range: 4, speed: 2 } },
      { type: 'moving', pos: [-2, 7, 33], size: [2.5, 0.6, 2.5], color: 0xFFCA28,
        movement: { axis: 'y', range: 2, speed: 1.5 } },
      { type: 'static', pos: [0, 8, 39], size: [5, 1, 5], color: 0xFFA726, isCheckpoint: true },
      { type: 'static', pos: [2, 8.5, 45], size: [1.5, 1, 1.5], color: 0xE91E63 },
      { type: 'static', pos: [-1, 9, 49], size: [1.5, 1, 1.5], color: 0xE91E63 },
      { type: 'static', pos: [3, 9.5, 53], size: [1.5, 1, 1.5], color: 0xE91E63 },
      { type: 'disappearing', pos: [-1, 10, 58], size: [2.5, 0.5, 2.5], color: 0xFF5722,
        timing: { visible: 2, hidden: 1.5, offset: 0 } },
      { type: 'disappearing', pos: [2, 10.5, 63], size: [2.5, 0.5, 2.5], color: 0xFF5722,
        timing: { visible: 2, hidden: 1.5, offset: 0.8 } },
      { type: 'disappearing', pos: [-1, 11, 68], size: [2.5, 0.5, 2.5], color: 0xFF5722,
        timing: { visible: 2, hidden: 1.5, offset: 1.6 } },
      { type: 'static', pos: [0, 11.5, 74], size: [5, 1, 5], color: 0xFFA726, isCheckpoint: true },
      { type: 'moving', pos: [0, 12, 80], size: [2, 0.6, 2], color: 0x26A69A,
        movement: { axis: 'x', range: 3.5, speed: 2.5 } },
      { type: 'static', pos: [0, 12.5, 86], size: [2, 1, 2], color: 0x26A69A },
      { type: 'moving', pos: [0, 13, 92], size: [2, 0.6, 2], color: 0x26A69A,
        movement: { axis: 'x', range: 4, speed: 2 } },
      { type: 'static', pos: [0, 13.5, 99], size: [6, 1, 6], color: 0xFFD700, isFinish: true },
    ],
    decorations: [
      { type: 'cloud', pos: [12, 20, 15] },
      { type: 'cloud', pos: [-14, 25, 40] },
      { type: 'cloud', pos: [16, 22, 65] },
      { type: 'cloud', pos: [-10, 28, 90] },
    ]
  },
  {
    id: 3,
    name: '스테이지 3: 용암의 도전',
    skyColor: 0xFF6B35,
    fogColor: 0xFF6B35,
    platforms: [
      { type: 'static', pos: [0, 0, 0], size: [6, 1, 6], color: 0x8D6E63, isStart: true },
      { type: 'static', pos: [3, 0.5, 6], size: [2, 1, 2], color: 0xD32F2F },
      { type: 'static', pos: [-2, 1.5, 11], size: [1.8, 1, 1.8], color: 0xD32F2F },
      { type: 'static', pos: [3, 2.5, 16], size: [1.8, 1, 1.8], color: 0xC62828 },
      { type: 'static', pos: [-2, 3.5, 21], size: [1.5, 1, 1.5], color: 0xC62828 },
      { type: 'moving', pos: [0, 4, 27], size: [2.5, 0.6, 2.5], color: 0xFFC107,
        movement: { axis: 'x', range: 5, speed: 3 } },
      { type: 'static', pos: [0, 4.5, 33], size: [4, 1, 4], color: 0xFFA726, isCheckpoint: true },
      { type: 'disappearing', pos: [2, 5, 38], size: [2, 0.5, 2], color: 0xFF6F00,
        timing: { visible: 1.5, hidden: 1.2, offset: 0 } },
      { type: 'disappearing', pos: [-1, 5.5, 42], size: [2, 0.5, 2], color: 0xFF6F00,
        timing: { visible: 1.5, hidden: 1.2, offset: 0.5 } },
      { type: 'disappearing', pos: [2, 6, 46], size: [2, 0.5, 2], color: 0xFF6F00,
        timing: { visible: 1.5, hidden: 1.2, offset: 1.0 } },
      { type: 'disappearing', pos: [-1, 6.5, 50], size: [2, 0.5, 2], color: 0xFF6F00,
        timing: { visible: 1.5, hidden: 1.2, offset: 1.5 } },
      { type: 'static', pos: [0, 7, 55], size: [4, 1, 4], color: 0xFFA726, isCheckpoint: true },
      { type: 'moving', pos: [3, 7.5, 61], size: [2, 0.6, 2], color: 0xE65100,
        movement: { axis: 'y', range: 2.5, speed: 2.5 } },
      { type: 'static', pos: [-2, 9, 66], size: [1.5, 1, 1.5], color: 0xBF360C },
      { type: 'moving', pos: [2, 10, 71], size: [2, 0.6, 2], color: 0xE65100,
        movement: { axis: 'x', range: 4, speed: 3.5 } },
      { type: 'disappearing', pos: [-1, 11, 76], size: [2.5, 0.5, 2.5], color: 0xFF3D00,
        timing: { visible: 1.8, hidden: 1.5, offset: 0 } },
      { type: 'static', pos: [0, 11.5, 82], size: [4, 1, 4], color: 0xFFA726, isCheckpoint: true },
      { type: 'static', pos: [2, 12, 87], size: [1.3, 1, 1.3], color: 0xF44336 },
      { type: 'static', pos: [-2, 12.5, 91], size: [1.3, 1, 1.3], color: 0xF44336 },
      { type: 'moving', pos: [0, 13, 95], size: [1.5, 0.6, 1.5], color: 0xFF9100,
        movement: { axis: 'x', range: 3, speed: 3 } },
      { type: 'static', pos: [0, 13.5, 100], size: [1.3, 1, 1.3], color: 0xF44336 },
      { type: 'static', pos: [0, 14, 106], size: [7, 1, 7], color: 0xFFD700, isFinish: true },
    ],
    decorations: [
      { type: 'cloud', pos: [15, 20, 10] },
      { type: 'cloud', pos: [-12, 25, 50] },
      { type: 'cloud', pos: [18, 22, 80] },
    ]
  }
];

// ============================================
// Section 5: PLATFORM CLASSES (Enhanced)
// ============================================
class StaticPlatform {
  constructor(def) {
    // Main platform with beveled edges look
    const geo = new THREE.BoxGeometry(def.size[0], def.size[1], def.size[2]);
    const mat = new THREE.MeshPhongMaterial({ color: def.color, shininess: 15 });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(def.pos[0], def.pos[1], def.pos[2]);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.isStart = def.isStart || false;
    this.isFinish = def.isFinish || false;
    this.isCheckpoint = def.isCheckpoint || false;
    this.isActive = true;
    this.collider = new THREE.Box3().setFromObject(this.mesh);
    this.velocity = new THREE.Vector3(0, 0, 0);

    // Top surface highlight
    const topGeo = new THREE.BoxGeometry(def.size[0] - 0.1, 0.05, def.size[2] - 0.1);
    const topColor = new THREE.Color(def.color).multiplyScalar(1.3);
    const topMat = new THREE.MeshPhongMaterial({ color: topColor, shininess: 30 });
    this.topSurface = new THREE.Mesh(topGeo, topMat);
    this.topSurface.position.set(def.pos[0], def.pos[1] + def.size[1] / 2 + 0.025, def.pos[2]);
    this.topSurface.receiveShadow = true;

    // Edge trim
    const edgeColor = new THREE.Color(def.color).multiplyScalar(0.7);
    const edgeMat = new THREE.MeshPhongMaterial({ color: edgeColor });
    const edgeGeo = new THREE.BoxGeometry(def.size[0] + 0.08, def.size[1] * 0.2, def.size[2] + 0.08);
    this.edge = new THREE.Mesh(edgeGeo, edgeMat);
    this.edge.position.set(def.pos[0], def.pos[1] - def.size[1] * 0.4, def.pos[2]);

    // Finish platform glow
    if (this.isFinish) {
      const glowGeo = new THREE.BoxGeometry(def.size[0] + 0.4, def.size[1] + 0.4, def.size[2] + 0.4);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xFFD700, transparent: true, opacity: 0.15, side: THREE.BackSide
      });
      this.glow = new THREE.Mesh(glowGeo, glowMat);
      this.glow.position.copy(this.mesh.position);

      // Star particles above finish
      this._stars = [];
      for (let i = 0; i < 6; i++) {
        const starGeo = new THREE.OctahedronGeometry(0.15, 0);
        const starMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
        const star = new THREE.Mesh(starGeo, starMat);
        star.position.set(
          def.pos[0] + Math.cos(i / 6 * Math.PI * 2) * 2,
          def.pos[1] + 2.5,
          def.pos[2] + Math.sin(i / 6 * Math.PI * 2) * 2
        );
        star._phase = i;
        this._stars.push(star);
      }
    }

    // Checkpoint marker
    if (this.isCheckpoint) {
      this.checkpointActivated = false;
      const flagPoleGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8);
      const flagPoleMat = new THREE.MeshPhongMaterial({ color: 0xAAAAAA, shininess: 50 });
      this.flagPole = new THREE.Mesh(flagPoleGeo, flagPoleMat);
      this.flagPole.position.set(def.pos[0], def.pos[1] + 1.6, def.pos[2]);
      this.flagPole.castShadow = true;

      const flagGeo = new THREE.PlaneGeometry(0.7, 0.45);
      this.flagMat = new THREE.MeshPhongMaterial({ color: 0xFF5722, side: THREE.DoubleSide });
      this.flag = new THREE.Mesh(flagGeo, this.flagMat);
      this.flag.position.set(def.pos[0] + 0.4, def.pos[1] + 2.4, def.pos[2]);

      // Pole top sphere
      const topBallGeo = new THREE.SphereGeometry(0.06, 8, 6);
      const topBallMat = new THREE.MeshPhongMaterial({ color: 0xFFD700, shininess: 80 });
      this.topBall = new THREE.Mesh(topBallGeo, topBallMat);
      this.topBall.position.set(def.pos[0], def.pos[1] + 2.7, def.pos[2]);
    }
  }

  addToScene(scene) {
    scene.add(this.mesh);
    scene.add(this.topSurface);
    scene.add(this.edge);
    if (this.glow) scene.add(this.glow);
    if (this._stars) this._stars.forEach(s => scene.add(s));
    if (this.flagPole) {
      scene.add(this.flagPole);
      scene.add(this.flag);
      scene.add(this.topBall);
    }
  }

  removeFromScene(scene) {
    scene.remove(this.mesh);
    scene.remove(this.topSurface);
    scene.remove(this.edge);
    if (this.glow) scene.remove(this.glow);
    if (this._stars) this._stars.forEach(s => scene.remove(s));
    if (this.flagPole) {
      scene.remove(this.flagPole);
      scene.remove(this.flag);
      scene.remove(this.topBall);
    }
  }

  activateCheckpoint() {
    if (this.isCheckpoint && !this.checkpointActivated) {
      this.checkpointActivated = true;
      this.flagMat.color.set(0x4CAF50);
      this.flagMat.emissive = new THREE.Color(0x1B5E20);
      this.flagMat.emissiveIntensity = 0.3;
    }
  }

  update(dt, time) {
    if (this.glow) {
      this.glow.material.opacity = 0.12 + Math.sin(time * 3) * 0.08;
    }
    if (this._stars) {
      this._stars.forEach((star, i) => {
        star.rotation.y = time * 2 + i;
        star.position.y = this.mesh.position.y + 2.5 + Math.sin(time * 2 + star._phase) * 0.4;
      });
    }
    if (this.flag) {
      this.flag.rotation.y = Math.sin(time * 3) * 0.25;
    }
  }
}

class MovingPlatform extends StaticPlatform {
  constructor(def) {
    super(def);
    this.basePos = new THREE.Vector3(def.pos[0], def.pos[1], def.pos[2]);
    this.movement = def.movement;
    this.time = 0;
    this.prevPos = this.mesh.position.clone();
  }

  update(dt, time) {
    super.update(dt, time);
    this.prevPos.copy(this.mesh.position);
    this.time += dt;
    const { axis, range, speed } = this.movement;
    const offset = Math.sin(this.time * speed) * range;
    this.mesh.position[axis] = this.basePos[axis] + offset;
    this.topSurface.position[axis] = this.mesh.position[axis];
    this.edge.position[axis] = this.mesh.position[axis];
    this.topSurface.position.y = this.mesh.position.y + this.mesh.geometry.parameters.height / 2 + 0.025;
    this.edge.position.y = this.mesh.position.y - this.mesh.geometry.parameters.height * 0.4;
    this.collider.setFromObject(this.mesh);
    this.velocity.subVectors(this.mesh.position, this.prevPos).divideScalar(dt);
  }
}

class DisappearingPlatform extends StaticPlatform {
  constructor(def) {
    super(def);
    this.timing = def.timing;
    this.timer = def.timing.offset || 0;
    this.isActive = true;
    this.blinkTimer = 0;
  }

  update(dt, time) {
    super.update(dt, time);
    this.timer += dt;
    const cycle = this.timing.visible + this.timing.hidden;
    const phase = this.timer % cycle;

    const warningTime = 0.5;
    const shouldBeActive = phase < this.timing.visible;
    const isWarning = shouldBeActive && phase > this.timing.visible - warningTime;

    const visible = isWarning ? Math.sin(this.blinkTimer * 20) > 0 : shouldBeActive;

    if (isWarning) this.blinkTimer += dt;
    else this.blinkTimer = 0;

    this.mesh.visible = visible;
    this.topSurface.visible = visible;
    this.edge.visible = visible;
    this.isActive = shouldBeActive;
  }
}

function createPlatform(def) {
  switch (def.type) {
    case 'moving': return new MovingPlatform(def);
    case 'disappearing': return new DisappearingPlatform(def);
    default: return new StaticPlatform(def);
  }
}

// ============================================
// Section 6: ENVIRONMENT (Greatly Enhanced)
// ============================================
function createCloud(pos) {
  const group = new THREE.Group();
  const mat = new THREE.MeshPhongMaterial({
    color: 0xFFFFFF, transparent: true, opacity: 0.85, shininess: 10
  });
  const configs = [
    { r: 2.0, x: 0, y: 0, z: 0 },
    { r: 1.6, x: 1.6, y: 0.3, z: 0.2 },
    { r: 1.4, x: -1.4, y: 0.2, z: -0.3 },
    { r: 1.1, x: 0.7, y: 0.7, z: -0.4 },
    { r: 1.5, x: -0.6, y: 0.5, z: 0.5 },
    { r: 1.0, x: 2.3, y: 0.1, z: -0.1 },
    { r: 0.9, x: -2.0, y: 0.4, z: 0.2 },
  ];
  for (const c of configs) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(c.r, 12, 8), mat);
    mesh.position.set(c.x, c.y, c.z);
    group.add(mesh);
  }
  group.position.set(pos[0], pos[1], pos[2]);
  return group;
}

function createParticles(scene, levelIndex) {
  const colors = [0xFFFFFF, 0xFFE082, 0xFF8A65];
  const color = colors[levelIndex % 3];
  const count = 200;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 120;
    positions[i * 3 + 1] = Math.random() * 40;
    positions[i * 3 + 2] = Math.random() * 120 - 10;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: color, size: 0.15, transparent: true, opacity: 0.6
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);
  return points;
}

// --- Rich Background Environment ---
function createSun(scene, levelIndex) {
  const group = new THREE.Group();
  // Sun/moon ball
  const sunColors = [0xFFDD44, 0xFFAA33, 0xFF4422];
  const sunColor = sunColors[levelIndex % 3];
  const sunGeo = new THREE.SphereGeometry(5, 24, 20);
  const sunMat = new THREE.MeshBasicMaterial({ color: sunColor });
  const sun = new THREE.Mesh(sunGeo, sunMat);

  // Glow rings
  const glowMat = new THREE.MeshBasicMaterial({
    color: sunColor, transparent: true, opacity: 0.15, side: THREE.BackSide
  });
  const glow1 = new THREE.Mesh(new THREE.SphereGeometry(7, 16, 12), glowMat);
  const glow2Mat = new THREE.MeshBasicMaterial({
    color: sunColor, transparent: true, opacity: 0.06, side: THREE.BackSide
  });
  const glow2 = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 12), glow2Mat);

  group.add(sun);
  group.add(glow1);
  group.add(glow2);

  const sunPositions = [
    [60, 55, 80],
    [-50, 50, 70],
    [40, 40, 60]
  ];
  const p = sunPositions[levelIndex % 3];
  group.position.set(p[0], p[1], p[2]);
  scene.add(group);
  return group;
}

function createMountains(scene, levelIndex) {
  const mountains = new THREE.Group();
  const mountainConfigs = [
    // Level 1: green rolling hills
    { colors: [0x4A8C3F, 0x3D7A34, 0x5B9E4E], snow: false },
    // Level 2: sunset golden mountains
    { colors: [0x8B7355, 0x7A6448, 0x9C8462], snow: true },
    // Level 3: volcanic dark mountains
    { colors: [0x5C3A2E, 0x4A2E23, 0x6E4839], snow: false },
  ];
  const cfg = mountainConfigs[levelIndex % 3];

  const positions = [
    { x: -60, z: 80, s: 25, h: 28 },
    { x: -30, z: 100, s: 20, h: 22 },
    { x: 0, z: 110, s: 30, h: 32 },
    { x: 35, z: 95, s: 22, h: 26 },
    { x: 65, z: 85, s: 28, h: 30 },
    { x: -50, z: 60, s: 15, h: 18 },
    { x: 50, z: 65, s: 18, h: 20 },
    { x: -70, z: 90, s: 20, h: 24 },
    { x: 75, z: 100, s: 24, h: 27 },
  ];

  positions.forEach((p, i) => {
    const color = cfg.colors[i % cfg.colors.length];
    const geo = new THREE.ConeGeometry(p.s, p.h, 6);
    const mat = new THREE.MeshPhongMaterial({ color: color, flatShading: true });
    const mountain = new THREE.Mesh(geo, mat);
    mountain.position.set(p.x, p.h / 2 - 8, p.z);
    mountain.rotation.y = i * 0.7;
    mountains.add(mountain);

    // Snow cap for level 2
    if (cfg.snow && p.h > 20) {
      const snowGeo = new THREE.ConeGeometry(p.s * 0.3, p.h * 0.2, 6);
      const snowMat = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, shininess: 30 });
      const snow = new THREE.Mesh(snowGeo, snowMat);
      snow.position.set(p.x, p.h - 8 - p.h * 0.1, p.z);
      mountains.add(snow);
    }
  });

  scene.add(mountains);
  return mountains;
}

function createTrees(scene, levelIndex) {
  const trees = new THREE.Group();
  if (levelIndex === 2) return trees; // no trees in lava level

  const trunkMat = new THREE.MeshPhongMaterial({ color: 0x6B4226, shininess: 10 });
  const leafColors = levelIndex === 0
    ? [0x2E7D32, 0x388E3C, 0x43A047]
    : [0xE8A030, 0xD4943A, 0xC08030];

  for (let i = 0; i < 30; i++) {
    const tree = new THREE.Group();

    // Giant trees that grow from ground (-10) up to platform height
    const trunkH = 12 + Math.random() * 18; // 12~30 tall trunks
    const trunkR = 0.3 + Math.random() * 0.5; // thicker trunks
    const trunkGeo = new THREE.CylinderGeometry(trunkR * 0.6, trunkR, trunkH, 8);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    tree.add(trunk);

    // Foliage (4 stacked cones, bigger)
    const leafColor = leafColors[i % leafColors.length];
    const leafMat = new THREE.MeshPhongMaterial({ color: leafColor, flatShading: true });
    for (let j = 0; j < 4; j++) {
      const r = (2.5 + trunkR * 2) - j * 0.5;
      const h = 3.0 - j * 0.3;
      const leafGeo = new THREE.ConeGeometry(r, h, 7);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.y = trunkH + j * 1.5 + 0.5;
      leaf.castShadow = true;
      tree.add(leaf);
    }

    // Place trees at ground level (-10), spread around level edges
    const side = Math.random() > 0.5 ? 1 : -1;
    const x = side * (10 + Math.random() * 35);
    const z = Math.random() * 120 - 10;
    tree.position.set(x, -10, z);
    tree.scale.setScalar(0.7 + Math.random() * 0.5);
    trees.add(tree);
  }

  scene.add(trees);
  return trees;
}

function createGroundPlane(scene, levelIndex) {
  const groundColors = [0x5B8C3F, 0xC4A960, 0x3A2018];
  const geo = new THREE.PlaneGeometry(200, 200);
  const mat = new THREE.MeshPhongMaterial({
    color: groundColors[levelIndex % 3],
    specular: 0x111111, shininess: 2
  });
  const ground = new THREE.Mesh(geo, mat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -10, 50);
  ground.receiveShadow = true;
  scene.add(ground);

  // Level 3: lava glow under ground
  if (levelIndex === 2) {
    const lavaGeo = new THREE.PlaneGeometry(200, 200);
    const lavaMat = new THREE.MeshBasicMaterial({
      color: 0xFF4400, transparent: true, opacity: 0.3
    });
    const lava = new THREE.Mesh(lavaGeo, lavaMat);
    lava.rotation.x = -Math.PI / 2;
    lava.position.set(0, -9.5, 50);
    scene.add(lava);
  }

  return ground;
}

function createGrassPatches(scene, levelIndex) {
  if (levelIndex === 2) return null; // no grass in lava
  const grassGroup = new THREE.Group();
  const grassColors = levelIndex === 0
    ? [0x3E8C28, 0x4DA832, 0x5CB83C]
    : [0xC4A050, 0xB89040, 0xD4B060];

  for (let i = 0; i < 100; i++) {
    const color = grassColors[i % grassColors.length];
    const mat = new THREE.MeshPhongMaterial({ color, flatShading: true });
    const h = 0.8 + Math.random() * 1.5;
    const geo = new THREE.ConeGeometry(0.12, h, 4);
    const blade = new THREE.Mesh(geo, mat);
    const side = Math.random() > 0.5 ? 1 : -1;
    blade.position.set(
      side * (6 + Math.random() * 30),
      -10 + h / 2,
      Math.random() * 120 - 10
    );
    blade.rotation.set(0, Math.random() * Math.PI, (Math.random() - 0.5) * 0.3);
    grassGroup.add(blade);
  }
  scene.add(grassGroup);
  return grassGroup;
}

function createRainbow(scene) {
  const rainbow = new THREE.Group();
  const colors = [0xFF0000, 0xFF7700, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];
  colors.forEach((color, i) => {
    const radius = 35 + i * 1.5;
    const geo = new THREE.TorusGeometry(radius, 0.6, 8, 50, Math.PI);
    const mat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.25
    });
    const ring = new THREE.Mesh(geo, mat);
    rainbow.add(ring);
  });
  // Sits on the ground (-10), arch goes upward
  rainbow.position.set(40, -10, 90);
  rainbow.rotation.set(0, -0.4, 0);
  scene.add(rainbow);
  return rainbow;
}

// Collect all environment objects for cleanup
function createFullEnvironment(scene, levelIndex) {
  const envObjects = [];
  envObjects.push(createSun(scene, levelIndex));
  envObjects.push(createMountains(scene, levelIndex));
  envObjects.push(createTrees(scene, levelIndex));
  envObjects.push(createGroundPlane(scene, levelIndex));
  const grass = createGrassPatches(scene, levelIndex);
  if (grass) envObjects.push(grass);
  // Rainbow only on level 1
  if (levelIndex === 0) envObjects.push(createRainbow(scene));
  return envObjects;
}

// ============================================
// Section 7: INPUT MANAGER
// ============================================
class InputManager {
  constructor() {
    this.keys = {};
    this.horizontal = 0;
    this.vertical = 0;
    this.jump = false;
    this._jumpPressed = false;
    this.mouseX = 0;
    this.touchJoystick = { active: false, dx: 0, dy: 0 };
    this.touchJumpActive = false;

    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
    });
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
    // Mouse drag for camera
    this._isDragging = false;
    this._lastMouseX = 0;
    document.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this._isDragging = true;
        this._lastMouseX = e.clientX;
      }
    });
    document.addEventListener('mouseup', () => {
      this._isDragging = false;
    });
    document.addEventListener('mousemove', (e) => {
      if (this._isDragging) {
        const dx = e.clientX - this._lastMouseX;
        this.mouseX += dx * CONFIG.CAM_MOUSE_SENSITIVITY;
        this._lastMouseX = e.clientX;
      }
    });

    // Touch drag for camera (touches outside joystick/jump button)
    this._cameraTouchId = null;
    this._lastTouchX = 0;
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.addEventListener('touchstart', (e) => {
        if (this._cameraTouchId !== null) return;
        const touch = e.changedTouches[0];
        this._cameraTouchId = touch.identifier;
        this._lastTouchX = touch.clientX;
      }, { passive: true });
      gameContainer.addEventListener('touchmove', (e) => {
        for (const touch of e.changedTouches) {
          if (touch.identifier === this._cameraTouchId) {
            const dx = touch.clientX - this._lastTouchX;
            this.mouseX += dx * CONFIG.CAM_MOUSE_SENSITIVITY * 1.5;
            this._lastTouchX = touch.clientX;
          }
        }
      }, { passive: true });
      const endCameraTouch = (e) => {
        for (const touch of e.changedTouches) {
          if (touch.identifier === this._cameraTouchId) {
            this._cameraTouchId = null;
          }
        }
      };
      gameContainer.addEventListener('touchend', endCameraTouch, { passive: true });
      gameContainer.addEventListener('touchcancel', endCameraTouch, { passive: true });
    }

    this._setupTouchControls();
  }

  _setupTouchControls() {
    const joystickArea = document.getElementById('joystick-area');
    const joystickThumb = document.getElementById('joystick-thumb');
    const jumpBtn = document.getElementById('jump-btn-touch');
    if (!joystickArea || !jumpBtn) return;

    let joystickCenter = { x: 0, y: 0 };
    let joystickTouchId = null;

    joystickArea.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      joystickTouchId = touch.identifier;
      const rect = joystickArea.getBoundingClientRect();
      joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      this.touchJoystick.active = true;
    });

    joystickArea.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const touch of e.changedTouches) {
        if (touch.identifier === joystickTouchId) {
          const maxDist = 50;
          let dx = touch.clientX - joystickCenter.x;
          let dy = touch.clientY - joystickCenter.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > maxDist) { dx = (dx / dist) * maxDist; dy = (dy / dist) * maxDist; }
          this.touchJoystick.dx = dx / maxDist;
          this.touchJoystick.dy = dy / maxDist;
          joystickThumb.style.transform = `translate(${dx}px, ${dy}px)`;
        }
      }
    });

    const endJoystick = (e) => {
      for (const touch of e.changedTouches) {
        if (touch.identifier === joystickTouchId) {
          this.touchJoystick.active = false;
          this.touchJoystick.dx = 0;
          this.touchJoystick.dy = 0;
          joystickTouchId = null;
          joystickThumb.style.transform = 'translate(0, 0)';
        }
      }
    };
    joystickArea.addEventListener('touchend', endJoystick);
    joystickArea.addEventListener('touchcancel', endJoystick);

    jumpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.touchJumpActive = true; });
    jumpBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.touchJumpActive = false; });
    jumpBtn.addEventListener('touchcancel', () => { this.touchJumpActive = false; });
  }

  update() {
    this.horizontal = (this.keys['ArrowRight'] ? 1 : 0) - (this.keys['ArrowLeft'] ? 1 : 0);
    this.vertical = (this.keys['ArrowUp'] ? 1 : 0) - (this.keys['ArrowDown'] ? 1 : 0);
    if (this.touchJoystick.active) {
      this.horizontal = this.touchJoystick.dx;
      this.vertical = -this.touchJoystick.dy;
    }
    const jumpDown = this.keys['Space'] || this.touchJumpActive;
    this.jump = jumpDown && !this._jumpPressed;
    this._jumpPressed = jumpDown;
  }

  consumeMouseX() {
    const val = this.mouseX;
    this.mouseX = 0;
    return val;
  }
}

// ============================================
// Section 8: THIRD-PERSON CAMERA
// ============================================
class ThirdPersonCamera {
  constructor(camera) {
    this.camera = camera;
    this.currentPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();
    this.rotationY = 0;
    this.rotationX = 0.3;
  }

  update(dt, targetPos) {
    const offset = new THREE.Vector3(0, CONFIG.CAM_HEIGHT, -CONFIG.CAM_DISTANCE);
    offset.applyAxisAngle(new THREE.Vector3(1, 0, 0), this.rotationX * 0.3);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY);
    const idealPos = targetPos.clone().add(offset);

    const lookAhead = new THREE.Vector3(0, 1.5, CONFIG.CAM_LOOK_AHEAD);
    lookAhead.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY);
    const idealLookAt = targetPos.clone().add(lookAhead);

    const t = 1.0 - Math.pow(0.001, dt * CONFIG.CAM_LERP_SPEED);
    this.currentPosition.lerp(idealPos, t);
    this.currentLookAt.lerp(idealLookAt, t);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
  }
}

// ============================================
// Section 9: PHYSICS
// ============================================
class PhysicsController {
  constructor() {
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.isGrounded = false;
    this.wasGrounded = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.groundedPlatform = null;
  }

  reset() {
    this.velocity.set(0, 0, 0);
    this.isGrounded = false;
    this.wasGrounded = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.groundedPlatform = null;
  }

  update(dt, playerPos, playerHalfSize, platforms, input, cameraRotY) {
    this.velocity.y += CONFIG.GRAVITY * dt;
    if (this.velocity.y < CONFIG.MAX_FALL_SPEED) this.velocity.y = CONFIG.MAX_FALL_SPEED;

    const moveDir = new THREE.Vector3(-input.horizontal, 0, input.vertical);
    if (moveDir.lengthSq() > 0) moveDir.normalize();
    moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraRotY);

    const speed = this.isGrounded ? CONFIG.MOVE_SPEED : CONFIG.MOVE_SPEED * CONFIG.AIR_CONTROL;
    this.velocity.x = moveDir.x * speed;
    this.velocity.z = moveDir.z * speed;

    if (this.isGrounded && this.groundedPlatform && this.groundedPlatform.velocity) {
      this.velocity.x += this.groundedPlatform.velocity.x;
      this.velocity.z += this.groundedPlatform.velocity.z;
    }

    if (input.jump) this.jumpBufferTimer = CONFIG.JUMP_BUFFER_TIME;
    this.jumpBufferTimer -= dt;

    if (this.wasGrounded && !this.isGrounded) this.coyoteTimer = CONFIG.COYOTE_TIME;
    this.coyoteTimer -= dt;

    let jumped = false;
    if (this.jumpBufferTimer > 0 && (this.isGrounded || this.coyoteTimer > 0)) {
      this.velocity.y = CONFIG.JUMP_FORCE;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      jumped = true;
    }

    const displacement = this.velocity.clone().multiplyScalar(dt);
    const newPos = playerPos.clone().add(displacement);

    this.wasGrounded = this.isGrounded;
    this.isGrounded = false;
    this.groundedPlatform = null;

    const playerMin = new THREE.Vector3(
      newPos.x - playerHalfSize.x, newPos.y - playerHalfSize.y, newPos.z - playerHalfSize.z
    );
    const playerMax = new THREE.Vector3(
      newPos.x + playerHalfSize.x, newPos.y + playerHalfSize.y, newPos.z + playerHalfSize.z
    );
    const playerBox = new THREE.Box3(playerMin, playerMax);

    for (const platform of platforms) {
      if (!platform.isActive) continue;
      if (playerBox.intersectsBox(platform.collider)) {
        const resolution = this._resolveCollision(playerBox, platform.collider);
        newPos.add(resolution);
        playerBox.min.add(resolution);
        playerBox.max.add(resolution);
        if (resolution.y > 0.001) {
          this.isGrounded = true;
          this.velocity.y = 0;
          this.groundedPlatform = platform;
        }
        if (resolution.y < -0.001) this.velocity.y = 0;
      }
    }

    // Play landing sound
    if (this.isGrounded && !this.wasGrounded && !jumped) {
      soundManager.playLand();
    }
    if (jumped) {
      soundManager.playJump();
    }

    return newPos;
  }

  _resolveCollision(playerBox, platformBox) {
    const overlap = playerBox.clone().intersect(platformBox);
    const size = new THREE.Vector3();
    overlap.getSize(size);
    if (size.x <= 0 || size.y <= 0 || size.z <= 0) return new THREE.Vector3();

    const resolution = new THREE.Vector3();
    if (size.y <= size.x && size.y <= size.z) {
      const py = (playerBox.min.y + playerBox.max.y) / 2;
      const ply = (platformBox.min.y + platformBox.max.y) / 2;
      resolution.y = py > ply ? size.y : -size.y;
    } else if (size.x <= size.z) {
      const px = (playerBox.min.x + playerBox.max.x) / 2;
      const plx = (platformBox.min.x + platformBox.max.x) / 2;
      resolution.x = px > plx ? size.x : -size.x;
    } else {
      const pz = (playerBox.min.z + playerBox.max.z) / 2;
      const plz = (platformBox.min.z + platformBox.max.z) / 2;
      resolution.z = pz > plz ? size.z : -size.z;
    }
    return resolution;
  }
}

// ============================================
// Section 10: HUD CONTROLLER
// ============================================
class HUDController {
  constructor() {
    this.timerEl = document.getElementById('timer');
    this.stageEl = document.getElementById('stage-name');
    this.checkpointEl = document.getElementById('checkpoint-count');
    this.deathCountEl = document.getElementById('death-count');
    this.elapsed = 0;
    this.deaths = 0;
  }

  reset() {
    this.elapsed = 0;
    this.deaths = 0;
    this.deathCountEl.textContent = '0';
    this.timerEl.textContent = '00:00.00';
  }

  update(dt) {
    this.elapsed += dt;
    const mins = Math.floor(this.elapsed / 60);
    const secs = Math.floor(this.elapsed % 60);
    const ms = Math.floor((this.elapsed % 1) * 100);
    this.timerEl.textContent =
      `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  }

  setStage(name) { this.stageEl.textContent = name; }
  addDeath() { this.deaths++; this.deathCountEl.textContent = this.deaths; }
  setCheckpoint(current, total) { this.checkpointEl.textContent = `${current}/${total}`; }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  }
}

// ============================================
// Section 11: CHARACTER PREVIEW
// ============================================
function setupCharacterPreview(canvasId, type) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(canvas.width, canvas.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, canvas.width / canvas.height, 0.1, 100);
  camera.position.set(0, 0.8, 3.8);
  camera.lookAt(0, 0.1, 0);

  const ambient = new THREE.AmbientLight(0x606080, 0.8);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xFFFFDD, 1.2);
  dirLight.position.set(3, 5, 4);
  scene.add(dirLight);
  const backLight = new THREE.DirectionalLight(0x4488FF, 0.3);
  backLight.position.set(-2, 3, -3);
  scene.add(backLight);

  const model = createCharacterModel(type);
  scene.add(model);

  return { renderer, scene, camera, model };
}

// ============================================
// Section 12: MAIN GAME
// ============================================
class Game {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game-container').appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);

    this.input = new InputManager();
    this.hud = new HUDController();
    this.cameraController = new ThirdPersonCamera(this.camera);
    this.physics = new PhysicsController();

    this.characterType = null;
    this.characterModel = null;
    this.currentLevelIndex = 0;
    this.platforms = [];
    this.clouds = [];
    this.particles = null;
    this.envObjects = [];
    this.lastCheckpointPos = new THREE.Vector3();
    this.playerHalfSize = new THREE.Vector3(
      CONFIG.PLAYER_WIDTH / 2, CONFIG.PLAYER_HEIGHT / 2, CONFIG.PLAYER_DEPTH / 2
    );
    this.totalDeaths = 0;
    this.totalTime = 0;
    this.respawnFlashTimer = 0;

    this.state = GameState.TITLE;
    this.clock = new THREE.Clock();
    this.gameTime = 0;

    this.pigPreview = null;
    this.monkeyPreview = null;

    window.addEventListener('resize', () => this._onResize());
    this._setupUI();
    this._transitionState(GameState.TITLE);
    this._animate();
  }

  _setupUI() {
    document.getElementById('start-btn').addEventListener('click', () => {
      soundManager.init();
      soundManager.playMenuSelect();
      this._transitionState(GameState.CHARACTER_SELECT);
    });
    document.getElementById('pig-btn').addEventListener('click', () => {
      soundManager.playMenuSelect();
      this._selectCharacter('pig');
    });
    document.getElementById('monkey-btn').addEventListener('click', () => {
      soundManager.playMenuSelect();
      this._selectCharacter('monkey');
    });
    document.getElementById('pig-card').addEventListener('click', (e) => {
      if (e.target.id !== 'pig-btn') return;
    });
    document.getElementById('monkey-card').addEventListener('click', (e) => {
      if (e.target.id !== 'monkey-btn') return;
    });
    document.getElementById('resume-btn').addEventListener('click', () => {
      soundManager.playMenuSelect();
      this._transitionState(GameState.PLAYING);
    });
    document.getElementById('restart-btn').addEventListener('click', () => {
      soundManager.playMenuSelect();
      this._restartLevel();
    });
    document.getElementById('menu-btn').addEventListener('click', () => {
      soundManager.playMenuSelect();
      this._goToMenu();
    });
    document.getElementById('retry-btn').addEventListener('click', () => {
      soundManager.playMenuSelect();
      this._restartLevel();
    });
    document.getElementById('next-stage-btn').addEventListener('click', () => {
      soundManager.playMenuSelect();
      this._nextLevel();
    });
    document.getElementById('all-clear-menu-btn').addEventListener('click', () => {
      soundManager.playMenuSelect();
      this._goToMenu();
    });

    // Pause button (☰) for mobile & desktop
    const pauseBtn = document.getElementById('pause-btn-touch');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.state === GameState.PLAYING) {
          this._transitionState(GameState.PAUSED);
        } else if (this.state === GameState.PAUSED) {
          this._transitionState(GameState.PLAYING);
        }
      });
    }

    // Mobile back button → pause/resume (uses history API)
    window.history.replaceState({ game: true }, '');
    window.addEventListener('popstate', (e) => {
      // Push state back so back button keeps working
      window.history.pushState({ game: true }, '');
      if (this.state === GameState.PLAYING) {
        this._transitionState(GameState.PAUSED);
      } else if (this.state === GameState.PAUSED) {
        this._transitionState(GameState.PLAYING);
      }
    });

    // Keyboard menu navigation
    this._menuIndex = 0;
    this._menuButtons = [];

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        if (this.state === GameState.PLAYING) {
          this._transitionState(GameState.PAUSED);
        } else if (this.state === GameState.PAUSED) {
          this._transitionState(GameState.PLAYING);
        }
        return;
      }

      if (this.state !== GameState.PLAYING) {
        if (e.code === 'ArrowDown' || e.code === 'ArrowRight') {
          e.preventDefault();
          this._menuIndex = (this._menuIndex + 1) % this._menuButtons.length;
          this._updateMenuFocus();
          soundManager.playMenuMove();
        } else if (e.code === 'ArrowUp' || e.code === 'ArrowLeft') {
          e.preventDefault();
          this._menuIndex = (this._menuIndex - 1 + this._menuButtons.length) % this._menuButtons.length;
          this._updateMenuFocus();
          soundManager.playMenuMove();
        } else if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          soundManager.init();
          if (this._menuButtons[this._menuIndex]) {
            this._menuButtons[this._menuIndex].click();
          }
        }
      }
    });
  }

  _updateMenuButtons() {
    const buttonMap = {
      [GameState.TITLE]: ['start-btn'],
      [GameState.CHARACTER_SELECT]: ['pig-btn', 'monkey-btn'],
      [GameState.PAUSED]: ['resume-btn', 'restart-btn', 'menu-btn'],
      [GameState.GAME_OVER]: ['retry-btn'],
      [GameState.STAGE_CLEAR]: ['next-stage-btn'],
      [GameState.ALL_CLEAR]: ['all-clear-menu-btn'],
    };
    const ids = buttonMap[this.state] || [];
    this._menuButtons = ids.map(id => document.getElementById(id)).filter(Boolean);
    this._menuIndex = 0;
    this._updateMenuFocus();
  }

  _updateMenuFocus() {
    document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('btn-focused'));
    if (this._menuButtons[this._menuIndex]) {
      this._menuButtons[this._menuIndex].classList.add('btn-focused');
    }
  }

  _transitionState(newState) {
    const oldState = this.state;
    this.state = newState;

    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));

    const screenMap = {
      [GameState.TITLE]: 'title-screen',
      [GameState.CHARACTER_SELECT]: 'character-select',
      [GameState.PAUSED]: 'pause-menu',
      [GameState.GAME_OVER]: 'game-over',
      [GameState.STAGE_CLEAR]: 'stage-clear',
      [GameState.ALL_CLEAR]: 'all-clear',
    };

    if (screenMap[newState]) {
      document.getElementById(screenMap[newState]).classList.add('active');
    }

    if (newState === GameState.PLAYING) {
      document.getElementById('hud').classList.add('active');
      // Push history state so mobile back button works
      window.history.pushState({ game: true }, '');
    }

    // Show/hide pause button: visible during PLAYING and PAUSED
    const pauseBtn = document.getElementById('pause-btn-touch');
    if (pauseBtn) {
      if (newState === GameState.PLAYING || newState === GameState.PAUSED) {
        pauseBtn.classList.add('visible');
      } else {
        pauseBtn.classList.remove('visible');
      }
    }

    if (newState === GameState.CHARACTER_SELECT) {
      if (!this.pigPreview) this.pigPreview = setupCharacterPreview('pig-preview', 'pig');
      if (!this.monkeyPreview) this.monkeyPreview = setupCharacterPreview('monkey-preview', 'monkey');
    }

    if (newState === GameState.STAGE_CLEAR) {
      document.getElementById('clear-time').textContent = this.hud.formatTime(this.hud.elapsed);
      document.getElementById('clear-deaths').textContent = this.hud.deaths;
      soundManager.playClear();
      soundManager.stopBGM();
    }

    if (newState === GameState.ALL_CLEAR) {
      document.getElementById('total-time').textContent = this.hud.formatTime(this.totalTime);
      document.getElementById('total-deaths').textContent = this.totalDeaths;
      soundManager.playClear();
      soundManager.stopBGM();
    }

    if (newState === GameState.TITLE) {
      soundManager.stopBGM();
    }

    this._updateMenuButtons();
  }

  _selectCharacter(type) {
    this.characterType = type;
    this.totalDeaths = 0;
    this.totalTime = 0;

    if (this.characterModel) this.scene.remove(this.characterModel);
    this.characterModel = createCharacterModel(type);
    this.scene.add(this.characterModel);

    this._loadLevel(0);
    this._transitionState(GameState.PLAYING);
  }

  _loadLevel(index) {
    for (const p of this.platforms) p.removeFromScene(this.scene);
    for (const c of this.clouds) this.scene.remove(c);
    if (this.particles) this.scene.remove(this.particles);
    if (this.envObjects) this.envObjects.forEach(o => this.scene.remove(o));
    this.platforms = [];
    this.clouds = [];
    this.envObjects = [];

    const toRemove = [];
    this.scene.traverse((child) => { if (child instanceof THREE.Light) toRemove.push(child); });
    toRemove.forEach(l => this.scene.remove(l));

    const levelDef = LEVELS[index];
    this.currentLevelIndex = index;

    this.scene.background = new THREE.Color(levelDef.skyColor);
    this.scene.fog = new THREE.Fog(levelDef.fogColor, CONFIG.FOG_NEAR, CONFIG.FOG_FAR);

    // Enhanced lighting
    const ambient = new THREE.AmbientLight(0x606080, 0.6);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xFFFFDD, 1.0);
    sun.position.set(50, 80, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 200;
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;
    this.scene.add(sun);

    const hemiLight = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 0.35);
    this.scene.add(hemiLight);

    // Rim light for dramatic effect
    const rimLight = new THREE.DirectionalLight(0x4488FF, 0.25);
    rimLight.position.set(-30, 20, -40);
    this.scene.add(rimLight);

    // Platforms
    let checkpointCount = 0;
    for (const def of levelDef.platforms) {
      const platform = createPlatform(def);
      platform.addToScene(this.scene);
      this.platforms.push(platform);
      if (platform.isCheckpoint) checkpointCount++;
    }

    // Clouds
    for (const dec of levelDef.decorations) {
      if (dec.type === 'cloud') {
        const cloud = createCloud(dec.pos);
        this.scene.add(cloud);
        this.clouds.push(cloud);
      }
    }

    // Floating particles
    this.particles = createParticles(this.scene, index);

    // Rich environment (sun, mountains, trees, ground, grass, rainbow)
    this.envObjects = createFullEnvironment(this.scene, index);

    // HUD
    this.hud.reset();
    this.hud.setStage(levelDef.name);
    this.hud.setCheckpoint(0, checkpointCount);

    // Spawn
    const startPlatform = this.platforms.find(p => p.isStart);
    const spawnPos = startPlatform.mesh.position.clone().add(new THREE.Vector3(0, 2, 0));
    this.characterModel.position.copy(spawnPos);
    this.lastCheckpointPos.copy(spawnPos);
    this.physics.reset();

    this.cameraController.currentPosition.copy(
      spawnPos.clone().add(new THREE.Vector3(0, CONFIG.CAM_HEIGHT, -CONFIG.CAM_DISTANCE))
    );
    this.cameraController.currentLookAt.copy(spawnPos);

    this.gameTime = 0;

    // Start BGM
    soundManager.stopBGM();
    soundManager.startBGM(index);
  }

  _respawn() {
    this.characterModel.position.copy(this.lastCheckpointPos);
    this.physics.reset();
    this.hud.addDeath();
    this.respawnFlashTimer = CONFIG.RESPAWN_FLASH_TIME;
    soundManager.playDeath();
  }

  _restartLevel() {
    this._loadLevel(this.currentLevelIndex);
    this._transitionState(GameState.PLAYING);
  }

  _nextLevel() {
    if (this.currentLevelIndex + 1 < LEVELS.length) {
      this._loadLevel(this.currentLevelIndex + 1);
      this._transitionState(GameState.PLAYING);
    } else {
      this._transitionState(GameState.ALL_CLEAR);
    }
  }

  _goToMenu() {
    if (this.characterModel) {
      this.scene.remove(this.characterModel);
      this.characterModel = null;
    }
    for (const p of this.platforms) p.removeFromScene(this.scene);
    for (const c of this.clouds) this.scene.remove(c);
    if (this.particles) this.scene.remove(this.particles);
    if (this.envObjects) this.envObjects.forEach(o => this.scene.remove(o));
    this.platforms = [];
    this.clouds = [];
    this.envObjects = [];
    soundManager.stopBGM();
    this._transitionState(GameState.TITLE);
  }

  _checkFinish() {
    const finishPlatform = this.platforms.find(p => p.isFinish);
    if (!finishPlatform || !this.physics.isGrounded) return;

    const playerPos = this.characterModel.position;
    const platPos = finishPlatform.mesh.position;
    const dx = Math.abs(playerPos.x - platPos.x);
    const dz = Math.abs(playerPos.z - platPos.z);
    const size = finishPlatform.mesh.geometry.parameters;

    if (dx < size.width / 2 && dz < size.depth / 2) {
      this.totalTime += this.hud.elapsed;
      this.totalDeaths += this.hud.deaths;

      if (this.currentLevelIndex + 1 < LEVELS.length) {
        this._transitionState(GameState.STAGE_CLEAR);
      } else {
        this._transitionState(GameState.ALL_CLEAR);
      }
    }
  }

  _checkCheckpoints() {
    const playerPos = this.characterModel.position;
    let activatedCount = 0;
    let totalCount = 0;

    for (const platform of this.platforms) {
      if (!platform.isCheckpoint) continue;
      totalCount++;
      if (platform.checkpointActivated) { activatedCount++; continue; }

      const platPos = platform.mesh.position;
      const dx = Math.abs(playerPos.x - platPos.x);
      const dz = Math.abs(playerPos.z - platPos.z);
      const dy = playerPos.y - platPos.y;

      if (dx < 2.5 && dz < 2.5 && dy > 0 && dy < 3) {
        platform.activateCheckpoint();
        this.lastCheckpointPos.set(platPos.x, platPos.y + 2, platPos.z);
        activatedCount++;
        soundManager.playCheckpoint();
      }
    }
    this.hud.setCheckpoint(activatedCount, totalCount);
  }

  _animate() {
    requestAnimationFrame(() => this._animate());
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.gameTime += dt;

    if (this.state === GameState.CHARACTER_SELECT) {
      if (this.pigPreview) {
        this.pigPreview.model.rotation.y += dt * 1.2;
        this.pigPreview.renderer.render(this.pigPreview.scene, this.pigPreview.camera);
      }
      if (this.monkeyPreview) {
        this.monkeyPreview.model.rotation.y += dt * 1.2;
        this.monkeyPreview.renderer.render(this.monkeyPreview.scene, this.monkeyPreview.camera);
      }
    }

    if (this.state === GameState.PLAYING && this.characterModel) {
      this.input.update();

      for (const p of this.platforms) p.update(dt, this.gameTime);

      const mouseX = this.input.consumeMouseX();
      this.cameraController.rotationY += mouseX;

      const activePlatforms = this.platforms.filter(p => p.isActive);
      const newPos = this.physics.update(
        dt, this.characterModel.position, this.playerHalfSize,
        activePlatforms, this.input, this.cameraController.rotationY
      );
      this.characterModel.position.copy(newPos);

      if (Math.abs(this.input.horizontal) > 0.1 || Math.abs(this.input.vertical) > 0.1) {
        const angle = Math.atan2(-this.input.horizontal, this.input.vertical)
          + this.cameraController.rotationY;
        const currentY = this.characterModel.rotation.y;
        let diff = angle - currentY;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.characterModel.rotation.y += diff * Math.min(1, dt * 12);
      }

      // Idle bob + squash/stretch on land
      const bob = Math.sin(this.gameTime * 3) * 0.003;
      this.characterModel.position.y += bob;

      if (this.characterModel.position.y < CONFIG.KILL_Y) this._respawn();

      if (this.respawnFlashTimer > 0) {
        this.respawnFlashTimer -= dt;
        this.characterModel.visible = this.respawnFlashTimer > 0 ? Math.sin(this.respawnFlashTimer * 20) > 0 : true;
      } else {
        this.characterModel.visible = true;
      }

      this._checkCheckpoints();
      this._checkFinish();
      this.cameraController.update(dt, this.characterModel.position);
      this.hud.update(dt);

      // Animate clouds
      for (const cloud of this.clouds) {
        cloud.position.x += Math.sin(this.gameTime * 0.15 + cloud.position.z * 0.1) * 0.005;
      }

      // Animate particles
      if (this.particles) {
        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += dt * 0.3;
          if (positions[i + 1] > 40) positions[i + 1] = 0;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    // Cap pixel ratio: 2 on mobile for performance, 2 on desktop
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const maxDPR = isMobile ? 2 : 2;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));
    this.renderer.setSize(w, h);
  }
}

// ============================================
// Section 13: BOOTSTRAP
// ============================================
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
