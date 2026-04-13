import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { AuraJournalEntry, AuraMessage, AuraSession, AuraStore } from "./types";

const dataDirectory = path.join(process.cwd(), "data");
const storePath = path.join(dataDirectory, "aura-store.json");

const defaultAssistantMessage =
  "Welcome. You can describe a recent relational trigger, and AURA will help organize it into what happened, what you felt, what fear may have been activated, and what a steadier next step could be.";

type SessionRow = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: AuraMessage[];
};

type JournalRow = {
  id: string;
  entry: string;
  created_at: string;
};

declare global {
  var __auraMemoryStore__: AuraStore | undefined;
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

function getSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  return createClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function hasSupabase() {
  return Boolean(getSupabaseConfig());
}

function isVercelRuntime() {
  return process.env.VERCEL === "1";
}

function getMemoryStore() {
  if (!globalThis.__auraMemoryStore__) {
    globalThis.__auraMemoryStore__ = {
      sessions: [],
      journal: [],
    };
  }

  return globalThis.__auraMemoryStore__;
}

function mapSessionRow(row: SessionRow): AuraSession {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages: Array.isArray(row.messages) ? row.messages : [],
  };
}

function mapJournalRow(row: JournalRow): AuraJournalEntry {
  return {
    id: row.id,
    entry: row.entry,
    createdAt: row.created_at,
  };
}

export async function readStore(): Promise<AuraStore> {
  if (hasSupabase()) {
    return readStoreFromSupabase();
  }

  if (isVercelRuntime()) {
    return structuredClone(getMemoryStore());
  }

  await ensureStore();
  const raw = await readFile(storePath, "utf8");
  return JSON.parse(raw) as AuraStore;
}

export async function writeStore(store: AuraStore) {
  if (hasSupabase()) {
    throw new Error("Direct store writes are not supported when Supabase is enabled.");
  }

  if (isVercelRuntime()) {
    globalThis.__auraMemoryStore__ = structuredClone(store);
    return;
  }

  await ensureStore();
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

export async function createSession() {
  if (hasSupabase()) {
    return createSessionInSupabase();
  }

  const store = await readStore();
  const now = new Date().toISOString();

  const session: AuraSession = {
    id: randomUUID(),
    title: formatSessionTitle(now),
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
  if (hasSupabase()) {
    return appendMessagesInSupabase(sessionId, additions, firstUserMessage);
  }

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
  if (hasSupabase()) {
    return createJournalEntryInSupabase(entry);
  }

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

async function readStoreFromSupabase(): Promise<AuraStore> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const [{ data: sessionsData, error: sessionsError }, { data: journalData, error: journalError }] = await Promise.all([
    supabase.from("sessions").select("*").order("updated_at", { ascending: false }),
    supabase.from("journal_entries").select("*").order("created_at", { ascending: false }),
  ]);

  if (sessionsError) {
    throw new Error(`Failed to load sessions: ${sessionsError.message}`);
  }

  if (journalError) {
    throw new Error(`Failed to load journal: ${journalError.message}`);
  }

  return {
    sessions: (sessionsData ?? []).map((row) => mapSessionRow(row as SessionRow)),
    journal: (journalData ?? []).map((row) => mapJournalRow(row as JournalRow)),
  };
}

async function createSessionInSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const now = new Date().toISOString();
  const session: AuraSession = {
    id: randomUUID(),
    title: formatSessionTitle(now),
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

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      id: session.id,
      title: session.title,
      created_at: session.createdAt,
      updated_at: session.updatedAt,
      messages: session.messages,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return mapSessionRow(data as SessionRow);
}

async function appendMessagesInSupabase(
  sessionId: string,
  additions: AuraMessage[],
  firstUserMessage?: string,
) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data: sessionRow, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (sessionError || !sessionRow) {
    throw new Error("Session not found.");
  }

  const currentSession = mapSessionRow(sessionRow as SessionRow);
  const updatedMessages = [...currentSession.messages, ...additions];
  const updatedAt = new Date().toISOString();
  const title =
    firstUserMessage && currentSession.messages.length <= 1
      ? shorten(firstUserMessage, 48)
      : currentSession.title;

  const { data, error } = await supabase
    .from("sessions")
    .update({
      title,
      updated_at: updatedAt,
      messages: updatedMessages,
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save messages: ${error.message}`);
  }

  return mapSessionRow(data as SessionRow);
}

async function createJournalEntryInSupabase(entry: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const journalEntry: AuraJournalEntry = {
    id: randomUUID(),
    entry,
    createdAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      id: journalEntry.id,
      entry: journalEntry.entry,
      created_at: journalEntry.createdAt,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save journal entry: ${error.message}`);
  }

  return mapJournalRow(data as JournalRow);
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

function formatSessionTitle(now: string) {
  return `Reflection ${new Date(now).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
