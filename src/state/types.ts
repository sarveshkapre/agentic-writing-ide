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

export type MarkdownExportMode = "plain" | "frontmatter";

export type DocumentPreferences = {
  exportThemeId: string;
  markdownExportMode: MarkdownExportMode;
  targetWordCount: number;
};

export type DocumentModel = {
  id: string;
  title: string;
  currentBranchId: string;
  brief: ProjectBrief;
  preferences: DocumentPreferences;
  branches: Record<string, Branch>;
  revisions: Record<string, Revision>;
};

export type DocumentSession = {
  selectedRevisionId: string;
  compareRevisionId: string | null;
  workingContent: string;
  draftStashByRevisionId: Record<string, string>;
};

export type AppState = {
  version: 2;
  documents: Record<string, DocumentModel>;
  currentDocumentId: string;
  sessions: Record<string, DocumentSession>;
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
