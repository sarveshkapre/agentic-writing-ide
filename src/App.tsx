import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchProviderModels, runLlmStage, testLlmProvider } from "./agents/llmAdapter";
import { stages } from "./agents/pipeline";
import { applyOutlineToContent, buildOutlineFromBrief, summarizeBrief } from "./lib/brief";
import { DiffView } from "./lib/diff";
import { exportThemes, wrapHtml, wrapMarkdown } from "./lib/exportDoc";
import { createId } from "./lib/id";
import { renderMarkdown } from "./lib/markdown";
import {
  findCommonAncestorRevisionId,
  mergeThreeWay,
  type MergeResolution
} from "./lib/merge";
import { countWords, formatReadingTime } from "./lib/metrics";
import { printHtml } from "./lib/print";
import { getTemplateById, templates } from "./lib/templates";
import { exportState, importState, saveState } from "./state/persistence";
import { useStore } from "./state/useStore";
import type { ProjectBrief, Revision, StageId } from "./state/types";
import { BriefPanel } from "./ui/BriefPanel";
import { CommandPalette } from "./ui/CommandPalette";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { Editor, type EditorApi } from "./ui/Editor";
import { HistoryPanel } from "./ui/HistoryPanel";
import { MarkdownPreview } from "./ui/MarkdownPreview";
import { MetricsPanel } from "./ui/MetricsPanel";
import { OutlinePanel } from "./ui/OutlinePanel";
import { PipelinePanel } from "./ui/PipelinePanel";
import { SearchModal } from "./ui/SearchModal";
import { SettingsPanel } from "./ui/SettingsPanel";
import { ShortcutsModal } from "./ui/ShortcutsModal";
import { ToastStack, type Toast, type ToastKind } from "./ui/ToastStack";
import "./styles.css";

const nowIso = () => new Date().toISOString();

const stageLabel = (stage: StageId) =>
  stages.find((item) => item.id === stage)?.label ?? stage;

const downloadFile = (name: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
};

const readFileAsText = (file: File): Promise<string> => {
  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read import file."));
    reader.readAsText(file);
  });
};

type MergePreview = {
  sourceBranchId: string;
  sourceBranchName: string;
  sourceStage: StageId;
  targetHeadId: string;
  sourceHeadId: string;
  baseRevisionId: string | null;
  baseContent: string;
  targetContent: string;
  sourceContent: string;
  resolution: MergeResolution;
  mergedContent: string;
  conflictCount: number;
};

const resolutionLabel: Record<MergeResolution, string> = {
  manual: "manual conflict markers",
  "prefer-target": "prefer current branch",
  "prefer-source": "prefer source branch"
};

