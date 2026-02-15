// ============================================
// CHARACTER MODELS
// ============================================
function createBungeoppangBody() {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0xD4943A });
  const darkMat = new THREE.MeshLambertMaterial({ color: 0xB07828 });
  const bellyMat = new THREE.MeshLambertMaterial({ color: 0xE8C070 });
  const lineMat = new THREE.MeshLambertMaterial({ color: 0x8B5A1B });
  const tailMat = new THREE.MeshLambertMaterial({ color: 0xC48530 });

  const bodyGeo = new THREE.SphereGeometry(1, 28, 20);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.scale.set(0.55, 0.50, 0.95);
  body.castShadow = true;
  group.add(body);

  const bellyGeo = new THREE.SphereGeometry(0.88, 18, 12);
  const belly = new THREE.Mesh(bellyGeo, bellyMat);
  belly.scale.set(0.44, 0.30, 0.72);
  belly.position.set(0, -0.14, 0.02);
  group.add(belly);

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

  const tailCGeo = new THREE.SphereGeometry(0.12, 8, 6);
  const tailC = new THREE.Mesh(tailCGeo, tailMat);
  tailC.position.set(0, 0.02, -0.80);
  tailC.scale.set(0.8, 0.6, 1.2);
  group.add(tailC);

  for (let t = 0; t < 3; t++) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.25, 0.008), lineMat);
    stripe.position.set(0.14, 0.06, -0.92 - t * 0.06);
    stripe.rotation.set(0.4, 0, 0.45);
    group.add(stripe);
    const stripe2 = stripe.clone();
    stripe2.position.set(-0.14, 0.06, -0.92 - t * 0.06);
    stripe2.rotation.set(0.4, 0, -0.45);
    group.add(stripe2);
  }

  const dorsalGeo = new THREE.SphereGeometry(0.08, 8, 6);
  const dorsal = new THREE.Mesh(dorsalGeo, bodyMat);
  dorsal.position.set(0, 0.47, -0.15);
  dorsal.scale.set(1, 0.7, 1.5);
  group.add(dorsal);

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

  const scaleLine = new THREE.MeshLambertMaterial({ color: 0x9B6A1F, side: THREE.DoubleSide });
  for (let side = -1; side <= 1; side += 2) {
    for (let row = 0; row < 3; row++) {
      const z = -0.25 + row * 0.28;
      const r = 0.22 - row * 0.02;
      const arcGeo = new THREE.TorusGeometry(r, 0.02, 6, 16, Math.PI);
      const arc = new THREE.Mesh(arcGeo, scaleLine);
      arc.position.set(side * 0.53, 0.05, z);
      arc.rotation.set(Math.PI / 2, Math.PI / 2, 0);
      arc.rotateZ(side > 0 ? 0 : Math.PI);
      arc.scale.set(0.8, 1, 1);
      group.add(arc);
    }
  }

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

  const headGeo = new THREE.SphereGeometry(0.44, 20, 16);
  const head = new THREE.Mesh(headGeo, pinkMat);
  head.scale.set(1, 0.95, 0.9);
  head.castShadow = true;
  group.add(head);

  const snoutGeo = new THREE.CylinderGeometry(0.16, 0.2, 0.14, 16);
  const snout = new THREE.Mesh(snoutGeo, darkPinkMat);
  snout.position.set(0, -0.06, 0.38);
  snout.rotation.set(Math.PI / 2, 0, 0);
  snout.castShadow = true;
  group.add(snout);

  const snoutFaceGeo = new THREE.CircleGeometry(0.16, 16);
  const snoutFace = new THREE.Mesh(snoutFaceGeo, darkPinkMat);
  snoutFace.position.set(0, -0.06, 0.45);
  group.add(snoutFace);

  const nostrilGeo = new THREE.SphereGeometry(0.035, 8, 6);
  const nostrilL = new THREE.Mesh(nostrilGeo, blackMat);
  nostrilL.position.set(-0.06, -0.06, 0.455);
  nostrilL.scale.set(1, 0.7, 0.4);
  group.add(nostrilL);
  const nostrilR = new THREE.Mesh(nostrilGeo, blackMat);
  nostrilR.position.set(0.06, -0.06, 0.455);
  nostrilR.scale.set(1, 0.7, 0.4);
  group.add(nostrilR);

  const eyeWhiteGeo = new THREE.SphereGeometry(0.1, 12, 10);
  const eyePupilGeo = new THREE.SphereGeometry(0.065, 10, 8);
  const eyeHighGeo = new THREE.SphereGeometry(0.025, 6, 6);

  const eyeL = new THREE.Mesh(eyeWhiteGeo, whiteMat);
  eyeL.position.set(-0.16, 0.1, 0.32);
  group.add(eyeL);
  const pupilL = new THREE.Mesh(eyePupilGeo, blackMat);
  pupilL.position.set(-0.16, 0.1, 0.4);
  group.add(pupilL);
  const highL = new THREE.Mesh(eyeHighGeo, whiteMat);
  highL.position.set(-0.13, 0.13, 0.44);
  group.add(highL);

  const eyeR = new THREE.Mesh(eyeWhiteGeo, whiteMat);
  eyeR.position.set(0.16, 0.1, 0.32);
  group.add(eyeR);
  const pupilR = new THREE.Mesh(eyePupilGeo, blackMat);
  pupilR.position.set(0.16, 0.1, 0.4);
  group.add(pupilR);
  const highR = new THREE.Mesh(eyeHighGeo, whiteMat);
  highR.position.set(0.19, 0.13, 0.44);
  group.add(highR);

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

  const blushMat = new THREE.MeshPhongMaterial({ color: 0xFF8A9E, transparent: true, opacity: 0.6 });
  const blushGeo = new THREE.SphereGeometry(0.07, 10, 8);
  const blushL = new THREE.Mesh(blushGeo, blushMat);
  blushL.position.set(-0.3, -0.02, 0.26);
  blushL.scale.set(1.2, 0.7, 0.3);
  group.add(blushL);
  const blushR = new THREE.Mesh(blushGeo, blushMat);
  blushR.position.set(0.3, -0.02, 0.26);
  blushR.scale.set(1.2, 0.7, 0.3);
  group.add(blushR);

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

  const headGeo = new THREE.SphereGeometry(0.44, 20, 16);
  const head = new THREE.Mesh(headGeo, brownMat);
  head.castShadow = true;
  group.add(head);

  for (let i = 0; i < 5; i++) {
    const tuftGeo = new THREE.ConeGeometry(0.04, 0.15, 4);
    const tuft = new THREE.Mesh(tuftGeo, darkBrownMat);
    const angle = (i / 5) * Math.PI * 0.8 - 0.4;
    tuft.position.set(Math.sin(angle) * 0.1, 0.44, Math.cos(angle) * 0.05);
    tuft.rotation.set(-0.3, 0, angle * 0.5);
    group.add(tuft);
  }

  const faceGeo = new THREE.SphereGeometry(0.35, 16, 14);
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.position.set(0, -0.04, 0.16);
  face.scale.set(0.9, 0.88, 0.45);
  group.add(face);

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

  const muzzleGeo = new THREE.SphereGeometry(0.14, 12, 10);
  const muzzle = new THREE.Mesh(muzzleGeo, faceMat);
  muzzle.position.set(0, -0.1, 0.36);
  muzzle.scale.set(1.2, 0.8, 0.7);
  group.add(muzzle);

  const noseGeo = new THREE.SphereGeometry(0.04, 8, 6);
  const nose = new THREE.Mesh(noseGeo, darkBrownMat);
  nose.position.set(0, -0.06, 0.44);
  nose.scale.set(1.2, 0.9, 0.6);
  group.add(nose);

  const smileGeo = new THREE.TorusGeometry(0.06, 0.012, 6, 10, Math.PI);
  const smileMat = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
  const smile = new THREE.Mesh(smileGeo, smileMat);
  smile.position.set(0, -0.15, 0.4);
  smile.rotation.set(0, 0, Math.PI);
  group.add(smile);

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
