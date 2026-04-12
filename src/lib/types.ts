export type AuraRole = "user" | "assistant" | "system";

export type AuraMessage = {
  id: string;
  role: AuraRole;
  content: string;
  createdAt: string;
};

export type AuraSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AuraMessage[];
};

export type AuraJournalEntry = {
  id: string;
  entry: string;
  createdAt: string;
};

export type AuraStore = {
  sessions: AuraSession[];
  journal: AuraJournalEntry[];
};

export type AuraSkillResult = {
  name: string;
  guidance: string;
};
