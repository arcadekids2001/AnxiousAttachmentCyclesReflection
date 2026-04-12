"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuraWorkspace } from "@/hooks/use-aura-workspace";
import { WorkspaceShell } from "./workspace-shell";
import styles from "./companion-page.module.css";

const prompts = ["Clarify the trigger", "Draft a calmer reply", "Separate facts from fear"];

export function CompanionPage() {
  const {
    sessions,
    selectedSession,
    selectedSessionId,
    setSelectedSessionId,
    thinking,
    status,
    createSession,
    sendMessage,
  } = useAuraWorkspace();
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }
    const pending = message.trim();
    setMessage("");
    await sendMessage(pending);
  }

  return (
    <WorkspaceShell
      title="Support Companion"
      subtitle="Clarify the moment before you respond."
      status={status}
      frameless
    >
      <section className={styles.module}>
        <div className={styles.moduleHeader}>
          <div>
            <p className={styles.sectionLabel}>AURA</p>
            <h3>{selectedSession?.title ?? "New session"}</h3>
          </div>
          <button className={styles.closeButton} type="button" onClick={() => router.push("/")}>
            Close
          </button>
        </div>

        <div className={styles.layout}>
          <aside className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.sectionLabel}>Sessions</p>
                <h4>Sessions</h4>
              </div>
              <button className={styles.ghostButton} type="button" onClick={() => void createSession()}>
                New
              </button>
            </div>

            <div className={styles.sessionList}>
              {sessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  className={`${styles.sessionItem} ${
                    session.id === selectedSessionId ? styles.sessionItemActive : ""
                  }`}
                  onClick={() => setSelectedSessionId(session.id)}
                >
                  <strong>{session.title}</strong>
                  <p>{session.messages.at(-1)?.content ?? "New conversation"}</p>
                  <span>{formatDate(session.updatedAt)}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className={styles.chatCard}>
            <div className={styles.promptRow}>
              {prompts.map((prompt) => (
                <button key={prompt} type="button" className={styles.promptChip} onClick={() => setMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>

            <div className={styles.chatStream}>
              {selectedSession?.messages.map((entry) => (
                <article key={entry.id} className={`${styles.bubble} ${entry.role === "user" ? styles.userBubble : ""}`}>
                  <span className={styles.bubbleRole}>
                    {entry.role === "user" ? "You" : entry.role === "assistant" ? "AURA" : "System"}
                  </span>
                  <p>{entry.content}</p>
                </article>
              ))}
            </div>

            <form className={styles.composer} onSubmit={submitMessage}>
              <div className={styles.composerHeader}>
                <div className={styles.sessionMeta}>
                  <span>{selectedSession?.title ?? "Session"}</span>
                  <span>{selectedSession ? formatDate(selectedSession.updatedAt) : "Now"}</span>
                </div>
              </div>

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                placeholder="Describe what happened, what you felt, and what you need next."
              />

              <div className={styles.composerFooter}>
                <span className={styles.chatHint}>Saved automatically.</span>
                <button className={styles.primaryButton} type="submit" disabled={thinking}>
                  {thinking ? "Thinking..." : "Send"}
                </button>
              </div>
            </form>
          </section>
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
