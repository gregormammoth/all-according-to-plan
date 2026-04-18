'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function CastleScene() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const width = el.clientWidth;
    const height = el.clientHeight;
    const scene = new THREE.Scene();
    // Set a soft pastel background and fog
    scene.background = new THREE.Color('#f9ece6'); // pastel peach
    scene.fog = new THREE.FogExp2('#f3e6f5', 0.014); // pastel lavender fog

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 200);
    camera.position.set(11, 6.5, 13);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setClearColor('#f9ece6');
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    // pastel hemisphere and directional lights
    const hemi = new THREE.HemisphereLight('#f8e8ea', '#badaf8', 0.89); // soft pink sky, pastel blue ground
    scene.add(hemi);
    const dir = new THREE.DirectionalLight('#c1cefe', 1.85); // pastel indigo
    dir.position.set(9, 16, 7);
    dir.castShadow = true;
    scene.add(dir);

    // Pastel castle materials
    const stone = new THREE.MeshStandardMaterial({
      color: '#a7c7e7',  // pastel blue
      roughness: 0.56,
      metalness: 0.18,
    });
    const towerAccent = new THREE.MeshStandardMaterial({
      color: '#e7a7c7', // pastel pink
      roughness: 0.39,
      metalness: 0.24,
    });
    const keepMat = new THREE.MeshStandardMaterial({
      color: '#fff5ba', // pastel yellow
      roughness: 0.33,
      metalness: 0.15,
    });

    const group = new THREE.Group();
    const towerGeo = new THREE.BoxGeometry(1.7, 4.2, 1.7);

    // Left tower
    const t1 = new THREE.Mesh(towerGeo, towerAccent);
    t1.position.set(-2.6, 2.1, 0);
    group.add(t1);
    // Right tower
    const t2 = new THREE.Mesh(towerGeo, towerAccent);
    t2.position.set(2.6, 2.1, 0);
    group.add(t2);
    // Keep
    const keep = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.7, 3.2), keepMat);
    keep.position.set(0, 1.35, 0);
    group.add(keep);

    // Spire with pastel purple
    const spireMat = new THREE.MeshStandardMaterial({
      color: '#b8a7e7',  // pastel purple
      roughness: 0.20,
      metalness: 0.33,
      emissive: '#ede6fa',
      emissiveIntensity: 0.20,
    });
    const spire = new THREE.Mesh(new THREE.ConeGeometry(1.25, 2.2, 7), spireMat);
    spire.position.set(0, 4.3, 0);
    group.add(spire);

    // Pastel green door
    const doorMat = new THREE.MeshStandardMaterial({
      color: '#b7efd8', // pastel green
      roughness: 0.31,
      metalness: 0.12,
    });
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.2), doorMat);
    door.position.set(0, 0.55, 1.7);
    group.add(door);

    // Add some "flags" for extra pastel color
    for (const x of [-2.6, 2.6]) {
      const flagMat = new THREE.MeshStandardMaterial({
        color: x < 0 ? '#e7a7c7' : '#a7c7e7', // pastel pink or blue
        emissive: '#faf4e1', // very light pastel
        emissiveIntensity: 0.09,
      });
      const flag = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.7, 0.05), flagMat);
      flag.position.set(x, 4.65, 0.7);
      group.add(flag);
    }

    scene.add(group);

    // Pastel ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(90, 90),
      new THREE.MeshStandardMaterial({
        color: '#fdf6f0', // super soft pastel, almost white
        roughness: 0.98,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Add some pastel "flowers" for accents
    const pastelFlowerColors = [
      '#fde2e2', // pastel pink
      '#c2f0fc', // pastel cyan
      '#daeaf6', // very light blue
      '#faf4b7', // pastel yellow
      '#bce6eb', // pastel teal
      '#e4bad4', // lavender-pink
      '#e2f0cb', // pastel lime
    ];
    for (let i = 0; i < 9; i++) {
      const flowerMat = new THREE.MeshStandardMaterial({
        color: pastelFlowerColors[i % pastelFlowerColors.length],
        emissive: '#fffdf8',
        emissiveIntensity: 0.06,
      });
      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 12), flowerMat);
      flower.position.set(
        Math.cos((i / 9) * Math.PI * 2) * (3.8 + Math.random()),
        0.18,
        Math.sin((i / 9) * Math.PI * 2) * (3.8 + Math.random())
      );
      scene.add(flower);
    }

    const t0 = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      const elapsed = (t - t0) / 1000;
      group.rotation.y = elapsed * 0.22;
      camera.position.x = 11 + Math.sin(elapsed * 0.18) * 0.9;
      camera.position.y = 6.5 + Math.sin(elapsed * 0.12) * 0.35;
      camera.lookAt(0, 2.4, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
}
