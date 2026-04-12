"use client";

import styles from "./cloud-backdrop.module.css";

const cloudSeeds = [
  { top: 8, left: 4, width: 32, height: 15, duration: 34, delay: -12, opacity: 0.28 },
  { top: 16, left: 56, width: 24, height: 12, duration: 41, delay: -18, opacity: 0.18 },
  { top: 29, left: 18, width: 36, height: 14, duration: 38, delay: -6, opacity: 0.24 },
  { top: 38, left: 68, width: 28, height: 12, duration: 46, delay: -21, opacity: 0.2 },
  { top: 52, left: 10, width: 30, height: 13, duration: 43, delay: -15, opacity: 0.22 },
  { top: 58, left: 52, width: 34, height: 14, duration: 49, delay: -29, opacity: 0.18 },
  { top: 72, left: 26, width: 26, height: 11, duration: 36, delay: -9, opacity: 0.16 },
  { top: 78, left: 72, width: 22, height: 10, duration: 44, delay: -24, opacity: 0.14 },
];

export function CloudBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <svg className={styles.filters} width="0" height="0" focusable="false">
        <filter id="aura-cloud-distort">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0038 0.009"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="18" />
        </filter>
      </svg>

      <div className={styles.skyGlow} />
      <div className={styles.haze} />

      {cloudSeeds.map((cloud, index) => (
        <div
          key={`${cloud.left}-${cloud.top}`}
          className={styles.cloud}
          style={
            {
              "--cloud-top": `${cloud.top}%`,
              "--cloud-left": `${cloud.left}%`,
              "--cloud-width": `${cloud.width}rem`,
              "--cloud-height": `${cloud.height}rem`,
              "--cloud-duration": `${cloud.duration}s`,
              "--cloud-delay": `${cloud.delay}s`,
              "--cloud-opacity": cloud.opacity,
              "--cloud-drift-x": `${(index % 2 === 0 ? 1 : -1) * (2.4 + index * 0.22)}rem`,
              "--cloud-drift-y": `${(index % 3 === 0 ? 1 : -1) * (0.6 + index * 0.08)}rem`,
            } as React.CSSProperties
          }
        >
          <span className={styles.cloudCore} />
          <span className={styles.cloudLobeOne} />
          <span className={styles.cloudLobeTwo} />
          <span className={styles.cloudMist} />
        </div>
      ))}
    </div>
  );
}
