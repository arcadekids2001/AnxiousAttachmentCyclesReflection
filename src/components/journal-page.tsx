"use client";

import { useState } from "react";
import { useAuraWorkspace } from "@/hooks/use-aura-workspace";
import { useRouter } from "next/navigation";
import { WorkspaceShell } from "./workspace-shell";
import styles from "./journal-page.module.css";

export function JournalPage() {
  const { journal, status, saveJournal } = useAuraWorkspace();
  const router = useRouter();
  const [draft, setDraft] = useState("");

  async function handleSave() {
    const ok = await saveJournal(draft);
    if (ok) {
      setDraft("");
    }
  }

  return (
    <WorkspaceShell
      title="Journal"
      subtitle="把情绪、想法和下次想尝试的不同反应慢慢写下来。"
      status={status}
      frameless
    >
      <section className={styles.module}>
        <div className={styles.moduleHeader}>
          <div>
            <p className={styles.sectionLabel}>Emotional Journal</p>
            <h3>写下这次发生了什么，以及你想怎样对自己更温柔一点。</h3>
          </div>
          <button className={styles.closeButton} type="button" onClick={() => router.push("/")}>
            关闭
          </button>
        </div>

        <p className={styles.intro}>这里适合记录事件、第一反应、身体感觉，还有下一次你希望自己多停一秒的地方。</p>

        <textarea
          className={styles.textArea}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="例如：当我看到对方很久没回，我马上开始胸口发紧，想连续发消息。下次我想先等 10 分钟。"
        />

        <div className={styles.toolbar}>
          <p>写得不需要完整，只要真实。</p>
          <button className={styles.primaryButton} type="button" onClick={handleSave}>
            保存记录
          </button>
        </div>

        <div className={styles.historyHeader}>
          <p className={styles.sectionLabel}>History</p>
          <h4>最近的记录</h4>
        </div>

        <div className={styles.grid}>
          {journal.map((entry) => (
            <article key={entry.id} className={styles.note}>
              <p>{entry.entry}</p>
              <span>{formatDate(entry.createdAt)}</span>
            </article>
          ))}
        </div>
      </section>
    </WorkspaceShell>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
