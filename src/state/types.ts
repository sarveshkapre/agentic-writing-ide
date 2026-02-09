export type StageId = "draft" | "critique" | "revise" | "polish";

export type Revision = {
  id: string;
  parentId: string | null;
  createdAt: string;
  author: "user" | "agent";
  content: string;
  rationale: string;
  stage: StageId;
  label?: string;
  pinned?: boolean;
};

export type Branch = {
  id: string;
  name: string;
  headRevisionId: string;
};

export type ProjectBrief = {
  audience: string;
  goal: string;
  tone: string;
  length: number;
  keyPoints: string[];
  constraints: string;
  templateId: string;
};

export type DocumentModel = {
  id: string;
  title: string;
  currentBranchId: string;
  brief: ProjectBrief;
  branches: Record<string, Branch>;
  revisions: Record<string, Revision>;
};

export type AppState = {
  document: DocumentModel;
  selectedRevisionId: string;
  compareRevisionId: string | null;
  workingContent: string;
  draftStashByRevisionId: Record<string, string>;
  settings: Settings;
};

export type LlmSettings = {
  enabled: boolean;
  provider: "stub" | "ollama" | "openai-compatible";
  model: string;
  baseUrl: string;
  apiKey: string;
};

export type UiSettings = {
  focusMode: boolean;
  typewriterMode: boolean;
  exportThemeId: string;
};

export type Settings = {
  llm: LlmSettings;
  ui: UiSettings;
};
