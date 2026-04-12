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
      subtitle="Write down the emotion, the thought, and the different response you want to try next time."
      status={status}
      frameless
    >
      <section className={styles.module}>
        <div className={styles.moduleHeader}>
          <div>
            <p className={styles.sectionLabel}>Emotional Journal</p>
            <h3>Write down what happened, and how you want to be gentler with yourself.</h3>
          </div>
          <button className={styles.closeButton} type="button" onClick={() => router.push("/")}>
            Close
          </button>
        </div>

        <p className={styles.intro}>
          This space is for the event, the first reaction, the body sensation, and the place where you want to pause a
          little longer next time.
        </p>

        <textarea
          className={styles.textArea}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Example: When I saw they had not replied for a long time, my chest tightened and I wanted to send several messages in a row. Next time I want to wait 10 minutes first."
        />

        <div className={styles.toolbar}>
          <p>It does not need to be complete. It just needs to be honest.</p>
          <button className={styles.primaryButton} type="button" onClick={handleSave}>
            Save Entry
          </button>
        </div>

        <div className={styles.historyHeader}>
          <p className={styles.sectionLabel}>History</p>
          <h4>Recent Entries</h4>
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
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
