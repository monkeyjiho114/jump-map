// ============================================
// INPUT MANAGER
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
// THIRD-PERSON CAMERA
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
// PHYSICS
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
// HUD CONTROLLER
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
