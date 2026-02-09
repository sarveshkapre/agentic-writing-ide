import React, { createContext, useMemo, useReducer } from "react";
import { defaultBrief, normalizeBrief } from "../lib/brief";
import { createId } from "../lib/id";
import type {
  AppState,
  Branch,
  DocumentModel,
  ProjectBrief,
  Revision,
  StageId,
  Settings
} from "./types";
import { loadState } from "./persistence";

const nowIso = () => new Date().toISOString();
const STAGE_ORDER: StageId[] = ["draft", "critique", "revise", "polish"];

const DEFAULT_OLLAMA_URL = "http://localhost:11434";
const DEFAULT_OPENAI_COMPAT_URL = "http://localhost:1234/v1";
const DEFAULT_EXPORT_THEME_ID = "paper";

const createInitialState = (): AppState => {
  const baseRevision: Revision = {
    id: createId(),
    parentId: null,
    createdAt: nowIso(),
    author: "user",
    content: "# Untitled Draft\n\nStart writing here...",
    rationale: "Initial draft",
    stage: "draft"
  };

  const mainBranch: Branch = {
    id: createId(),
    name: "main",
    headRevisionId: baseRevision.id
  };

  const document: DocumentModel = {
    id: createId(),
    title: "Untitled Draft",
    currentBranchId: mainBranch.id,
    brief: defaultBrief(),
    branches: { [mainBranch.id]: mainBranch },
    revisions: { [baseRevision.id]: baseRevision }
  };

  return {
    document,
    selectedRevisionId: baseRevision.id,
    compareRevisionId: null,
    workingContent: baseRevision.content,
    draftStashByRevisionId: {},
    settings: {
      llm: {
        enabled: false,
        provider: "stub",
        model: "local-stub",
        baseUrl: DEFAULT_OLLAMA_URL,
        apiKey: ""
      },
      ui: {
        focusMode: false,
        typewriterMode: false,
        exportThemeId: DEFAULT_EXPORT_THEME_ID
      }
    }
  };
};

const normalizeState = (state: AppState): AppState => {
  const rawProvider = state.settings?.llm?.provider;
  const provider =
    rawProvider === "ollama"
      ? "ollama"
      : rawProvider === "openai-compatible"
        ? "openai-compatible"
        : "stub";

  const baseUrlFallback =
    provider === "ollama"
      ? DEFAULT_OLLAMA_URL
      : provider === "openai-compatible"
        ? DEFAULT_OPENAI_COMPAT_URL
        : DEFAULT_OLLAMA_URL;
  const exportThemeIdRaw = state.settings?.ui?.exportThemeId;

  const settings: Settings = {
    llm: {
      enabled: state.settings?.llm?.enabled ?? false,
      provider,
      model:
        state.settings?.llm?.model ??
        (provider === "stub" ? "local-stub" : ""),
      baseUrl: state.settings?.llm?.baseUrl ?? baseUrlFallback,
      apiKey: state.settings?.llm?.apiKey ?? ""
    },
    ui: {
      focusMode: state.settings?.ui?.focusMode ?? false,
      typewriterMode: state.settings?.ui?.typewriterMode ?? false,
      exportThemeId:
        typeof exportThemeIdRaw === "string" && exportThemeIdRaw.trim() !== ""
          ? exportThemeIdRaw
          : DEFAULT_EXPORT_THEME_ID
    }
  };

  const document = state.document ?? createInitialState().document;
  const selected =
    document?.revisions?.[state.selectedRevisionId] ??
    document?.revisions?.[
      document?.branches?.[document?.currentBranchId]?.headRevisionId ?? ""
    ];

  const workingContent =
    typeof state.workingContent === "string"
      ? state.workingContent
      : selected?.content ?? "";

  const brief: ProjectBrief = normalizeBrief(document?.brief);
  const rawStash =
    state.draftStashByRevisionId &&
    typeof state.draftStashByRevisionId === "object"
      ? state.draftStashByRevisionId
      : {};
  const draftStashByRevisionId = Object.fromEntries(
    Object.entries(rawStash).filter(([revisionId, value]) => {
      return (
        typeof value === "string" &&
        document?.revisions?.[revisionId] &&
        value !== document.revisions[revisionId]?.content
      );
    })
  );
  if (selected && workingContent !== selected.content) {
    draftStashByRevisionId[selected.id] = workingContent;
  }

  return {
    ...state,
    document: {
      ...document,
      brief
    },
    workingContent,
    draftStashByRevisionId,
    settings
  };
};

