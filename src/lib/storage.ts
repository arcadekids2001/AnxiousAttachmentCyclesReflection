import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { AuraJournalEntry, AuraMessage, AuraSession, AuraStore } from "./types";

const dataDirectory = path.join(process.cwd(), "data");
const storePath = path.join(dataDirectory, "aura-store.json");

const defaultAssistantMessage =
  "Welcome. You can describe a recent relational trigger, and AURA will help organize it into what happened, what you felt, what fear may have been activated, and what a steadier next step could be.";

export async function readStore(): Promise<AuraStore> {
  await ensureStore();
  const raw = await readFile(storePath, "utf8");
  return JSON.parse(raw) as AuraStore;
}

export async function writeStore(store: AuraStore) {
  await ensureStore();
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

export async function createSession() {
  const store = await readStore();
  const now = new Date().toISOString();

  const session: AuraSession = {
    id: randomUUID(),
    title: `Reflection ${new Date(now).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: randomUUID(),
        role: "assistant",
        content: defaultAssistantMessage,
        createdAt: now,
      },
    ],
  };

  store.sessions.unshift(session);
  await writeStore(store);
  return session;
}

export async function appendMessages(
  sessionId: string,
  additions: AuraMessage[],
  firstUserMessage?: string,
) {
  const store = await readStore();
  const session = store.sessions.find((entry) => entry.id === sessionId);

  if (!session) {
    throw new Error("Session not found.");
  }

  session.messages.push(...additions);
  session.updatedAt = new Date().toISOString();

  if (firstUserMessage && session.messages.length <= 3) {
    session.title = shorten(firstUserMessage, 48);
  }

  await writeStore(store);
  return session;
}

export async function createJournalEntry(entry: string) {
  const store = await readStore();
  const journalEntry: AuraJournalEntry = {
    id: randomUUID(),
    entry,
    createdAt: new Date().toISOString(),
  };

  store.journal.unshift(journalEntry);
  await writeStore(store);
  return journalEntry;
}

async function ensureStore() {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(storePath, "utf8");
  } catch {
    const initialStore: AuraStore = {
      sessions: [],
      journal: [],
    };
    await writeFile(storePath, JSON.stringify(initialStore, null, 2), "utf8");
  }
}

function shorten(text: string, maxLength: number) {
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}
