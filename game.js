// ============================================
// MAIN GAME CLASS
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
    this.quizManager = new QuizManager();

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

    // 난이도 설정 (1~10)
    this.gameDifficulty = 5;   // 기본 보통
    this.quizDifficulty = 3;   // 기본 쉬운 단어
    this._difficultyFocusIndex = 0; // 0: 게임 난이도, 1: 퀴즈 난이도

    // 체크포인트별 퀴즈 완료 여부 추적
    this._checkpointQuizDone = [];

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

    // Difficulty selection
    const diffArrows = document.querySelectorAll('.diff-arrow');
    diffArrows.forEach(arrow => {
      arrow.addEventListener('click', () => {
        const target = arrow.getAttribute('data-target'); // 'game' or 'quiz'
        const dir = parseInt(arrow.getAttribute('data-dir')); // -1 or 1

        if (target === 'game') {
          this.gameDifficulty = Math.max(1, Math.min(10, this.gameDifficulty + dir));
          this._updateDifficultyDisplay('game', this.gameDifficulty);
        } else if (target === 'quiz') {
          this.quizDifficulty = Math.max(1, Math.min(10, this.quizDifficulty + dir));
          this._updateDifficultyDisplay('quiz', this.quizDifficulty);
        }
        soundManager.playMenuMove();
      });
    });

    // Initialize difficulty displays
    this._updateDifficultyDisplay('game', this.gameDifficulty);
    this._updateDifficultyDisplay('quiz', this.quizDifficulty);

    // Pause button for mobile & desktop
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

    // Mobile back button
    window.history.replaceState({ game: true }, '');
    window.addEventListener('popstate', (e) => {
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

      if (this.state !== GameState.PLAYING && this.state !== GameState.QUIZ) {
        // 타이틀 화면: 난이도 선택 키보드 제어
        if (this.state === GameState.TITLE) {
          if (e.code === 'ArrowDown') {
            e.preventDefault();
            this._difficultyFocusIndex = (this._difficultyFocusIndex + 1) % 2;
            this._updateDifficultyFocus();
            soundManager.playMenuMove();
          } else if (e.code === 'ArrowUp') {
            e.preventDefault();
            this._difficultyFocusIndex = (this._difficultyFocusIndex - 1 + 2) % 2;
            this._updateDifficultyFocus();
            soundManager.playMenuMove();
          } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            if (this._difficultyFocusIndex === 0) {
              this.gameDifficulty = Math.max(1, this.gameDifficulty - 1);
              this._updateDifficultyDisplay('game', this.gameDifficulty);
            } else {
              this.quizDifficulty = Math.max(1, this.quizDifficulty - 1);
              this._updateDifficultyDisplay('quiz', this.quizDifficulty);
            }
            soundManager.playMenuMove();
          } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            if (this._difficultyFocusIndex === 0) {
              this.gameDifficulty = Math.min(10, this.gameDifficulty + 1);
              this._updateDifficultyDisplay('game', this.gameDifficulty);
            } else {
              this.quizDifficulty = Math.min(10, this.quizDifficulty + 1);
              this._updateDifficultyDisplay('quiz', this.quizDifficulty);
            }
            soundManager.playMenuMove();
          } else if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            soundManager.init();
            document.getElementById('start-btn').click();
          }
        } else {
          // 다른 화면: 메뉴 버튼 네비게이션
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

  _updateDifficultyDisplay(target, level) {
    const starsEl = document.getElementById(`${target}-diff-stars`);
    const numberEl = document.getElementById(`${target}-diff-number`);
    const descEl = document.getElementById(`${target}-diff-desc`);

    if (starsEl) starsEl.textContent = '★'.repeat(level);
    if (numberEl) numberEl.textContent = level;

    if (descEl) {
      if (target === 'game') {
        const gameDescs = {
          1: '아주 쉬움', 2: '매우 쉬움', 3: '쉬움', 4: '조금 쉬움', 5: '보통',
          6: '조금 어려움', 7: '어려움', 8: '매우 어려움', 9: '아주 어려움', 10: '최고 난이도'
        };
        descEl.textContent = gameDescs[level] || '보통';
      } else if (target === 'quiz') {
        const quizDescs = {
          1: '기초 단어', 2: '쉬운 단어', 3: '기본 단어', 4: '인사 표현', 5: '짧은 표현',
          6: '짧은 문장', 7: '의문문', 8: '공손한 요청', 9: '복합 문장', 10: '긴 대화 문장'
        };
        descEl.textContent = quizDescs[level] || '기본 단어';
      }
    }
  }

  _updateDifficultyFocus() {
    // 난이도 행에 포커스 표시
    document.querySelectorAll('.difficulty-row').forEach((row, idx) => {
      if (idx === this._difficultyFocusIndex) {
        row.style.backgroundColor = 'rgba(255, 152, 0, 0.15)';
        row.style.borderRadius = '8px';
      } else {
        row.style.backgroundColor = '';
        row.style.borderRadius = '';
      }
    });
  }

  _getDifficultyMultipliers() {
    const d = this.gameDifficulty;

    // 플랫폼 크기: 1 = 1.5배 크게, 10 = 0.6배 작게
    const platformSizeMultiplier = 1.5 - (d - 1) * 0.1;

    // 이동 속도: 1 = 0.5배 느리게, 10 = 1.4배 빠르게
    const movingSpeedMultiplier = 0.5 + (d - 1) * 0.1;

    // 소멸 플랫폼 보이는 시간: 1 = 1.5배 길게, 10 = 0.7배 짧게
    const disappearVisibleMul = 1.5 - (d - 1) * 0.089;

    // 소멸 플랫폼 숨어있는 시간: 1 = 0.7배 짧게, 10 = 1.3배 길게
    const disappearHiddenMul = 0.7 + (d - 1) * 0.067;

    return {
      platformSizeMultiplier,
      movingSpeedMultiplier,
      disappearVisibleMul,
      disappearHiddenMul
    };
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
      [GameState.QUIZ]: 'quiz-screen',
    };

    if (screenMap[newState]) {
      document.getElementById(screenMap[newState]).classList.add('active');
    }

    // HUD stays visible during PLAYING and QUIZ
    if (newState === GameState.PLAYING || newState === GameState.QUIZ) {
      document.getElementById('hud').classList.add('active');
    }

    if (newState === GameState.PLAYING) {
      window.history.pushState({ game: true }, '');
    }

    // Show/hide pause button: visible during PLAYING, PAUSED, QUIZ
    const pauseBtn = document.getElementById('pause-btn-touch');
    if (pauseBtn) {
      if (newState === GameState.PLAYING || newState === GameState.PAUSED || newState === GameState.QUIZ) {
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
      this._difficultyFocusIndex = 0;
      this._updateDifficultyFocus();
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

    // 퀴즈 난이도 설정
    this.quizManager.setQuizDifficulty(this.quizDifficulty);

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

    const rimLight = new THREE.DirectionalLight(0x4488FF, 0.25);
    rimLight.position.set(-30, 20, -40);
    this.scene.add(rimLight);

    // Get difficulty multipliers
    const multipliers = this._getDifficultyMultipliers();

    // Platforms (apply difficulty multipliers)
    let checkpointCount = 0;
    for (const def of levelDef.platforms) {
      // Clone platform definition and apply difficulty scaling
      const adjustedDef = { ...def };

      // Apply size multiplier
      adjustedDef.width = def.width * multipliers.platformSizeMultiplier;
      adjustedDef.depth = def.depth * multipliers.platformSizeMultiplier;

      // Apply movement speed multiplier
      if (def.movement) {
        adjustedDef.movement = { ...def.movement };
        if (def.movement.speed) {
          adjustedDef.movement.speed = def.movement.speed * multipliers.movingSpeedMultiplier;
        }
      }

      // Apply disappear timing multipliers
      if (def.disappear) {
        adjustedDef.disappear = { ...def.disappear };
        if (def.disappear.visibleTime) {
          adjustedDef.disappear.visibleTime = def.disappear.visibleTime * multipliers.disappearVisibleMul;
        }
        if (def.disappear.hiddenTime) {
          adjustedDef.disappear.hiddenTime = def.disappear.hiddenTime * multipliers.disappearHiddenMul;
        }
      }

      const platform = createPlatform(adjustedDef);
      platform.addToScene(this.scene);
      this.platforms.push(platform);
      if (platform.isCheckpoint) checkpointCount++;
    }

    // 체크포인트 퀴즈 완료 추적 초기화
    this._checkpointQuizDone = new Array(checkpointCount).fill(false);

    // Quiz manager 레벨 초기화
    this.quizManager.resetForLevel(index);

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

    // Rich environment
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
    let checkpointIdx = 0;

    for (const platform of this.platforms) {
      if (!platform.isCheckpoint) continue;
      const cpIdx = checkpointIdx;
      checkpointIdx++;
      totalCount++;
      if (platform.checkpointActivated) { activatedCount++; continue; }

      const platPos = platform.mesh.position;
      const dx = Math.abs(playerPos.x - platPos.x);
      const dz = Math.abs(playerPos.z - platPos.z);
      const dy = playerPos.y - platPos.y;

      if (dx < 2.5 && dz < 2.5 && dy > 0 && dy < 3) {
        // 퀴즈가 아직 완료되지 않았으면 퀴즈 출제
        if (!this._checkpointQuizDone[cpIdx]) {
          this._checkpointQuizDone[cpIdx] = true;
          const triggered = this.quizManager.triggerQuiz(cpIdx, () => {
            // 퀴즈 완료 콜백: 체크포인트 활성화 + 게임 복귀
            platform.activateCheckpoint();
            this.lastCheckpointPos.set(platPos.x, platPos.y + 2, platPos.z);
            soundManager.playCheckpoint();
            this._transitionState(GameState.PLAYING);
          });
          if (triggered) {
            this._transitionState(GameState.QUIZ);
            return; // 퀴즈 중이므로 나머지 체크포인트 검사 중단
          } else {
            // 퀴즈 데이터 없으면 바로 활성화
            platform.activateCheckpoint();
            this.lastCheckpointPos.set(platPos.x, platPos.y + 2, platPos.z);
            activatedCount++;
            soundManager.playCheckpoint();
          }
        }
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

    // QUIZ 상태: 물리 멈춤, 시각 애니메이션은 유지
    if (this.state === GameState.QUIZ && this.characterModel) {
      for (const p of this.platforms) p.update(dt, this.gameTime);
      for (const cloud of this.clouds) {
        cloud.position.x += Math.sin(this.gameTime * 0.15 + cloud.position.z * 0.1) * 0.005;
      }
      if (this.particles) {
        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += dt * 0.3;
          if (positions[i + 1] > 40) positions[i + 1] = 0;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
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

      // Idle bob
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
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const maxDPR = isMobile ? 2 : 2;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));
    this.renderer.setSize(w, h);
  }
}

// ============================================
// BOOTSTRAP
// ============================================
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
