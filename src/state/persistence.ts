import type { AppState } from "./types";

const STORAGE_KEY = "agentic-writing-ide-state-v1";

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

export const importState = (raw: string): AppState =>
  JSON.parse(raw) as AppState;
