import React, { createContext, useMemo, useReducer } from "react";
import { createId } from "../lib/id";
import type {
  AppState,
  Branch,
  DocumentModel,
  Revision,
  StageId,
  Settings
} from "./types";
import { loadState } from "./persistence";

const nowIso = () => new Date().toISOString();
const STAGE_ORDER: StageId[] = ["draft", "critique", "revise", "polish"];

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
    branches: { [mainBranch.id]: mainBranch },
    revisions: { [baseRevision.id]: baseRevision }
  };

  return {
    document,
    selectedRevisionId: baseRevision.id,
    compareRevisionId: null,
    workingContent: baseRevision.content,
    settings: {
      llm: {
        enabled: false,
        provider: "stub",
        model: "local-stub",
        apiKey: ""
      }
    }
  };
};

const normalizeState = (state: AppState): AppState => {
  const settings: Settings = {
    llm: {
      enabled: state.settings?.llm?.enabled ?? false,
      provider: "stub",
      model: state.settings?.llm?.model ?? "local-stub",
      apiKey: state.settings?.llm?.apiKey ?? ""
    }
  };

  const selected =
    state.document?.revisions?.[state.selectedRevisionId] ??
    state.document?.revisions?.[
      state.document?.branches?.[state.document?.currentBranchId]?.headRevisionId ??
        ""
    ];

  const workingContent =
    typeof state.workingContent === "string"
      ? state.workingContent
      : selected?.content ?? "";

  return {
    ...state,
    workingContent,
    settings
  };
};

export type Action =
  | { type: "UPDATE_CONTENT"; content: string }
  | { type: "UPDATE_TITLE"; title: string }
  | { type: "ADD_REVISION"; revision: Revision }
  | { type: "SELECT_REVISION"; revisionId: string }
  | { type: "COMPARE_REVISION"; revisionId: string | null }
  | { type: "TOGGLE_REVISION_PIN"; revisionId: string }
  | { type: "CREATE_BRANCH"; name: string; fromRevisionId: string }
  | { type: "SWITCH_BRANCH"; branchId: string }
  | { type: "UPDATE_LLM_SETTINGS"; settings: Settings["llm"] }
  | { type: "RESET"; state: AppState };

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "UPDATE_CONTENT": {
      return {
        ...state,
        workingContent: action.content
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
    case "ADD_REVISION": {
      const revision = action.revision;
      const branch = state.document.branches[state.document.currentBranchId];
      const updatedBranch: Branch = { ...branch, headRevisionId: revision.id };
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
        workingContent: revision.content
      };
    }
    case "SELECT_REVISION":
      return {
        ...state,
        selectedRevisionId: action.revisionId,
        workingContent:
          state.document.revisions[action.revisionId]?.content ?? state.workingContent
      };
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
      return {
        ...state,
        document: {
          ...state.document,
          currentBranchId: branch.id
        },
        selectedRevisionId: branch.headRevisionId,
        workingContent:
          state.document.revisions[branch.headRevisionId]?.content ?? state.workingContent
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
