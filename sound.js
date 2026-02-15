// ============================================
// CONFIG & GAME STATE
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
  QUIZ: 'quiz',
  GAME_OVER: 'game_over',
  STAGE_CLEAR: 'stage_clear',
  ALL_CLEAR: 'all_clear',
};

// ============================================
// SOUND SYSTEM (Web Audio API)
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

  playQuizCorrect() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => {
      this._playTone(f, 0.3, 'sine', this.sfxGain, 0.25, i * 0.08);
    });
  }

  playQuizWrong() {
    this._playTone(300, 0.25, 'triangle', this.sfxGain, 0.15);
    this._playTone(250, 0.3, 'triangle', this.sfxGain, 0.12, 0.15);
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

    const melodies = [
      { notes: [
        { f: 523, d: 0.3 }, { f: 587, d: 0.3 }, { f: 659, d: 0.3 }, { f: 784, d: 0.6 },
        { f: 659, d: 0.3 }, { f: 523, d: 0.3 }, { f: 659, d: 0.3 }, { f: 587, d: 0.6 },
        { f: 523, d: 0.3 }, { f: 392, d: 0.3 }, { f: 440, d: 0.3 }, { f: 523, d: 0.6 },
        { f: 659, d: 0.3 }, { f: 784, d: 0.3 }, { f: 880, d: 0.3 }, { f: 784, d: 0.6 },
        { f: 659, d: 0.3 }, { f: 587, d: 0.3 }, { f: 523, d: 0.6 }, { f: 392, d: 0.6 },
      ], bass: [262, 330, 196, 262, 330, 262, 196, 262, 330, 262], pad: [523, 659, 784] },
      { notes: [
        { f: 440, d: 0.4 }, { f: 523, d: 0.4 }, { f: 494, d: 0.4 }, { f: 440, d: 0.8 },
        { f: 392, d: 0.4 }, { f: 440, d: 0.4 }, { f: 523, d: 0.8 }, { f: 494, d: 0.4 },
        { f: 440, d: 0.4 }, { f: 392, d: 0.4 }, { f: 349, d: 0.8 }, { f: 392, d: 0.4 },
        { f: 440, d: 0.4 }, { f: 523, d: 0.4 }, { f: 494, d: 0.4 }, { f: 440, d: 0.8 },
      ], bass: [220, 175, 196, 220, 175, 220, 196, 220], pad: [440, 523, 659] },
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

    m.notes.forEach(note => {
      this._playTone(note.f, note.d * 0.85, 'sine', this.bgmGain, 0.3, time);
      this._playTone(note.f * 1.5, note.d * 0.7, 'sine', this.bgmGain, 0.08, time);
      time += note.d;
    });

    const bassInterval = time / m.bass.length;
    m.bass.forEach((f, i) => {
      this._playTone(f, bassInterval * 0.9, 'triangle', this.bgmGain, 0.2, i * bassInterval);
    });

    if (m.pad) {
      m.pad.forEach(f => {
        this._playTone(f, time * 0.95, 'sine', this.bgmGain, 0.06, 0);
      });
    }

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
