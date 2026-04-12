import { NextResponse } from "next/server";
import { createJournalEntry } from "@/lib/storage";

export async function POST(request: Request) {
  const body = (await request.json()) as { entry?: string };

  if (!body.entry?.trim()) {
    return NextResponse.json(
      { error: "Journal entry is required." },
      { status: 400 },
    );
  }

  const entry = await createJournalEntry(body.entry.trim());
  return NextResponse.json({ entry });
}
