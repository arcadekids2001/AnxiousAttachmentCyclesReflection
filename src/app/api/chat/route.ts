import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { generateAssistantReply } from "@/lib/agent";
import { appendMessages, readStore } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sessionId?: string;
      message?: string;
    };

    if (!body.sessionId || !body.message?.trim()) {
      return NextResponse.json(
        { error: "sessionId and message are required." },
        { status: 400 },
      );
    }

    const store = await readStore();
    const session = store.sessions.find((entry) => entry.id === body.sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    const userMessage = {
      id: randomUUID(),
      role: "user" as const,
      content: body.message.trim(),
      createdAt: new Date().toISOString(),
    };

    const sessionWithUserMessage = {
      ...session,
      messages: [...session.messages, userMessage],
    };

    const assistantMessage = await generateAssistantReply(
      sessionWithUserMessage,
      userMessage.content,
    );

    const updatedSession = await appendMessages(
      body.sessionId,
      [userMessage, assistantMessage],
      userMessage.content,
    );

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The AI response could not be generated.",
      },
      { status: 500 },
    );
  }
}