export const App: React.FC = () => {
  const { state, dispatch } = useStore();
  const [saveStatus, setSaveStatus] = useState("Idle");
  const [branchName, setBranchName] = useState("");
  const [branchError, setBranchError] = useState("");
  const [mergeSourceId, setMergeSourceId] = useState("");
  const [mergePreview, setMergePreview] = useState<MergePreview | null>(null);
  const [diffMode, setDiffMode] = useState<"inline" | "side">("inline");
  const [llmStatus, setLlmStatus] = useState("Not tested");
  const [llmModels, setLlmModels] = useState<string[]>([]);
  const [runningStage, setRunningStage] = useState<StageId | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [markdownExportMode, setMarkdownExportMode] = useState<
    "plain" | "frontmatter"
  >("plain");
  const editorApiRef = useRef<EditorApi | null>(null);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [pendingDeleteDocumentId, setPendingDeleteDocumentId] = useState<string | null>(
    null
  );
  const [pendingJump, setPendingJump] = useState<{
    revisionId: string;
    index: number;
  } | null>(null);
  const [pendingNav, setPendingNav] = useState<
    | { kind: "select-revision"; revisionId: string; jumpIndex?: number }
    | { kind: "switch-branch"; branchId: string }
    | { kind: "switch-document"; documentId: string }
    | null
  >(null);

  const doc = state.documents[state.currentDocumentId];
  const session = state.sessions[state.currentDocumentId];
  const selectedRevision = doc.revisions[session.selectedRevisionId];
  const workingContent = session.workingContent;
  const isDirty = workingContent !== selectedRevision.content;
  const llmEnabled = state.settings.llm.enabled;
  const focusMode = state.settings.ui.focusMode;
  const typewriterMode = state.settings.ui.typewriterMode;
  const exportThemeId = state.settings.ui.exportThemeId;
  const currentBranch = doc.branches[doc.currentBranchId];
  const compareRevision = session.compareRevisionId
    ? doc.revisions[session.compareRevisionId]
    : null;
  const brief = doc.brief;
  const briefSummary = useMemo(() => summarizeBrief(brief), [brief]);

  const wordCount = useMemo(() => countWords(workingContent), [workingContent]);
  const readingTime = useMemo(() => formatReadingTime(wordCount), [wordCount]);
  const targetWords = brief.length;
  const progress = targetWords > 0 ? Math.min(wordCount / targetWords, 1) : 0;
  const lastUpdated = useMemo(
    () => new Date(selectedRevision.createdAt).toLocaleString(),
    [selectedRevision.createdAt]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      saveState(state);
      setSaveStatus(`Saved ${new Date().toLocaleTimeString()}`);
    }, 200);
    return () => clearTimeout(timeout);
  }, [state]);

  useEffect(() => {
    if (!pendingJump) return;
    if (session.selectedRevisionId !== pendingJump.revisionId) return;
    editorApiRef.current?.jumpTo(pendingJump.index);
    setPendingJump(null);
  }, [pendingJump, session.selectedRevisionId]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (kind: ToastKind, message: string) => {
      const id = createId();
      setToasts((prev) => [...prev, { id, kind, message }]);
      window.setTimeout(() => dismissToast(id), 6000);
    },
    [dismissToast]
  );

  const branchOptions = useMemo(
    () => Object.values(doc.branches),
    [doc.branches]
  );

  const mergeOptions = useMemo(
    () => branchOptions.filter((branch) => branch.id !== currentBranch.id),
    [branchOptions, currentBranch.id]
  );

  const buildMergePreview = useCallback(
    ({
      sourceBranchId,
      sourceBranchName,
      sourceStage,
      targetHeadId,
      sourceHeadId,
      baseRevisionId,
      baseContent,
      targetContent,
      sourceContent,
      resolution
    }: Omit<MergePreview, "mergedContent" | "conflictCount">): MergePreview => {
      const merged = mergeThreeWay({
        base: baseContent,
        target: targetContent,
        source: sourceContent,
        targetLabel: currentBranch.name,
        sourceLabel: sourceBranchName,
        resolution
      });

      return {
        sourceBranchId,
        sourceBranchName,
        sourceStage,
        targetHeadId,
        sourceHeadId,
        baseRevisionId,
        baseContent,
        targetContent,
        sourceContent,
        resolution,
        mergedContent: merged.content,
        conflictCount: merged.conflicts.length
      };
    },
    [currentBranch.name]
  );

  const commitWorkingCopy = useCallback(
    (rationale: string) => {
      if (!isDirty) return null;
      const revision: Revision = {
        id: createId(),
        parentId: selectedRevision.id,
        createdAt: nowIso(),
        author: "user",
        content: workingContent,
        rationale,
        stage: selectedRevision.stage
      };
      dispatch({ type: "ADD_REVISION", revision });
      return revision.id;
    },
    [dispatch, isDirty, selectedRevision.id, selectedRevision.stage, workingContent]
  );

  const updateBrief = useCallback(
    (patch: Partial<ProjectBrief>) => {
      dispatch({ type: "UPDATE_BRIEF", brief: patch });
    },
    [dispatch]
  );

  const handleApplyTemplate = useCallback(
    (templateId: string) => {
      const template = getTemplateById(templateId);
      if (!template) return;

      let parentId = selectedRevision.id;
      if (isDirty) {
        parentId = commitWorkingCopy("Auto-commit before template") ?? parentId;
      }

      const revision: Revision = {
        id: createId(),
        parentId,
        createdAt: nowIso(),
        author: "user",
        content: template.content,
        rationale: `Template: ${template.name}`,
        stage: "draft"
      };
      dispatch({ type: "ADD_REVISION", revision });
      dispatch({ type: "UPDATE_TITLE", title: template.title });
      dispatch({
        type: "UPDATE_BRIEF",
        brief: { ...template.brief, templateId: template.id }
      });
    },
    [commitWorkingCopy, dispatch, isDirty, selectedRevision.id]
  );

  const handleGenerateOutline = useCallback(() => {
    const includeTitle = !/^#\s+/.test(workingContent.trim());
    const outline = buildOutlineFromBrief(doc.title, brief, includeTitle);
    const output = applyOutlineToContent(workingContent, outline);

    let parentId = selectedRevision.id;
    if (isDirty) {
      parentId = commitWorkingCopy("Auto-commit before outline") ?? parentId;
    }

    const revision: Revision = {
      id: createId(),
      parentId,
      createdAt: nowIso(),
      author: "agent",
      content: output,
      rationale: "Generated outline from project brief.",
      stage: "draft"
    };
    dispatch({ type: "ADD_REVISION", revision });
  }, [
    brief,
    commitWorkingCopy,
    dispatch,
    doc.title,
    isDirty,
    selectedRevision.id,
    workingContent
  ]);

  const handleRunStage = useCallback(
    async (stageId: StageId) => {
      const stage = stages.find((item) => item.id === stageId);
      if (!stage) return;

      setRunningStage(stageId);
      let parentId = selectedRevision.id;
      let input = workingContent;

      if (isDirty) {
        const committedId = commitWorkingCopy(`Auto-commit before ${stage.label}`);
        parentId = committedId ?? parentId;
        input = workingContent;
      }

      try {
        if (llmEnabled) {
          try {
            const result = await runLlmStage({
              stage: stageId,
              input,
              settings: state.settings.llm,
              briefSummary
            });
            const revision: Revision = {
              id: createId(),
              parentId,
              createdAt: nowIso(),
              author: "agent",
              content: result.output,
              rationale: result.rationale,
              stage: stageId
            };
            dispatch({ type: "ADD_REVISION", revision });
            return;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "LLM provider error.";
            setLlmStatus(`LLM failed: ${message} (falling back to offline).`);
            pushToast("error", `LLM failed: ${message}`);
          }
        }

        const { output, rationale } = stage.run(input);
        const revision: Revision = {
          id: createId(),
          parentId,
          createdAt: nowIso(),
          author: "agent",
          content: output,
          rationale: briefSummary ? `${rationale} · ${briefSummary}` : rationale,
          stage: stageId
        };
        dispatch({ type: "ADD_REVISION", revision });
      } finally {
        setRunningStage(null);
      }
    },
    [
      briefSummary,
      commitWorkingCopy,
      dispatch,
      isDirty,
      llmEnabled,
      selectedRevision.id,
      state.settings.llm,
      pushToast,
      workingContent
    ]
  );

  const handleCommitDraft = useCallback(() => {
    commitWorkingCopy("Manual edit commit");
  }, [commitWorkingCopy]);

  const handleDiscardChanges = useCallback(() => {
    if (!isDirty) return;
    dispatch({ type: "UPDATE_CONTENT", content: selectedRevision.content });
  }, [dispatch, isDirty, selectedRevision.content]);

  const handleCreateBranch = useCallback(() => {
    const trimmed = branchName.trim();
    if (!trimmed) {
      setBranchError("Enter a branch name.");
      return;
    }

    const duplicate = branchOptions.some(
      (branch) => branch.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setBranchError("Branch name already exists.");
      return;
    }

    const fromRevisionId =
      commitWorkingCopy("Auto-commit before branch") ?? selectedRevision.id;
    dispatch({
      type: "CREATE_BRANCH",
      name: trimmed,
      fromRevisionId
    });
    pushToast("success", `Created branch "${trimmed}".`);
    setBranchName("");
    setBranchError("");
    setMergePreview(null);
  }, [
    branchName,
    branchOptions,
    commitWorkingCopy,
    dispatch,
    pushToast,
    selectedRevision.id
  ]);

  const handleSwitchBranch = useCallback(
    (branchId: string) => {
      if (isDirty) {
        setPendingNav({ kind: "switch-branch", branchId });
        return;
      }
      setMergePreview(null);
      dispatch({ type: "SWITCH_BRANCH", branchId });
    },
    [dispatch, isDirty]
  );

  const documentOptions = useMemo(() => Object.values(state.documents), [state.documents]);

  const handleSwitchDocument = useCallback(
    (documentId: string) => {
      if (documentId === state.currentDocumentId) return;
      if (isDirty) {
        setPendingNav({ kind: "switch-document", documentId });
        return;
      }
      setMergePreview(null);
      setBranchName("");
      setBranchError("");
      setMergeSourceId("");
      dispatch({ type: "SWITCH_DOCUMENT", documentId });
    },
    [dispatch, isDirty, state.currentDocumentId]
  );

  const handleCreateDocument = useCallback(() => {
    if (isDirty) {
      setPendingNav({ kind: "switch-document", documentId: "__create__" });
      return;
    }
    setMergePreview(null);
    setBranchName("");
    setBranchError("");
    setMergeSourceId("");
    dispatch({ type: "CREATE_DOCUMENT" });
    pushToast("success", "Created new document.");
  }, [dispatch, isDirty, pushToast]);

  const handleDeleteCurrentDocument = useCallback(() => {
    if (Object.keys(state.documents).length <= 1) {
      pushToast("info", "Cannot delete the last document.");
      return;
    }
    setPendingDeleteDocumentId(state.currentDocumentId);
  }, [pushToast, state.currentDocumentId, state.documents]);

  const confirmDeleteDocument = useCallback(() => {
    const id = pendingDeleteDocumentId;
    if (!id) return;
    if (Object.keys(state.documents).length <= 1) return;
    dispatch({ type: "DELETE_DOCUMENT", documentId: id });
    setPendingDeleteDocumentId(null);
    setMergePreview(null);
    setBranchName("");
    setBranchError("");
    setMergeSourceId("");
    pushToast("info", "Deleted document.");
  }, [dispatch, pendingDeleteDocumentId, pushToast, state.documents]);

  const handlePreviewMerge = useCallback(() => {
    const source = mergeOptions.find((branch) => branch.id === mergeSourceId);
    if (!source) return;

    let targetHeadId = currentBranch.headRevisionId;
    let revisions = doc.revisions;

    if (isDirty) {
      const committedId =
        commitWorkingCopy("Auto-commit before merge preview") ?? targetHeadId;
      const committedRevision: Revision = {
        id: committedId,
        parentId: selectedRevision.id,
        createdAt: nowIso(),
        author: "user",
        content: workingContent,
        rationale: "Auto-commit before merge preview",
        stage: selectedRevision.stage
      };
      revisions = {
        ...revisions,
        [committedId]: committedRevision
      };
      targetHeadId = committedId;
    }

    const sourceHead = revisions[source.headRevisionId];
    const targetHead = revisions[targetHeadId];
    if (!sourceHead || !targetHead) return;

    const baseRevisionId = findCommonAncestorRevisionId(
      revisions,
      targetHead.id,
      sourceHead.id
    );
    const baseContent = baseRevisionId ? revisions[baseRevisionId]?.content ?? "" : "";

    setMergePreview(
      buildMergePreview({
        sourceBranchId: source.id,
        sourceBranchName: source.name,
        sourceStage: sourceHead.stage,
        targetHeadId: targetHead.id,
        sourceHeadId: sourceHead.id,
        baseRevisionId,
        baseContent,
        targetContent: targetHead.content,
        sourceContent: sourceHead.content,
        resolution: "manual"
      })
    );
  }, [
    buildMergePreview,
    commitWorkingCopy,
    currentBranch.headRevisionId,
    doc.revisions,
    isDirty,
    mergeOptions,
    mergeSourceId,
    selectedRevision.id,
    selectedRevision.stage,
    workingContent
  ]);

  const handleMergeResolutionChange = useCallback(
    (resolution: MergeResolution) => {
      if (!mergePreview) return;
      setMergePreview(
        buildMergePreview({
          sourceBranchId: mergePreview.sourceBranchId,
          sourceBranchName: mergePreview.sourceBranchName,
          sourceStage: mergePreview.sourceStage,
          targetHeadId: mergePreview.targetHeadId,
          sourceHeadId: mergePreview.sourceHeadId,
          baseRevisionId: mergePreview.baseRevisionId,
          baseContent: mergePreview.baseContent,
          targetContent: mergePreview.targetContent,
          sourceContent: mergePreview.sourceContent,
          resolution
        })
      );
    },
    [buildMergePreview, mergePreview]
  );

  const handleApplyMerge = useCallback(() => {
    if (!mergePreview) return;

    const sourceHead = doc.revisions[mergePreview.sourceHeadId];
    if (!sourceHead) return;

    if (currentBranch.headRevisionId !== mergePreview.targetHeadId) {
      pushToast("error", "Merge preview is stale. Re-run preview.");
      return;
    }

    const rationale =
      mergePreview.conflictCount > 0
        ? `Merged from branch ${mergePreview.sourceBranchName} (${mergePreview.conflictCount} conflicts, ${resolutionLabel[mergePreview.resolution]})`
        : `Merged from branch ${mergePreview.sourceBranchName}`;

    const revision: Revision = {
      id: createId(),
      parentId: mergePreview.targetHeadId,
      createdAt: nowIso(),
      author: "user",
      content: mergePreview.mergedContent,
      rationale,
      stage: sourceHead.stage
    };
    dispatch({ type: "ADD_REVISION", revision });
    setMergePreview(null);
    pushToast(
      mergePreview.conflictCount > 0 ? "info" : "success",
      mergePreview.conflictCount > 0
        ? `Merge completed (${mergePreview.conflictCount} conflicts resolved).`
        : "Merge completed."
    );
  }, [currentBranch.headRevisionId, dispatch, doc.revisions, mergePreview, pushToast]);

  const handleExport = useCallback(() => {
    const data = exportState(state);
    downloadFile("agentic-writing-ide.json", data, "application/json");
    pushToast("success", "Exported JSON.");
  }, [pushToast, state]);

  const handleExportHtml = useCallback(() => {
    const html = renderMarkdown(workingContent);
    const docHtml = wrapHtml(doc.title, html, exportThemeId);
    downloadFile("agentic-draft.html", docHtml, "text/html");
    pushToast("success", "Exported HTML.");
  }, [doc.title, exportThemeId, pushToast, workingContent]);

  const handleExportMarkdown = useCallback(() => {
    const markdown = wrapMarkdown(workingContent, {
      frontmatter:
        markdownExportMode === "frontmatter"
          ? {
              title: doc.title,
              label: selectedRevision.label ?? "",
              createdAt: selectedRevision.createdAt
            }
          : undefined
    });
    downloadFile("agentic-draft.md", markdown, "text/markdown;charset=utf-8");
    pushToast(
      "success",
      markdownExportMode === "frontmatter"
        ? "Exported Markdown with frontmatter."
        : "Exported Markdown."
    );
  }, [
    doc.title,
    markdownExportMode,
    pushToast,
    selectedRevision.createdAt,
    selectedRevision.label,
    workingContent
  ]);

  const handleExportPdf = useCallback(() => {
    const html = renderMarkdown(workingContent);
    const docHtml = wrapHtml(doc.title, html, exportThemeId);
    printHtml(docHtml);
    pushToast("info", "Print dialog opened.");
  }, [doc.title, exportThemeId, pushToast, workingContent]);

  const handleImport = (file: File | null, input: HTMLInputElement | null) => {
    if (!file) {
      if (input) input.value = "";
      return;
    }
    readFileAsText(file)
      .then((text) => {
        const imported = importState(text);
        dispatch({ type: "RESET", state: imported });
        let importedTitle = "Untitled Draft";
        if (
          imported &&
          typeof imported === "object" &&
          "documents" in imported &&
          "currentDocumentId" in imported
        ) {
          const anyImported = imported as Record<string, unknown>;
          const documents = anyImported.documents as Record<string, unknown> | undefined;
          const currentDocumentId = anyImported.currentDocumentId;
          const docRaw =
            documents && typeof currentDocumentId === "string"
              ? documents[currentDocumentId]
              : null;
          if (docRaw && typeof docRaw === "object" && "title" in (docRaw as Record<string, unknown>)) {
            const titleRaw = (docRaw as Record<string, unknown>).title;
            if (typeof titleRaw === "string" && titleRaw.trim()) {
              importedTitle = titleRaw.trim();
            }
          }
        } else if (imported && typeof imported === "object" && "document" in imported) {
          const anyImported = imported as Record<string, unknown>;
          const docRaw = anyImported.document;
          if (docRaw && typeof docRaw === "object" && "title" in (docRaw as Record<string, unknown>)) {
            const titleRaw = (docRaw as Record<string, unknown>).title;
            if (typeof titleRaw === "string" && titleRaw.trim()) {
              importedTitle = titleRaw.trim();
            }
          }
        }
        pushToast("success", `Imported "${importedTitle}".`);
        setMergePreview(null);
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Import failed.";
        pushToast("error", `Import failed: ${message}`);
      })
      .finally(() => {
        if (input) input.value = "";
      });
  };

  const requestSelectRevision = useCallback(
    (revisionId: string, jumpIndex?: number) => {
      if (isDirty) {
        setPendingNav({ kind: "select-revision", revisionId, jumpIndex });
        return;
      }
      if (typeof jumpIndex === "number" && Number.isFinite(jumpIndex)) {
        setPendingJump({ revisionId, index: jumpIndex });
      }
      dispatch({ type: "SELECT_REVISION", revisionId });
    },
    [dispatch, isDirty]
  );

  const handleResolvePendingNav = useCallback(
    (mode: "commit" | "discard" | "stash") => {
      const next = pendingNav;
      if (!next) return;

      if (mode === "commit") {
        commitWorkingCopy("Auto-commit before navigation");
      } else if (mode === "discard") {
        dispatch({ type: "UPDATE_CONTENT", content: selectedRevision.content });
      }

      if (next.kind === "select-revision") {
        if (typeof next.jumpIndex === "number" && Number.isFinite(next.jumpIndex)) {
          setPendingJump({ revisionId: next.revisionId, index: next.jumpIndex });
        }
        dispatch({ type: "SELECT_REVISION", revisionId: next.revisionId });
      } else if (next.kind === "switch-branch") {
        dispatch({ type: "SWITCH_BRANCH", branchId: next.branchId });
      } else {
        if (next.documentId === "__create__") {
          dispatch({ type: "CREATE_DOCUMENT" });
          pushToast("success", "Created new document.");
        } else {
          dispatch({ type: "SWITCH_DOCUMENT", documentId: next.documentId });
        }
      }

      setMergePreview(null);
      setPendingNav(null);
    },
    [commitWorkingCopy, dispatch, pendingNav, pushToast, selectedRevision.content]
  );

  const handleTestLlm = async () => {
    setLlmStatus("Testing...");
    try {
      const health = await testLlmProvider(state.settings.llm);
      setLlmStatus(health.ok ? health.message : `Not ready: ${health.message}`);
      if (health.models) setLlmModels(health.models);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Test failed.";
      setLlmStatus(`Test failed: ${message}`);
    }
  };

  const handleRefreshModels = async () => {
    setLlmStatus("Refreshing models...");
    try {
      const models = await fetchProviderModels(state.settings.llm);
      setLlmModels(models);
      setLlmStatus(models.length ? `Loaded ${models.length} models.` : "No models found.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Refresh failed.";
      setLlmStatus(`Refresh failed: ${message}`);
    }
  };

  useEffect(() => {
    // Avoid stale model lists/test statuses when switching providers.
    setLlmModels([]);
    setLlmStatus("Not tested");
  }, [state.settings.llm.provider, state.settings.llm.baseUrl]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isCommand = event.metaKey || event.ctrlKey;
      if (!isCommand) return;

      if (event.key === "s") {
        event.preventDefault();
        handleCommitDraft();
      }
      if (event.key === "1") {
        event.preventDefault();
        void handleRunStage("draft");
      }
      if (event.key === "2") {
        event.preventDefault();
        void handleRunStage("critique");
      }
      if (event.key === "3") {
        event.preventDefault();
        void handleRunStage("revise");
      }
      if (event.key === "4") {
        event.preventDefault();
        void handleRunStage("polish");
      }
      if (!event.shiftKey && event.key.toLowerCase() === "f") {
        event.preventDefault();
        setShowSearch(true);
      }
      if (!event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setShowCommandPalette(true);
      }
      if (event.shiftKey && event.key.toLowerCase() === "e") {
        event.preventDefault();
        handleExport();
      }
      if (event.shiftKey && event.key.toLowerCase() === "h") {
        event.preventDefault();
        handleExportHtml();
      }
      if (event.shiftKey && event.key.toLowerCase() === "m") {
        event.preventDefault();
        handleExportMarkdown();
      }
      if (event.shiftKey && event.key.toLowerCase() === "p") {
        event.preventDefault();
        handleExportPdf();
      }
      if (event.shiftKey && event.key.toLowerCase() === "o") {
        event.preventDefault();
        handleGenerateOutline();
      }
      if (event.shiftKey && event.key.toLowerCase() === "f") {
        event.preventDefault();
        dispatch({ type: "TOGGLE_FOCUS_MODE" });
      }
      if (event.shiftKey && event.key.toLowerCase() === "t") {
        event.preventDefault();
        dispatch({ type: "TOGGLE_TYPEWRITER_MODE" });
      }
      if (event.key === "/" || event.key === "?") {
        event.preventDefault();
        setShowShortcuts(true);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    dispatch,
    handleCommitDraft,
    handleExport,
    handleExportHtml,
    handleExportMarkdown,
    handleExportPdf,
    handleGenerateOutline,
    handleRunStage
  ]);

  return (
    <div className={`app${focusMode ? " focus-mode" : ""}`}>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      {showShortcuts ? (
        <ShortcutsModal onClose={() => setShowShortcuts(false)} />
      ) : null}
      {showCommandPalette ? (
        <CommandPalette onClose={() => setShowCommandPalette(false)} />
      ) : null}
      {showSearch ? (
        <SearchModal
          branch={currentBranch}
          revisions={doc.revisions}
          workingContent={workingContent}
          selectedRevisionId={selectedRevision.id}
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={() => setShowSearch(false)}
          onJumpWorking={(index) => {
            editorApiRef.current?.jumpTo(index);
            setShowSearch(false);
          }}
          onJumpRevision={(revisionId, index) => {
            requestSelectRevision(revisionId, index);
            setShowSearch(false);
          }}
        />
      ) : null}
      <header className="topbar">
        <div>
          <p className="eyebrow">Agentic Writing IDE</p>
          <h1>Draft, critique, revise, and polish.</h1>
        </div>
        <div className="topbar-actions">
          <span className="status">{saveStatus}</span>
          <button
            className="ghost"
            type="button"
            onClick={() => setShowCommandPalette(true)}
          >
            Commands
          </button>
          <button className="ghost" type="button" onClick={() => setShowSearch(true)}>
            Search
          </button>
          <button
            className={focusMode ? "ghost active" : "ghost"}
            type="button"
            onClick={() => dispatch({ type: "TOGGLE_FOCUS_MODE" })}
          >
            Focus mode
          </button>
          <button
            className={typewriterMode ? "ghost active" : "ghost"}
            type="button"
            onClick={() => dispatch({ type: "TOGGLE_TYPEWRITER_MODE" })}
          >
            Typewriter
          </button>
          <label className="ghost select">
            <span className="sr-only">Export theme</span>
            <select
              data-testid="export-theme-select"
              aria-label="Export theme"
              value={exportThemeId}
              onChange={(event) =>
                dispatch({
                  type: "UPDATE_EXPORT_THEME",
                  themeId: event.target.value
                })
              }
            >
              {exportThemes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  Export: {theme.name}
                </option>
              ))}
            </select>
          </label>
          <label className="ghost select">
            <span className="sr-only">Markdown export mode</span>
            <select
              data-testid="export-markdown-mode-select"
              aria-label="Markdown export mode"
              value={markdownExportMode}
              onChange={(event) =>
                setMarkdownExportMode(event.target.value as "plain" | "frontmatter")
              }
            >
              <option value="plain">Markdown: Plain</option>
              <option value="frontmatter">Markdown: + frontmatter</option>
            </select>
          </label>
          <button
            data-testid="export-json-button"
            className="ghost"
            type="button"
            onClick={handleExport}
          >
            Export JSON
          </button>
          <button
            data-testid="export-html-button"
            className="ghost"
            type="button"
            onClick={handleExportHtml}
          >
            Export HTML
          </button>
          <button
            data-testid="export-markdown-button"
            className="ghost"
            type="button"
            onClick={handleExportMarkdown}
          >
            Export Markdown
          </button>
          <button
            data-testid="export-pdf-button"
            className="ghost"
            type="button"
            onClick={handleExportPdf}
          >
            Print / PDF
          </button>
          <label className="ghost file">
            Import JSON
            <input
              data-testid="import-json-input"
              type="file"
              accept="application/json"
              onChange={(event) =>
                handleImport(event.target.files?.[0] ?? null, event.currentTarget)
              }
            />
          </label>
        </div>
      </header>

      <main className="layout">
        <section className="workspace">
          <div className="workspace-header">
            <div>
              <div className="row">
                <label className="field">
                  <span>Document</span>
                <select
                  data-testid="document-select"
                  aria-label="Current document"
                  value={state.currentDocumentId}
                  onChange={(event) => handleSwitchDocument(event.target.value)}
                  >
                    {documentOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" className="ghost" onClick={handleCreateDocument}>
                  New
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={handleDeleteCurrentDocument}
                  disabled={Object.keys(state.documents).length <= 1}
                >
                  Delete
                </button>
              </div>
              <label className="field">
                <span>Document title</span>
                <input
                  value={doc.title}
                  onChange={(event) =>
                    dispatch({ type: "UPDATE_TITLE", title: event.target.value })
                  }
                />
              </label>
              <label className="field">
                <span>Version label</span>
                <input
                  value={selectedRevision.label ?? ""}
                  placeholder={
                    isDirty
                      ? "Commit changes to label this version"
                      : "(optional) e.g. ready-to-share"
                  }
                  disabled={isDirty}
                  onChange={(event) =>
                    dispatch({
                      type: "UPDATE_REVISION_LABEL",
                      revisionId: selectedRevision.id,
                      label: event.target.value
                    })
                  }
                />
              </label>
              <p className="muted">
                Stage: {stageLabel(selectedRevision.stage)} · Author:{" "}
                {selectedRevision.author}
                {isDirty ? (
                  <>
                    {" "}
                    · <span className="tag dirty">Uncommitted</span>
                  </>
                ) : null}
              </p>
            </div>
            <div className="branch-controls">
              <label className="field">
                <span>Branch</span>
                <select
                  data-testid="branch-select"
                  aria-label="Current branch"
                  value={doc.currentBranchId}
                  onChange={(event) => handleSwitchBranch(event.target.value)}
                >
                  {branchOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="branch-new">
                <input
                  data-testid="branch-name-input"
                  placeholder="New branch name"
                  value={branchName}
                  onChange={(event) => {
                    setBranchName(event.target.value);
                    if (branchError) setBranchError("");
                  }}
                />
                <button
                  data-testid="branch-create-button"
                  type="button"
                  onClick={handleCreateBranch}
                >
                  Create
                </button>
              </div>
              {branchError ? <p className="muted error">{branchError}</p> : null}
              <div className="branch-merge">
                <select
                  data-testid="merge-source-select"
                  aria-label="Merge source branch"
                  value={mergeSourceId}
                  onChange={(event) => {
                    setMergeSourceId(event.target.value);
                    setMergePreview(null);
                  }}
                >
                  <option value="">Merge from branch</option>
                  {mergeOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <button
                  data-testid="merge-preview-button"
                  type="button"
                  onClick={handlePreviewMerge}
                  disabled={!mergeSourceId}
                >
                  Preview merge
                </button>
              </div>
            </div>
          </div>

          {mergePreview ? (
            <div className="panel merge-preview">
              <div className="panel-header">
                <div>
                  <h3>Merge preview</h3>
                  <p className="muted">
                    {mergePreview.sourceBranchName} → {currentBranch.name}
                    {mergePreview.baseRevisionId ? ` · base ${mergePreview.baseRevisionId}` : ""}
                  </p>
                </div>
                <div className="merge-actions">
                  <button type="button" className="ghost" onClick={() => setMergePreview(null)}>
                    Cancel
                  </button>
                  <button data-testid="merge-apply-button" type="button" onClick={handleApplyMerge}>
                    Apply merge
                  </button>
                </div>
              </div>
              <p className={`muted${mergePreview.conflictCount > 0 ? " error" : ""}`}>
                {mergePreview.conflictCount > 0
                  ? `Potential conflicts: ${mergePreview.conflictCount}`
                  : "No conflicts detected."}
              </p>
              <label className="field">
                <span>Conflict resolution</span>
                <select
                  aria-label="Conflict resolution"
                  value={mergePreview.resolution}
                  onChange={(event) =>
                    handleMergeResolutionChange(event.target.value as MergeResolution)
                  }
                  disabled={mergePreview.conflictCount === 0}
                >
                  <option value="manual">Manual conflict markers</option>
                  <option value="prefer-target">Prefer current branch</option>
                  <option value="prefer-source">Prefer source branch</option>
                </select>
              </label>
              <DiffView
                before={mergePreview.targetContent}
                after={mergePreview.mergedContent}
                mode="inline"
              />
            </div>
          ) : null}

          <div className="editor-grid">
            <div className="panel">
              <h3>Draft</h3>
              <Editor
                value={workingContent}
                onChange={(value) =>
                  dispatch({ type: "UPDATE_CONTENT", content: value })
                }
                apiRef={editorApiRef}
                onCursorChange={setCursorIndex}
                typewriter={typewriterMode}
              />
              <div className="editor-actions">
                <button
                  data-testid="commit-button"
                  className="primary"
                  type="button"
                  onClick={handleCommitDraft}
                  disabled={!isDirty}
                >
                  Commit changes
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={handleDiscardChanges}
                  disabled={!isDirty}
                >
                  Discard
                </button>
              </div>
            </div>
            {!focusMode ? (
              <div className="panel">
                <h3>Preview</h3>
                <MarkdownPreview markdown={workingContent} />
              </div>
            ) : null}
          </div>

          {compareRevision ? (
            <div className="panel">
              <div className="diff-header">
                <div>
                  <h3>Diff</h3>
                  <p className="muted">
                    Comparing {compareRevision.stage} →{" "}
                    {isDirty
                      ? `working copy (${selectedRevision.stage})`
                      : selectedRevision.stage}
                  </p>
                </div>
                <div className="diff-controls">
                  <button
                    type="button"
                    className={diffMode === "inline" ? "ghost active" : "ghost"}
                    onClick={() => setDiffMode("inline")}
                  >
                    Inline
                  </button>
                  <button
                    type="button"
                    className={diffMode === "side" ? "ghost active" : "ghost"}
                    onClick={() => setDiffMode("side")}
                  >
                    Side-by-side
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => dispatch({ type: "COMPARE_REVISION", revisionId: null })}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <DiffView
                before={compareRevision.content}
                after={workingContent}
                mode={diffMode}
              />
            </div>
          ) : null}
        </section>

        {!focusMode ? (
          <aside className="sidebar">
            <BriefPanel
              brief={brief}
              templates={templates}
              onUpdate={updateBrief}
              onApplyTemplate={handleApplyTemplate}
              onGenerateOutline={handleGenerateOutline}
            />
            <MetricsPanel
              wordCount={wordCount}
              readingTime={readingTime}
              targetWords={targetWords}
              progress={progress}
              stageLabel={stageLabel(selectedRevision.stage)}
              lastUpdated={lastUpdated}
              isDirty={isDirty}
            />
            <OutlinePanel
              content={workingContent}
              cursorIndex={cursorIndex}
              onJump={(index) => editorApiRef.current?.jumpTo(index)}
            />
            <PipelinePanel
              stages={stages}
              currentStage={selectedRevision.stage}
              onRun={(stage) => void handleRunStage(stage.id)}
              runningStageId={runningStage}
            />
            <HistoryPanel
              branch={currentBranch}
              revisions={doc.revisions}
              selectedId={selectedRevision.id}
              compareId={session.compareRevisionId}
              stages={stages.map((stage) => stage.id)}
              onSelect={requestSelectRevision}
              onCompare={(id) =>
                dispatch({ type: "COMPARE_REVISION", revisionId: id })
              }
              onTogglePin={(id) =>
                dispatch({ type: "TOGGLE_REVISION_PIN", revisionId: id })
              }
            />
            <SettingsPanel
              settings={state.settings.llm}
              onChange={(settings) =>
                dispatch({ type: "UPDATE_LLM_SETTINGS", settings })
              }
              onTest={handleTestLlm}
              onRefreshModels={handleRefreshModels}
              testStatus={llmStatus}
              models={llmModels}
            />
            <div className="panel shortcuts">
              <h3>Shortcuts</h3>
              <p className="muted">Cmd/Ctrl + 1-4: run stages</p>
              <p className="muted">Cmd/Ctrl + S: commit edit</p>
              <p className="muted">Cmd/Ctrl + K: command palette</p>
              <p className="muted">Cmd/Ctrl + F: search</p>
              <p className="muted">Cmd/Ctrl + Shift + E: export JSON</p>
              <p className="muted">Cmd/Ctrl + Shift + H: export HTML</p>
              <p className="muted">Cmd/Ctrl + Shift + P: print/PDF</p>
              <p className="muted">Cmd/Ctrl + Shift + O: generate outline</p>
              <p className="muted">Cmd/Ctrl + Shift + F: focus mode</p>
              <p className="muted">Cmd/Ctrl + Shift + T: typewriter mode</p>
              <div className="row">
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setShowShortcuts(true)}
                >
                  View all (Cmd/Ctrl + /)
                </button>
              </div>
            </div>
          </aside>
        ) : null}
      </main>

      {pendingNav ? (
        <ConfirmDialog
          title="You have uncommitted changes"
          description="Commit, stash, or discard your edits before navigating away."
          onClose={() => setPendingNav(null)}
          actions={[
            {
              id: "commit",
              label: "Commit & continue",
              onSelect: () => handleResolvePendingNav("commit")
            },
            {
              id: "stash",
              label: "Stash & continue",
              variant: "ghost",
              onSelect: () => handleResolvePendingNav("stash")
            },
            {
              id: "discard",
              label: "Discard & continue",
              variant: "ghost",
              onSelect: () => handleResolvePendingNav("discard")
            },
            {
              id: "cancel",
              label: "Cancel",
              variant: "ghost",
              onSelect: () => setPendingNav(null)
            }
          ]}
        />
      ) : null}

      {pendingDeleteDocumentId ? (
        <ConfirmDialog
          title="Delete document?"
          description="This will remove the document and its revision history from local storage."
          onClose={() => setPendingDeleteDocumentId(null)}
          actions={[
            {
              id: "delete",
              label: "Delete",
              onSelect: confirmDeleteDocument
            },
            {
              id: "cancel",
              label: "Cancel",
              variant: "ghost",
              onSelect: () => setPendingDeleteDocumentId(null)
            }
          ]}
        />
      ) : null}
    </div>
  );
};
