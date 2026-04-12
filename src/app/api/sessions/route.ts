import { NextResponse } from "next/server";
import { createSession, readStore } from "@/lib/storage";

export async function GET() {
  const store = await readStore();

  if (store.sessions.length === 0) {
    const session = await createSession();
    store.sessions = [session];
  }

  return NextResponse.json(store);
}

export async function POST() {
  const session = await createSession();
  return NextResponse.json({ session });
}
