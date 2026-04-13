"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThreeCardNav } from "./three-card-nav";
import styles from "./workspace-shell.module.css";

export function WorkspaceShell({
  title,
  subtitle,
  status,
  children,
  frameless = false,
  contentHidden = false,
}: {
  title: string;
  subtitle: string;
  status?: string;
  children?: React.ReactNode;
  frameless?: boolean;
  contentHidden?: boolean;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [sceneClosed, setSceneClosed] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return sessionStorage.getItem("aura-scene-closed") === "true";
  });

  useEffect(() => {
    sessionStorage.setItem("aura-current-path", pathname);
  }, [pathname]);

  useEffect(() => {
    sessionStorage.setItem("aura-scene-closed", sceneClosed ? "true" : "false");
  }, [sceneClosed]);

  return (
    <div
      className={`${styles.shell} ${sceneClosed ? styles.shellSceneClosed : ""} ${
        isHome ? styles.shellHome : styles.shellInner
      }`}
    >
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>A</div>
          <div>
            <p className={styles.overline}>AURA</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.status}>
            <span className={styles.liveDot} />
            <span>{status ?? "Live"}</span>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={() => setSceneClosed((current) => !current)}
          >
            {sceneClosed ? "Show Card" : "Hide Card"}
          </button>
        </div>
      </header>

      {!sceneClosed && isHome ? (
        <div className={styles.navStageWrap}>
          <ThreeCardNav />
        </div>
      ) : null}

      <main className={styles.main}>
        <div className={styles.contentStage}>
          {contentHidden ? null : frameless ? (
            <section className={styles.framelessContent}>{children}</section>
          ) : (
            <div key={pathname} className={styles.flashcardFrame}>
              <section className={styles.content}>{children}</section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
