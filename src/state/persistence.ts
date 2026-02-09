import type { AppState } from "./types";

const STORAGE_KEY_V1 = "agentic-writing-ide-state-v1";
const STORAGE_KEY_V2 = "agentic-writing-ide-state-v2";
const INVALID_IMPORT_MESSAGE =
  "File does not match Agentic Writing IDE export format.";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const loadState = (): unknown | null => {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY_V2) ?? localStorage.getItem(STORAGE_KEY_V1);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(state));
  } catch {
    // ignore persistence failures (private mode, quotas)
  }
};

export const exportState = (state: AppState): string =>
  JSON.stringify(state, null, 2);

export const importState = (raw: string): unknown => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON file.");
  }

  if (!isRecord(parsed)) {
    throw new Error(INVALID_IMPORT_MESSAGE);
  }

  // v2 export
  if (isRecord(parsed.documents) && typeof parsed.currentDocumentId === "string") {
    return parsed;
  }

  // v1 export
  const document = parsed.document;
  if (
    !isRecord(document) ||
    !isRecord(document.revisions) ||
    !isRecord(document.branches) ||
    typeof (parsed as Record<string, unknown>).selectedRevisionId !== "string"
  ) {
    throw new Error(INVALID_IMPORT_MESSAGE);
  }

  return parsed;
};
