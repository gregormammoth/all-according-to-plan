'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type SceneCtx = {
  scene: THREE.Scene;
  ambient: THREE.AmbientLight;
  directional: THREE.DirectionalLight;
  hemisphere: THREE.HemisphereLight;
  renderer: THREE.WebGLRenderer;
  lampGlowMat: THREE.MeshStandardMaterial;
};

function applyDayNight(ctx: SceneCtx, isNight: boolean) {
  const { scene, ambient, directional, hemisphere, renderer, lampGlowMat } = ctx;
  if (isNight) {
    scene.background = new THREE.Color('#141820');
    scene.fog = new THREE.FogExp2('#0a0c10', 0.008);
    ambient.intensity = 0.12;
    hemisphere.color.set('#1a2030');
    hemisphere.groundColor.set('#080808');
    hemisphere.intensity = 0.18;
    directional.intensity = 0.55;
    directional.color.set('#b8c8e8');
    renderer.toneMappingExposure = 0.85;
    lampGlowMat.emissiveIntensity = 0.45;
  } else {
    scene.background = new THREE.Color('#c4b8a8');
    scene.fog = new THREE.FogExp2('#9a8f82', 0.0045);
    ambient.intensity = 0.38;
    hemisphere.color.set('#d8cfc4');
    hemisphere.groundColor.set('#6a6258');
    hemisphere.intensity = 0.42;
    directional.intensity = 1.05;
    directional.color.set('#fff5e6');
    renderer.toneMappingExposure = 1.02;
    lampGlowMat.emissiveIntensity = 0.1;
  }
}

