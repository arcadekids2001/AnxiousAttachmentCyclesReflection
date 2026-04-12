"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceShell } from "./workspace-shell";
import styles from "./music-page.module.css";

type SoundMode = "ocean" | "rain" | "forest" | "cosmic" | null;

const soundModes = [
  { id: "ocean", title: "Ocean Space", desc: "更像缓慢、宽阔，能让身体降下来。" },
  { id: "rain", title: "Rain Space", desc: "适合脑子很满、需要一点包裹感的时候。" },
  { id: "forest", title: "Forest Space", desc: "比较稳定、均匀，适合重新找回呼吸。" },
  { id: "cosmic", title: "Cosmic Space", desc: "更空、更远，适合把注意力从关系拉回来。" },
] as const;

export function MusicPage() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<SoundMode>(null);
  const [timerMilliseconds, setTimerMilliseconds] = useState(0);
  const [remainingMilliseconds, setRemainingMilliseconds] = useState(0);
  const contextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const noiseRef = useRef<AudioBufferSourceNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const waveTimerRef = useRef<number | null>(null);

  function stopSound() {
    if (waveTimerRef.current) {
      window.clearInterval(waveTimerRef.current);
      waveTimerRef.current = null;
    }

    oscillatorRef.current?.stop();
    noiseRef.current?.stop();
    oscillatorRef.current?.disconnect();
    noiseRef.current?.disconnect();
    filterRef.current?.disconnect();
    gainRef.current?.disconnect();
    oscillatorRef.current = null;
    noiseRef.current = null;
    filterRef.current = null;
    gainRef.current = null;
    setActiveMode(null);
  }

  useEffect(() => {
    if (!remainingMilliseconds) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingMilliseconds((current) => {
        const nextRemaining = Math.max(0, current - 250);
        if (nextRemaining === 0) {
          stopSound();
        }
        return nextRemaining;
      });
    }, 250);

    return () => window.clearInterval(timer);
  }, [remainingMilliseconds]);

  useEffect(() => {
    return () => stopSound();
  }, []);

  async function toggleMode(mode: Exclude<SoundMode, null>) {
    if (activeMode === mode) {
      stopSound();
      return;
    }

    stopSound();
    const context = contextRef.current ?? new window.AudioContext();
    contextRef.current = context;

    if (context.state === "suspended") {
      await context.resume();
    }

    const gain = context.createGain();
    gain.gain.value = 0.045;
    gain.connect(context.destination);
    gainRef.current = gain;

    if (mode === "ocean" || mode === "rain" || mode === "forest") {
      const noise = createNoiseSource(context);
      const filter = context.createBiquadFilter();
      filter.type = mode === "rain" ? "highpass" : "lowpass";
      filter.frequency.value = mode === "rain" ? 2100 : mode === "forest" ? 880 : 440;
      noise.connect(filter);
      filter.connect(gain);
      noise.start();
      noiseRef.current = noise;
      filterRef.current = filter;
    }

    if (mode === "cosmic" || mode === "ocean") {
      const oscillator = context.createOscillator();
      oscillator.type = mode === "cosmic" ? "sine" : "triangle";
      oscillator.frequency.value = mode === "cosmic" ? 174 : 196;
      const oscGain = context.createGain();
      oscGain.gain.value = mode === "cosmic" ? 0.03 : 0.015;
      oscillator.connect(oscGain);
      oscGain.connect(gain);
      oscillator.start();
      oscillatorRef.current = oscillator;

      let direction = 1;
      waveTimerRef.current = window.setInterval(() => {
        oscillator.frequency.value += direction * (mode === "cosmic" ? 8 : 4);
        if (
          oscillator.frequency.value > (mode === "cosmic" ? 220 : 212) ||
          oscillator.frequency.value < (mode === "cosmic" ? 168 : 188)
        ) {
          direction *= -1;
        }
      }, 900);
    }

    setActiveMode(mode);
  }

  function startTimer(minutes: number) {
    const nextTimerMilliseconds = minutes * 60 * 1000;
    setTimerMilliseconds(nextTimerMilliseconds);
    setRemainingMilliseconds(nextTimerMilliseconds);
  }

  const progress =
    timerMilliseconds > 0 ? ((timerMilliseconds - remainingMilliseconds) / timerMilliseconds) * 100 : 0;
  const remainingSeconds = Math.ceil(remainingMilliseconds / 1000);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedRemaining = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <WorkspaceShell
      title="Music Space"
      subtitle="先让身体慢一点，再回去处理关系里的不确定。"
      status={activeMode ? `正在播放 ${activeMode}` : "已就绪"}
      frameless
    >
      <section className={styles.module}>
        <div className={styles.moduleHeader}>
          <div>
            <p className={styles.sectionLabel}>Soundscape</p>
            <h3>这里不是功能页，而是一个让你先稳定下来的空间。</h3>
          </div>
          <button className={styles.closeButton} type="button" onClick={() => router.push("/")}>
            关闭
          </button>
        </div>

        <p className={styles.intro}>
          你不一定每次都需要先说出来。有时候更有用的是先给自己几分钟，让身体从紧绷里退一点出来。
        </p>

        <div className={styles.grid}>
          {soundModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`${styles.card} ${activeMode === mode.id ? styles.cardActive : ""}`}
              onClick={() => void toggleMode(mode.id)}
            >
              <strong>{mode.title}</strong>
              <span>{mode.desc}</span>
            </button>
          ))}
        </div>

        <div className={styles.timerRow}>
          {[5, 10, 15].map((minute) => (
            <button key={minute} type="button" className={styles.timerButton} onClick={() => startTimer(minute)}>
              {minute} 分钟
            </button>
          ))}
        </div>

        <div className={styles.timerBar}>
          <div className={styles.timerProgress} style={{ width: `${progress}%` }} />
        </div>
        <p className={styles.timerText}>{remainingSeconds > 0 ? `剩余 ${formattedRemaining}` : "未开启计时器"}</p>
      </section>
    </WorkspaceShell>
  );
}

function createNoiseSource(context: AudioContext) {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}
