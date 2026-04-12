import { randomUUID } from "node:crypto";
import type { AuraMessage, AuraSession } from "./types";
import { selectSkill } from "./skills";

export async function generateAssistantReply(
  session: AuraSession,
  userMessage: string,
) {
  const apiKey = process.env.GEMINI_API_KEY;
  const skill = selectSkill(userMessage);

  if (!apiKey) {
    return createAssistantMessage(
      buildFallbackReply(userMessage, skill.name, "Gemini is not configured yet."),
    );
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildSystemInstruction(skill.guidance) }],
        },
        contents: buildContents(session),
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || "Gemini request failed.");
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const text = extractOutputText(data);

    if (!text) {
      throw new Error("The model returned an empty reply.");
    }

    return createAssistantMessage(text);
  } catch (error) {
    const fallbackReason =
      error instanceof Error && /quota|429|RESOURCE_EXHAUSTED/i.test(error.message)
        ? "Your current Gemini quota is unavailable, so AURA is responding in local fallback mode."
        : "AURA could not reach the live Gemini model, so local fallback mode is active for now.";

    return createAssistantMessage(
      buildFallbackReply(userMessage, skill.name, fallbackReason),
    );
  }
}

function buildSystemInstruction(skillGuidance: string) {
  return `
You are AURA, a warm and structured reflective support companion for adults working on anxious attachment in relationships.

Goals:
- help the user slow down and describe what happened
- distinguish event, emotion, fear, and interpretation
- offer grounded reflection and emotionally safer next steps
- be concise, calm, and non-judgmental

Safety:
- you are not a therapist, diagnostic tool, or crisis service
- do not claim diagnosis
- if there is imminent self-harm, harm to others, abuse, or danger, focus on safety and urge immediate local professional or emergency help

Current skill guidance:
- ${skillGuidance}
`.trim();
}

function buildContents(session: AuraSession) {
  return session.messages
    .filter((entry) => entry.role === "user" || entry.role === "assistant")
    .map((entry) => ({
      role: entry.role === "assistant" ? "model" : "user",
      parts: [{ text: entry.content }],
    }));
}

function extractOutputText(data: {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}) {
  return (
    data.candidates
      ?.flatMap((entry) => entry.content?.parts ?? [])
      .map((entry) => entry.text ?? "")
      .filter(Boolean)
      .join("\n")
      .trim() ?? ""
  );
}

function createAssistantMessage(content: string): AuraMessage {
  return {
    id: randomUUID(),
    role: "assistant",
    content,
    createdAt: new Date().toISOString(),
  };
}

function buildFallbackReply(
  userMessage: string,
  skillName: string,
  fallbackReason: string,
) {
  const event = inferEvent(userMessage);
  const emotion = inferEmotion(userMessage);
  const fear = inferFear(userMessage);

  return [
    fallbackReason,
    "",
    `Current support mode: ${skillName}.`,
    "",
    `What seems to have happened: ${event}.`,
    `What you may be feeling: ${emotion}.`,
    `What fear may be underneath it: ${fear}.`,
    "",
    "A steadier next step could be to pause before reacting, name two alternative explanations, and choose one grounded action that protects your dignity and calm.",
    "",
    "Reflection prompt: What evidence supports your fear, and what evidence suggests a less threatening explanation?",
  ].join("\n");
}

function inferEvent(text: string) {
  if (/reply|text|late|delayed/i.test(text)) {
    return "a shift in communication pace that felt unsettling";
  }

  if (/cancel|plan/i.test(text)) {
    return "a change in closeness or expectation";
  }

  return "an interpersonal moment that felt uncertain or distancing";
}

function inferEmotion(text: string) {
  if (/panic|panicked/i.test(text)) {
    return "panic and urgency";
  }

  if (/hurt|sad/i.test(text)) {
    return "hurt and sadness";
  }

  return "anxiety mixed with vulnerability";
}

function inferFear(text: string) {
  if (/leave|pull away|ignored|distance/i.test(text)) {
    return "fear of abandonment or losing closeness";
  }

  return "fear that the relationship may be becoming less secure";
}