function pseudo(seed: number) {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function makePalette() {
  return {
    stone: new THREE.MeshStandardMaterial({
      color: '#8a8a8e',
      roughness: 0.88,
      metalness: 0.08,
    }),
    beige: new THREE.MeshStandardMaterial({
      color: '#c4b5a0',
      roughness: 0.82,
      metalness: 0.06,
    }),
    desatRed: new THREE.MeshStandardMaterial({
      color: '#9a5c58',
      roughness: 0.78,
      metalness: 0.1,
    }),
    darkTrim: new THREE.MeshStandardMaterial({
      color: '#4a4a52',
      roughness: 0.9,
      metalness: 0.12,
    }),
    roof: new THREE.MeshStandardMaterial({
      color: '#6a6068',
      roughness: 0.75,
      metalness: 0.18,
    }),
    asphalt: new THREE.MeshStandardMaterial({
      color: '#5c5a58',
      roughness: 0.95,
      metalness: 0.04,
    }),
    lampMetal: new THREE.MeshStandardMaterial({
      color: '#3a3a40',
      roughness: 0.55,
      metalness: 0.45,
    }),
    lampGlow: new THREE.MeshStandardMaterial({
      color: '#f5e6c8',
      emissive: '#c9a86a',
      emissiveIntensity: 0.1,
      roughness: 0.4,
      metalness: 0.1,
    }),
    foliage: new THREE.MeshStandardMaterial({
      color: '#4a5c42',
      roughness: 0.92,
      metalness: 0.02,
    }),
    trunk: new THREE.MeshStandardMaterial({
      color: '#5c4a3e',
      roughness: 0.9,
      metalness: 0.02,
    }),
  };
}

function pickMat(palette: ReturnType<typeof makePalette>, seed: number) {
  const mats = [palette.stone, palette.beige, palette.desatRed];
  return mats[Math.floor(pseudo(seed) * 3) % 3];
}

function addTieredBuilding(
  root: THREE.Group,
  palette: ReturnType<typeof makePalette>,
  sharedBox: THREE.BoxGeometry,
  sharedCone: THREE.ConeGeometry,
  seed: number,
  centerX: number,
  centerZ: number,
  forceTall = false
) {
  const g = new THREE.Group();
  g.position.set(centerX, 0, centerZ);
  const tiers = forceTall ? 6 + Math.floor(pseudo(seed + 1) * 3) : 2 + Math.floor(pseudo(seed + 1) * 5);
  let baseW = 5 + pseudo(seed + 2) * 6;
  let baseD = 4 + pseudo(seed + 3) * 5;
  let y = 0;
  const trimEvery = 1 + Math.floor(pseudo(seed + 4) * 2);
  for (let t = 0; t < tiers; t++) {
    const h = 2.2 + pseudo(seed + t * 11) * 3.5;
    const m = pickMat(palette, seed + t * 17);
    const mesh = new THREE.Mesh(sharedBox, m);
    mesh.scale.set(baseW, h, baseD);
    mesh.position.y = y + h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
    if (t % trimEvery === 0) {
      const ribCount = 3 + Math.floor(pseudo(seed + t) * 5);
      for (let r = 0; r < ribCount; r++) {
        const rib = new THREE.Mesh(sharedBox, palette.darkTrim);
        const rx = -baseW / 2 + (r / (ribCount - 1 || 1)) * baseW;
        rib.scale.set(0.12, h * 0.92, 0.08);
        rib.position.set(rx, y + h / 2, baseD / 2 + 0.05);
        rib.castShadow = true;
        g.add(rib);
      }
    }
    y += h;
    baseW *= 0.78 + pseudo(seed + 50 + t) * 0.08;
    baseD *= 0.78 + pseudo(seed + 60 + t) * 0.08;
  }
  const spireH = 1.8 + pseudo(seed + 99) * 4;
  const spire = new THREE.Mesh(sharedCone, palette.roof);
  spire.scale.set(baseW * 0.55, spireH, baseW * 0.55);
  spire.position.y = y + spireH / 2;
  spire.castShadow = true;
  g.add(spire);
  root.add(g);
}

export function CastleScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<SceneCtx | null>(null);
  const [night, setNight] = useState(false);
  const nightRef = useRef(night);
  nightRef.current = night;

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const palette = makePalette();
    const unitBox = new THREE.BoxGeometry(1, 1, 1);
    const unitCone = new THREE.ConeGeometry(1, 1, 8);
    const unitCyl = new THREE.CylinderGeometry(0.12, 0.14, 1, 8);
    const lampHead = new THREE.SphereGeometry(0.22, 10, 8);

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;

    const width = el.clientWidth || 640;
    const height = el.clientHeight || 400;
    renderer.setSize(width, height);
    el.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 2500);
    camera.position.set(120, 85, 140);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 28, 0);
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 40;
    controls.maxDistance = 420;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.12;

    const ambient = new THREE.AmbientLight(0xffffff, 0.38);
    scene.add(ambient);
    const hemisphere = new THREE.HemisphereLight('#d8cfc4', '#6a6258', 0.42);
    scene.add(hemisphere);
    const directional = new THREE.DirectionalLight(0xfff5e6, 1.05);
    directional.position.set(-120, 180, 80);
    directional.castShadow = true;
    directional.shadow.mapSize.set(2048, 2048);
    directional.shadow.camera.near = 10;
    directional.shadow.camera.far = 600;
    directional.shadow.camera.left = -200;
    directional.shadow.camera.right = 200;
    directional.shadow.camera.top = 200;
    directional.shadow.camera.bottom = -200;
    directional.shadow.bias = -0.0003;
    scene.add(directional);

    const cityRoot = new THREE.Group();
    scene.add(cityRoot);

    const BLOCK = 26;
    const GRID = 9;
    for (let ix = -GRID; ix <= GRID; ix++) {
      for (let iz = -GRID; iz <= GRID; iz++) {
        if (ix % 4 === 0 || iz % 4 === 0) continue;
        if (ix === 0 && iz === 0) continue;
        const seed = ix * 1000 + iz * 17 + 333;
        const x = ix * BLOCK + (pseudo(seed) - 0.5) * 4;
        const z = iz * BLOCK + (pseudo(seed + 1) - 0.5) * 4;
        addTieredBuilding(cityRoot, palette, unitBox, unitCone, seed, x, z, false);
      }
    }
    addTieredBuilding(cityRoot, palette, unitBox, unitCone, 777777, 0, 0, true);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), palette.asphalt);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    const lampPositions: Array<{ x: number; z: number; ry: number }> = [];
    const queueLamp = (x: number, z: number, rotY: number) => {
      lampPositions.push({ x, z, ry: rotY });
    };
    for (let k = -GRID * BLOCK; k <= GRID * BLOCK; k += 10) {
      queueLamp(k, -GRID * BLOCK - 6, 0);
      queueLamp(k, GRID * BLOCK + 6, 0);
      queueLamp(-GRID * BLOCK - 6, k, Math.PI / 2);
      queueLamp(GRID * BLOCK + 6, k, Math.PI / 2);
    }
    for (let ix = -GRID; ix <= GRID; ix++) {
      if (ix % 4 !== 0) continue;
      for (let iz = -GRID; iz <= GRID; iz++) {
        const x = ix * BLOCK;
        const z = iz * BLOCK;
        queueLamp(x + 3, z, 0);
        queueLamp(x - 3, z, 0);
      }
    }
    for (let iz = -GRID; iz <= GRID; iz++) {
      if (iz % 4 !== 0) continue;
      for (let ix = -GRID; ix <= GRID; ix++) {
        const x = ix * BLOCK;
        const z = iz * BLOCK;
        queueLamp(x, z + 3, 0);
        queueLamp(x, z - 3, 0);
      }
    }
    const lampCount = lampPositions.length;
    const lampInst = new THREE.InstancedMesh(unitCyl, palette.lampMetal, lampCount);
    const lampGlowInst = new THREE.InstancedMesh(lampHead, palette.lampGlow, lampCount);
    lampInst.castShadow = true;
    const dummy = new THREE.Object3D();
    let li = 0;
    const placeLamp = (x: number, z: number, rotY: number) => {
      if (li >= lampCount) return;
      dummy.position.set(x, 4.2, z);
      dummy.rotation.set(0, rotY, 0);
      dummy.scale.set(1, 8.4, 1);
      dummy.updateMatrix();
      lampInst.setMatrixAt(li, dummy.matrix);
      dummy.position.set(x, 8.7, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      lampGlowInst.setMatrixAt(li, dummy.matrix);
      li++;
    };
    for (const p of lampPositions) {
      placeLamp(p.x, p.z, p.ry);
    }
    lampInst.instanceMatrix.needsUpdate = true;
    lampGlowInst.instanceMatrix.needsUpdate = true;
    scene.add(lampInst, lampGlowInst);

    const treeTrunk = new THREE.CylinderGeometry(0.35, 0.45, 2.2, 6);
    const treeTop = new THREE.ConeGeometry(2.2, 5, 7);
    const treeGroup = new THREE.Group();
    for (let i = 0; i < 28; i++) {
      const a = pseudo(i * 13) * Math.PI * 2;
      const rad = 40 + pseudo(i * 7) * 180;
      const x = Math.cos(a) * rad;
      const z = Math.sin(a) * rad;
      if (Math.abs(x) < 20 && Math.abs(z) < 20) continue;
      const trunk = new THREE.Mesh(treeTrunk, palette.trunk);
      trunk.position.set(x, 1.1, z);
      trunk.castShadow = true;
      const top = new THREE.Mesh(treeTop, palette.foliage);
      top.position.set(x, 4.2, z);
      top.castShadow = true;
      treeGroup.add(trunk, top);
    }
    scene.add(treeGroup);

    const ctx: SceneCtx = {
      scene,
      ambient,
      directional,
      hemisphere,
      renderer,
      lampGlowMat: palette.lampGlow,
    };
    ctxRef.current = ctx;
    applyDayNight(ctx, nightRef.current);

    let raf = 0;
    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      const geos = new Set<THREE.BufferGeometry>();
      const mats = new Set<THREE.Material>();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.InstancedMesh) {
          geos.add(obj.geometry);
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => mats.add(m));
          else if (mat) mats.add(mat);
        }
      });
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      renderer.dispose();
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
      ctxRef.current = null;
    };
  }, []);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (ctx) applyDayNight(ctx, night);
  }, [night]);

  return (
    <div className="relative h-full w-full">
      <div ref={mountRef} className="h-full w-full" />
      {/* <div className="pointer-events-auto absolute bottom-3 left-3 z-20 flex gap-2">
        <button
          type="button"
          onClick={() => setNight(false)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wide shadow-sm ${
            !night ? 'border-amber-600 bg-amber-400 text-black' : 'border-stone-400 bg-white/90 text-stone-800'
          }`}
        >
          Day
        </button>
        <button
          type="button"
          onClick={() => setNight(true)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wide shadow-sm ${
            night ? 'border-indigo-700 bg-indigo-900 text-amber-100' : 'border-stone-400 bg-white/90 text-stone-800'
          }`}
        >
          Night
        </button>
      </div> */}
    </div>
  );
}
