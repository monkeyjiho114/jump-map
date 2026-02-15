// ============================================
// LEVEL DATA
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
// PLATFORM CLASSES
// ============================================
class StaticPlatform {
  constructor(def) {
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
// ENVIRONMENT
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

function createSun(scene, levelIndex) {
  const group = new THREE.Group();
  const sunColors = [0xFFDD44, 0xFFAA33, 0xFF4422];
  const sunColor = sunColors[levelIndex % 3];
  const sunGeo = new THREE.SphereGeometry(5, 24, 20);
  const sunMat = new THREE.MeshBasicMaterial({ color: sunColor });
  const sun = new THREE.Mesh(sunGeo, sunMat);

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
    { colors: [0x4A8C3F, 0x3D7A34, 0x5B9E4E], snow: false },
    { colors: [0x8B7355, 0x7A6448, 0x9C8462], snow: true },
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
  if (levelIndex === 2) return trees;

  const trunkMat = new THREE.MeshPhongMaterial({ color: 0x6B4226, shininess: 10 });
  const leafColors = levelIndex === 0
    ? [0x2E7D32, 0x388E3C, 0x43A047]
    : [0xE8A030, 0xD4943A, 0xC08030];

  for (let i = 0; i < 30; i++) {
    const tree = new THREE.Group();

    const trunkH = 12 + Math.random() * 18;
    const trunkR = 0.3 + Math.random() * 0.5;
    const trunkGeo = new THREE.CylinderGeometry(trunkR * 0.6, trunkR, trunkH, 8);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    tree.add(trunk);

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
  if (levelIndex === 2) return null;
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
  rainbow.position.set(40, -10, 90);
  rainbow.rotation.set(0, -0.4, 0);
  scene.add(rainbow);
  return rainbow;
}

function createFullEnvironment(scene, levelIndex) {
  const envObjects = [];
  envObjects.push(createSun(scene, levelIndex));
  envObjects.push(createMountains(scene, levelIndex));
  envObjects.push(createTrees(scene, levelIndex));
  envObjects.push(createGroundPlane(scene, levelIndex));
  const grass = createGrassPatches(scene, levelIndex);
  if (grass) envObjects.push(grass);
  if (levelIndex === 0) envObjects.push(createRainbow(scene));
  return envObjects;
}
