"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import * as THREE from "three";
import styles from "./three-card-nav.module.css";

type NavCard = {
  href: string;
  title: string;
  description: string;
  colorA: string;
  colorB: string;
  accentA: string;
  accentB: string;
};

const navCards: NavCard[] = [
  {
    href: "/companion",
    title: "Support\nCompanion",
    description: "AI SUPPORT",
    colorA: "#151d31",
    colorB: "#223252",
    accentA: "rgba(102, 208, 255, 0.12)",
    accentB: "rgba(209, 162, 255, 0.1)",
  },
  {
    href: "/journal",
    title: "Emotion\nJournal",
    description: "REFLECTION",
    colorA: "#1a1c34",
    colorB: "#2a2f54",
    accentA: "rgba(255, 175, 212, 0.1)",
    accentB: "rgba(198, 164, 255, 0.1)",
  },
  {
    href: "/sandbox",
    title: "Sandbox\nTherapy",
    description: "PLAY",
    colorA: "#17212f",
    colorB: "#25384c",
    accentA: "rgba(138, 221, 255, 0.1)",
    accentB: "rgba(255, 255, 255, 0.08)",
  },
  {
    href: "/music",
    title: "Meditation\nSpace",
    description: "CALM",
    colorA: "#15252d",
    colorB: "#214150",
    accentA: "rgba(128, 244, 216, 0.1)",
    accentB: "rgba(147, 198, 255, 0.1)",
  },
];

type CardMesh = {
  group: THREE.Group;
  plate: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  data: NavCard;
};

