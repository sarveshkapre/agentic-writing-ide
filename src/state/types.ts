export type StageId = "draft" | "critique" | "revise" | "polish";

export type Revision = {
  id: string;
  parentId: string | null;
  createdAt: string;
  author: "user" | "agent";
  content: string;
  rationale: string;
  stage: StageId;
  pinned?: boolean;
};

export type Branch = {
  id: string;
  name: string;
  headRevisionId: string;
};

export type DocumentModel = {
  id: string;
  title: string;
  currentBranchId: string;
  branches: Record<string, Branch>;
  revisions: Record<string, Revision>;
};

export type AppState = {
  document: DocumentModel;
  selectedRevisionId: string;
  compareRevisionId: string | null;
  workingContent: string;
  settings: Settings;
};

export type LlmSettings = {
  enabled: boolean;
  provider: "stub";
  model: string;
  apiKey: string;
};

export type Settings = {
  llm: LlmSettings;
};
