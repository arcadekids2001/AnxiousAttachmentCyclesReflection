"use client";

import { useEffect, useState } from "react";
import type { AuraJournalEntry, AuraSession } from "@/lib/types";

type SessionsResponse = {
  sessions: AuraSession[];
  journal: AuraJournalEntry[];
};

export function useAuraWorkspace() {
  const [sessions, setSessions] = useState<AuraSession[]>([]);
  const [journal, setJournal] = useState<AuraJournalEntry[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [status, setStatus] = useState("Connecting");

  useEffect(() => {
    void loadWorkspace();
  }, []);

  async function loadWorkspace() {
    setLoading(true);

    try {
      const response = await fetch("/api/sessions", { cache: "no-store" });
      const data = (await response.json()) as SessionsResponse;
      setSessions(data.sessions);
      setJournal(data.journal);
      setSelectedSessionId(data.sessions[0]?.id ?? "");
      setStatus("Ready");
    } catch {
      setStatus("Load failed");
    } finally {
      setLoading(false);
    }
  }

  async function createSession() {
    setThinking(true);

    try {
      const response = await fetch("/api/sessions", { method: "POST" });
      const data = (await response.json()) as { session: AuraSession };
      setSessions((current) => [data.session, ...current]);
      setSelectedSessionId(data.session.id);
      setStatus("New session created");
      return data.session;
    } catch {
      setStatus("Create failed");
      return null;
    } finally {
      setThinking(false);
    }
  }

  async function sendMessage(message: string) {
    const sessionId = selectedSessionId || (await createSession())?.id;

    if (!sessionId || !message.trim()) {
      return false;
    }

    setThinking(true);
    setStatus("Thinking");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          message,
        }),
      });

      const data = (await response.json()) as {
        session?: AuraSession;
        error?: string;
      };

      if (!response.ok || !data.session) {
        throw new Error(data.error ?? "Request failed");
      }

      setSessions((current) =>
        current.map((session) => (session.id === data.session?.id ? data.session : session)),
      );
      setSelectedSessionId(data.session.id);
      setStatus("Saved");
      return true;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Send failed");
      return false;
    } finally {
      setThinking(false);
    }
  }

  async function saveJournal(entry: string) {
    if (!entry.trim()) {
      return false;
    }

    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entry: entry.trim(),
        }),
      });
      const data = (await response.json()) as { entry: AuraJournalEntry };
      setJournal((current) => [data.entry, ...current]);
      setStatus("Recorded");
      return true;
    } catch {
      setStatus("Save failed");
      return false;
    }
  }

  const selectedSession = sessions.find((session) => session.id === selectedSessionId) ?? sessions[0];

  return {
    sessions,
    journal,
    selectedSession,
    selectedSessionId,
    setSelectedSessionId,
    loading,
    thinking,
    status,
    createSession,
    sendMessage,
    saveJournal,
  };
}