function createCardTexture(card: NavCard) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 1074;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  const width = canvas.width;
  const height = canvas.height;
  const radius = 46;
  const padding = 34;

  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, card.colorA);
  background.addColorStop(1, card.colorB);
  ctx.fillStyle = background;
  drawRoundedRect(ctx, 0, 0, width, height, radius);
  ctx.fill();

  const gloss = ctx.createLinearGradient(0, 0, 0, height);
  gloss.addColorStop(0, "rgba(255,255,255,0.08)");
  gloss.addColorStop(0.24, "rgba(255,255,255,0.02)");
  gloss.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gloss;
  drawRoundedRect(ctx, 0, 0, width, height, radius);
  ctx.fill();

  ctx.save();
  drawRoundedRect(ctx, 0, 0, width, height, radius);
  ctx.clip();

  const diagonalGlow = ctx.createLinearGradient(width * 0.14, height * 0.82, width * 0.84, height * 0.14);
  diagonalGlow.addColorStop(0, "rgba(255,255,255,0)");
  diagonalGlow.addColorStop(0.38, "rgba(255,255,255,0.08)");
  diagonalGlow.addColorStop(0.5, "rgba(255,255,255,0.16)");
  diagonalGlow.addColorStop(0.62, "rgba(255,255,255,0.06)");
  diagonalGlow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = diagonalGlow;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = card.accentA;
  ctx.beginPath();
  ctx.arc(width * 0.18, height * 0.84, 180, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = card.accentB;
  ctx.beginPath();
  ctx.arc(width * 0.82, height * 0.18, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.98)";
  ctx.font = "700 94px Aptos, Segoe UI, sans-serif";
  const lines = card.title.split("\n");
  lines.forEach((line, index) => {
    ctx.fillText(line, padding + 28, 204 + index * 94);
  });

  ctx.font = "500 52px Aptos, Segoe UI, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.fillText(card.description, padding + 28, height - 104);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

export function ThreeCardNav() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const hoveredRef = useRef<number | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const activeIndex = useMemo(() => {
    const found = navCards.findIndex((item) => item.href === pathname);
    return found >= 0 ? found : 0;
  }, [pathname]);

  const homeCenterIndex = (navCards.length - 1) / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;

    if (!canvas || !frame) {
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog("#080a11", 14, 28);

    const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 100);
    camera.position.set(0, 0.16, 10.4);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    scene.add(new THREE.AmbientLight("#f7f1ff", 1.2));
    const rimLight = new THREE.PointLight("#ffffff", 14, 30, 2);
    rimLight.position.set(0, 4.4, 8.6);
    scene.add(rimLight);

    const sideLight = new THREE.PointLight("#77d8ff", 6, 20, 2);
    sideLight.position.set(-6.6, 1.2, 6.2);
    scene.add(sideLight);

    const cards: CardMesh[] = [];
    const planeGeometry = new THREE.PlaneGeometry(1.82, 2.55, 1, 1);
    navCards.forEach((card) => {
      const texture = createCardTexture(card);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      });
      const plate = new THREE.Mesh(planeGeometry, material);
      const group = new THREE.Group();
      group.add(plate);
      cards.push({ group, plate, data: card });
      scene.add(group);
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(2, 2);
    const clock = new THREE.Clock();
    let animationFrame = 0;

    const resize = () => {
      const { width, height } = frame.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(frame);

    const updatePointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerMove = (event: PointerEvent) => updatePointer(event);
    const handlePointerLeave = () => {
      pointer.set(2, 2);
      hoveredRef.current = null;
      canvas.style.cursor = "default";
    };
    const handlePointerDown = (event: PointerEvent) => {
      updatePointer(event);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(cards.map((entry) => entry.plate));
      if (!hits.length) {
        return;
      }
      const hitIndex = cards.findIndex((entry) => entry.plate === hits[0].object);
      if (hitIndex >= 0) {
        router.push(cards[hitIndex].data.href);
      }
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("pointerdown", handlePointerDown);

    const animate = () => {
      animationFrame = window.requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const compact = canvas.clientWidth <= 760;
      const xSpacing = compact ? 1.48 : 2.28;
      const innerSpacing = compact ? 1.36 : 1.94;
      const homeScaleBase = compact ? 0.72 : 0.86;
      const homeScaleBoost = compact ? 0.14 : 0.18;
      const selectedScale = compact ? 0.94 : 1.05;
      const idleScale = compact ? 0.84 : 0.92;
      const hoverScaleBoost = compact ? 0.04 : 0.08;
      const hoverLiftAmount = compact ? 0.12 : 0.22;
      const hoverForwardAmount = compact ? 0.22 : 0.45;
      const homeYOffset = compact ? -0.22 : 0;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(cards.map((entry) => entry.plate));
      const nextHoveredIndex =
        hits.length > 0 ? cards.findIndex((entry) => entry.plate === hits[0].object) : null;

      if (hoveredRef.current !== nextHoveredIndex) {
        hoveredRef.current = nextHoveredIndex;
        canvas.style.cursor = nextHoveredIndex !== null && nextHoveredIndex >= 0 ? "pointer" : "default";
      }

      cards.forEach((entry, index) => {
        const offset = isHome ? index - homeCenterIndex : index - activeIndex;
        const hovered = hoveredRef.current === index;
        const selected = isHome ? false : index === activeIndex;
        const distance = Math.abs(offset);
        const prominence = isHome ? Math.max(0, 1 - distance / 2.2) : selected ? 1 : Math.max(0, 1 - distance / 2.8);
        const targetX = isHome ? offset * xSpacing : offset * innerSpacing;
        const targetY = isHome
          ? homeYOffset + prominence * 0.04 - distance * (compact ? 0.018 : 0.03)
          : selected
            ? 0.08
            : distance * -0.05;
        const targetZ = isHome ? prominence * 0.9 - distance * 0.18 : selected ? 0.84 : -0.42 - distance * 0.62;
        const targetRotY = isHome ? -offset * 0.24 : -offset * 0.32;
        const targetRotX = isHome ? (compact ? 0.015 : 0.03) + distance * 0.015 : selected ? -0.03 : 0.08;
        const hoverLift = hovered ? hoverLiftAmount : 0;
        const hoverForward = hovered ? hoverForwardAmount : 0;

        entry.group.position.x = THREE.MathUtils.lerp(entry.group.position.x, targetX, 0.11);
        entry.group.position.y = THREE.MathUtils.lerp(
          entry.group.position.y,
          targetY + hoverLift + Math.sin(elapsed * 1.4 + index * 0.5) * 0.05,
          0.11,
        );
        entry.group.position.z = THREE.MathUtils.lerp(entry.group.position.z, targetZ + hoverForward, 0.11);
        entry.group.rotation.y = THREE.MathUtils.lerp(
          entry.group.rotation.y,
          targetRotY + (hovered ? -Math.sign(offset || 1) * 0.08 : 0),
          0.11,
        );
        entry.group.rotation.x = THREE.MathUtils.lerp(entry.group.rotation.x, targetRotX, 0.1);

        const targetScale = isHome
          ? homeScaleBase + prominence * homeScaleBoost
          : selected
            ? selectedScale
            : idleScale;
        const hoverScale = hovered ? hoverScaleBoost : 0;
        const scale = THREE.MathUtils.lerp(entry.group.scale.x, targetScale + hoverScale, 0.1);
        entry.group.scale.setScalar(scale);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      renderer.dispose();
      planeGeometry.dispose();
      cards.forEach((entry) => {
        entry.group.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            const material = object.material;
            if (!Array.isArray(material)) {
              if ("map" in material && material.map) {
                material.map.dispose();
              }
              material.dispose();
            }
          }
        });
      });
    };
  }, [activeIndex, homeCenterIndex, isHome, router]);

  return (
    <div className={styles.stage} ref={frameRef}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.hint}>Move across the scene and click a card to switch pages.</div>
    </div>
  );
}
