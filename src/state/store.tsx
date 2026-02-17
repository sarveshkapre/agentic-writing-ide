import React, { createContext, useMemo, useReducer } from "react";
import { defaultBrief, normalizeBrief } from "../lib/brief";
import { createId } from "../lib/id";
import type {
  AppState,
  Branch,
  DocumentPreferences,
  DocumentModel,
  DocumentSession,
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
const DEFAULT_MARKDOWN_EXPORT_MODE: DocumentPreferences["markdownExportMode"] =
  "plain";

const defaultDocumentPreferences = (): DocumentPreferences => ({
  exportThemeId: DEFAULT_EXPORT_THEME_ID,
  markdownExportMode: DEFAULT_MARKDOWN_EXPORT_MODE,
  targetWordCount: defaultBrief().length
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const createInitialDocument = (
  title = "Untitled Draft"
): { document: DocumentModel; baseRevisionId: string } => {
  const baseRevision: Revision = {
    id: createId(),
    parentId: null,
    createdAt: nowIso(),
    author: "user",
    content: `# ${title}\n\nStart writing here...`,
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
    title,
    currentBranchId: mainBranch.id,
    brief: defaultBrief(),
    preferences: defaultDocumentPreferences(),
    branches: { [mainBranch.id]: mainBranch },
    revisions: { [baseRevision.id]: baseRevision }
  };

  return { document, baseRevisionId: baseRevision.id };
};

const createInitialSession = (
  document: DocumentModel,
  selectedRevisionId: string
): DocumentSession => {
  const revision = document.revisions[selectedRevisionId];
  return {
    selectedRevisionId,
    compareRevisionId: null,
    workingContent: revision?.content ?? "",
    draftStashByRevisionId: {}
  };
};

const createInitialState = (): AppState => {
  const { document, baseRevisionId } = createInitialDocument();
  const session = createInitialSession(document, baseRevisionId);

  return {
    version: 2,
    documents: { [document.id]: document },
    currentDocumentId: document.id,
    sessions: { [document.id]: session },
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

const normalizeSettings = (raw: unknown): Settings => {
  const fallback = createInitialState().settings;
  if (!isRecord(raw)) return fallback;

  const llmRaw = raw.llm;
  const uiRaw = raw.ui;

  const llm = isRecord(llmRaw) ? llmRaw : {};
  const ui = isRecord(uiRaw) ? uiRaw : {};

  const rawProvider = llm.provider;
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

  const exportThemeIdRaw = ui.exportThemeId;

  return {
    llm: {
      enabled: typeof llm.enabled === "boolean" ? llm.enabled : false,
      provider,
      model:
        typeof llm.model === "string"
          ? llm.model
          : provider === "stub"
            ? "local-stub"
            : "",
      baseUrl: typeof llm.baseUrl === "string" ? llm.baseUrl : baseUrlFallback,
      apiKey: typeof llm.apiKey === "string" ? llm.apiKey : ""
    },
    ui: {
      focusMode: typeof ui.focusMode === "boolean" ? ui.focusMode : false,
      typewriterMode:
        typeof ui.typewriterMode === "boolean" ? ui.typewriterMode : false,
      exportThemeId:
        typeof exportThemeIdRaw === "string" && exportThemeIdRaw.trim() !== ""
          ? exportThemeIdRaw
          : DEFAULT_EXPORT_THEME_ID
    }
  };
};

const normalizeDocumentModel = (raw: unknown): DocumentModel | null => {
  if (!isRecord(raw)) return null;
  if (typeof raw.id !== "string") return null;
  if (typeof raw.title !== "string") return null;
  if (typeof raw.currentBranchId !== "string") return null;
  if (!isRecord(raw.revisions) || !isRecord(raw.branches)) return null;

  const revisions = raw.revisions as Record<string, unknown>;
  const branches = raw.branches as Record<string, unknown>;

  // Keep revisions/branches "as is" (type-coerced) because this is a local app,
  // but ensure the brief shape and presence.
  const brief = normalizeBrief(
    isRecord(raw.brief) ? (raw.brief as Partial<ProjectBrief>) : undefined
  );
  const defaultPreferences = defaultDocumentPreferences();
  const preferencesRaw = isRecord(raw.preferences) ? raw.preferences : {};
  const preferences: DocumentPreferences = {
    exportThemeId:
      typeof preferencesRaw.exportThemeId === "string" &&
      preferencesRaw.exportThemeId.trim().length > 0
        ? preferencesRaw.exportThemeId
        : defaultPreferences.exportThemeId,
    markdownExportMode:
      preferencesRaw.markdownExportMode === "frontmatter"
        ? "frontmatter"
        : defaultPreferences.markdownExportMode,
    targetWordCount:
      typeof preferencesRaw.targetWordCount === "number" &&
      Number.isFinite(preferencesRaw.targetWordCount)
        ? Math.max(0, Math.round(preferencesRaw.targetWordCount))
        : brief.length
  };

  return {
    id: raw.id,
    title: raw.title,
    currentBranchId: raw.currentBranchId,
    brief,
    preferences,
    branches: branches as Record<string, Branch>,
    revisions: revisions as Record<string, Revision>
  };
};

const sanitizeSessionStash = (
  doc: DocumentModel,
  rawStash: unknown
): Record<string, string> => {
  const stash =
    isRecord(rawStash) ? (rawStash as Record<string, unknown>) : {};
  return Object.fromEntries(
    Object.entries(stash).filter(([revisionId, value]) => {
      return (
        typeof value === "string" &&
        doc.revisions[revisionId] &&
        value !== doc.revisions[revisionId]?.content
      );
    })
  ) as Record<string, string>;
};

const normalizeSession = (
  doc: DocumentModel,
  raw: unknown
): DocumentSession => {
  const branchHeadId =
    doc.branches[doc.currentBranchId]?.headRevisionId ??
    Object.values(doc.branches)[0]?.headRevisionId ??
    Object.keys(doc.revisions)[0] ??
    "";

  if (!isRecord(raw)) {
    return createInitialSession(doc, branchHeadId);
  }

  const selectedRevisionId =
    typeof raw.selectedRevisionId === "string" &&
    doc.revisions[raw.selectedRevisionId]
      ? raw.selectedRevisionId
      : branchHeadId;

  const selected = doc.revisions[selectedRevisionId];

  const workingContent =
    typeof raw.workingContent === "string"
      ? raw.workingContent
      : selected?.content ?? "";

  const draftStashByRevisionId = sanitizeSessionStash(
    doc,
    raw.draftStashByRevisionId
  );
  if (selected && workingContent !== selected.content) {
    draftStashByRevisionId[selected.id] = workingContent;
  }

  return {
    selectedRevisionId,
    compareRevisionId:
      typeof raw.compareRevisionId === "string" &&
      doc.revisions[raw.compareRevisionId]
        ? raw.compareRevisionId
        : null,
    workingContent,
    draftStashByRevisionId
  };
};

const normalizeState = (raw: unknown): AppState => {
  const fallback = createInitialState();
  if (!isRecord(raw)) return fallback;

  // v2 shape
  if (isRecord(raw.documents) && typeof raw.currentDocumentId === "string") {
    const documentsRaw = raw.documents as Record<string, unknown>;
    const documents: Record<string, DocumentModel> = {};

    for (const value of Object.values(documentsRaw)) {
      const doc = normalizeDocumentModel(value);
      if (doc) documents[doc.id] = doc;
    }

    if (Object.keys(documents).length === 0) {
      return fallback;
    }

    const currentDocumentId = documents[raw.currentDocumentId]
      ? raw.currentDocumentId
      : Object.keys(documents)[0];

    const sessionsRaw = isRecord(raw.sessions)
      ? (raw.sessions as Record<string, unknown>)
      : {};
    const sessions: Record<string, DocumentSession> = {};
    for (const [docId, doc] of Object.entries(documents)) {
      sessions[docId] = normalizeSession(doc, sessionsRaw[docId]);
    }

    return {
      version: 2,
      documents,
      currentDocumentId,
      sessions,
      settings: normalizeSettings(raw.settings)
    };
  }

  // v1 shape (single-document) -> migrate to v2
  const document = normalizeDocumentModel((raw as Record<string, unknown>).document);
  if (document) {
    const selectedRevisionId =
      typeof raw.selectedRevisionId === "string" ? raw.selectedRevisionId : "";
    const compareRevisionId =
      typeof raw.compareRevisionId === "string" ? raw.compareRevisionId : null;
    const workingContent =
      typeof raw.workingContent === "string" ? raw.workingContent : "";
    const draftStashByRevisionId = isRecord(raw.draftStashByRevisionId)
      ? raw.draftStashByRevisionId
      : {};

    const session = normalizeSession(document, {
      selectedRevisionId,
      compareRevisionId,
      workingContent,
      draftStashByRevisionId
    });

    return {
      version: 2,
      documents: { [document.id]: document },
      currentDocumentId: document.id,
      sessions: { [document.id]: session },
      settings: normalizeSettings(raw.settings)
    };
  }

  return fallback;
};

const getActiveDocument = (state: AppState): DocumentModel =>
  state.documents[state.currentDocumentId];

const getActiveSession = (state: AppState): DocumentSession =>
  state.sessions[state.currentDocumentId];

export type Action =
  | { type: "UPDATE_CONTENT"; content: string }
  | { type: "UPDATE_TITLE"; title: string }
  | { type: "UPDATE_BRIEF"; brief: Partial<ProjectBrief> }
  | { type: "UPDATE_DOCUMENT_PREFERENCES"; preferences: Partial<DocumentPreferences> }
  | { type: "ADD_REVISION"; revision: Revision }
  | { type: "UPDATE_REVISION_LABEL"; revisionId: string; label: string }
  | { type: "SELECT_REVISION"; revisionId: string }
  | { type: "COMPARE_REVISION"; revisionId: string | null }
  | { type: "TOGGLE_REVISION_PIN"; revisionId: string }
  | { type: "CREATE_BRANCH"; name: string; fromRevisionId: string }
  | { type: "SWITCH_BRANCH"; branchId: string }
  | { type: "CREATE_DOCUMENT"; title?: string }
  | { type: "SWITCH_DOCUMENT"; documentId: string }
  | { type: "DELETE_DOCUMENT"; documentId: string }
  | { type: "UPDATE_LLM_SETTINGS"; settings: Settings["llm"] }
  | { type: "TOGGLE_FOCUS_MODE" }
  | { type: "TOGGLE_TYPEWRITER_MODE" }
  | { type: "UPDATE_EXPORT_THEME"; themeId: string }
  | { type: "RESET"; state: unknown };

const updateActive = (
  state: AppState,
  fn: (doc: DocumentModel, session: DocumentSession) => {
    doc?: DocumentModel;
    session?: DocumentSession;
  }
): AppState => {
  const doc = getActiveDocument(state);
  const session = getActiveSession(state);
  const updated = fn(doc, session);
  const docNext = updated.doc ?? doc;
  const sessionNext = updated.session ?? session;
  return {
    ...state,
    documents: {
      ...state.documents,
      [state.currentDocumentId]: docNext
    },
    sessions: {
      ...state.sessions,
      [state.currentDocumentId]: sessionNext
    }
  };
};

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "UPDATE_CONTENT":
      return updateActive(state, (doc, session) => {
        const selectedRevision = doc.revisions[session.selectedRevisionId];
        const nextStash = { ...session.draftStashByRevisionId };
        if (selectedRevision && action.content !== selectedRevision.content) {
          nextStash[session.selectedRevisionId] = action.content;
        } else {
          delete nextStash[session.selectedRevisionId];
        }
        return {
          session: {
            ...session,
            workingContent: action.content,
            draftStashByRevisionId: nextStash
          }
        };
      });
    case "UPDATE_TITLE":
      return updateActive(state, (doc) => ({
        doc: {
          ...doc,
          title: action.title
        }
      }));
    case "UPDATE_BRIEF":
      return updateActive(state, (doc) => {
        const nextBrief = {
          ...doc.brief,
          ...action.brief
        };
        if ("keyPoints" in action.brief) {
          nextBrief.keyPoints = action.brief.keyPoints ?? [];
        }
        return {
          doc: {
            ...doc,
            brief: nextBrief
          }
        };
      });
    case "UPDATE_DOCUMENT_PREFERENCES":
      return updateActive(state, (doc) => ({
        doc: {
          ...doc,
          preferences: {
            ...doc.preferences,
            ...action.preferences
          }
        }
      }));
    case "ADD_REVISION":
      return updateActive(state, (doc, session) => {
        const revision = action.revision;
        const branch = doc.branches[doc.currentBranchId];
        const updatedBranch: Branch = { ...branch, headRevisionId: revision.id };
        const nextStash = { ...session.draftStashByRevisionId };
        if (revision.parentId) {
          delete nextStash[revision.parentId];
        }
        delete nextStash[revision.id];
        return {
          doc: {
            ...doc,
            revisions: {
              ...doc.revisions,
              [revision.id]: revision
            },
            branches: {
              ...doc.branches,
              [updatedBranch.id]: updatedBranch
            }
          },
          session: {
            ...session,
            selectedRevisionId: revision.id,
            workingContent: revision.content,
            draftStashByRevisionId: nextStash
          }
        };
      });
    case "UPDATE_REVISION_LABEL":
      return updateActive(state, (doc) => {
        const revision = doc.revisions[action.revisionId];
        if (!revision) return {};
        const nextLabel = action.label.trim();
        const updated: Revision = {
          ...revision,
          label: nextLabel.length ? nextLabel : undefined
        };
        return {
          doc: {
            ...doc,
            revisions: {
              ...doc.revisions,
              [updated.id]: updated
            }
          }
        };
      });
    case "SELECT_REVISION":
      return updateActive(state, (doc, session) => {
        const selectedRevision = doc.revisions[action.revisionId];
        return {
          session: {
            ...session,
            selectedRevisionId: action.revisionId,
            workingContent:
              session.draftStashByRevisionId[action.revisionId] ??
              selectedRevision?.content ??
              session.workingContent
          }
        };
      });
    case "COMPARE_REVISION":
      return updateActive(state, (_doc, session) => ({
        session: { ...session, compareRevisionId: action.revisionId }
      }));
    case "TOGGLE_REVISION_PIN":
      return updateActive(state, (doc) => {
        const revision = doc.revisions[action.revisionId];
        if (!revision) return {};
        const updated: Revision = { ...revision, pinned: !revision.pinned };
        return {
          doc: {
            ...doc,
            revisions: {
              ...doc.revisions,
              [updated.id]: updated
            }
          }
        };
      });
    case "CREATE_BRANCH":
      return updateActive(state, (doc) => {
        const branch: Branch = {
          id: createId(),
          name: action.name,
          headRevisionId: action.fromRevisionId
        };
        return {
          doc: {
            ...doc,
            branches: {
              ...doc.branches,
              [branch.id]: branch
            }
          }
        };
      });
    case "SWITCH_BRANCH":
      return updateActive(state, (doc, session) => {
        const branch = doc.branches[action.branchId];
        const branchHeadRevision = doc.revisions[branch.headRevisionId];
        return {
          doc: {
            ...doc,
            currentBranchId: branch.id
          },
          session: {
            ...session,
            selectedRevisionId: branch.headRevisionId,
            workingContent:
              session.draftStashByRevisionId[branch.headRevisionId] ??
              branchHeadRevision?.content ??
              session.workingContent
          }
        };
      });
    case "CREATE_DOCUMENT": {
      const title =
        typeof action.title === "string" && action.title.trim().length
          ? action.title.trim()
          : "Untitled Draft";
      const { document, baseRevisionId } = createInitialDocument(title);
      const session = createInitialSession(document, baseRevisionId);
      return {
        ...state,
        documents: {
          ...state.documents,
          [document.id]: document
        },
        sessions: {
          ...state.sessions,
          [document.id]: session
        },
        currentDocumentId: document.id
      };
    }
    case "SWITCH_DOCUMENT":
      if (!state.documents[action.documentId]) return state;
      return {
        ...state,
        currentDocumentId: action.documentId
      };
    case "DELETE_DOCUMENT": {
      const docIds = Object.keys(state.documents);
      if (docIds.length <= 1) return state;
      if (!state.documents[action.documentId]) return state;

      const nextDocuments = { ...state.documents };
      const nextSessions = { ...state.sessions };
      delete nextDocuments[action.documentId];
      delete nextSessions[action.documentId];

      const nextCurrent =
        state.currentDocumentId === action.documentId
          ? Object.keys(nextDocuments)[0]
          : state.currentDocumentId;

      return {
        ...state,
        documents: nextDocuments,
        sessions: nextSessions,
        currentDocumentId: nextCurrent
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
  const [state, dispatch] = useReducer(reducer, normalizeState(stored));
  const value = useMemo(
    () => ({ state, dispatch, stageOrder: STAGE_ORDER }),
    [state, dispatch]
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};
