"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceShell } from "./workspace-shell";
import styles from "./sandbox-page.module.css";

export function SandboxPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [fluidKey, setFluidKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    let initializeTimeout: number | undefined;

    async function setup() {
      const canvas = canvasRef.current;
      const shell = shellRef.current;

      if (!canvas || !shell) {
        return;
      }

      const syncCanvasSize = () => {
        const { width, height } = shell.getBoundingClientRect();
        if (!width || !height) {
          return false;
        }
        canvas.width = Math.floor(width);
        canvas.height = Math.floor(height);
        return true;
      };

      if (!syncCanvasSize()) {
        initializeTimeout = window.setTimeout(() => {
          if (!cancelled) {
            void setup();
          }
        }, 120);
        return;
      }

      const fluidModule = await import("webgl-fluid");
      const WebGLFluid = fluidModule.default;

      if (cancelled) {
        return;
      }

      WebGLFluid(canvas, {
        TRIGGER: "hover",
        IMMEDIATE: false,
        AUTO: false,
        COLORFUL: true,
        SHADING: true,
        BLOOM: true,
        SUNRAYS: false,
        TRANSPARENT: false,
        BACK_COLOR: { r: 4, g: 6, b: 10 },
        DENSITY_DISSIPATION: 0.975,
        VELOCITY_DISSIPATION: 0.985,
        PRESSURE: 0.8,
        PRESSURE_ITERATIONS: 22,
        CURL: 32,
        SPLAT_RADIUS: 0.28,
        SPLAT_FORCE: 7200,
        BLOOM_INTENSITY: 0.35,
        BLOOM_THRESHOLD: 0.5,
      });

      resizeObserver = new ResizeObserver(() => {
        syncCanvasSize();
      });
      resizeObserver.observe(shell);
    }

    void setup();

    return () => {
      cancelled = true;
      if (initializeTimeout) {
        window.clearTimeout(initializeTimeout);
      }
      resizeObserver?.disconnect();
    };
  }, [fluidKey]);

  return (
    <WorkspaceShell title="Sandbox" subtitle="Fluid space" frameless>
      <section className={styles.module}>
        <div className={styles.moduleHeader}>
          <div>
            <p className={styles.sectionLabel}>AURA</p>
            <h3>SANDBOX</h3>
          </div>
          <button className={styles.closeButton} type="button" onClick={() => router.push("/")}>
            Close
          </button>
        </div>

        <div ref={shellRef} className={styles.canvasShell}>
          <canvas key={fluidKey} ref={canvasRef} className={styles.canvas} />
        </div>

        <div className={styles.toolbar}>
          <button className={styles.ghostButton} type="button" onClick={() => setFluidKey((value) => value + 1)}>
            Reset
          </button>
        </div>
      </section>
    </WorkspaceShell>
  );
}
