import type { AppState } from "./types";

const STORAGE_KEY = "agentic-writing-ide-state-v1";
const INVALID_IMPORT_MESSAGE =
  "File does not match Agentic Writing IDE export format.";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const loadState = (): AppState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore persistence failures (private mode, quotas)
  }
};

export const exportState = (state: AppState): string =>
  JSON.stringify(state, null, 2);

export const importState = (raw: string): AppState => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON file.");
  }

  if (!isRecord(parsed)) {
    throw new Error(INVALID_IMPORT_MESSAGE);
  }

  const document = parsed.document;
  if (
    !isRecord(document) ||
    !isRecord(document.revisions) ||
    !isRecord(document.branches) ||
    typeof parsed.selectedRevisionId !== "string"
  ) {
    throw new Error(INVALID_IMPORT_MESSAGE);
  }

  return parsed as AppState;
};