export type Action =
  | { type: "UPDATE_CONTENT"; content: string }
  | { type: "UPDATE_TITLE"; title: string }
  | { type: "UPDATE_BRIEF"; brief: Partial<ProjectBrief> }
  | { type: "ADD_REVISION"; revision: Revision }
  | { type: "UPDATE_REVISION_LABEL"; revisionId: string; label: string }
  | { type: "SELECT_REVISION"; revisionId: string }
  | { type: "COMPARE_REVISION"; revisionId: string | null }
  | { type: "TOGGLE_REVISION_PIN"; revisionId: string }
  | { type: "CREATE_BRANCH"; name: string; fromRevisionId: string }
  | { type: "SWITCH_BRANCH"; branchId: string }
  | { type: "UPDATE_LLM_SETTINGS"; settings: Settings["llm"] }
  | { type: "TOGGLE_FOCUS_MODE" }
  | { type: "TOGGLE_TYPEWRITER_MODE" }
  | { type: "UPDATE_EXPORT_THEME"; themeId: string }
  | { type: "RESET"; state: AppState };

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "UPDATE_CONTENT": {
      const selectedRevision = state.document.revisions[state.selectedRevisionId];
      const nextStash = { ...state.draftStashByRevisionId };
      if (selectedRevision && action.content !== selectedRevision.content) {
        nextStash[state.selectedRevisionId] = action.content;
      } else {
        delete nextStash[state.selectedRevisionId];
      }

      return {
        ...state,
        workingContent: action.content,
        draftStashByRevisionId: nextStash
      };
    }
    case "UPDATE_TITLE": {
      return {
        ...state,
        document: {
          ...state.document,
          title: action.title
        }
      };
    }
    case "UPDATE_BRIEF": {
      const nextBrief = {
        ...state.document.brief,
        ...action.brief
      };
      if ("keyPoints" in action.brief) {
        nextBrief.keyPoints = action.brief.keyPoints ?? [];
      }
      return {
        ...state,
        document: {
          ...state.document,
          brief: nextBrief
        }
      };
    }
    case "ADD_REVISION": {
      const revision = action.revision;
      const branch = state.document.branches[state.document.currentBranchId];
      const updatedBranch: Branch = { ...branch, headRevisionId: revision.id };
      const nextStash = { ...state.draftStashByRevisionId };
      if (revision.parentId) {
        delete nextStash[revision.parentId];
      }
      delete nextStash[revision.id];
      return {
        ...state,
        document: {
          ...state.document,
          revisions: {
            ...state.document.revisions,
            [revision.id]: revision
          },
          branches: {
            ...state.document.branches,
            [updatedBranch.id]: updatedBranch
          }
        },
        selectedRevisionId: revision.id,
        workingContent: revision.content,
        draftStashByRevisionId: nextStash
      };
    }
    case "UPDATE_REVISION_LABEL": {
      const revision = state.document.revisions[action.revisionId];
      if (!revision) return state;
      const nextLabel = action.label.trim();
      const updated: Revision = {
        ...revision,
        label: nextLabel.length ? nextLabel : undefined
      };
      return {
        ...state,
        document: {
          ...state.document,
          revisions: {
            ...state.document.revisions,
            [updated.id]: updated
          }
        }
      };
    }
    case "SELECT_REVISION": {
      const selectedRevision = state.document.revisions[action.revisionId];
      return {
        ...state,
        selectedRevisionId: action.revisionId,
        workingContent:
          state.draftStashByRevisionId[action.revisionId] ??
          selectedRevision?.content ??
          state.workingContent
      };
    }
    case "COMPARE_REVISION":
      return { ...state, compareRevisionId: action.revisionId };
    case "TOGGLE_REVISION_PIN": {
      const revision = state.document.revisions[action.revisionId];
      if (!revision) return state;
      const updated: Revision = { ...revision, pinned: !revision.pinned };
      return {
        ...state,
        document: {
          ...state.document,
          revisions: {
            ...state.document.revisions,
            [updated.id]: updated
          }
        }
      };
    }
    case "CREATE_BRANCH": {
      const branch: Branch = {
        id: createId(),
        name: action.name,
        headRevisionId: action.fromRevisionId
      };
      return {
        ...state,
        document: {
          ...state.document,
          branches: {
            ...state.document.branches,
            [branch.id]: branch
          }
        }
      };
    }
    case "SWITCH_BRANCH": {
      const branch = state.document.branches[action.branchId];
      const branchHeadRevision = state.document.revisions[branch.headRevisionId];
      return {
        ...state,
        document: {
          ...state.document,
          currentBranchId: branch.id
        },
        selectedRevisionId: branch.headRevisionId,
        workingContent:
          state.draftStashByRevisionId[branch.headRevisionId] ??
          branchHeadRevision?.content ??
          state.workingContent
      };
    }
    case "RESET":
      return normalizeState(action.state);
    case "UPDATE_LLM_SETTINGS":
      return {
        ...state,
        settings: {
          ...state.settings,
          llm: action.settings
        }
      };
    case "TOGGLE_FOCUS_MODE":
      return {
        ...state,
        settings: {
          ...state.settings,
          ui: {
            ...state.settings.ui,
            focusMode: !state.settings.ui.focusMode
          }
        }
      };
    case "TOGGLE_TYPEWRITER_MODE":
      return {
        ...state,
        settings: {
          ...state.settings,
          ui: {
            ...state.settings.ui,
            typewriterMode: !state.settings.ui.typewriterMode
          }
        }
      };
    case "UPDATE_EXPORT_THEME":
      return {
        ...state,
        settings: {
          ...state.settings,
          ui: {
            ...state.settings.ui,
            exportThemeId: action.themeId
          }
        }
      };
    default:
      return state;
  }
};

type Store = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  stageOrder: StageId[];
};

export const StoreContext = createContext<Store | null>(null);

export const StoreProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const stored = loadState();
  const [state, dispatch] = useReducer(
    reducer,
    stored ? normalizeState(stored) : createInitialState()
  );
  const value = useMemo(
    () => ({ state, dispatch, stageOrder: STAGE_ORDER }),
    [state, dispatch]
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};
