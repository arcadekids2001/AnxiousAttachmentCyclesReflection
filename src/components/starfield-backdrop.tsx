"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "./starfield-backdrop.module.css";

export function StarfieldBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog("#06080f", 18, 84);

    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120);
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const starCount = 2200;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const scales = new Float32Array(starCount);

    const coolA = new THREE.Color("#d8e4ff");
    const coolB = new THREE.Color("#8ab8ff");
    const coolC = new THREE.Color("#ffffff");
    const mixed = new THREE.Color();

    for (let index = 0; index < starCount; index += 1) {
      const stride = index * 3;
      const radius = 14 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[stride] = radius * Math.sin(phi) * Math.cos(theta);
      positions[stride + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[stride + 2] = (Math.random() - 0.5) * 58;

      mixed.copy(coolA).lerp(coolB, Math.random() * 0.7);
      mixed.lerp(coolC, Math.random() * 0.24);
      colors[stride] = mixed.r;
      colors[stride + 1] = mixed.g;
      colors[stride + 2] = mixed.b;
      scales[index] = 1.2 + Math.random() * 3.8;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      },
      vertexShader: `
        attribute float aScale;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          vec3 transformed = position;
          transformed.y += sin(uTime * 0.06 + position.x * 0.18) * 0.08;
          transformed.x += cos(uTime * 0.05 + position.y * 0.14) * 0.06;
          transformed.z += mod(uTime * (1.4 + aScale * 0.08) + position.z * 0.04, 56.0) - 28.0;

          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          float depthScale = clamp(20.0 / max(4.0, -mvPosition.z), 0.45, 5.2);
          gl_PointSize = aScale * depthScale * uPixelRatio;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float distanceToCenter = length(uv);
          float glow = smoothstep(0.58, 0.0, distanceToCenter);
          float core = smoothstep(0.18, 0.0, distanceToCenter);
          vec3 color = vColor * (glow * 1.05 + core * 1.2);
          float alpha = glow;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      vertexColors: true,
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2);
    };

    resize();
    window.addEventListener("resize", resize);

    const clock = new THREE.Clock();
    let frameId = 0;

    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsed;
      stars.rotation.z = elapsed * 0.01;
      stars.rotation.y = Math.sin(elapsed * 0.06) * 0.05;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className={styles.backdrop} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
