import type { AuraSkillResult } from "./types";

type Skill = {
  name: string;
  canHandle: (message: string) => boolean;
  guidance: (message: string) => string;
};

const skills: Skill[] = [
  {
    name: "relationship_trigger_reflection",
    canHandle: (message) =>
      /partner|reply|text|distance|ignored|pull away|relationship/i.test(
        message,
      ),
    guidance: () =>
      "Guide the user through: event, emotion, fear, alternative explanations, and one grounded next step.",
  },
  {
    name: "emotion_labeling",
    canHandle: (message) =>
      /anxious|panic|feeling|overwhelmed|hurt|sad/i.test(message),
    guidance: () =>
      "Help the user separate body feeling from interpretation and name the core emotion with warmth.",
  },
  {
    name: "default_reflection",
    canHandle: () => true,
    guidance: () =>
      "Use a calm reflective stance and help the user slow down before acting.",
  },
];

export function selectSkill(message: string): AuraSkillResult {
  const skill = skills.find((entry) => entry.canHandle(message)) ?? skills[2];

  return {
    name: skill.name,
    guidance: skill.guidance(message),
  };
}
